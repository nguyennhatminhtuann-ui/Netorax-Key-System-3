NETORAX KEY SYSTEM - DEMO

Yêu cầu:
- Windows
- Node.js (khuyến nghị Node.js 18+)

1. Cài Node.js nếu máy chưa có.
2. Mở CMD/PowerShell tại thư mục "api".
3. Chạy:
   node server.js
4. Mở Chrome:
   http://localhost:3000

Demo hiện có:
- Key mẫu: 1
- GET KEY trả về Key 1.
- Verify API:
  http://localhost:3000/api/verify?key=1
- Key sai:
  http://localhost:3000/api/verify?key=abc

LƯU Ý:
Bản này chỉ mô phỏng bước Link4M. Nó KHÔNG tự xác minh người dùng đã vượt Link4M thật.
Muốn kết nối Link4M thật cần thay phần /api/getkey bằng callback/API xác minh chính thức của dịch vụ đó.

Cấu trúc:
website/index.html
api/server.js
database/keys.json
