
let database = [];      // Bileşen havuzu (her biri: name, category, level)
let mcuList = [];
let difficulties = [];  // Her biri: id, desc, level
let currentChallenge = null; // Ekranda üretilen son görevi hafızada tutar

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

// Favoriler
const addFavBtn = document.getElementById('addFavBtn');
const viewFavsBtn = document.getElementById('viewFavsBtn');
const favModal = document.getElementById('favModal');
const closeFavsBtn = document.getElementById('closeFavsBtn');
const favList = document.getElementById('favList');

/* =========================================
   VERİ YÜKLEME
========================================= */
async function loadData() {
    try {
        generateBtn.textContent = 'Veriler Yükleniyor... ⏳';
        generateBtn.disabled = true;

        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP hatası! Durum: ${response.status}`);

        const data = await response.json();
        database = data.database;
        mcuList = data.mcuList;
        difficulties = data.difficulties;

        initSelects();
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

    // Zorluklar seviyeye göre sıralı gelir (1 -> 6)
    diffSelect.innerHTML = `<option value="random">🎲 Rastgele Zorluk</option>`;
    difficulties.forEach(d => {
        diffSelect.innerHTML += `<option value="${d.id}">${d.id} · Seviye ${d.level} (${d.desc})</option>`;
    });
}

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* =========================================
   KADEMELİ HAVUZ MANTIĞI
   Kural: seçilen zorluğun seviyesi N ise,
   havuz = level <= N olan TÜM bileşenler.
   Alt seviyeler üst seviyeye erişemez,
   üst seviyeler alt seviyedeki her şeyi kapsar.
========================================= */
function getPoolForLevel(level) {
    return database.filter(c => c.level <= level);
}

function resolveSelectedDifficulty() {
    if (diffSelect.value === 'random') return getRandomItem(difficulties);
    return difficulties.find(d => d.id === diffSelect.value);
}

// Arayüzde, seçili zorluğa göre erişilebilir havuz büyüklüğünü gösterir
function updatePoolInfo() {
    if (!poolInfo) return;
    if (difficulties.length === 0) return;

    let diffForPreview;
    if (diffSelect.value === 'random') {
        // Rastgele seçiliyken en geniş (en yüksek seviye) havuzu referans göster
        diffForPreview = difficulties[difficulties.length - 1];
        const pool = getPoolForLevel(diffForPreview.level);
        poolInfo.textContent = `🎲 Zorluk rastgele belirlenecek — seviyeye göre havuz değişir (en geniş ihtimalde ${pool.length} bileşen).`;
        return;
    }

    diffForPreview = difficulties.find(d => d.id === diffSelect.value);
    if (!diffForPreview) return;
    const pool = getPoolForLevel(diffForPreview.level);
    poolInfo.textContent = `🔓 "${diffForPreview.id}" (Seviye ${diffForPreview.level}) seçiliyken, Seviye 1–${diffForPreview.level} arası toplam ${pool.length} bileşen erişilebilir.`;
}

diffSelect.addEventListener('change', updatePoolInfo);
compSlider.addEventListener('input', (e) => compVal.textContent = e.target.value);

/* =========================================
   ÜRETİM ANİMASYONU
========================================= */
function simulateLoading(callback) {
    resultArea.classList.remove('hidden');

    addFavBtn.classList.remove('saved');
    addFavBtn.innerHTML = '⭐ Favorilere Ekle';
    addFavBtn.disabled = false;

    componentsList.innerHTML = '';
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
   GÖREV ÜRETİMİ
========================================= */
function generateChallenge() {
    if (database.length === 0) return;

    const finalMCU = (mcuSelect.value === 'random') ? getRandomItem(mcuList) : mcuSelect.value;
    const finalDiffObj = resolveSelectedDifficulty();

    // Kademeli havuz: seçilen seviye ve ALTINDAKİ tüm bileşenler dahil
    const pool = getPoolForLevel(finalDiffObj.level);

    const requestedCount = parseInt(compSlider.value, 10);
    const count = Math.min(requestedCount, pool.length); // havuz küçükse taşma olmasın

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selectedComps = shuffled.slice(0, count);

    document.getElementById('selectedMCU').textContent = finalMCU;
    const badge = document.getElementById('diffBadge');
    badge.textContent = `Zorluk: ${finalDiffObj.id} (Seviye ${finalDiffObj.level})`;
    badge.className = `badge difficulty-${finalDiffObj.id.toLowerCase()}`;

    componentsList.innerHTML = '';
    selectedComps.forEach((comp, index) => {
        const card = document.createElement('div');
        card.className = 'component-item comp-anim';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <span class="comp-type">${comp.category} · Sv.${comp.level}</span>
            <span class="comp-name">${comp.name}</span>
        `;
        componentsList.appendChild(card);
    });

    const compNames = selectedComps.map(c => c.name).join(', ');
    document.getElementById('promptText').innerHTML = `
        🎯 <strong>Görevin:</strong> <strong>${finalMCU}</strong> mimarisini ve <strong>${compNames}</strong> donanımlarını entegre ederek, <strong>${finalDiffObj.id} seviyesine uygun</strong> bir sistem tasarla.
    `;

    updatePoolInfo();

    currentChallenge = {
        id: Date.now().toString(),
        mcu: finalMCU,
        diffId: finalDiffObj.id,
        diffLevel: finalDiffObj.level,
        components: selectedComps.map(c => c.name),
        date: new Date().toLocaleDateString('tr-TR')
    };
}

/* =========================================
   BUTON OLAYLARI
========================================= */
generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.7';
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

closeFavsBtn.addEventListener('click', () => {
    favModal.classList.add('hidden');
});

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
        favList.innerHTML = '<p class="empty-msg">Henüz kaydedilmiş bir projen yok. Hemen bir tane üret ve kaydet!</p>';
        return;
    }

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

document.addEventListener('DOMContentLoaded', loadData);
