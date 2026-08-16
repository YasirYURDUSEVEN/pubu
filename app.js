/* =========================================
   PUBU — Maker Challenge Generator
   Global Durum ve Değişkenler
========================================= */
let database = [];      
let mcuList = [];       
let difficulties = [];  
let currentChallenge = null; 

// DOM Elementleri
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
========================================= */
function getCustomComponents() {
    return JSON.parse(localStorage.getItem('pubu_custom_components')) || [];
}

async function loadData() {
    try {
        generateBtn.textContent = 'Veriler Yükleniyor... ⏳';
        generateBtn.disabled = true;

        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP hatası! Durum: ${response.status}`);

        const data = await response.json();
        
        const customParts = getCustomComponents();
        database = [...data.database, ...customParts]; 
        
        mcuList = data.mcuList;
        difficulties = data.difficulties;

        initSelects();
        buildInventoryUI(); 
        updatePoolInfo();

        generateBtn.textContent = '🚀 Yeni Meydan Okuma Üret';
        generateBtn.disabled = false;
    } catch (error) {
        console.error('Veri çekme hatası:', error);
        generateBtn.textContent = 'Hata! Veriler Yüklenemedi ❌';
    }
}

function initSelects() {
    mcuSelect.innerHTML = `<option value="random">🎲 Rastgele Yapay Zeka Seçsin</option>`;
    mcuList.forEach(mcu => mcuSelect.innerHTML += `<option value="${mcu}">${mcu}</option>`);

    diffSelect.innerHTML = `<option value="random">🎲 Rastgele Zorluk</option>`;
    difficulties.forEach(d => {
        diffSelect.innerHTML += `<option value="${d.id}">${d.id} · Seviye ${d.level} (${d.desc})</option>`;
    });
}

function buildInventoryUI() {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';
    database.forEach(comp => {
        const lbl = document.createElement('label');
        lbl.className = 'checkbox-label';
        const isCustom = comp.category === "Özel Parça" ? " 🛠️" : "";
        lbl.innerHTML = `<input type="checkbox" class="inv-checkbox" value="${comp.name}" checked> ${comp.name}${isCustom}`;
        grid.appendChild(lbl);
    });
}

document.getElementById('toggleInventoryBtn').addEventListener('click', (e) => {
    const checkboxes = document.querySelectorAll('.inv-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
    e.target.textContent = allChecked ? 'Tümünü Seç' : 'Tümünü Kaldır';
});

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

function getPoolForLevel(level) {
    return database.filter(c => c.level <= level);
}

function resolveSelectedDifficulty() {
    if (diffSelect.value === 'random') return getRandomItem(difficulties);
    return difficulties.find(d => d.id === diffSelect.value);
}

function updatePoolInfo() {
    if (!poolInfo || difficulties.length === 0) return;
    let diffForPreview = (diffSelect.value === 'random') ? difficulties[difficulties.length - 1] : difficulties.find(d => d.id === diffSelect.value);
    
    const pool = getPoolForLevel(diffForPreview.level);
    poolInfo.textContent = `🔓 "${diffForPreview.id}" seviyesi için havuzda ${pool.length} bileşen eşleşiyor.`;
}

diffSelect.addEventListener('change', updatePoolInfo);
compSlider.addEventListener('input', (e) => {
    compVal.textContent = e.target.value;
    compSlider.style.setProperty('--val', e.target.value);
});
compSlider.style.setProperty('--val', compSlider.value);

function simulateLoading(callback) {
    resultArea.classList.remove('hidden');
    addFavBtn.classList.remove('saved');
    addFavBtn.innerHTML = '⭐ Favorilere Ekle';
    addFavBtn.disabled = false;

    componentsList.innerHTML = '';
    document.getElementById('extraPartsContainer').classList.add('hidden');
    
    let iterations = 0;
    const interval = setInterval(() => {
        if (mcuList.length > 0) document.getElementById('selectedMCU').textContent = getRandomItem(mcuList);
        document.getElementById('diffBadge').textContent = 'Analiz ediliyor...';

        iterations++;
        if (iterations > 15) { 
            clearInterval(interval);
            callback(); 
        }
    }, 50);
}

/* =========================================
   ÖZEL PARÇA EKLEME SİSTEMİ
========================================= */
document.getElementById('addCustomPartBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('customPartName');
    const levelInput = document.getElementById('customPartLevel');
    
    const partName = nameInput.value.trim();
    const partLevel = parseInt(levelInput.value, 10);

    if (!partName) {
        alert("Lütfen geçerli bir parça adı girin.");
        return;
    }

    if (database.some(comp => comp.name.toLowerCase() === partName.toLowerCase())) {
        alert("Bu parça zaten envanterinizde mevcut!");
        return;
    }

    const newComponent = { name: partName, category: "Özel Parça", level: partLevel };

    const customParts = getCustomComponents();
    customParts.push(newComponent);
    localStorage.setItem('pubu_custom_components', JSON.stringify(customParts));

    database.push(newComponent);

    buildInventoryUI();
    updatePoolInfo();

    // Formdan eklenen parçanın envanter listesindeki karşılığını kısaca vurgula ve göster
    const grid = document.getElementById('inventoryGrid');
    const addedLabel = Array.from(grid.querySelectorAll('.inv-checkbox'))
        .find(cb => cb.value === partName)?.closest('.checkbox-label');
    if (addedLabel) {
        addedLabel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        addedLabel.classList.add('newly-added');
        setTimeout(() => addedLabel.classList.remove('newly-added'), 1600);
    }

    nameInput.value = '';
    const btn = document.getElementById('addCustomPartBtn');
    const originalText = btn.innerHTML;
    const originalBg = btn.style.background;
    
    btn.innerHTML = '✅ Eklendi!';
    btn.style.background = 'var(--accent-cyan)';
    btn.style.color = '#05070a'; 
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = originalBg;
        btn.style.color = '';
    }, 1500);
});

/* =========================================
   GÖREV ÜRETİMİ
========================================= */
function generateChallenge() {
    if (database.length === 0) return;

    const finalMCU = (mcuSelect.value === 'random') ? getRandomItem(mcuList) : mcuSelect.value;
    const finalDiffObj = resolveSelectedDifficulty();
    const levelPool = getPoolForLevel(finalDiffObj.level);

    const checkedNames = Array.from(document.querySelectorAll('.inv-checkbox:checked')).map(cb => cb.value);
    
    const ownedPool = levelPool.filter(c => checkedNames.includes(c.name));

    const requestedCount = parseInt(compSlider.value, 10);
    const count = Math.min(requestedCount, ownedPool.length); 

    if (count === 0) {
        document.getElementById('selectedMCU').textContent = finalMCU;
        document.getElementById('promptText').innerHTML = `<span style="color:var(--accent-red)">⚠️ Envanterinde bu zorluk seviyesiyle eşleşen işaretli parça yok.</span>`;
        return;
    }

    const shuffledOwned = [...ownedPool].sort(() => 0.5 - Math.random());
    const selectedComps = shuffledOwned.slice(0, count);

    const remainingPoolForExtra = levelPool.filter(c => !selectedComps.some(sc => sc.name === c.name));
    
    const extraCount = Math.min(2, remainingPoolForExtra.length);
    const extraComps = [...remainingPoolForExtra].sort(() => 0.5 - Math.random()).slice(0, extraCount);

    document.getElementById('selectedMCU').textContent = finalMCU;
    const badge = document.getElementById('diffBadge');
    const diffSlug = finalDiffObj.id.toLowerCase();
    const meterBars = Array.from({ length: 6 }, (_, i) =>
        `<span class="${i < finalDiffObj.level ? 'lit' : ''}"></span>`
    ).join('');
    badge.innerHTML = `Zorluk: ${finalDiffObj.id} (Seviye ${finalDiffObj.level}) <span class="level-meter">${meterBars}</span>`;
    badge.className = `badge difficulty-${diffSlug}`;

    // Sonuç kartının parlama rengini seçilen zorluğa göre eşitle
    resultArea.className = resultArea.className.replace(/\bdiff-\S+/g, '').trim();
    resultArea.classList.add(`diff-${diffSlug}`);

    componentsList.innerHTML = '';
    selectedComps.forEach((comp, index) => {
        const card = document.createElement('div');
        card.className = 'component-item comp-anim';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `<span class="comp-type">${comp.category} · Sv.${comp.level}</span><span class="comp-name">${comp.name}</span>`;
        componentsList.appendChild(card);
    });

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

    const compNames = selectedComps.map(c => c.name).join(', ');
    document.getElementById('promptText').innerHTML = `
        🎯 <strong>Görevin:</strong> <strong>${finalMCU}</strong> mimarisini ve <strong>${compNames}</strong> donanımlarını entegre ederek, <strong>${finalDiffObj.id} seviyesine uygun</strong> bir sistem tasarla.
    `;

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

const signalPulse = document.getElementById('signalPulse');

generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.7';

    if (signalPulse) {
        signalPulse.classList.remove('active');
        // reflow ile animasyonu her tıklamada yeniden başlat
        void signalPulse.offsetWidth;
        signalPulse.classList.add('active');
    }

    simulateLoading(() => {
        generateChallenge();
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
    });
});

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

function updateTimerUI() {
    const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const seconds = (timeRemaining % 60).toString().padStart(2, '0');
    minutesUnit.textContent = minutes;
    secondsUnit.textContent = seconds;
}

timerInput.addEventListener('input', () => {
    if (!isTimerRunning) {
        let inputVal = parseInt(timerInput.value, 10);
        if (isNaN(inputVal) || inputVal < 1) inputVal = 1;
        timeRemaining = inputVal * 60;
        updateTimerUI();
    }
});

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

document.getElementById('pauseTimerBtn').addEventListener('click', () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
});

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    let inputVal = parseInt(timerInput.value, 10) || 30;
    timeRemaining = inputVal * 60;
    updateTimerUI();
}
document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);

/* =========================================
   EMAILJS & GÜVENLİK (HONEYPOT)
========================================= */
document.getElementById('pubu-contact-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const submitBtn = document.getElementById('submitBtn');
    const statusMsg = document.getElementById('formStatus');
    const honeypot = document.getElementById('pubu-bot-trap').value; 

    if (honeypot !== "") {
        console.warn("Honeypot tetiklendi: Bot aktivitesi engellendi.");
        this.reset();
        return; 
    }

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Gönderiliyor... ⏳';
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;

    statusMsg.classList.remove('hidden', 'text-success', 'text-error');
    statusMsg.textContent = "";

    emailjs.sendForm('service_esvi3kl', 'template_3krb2et', this)
        .then(() => {
            submitBtn.classList.remove('btn-loading');
            submitBtn.classList.add('btn-success'); 
            submitBtn.innerHTML = '✅ İletildi!';
            
            this.reset(); 

            setTimeout(() => {
                submitBtn.classList.remove('btn-success');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }, 3000);

        }, (error) => {
            submitBtn.classList.remove('btn-loading');
            submitBtn.innerHTML = originalBtnText; 
            submitBtn.disabled = false;

            statusMsg.textContent = "❌ Gönderim hatası oluştu. Lütfen tekrar dene.";
            statusMsg.classList.add('text-error');
            console.error("EmailJS Error: ", error);
        });
});

/* =========================================
   FAVORİLER (LOCAL STORAGE) İŞLEMLERİ
========================================= */
function getFavorites() {
    return JSON.parse(localStorage.getItem('pubu_favorites')) || [];
}

addFavBtn.addEventListener('click', () => {
    if (!currentChallenge) return;
    const favs = getFavorites();
    favs.push(currentChallenge);
    localStorage.setItem('pubu_favorites', JSON.stringify(favs));
    
    addFavBtn.innerHTML = '✅ Kaydedildi';
    addFavBtn.classList.add('saved');
});

viewFavsBtn.addEventListener('click', () => {
    renderFavorites(); 
    favModal.classList.remove('hidden'); 
});

closeFavsBtn.addEventListener('click', () => favModal.classList.add('hidden'));

window.deleteFav = function (id) {
    let favs = getFavorites();
    favs = favs.filter(f => f.id !== id); 
    localStorage.setItem('pubu_favorites', JSON.stringify(favs));
    renderFavorites(); 
};

function renderFavorites() {
    const favs = getFavorites();
    favList.innerHTML = '';
    
    if (favs.length === 0) {
        favList.innerHTML = '<p class="empty-msg">Henüz kaydedilmiş bir projen yok.</p>';
        return;
    }

    favs.slice().reverse().forEach(fav => {
        const card = document.createElement('div');
        card.className = 'fav-card';
        const levelTxt = fav.diffLevel ? ` · Sv.${fav.diffLevel}` : '';
        
        card.innerHTML = `
            <div class="fav-card-top">
                <div class="fav-card-meta">
                    <span class="fav-diff difficulty-${fav.diffId.toLowerCase()}" style="border:1px solid currentColor; color:currentColor;">${fav.diffId}${levelTxt}</span>
                    <span class="fav-date">${fav.date}</span>
                </div>
                <button class="btn-delete-fav" onclick="deleteFav('${fav.id}')">Sil</button>
            </div>
            <h4>🧠 ${fav.mcu}</h4>
            <p><strong>Bileşenler:</strong> ${fav.components.join(', ')}</p>
        `;
        favList.appendChild(card);
    });
}

/* =========================================
   YENİ EKLENEN: DOĞU TÜRKİSTAN LİNK AĞACI (TOGLE MANTIĞI)
========================================= */
const eastTurkestanBtn = document.getElementById('eastTurkestanBtn');
const eastTurkestanMenu = document.getElementById('eastTurkestanMenu');

if (eastTurkestanBtn && eastTurkestanMenu) {
    eastTurkestanBtn.addEventListener('click', (e) => {
        e.preventDefault();
        eastTurkestanMenu.classList.toggle('show');
    });

    // Menü dışına tıklandığında menüyü kapat
    document.addEventListener('click', (e) => {
        if (!eastTurkestanBtn.contains(e.target) && !eastTurkestanMenu.contains(e.target)) {
            eastTurkestanMenu.classList.remove('show');
        }
    });
}

// Sayfa ilk yüklendiğinde verileri çekme işlemini başlat
document.addEventListener('DOMContentLoaded', loadData);