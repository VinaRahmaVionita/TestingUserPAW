const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware untuk menangani form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Render halaman utama dengan form SUS
app.get('/', (req, res) => {
  res.render('index.ejs');
});

// Menghitung skor SUS setelah form disubmit
app.post('/submit', (req, res) => {
  const answers = req.body; // Mengambil jawaban pengguna
  let score = 0;

  // Menghitung skor untuk pertanyaan ganjil (kurangi dengan 5)
  for (let i = 0; i < 9; i += 2) {
    score += 5 - parseInt(answers[`q${i + 1}`]);
  }

  // Menghitung skor untuk pertanyaan genap (kurangi dengan 1)
  for (let i = 1; i < 10; i += 2) {
    score += parseInt(answers[`q${i + 1}`]) - 1;
  }

  // Menghitung total SUS (kalikan dengan 2.5)
  const susScore = score * 2.5;

  // Kirim hasil ke pengguna
  res.send(`<h1>Skor SUS Anda: ${susScore}</h1>`);
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
