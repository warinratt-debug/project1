const express = require('express');
const router = express.Router();
const db = require('./db');

// 1. บันทึกเข้า-ออกงาน และคำนวณ OT (POST)
router.post('/', async (req, res) => {
  const { employee_id, date, check_in, check_out } = req.body;

  try {
    const start = new Date(`${date}T${check_in}`);
    const end = new Date(`${date}T${check_out}`);

    const diffMs = end - start;
    const work_hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));


    const ot_hours = work_hours > 8 ? parseFloat((work_hours - 8).toFixed(2)) : 0;

    // บันทึกลงฐานข้อมูล
    const [result] = await db.query(
      'INSERT INTO attendance (employee_id, date, check_in, check_out, work_hours, ot_hours) VALUES (?, ?, ?, ?, ?, ?)',
      [employee_id, date, check_in, check_out, work_hours, ot_hours]
    );

    res.status(201).json({
      message: 'บันทึกเวลาทำงานสำเร็จ',
      work_hours: work_hours,
      ot_hours: ot_hours
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. ออกรายงานสรุปรายเดือน (GET)
router.get('/report/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  try {
    // ดึงรายชื่อทุกคนมาต่อกับชั่วโมงทำงานในเดือนนั้นๆ แล้วจับบวกกัน (SUM)
    const [rows] = await db.query(
      `SELECT 
         e.employee_code, 
         e.name,
         COUNT(a.id) as total_working_days,
         IFNULL(SUM(a.work_hours), 0) as total_work_hours,
         IFNULL(SUM(a.ot_hours), 0) as total_ot_hours
       FROM employees e
       LEFT JOIN attendance a 
         ON e.id = a.employee_id 
         AND YEAR(a.date) = ? 
         AND MONTH(a.date) = ?
       GROUP BY e.id
       ORDER BY e.employee_code ASC`,
      [year, month]
    );
    res.json({ period: `${year}-${month}`, report: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;