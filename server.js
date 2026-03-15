const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// ข้อควรระวัง: ต้องมั่นใจว่าในโฟลเดอร์ routes มีไฟล์ employees.js และ attendance.js แล้ว
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));

// 👉 เพิ่มบรรทัดนี้เข้าไปครับ เพื่อเปิดใช้งาน API Login
app.use('/api/login', require('./routes/auth'));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});