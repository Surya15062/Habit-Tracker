import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool;

export const initializeDB = async () => {
  try {
    // Connect without database selected to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();
    console.log('Database ensured.');

    // Now create the pool with the database
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, age)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        frequency ENUM('daily', 'weekly', 'custom') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        habit_id INT NOT NULL,
        date DATE NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT TRUE,
        UNIQUE (habit_id, date),
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      );
    `);

    console.log('Tables initialized successfully.');
    return pool;
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call initializeDB first.');
  }
  return pool;
};
