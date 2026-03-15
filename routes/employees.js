const express = require('express');
const router = express.Router();
const db = require('../db'); // ดึงการเชื่อมต่อฐานข้อมูลมาใช้

// 1. ดึงรายชื่อพนักงานทั้งหมด (GET)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. เพิ่มพนักงานใหม่ (POST)
router.post('/', async (req, res) => {
  const { employee_code, name, department } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO employees (employee_code, name, department) VALUES (?, ?, ?)',
      [employee_code, name, department]
    );
    res.status(201).json({ message: 'เพิ่มพนักงานสำเร็จ', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;