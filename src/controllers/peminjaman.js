const pool = require('../configs/db');

pool.on('error', (err) => {
    console.error(err);
});


module.exports = {

    peminjaman(req, res) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query('SELECT id_buku, judul_buku FROM buku', function (error, results) {
                if (error) {
                    console.error(error);
                    res.send('Gagal mengambil data buku');
                    return;
                }

                res.render("peminjaman", {
                    url: 'http://localhost:3000/peminjaman/',
                    flash: {
                        color: req.flash('color'),
                        status: req.flash('status'),
                        message: req.flash('message')
                    },
                    books: results // Kirim data buku ke view
                });

                connection.release();
            });
        });
    },

    savePinjam(req, res) {
        let { id_buku, judul_buku, tgl_pinjam, tgl_kembali } = req.body;

        if (id_buku && judul_buku && tgl_pinjam && tgl_kembali) {
            pool.getConnection(function (err, connection) {
                if (err) throw err;

                connection.query(
                    `INSERT INTO peminjaman (id_buku, judul_buku, tgl_pinjam, tgl_kembali) VALUES (?, ?, ?, ?);`,
                    [id_buku, judul_buku, tgl_pinjam, tgl_kembali],
                    function (error, results) {
                        if (error) {
                            console.error(error);
                            res.send('Gagal menyimpan data');
                            return;
                        }

                        req.flash('color', 'success');
                        req.flash('status', 'Yes..');
                        req.flash('message', 'Data berhasil disimpan');
                        res.redirect('/peminjaman');
                    }
                );

                connection.release();
            });
        } else {
            res.send('Data tidak lengkap');
        }
    },

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/login');
        });
    }
}