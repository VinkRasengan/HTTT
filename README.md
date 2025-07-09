# Messenger Simulator - Ứng dụng mô phỏng nhắn tin và gọi điện

Ứng dụng web chạy cục bộ trên Windows, mô phỏng các "điện thoại ảo" (emulator) có khả năng nhắn tin và gọi điện với cấu hình IP giống Cisco Packet Tracer.

## Tính năng chính

- ✅ Tạo nhiều điện thoại ảo (emulator) với cấu hình IP riêng
- ✅ Nhắn tin real-time giữa các emulator
- ✅ Gọi điện mô phỏng
- ✅ Logic mô phỏng mạng (subnet checking)
- ✅ Giao diện web responsive
- ✅ Ứng dụng desktop với Electron

## Công nghệ sử dụng

- **Frontend**: React 18+ với modern hooks
- **Backend**: Node.js + Express + Socket.io
- **Desktop**: Electron
- **Styling**: Tailwind CSS
- **Real-time**: WebSocket với Socket.io

## Cài đặt và chạy

### 1. Cài đặt dependencies cho tất cả packages
```bash
npm run install:all
```
Script này sẽ tự động cài đặt dependencies cho:
- Root project (concurrently, cross-env)
- Server (Express, Socket.io, Joi, UUID)
- Client (React, Tailwind CSS, Axios, Socket.io-client)
- Electron (Electron framework, electron-builder)

### 2. Khởi động ứng dụng
```bash
npm start
```
Lệnh này sẽ khởi động đồng thời:
- **Backend server** (port 3001) - API và Socket.io
- **React development server** (port 3000) - Frontend
- **Electron desktop app** (sau 8 giây delay)

### 3. Dừng ứng dụng
```bash
npm stop
```
Script này sẽ dừng tất cả processes liên quan:
- Node.js processes (server, client)
- Electron processes
- npm processes
- Giải phóng ports 3000 và 3001

### 4. Scripts khác
```bash
npm run dev          # Chỉ chạy web app (không Electron)
npm run clean        # Xóa tất cả node_modules
npm run reset        # Clean + install lại tất cả
npm run health       # Kiểm tra trạng thái hệ thống
```

### 5. Windows Shortcuts
Trên Windows, bạn có thể sử dụng các file .bat:
```bash
start.bat            # Khởi động ứng dụng
stop.bat             # Dừng ứng dụng
```

## Cấu trúc dự án

```
messenger-simulator/
├── server/          # Backend Node.js + Express + Socket.io
├── client/          # Frontend React
├── electron/        # Electron desktop wrapper
├── docs/           # Tài liệu dự án
└── package.json    # Root package với npm scripts
```

## Hướng dẫn sử dụng

1. **Tạo Emulator**: Nhập tên, IP, subnet mask và gateway
2. **Cấu hình mạng**: Các emulator chỉ giao tiếp được nếu cùng subnet
3. **Nhắn tin**: Chọn emulator gửi và nhận, nhập tin nhắn
4. **Gọi điện**: Thực hiện cuộc gọi mô phỏng giữa các emulator

## Development

### Chạy chỉ web app (không Electron)
```bash
npm run dev
```

### Build production
```bash
npm run build
```

### Build Electron app
```bash
npm run build:electron
```

## Mô phỏng mạng

Ứng dụng mô phỏng logic mạng tại lớp ứng dụng:
- Kiểm tra cùng subnet bằng phép AND với subnet mask
- Hỗ trợ cấu hình router (tính năng mở rộng)
- Mô phỏng độ trễ mạng (tính năng mở rộng)

## License

MIT License
