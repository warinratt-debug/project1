        const API_URL = 'http://localhost:3000/api';

        // ระบบจัดการสิทธิ์ผู้ใช้งาน
        document.addEventListener("DOMContentLoaded", () => {
            const role = localStorage.getItem('role');

            if (!role) {
                window.location.href = 'login.html';
                return;
            }

            if (role === 'admin') {
                document.getElementById('adminSection').style.display = 'block';
                document.getElementById('userSection').style.display = 'none';
                loadEmployees();
            } else {
                // role === 'user'
                document.getElementById('adminSection').style.display = 'none';
                document.getElementById('userSection').style.display = 'block';
            }
        });

        function logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        }

        // ฟังก์ชันบันทึกเวลาทำงาน
        async function recordAttendance() {
            const data = {
                employee_id: document.getElementById('attEmpId').value,
                date: document.getElementById('attDate').value,
                check_in: document.getElementById('attCheckIn').value,
                check_out: document.getElementById('attCheckOut').value
            };
            try {
                const res = await axios.post(`${API_URL}/attendance`, data);
                const result = res.data;
                if (result.message) {
                    Swal.fire({
                        title: 'บันทึกสำเร็จ!',
                        html: `ชั่วโมงทำงาน: <b>${result.work_hours}</b> ชม.<br>OT: <b>${result.ot_hours}</b> ชม.`,
                        icon: 'success'
                    }).then(() => {
                        // เพิ่มบรรทัดนี้ เพื่อให้ตารางรายงานด้านล่างรีเฟรชอัปเดตข้อมูลทันที
                        getReport(role);
                    });
                }
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', error.response?.data?.error || 'ไม่สามารถบันทึกข้อมูลได้', 'error');
            }
        }

        // ฟังก์ชันดึงรายงานสรุป (รับ role เพื่อเลือก element ที่ถูกต้อง)
        async function getReport(role) {
            const year = document.getElementById(role === 'admin' ? 'adminRepYear' : 'userRepYear').value;
            const month = document.getElementById(role === 'admin' ? 'adminRepMonth' : 'userRepMonth').value;
            const tbodyId = role === 'admin' ? 'adminReportTableBody' : 'userReportTableBody';

            try {
                const res = await axios.get(`${API_URL}/attendance/report/${year}/${month}`);
                const result = res.data;

                const tbody = document.getElementById(tbodyId);
                tbody.innerHTML = '';

                if (result.report && result.report.length > 0) {
                    result.report.forEach(row => {
                        tbody.innerHTML += `
                            <tr>
                                <td>${row.employee_code}</td>
                                <td>${row.name}</td>
                                <td>${row.total_working_days} วัน</td>
                                <td>${row.total_work_hours} ชม.</td>
                                <td>${row.total_ot_hours} ชม.</td>
                            </tr>
                        `;
                    });
                } else {
                    tbody.innerHTML = `<tr><td colspan="5" class="text-center">ไม่พบข้อมูลในเดือนนี้</td></tr>`;
                }
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', error.response?.data?.error || 'ไม่สามารถดึงข้อมูลรายงานได้', 'error');
            }
        }

        // ดึงข้อมูลพนักงานทั้งหมดมาแสดงในตาราง
        async function loadEmployees() {
            try {
                const res = await axios.get(`${API_URL}/employees`);
                const employees = res.data;

                const tbody = document.getElementById('employeeTableBody');
                tbody.innerHTML = '';

                employees.forEach(emp => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${emp.employee_code}</td>
                            <td>${emp.name}</td>
                            <td>${emp.department}</td>
                            <td class="text-center">
                                <button class="btn btn-warning btn-sm" onclick="editEmployee(${emp.id}, '${emp.name}', '${emp.department}')">✏️</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${emp.id})">🗑️</button>
                            </td>
                        </tr>
                    `;
                });
            } catch (error) {
                console.error('โหลดข้อมูลพนักงานล้มเหลว:', error);
            }
        }

        // แก้ไขพนักงาน
        async function editEmployee(id, oldName, oldDept) {
            const { value: formValues } = await Swal.fire({
                title: 'แก้ไขข้อมูลพนักงาน',
                html:
                    `<label class="form-label float-start mt-2">ชื่อ-นามสกุล</label>` +
                    `<input id="swal-input1" class="swal2-input" value="${oldName}">` +
                    `<label class="form-label float-start mt-2">ตำแหน่ง</label>` +
                    `<input id="swal-input2" class="swal2-input" value="${oldDept}">`,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'บันทึก',
                cancelButtonText: 'ยกเลิก',
                preConfirm: () => {
                    return [
                        document.getElementById('swal-input1').value,
                        document.getElementById('swal-input2').value
                    ]
                }
            });

            if (formValues) {
                const newName = formValues[0];
                const newDept = formValues[1];

                if (newName && newDept) {
                    try {
                        await axios.put(`${API_URL}/employees/${id}`, { name: newName, department: newDept });
                        Swal.fire('สำเร็จ!', 'แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
                        loadEmployees();
                    } catch (error) {
                        Swal.fire('เกิดข้อผิดพลาด', error.response?.data?.error || 'เกิดข้อผิดพลาดในการแก้ไข', 'error');
                    }
                }
            }
        }

        // ลบพนักงาน
        function deleteEmployee(id) {
            Swal.fire({
                title: 'คุณแน่ใจหรือไม่?',
                text: "หากลบแล้วจะไม่สามารถกู้คืนข้อมูลได้!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'ใช่, ลบเลย!',
                cancelButtonText: 'ยกเลิก'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await axios.delete(`${API_URL}/employees/${id}`);
                        Swal.fire('ลบข้อมูลสำเร็จ!', 'พนักงานถูกลบออกจากระบบแล้ว', 'success');
                        loadEmployees();
                    } catch (error) {
                        Swal.fire('เกิดข้อผิดพลาด', error.response?.data?.error || 'เกิดข้อผิดพลาดในการลบ', 'error');
                    }
                }
            });
        }
