import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const db = new sqlite3.Database(path.join(dbDir, 'visitors.db'), (err) => {
  if (err) {
    console.error('Could not connect to the visitors database.', err.message);
  }
  console.log('Connected to the visitors database.');
});

const initiateDb = () => {
  db.get(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='visitors'`,
    (err, row) => {
      if (err) {
        console.error(err.message);
      }
      if (!row) {
        db.run(
          `CREATE TABLE visitors(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_address TEXT,
            visit_date TEXT
          )`,
          (err) => {
            if (err) {
              console.error(err.message);
            }
            console.log('Done initiating database');
          }
        );
      } else {
        console.log('Visitors table already exists. Not intiating database.');
      }
    }
  );
};

export { db, initiateDb };
