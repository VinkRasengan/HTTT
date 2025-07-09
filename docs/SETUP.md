# Hướng dẫn cài đặt và chạy Messenger Simulator

## Yêu cầu hệ thống

- **Node.js**: Phiên bản 18.0.0 trở lên
- **npm**: Phiên bản 8.0.0 trở lên (đi kèm với Node.js)
- **Hệ điều hành**: Windows 10/11, macOS 10.14+, hoặc Linux Ubuntu 18.04+
- **RAM**: Tối thiểu 4GB
- **Dung lượng ổ cứng**: 500MB trống

## Cài đặt

### 1. Clone hoặc tải xuống dự án

```bash
git clone <repository-url>
cd messenger-simulator
```

### 2. Cài đặt dependencies cho tất cả packages

```bash
npm run install:all
```

Lệnh này sẽ cài đặt dependencies cho:
- Root project (concurrently)
- Server (Express, Socket.io, etc.)
- Client (React, Tailwind CSS, etc.)
- Electron (Electron framework)

### 3. Kiểm tra cài đặt

Đảm bảo tất cả packages đã được cài đặt thành công:

```bash
# Kiểm tra server
cd server && npm list --depth=0

# Kiểm tra client
cd ../client && npm list --depth=0

# Kiểm tra electron
cd ../electron && npm list --depth=0
```

## Chạy ứng dụng

### Chế độ Development (Khuyến nghị)

```bash
# Từ thư mục root
npm start
```

Lệnh này sẽ khởi động:
- **Backend server** trên port 3001
- **React development server** trên port 3000
- **Electron desktop app** (tự động mở)

### Chạy riêng từng service

```bash
# Chỉ chạy backend và frontend (không Electron)
npm run dev

# Hoặc chạy từng service riêng biệt:
npm run start:server    # Backend only
npm run start:client    # Frontend only
npm run start:electron  # Electron only
```

### Dừng ứng dụng

```bash
npm stop
```

## Truy cập ứng dụng

- **Web App**: http://localhost:3000
- **Desktop App**: Tự động mở khi chạy `npm start`
- **API Server**: http://localhost:3001

## Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục `client/` nếu cần:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SERVER_URL=http://localhost:3001
```

Tạo file `.env` trong thư mục `server/` nếu cần:

```env
PORT=3001
NODE_ENV=development
```

### Ports

- **Backend**: 3001 (có thể thay đổi bằng biến môi trường PORT)
- **Frontend**: 3000 (tự động chọn port khác nếu 3000 đã được sử dụng)

## Build Production

### Build web app

```bash
npm run build
```

### Build Electron app

```bash
cd electron
npm run build
```

Hoặc build cho platform cụ thể:

```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Troubleshooting

### Lỗi thường gặp

1. **Port đã được sử dụng**
   ```
   Error: listen EADDRINUSE: address already in use :::3001
   ```
   - Giải pháp: Dừng process đang sử dụng port hoặc thay đổi port trong file cấu hình

2. **Dependencies không được cài đặt**
   ```
   Module not found: Can't resolve 'package-name'
   ```
   - Giải pháp: Chạy lại `npm run install:all`

3. **Electron không khởi động**
   - Kiểm tra Node.js version >= 18.0.0
   - Chạy `cd electron && npm install` để cài đặt lại Electron

4. **Socket.io connection failed**
   - Đảm bảo backend server đang chạy trên port 3001
   - Kiểm tra firewall không chặn kết nối localhost

### Xóa cache và cài đặt lại

```bash
# Xóa tất cả node_modules
rm -rf node_modules server/node_modules client/node_modules electron/node_modules

# Xóa package-lock.json
rm -f package-lock.json server/package-lock.json client/package-lock.json electron/package-lock.json

# Cài đặt lại
npm run install:all
```

### Logs và Debug

- **Server logs**: Hiển thị trong terminal khi chạy server
- **Client logs**: Mở Developer Tools trong browser (F12)
- **Electron logs**: Mở Developer Tools trong Electron app (F12)

## Cấu trúc dự án

```
messenger-simulator/
├── server/          # Backend Node.js + Express + Socket.io
├── client/          # Frontend React + Tailwind CSS
├── electron/        # Electron desktop wrapper
├── docs/           # Tài liệu dự án
└── package.json    # Root package với npm scripts
```

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra phần Troubleshooting ở trên
2. Đảm bảo đã cài đặt đúng Node.js version
3. Kiểm tra logs trong terminal và browser console
4. Tạo issue trên repository với thông tin chi tiết về lỗi
