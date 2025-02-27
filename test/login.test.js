const request = require('supertest');
const httpMocks = require('node-mocks-http');
const loginController = require('../src/controllers/login');
const pool = require('../src/configs/db');

jest.mock('mysql', () => ({
  createPool: jest.fn(() => ({
    on: jest.fn(),
    getConnection: jest.fn((callback) => {
      callback(null, {
        query: jest.fn((query, params, callback) => {
          callback(null, []); // Mock the query result
        }),
        release: jest.fn(),
      });
    }),
  })),
}));

describe('loginAuth', () => {
  test("Redirect jika username atau password kosong", () => {
    const req = httpMocks.createRequest({
      body: {},
      flash: jest.fn(),
    });
    const res = httpMocks.createResponse();
    jest.spyOn(res, 'redirect');

    loginController.loginAuth(req, res);

    expect(req.flash).toHaveBeenCalledWith('color', 'danger');
    expect(req.flash).toHaveBeenCalledWith('status', 'Oops..');
    expect(req.flash).toHaveBeenCalledWith(
      'message',
      'Username/Email dan Password wajib diisi!'
    );
    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  test("Redirect ke dashboard jika login sukses", () => {
    const req = httpMocks.createRequest({
      body: { username: 'user1', password: 'password', role: 'user' },
      session: {},
      flash: jest.fn(),
    });
    const res = httpMocks.createResponse();
    jest.spyOn(res, 'redirect');

    // Mock a successful query result
    pool.getConnection.mockImplementationOnce((callback) => {
      callback(null, {
        query: jest.fn((query, params, callback) => {
          callback(null, [{ id_user: 1, email: 'user1@example.com' }]); // Mock valid result
        }),
        release: jest.fn(),
      });
    });

    // Simulate rendering a page with a table after login
    res.render = jest.fn((view, options) => {
      expect(view).toBe('dashboard');
      expect(options.users).toEqual([{ id_user: 1, email: 'user1@example.com' }]);
      expect(options.table).toBeDefined(); // Check if table data is included
    });

    loginController.loginAuth(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/peminjaman');
  });

  test("Redirect ke login jika autentikasi gagal", () => {
    const req = httpMocks.createRequest({
      body: { username: 'user1', password: 'wrongpassword', role: 'user' },
      flash: jest.fn(),
    });
    const res = httpMocks.createResponse();
    jest.spyOn(res, 'redirect');

    // Mock an empty result for failed login
    pool.getConnection.mockImplementationOnce((callback) => {
      callback(null, {
        query: jest.fn((query, params, callback) => {
          callback(null, []); // Mock empty result
        }),
        release: jest.fn(),
      });
    });

    loginController.loginAuth(req, res);

    expect(req.flash).toHaveBeenCalledWith('color', 'danger');
    expect(req.flash).toHaveBeenCalledWith('status', 'Oops..');
    expect(req.flash).toHaveBeenCalledWith('message', 'Akun tidak ditemukan');
    expect(res.redirect).toHaveBeenCalledWith('/login');
  });
});
