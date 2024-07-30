const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'signatures',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.post('/save-signature', (req, res) => {
  const { signature1, signature2 } = req.body;

  if (!signature1 && !signature2) {
    return res.status(400).json({ message: 'At least one signature is required' });
  }

  // Only insert non-empty signatures
  const query = 'INSERT INTO signatures (data, data2) VALUES (?, ?)';
  db.query(query, [signature1 || null, signature2 || null], (err, result) => {
    if (err) {
      console.error('Error inserting into database:', err);
      return res.status(500).json({ message: 'Failed to save signatures' });
    }
    res.json({ message: 'Signatures saved successfully' });
  });
});

app.get('/get-signature/:id', (req, res) => {
  const { id } = req.params;

  // Validate the ID parameter
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  const query = 'SELECT * FROM signatures WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching signature from database:', err);
      return res.status(500).json({ message: 'Failed to retrieve signature' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Signature not found' });
    }

    res.json(results[0]);
  });
});




app.listen(3000, () => {
  console.log('Server running on port 3000');
});
