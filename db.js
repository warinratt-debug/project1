const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  port: 9000,        // พอร์ตที่เปิดออกมาจาก Docker
  user: 'root',
  password: 'root',  // รหัสผ่านตามที่ตั้งใน MYSQL_ROOT_PASSWORD
  database: 'webpj'  // ชื่อฐานข้อมูล
});

module.exports = pool.promise();