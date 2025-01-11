const config = require('../configs/db')

let mysql = require('mysql');
let pool = mysql.createPool(config);

pool.on('error', (err) => {
    console.error(err);
});

module.exports = {
    home_admin(req, res) {

        pool.getConnection(function (err, connection) {
            if (err) throw err;

            // Query untuk mengambil data buku
            connection.query('SELECT * FROM buku', function (error, results) {
                if (error) {
                    console.error(error);
                    res.send('Gagal mengambil data buku');
                    return;
                }

                res.render('home_admin', {
                    url: 'http://localhost:3000/admin/',
                    buku: results
                });

                connection.release();
            });
        });
    },

    saveBuku(req, res) {
        let { judul_buku, pengarang_buku, thn_terbit } = req.body;
        console.log(judul_buku, pengarang_buku, thn_terbit);
        if (judul_buku && pengarang_buku && thn_terbit) {
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    `INSERT INTO buku (judul_buku, pengarang_buku, thn_terbit) VALUES (?, ?, ?);`,
                    [judul_buku, pengarang_buku, thn_terbit],
                    function (error, results) {
                        if (error) {
                            console.error(error);
                            res.send('Gagal menyimpan data');
                            return;
                        }
                        req.flash('color', 'success');
                        req.flash('status', 'Yes..');
                        req.flash('message', 'Data berhasil disimpan');
                        res.redirect('/admin');
                    }
                );
                connection.release();
            });
        } else {
            res.send('Data tidak lengkap');
        }
    },

    editBuku(req, res) {
        const { id_buku } = req.params;
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query('SELECT * FROM buku WHERE id_buku = ?', [id_buku], function (error, results) {
                if (error) throw error;
                if (results.length > 0) {
                    res.render('editBuku', {
                        url: 'http://localhost:3000/admin/',
                        buku: results[0]
                    });
                } else {
                    res.redirect('/admin');
                }
            });
            connection.release();
        });
    },

    // In your controller (admin.js)

    updateBuku(req, res) {
        const { id_buku } = req.params;
        const { judul_buku, pengarang_buku, thn_terbit } = req.body;
    
        // Check if required fields are missing
        if (!judul_buku || !pengarang_buku || !thn_terbit) {
        return res.status(400).send('Data tidak lengkap');
        }
    
        pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(
            'UPDATE buku SET judul_buku = ?, pengarang_buku = ?, thn_terbit = ? WHERE id_buku = ?',
            [judul_buku, pengarang_buku, thn_terbit, id_buku],
            function (error, results) {
            if (error) throw error;
            res.redirect('/admin');
            }
        );
        connection.release();
        });
    },
  

    deleteBuku(req, res) {
        const { id_buku } = req.params;
        console.log(`ID Buku yang diterima untuk dihapus: ${id_buku}`);
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).send('Database connection error');
            }
            const query = 'DELETE FROM buku WHERE id_buku = ?';
            connection.query(query, [id_buku], (error, results) => {
                connection.release();
                if (error) {
                    console.error('Error deleting book:', error);
                    return res.status(500).send('Error deleting book');
                }
                console.log('Book deleted successfully:', results);
                res.redirect('/admin');
            });
        });
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