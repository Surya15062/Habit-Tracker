import express from 'express';
import { getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
    try {
        const [habits] = await getPool().query('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId]);
        res.json(habits);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/', async (req, res) => {
    const { title, frequency } = req.body;
    if (!title || !frequency) return res.status(400).json({ error: 'Title and frequency required' });

    try {
        const [result] = await getPool().query(
            'INSERT INTO habits (user_id, title, frequency) VALUES (?, ?, ?)',
            [req.user.userId, title, frequency]
        );
        res.status(201).json({ id: result.insertId, user_id: req.user.userId, title, frequency });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

router.put('/:id', async (req, res) => {
    const { title, frequency } = req.body;
    const habitId = req.params.id;

    try {
        const [result] = await getPool().query(
            'UPDATE habits SET title = ?, frequency = ? WHERE id = ? AND user_id = ?',
            [title, frequency, habitId, req.user.userId]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Habit not found or unauthorized' });
        res.json({ message: 'Habit updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

router.delete('/:id', async (req, res) => {
    const habitId = req.params.id;

    try {
        const [result] = await getPool().query('DELETE FROM habits WHERE id = ? AND user_id = ?', [habitId, req.user.userId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Habit not found or unauthorized' });
        res.json({ message: 'Habit deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
