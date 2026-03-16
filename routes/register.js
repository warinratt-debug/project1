const express = require('express');
const router = express.Router();
const db = require('../db'); // เชื่อมต่อฐานข้อมูล

// สร้าง API สำหรับสมัครสมาชิก
router.post('/', async (req, res) => {
    // รับข้อมูลจากหน้าเว็บที่ส่งมา
    const { employee_code, name, department, password } = req.body;

    try {
        // 1. บันทึกข้อมูลพนักงานลงตาราง employees
        await db.query(
            'INSERT INTO employees (employee_code, name, department) VALUES (?, ?, ?)',
            [employee_code, name, department]
        );

        // 2. บันทึกข้อมูลบัญชีลงตาราง users 
        // ให้ username คือรหัสพนักงาน และให้สิทธิ์คนที่สมัครเองเป็นแค่ 'user' ธรรมดา
        await db.query(
            'INSERT INTO users (username, password, role, employee_code) VALUES (?, ?, ?, ?)',
            [employee_code, password, 'user', employee_code]
        );

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ' });
        
    } catch (err) {
        // ถ้าขึ้น Error มักจะเกิดจากการใส่รหัสพนักงานซ้ำกับที่มีอยู่แล้ว
        res.status(500).json({ error: 'ไม่สามารถสมัครสมาชิกได้ (รหัสพนักงานอาจซ้ำ)' });
    }
});

module.exports = router;