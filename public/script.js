// Inisialisasi peta
const map = L.map('map').setView([-6.8498, 107.4338], 11);

// Tambahkan layer peta
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Simpan markers dalam variabel global untuk dapat dihapus nanti
let currentMarkers = [];

// Fungsi untuk menghapus semua marker yang ada di peta
const clearAllMarkers = () => {
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];
};

// Fungsi untuk menghitung titik akhir berdasarkan azimuth
const calculateEndPoint = (lat, lng, azimuth, distance) => {
    try {
        const latRad = lat * (Math.PI / 180);
        const lngRad = lng * (Math.PI / 180);
        const azimuthRad = (azimuth * Math.PI) / 180;
        
        const distanceKm = distance / 1000;
        const R = 6371;

        const endLatRad = Math.asin(
            Math.sin(latRad) * Math.cos(distanceKm/R) + 
            Math.cos(latRad) * Math.sin(distanceKm/R) * Math.cos(azimuthRad)
        );

        const endLngRad = lngRad + Math.atan2(
            Math.sin(azimuthRad) * Math.sin(distanceKm/R) * Math.cos(latRad),
            Math.cos(distanceKm/R) - Math.sin(latRad) * Math.sin(endLatRad)
        );

        const endLat = endLatRad * (180 / Math.PI);
        const endLng = endLngRad * (180 / Math.PI);

        return [endLat, endLng];
    } catch (error) {
        console.error('Error in calculateEndPoint:', error);
        return [lat, lng];
    }
};

// Fungsi untuk mengambil dan menampilkan data tower berdasarkan site_id
const fetchAndDisplayTower = async (siteId) => {
    try {
        // Bersihkan marker yang ada
        clearAllMarkers();

        // Jika tidak ada site_id yang dipilih, return tanpa melakukan apa-apa
        if (!siteId) return;

        const infoResponse = await fetch(`http://localhost:3000/api/tower/${siteId}`);
        const infoData = await infoResponse.json();

        const azimuthResponse = await fetch(`http://localhost:3000/api/tower/azimuth/${siteId}`);
        const azimuthData = await azimuthResponse.json();

        const towerResponse = await fetch(`http://localhost:3000/api/towers`);
        const towers = await towerResponse.json();
        const tower = towers.find(t => t.site_id === siteId);

        if (!tower) return;

        const formatValue = (value) => {
            if (value === null || value === 'NULL' || value === undefined) {
                return '-';
            }
            return value;
        };

        const colors = [
            'rgb(255, 65, 54)',
            'rgb(0, 116, 217)',
            'rgb(46, 204, 64)'
        ];

        // Buat dot marker untuk tower
        const dotIcon = L.divIcon({
            className: 'dot-icon',
            html: `<div style="
                width: 10px;
                height: 10px;
                background-color: #000;
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 0 2px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5]
        });

        const marker = L.marker([tower.latitude, tower.longitude], { 
            icon: dotIcon,
            zIndexOffset: 1000 
        }).addTo(map);
        currentMarkers.push(marker);

        // Tambahkan azimuth markers
        if (Array.isArray(azimuthData)) {
            azimuthData.forEach((azInfo, index) => {
                if (!azInfo || typeof azInfo.azimuth !== 'number') return;

                const azimuth = azInfo.azimuth;
                const color = colors[index % colors.length];

                // Buat segitiga untuk azimuth yang mengikuti zoom level dengan satu warna
                const createTriangleIcon = (azimuth, zoomLevel) => {
                    // Sesuaikan ukuran berdasarkan zoom level
                    const baseSize = Math.max(10, Math.min(40, zoomLevel * 2));
                    const height = baseSize * 1.5;
                    
                    // Gunakan satu warna dengan opacity yang lebih tinggi
                    const color = 'rgb(0, 116, 217)'; // Biru
                    const fillColor = color.replace(')', ', 0.5)').replace('rgb', 'rgba'); // Opacity 0.5
                    
                    return L.divIcon({
                        className: 'triangle-icon',
                        html: `<svg width="${baseSize}" height="${height}" viewBox="0 0 40 60" 
                            style="transform: rotate(${azimuth - 90}deg); transform-origin: 50% 0;">
                            <path d="M20,0 L40,60 L0,60 Z" 
                                fill="${fillColor}"
                                stroke="${color}"
                                stroke-width="3"
                                style="cursor: pointer;"
                            />
                        </svg>`,
                        iconSize: [baseSize, height],
                        iconAnchor: [baseSize/2, 0],
                        popupAnchor: [0, height/2]
                    });
                };

                // Buat marker dengan ukuran awal
                const triangleMarker = L.marker([tower.latitude, tower.longitude], {
                    icon: createTriangleIcon(azimuth, map.getZoom()),
                    interactive: true,
                    zIndexOffset: 900
                }).addTo(map);

                // Update ukuran segitiga setiap kali zoom berubah
                map.on('zoomend', function() {
                    const currentZoom = map.getZoom();
                    triangleMarker.setIcon(createTriangleIcon(azimuth, currentZoom));
                });
                // Popup content
                const sectorId = `${siteId}-${index + 1}`;
                const popupContent = `
                    <div style="min-width: 250px; padding: 10px;">
                        <h3 style="margin: 0 0 10px 0; color: ${color};">Tower ${siteId}</h3>
                        <p style="margin: 5px 0;"><b>Sector:</b> ${sectorId}</p>
                        <p style="margin: 5px 0;"><b>Azimuth:</b> ${azimuth}°</p>
                        <p style="margin: 5px 0;"><b>Antena:</b> ${formatValue(infoData.jumlah_antenna)}</p>
                        <hr style="margin: 10px 0;">
                        <h4 style="margin: 5px 0;">Antenna Type</h4>
                        <p style="margin: 5px 0;"><b>L900:</b> ${formatValue(infoData.l900)}</p>
                        <p style="margin: 5px 0;"><b>L1800:</b> ${formatValue(infoData.l1800)}</p>
                        <p style="margin: 5px 0;"><b>L2100:</b> ${formatValue(infoData.l2100)}</p>
                        <p style="margin: 5px 0;"><b>L2300:</b> ${formatValue(infoData.l2300)}</p>
                        <hr style="margin: 10px 0;">
                        <h4 style="margin: 5px 0;">Power (dBm)</h4>
                        <p style="margin: 5px 0;"><b>L900:</b> ${formatValue(infoData.l900_power)}</p>
                        <p style="margin: 5px 0;"><b>L1800:</b> ${formatValue(infoData.l1800_power)}</p>
                        <p style="margin: 5px 0;"><b>L2100:</b> ${formatValue(infoData.l2100_power)}</p>
                        <p style="margin: 5px 0;"><b>L2300:</b> ${formatValue(infoData.l2300_power)}</p>
                    </div>
                `;

                triangleMarker.bindPopup(popupContent);
                currentMarkers.push(triangleMarker);
            });
        }

        // Pindahkan view ke tower yang dipilih
        map.setView([tower.latitude, tower.longitude], 15);

    } catch (error) {
        console.error('Error fetching tower data:', error);
    }
};

// Tambahkan fungsi untuk pencarian
const searchInput = document.getElementById('searchInput');
const dropdownContent = document.getElementById('dropdownContent');
let siteOptions = []; // Array untuk menyimpan semua opsi site

// Fungsi untuk memuat data site
function loadSiteOptions(data) {
    siteOptions = data;
    updateDropdownContent(siteOptions);
}

// Fungsi untuk memperbarui konten dropdown
function updateDropdownContent(filteredOptions) {
    dropdownContent.innerHTML = '';
    
    if (filteredOptions.length === 0) {
        dropdownContent.innerHTML = '<div class="no-results">Tidak ada hasil yang ditemukan</div>';
        return;
    }

    filteredOptions.forEach(site => {
        const div = document.createElement('div');
        div.textContent = site.id;
        div.onclick = () => {
            siteSelect.value = site.id;
            dropdownContent.classList.remove('show');
            // Trigger change event pada select
            const event = new Event('change');
            siteSelect.dispatchEvent(event);
        };
        dropdownContent.appendChild(div);
    });
}

// Event listener untuk pencarian
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSites = siteOptions.filter(site => 
        site.id.toLowerCase().includes(searchTerm)
    );
    updateDropdownContent(filteredSites);
    dropdownContent.classList.add('show');
});

// Tutup dropdown saat klik di luar
document.addEventListener('click', (e) => {
    if (!dropdownContent.contains(e.target) && e.target !== searchInput) {
        dropdownContent.classList.remove('show');
    }
});

// Tampilkan dropdown saat focus pada input pencarian
searchInput.addEventListener('focus', () => {
    updateDropdownContent(siteOptions);
    dropdownContent.classList.add('show');
});

// Fungsi untuk membuat dropdown menu
const createSiteDropdown = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/towers');
        const towers = await response.json();
        
        const siteIds = [...new Set(towers.map(tower => tower.site_id))].sort();
        const select = document.getElementById('siteSelect');
        
        siteIds.forEach(siteId => {
            const option = document.createElement('option');
            option.value = siteId;
            option.textContent = siteId;
            select.appendChild(option);
        });

        // Event listener untuk dropdown
        select.addEventListener('change', (e) => {
            const selectedSiteId = e.target.value;
            fetchAndDisplayTower(selectedSiteId);
        });

    } catch (error) {
        console.error('Error creating site dropdown:', error);
    }
};

// Panggil fungsi untuk membuat dropdown setelah peta dimuat
createSiteDropdown();