const httpMocks = require('node-mocks-http');
const request = require('supertest');
const registerController = require('../src/controllers/register');
const pool = require('../src/configs/db');

// Mocking mysql connection
jest.mock('mysql', () => ({
  createPool: jest.fn(() => ({
    on: jest.fn(),
    getConnection: jest.fn((callback) => {
      callback(null, {
        query: jest.fn((query, params, callback) => {
          callback(null, []); // Mock hasil query sukses
        }),
        release: jest.fn(),
      });
    }),
  })),
}));

describe('Register Controller', () => {
  describe('formRegister', () => {
    test("Harus merender halaman register dengan variabel yang tepat", () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      registerController.formRegister(req, res);

      const data = res._getRenderData();
      expect(res._getRenderView()).toBe('register');
      expect(data.url).toBe('http://localhost:3000/');
    });
  });

  describe('saveRegister', () => {
    test("Harus mengarahkan ke halaman login jika username atau password kosong", () => {
      const req = httpMocks.createRequest({
        body: {},
      });
      const res = httpMocks.createResponse();
      jest.spyOn(res, 'redirect');

      registerController.saveRegister(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    test("Harus menyimpan user baru ke database dan mengarahkan ke halaman login", () => {
      const req = httpMocks.createRequest({
        body: { username: 'newUser', pass: 'newPassword' },
      });
      const res = httpMocks.createResponse();
      jest.spyOn(res, 'redirect');

      // Mock 'flash' method on req object
      req.flash = jest.fn();

      // Mock database query
      pool.getConnection.mockImplementationOnce((callback) => {
        callback(null, {
          query: jest.fn((query, params, callback) => {
            callback(null, []); // Simulate successful query
          }),
          release: jest.fn(),
        });
      });

      registerController.saveRegister(req, res);

      expect(req.flash).toHaveBeenCalledWith('color', 'success');
      expect(req.flash).toHaveBeenCalledWith('status', 'Yes..');
      expect(req.flash).toHaveBeenCalledWith('message', 'Registrasi berhasil');
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    test("Harus menangani kesalahan database dengan benar", () => {
      const req = httpMocks.createRequest({
        body: { username: 'newUser', pass: 'newPassword' },
      });
      const res = httpMocks.createResponse();
      jest.spyOn(res, 'redirect');

      // Mock database query error
      pool.getConnection.mockImplementationOnce((callback) => {
        callback(null, {
          query: jest.fn((query, params, callback) => {
            callback(new Error('Database error'), null);
          }),
          release: jest.fn(),
        });
      });

      // Fungsi harus melemparkan error jika query gagal
      expect(() => registerController.saveRegister(req, res)).toThrow('Database error');
    });
  });
});

