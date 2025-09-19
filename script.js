document.addEventListener('DOMContentLoaded', function() {

    const goldTypes = [
        { key: 'HAS_ALTIN', name: 'HAS ALTIN', defaultBuy: 0.995 , defaultSell: 1.005 },
        { key: 'GRAM_ALTIN', name: 'GRAM ALTIN', defaultBuy: 0.911, defaultSell: 0.940 },
        { key: '22_AYAR', name: '22 AYAR', defaultBuy: 0.911, defaultSell: 0.935 },
        { key: '18_AYAR', name: '18 AYAR', defaultBuy: 0.715, defaultSell: 0.760 },
        { key: '14_AYAR', name: '14 AYAR', defaultBuy: 0.560, defaultSell: 0.595 },
        { key: '8_AYAR', name: '8 AYAR', defaultBuy: 0.300, defaultSell: 0.343 },
        { key: 'CEYREK_ALTIN', name: 'ÇEYREK ALTIN', defaultBuy: 1.5960, defaultSell: 1.64 },
        { key: 'YARIM_ALTIN', name: 'YARIM ALTIN', defaultBuy: 3.202, defaultSell: 3.28 },
        { key: 'TAM_ALTIN', name: 'TAM ALTIN', defaultBuy: 6.405, defaultSell: 6.56 },
        { key: 'ATA_CEYREK', name: 'ATA ÇEYREK', defaultBuy: 1.66, defaultSell: 1.684 }, 
        { key: 'ATA_YARIM', name: 'ATA YARIM', defaultBuy: 3.325, defaultSell: 3.362 },
        { key: 'ATA_ALTIN', name: 'ATA ALTIN', defaultBuy: 6.65, defaultSell: 6.72 },
        { key: 'RESAT_ALTIN', name: 'REŞAT ALTIN', defaultBuy: 6.65, defaultSell: 6.75 },
        { key: 'IKIBUBUK_ALTIN', name: '2,5\'LUK ALTIN', defaultBuy: 15.97, defaultSell: 16.50 },
        { key: 'BESLI_ALTIN', name: '5\'Lİ ALTIN', defaultBuy: 33.00, defaultSell: 34.50 },
        
    ];

    // ... mevcut seçiciler
    const refreshIcon = document.getElementById('refresh-icon');

    // YENİ EKLENENLER
    const converterButton = document.getElementById('toggle-converter');
    const closeConverterButton = document.getElementById('close-converter');
    const converterOverlay = document.getElementById('converter-overlay');
    const quantityInput = document.getElementById('quantity-input');
    const goldSelect = document.getElementById('gold-select-dropdown');
    const calculatedSellPrice = document.getElementById('calculated-sell-price');
    const calculatedBuyPrice = document.getElementById('calculated-buy-price');
    const pricesGrid = document.getElementById('gold-prices-grid');
    const settingsGrid = document.getElementById('multiplier-settings-grid');
    const refreshTimerSpan = document.getElementById('refresh-timer');
    const manualRefreshButton = document.getElementById('manual-refresh');
    const saveMultipliersButton = document.getElementById('save-multipliers');
    const currentDateSpan = document.getElementById('current-date');
    const currentTimeSpan = document.getElementById('current-time');
    const settingsButton = document.getElementById('toggle-settings');
    const closeSettingsButton = document.getElementById('close-settings');
    const fullscreenButton = document.getElementById('toggle-fullscreen');
    const settingsOverlay = document.getElementById('settings-overlay');
    const lastUpdatedSpan = document.getElementById('last-updated');

    let previousPrices = {};
    let multipliers = {};
    let countdownSeconds = 30;
    let refreshInterval;

    // --- SİMÜLASYONLU FİYAT GETİRME FONKSİYONU ---
async function fetchGoldPrices() {
    // 1. Yükleme animasyonunu başlatalım
    refreshIcon.classList.add('spinning');
    if (!document.getElementById('gold-prices-list').innerHTML) {
        document.getElementById('gold-prices-list').innerHTML = '<p style="text-align:center; padding: 2rem;">Fiyatlar simüle ediliyor...</p>';
    }

    // 2. 1.5 saniyelik sahte bir ağ gecikmesi yaratalım
    setTimeout(() => {
        // 3. Rastgele ama gerçekçi temel fiyatlar üretelim
        // Gerçekçi bir temel fiyat belirleyelim (örneğin 2400 TL)
        const basePrice = 2400; 
        // Fiyatta küçük bir dalgalanma yaratmak için rastgele bir sayı ekleyelim (-20 ile +20 arası)
        const fluctuation = (Math.random() - 0.5) * 40; 
        
        const simulatedBuyPrice = basePrice + fluctuation;
        // Alış ve Satış arasında küçük bir fark olsun
        const simulatedSellPrice = simulatedBuyPrice + 15; 

        console.log(`Simüle Edilen Fiyatlar -> Alış: ${simulatedBuyPrice.toFixed(2)}, Satış: ${simulatedSellPrice.toFixed(2)}`);

        // 4. Mevcut render fonksiyonumuzu bu sahte verilerle çağıralım
        renderPrices(simulatedBuyPrice, simulatedSellPrice);

        // 5. Simülasyon bittiğinde arayüzü güncelleyelim
        lastUpdatedSpan.textContent = `Son Simülasyon: ${new Date().toLocaleTimeString('tr-TR')}`;
        startRefreshTimer(); // Geri sayımı yeniden başlat
        refreshIcon.classList.remove('spinning'); // Yükleme animasyonunu durdur

    }, 1500); // 1500 milisaniye = 1.5 saniye bekle
    // ... renderPrices fonksiyonunun sonu
        previousPrices = newPrices;

        // EĞER ÇEVİRİCİ AÇIKSA HESAPLAMAYI GÜNCELLE
        if(converterOverlay.classList.contains('visible')) {
            calculateConversion();
        }
    } // renderPrices fonksiyonunun kapanış parantezi
    
    // --- BU FONKSİYON GÜNCELLENDİ ---
    function renderPrices(baseBuy, baseSell) {
    const pricesList = document.getElementById('gold-prices-list');
    pricesList.innerHTML = '';
    const newPrices = {};

    goldTypes.forEach(gold => {
        const currentMultipliers = multipliers[gold.key];

        const rawBuy = baseBuy * currentMultipliers.buy;
        const rawSell = baseSell * currentMultipliers.sell;

        const roundedBuy = Math.ceil(rawBuy);
        const roundedSell = Math.ceil(rawSell);

        let displayBuy = roundedBuy === 0 ? '—' : `${roundedBuy.toLocaleString('tr-TR')}`;
        let displaySell = roundedSell === 0 ? '—' : `${roundedSell.toLocaleString('tr-TR')}`;

        let buyChangeIndicator = '';
        let sellChangeIndicator = '';

        if (roundedBuy !== 0 && Object.keys(previousPrices).length > 0) {
            const prevBuy = parseFloat(previousPrices[gold.key]?.buy);
            if (prevBuy < roundedBuy) buyChangeIndicator = '<span class="price-change-indicator price-up"><i class="fas fa-arrow-up"></i></span>';
            if (prevBuy > roundedBuy) buyChangeIndicator = '<span class="price-change-indicator price-down"><i class="fas fa-arrow-down"></i></span>';
        }
        if (roundedSell !== 0 && Object.keys(previousPrices).length > 0) {
            const prevSell = parseFloat(previousPrices[gold.key]?.sell);
            if (prevSell < roundedSell) sellChangeIndicator = '<span class="price-change-indicator price-up"><i class="fas fa-arrow-up"></i></span>';
            if (prevSell > roundedSell) sellChangeIndicator = '<span class="price-change-indicator price-down"><i class="fas fa-arrow-down"></i></span>';
        }
        
        // Yeni liste satırı HTML'i
        const itemHTML = `
            <div class="gold-list-item">
                <span class="col-birim">${gold.name}</span>
                <span class="col-alis">${displayBuy} ${buyChangeIndicator}</span>
                <span class="col-satis">${displaySell} ${sellChangeIndicator}</span>
            </div>
        `;
        pricesList.innerHTML += itemHTML;

        newPrices[gold.key] = { buy: roundedBuy.toFixed(2), sell: roundedSell.toFixed(2) };
    });

    previousPrices = newPrices;
}

    function initializeMultipliers() {
        const savedMultipliers = JSON.parse(localStorage.getItem('goldMultipliers'));
        if (savedMultipliers) multipliers = savedMultipliers;
        else {
            goldTypes.forEach(gold => {
                multipliers[gold.key] = { buy: gold.defaultBuy, sell: gold.defaultSell };
            });
        }
        renderMultiplierInputs();
    }

    function renderMultiplierInputs() {
        settingsGrid.innerHTML = '';
        goldTypes.forEach(gold => {
            const group = document.createElement('div');
            group.classList.add('multiplier-group');
            group.innerHTML = `<p class="multiplier-group-title">${gold.name}</p><div class="multiplier-inputs-container"><div class="multiplier-input-group"><label for="${gold.key}-buy">Alış Çarpanı</label><input id="${gold.key}-buy" type="number" step="0.001" data-key="${gold.key}" data-type="buy" value="${multipliers[gold.key].buy.toFixed(3)}"></div><div class="multiplier-input-group"><label for="${gold.key}-sell">Satış Çarpanı</label><input id="${gold.key}-sell" type="number" step="0.001" data-key="${gold.key}" data-type="sell" value="${multipliers[gold.key].sell.toFixed(3)}"></div></div>`;
            settingsGrid.appendChild(group);
        });
    }

    function saveMultipliers() {
        document.querySelectorAll('#multiplier-settings-grid input').forEach(input => {
            const key = input.dataset.key;
            const type = input.dataset.type;
            multipliers[key][type] = parseFloat(input.value) || 0;
        });
        localStorage.setItem('goldMultipliers', JSON.stringify(multipliers));
        alert('Çarpanlar kaydedildi!');
        settingsOverlay.classList.remove('visible');
        fetchGoldPrices();
    }

    function updateDateTime() {
        const now = new Date();
        const date = now.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
        const time = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        currentDateSpan.textContent = date;
        currentTimeSpan.textContent = time;
    }
    function startRefreshTimer() {
    clearInterval(refreshInterval);
    countdownSeconds = 30; // Bu satırı 60'tan 30'a değiştirin
    refreshTimerSpan.textContent = `Yenileme: ${countdownSeconds}s`;
    refreshInterval = setInterval(() => {
        countdownSeconds--;
        if (countdownSeconds >= 0) {
            refreshTimerSpan.textContent = `Yenileme: ${countdownSeconds}s`;
        } else {
            clearInterval(refreshInterval);
            fetchGoldPrices();
        }
    }, 1000);
}
    
    settingsButton.addEventListener('click', () => {
        renderMultiplierInputs();
        settingsOverlay.classList.add('visible');
    });
    
    closeSettingsButton.addEventListener('click',()=>settingsOverlay.classList.remove("visible"));
    settingsOverlay.addEventListener('click',function(e){if(e.target===settingsOverlay)settingsOverlay.classList.remove("visible")});
    fullscreenButton.addEventListener('click',()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen();else if(document.exitFullscreen)document.exitFullscreen()});
    document.addEventListener('fullscreenchange',()=>{const e=fullscreenButton.querySelector("i");if(document.fullscreenElement){e.classList.remove("fa-expand"),e.classList.add("fa-compress"),fullscreenButton.title="Tam Ekrandan Çık"}else{e.classList.remove("fa-compress"),e.classList.add("fa-expand"),fullscreenButton.title="Tam Ekran"}});
    saveMultipliersButton.addEventListener('click',saveMultipliers);
    manualRefreshButton.addEventListener('click',()=>{clearInterval(refreshInterval),refreshTimerSpan.textContent="Yenileniyor...",fetchGoldPrices()});

    initializeMultipliers();
    fetchGoldPrices();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    // --- ÇEVİRİCİ FONKSİYONELLİĞİ ---

    // 1. Dropdown menüsünü goldTypes dizisindeki verilerle doldur
    function populateConverterDropdown() {
        goldTypes.forEach(gold => {
            const option = document.createElement('option');
            option.value = gold.key;
            option.textContent = gold.name;
            goldSelect.appendChild(option);
        });
    }

    // 2. Hesaplama fonksiyonu
    function calculateConversion() {
        const quantity = parseFloat(quantityInput.value) || 0;
        const selectedGoldKey = goldSelect.value;

        // Fiyatları en güncel 'previousPrices' objesinden al
        if (previousPrices[selectedGoldKey]) {
            const buyPrice = parseFloat(previousPrices[selectedGoldKey].buy);
            const sellPrice = parseFloat(previousPrices[selectedGoldKey].sell);

            const totalBuy = quantity * buyPrice;
            const totalSell = quantity * sellPrice;

            calculatedBuyPrice.textContent = `${totalBuy.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TRY`;
            calculatedSellPrice.textContent = `${totalSell.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TRY`;
        } else {
             calculatedBuyPrice.textContent = '---';
             calculatedSellPrice.textContent = '---';
        }
    }

    // 3. Paneli açma/kapama olayları
    converterButton.addEventListener('click', () => {
        calculateConversion(); // Paneli açarken ilk hesaplamayı yap
        converterOverlay.classList.add('visible');
    });

    closeConverterButton.addEventListener('click', () => converterOverlay.classList.remove('visible'));
    converterOverlay.addEventListener('click', (e) => {
        if (e.target === converterOverlay) {
            converterOverlay.classList.remove('visible');
        }
    });

    // 4. Miktar veya birim değiştiğinde hesaplamayı yeniden yap
    quantityInput.addEventListener('input', calculateConversion);
    goldSelect.addEventListener('change', calculateConversion);

    // Dropdown'ı sayfa yüklendiğinde doldur
    populateConverterDropdown();
});