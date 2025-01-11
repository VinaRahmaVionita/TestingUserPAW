const mysql = require('mysql');
const config = require('../configs/db');  // Adjust path as necessary

let pool = mysql.createPool(config);

pool.on('error', (err) => {
    console.error(err);
});

module.exports = {
    getBuku(req, res) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query('SELECT * FROM buku;', function (error, results) {
                if (error) throw error;

                if (results.length > 0) {
                    res.render('buku', {
                        url: 'http://localhost:3000/',
                        buku: results
                    });
                } else {
                    res.render('buku', {
                        url: 'http://localhost:3000/',
                        buku: []
                    });
                }
            });
            connection.release();
        });
    },
};
