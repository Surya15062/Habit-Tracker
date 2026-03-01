import express from 'express';
import jwt from 'jsonwebtoken';
import { getPool } from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { name, age } = req.body;
    if (!name || !age) {
        return res.status(400).json({ error: 'Name and age are required' });
    }

    try {
        // Try to find the existing user
        const [users] = await getPool().query(
            'SELECT * FROM users WHERE name = ? AND age = ?',
            [name, age]
        );

        let user = users[0];

        // If user doesn't exist, create them automatically
        if (!user) {
            const [result] = await getPool().query(
                'INSERT INTO users (name, age) VALUES (?, ?)',
                [name, age]
            );
            user = { id: result.insertId, name, age };
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, age: user.age } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
