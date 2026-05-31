import express from 'express';
import { getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/monthly', async (req, res) => {
    const { year, month } = req.query; // e.g., year=2024, month=10
    if (!year || !month) return res.status(400).json({ error: 'Year and month required' });

    try {
        const daysInMonth = new Date(year, month, 0).getDate();

        // Count active daily habits for this user
        const [habits] = await getPool().query("SELECT COUNT(*) AS count FROM habits WHERE user_id = ? AND frequency = 'daily'", [req.user.userId]);
        const totalHabits = habits[0].count;
        const totalPossible = totalHabits * daysInMonth;

        if (totalPossible === 0) {
            return res.json({ completed_days: 0, total_possible: 0, percentage: 0 });
        }

        // Count completed entries for the given month
        // Note: month in JS Date is 1-indexed for the string format here if we do YYYY-MM
        // Let's assume month is 1-12
        const paddedMonth = month.toString().padStart(2, '0');
        const prefix = `${year}-${paddedMonth}-%`;

        const [progress] = await getPool().query(
            `SELECT COUNT(*) AS completed_days 
       FROM progress p 
       JOIN habits h ON p.habit_id = h.id 
       WHERE h.user_id = ? AND p.completed = TRUE AND p.date LIKE ?`,
            [req.user.userId, prefix]
        );

        const completedDays = progress[0].completed_days;
        const percentage = Math.round((completedDays / totalPossible) * 100);

        res.json({ completed_days: completedDays, total_possible: totalPossible, percentage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/yearly', async (req, res) => {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: 'Year is required' });

    try {
        // Count active daily habits
        const [habits] = await getPool().query("SELECT COUNT(*) AS count FROM habits WHERE user_id = ? AND frequency = 'daily'", [req.user.userId]);
        const totalHabits = habits[0].count;

        if (totalHabits === 0) {
            return res.json([]);
        }

        // Get completions grouped by month for the user's habits
        const prefix = `${year}-%`;
        const [progress] = await getPool().query(
            `SELECT DATE_FORMAT(p.date, '%Y-%m') AS month_group, COUNT(*) AS completed_days 
       FROM progress p 
       JOIN habits h ON p.habit_id = h.id 
       WHERE h.user_id = ? AND p.completed = TRUE AND p.date LIKE ?
       GROUP BY month_group 
       ORDER BY month_group ASC`,
            [req.user.userId, prefix]
        );

        const results = [];
        for (let m = 1; m <= 12; m++) {
            const paddedMonth = m.toString().padStart(2, '0');
            const monthStr = `${year}-${paddedMonth}`;

            const found = progress.find(p => p.month_group === monthStr);
            const completedDays = found ? found.completed_days : 0;

            const daysInMonth = new Date(year, m, 0).getDate();
            const totalPossible = totalHabits * daysInMonth;

            const percentage = Math.round((completedDays / totalPossible) * 100);

            results.push({
                month: monthStr,
                total_completed: completedDays,
                total_possible: totalPossible,
                percentage
            });
        }

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
