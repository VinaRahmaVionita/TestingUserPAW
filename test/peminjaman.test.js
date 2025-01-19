const httpMocks = require('node-mocks-http');
const bukuController = require('../src/controllers/peminjaman');  // Adjust path to your controller
const pool = require('../src/configs/db');  // Adjust path to your db config

// Fungsi yang akan diuji
const validatePeminjaman = (id_buku, id_user, judul_buku, tgl_pinjam, tgl_kembali) => {
  if (!id_buku) return "ID Buku tidak boleh kosong.";
  if (!id_user) return "ID User tidak boleh kosong.";
  if (!judul_buku) return "Judul Buku tidak boleh kosong.";
  if (!tgl_pinjam || !isValidDate(tgl_pinjam)) return "Tanggal Peminjaman tidak valid.";
  if (!tgl_kembali || !isValidDate(tgl_kembali)) return "Tanggal Pengembalian tidak valid.";
  if (new Date(tgl_kembali) < new Date(tgl_pinjam)) 
      return "Tanggal Pengembalian tidak boleh lebih awal dari Tanggal Peminjaman.";
  return "Peminjaman berhasil diproses.";
};

// Fungsi untuk validasi format tanggal
const isValidDate = (dateStr) => {
  const date = new Date(dateStr);
  // Memeriksa apakah tanggal valid dan sesuai dengan format YYYY-MM-DD
  return dateStr && !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0];
};

// Pengujian dengan Jest
describe("Validasi Peminjaman Buku", () => {
  test("Validasi peminjaman berhasil", () => {
    const result = validatePeminjaman(1, 101, "JavaScript Basics", "2025-01-02", "2025-01-10");
    expect(result).toBe("Peminjaman berhasil diproses.");
  });

  describe("Validasi input yang kosong", () => {
    test("ID Buku kosong", () => {
      const result = validatePeminjaman(null, 101, "JavaScript Basics", "2025-01-02", "2025-01-10");
      expect(result).toBe("ID Buku tidak boleh kosong.");
    });

    test("ID User kosong", () => {
      const result = validatePeminjaman(1, null, "JavaScript Basics", "2025-01-02", "2025-01-10");
      expect(result).toBe("ID User tidak boleh kosong.");
    });

    test("Judul Buku kosong", () => {
      const result = validatePeminjaman(1, 101, null, "2025-01-02", "2025-01-10");
      expect(result).toBe("Judul Buku tidak boleh kosong.");
    });
  });

  describe("Validasi format tanggal", () => {
    test("Tanggal Peminjaman tidak valid", () => {
      const result = validatePeminjaman(1, 101, "JavaScript Basics", "02-01-2025", "2025-01-10");
      expect(result).toBe("Tanggal Peminjaman tidak valid.");
    });

    test("Tanggal Pengembalian tidak valid", () => {
      const result = validatePeminjaman(1, 101, "JavaScript Basics", "2025-01-02", "10-01-2025");
      expect(result).toBe("Tanggal Pengembalian tidak valid.");
    });

    test("Tanggal Pengembalian lebih awal dari Tanggal Peminjaman", () => {
      const result = validatePeminjaman(1, 101, "JavaScript Basics", "2025-01-10", "2025-01-02");
      expect(result).toBe("Tanggal Pengembalian tidak boleh lebih awal dari Tanggal Peminjaman.");
    });
  });
});
