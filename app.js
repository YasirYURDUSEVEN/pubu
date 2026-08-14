/* =========================================
   PUBU — Maker Challenge Generator
   Global Durum ve Değişkenler
   (Uygulamanın hafızasını burada tutuyoruz)
========================================= */
let database = [];      // JSON'dan gelen tüm parçalar
let mcuList = [];       // İşlemci listesi (Arduino vb.)
let difficulties = [];  // Zorluk seviyeleri
let currentChallenge = null; // Şu an üretilen görevi tutar (Kopyalama/Kaydetme için)

// DOM Elementleri (HTML'deki elemanları JS'ye bağlıyoruz)
const mcuSelect = document.getElementById('mcuSelect');
const diffSelect = document.getElementById('diffSelect');
const compSlider = document.getElementById('compCount');
const compVal = document.getElementById('compCountVal');
const generateBtn = document.getElementById('generateBtn');
const resultArea = document.getElementById('resultArea');
const componentsList = document.getElementById('componentsList');
const copyBtn = document.getElementById('copyBtn');
const poolInfo = document.getElementById('poolInfo');

// Favoriler Sistemi İçin DOM Elementleri
const addFavBtn = document.getElementById('addFavBtn');
const viewFavsBtn = document.getElementById('viewFavsBtn');
const favModal = document.getElementById('favModal');
const closeFavsBtn = document.getElementById('closeFavsBtn');
const favList = document.getElementById('favList');

/* =========================================
   VERİ YÜKLEME VE ENVANTER OLUŞTURMA
   (Sayfa açıldığında JSON'u okur ve arayüzü çizer)
========================================= */
async function loadData() {
    try {
        // Yükleme başladığında butonu kilitliyoruz
        generateBtn.textContent = 'Veriler Yükleniyor... ⏳';
        generateBtn.disabled = true;

        // JSON dosyasını çek
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP hatası! Durum: ${response.status}`);

        const data = await response.json();
        database = data.database;
        mcuList = data.mcuList;
        difficulties = data.difficulties;

        // Arayüzü gelen verilerle doldur
        initSelects();
        buildInventoryUI(); 
        updatePoolInfo();

        // Her şey hazır, butonu aktif et
        generateBtn.textContent = '🚀 Yeni Meydan Okuma Üret';
        generateBtn.disabled = false;
    } catch (error) {
        console.error('Veri çekme hatası:', error);
        generateBtn.textContent = 'Hata! Veriler Yüklenemedi ❌';
    }
}

// Dropdown (Select) menülerini doldurur
function initSelects() {
    mcuSelect.innerHTML = `<option value="random">🎲 Rastgele Yapay Zeka Seçsin</option>`;
    mcuList.forEach(mcu => mcuSelect.innerHTML += `<option value="${mcu}">${mcu}</option>`);

    diffSelect.innerHTML = `<option value="random">🎲 Rastgele Zorluk</option>`;
    difficulties.forEach(d => {
        diffSelect.innerHTML += `<option value="${d.id}">${d.id} · Seviye ${d.level} (${d.desc})</option>`;
    });
}

// Envanterdeki checkbox'ları çizer
function buildInventoryUI() {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';
    database.forEach(comp => {
        const lbl = document.createElement('label');
        lbl.className = 'checkbox-label';
        // Varsayılan olarak tüm parçalar "seçili" gelir
        lbl.innerHTML = `<input type="checkbox" class="inv-checkbox" value="${comp.name}" checked> ${comp.name}`;
        grid.appendChild(lbl);
    });
}

// Tümünü Seç / Tümünü Kaldır Butonu İşlevi
document.getElementById('toggleInventoryBtn').addEventListener('click', (e) => {
    const checkboxes = document.querySelectorAll('.inv-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
    e.target.textContent = allChecked ? 'Tümünü Seç' : 'Tümünü Kaldır';
});

// Yardımcı Fonksiyon: Diziden rastgele eleman seçer
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Belirli bir seviyeye kadar olan parçaları filtreler
function getPoolForLevel(level) {
    return database.filter(c => c.level <= level);
}

// Seçilen zorluğu tespit eder (Eğer rastgele seçildiyse random birini atar)
function resolveSelectedDifficulty() {
    if (diffSelect.value === 'random') return getRandomItem(difficulties);
    return difficulties.find(d => d.id === diffSelect.value);
}

// Havuzda kaç parça kaldığını gösteren bilgi metnini günceller
function updatePoolInfo() {
    if (!poolInfo || difficulties.length === 0) return;
    let diffForPreview = (diffSelect.value === 'random') ? difficulties[difficulties.length - 1] : difficulties.find(d => d.id === diffSelect.value);
    
    const pool = getPoolForLevel(diffForPreview.level);
    poolInfo.textContent = `🔓 "${diffForPreview.id}" seviyesi için havuzda ${pool.length} bileşen eşleşiyor.`;
}

// Arayüz değişikliklerini dinleyen event listener'lar
diffSelect.addEventListener('change', updatePoolInfo);
compSlider.addEventListener('input', (e) => compVal.textContent = e.target.value);

// Proje üretirkenki "Suni" bekleme ve kelime değiştirme efekti
function simulateLoading(callback) {
    resultArea.classList.remove('hidden');
    addFavBtn.classList.remove('saved');
    addFavBtn.innerHTML = '⭐ Favorilere Ekle';
    addFavBtn.disabled = false;

    componentsList.innerHTML = '';
    document.getElementById('extraPartsContainer').classList.add('hidden');
    
    let iterations = 0;
    const interval = setInterval(() => {
        // Hızlıca rastgele MCU isimleri göstererek havalı bir efekt yaratır
        if (mcuList.length > 0) document.getElementById('selectedMCU').textContent = getRandomItem(mcuList);
        document.getElementById('diffBadge').textContent = 'Analiz ediliyor...';

        iterations++;
        if (iterations > 15) { // 15 kere döndükten sonra bitir
            clearInterval(interval);
            callback(); // Asıl üretme fonksiyonunu çağır
        }
    }, 50);
}

/* =========================================
   GÖREV ÜRETİMİ (Algoritma Merkezi)
========================================= */
function generateChallenge() {
    if (database.length === 0) return;

    // Zorluk ve işlemciyi belirle
    const finalMCU = (mcuSelect.value === 'random') ? getRandomItem(mcuList) : mcuSelect.value;
    const finalDiffObj = resolveSelectedDifficulty();
    const levelPool = getPoolForLevel(finalDiffObj.level);

    // Kullanıcının envanterde işaretlediği (sahip olduğu) parçalar
    const checkedNames = Array.from(document.querySelectorAll('.inv-checkbox:checked')).map(cb => cb.value);
    
    // İşaretli olanlar (Zorunlu) ve Olmayanlar (Ekstra Öneri) olarak ayır
    const ownedPool = levelPool.filter(c => checkedNames.includes(c.name));
    const unownedPool = levelPool.filter(c => !checkedNames.includes(c.name));

    const requestedCount = parseInt(compSlider.value, 10);
    const count = Math.min(requestedCount, ownedPool.length); 

    // Eğer elinde parça yoksa uyar
    if (count === 0) {
        document.getElementById('selectedMCU').textContent = finalMCU;
        document.getElementById('promptText').innerHTML = `<span style="color:var(--accent-red)">⚠️ Envanterinde bu zorluk seviyesiyle eşleşen işaretli parça yok.</span>`;
        return;
    }

    // Sahip olunanlardan rastgele seç
    const shuffledOwned = [...ownedPool].sort(() => 0.5 - Math.random());
    const selectedComps = shuffledOwned.slice(0, count);

    // Sahip olunmayanlardan rastgele 2 tane ekstra öner
    const extraCount = Math.min(2, unownedPool.length);
    const extraComps = [...unownedPool].sort(() => 0.5 - Math.random()).slice(0, extraCount);

    // Arayüzü güncelle
    document.getElementById('selectedMCU').textContent = finalMCU;
    const badge = document.getElementById('diffBadge');
    badge.textContent = `Zorluk: ${finalDiffObj.id} (Seviye ${finalDiffObj.level})`;
    badge.className = `badge difficulty-${finalDiffObj.id.toLowerCase()}`;

    // Seçilen bileşenleri listeye ekle
    componentsList.innerHTML = '';
    selectedComps.forEach((comp, index) => {
        const card = document.createElement('div');
        card.className = 'component-item comp-anim';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `<span class="comp-type">${comp.category} · Sv.${comp.level}</span><span class="comp-name">${comp.name}</span>`;
        componentsList.appendChild(card);
    });

    // Ekstra (önerilen) bileşenleri listeye ekle
    const extraContainer = document.getElementById('extraPartsContainer');
    const extraList = document.getElementById('extraComponentsList');
    extraList.innerHTML = '';
    
    if (extraComps.length > 0) {
        extraComps.forEach((comp, index) => {
            const card = document.createElement('div');
            card.className = 'component-item comp-anim';
            card.style.animationDelay = `${index * 0.1}s`;
            card.style.borderColor = 'var(--accent-cyan)';
            card.innerHTML = `<span class="comp-type" style="background:rgba(57,211,83,0.1)">${comp.category}</span><span class="comp-name">${comp.name}</span>`;
            extraList.appendChild(card);
        });
        extraContainer.classList.remove('hidden');
    }

    // Yapay zeka prompt metnini oluştur
    const compNames = selectedComps.map(c => c.name).join(', ');
    document.getElementById('promptText').innerHTML = `
        🎯 <strong>Görevin:</strong> <strong>${finalMCU}</strong> mimarisini ve <strong>${compNames}</strong> donanımlarını entegre ederek, <strong>${finalDiffObj.id} seviyesine uygun</strong> bir sistem tasarla.
    `;

    // Mevcut görevi objeye kaydet (Favorilere eklerken kullanacağız)
    currentChallenge = {
        id: Date.now().toString(),
        mcu: finalMCU,
        diffId: finalDiffObj.id,
        diffLevel: finalDiffObj.level,
        components: selectedComps.map(c => c.name),
        date: new Date().toLocaleDateString('tr-TR')
    };

    resetTimer(); 
}

// Ana Üret butonuna tıklandığında
generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.7';
    simulateLoading(() => {
        generateChallenge();
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
    });
});

// Görevi Kopyalama Butonu
copyBtn.addEventListener('click', () => {
    if (!currentChallenge) return;
    const comps = currentChallenge.components.map(c => `- ${c}`).join('\n');
    const text = `🚀 PUBU MAKER CHALLENGE\nZorluk: ${currentChallenge.diffId} (Seviye ${currentChallenge.diffLevel})\nSistem Beyni: ${currentChallenge.mcu}\n\nDonanımlar:\n${comps}\n\nProje Fikrim: [Buraya yaz...]`;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✅ Kopyalandı!';
        setTimeout(() => copyBtn.innerHTML = originalText, 2000);
    });
});

/* =========================================
   ZAMANLAYICI (TIMER) SİSTEMİ
========================================= */
let timerInterval;
let timeRemaining = 0;
let isTimerRunning = false;

const timerInput = document.getElementById('timerInput');
const minutesUnit = document.getElementById('minutesUnit');
const secondsUnit = document.getElementById('secondsUnit');

// Timer'ın ekrandaki yazılarını günceller (Flip-Flop stili)
function updateTimerUI() {
    const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const seconds = (timeRemaining % 60).toString().padStart(2, '0');
    minutesUnit.textContent = minutes;
    secondsUnit.textContent = seconds;
}

// Kullanıcı dakika inputunu değiştirdiğinde süreyi ayarla
timerInput.addEventListener('input', () => {
    if (!isTimerRunning) {
        let inputVal = parseInt(timerInput.value, 10);
        if (isNaN(inputVal) || inputVal < 1) inputVal = 1;
        timeRemaining = inputVal * 60;
        updateTimerUI();
    }
});

// Zamanlayıcı Başlat
document.getElementById('startTimerBtn').addEventListener('click', () => {
    if (isTimerRunning) return;
    
    if (timeRemaining <= 0) {
        let inputVal = parseInt(timerInput.value, 10);
        if (isNaN(inputVal) || inputVal < 1) inputVal = 30;
        timeRemaining = inputVal * 60;
    }

    isTimerRunning = true;
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerUI();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            alert("⏰ Süre doldu! Projeni tamamlayabildin mi?");
        }
    }, 1000);
});

// Zamanlayıcı Durdur
document.getElementById('pauseTimerBtn').addEventListener('click', () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
});

// Zamanlayıcı Sıfırla
function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    let inputVal = parseInt(timerInput.value, 10) || 30;
    timeRemaining = inputVal * 60;
    updateTimerUI();
}
document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);

/* =========================================
   EMAILJS & GÜVENLİK (HONEYPOT) & ANİMASYON
========================================= */
document.getElementById('pubu-contact-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    
    // DOM'daki elementleri al
    const submitBtn = document.getElementById('submitBtn');
    const statusMsg = document.getElementById('formStatus');
    const honeypot = document.getElementById('pubu-bot-trap').value; // Bot tuzağındaki değeri oku

    // 1. HONEYPOT KONTROLÜ (GÜVENLİK)
    // Gerçek bir insan bu alanı görmez, dolayısıyla değeri hep "" (boşluk) olur.
    // Eğer bot burayı doldurduysa işlem iptal edilir.
    if (honeypot !== "") {
        console.warn("Honeypot tetiklendi: Bot aktivitesi engellendi.");
        // Bota "başarılı" olmuş gibi davranıp onu kandırıyoruz ki zorlamaya devam etmesin.
        this.reset();
        return; 
    }

    // 2. YÜKLENİYOR DURUMU (UX/ANİMASYON)
    // Buton gri olur ve tıklanamaz hale gelir.
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Gönderiliyor... ⏳';
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;

    // Durum mesajını temizle
    statusMsg.classList.remove('hidden', 'text-success', 'text-error');
    statusMsg.textContent = "";

    // 3. MAİL GÖNDERİMİ (EMAILJS)
    emailjs.sendForm('service_esvi3kl', 'template_3krb2et', this)
        .then(() => {
            // BAŞARI DURUMU
            submitBtn.classList.remove('btn-loading');
            submitBtn.classList.add('btn-success'); // Buton yeşil olur
            submitBtn.innerHTML = '✅ İletildi!';
            
            this.reset(); // Formun içini temizle

            // 3 Saniye sonra butonu eski haline getir
            setTimeout(() => {
                submitBtn.classList.remove('btn-success');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }, 3000);

        }, (error) => {
            // HATA DURUMU
            submitBtn.classList.remove('btn-loading');
            submitBtn.innerHTML = originalBtnText; // Butonu eski haline çevir
            submitBtn.disabled = false;

            statusMsg.textContent = "❌ Gönderim hatası oluştu. Lütfen tekrar dene.";
            statusMsg.classList.add('text-error');
            console.error("EmailJS Error: ", error);
        });
});

/* =========================================
   FAVORİLER (LOCAL STORAGE) İŞLEMLERİ
========================================= */
// Tarayıcı hafızasındaki favorileri çeker
function getFavorites() {
    return JSON.parse(localStorage.getItem('pubu_favorites')) || [];
}

// Ekranda üretilen güncel görevi favorilere kaydeder
addFavBtn.addEventListener('click', () => {
    if (!currentChallenge) return;
    const favs = getFavorites();
    favs.push(currentChallenge);
    localStorage.setItem('pubu_favorites', JSON.stringify(favs));
    
    // Butonu pasif/yeşil hale getir
    addFavBtn.innerHTML = '✅ Kaydedildi';
    addFavBtn.classList.add('saved');
});

// Modalı (Popup) Aç
viewFavsBtn.addEventListener('click', () => {
    renderFavorites(); // Listeyi güncelle
    favModal.classList.remove('hidden'); // Modalı göster
});

// Modalı Kapat
closeFavsBtn.addEventListener('click', () => favModal.classList.add('hidden'));

// Favori Silme (HTML içinden onclick ile çağırıldığı için window objesine bağlandı)
window.deleteFav = function (id) {
    let favs = getFavorites();
    favs = favs.filter(f => f.id !== id); // Tıklanan ID dışındakileri tut
    localStorage.setItem('pubu_favorites', JSON.stringify(favs));
    renderFavorites(); // Listeyi tekrar çiz
};

// Favorileri ekrana basma fonksiyonu
function renderFavorites() {
    const favs = getFavorites();
    favList.innerHTML = '';
    
    // Eğer favori yoksa boş mesajı göster
    if (favs.length === 0) {
        favList.innerHTML = '<p class="empty-msg">Henüz kaydedilmiş bir projen yok.</p>';
        return;
    }

    // Listeyi tersten (en yeni en üstte) yazdırır
    favs.slice().reverse().forEach(fav => {
        const card = document.createElement('div');
        card.className = 'fav-card';
        const levelTxt = fav.diffLevel ? ` · Sv.${fav.diffLevel}` : '';
        
        card.innerHTML = `
            <button class="btn-delete-fav" onclick="deleteFav('${fav.id}')">Sil</button>
            <span class="fav-diff difficulty-${fav.diffId.toLowerCase()}" style="border:1px solid currentColor; color:currentColor;">${fav.diffId}${levelTxt}</span>
            <span style="color:var(--text-sub); font-size:0.75rem; margin-left:10px;">${fav.date}</span>
            <h4>🧠 ${fav.mcu}</h4>
            <p><strong>Bileşenler:</strong> ${fav.components.join(', ')}</p>
        `;
        favList.appendChild(card);
    });
}

// Sayfa ilk yüklendiğinde verileri çekme işlemini başlat
document.addEventListener('DOMContentLoaded', loadData);