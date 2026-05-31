import express from 'express';
import { getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', async (req, res) => {
    const { habit_id, date, completed } = req.body;
    if (!habit_id || !date || completed === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check if habit belongs to user
        const [habits] = await getPool().query('SELECT id FROM habits WHERE id = ? AND user_id = ?', [habit_id, req.user.userId]);
        if (habits.length === 0) return res.status(404).json({ error: 'Habit not found' });

        // Update or Insert progress
        await getPool().query(
            `INSERT INTO progress (habit_id, date, completed) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE completed = VALUES(completed)`,
            [habit_id, date, completed]
        );

        res.json({ message: 'Progress updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get progress for today
router.get('/today', async (req, res) => {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ error: 'Date is required' });

    try {
        const [progress] = await getPool().query(
            `SELECT p.* FROM progress p 
       JOIN habits h ON p.habit_id = h.id 
       WHERE h.user_id = ? AND p.date = ?`,
            [req.user.userId, date]
        );
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
