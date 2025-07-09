# Hướng dẫn sử dụng tính năng Cấu hình mạng

## Tổng quan
Tính năng Cấu hình mạng cho phép bạn tạo sơ đồ mạng tương tác với giao diện kéo thả kiểu Packet Tracer. Bạn có thể kéo thả thiết bị, tạo kết nối, cấu hình IP và theo dõi trạng thái kết nối.

## Các tính năng chính

### 1. Kéo thả thiết bị
- **Danh sách thiết bị**: Hiển thị tất cả emulator có sẵn
- **Kéo thả**: Kéo thiết bị từ danh sách xuống canvas
- **Vị trí tự động**: Thiết bị sẽ được đặt tại vị trí thả
- **Tránh trùng lặp**: Không thể thả cùng một thiết bị nhiều lần

### 2. Di chuyển thiết bị
- **Kéo di chuyển**: Click và kéo thiết bị trên canvas để di chuyển
- **Giới hạn canvas**: Thiết bị không thể di chuyển ra ngoài canvas
- **Cập nhật real-time**: Vị trí được cập nhật ngay lập tức

### 3. Tạo kết nối
- **Chế độ kết nối**: Click "Tạo kết nối" để bật chế độ
- **Chọn thiết bị**: Click vào thiết bị đầu tiên, sau đó click thiết bị thứ hai
- **Kiểm tra trùng lặp**: Hệ thống ngăn tạo kết nối trùng lặp
- **Không tự kết nối**: Không thể kết nối thiết bị với chính nó

### 4. Cấu hình IP
- **Mở modal**: Click vào thiết bị trên canvas
- **Các trường cấu hình**:
  - IP Address (bắt buộc)
  - Subnet Mask (bắt buộc)
  - Gateway (tùy chọn)
- **Validation**: Kiểm tra tính hợp lệ của IP và subnet
- **Thông tin mạng**: Hiển thị network, broadcast, CIDR, usable hosts

### 5. Trạng thái kết nối
- **Dây xanh**: Kết nối thành công giữa các thiết bị
- **Dây đỏ**: Lỗi kết nối (khác subnet hoặc thiết bị lỗi)
- **Chấm xanh**: Thiết bị hoạt động
- **Chấm đỏ**: Thiết bị có lỗi

### 6. Xóa thiết bị và kết nối
- **Xóa thiết bị**: Hover vào thiết bị và click nút "×" đỏ
- **Xóa kết nối**: Hover vào đường kết nối và click nút "×" đỏ
- **Xóa tự động**: Khi xóa thiết bị, tất cả kết nối liên quan cũng bị xóa

### 7. Lưu và tải cấu hình
- **Lưu cấu hình**: Lưu trạng thái hiện tại với tên tùy chỉnh
- **Tải cấu hình**: Khôi phục cấu hình đã lưu
- **Xuất file**: Tải xuống file JSON chứa cấu hình
- **Nhập file**: Tải cấu hình từ file JSON

## Giao diện

### Canvas chính
- **Kích thước**: 800x600 pixels
- **Grid background**: Lưới hỗ trợ để căn chỉnh
- **Responsive**: Tự động điều chỉnh theo màn hình

### Thiết bị trên canvas
- **Kích thước**: 120x80 pixels
- **Thông tin hiển thị**: Tên thiết bị và IP
- **Trạng thái**: Màu sắc và chấm chỉ báo
- **Tương tác**: Click để cấu hình, kéo để di chuyển

### Modal cấu hình
- **Form validation**: Kiểm tra tính hợp lệ real-time
- **Thông tin mạng**: Hiển thị chi tiết subnet
- **Error handling**: Thông báo lỗi rõ ràng

## Các phím tắt và thao tác

### Chuột
- **Click**: Chọn thiết bị, mở modal cấu hình
- **Kéo**: Di chuyển thiết bị
- **Double-click**: Không có tác dụng đặc biệt

### Bàn phím
- **ESC**: Đóng modal cấu hình
- **Enter**: Lưu cấu hình trong modal

## Xử lý lỗi

### Lỗi thường gặp
1. **IP không hợp lệ**: Kiểm tra format và range
2. **Subnet mask sai**: Đảm bảo đúng định dạng
3. **IP trùng lặp**: Mỗi IP chỉ được sử dụng một lần
4. **Kết nối trùng lặp**: Không thể tạo kết nối giữa cùng 2 thiết bị

### Thông báo lỗi
- **Toast notifications**: Hiển thị thông báo ngắn
- **Validation errors**: Hiển thị trong form
- **Confirmation dialogs**: Xác nhận các hành động quan trọng

## Tối ưu hiệu suất

### React DnD
- **HTML5 Backend**: Sử dụng cho kéo thả
- **Optimized rendering**: Chỉ re-render khi cần thiết

### Konva Canvas
- **Hardware acceleration**: Sử dụng GPU khi có thể
- **Efficient updates**: Chỉ cập nhật phần thay đổi
- **Memory management**: Tự động dọn dẹp bộ nhớ

## Tương thích

### Trình duyệt
- **Chrome**: Hỗ trợ đầy đủ
- **Firefox**: Hỗ trợ đầy đủ
- **Safari**: Hỗ trợ đầy đủ
- **Edge**: Hỗ trợ đầy đủ

### Thiết bị
- **Desktop**: Hỗ trợ đầy đủ
- **Tablet**: Hỗ trợ một phần (không khuyến nghị)
- **Mobile**: Không hỗ trợ (cần chuột)

## Phát triển tương lai

### Tính năng có thể thêm
1. **Router/Switch**: Thiết bị mạng chuyên dụng
2. **Wireless connections**: Kết nối không dây
3. **Network simulation**: Mô phỏng traffic
4. **Export to image**: Xuất sơ đồ thành ảnh
5. **Collaborative editing**: Chỉnh sửa cùng lúc

### Cải tiến hiệu suất
1. **Virtual scrolling**: Cho danh sách thiết bị lớn
2. **Lazy loading**: Tải thiết bị theo nhu cầu
3. **WebGL rendering**: Sử dụng WebGL cho canvas
4. **Service Worker**: Cache cấu hình offline

## Troubleshooting

### Vấn đề thường gặp
1. **Thiết bị không kéo được**: Kiểm tra JavaScript console
2. **Canvas không hiển thị**: Kiểm tra CSS và Konva
3. **Modal không mở**: Kiểm tra event handlers
4. **Lưu không thành công**: Kiểm tra localStorage

### Debug
- **Console logs**: Xem lỗi JavaScript
- **Network tab**: Kiểm tra API calls
- **React DevTools**: Debug component state
- **Konva Inspector**: Debug canvas elements 