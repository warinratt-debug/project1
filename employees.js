const express = require('express');
const router = express.Router();
const db = require('./db');

// ดึงรายชื่อพนักงานทั้งหมด
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// เพิ่มพนักงานใหม่
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

// แก้ไขข้อมูลพนักงาน
router.put('/:id', async (req, res) => {
  const { id } = req.params; // รับ ID จาก URL
  const { name, department } = req.body; // รับข้อมูลที่ต้องการแก้

  try {
    const [result] = await db.query(
      'UPDATE employees SET name = ?, department = ? WHERE id = ?',
      [name, department, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบพนักงานที่ต้องการแก้ไข' });
    }
    res.json({ message: 'อัปเดตข้อมูลพนักงานสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ลบข้อมูลพนักงาน
router.delete('/:id', async (req, res) => {
  const { id } = req.params; // รับ ID จาก URL

  try {
    const [result] = await db.query('DELETE FROM employees WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบพนักงานที่ต้องการลบ' });
    }
    res.json({ message: 'ลบพนักงานสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;