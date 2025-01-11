const httpMocks = require('node-mocks-http');
const bukuController = require('../src/controllers/admin');
const pool = require('../src/configs/db');

// Mocking mysql connection
jest.mock('mysql', () => ({
  createPool: jest.fn(() => ({
    on: jest.fn(),
    getConnection: jest.fn((callback) => {
      callback(null, {
        query: jest.fn((query, params, callback) => {
          callback(null, { affectedRows: 1 }); // Mock hasil query sukses
        }),
        release: jest.fn(),
      });
    }),
  })),
}));

describe('Buku Controller', () => {
  describe('deleteBuku', () => {
    test("Harus mengarahkan ke /buku setelah penghapusan berhasil", () => {
      const req = httpMocks.createRequest({
        params: { id: '1' },
      });
      const res = httpMocks.createResponse();
      jest.spyOn(res, 'redirect');

      bukuController.deleteBuku(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/admin');
    });


    test("Harus menangani ID yang tidak ada dengan baik", () => {
      const req = httpMocks.createRequest({
        params: { id: 'non-existent-id' },
      });
      const res = httpMocks.createResponse();
      jest.spyOn(res, 'redirect');

      pool.getConnection.mockImplementationOnce((callback) => {
        callback(null, {
          query: jest.fn((query, params, callback) => {
            callback(null, { affectedRows: 0 }); // Simulate non-existent ID
          }),
          release: jest.fn(),
        });
      });

      bukuController.deleteBuku(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/admin');
    });
  });
});
