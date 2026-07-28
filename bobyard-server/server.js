import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { seedData } from './seedData.js';

const comments = seedData.comments;
const app = express();

app.use(cors());
app.use(express.json());

const db = new Database('bobyard.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    image TEXT
  )
`);

// Only seed if table tis empty
const rowCount = db.prepare('SELECT COUNT(*) as count FROM comments').get().count;
if (rowCount === 0) {
    const insert = db.prepare('INSERT INTO comments (author, text, date, likes, image) VALUES (?, ?, ?, ?, ?)');
    const seedTransaction = db.transaction((comments) => {
        for (const comment of comments) {
            insert.run(comment.author, comment.text, comment.date, comment.likes, comment.image);
        }
    });

    seedTransaction(comments);
    console.log('Database pre-seeded with initial data.');
}


// get all comments
app.get('/comments', (req, res) => {
    const items = db.prepare('SELECT * FROM comments').all();
    res.json(items);
});

// add a comment
app.post('/comments', (req, res) => {
    const { text, author } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });
    if (!author) return res.status(400).json({ error: "author is required" });

    const stmt = db.prepare('INSERT INTO comments (author, text, date, likes, image) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(
        author,
        text,
        new Date().toISOString(),
        0,
        ''
    );

    const newComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newComment);
});


app.listen(3001, () => console.log('API running on http://localhost:3001'));