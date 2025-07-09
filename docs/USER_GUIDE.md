# Hướng dẫn sử dụng Messenger Simulator

## Giới thiệu

Messenger Simulator là ứng dụng mô phỏng nhắn tin và gọi điện với cấu hình IP, tương tự như Cisco Packet Tracer. Ứng dụng cho phép tạo các "điện thoại ảo" (emulator) và kiểm tra khả năng giao tiếp dựa trên cấu hình mạng.

## Tính năng chính

- ✅ Tạo và quản lý emulator với cấu hình IP
- ✅ Mô phỏng logic mạng (subnet checking)
- ✅ Nhắn tin real-time giữa các emulator
- ✅ Gọi điện mô phỏng
- ✅ Phân tích cấu hình mạng
- ✅ Ma trận kết nối

## Bắt đầu sử dụng

### 1. Dashboard

Khi mở ứng dụng, bạn sẽ thấy Dashboard với:
- **Thống kê tổng quan**: Số lượng emulator, tin nhắn, cuộc gọi
- **Topology mạng**: Hiển thị các subnet và thiết bị
- **Hoạt động gần đây**: Tin nhắn và cuộc gọi mới nhất
- **Trạng thái server**: Thông tin kết nối

### 2. Tạo Emulator đầu tiên

1. Chuyển đến tab **"Quản lý Emulator"**
2. Nhấn nút **"Tạo Emulator"**
3. Điền thông tin:
   - **Tên**: Đặt tên cho emulator (ví dụ: "Phone 1")
   - **IP Address**: Địa chỉ IP (ví dụ: "192.168.1.10")
   - **Subnet Mask**: Chọn từ danh sách có sẵn
   - **Gateway**: Tùy chọn (ví dụ: "192.168.1.1")
4. Nhấn **"Tạo Emulator"**

### 3. Tạo thêm Emulator

Để test kết nối, tạo thêm emulator:
- **Cùng subnet**: IP khác nhưng cùng dải mạng (ví dụ: "192.168.1.11")
- **Khác subnet**: IP khác dải mạng (ví dụ: "192.168.2.10")

## Sử dụng tính năng

### Nhắn tin

1. Chuyển đến tab **"Nhắn tin"**
2. Chọn **emulator gửi** từ dropdown
3. Chọn **emulator nhận** (chỉ hiển thị emulator cùng subnet)
4. Nhập tin nhắn và nhấn **Send**

**Lưu ý**: Chỉ có thể nhắn tin giữa các emulator trong cùng subnet.

### Gọi điện

1. Chuyển đến tab **"Gọi điện"**
2. Chọn **emulator gọi** và **emulator nhận**
3. Nhấn **"Thực hiện cuộc gọi"**
4. Sử dụng các nút:
   - **Trả lời**: Chấp nhận cuộc gọi
   - **Kết thúc**: Dừng cuộc gọi

### Cấu hình mạng

Tab **"Cấu hình mạng"** cung cấp:

#### Subnet Details
- Xem chi tiết từng subnet
- Thông tin network, broadcast, host range
- Danh sách thiết bị trong subnet

#### IP Calculator
- Tính toán thông tin mạng từ IP và subnet mask
- Hiển thị network address, broadcast, CIDR, số host

#### Ma trận kết nối
- Bảng hiển thị khả năng kết nối giữa tất cả emulator
- 🟢 Xanh: Có thể kết nối (cùng subnet)
- 🔴 Đỏ: Không thể kết nối (khác subnet)
- ⚪ Xám: Chính nó

## Hiểu về mạng

### Subnet và kết nối

Emulator chỉ có thể giao tiếp nếu:
1. **Cùng subnet**: Có cùng network address sau khi AND với subnet mask
2. **Subnet mask giống nhau**

Ví dụ:
- ✅ 192.168.1.10/24 ↔ 192.168.1.20/24 (Cùng subnet)
- ❌ 192.168.1.10/24 ↔ 192.168.2.10/24 (Khác subnet)

### Các loại subnet mask phổ biến

| CIDR | Subnet Mask | Hosts | Ví dụ sử dụng |
|------|-------------|-------|---------------|
| /24 | 255.255.255.0 | 254 | Mạng LAN nhỏ |
| /25 | 255.255.255.128 | 126 | Chia nhỏ mạng /24 |
| /26 | 255.255.255.192 | 62 | Mạng phòng ban |
| /27 | 255.255.255.224 | 30 | Mạng nhóm nhỏ |
| /28 | 255.255.255.240 | 14 | Point-to-point |
| /16 | 255.255.0.0 | 65534 | Mạng lớn |
| /8 | 255.0.0.0 | 16777214 | Mạng rất lớn |

## Ví dụ thực hành

### Scenario 1: Mạng LAN đơn giản

1. Tạo 3 emulator cùng subnet:
   - Phone1: 192.168.1.10/24
   - Phone2: 192.168.1.11/24
   - Phone3: 192.168.1.12/24

2. Test nhắn tin giữa các emulator
3. Thực hiện cuộc gọi

### Scenario 2: Hai subnet riêng biệt

1. Tạo subnet A:
   - PhoneA1: 192.168.1.10/24
   - PhoneA2: 192.168.1.11/24

2. Tạo subnet B:
   - PhoneB1: 192.168.2.10/24
   - PhoneB2: 192.168.2.11/24

3. Kiểm tra:
   - ✅ PhoneA1 ↔ PhoneA2 (cùng subnet)
   - ✅ PhoneB1 ↔ PhoneB2 (cùng subnet)
   - ❌ PhoneA1 ↔ PhoneB1 (khác subnet)

### Scenario 3: Subnet với nhiều kích cỡ

1. Subnet lớn (/24):
   - Server: 192.168.1.1/24
   - PC1: 192.168.1.10/24
   - PC2: 192.168.1.11/24

2. Subnet nhỏ (/28):
   - Router1: 192.168.1.17/28
   - Router2: 192.168.1.18/28

## Tips và thủ thuật

### Tạo IP nhanh
- Sử dụng nút **"Tự động"** để tạo IP mẫu
- Thay đổi subnet mask trước khi tạo IP để có dải phù hợp

### Kiểm tra kết nối
- Sử dụng ma trận kết nối để xem tổng quan
- Kiểm tra subnet details để xem chi tiết

### Debug mạng
- Sử dụng IP Calculator để tính toán thủ công
- So sánh network address để hiểu tại sao không kết nối được

### Quản lý emulator
- Đặt tên có ý nghĩa (ví dụ: "Server-192.168.1.1")
- Nhóm theo subnet để dễ quản lý
- Xóa emulator không cần thiết để giữ giao diện gọn gàng

## Troubleshooting

### Không thể nhắn tin/gọi điện

**Nguyên nhân**: Hai emulator không cùng subnet

**Giải pháp**:
1. Kiểm tra IP và subnet mask của cả hai emulator
2. Sử dụng IP Calculator để tính network address
3. Đảm bảo network address giống nhau

### Emulator không hiển thị trong danh sách nhận

**Nguyên nhân**: Không có emulator nào cùng subnet

**Giải pháp**:
1. Tạo thêm emulator với IP cùng subnet
2. Hoặc thay đổi IP của emulator hiện tại

### Lỗi "IP address đã được sử dụng"

**Giải pháp**:
1. Chọn IP khác trong cùng subnet
2. Hoặc xóa emulator đang sử dụng IP đó

## Kết luận

Messenger Simulator giúp bạn hiểu rõ hơn về:
- Cách hoạt động của subnet và subnet mask
- Logic kết nối mạng cơ bản
- Tầm quan trọng của cấu hình IP đúng

Hãy thử nghiệm với các scenario khác nhau để nắm vững kiến thức mạng!
