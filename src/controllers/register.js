const pool = require('../configs/db');

module.exports = {
    formRegister(req, res) {
        res.render("register", {
            url: 'http://localhost:3000/',
        });
    },

    saveRegister(req, res) {
        const username = req.body.username;
        const password = req.body.pass;

        if (username && password) {
            pool.getConnection(function (err, connection) {
                if (err) throw err;

                connection.query(
                    `INSERT INTO admin (username, password) VALUES (?, SHA2(?, 512));`,
                    [username, password],
                    function (error, results) {
                        if (error) throw error;

                        req.flash('color', 'success');
                        req.flash('status', 'Yes..');
                        req.flash('message', 'Registrasi berhasil');
                        res.redirect('/login');
                    }
                );

                connection.release();
            });
        } else {
            res.redirect('/login');
            res.end();
        }
    }
};
