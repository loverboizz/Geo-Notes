// Geo-Notes Application
// Quản lý ghi chú theo vị trí - với Capacitor Geolocation

// Removed ES module import to support plain browser without bundler
// import { Geolocation } from '@capacitor/geolocation';

class GeoNotes {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('geoNotes')) || [];
        this.map = null;
        this.selectedLocation = null;
        this.markers = [];
        this.currentNoteId = null;
        this.selectedMarker = null;

        this.init();
    }

    init() {
        this.initMap();
        this.bindEvents();
        this.renderNotesList();
        this.updateNotesCount();
        this.setupMapClickHandler();
        this.showInitialStatus();
    }

    showInitialStatus() {
        const status = document.getElementById('locationStatus');
        status.textContent = '🗺️ Nhấn vào bản đồ để chọn vị trí tạo ghi chú';
        status.className = 'location-status';
    }    // Khởi tạo bản đồ Leaflet
    initMap() {
        // Vị trí mặc định (Hà Nội)
        const defaultLat = 21.0285;
        const defaultLng = 105.8542;

        this.map = L.map('map').setView([defaultLat, defaultLng], 13);

        // Thêm tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Hiển thị các ghi chú hiện có trên bản đồ
        this.displayNotesOnMap();
    }

    // Thiết lập xử lý click trên bản đồ
    setupMapClickHandler() {
        this.map.on('click', (e) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            this.selectLocation(lat, lng);
        });
    }

    // Chọn vị trí trên bản đồ
    selectLocation(lat, lng) {
        this.selectedLocation = { lat, lng };

        // Xóa marker cũ nếu có
        if (this.selectedMarker) {
            this.map.removeLayer(this.selectedMarker);
        }

        // Thêm marker mới
        this.selectedMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'selected-location-marker',
                html: '📍',
                iconSize: [35, 35],
                iconAnchor: [17, 17]
            })
        }).addTo(this.map).bindPopup('Vị trí đã chọn - Nhập ghi chú và nhấn Check-in');

        // Cập nhật status
        const status = document.getElementById('locationStatus');
        status.textContent = `📍 Đã chọn vị trí: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        status.className = 'location-status success';

        // Lấy địa chỉ cho vị trí đã chọn
        this.getAddressForSelectedLocation();

        // Mở popup
        this.selectedMarker.openPopup();
    }

    // Lấy địa chỉ cho vị trí đã chọn
    async getAddressForSelectedLocation() {
        if (!this.selectedLocation) return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.selectedLocation.lat}&lon=${this.selectedLocation.lng}&zoom=18&addressdetails=1`);
            const data = await response.json();

            if (data && data.display_name) {
                const status = document.getElementById('locationStatus');
                status.textContent = `📍 ${data.display_name}`;
                status.className = 'location-status success';
            }
        } catch (error) {
            console.error('Lỗi khi lấy địa chỉ:', error);
        }
    }    // Bind sự kiện cho các nút
    bindEvents() {
        document.getElementById('checkinBtn').addEventListener('click', () => this.createNote());
        document.getElementById('radiusFilter').addEventListener('change', (e) => this.filterNotesByRadius(e.target.value));
        document.getElementById('centerMapBtn').addEventListener('click', () => this.centerMapToDefault());
        document.getElementById('openInMapsBtn').addEventListener('click', () => this.openInGoogleMaps());
        document.getElementById('deleteNoteBtn').addEventListener('click', () => this.deleteNote());

        // Thêm search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.searchLocation());
        document.getElementById('locationSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocation();
            }
        });

        // Chỉ thêm nút GPS Capacitor nếu plugin khả dụng (trên app native)
        const hasCapGeolocation = window?.Capacitor?.Plugins?.Geolocation;
        if (hasCapGeolocation) {
            const gpsBtn = document.createElement('button');
            gpsBtn.className = 'btn-primary';
            gpsBtn.innerHTML = '<span class="icon">🛰️</span>GPS Chính xác';
            gpsBtn.onclick = () => this.getCapacitorLocation();
            document.querySelector('.form-actions').appendChild(gpsBtn);
        }

        // Thêm nút xóa vị trí đã chọn
        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-secondary';
        clearBtn.innerHTML = '<span class="icon">🗑️</span>Xóa vị trí đã chọn';
        clearBtn.onclick = () => this.clearSelectedLocation();
        document.querySelector('.form-actions').appendChild(clearBtn);
    }

    // Xóa vị trí đã chọn
    clearSelectedLocation() {
        if (this.selectedMarker) {
            this.map.removeLayer(this.selectedMarker);
            this.selectedMarker = null;
        }

        this.selectedLocation = null;
        this.showInitialStatus();
    }

    // Đưa bản đồ về vị trí mặc định
    centerMapToDefault() {
        this.map.setView([21.0285, 105.8542], 13);
    }

    // Sử dụng vị trí demo
    useDemoLocation() {
        // Vị trí demo tại Hà Nội (Hồ Gươm)
        const demoLocations = [
            { lat: 21.0285, lng: 105.8542, name: "Hồ Gươm, Hà Nội" },
            { lat: 21.0077, lng: 105.8431, name: "Văn Miếu, Hà Nội" },
            { lat: 21.0245, lng: 105.8412, name: "Nhà thờ lớn Hà Nội" },
            { lat: 10.7769, lng: 106.7009, name: "Bến Thành, TP.HCM" },
            { lat: 16.0544, lng: 108.2022, name: "Cầu Rồng, Đà Nẵng" }
        ];

        const randomLocation = demoLocations[Math.floor(Math.random() * demoLocations.length)];

        this.userLocation = {
            lat: randomLocation.lat,
            lng: randomLocation.lng
        };

        const status = document.getElementById('locationStatus');
        status.textContent = `🎯 Đang dùng vị trí demo: ${randomLocation.name} (${randomLocation.lat.toFixed(6)}, ${randomLocation.lng.toFixed(6)})`;
        status.className = 'location-status success';

        // Cập nhật bản đồ
        this.map.setView([randomLocation.lat, randomLocation.lng], 15);

        // Thêm marker vị trí demo
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }

        this.userMarker = L.marker([randomLocation.lat, randomLocation.lng], {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: '🎯',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(this.map).bindPopup(`Vị trí demo: ${randomLocation.name}`);
    }    // Lấy vị trí hiện tại
    getCurrentLocation() {
        const status = document.getElementById('locationStatus');
        status.textContent = 'Đang kiểm tra geolocation...';
        status.className = 'location-status loading';

        // Debug info
        console.log('🔍 Checking geolocation support...');
        console.log('Navigator geolocation available:', !!navigator.geolocation);
        console.log('Is HTTPS:', location.protocol === 'https:');
        console.log('Current origin:', location.origin);

        if (!navigator.geolocation) {
            this.showLocationError('Trình duyệt không hỗ trợ Geolocation. Hãy dùng nút "Dùng vị trí demo"');
            this.autoFallbackToDemo();
            return;
        }

        status.textContent = 'Đang yêu cầu quyền truy cập vị trí...';
        console.log('🎯 Requesting geolocation permission...');

        const options = {
            enableHighAccuracy: false, // Thử với false trước
            timeout: 15000, // Tăng timeout
            maximumAge: 600000 // 10 phút
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('✅ Geolocation success:', position);
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                this.userLocation = { lat, lng };

                status.textContent = `📍 Vị trí thực: ${lat.toFixed(6)}, ${lng.toFixed(6)} (±${Math.round(accuracy)}m)`;
                status.className = 'location-status success';

                // Cập nhật bản đồ
                this.map.setView([lat, lng], 15);

                // Thêm marker vị trí hiện tại
                if (this.userMarker) {
                    this.map.removeLayer(this.userMarker);
                }

                this.userMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '📍',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                }).addTo(this.map).bindPopup('Vị trí thực của bạn');
            },
            (error) => {
                console.error('❌ Geolocation error:', error);
                let errorMessage = 'Không thể lấy vị trí GPS';
                let detailMessage = '';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Quyền truy cập vị trí bị từ chối';
                        detailMessage = 'Hãy kiểm tra settings browser hoặc dùng vị trí demo';
                        console.log('🚫 Permission denied - user blocked location access');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Thông tin vị trí không khả dụng';
                        detailMessage = 'GPS có thể không hoạt động';
                        console.log('📡 Position unavailable - GPS might be off');
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Hết thời gian chờ lấy vị trí';
                        detailMessage = 'Thử lại hoặc dùng vị trí demo';
                        console.log('⏰ Geolocation timeout');
                        break;
                    default:
                        console.log('❓ Unknown geolocation error');
                        break;
                }

                this.showLocationError(`${errorMessage}. ${detailMessage}`);
                this.autoFallbackToDemo();
            },
            options
        );
    }

    // Tự động fallback sang demo
    autoFallbackToDemo() {
        setTimeout(() => {
            const status = document.getElementById('locationStatus');
            status.innerHTML = `
                <div style="margin-bottom: 10px;">❌ Không thể lấy vị trí GPS</div>
                <button onclick="app.useDemoLocation()" class="btn-secondary" style="padding: 8px 16px;">
                    🎯 Dùng vị trí demo ngay
                </button>
            `;
            status.className = 'location-status error';
        }, 2000);
    }

    showLocationError(message) {
        const status = document.getElementById('locationStatus');
        status.textContent = `❌ ${message}`;
        status.className = 'location-status error';
    }    // Lấy vị trí GPS chính xác bằng Capacitor
    async getCapacitorLocation() {
        const status = document.getElementById('locationStatus');
        status.textContent = '🛰️ Đang lấy GPS chính xác...';
        status.className = 'location-status loading';

        // Try to get Capacitor Geolocation from global
        const Geolocation = window?.Capacitor?.Plugins?.Geolocation;
        if (!Geolocation) {
            // Capacitor plugin not available in web context
            status.innerHTML = `
                ⚠️ Không có Capacitor Geolocation trong trình duyệt.<br>
                <button onclick="app.fallbackToWebGPS()" class="btn-secondary" style="margin-top: 10px; padding: 8px 16px;">
                    📍 Thử Web GPS
                </button>
            `;
            status.className = 'location-status error';
            return;
        }

        try {
            // Kiểm tra và xin quyền
            const permissions = await Geolocation.checkPermissions();

            if (permissions.location !== 'granted') {
                const requestResult = await Geolocation.requestPermissions();
                if (requestResult.location !== 'granted') {
                    throw new Error('GPS permission denied');
                }
            }

            // Lấy vị trí với độ chính xác cao
            const coordinates = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 3000
            });

            const lat = coordinates.coords.latitude;
            const lng = coordinates.coords.longitude;
            const accuracy = coordinates.coords.accuracy;
            const altitude = coordinates.coords.altitude;

            // Chọn vị trí này
            this.selectLocation(lat, lng);

            status.textContent = `🛰️ GPS chính xác: ${lat.toFixed(6)}, ${lng.toFixed(6)} (±${Math.round(accuracy)}m)`;
            if (altitude) {
                status.textContent += ` | Độ cao: ${Math.round(altitude)}m`;
            }
            status.className = 'location-status success';

            console.log('🛰️ Capacitor GPS:', {
                lat, lng, accuracy, altitude,
                heading: coordinates.coords.heading,
                speed: coordinates.coords.speed
            });

        } catch (error) {
            console.error('❌ Capacitor GPS Error:', error);

            let errorMessage = 'Không thể lấy GPS chính xác';
            if (error.message?.includes('permission')) {
                errorMessage = 'Quyền GPS bị từ chối. Hãy cấp quyền location trong settings.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'GPS timeout. Hãy thử ở nơi có tín hiệu tốt hơn.';
            } else if (error.message?.includes('unavailable')) {
                errorMessage = 'GPS không khả dụng. Kiểm tra location services.';
            }

            status.textContent = `❌ ${errorMessage}`;
            status.className = 'location-status error';

            // Fallback to web geolocation
            setTimeout(() => {
                status.innerHTML = `
                    ${errorMessage}<br>
                    <button onclick="app.fallbackToWebGPS()" class="btn-secondary" style="margin-top: 10px; padding: 8px 16px;">
                        📍 Thử Web GPS
                    </button>
                `;
            }, 2000);
        }
    }

    // Fallback to web geolocation
    async fallbackToWebGPS() {
        const status = document.getElementById('locationStatus');
        status.textContent = '📍 Đang thử Web GPS...';
        status.className = 'location-status loading';

        if (!navigator.geolocation) {
            status.textContent = '❌ Browser không hỗ trợ geolocation';
            status.className = 'location-status error';
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                this.selectLocation(lat, lng);

                status.textContent = `📍 Web GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)} (±${Math.round(accuracy)}m)`;
                status.className = 'location-status success';
            },
            (error) => {
                status.textContent = '❌ Web GPS cũng không hoạt động. Hãy chọn vị trí trên bản đồ.';
                status.className = 'location-status error';
                setTimeout(() => this.showInitialStatus(), 3000);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }

    // Tạo ghi chú mới
    createNote() {
        const noteText = document.getElementById('noteText').value.trim();

        if (!noteText) {
            alert('Vui lòng nhập nội dung ghi chú');
            return;
        }

        if (!this.selectedLocation) {
            alert('Vui lòng chọn vị trí trên bản đồ trước khi tạo ghi chú');
            return;
        }

        const note = {
            id: Date.now(),
            content: noteText,
            lat: this.selectedLocation.lat,
            lng: this.selectedLocation.lng,
            timestamp: new Date().toISOString(),
            address: null // Sẽ được cập nhật sau
        };

        // Thêm ghi chú
        this.notes.push(note);
        this.saveNotes();

        // Cập nhật UI
        this.renderNotesList();
        this.updateNotesCount();
        this.addNoteToMap(note);

        // Xóa nội dung form và vị trí đã chọn
        document.getElementById('noteText').value = '';
        this.clearSelectedLocation();

        // Hiển thị thông báo thành công
        const status = document.getElementById('locationStatus');
        status.textContent = '✅ Đã tạo ghi chú thành công! Nhấn vào bản đồ để tạo ghi chú mới.';
        status.className = 'location-status success';

        // Lấy địa chỉ từ tọa độ (reverse geocoding)
        this.getAddressFromCoords(note);

        setTimeout(() => {
            this.showInitialStatus();
        }, 3000);
    }

    // Lấy địa chỉ từ tọa độ
    async getAddressFromCoords(note) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${note.lat}&lon=${note.lng}&zoom=18&addressdetails=1`);
            const data = await response.json();

            if (data && data.display_name) {
                note.address = data.display_name;
                this.saveNotes();
                this.renderNotesList(); // Cập nhật danh sách với địa chỉ
            }
        } catch (error) {
            console.error('Lỗi khi lấy địa chỉ:', error);
        }
    }

    // Hiển thị ghi chú trên bản đồ
    displayNotesOnMap() {
        this.clearMapMarkers();
        this.notes.forEach(note => this.addNoteToMap(note));
    }

    // Thêm một ghi chú lên bản đồ
    addNoteToMap(note) {
        const marker = L.marker([note.lat, note.lng], {
            icon: L.divIcon({
                className: 'note-marker',
                html: '📝',
                iconSize: [25, 25],
                iconAnchor: [12, 12]
            })
        }).addTo(this.map);

        const popupContent = `
            <div class="map-popup">
                <div class="popup-content-text">${note.content}</div>
                <div class="popup-time">${this.formatDateTime(note.timestamp)}</div>
                <button onclick="app.showNoteDetail(${note.id})" class="popup-detail-btn">Xem chi tiết</button>
            </div>
        `;

        marker.bindPopup(popupContent);
        this.markers.push({ marker, note });
    }

    // Xóa tất cả marker trên bản đồ
    clearMapMarkers() {
        this.markers.forEach(({ marker }) => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    // Render danh sách ghi chú
    renderNotesList() {
        const notesList = document.getElementById('notesList');

        if (this.notes.length === 0) {
            notesList.innerHTML = `
                <div class="text-center text-muted">
                    <p>Chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên!</p>
                </div>
            `;
            return;
        }

        const notesHTML = this.notes
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(note => `
                <div class="note-item" onclick="app.showNoteDetail(${note.id})">
                    <div class="note-content">${note.content}</div>
                    <div class="note-meta">
                        <div class="note-location">
                            <span>📍</span>
                            <span>${note.address || `${note.lat.toFixed(4)}, ${note.lng.toFixed(4)}`}</span>
                        </div>
                        <div class="note-time">${this.formatDateTime(note.timestamp)}</div>
                    </div>
                </div>
            `).join('');

        notesList.innerHTML = notesHTML;
    }

    // Hiển thị chi tiết ghi chú
    showNoteDetail(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        this.currentNoteId = noteId;

        const modalContent = document.getElementById('modalNoteContent');
        modalContent.innerHTML = `
            <div class="modal-note-text">${note.content}</div>
            <div class="modal-note-details">
                <div class="modal-note-detail">
                    <span>📍</span>
                    <span>${note.address || 'Đang tải địa chỉ...'}</span>
                </div>
                <div class="modal-note-detail">
                    <span>🌐</span>
                    <span>Tọa độ: ${note.lat.toFixed(6)}, ${note.lng.toFixed(6)}</span>
                </div>
                <div class="modal-note-detail">
                    <span>🕒</span>
                    <span>${this.formatDateTime(note.timestamp)}</span>
                </div>
            </div>
        `;

        document.getElementById('noteModal').style.display = 'flex';

        // Center bản đồ tới vị trí ghi chú
        this.map.setView([note.lat, note.lng], 16);
    }

    // Đóng modal chi tiết
    closeNoteModal() {
        document.getElementById('noteModal').style.display = 'none';
        this.currentNoteId = null;
    }

    // Mở Google Maps
    openInGoogleMaps() {
        if (!this.currentNoteId) return;

        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;

        const url = `https://www.google.com/maps?q=${note.lat},${note.lng}`;
        window.open(url, '_blank');
    }

    // Xóa ghi chú
    deleteNote() {
        if (!this.currentNoteId) return;

        if (!confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) return;

        this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
        this.saveNotes();

        this.renderNotesList();
        this.updateNotesCount();
        this.displayNotesOnMap();
        this.closeNoteModal();
    }    // Lọc ghi chú theo bán kính (sử dụng center của bản đồ)
    filterNotesByRadius(radius) {
        this.clearMapMarkers();

        if (radius === 'all') {
            this.displayNotesOnMap();
            return;
        }

        const center = this.map.getCenter();
        const radiusKm = parseInt(radius);
        const filteredNotes = this.notes.filter(note => {
            const distance = this.calculateDistance(
                center.lat, center.lng,
                note.lat, note.lng
            );
            return distance <= radiusKm;
        });

        filteredNotes.forEach(note => this.addNoteToMap(note));
    }

    // Tính khoảng cách giữa 2 điểm (km)
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Bán kính Trái Đất (km)
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRad(deg) {
        return deg * (Math.PI / 180);
    }

    // Đưa bản đồ về vị trí người dùng
    centerMapToUser() {
        if (!this.userLocation) {
            this.getCurrentLocation();
            return;
        }

        this.map.setView([this.userLocation.lat, this.userLocation.lng], 15);
    }

    // Cập nhật số lượng ghi chú
    updateNotesCount() {
        const count = this.notes.length;
        document.getElementById('notesCount').textContent =
            count === 0 ? '0 ghi chú' :
                count === 1 ? '1 ghi chú' :
                    `${count} ghi chú`;
    }

    // Format thời gian
    formatDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Lưu ghi chú vào localStorage
    saveNotes() {
        localStorage.setItem('geoNotes', JSON.stringify(this.notes));
    }

    // Export ghi chú ra CSV
    exportNotes() {
        if (this.notes.length === 0) {
            alert('Không có ghi chú để export');
            return;
        }

        const headers = ['Nội dung', 'Latitude', 'Longitude', 'Địa chỉ', 'Thời gian'];
        const csvContent = [
            headers.join(','),
            ...this.notes.map(note => [
                `"${note.content.replace(/"/g, '""')}"`,
                note.lat,
                note.lng,
                `"${(note.address || '').replace(/"/g, '""')}"`,
                `"${this.formatDateTime(note.timestamp)}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `geo-notes-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    // Tìm kiếm vị trí
    async searchLocation() {
        const query = document.getElementById('locationSearch').value.trim();
        const searchBtn = document.getElementById('searchBtn');
        const status = document.getElementById('locationStatus');

        if (!query) {
            alert('Vui lòng nhập tên địa điểm cần tìm');
            return;
        }

        // Disable button và hiển thị loading
        searchBtn.disabled = true;
        searchBtn.innerHTML = '🔍 Đang tìm...';
        status.textContent = `🔍 Đang tìm kiếm "${query}"...`;
        status.className = 'location-status loading';

        try {
            // Sử dụng Nominatim API để geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=vn&addressdetails=1`);
            const results = await response.json();

            if (results.length === 0) {
                status.textContent = `❌ Không tìm thấy "${query}". Thử tìm với từ khóa khác.`;
                status.className = 'location-status error';
                this.resetSearchButton();
                return;
            }

            // Hiển thị kết quả tìm kiếm
            this.showSearchResults(results, query);

        } catch (error) {
            console.error('Lỗi tìm kiếm:', error);
            status.textContent = '❌ Lỗi khi tìm kiếm. Vui lòng thử lại.';
            status.className = 'location-status error';
            this.resetSearchButton();
        }
    }

    // Hiển thị kết quả tìm kiếm
    showSearchResults(results, query) {
        const status = document.getElementById('locationStatus');

        if (results.length === 1) {
            // Nếu chỉ có 1 kết quả, tự động chọn
            const result = results[0];
            this.selectSearchResult(result);
        } else {
            // Nếu có nhiều kết quả, hiển thị danh sách
            const resultsList = results.slice(0, 3).map((result, index) => {
                const displayName = result.display_name.split(',').slice(0, 3).join(', ');
                return `
                    <button onclick="app.selectSearchResultByIndex(${index})" class="search-result-btn">
                        📍 ${displayName}
                    </button>
                `;
            }).join('');

            status.innerHTML = `
                <div style="margin-bottom: 10px;">🔍 Tìm thấy ${results.length} kết quả cho "${query}":</div>
                <div class="search-results">
                    ${resultsList}
                </div>
            `;
            status.className = 'location-status';

            // Lưu results để dùng sau
            this.searchResults = results;
        }

        this.resetSearchButton();
    }

    // Chọn kết quả tìm kiếm theo index
    selectSearchResultByIndex(index) {
        if (this.searchResults && this.searchResults[index]) {
            this.selectSearchResult(this.searchResults[index]);
        }
    }

    // Chọn một kết quả tìm kiếm
    selectSearchResult(result) {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const displayName = result.display_name.split(',').slice(0, 3).join(', ');

        // Zoom đến vị trí
        this.map.setView([lat, lng], 15);

        // Chọn vị trí này
        this.selectLocation(lat, lng);

        const status = document.getElementById('locationStatus');
        status.textContent = `📍 Đã chọn: ${displayName}`;
        status.className = 'location-status success';

        // Clear search input
        document.getElementById('locationSearch').value = '';

        // Clear search results
        this.searchResults = null;
    }

    // Reset search button
    resetSearchButton() {
        const searchBtn = document.getElementById('searchBtn');
        searchBtn.disabled = false;
        searchBtn.innerHTML = '🔍 Tìm kiếm';
    }

    // Tìm kiếm nhanh
    quickSearch(query) {
        document.getElementById('locationSearch').value = query;
        this.searchLocation();
    }
}

// Global functions
function closeNoteModal() {
    app.closeNoteModal();
}

// Khởi tạo ứng dụng
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GeoNotes();
});

// Export function cho debugging
window.exportGeoNotes = () => app.exportNotes();