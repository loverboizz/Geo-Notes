# 📍 Geo-Notes - Ứng dụng Ghi chú theo Vị trí

Ứng dụng web cho phép tạo ghi chú theo vị trí địa lý với tương tác trực tiếp trên bản đồ.

## ✨ Tính năng chính

- 🗺️ **Chọn vị trí trực tiếp trên bản đồ** - Không cần GPS permission
- 🔍 **Tìm kiếm địa điểm** - Hỗ trợ geocoding với OpenStreetMap
- 📝 **Tạo ghi chú tại vị trí** - Lưu nội dung + tọa độ + địa chỉ
- 📍 **Hiển thị ghi chú trên bản đồ** - Interactive markers
- 🏷️ **Quản lý ghi chú** - Xem, sửa, xóa ghi chú
- 📐 **Lọc theo bán kính** - Hiển thị ghi chú trong khu vực
- 🗺️ **Mở Google Maps** - Dẫn đường tới vị trí
- 💾 **Lưu trữ local** - Dữ liệu được lưu trong browser

## 🛠️ Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Maps**: Leaflet.js + OpenStreetMap
- **Geocoding**: Nominatim API
- **Storage**: LocalStorage
- **Server**: Node.js HTTPS server (tự tạo certificate)

## 📋 Yêu cầu hệ thống

- **Node.js** (version 14+)
- **NPM** (version 6+)
- **Browser** hỗ trợ ES6+ (Chrome, Firefox, Safari, Edge)
- **Internet connection** (để tải bản đồ và geocoding)

## 🚀 Hướng dẫn cài đặt và chạy

### Bước 1: Clone/Download dự án
```bash
# Nếu có git
git clone <repository-url>

# Hoặc download và giải nén
```

### Bước 2: Cài đặt dependencies
```bash
cd QR_Attendence
npm install
```

### Bước 3: Chạy ứng dụng

#### Cách 1: Chạy HTTP server (đơn giản)
```bash
npm start
```
Mở browser tại: `http://localhost:8080`

#### Cách 2: Chạy HTTPS server (khuyến nghị)
```bash
node https-server.js
```
Mở browser tại: `https://localhost:8443`

⚠️ **Lưu ý**: Browser sẽ cảnh báo "Not secure" do self-signed certificate. Nhấn "Advanced" → "Proceed to localhost" để tiếp tục.

### Bước 4: Sử dụng ứng dụng
1. Mở browser tại địa chỉ server
2. Nhấn vào bản đồ để chọn vị trí
3. Nhập ghi chú và nhấn "Check-in"
4. Xem ghi chú xuất hiện trên bản đồ

## 📖 Hướng dẫn sử dụng

### 🗺️ Chọn vị trí
- **Click trên bản đồ**: Chọn vị trí chính xác
- **Tìm kiếm địa điểm**: Nhập tên và nhấn Enter
- **Quick search**: Nhấn các nút địa điểm phổ biến

### 📝 Tạo ghi chú
1. Chọn vị trí trên bản đồ (marker 📍 xuất hiện)
2. Nhập nội dung ghi chú trong text area
3. Nhấn "Check-in tại vị trí đã chọn"
4. Ghi chú được lưu và hiển thị marker 📝

### 🔍 Tìm kiếm địa điểm
- Nhập tên địa điểm (VD: "Hồ Gươm Hà Nội")
- Nhấn Enter hoặc nút "🔍 Tìm kiếm"
- Chọn kết quả phù hợp nếu có nhiều lựa chọn

### 📋 Quản lý ghi chú
- **Xem danh sách**: Scroll xuống phần "Danh sách ghi chú"
- **Xem chi tiết**: Click vào ghi chú trong danh sách
- **Mở Google Maps**: Trong popup chi tiết
- **Xóa ghi chú**: Trong popup chi tiết

### 🎛️ Các chức năng khác
- **Lọc theo bán kính**: Dropdown 1km/5km/10km
- **Về Hà Nội**: Reset view bản đồ
- **Xóa vị trí đã chọn**: Hủy marker đã chọn

## 📁 Cấu trúc dự án

```
QR_Attendence/
├── index.html              # Giao diện chính
├── package.json             # Dependencies và scripts
├── https-server.js          # HTTPS server tự tạo
├── css/
│   └── styles.css          # Stylesheet chính
├── js/
│   └── script.js           # Logic ứng dụng
└── README.md               # File này
```

## 🔧 Troubleshooting

### Lỗi thường gặp

#### "Cannot find module" khi chạy
```bash
npm install
```

#### "Port already in use"
- Đổi port trong `package.json` hoặc `https-server.js`
- Hoặc tắt process đang dùng port

#### "Not secure" trên HTTPS
- Bình thường với self-signed certificate
- Nhấn "Advanced" → "Proceed to localhost"

#### Bản đồ không tải
- Kiểm tra kết nối internet
- Thử reload trang (F5)

#### Tìm kiếm không hoạt động
- Kiểm tra kết nối internet
- Nominatim API có thể bị rate limit

### Debug
- Mở DevTools (F12) → Console để xem lỗi
- Kiểm tra Network tab để xem API calls

## 🎯 Demo và Test

### Địa điểm test phổ biến:
- "Hồ Gươm Hà Nội"
- "Bến Thành TP.HCM"
- "Cầu Rồng Đà Nẵng"
- "Đại học Bách khoa Hà Nội"
- "Chợ Đồng Xuân"

### Workflow test:
1. Tìm kiếm "Hồ Gươm" → Chọn kết quả
2. Nhập ghi chú "Du lịch Hà Nội"
3. Check-in → Xem marker xuất hiện
4. Click marker → Xem popup
5. Click ghi chú trong danh sách → Xem chi tiết

## 📦 Build và Deploy

### Development
```bash
npm run dev    # Chạy với auto-reload
```

### Production
- Copy các file static lên web server
- Hoặc sử dụng hosting services (Netlify, Vercel, etc.)
- Đảm bảo HTTPS để tối ưu tính năng

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License - Xem file LICENSE để biết chi tiết

## 🙋‍♂️ Support

Nếu gặp vấn đề:
1. Kiểm tra phần Troubleshooting
2. Mở DevTools để debug
3. Tạo issue với log lỗi

---

**Chúc bạn sử dụng Geo-Notes vui vẻ! 🎉**
