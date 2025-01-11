const httpMocks = require('node-mocks-http');
const bukuController = require('../src/controllers/admin');  // Adjust path to your controller
const pool = require('../src/configs/db');  // Adjust path to your db config

// Mocking mysql connection
jest.mock('mysql', () => ({
  createPool: jest.fn(() => ({
    on: jest.fn(),
    getConnection: jest.fn((callback) => {
      callback(null, {
        query: jest.fn((query, params, callback) => {
          callback(null, { affectedRows: 1 }); // Mock successful query result
        }),
        release: jest.fn(),
      });
    }),
  })),
}));

describe('Buku Controller', () => {
  describe('editBuku', () => {
    test("Harus mengarahkan ke /admin jika buku tidak ditemukan", () => {
      const req = httpMocks.createRequest({
        params: { id_buku: 'non-existent-id' },
      });
      const res = httpMocks.createResponse();
      jest.spyOn(res, 'redirect');

      pool.getConnection.mockImplementationOnce((callback) => {
        callback(null, {
          query: jest.fn((query, params, callback) => {
            callback(null, []); // Simulate no book found
          }),
          release: jest.fn(),
        });
      });

      bukuController.editBuku(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/admin');
    });
  });

  describe('updateBuku', () => {
    test("Harus mengarahkan ke /admin setelah buku berhasil diperbarui", () => {
      const req = httpMocks.createRequest({
        params: { id_buku: '1' },
        body: { judul_buku: 'Updated Book', pengarang_buku: 'Updated Author', thn_terbit: 2022 },
      });
      const res = httpMocks.createResponse();
      jest.spyOn(res, 'redirect');

      bukuController.updateBuku(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/admin');
    });

    test("Harus menangani data tidak lengkap dengan baik", () => {
      const req = httpMocks.createRequest({
        params: { id_buku: '1' },
        body: { judul_buku: '', pengarang_buku: 'Updated Author', thn_terbit: 2022 },  // Missing judul_buku
      });
      const res = httpMocks.createResponse();

      bukuController.updateBuku(req, res);

      expect(res.statusCode).toBe(400);  // Expect status 400 for incomplete data
      expect(res._getData()).toContain('Data tidak lengkap');
    });
  });
});
