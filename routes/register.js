const express = require('express');
const router = express.Router();
const db = require('./db'); 

// สำหรับสมัครสมาชิก
router.post('/', async (req, res) => {
    const { employee_code, name, department, password } = req.body;

    try {
        await db.query(
            'INSERT INTO employees (employee_code, name, department) VALUES (?, ?, ?)',
            [employee_code, name, department]
        );

        await db.query(
            'INSERT INTO users (username, password, role, employee_code) VALUES (?, ?, ?, ?)',
            [employee_code, password, 'user', employee_code]
        );

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ' });
        
    } catch (err) {
        res.status(500).json({ error: 'ไม่สามารถสมัครสมาชิกได้ (รหัสพนักงานอาจซ้ำ)' });
    }
});

module.exports = router;