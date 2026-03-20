const express = require('express');
const router = express.Router();
const db = require('./db'); 

// Login 
router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    // ใช้คำสั่ง SQL ตรวจสอบ user และ password
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      // เจอผู้ใช้งาน
      const user = rows[0];
      res.json({
        message: 'Login สำเร็จ',
        role: user.role,
        employee_code: user.employee_code
      });
    } else {
      // ไม่เจอผู้ใช้งาน หรือรหัสผิด
      res.status(401).json({ error: 'Username หรือ Password ไม่ถูกต้อง' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;