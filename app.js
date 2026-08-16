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

// Gamification (XP / Seviye / Rozet) DOM Elementleri
const completeChallengeBtn = document.getElementById('completeChallengeBtn');
const xpLevelIcon = document.getElementById('xpLevelIcon');
const xpLevelName = document.getElementById('xpLevelName');
const xpTotalText = document.getElementById('xpTotalText');
const xpBarFill = document.getElementById('xpBarFill');
const xpNextText = document.getElementById('xpNextText');
const openBadgesBtn = document.getElementById('openBadgesBtn');
const badgesModal = document.getElementById('badgesModal');
const closeBadgesBtn = document.getElementById('closeBadgesBtn');
const badgesGrid = document.getElementById('badgesGrid');
const toastContainer = document.getElementById('toastContainer');

// Bağlantı Rehberi DOM Elementleri
const wiringGuideContainer = document.getElementById('wiringGuideContainer');
const wiringGuideContent = document.getElementById('wiringGuideContent');

/* =========================================
   BAĞLANTI REHBERİ VERİ KÜMELERİ
========================================= */
const MCU_PINOUTS = {
    "ATmega328P (Arduino Uno/Nano)": {
        digital: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"],
        analog: ["A0", "A1", "A2", "A3", "A4", "A5"],
        pwm: ["D3", "D5", "D6", "D9", "D10", "D11"],
        i2c: { sda: "A4", scl: "A5" },
        spi: { mosi: "D11", miso: "D12", sck: "D13", ss: "D10" },
        uart: { tx: "D1", rx: "D0" },
        power: { vcc: "5V", gnd: "GND" },
        notes: "D0/D1 seri haberleşme için ayrılmıştır."
    },
    "ATmega2560 (Arduino Mega)": {
        digital: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "D22", "D23", "D24", "D25", "D26", "D27", "D28", "D29", "D30", "D31", "D32", "D33", "D34", "D35", "D36", "D37", "D38", "D39", "D40", "D41", "D42", "D43", "D44", "D45", "D46", "D47", "D48", "D49", "D50", "D51", "D52", "D53"],
        analog: ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15"],
        pwm: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "D44", "D45", "D46"],
        i2c: { sda: "D20", scl: "D21" },
        spi: { mosi: "D51", miso: "D50", sck: "D52", ss: "D53" },
        uart: { tx: "D1", rx: "D0" },
        power: { vcc: "5V", gnd: "GND" }
    },
    "ATtiny85 (Kompakt 8-pin)": {
        digital: ["D0", "D1", "D2", "D3", "D4", "D5"],
        analog: ["A0", "A1", "A2", "A3"],
        pwm: ["D0", "D1", "D4"],
        i2c: null,
        spi: null,
        uart: null,
        power: { vcc: "5V", gnd: "GND" },
        notes: "ATtiny85'te I2C/SPI/UART donanımı yoktur; yazılımsal olarak taklit edilebilir."
    },
    "Arduino Leonardo / Micro (ATmega32U4)": {
        digital: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "A0", "A1", "A2", "A3", "A4", "A5"],
        analog: ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11"],
        pwm: ["D3", "D5", "D6", "D9", "D10", "D11"],
        i2c: { sda: "D2", scl: "D3" },
        spi: { mosi: "D16", miso: "D14", sck: "D15", ss: "D17" },
        uart: { tx: "D1", rx: "D0" },
        power: { vcc: "5V", gnd: "GND" }
    },
    "Arduino Nano 33 BLE Sense": {
        digital: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"],
        analog: ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"],
        pwm: ["D3", "D5", "D6", "D9", "D10", "D11"],
        i2c: { sda: "A4", scl: "A5" },
        spi: { mosi: "D11", miso: "D12", sck: "D13", ss: "D10" },
        uart: { tx: "D1", rx: "D0" },
        power: { vcc: "3.3V", gnd: "GND" }
    },
    "Arduino UNO R4 Minima / WiFi": {
        digital: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"],
        analog: ["A0", "A1", "A2", "A3", "A4", "A5"],
        pwm: ["D3", "D5", "D6", "D9", "D10", "D11"],
        i2c: { sda: "A4", scl: "A5" },
        spi: { mosi: "D11", miso: "D12", sck: "D13", ss: "D10" },
        uart: { tx: "D1", rx: "D0" },
        power: { vcc: "5V", gnd: "GND" }
    },
    "ESP8266 (NodeMCU / Wemos D1 Mini)": {
        digital: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"],
        analog: ["A0"],
        pwm: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"],
        i2c: { sda: "D2 (GPIO4)", scl: "D1 (GPIO5)" },
        spi: { mosi: "D7 (GPIO13)", miso: "D6 (GPIO12)", sck: "D5 (GPIO14)", ss: "D8 (GPIO15)" },
        uart: { tx: "D10 (GPIO1)", rx: "D9 (GPIO3)" },
        power: { vcc: "3.3V", gnd: "GND" },
        notes: "D0 ve D8 önyükleme için özel durumlara sahiptir; dikkatli kullanın."
    },
    "ESP32-WROOM-32 (Çift Çekirdek Wi-Fi/BT)": {
        digital: ["GPIO2", "GPIO4", "GPIO5", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO19", "GPIO21", "GPIO22", "GPIO23", "GPIO25", "GPIO26", "GPIO27", "GPIO32", "GPIO33"],
        analog: ["GPIO32", "GPIO33", "GPIO34", "GPIO35", "GPIO36", "GPIO39"],
        pwm: ["GPIO2", "GPIO4", "GPIO5", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO19", "GPIO21", "GPIO22", "GPIO23", "GPIO25", "GPIO26", "GPIO27", "GPIO32", "GPIO33"],
        i2c: { sda: "GPIO21", scl: "GPIO22" },
        spi: { mosi: "GPIO23", miso: "GPIO19", sck: "GPIO18", ss: "GPIO5" },
        uart: { tx: "GPIO1", rx: "GPIO3" },
        power: { vcc: "3.3V", gnd: "GND" },
        notes: "GPIO34-39 yalnızca giriştir; çıkış olarak kullanılamaz."
    },
    "ESP32-S2 / ESP32-S3": {
        digital: ["GPIO1", "GPIO2", "GPIO3", "GPIO4", "GPIO5", "GPIO6", "GPIO7", "GPIO8", "GPIO9", "GPIO10", "GPIO11", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO19", "GPIO20", "GPIO21"],
        analog: ["GPIO1", "GPIO2", "GPIO3", "GPIO4", "GPIO5", "GPIO6", "GPIO7", "GPIO8", "GPIO9", "GPIO10"],
        pwm: ["GPIO1", "GPIO2", "GPIO3", "GPIO4", "GPIO5", "GPIO6", "GPIO7", "GPIO8", "GPIO9", "GPIO10", "GPIO11", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO19", "GPIO20", "GPIO21"],
        i2c: { sda: "GPIO8", scl: "GPIO9" },
        spi: { mosi: "GPIO11", miso: "GPIO13", sck: "GPIO12", ss: "GPIO10" },
        uart: { tx: "GPIO43", rx: "GPIO44" },
        power: { vcc: "3.3V", gnd: "GND" }
    },
    "ESP32-C3 / ESP32-C6 (RISC-V)": {
        digital: ["GPIO0", "GPIO1", "GPIO2", "GPIO3", "GPIO4", "GPIO5", "GPIO6", "GPIO7", "GPIO8", "GPIO9", "GPIO10"],
        analog: ["GPIO0", "GPIO1", "GPIO2", "GPIO3", "GPIO4"],
        pwm: ["GPIO0", "GPIO1", "GPIO2", "GPIO3", "GPIO4", "GPIO5", "GPIO6", "GPIO7", "GPIO8", "GPIO9", "GPIO10"],
        i2c: { sda: "GPIO8", scl: "GPIO9" },
        spi: { mosi: "GPIO6", miso: "GPIO7", sck: "GPIO4", ss: "GPIO5" },
        uart: { tx: "GPIO21", rx: "GPIO20" },
        power: { vcc: "3.3V", gnd: "GND" }
    },
    "Raspberry Pi Pico (RP2040)": {
        digital: ["GP0", "GP1", "GP2", "GP3", "GP4", "GP5", "GP6", "GP7", "GP8", "GP9", "GP10", "GP11", "GP12", "GP13", "GP14", "GP15", "GP16", "GP17", "GP18", "GP19", "GP20", "GP21", "GP22", "GP23", "GP24", "GP25", "GP26", "GP27", "GP28"],
        analog: ["GP26", "GP27", "GP28"],
        pwm: ["GP0", "GP1", "GP2", "GP3", "GP4", "GP5", "GP6", "GP7", "GP8", "GP9", "GP10", "GP11", "GP12", "GP13", "GP14", "GP15", "GP16", "GP17", "GP18", "GP19", "GP20", "GP21", "GP22", "GP23", "GP24", "GP25", "GP26", "GP27", "GP28"],
        i2c: { sda: "GP0", scl: "GP1" },
        spi: { mosi: "GP19", miso: "GP16", sck: "GP18", ss: "GP17" },
        uart: { tx: "GP0", rx: "GP1" },
        power: { vcc: "3.3V", gnd: "GND" },
        notes: "RP2040 pinleri çok işlevlidir; I2C, SPI ve UART pinleri aynı anda kullanılırsa çakışabilir."
    },
    "Raspberry Pi Pico W (Wi-Fi)": {
        digital: ["GP0", "GP1", "GP2", "GP3", "GP4", "GP5", "GP6", "GP7", "GP8", "GP9", "GP10", "GP11", "GP12", "GP13", "GP14", "GP15", "GP16", "GP17", "GP18", "GP19", "GP20", "GP21", "GP22", "GP23", "GP24", "GP25", "GP26", "GP27", "GP28"],
        analog: ["GP26", "GP27", "GP28"],
        pwm: ["GP0", "GP1", "GP2", "GP3", "GP4", "GP5", "GP6", "GP7", "GP8", "GP9", "GP10", "GP11", "GP12", "GP13", "GP14", "GP15", "GP16", "GP17", "GP18", "GP19", "GP20", "GP21", "GP22", "GP23", "GP24", "GP25", "GP26", "GP27", "GP28"],
        i2c: { sda: "GP0", scl: "GP1" },
        spi: { mosi: "GP19", miso: "GP16", sck: "GP18", ss: "GP17" },
        uart: { tx: "GP0", rx: "GP1" },
        power: { vcc: "3.3V", gnd: "GND" }
    },
    "RP2350 Hibrit ARM / RISC-V": {
        digital: ["GP0", "GP1", "GP2", "GP3", "GP4", "GP5", "GP6", "GP7", "GP8", "GP9", "GP10", "GP11", "GP12", "GP13", "GP14", "GP15", "GP16", "GP17", "GP18", "GP19", "GP20", "GP21", "GP22", "GP23", "GP24", "GP25", "GP26", "GP27", "GP28"],
        analog: ["GP26", "GP27", "GP28"],
        pwm: ["GP0", "GP1", "GP2", "GP3", "GP4", "GP5", "GP6", "GP7", "GP8", "GP9", "GP10", "GP11", "GP12", "GP13", "GP14", "GP15", "GP16", "GP17", "GP18", "GP19", "GP20", "GP21", "GP22", "GP23", "GP24", "GP25", "GP26", "GP27", "GP28"],
        i2c: { sda: "GP0", scl: "GP1" },
        spi: { mosi: "GP19", miso: "GP16", sck: "GP18", ss: "GP17" },
        uart: { tx: "GP0", rx: "GP1" },
        power: { vcc: "3.3V", gnd: "GND" }
    },
    "STM32F103C8T6 (Blue Pill)": {
        digital: ["PA0", "PA1", "PA2", "PA3", "PA4", "PA5", "PA6", "PA7", "PA8", "PA9", "PA10", "PA11", "PA12", "PA15", "PB0", "PB1", "PB3", "PB4", "PB5", "PB6", "PB7", "PB8", "PB9", "PB10", "PB11", "PB12", "PB13", "PB14", "PB15"],
        analog: ["PA0", "PA1", "PA2", "PA3", "PA4", "PA5", "PA6", "PA7", "PB0", "PB1"],
        pwm: ["PA0", "PA1", "PA2", "PA3", "PA6", "PA7", "PA8", "PA9", "PA10", "PB0", "PB1", "PB6", "PB7", "PB8", "PB9"],
        i2c: { sda: "PB7", scl: "PB6" },
        spi: { mosi: "PA7", miso: "PA6", sck: "PA5", ss: "PA4" },
        uart: { tx: "PA9", rx: "PA10" },
        power: { vcc: "3.3V", gnd: "GND" },
        notes: "Blue Pill 5V toleranslı değildir; seviye uyumluluğuna dikkat edin."
    },
    "STM32F401 / F411 (Black Pill)": {
        digital: ["PA0", "PA1", "PA2", "PA3", "PA4", "PA5", "PA6", "PA7", "PA8", "PA9", "PA10", "PA11", "PA12", "PA15", "PB0", "PB1", "PB3", "PB4", "PB5", "PB6", "PB7", "PB8", "PB9", "PB10", "PB12", "PB13", "PB14", "PB15", "PC13", "PC14", "PC15"],
        analog: ["PA0", "PA1", "PA2", "PA3", "PA4", "PA5", "PA6", "PA7", "PB0", "PB1"],
        pwm: ["PA0", "PA1", "PA2", "PA3", "PA6", "PA7", "PA8", "PA9", "PA10", "PB0", "PB1", "PB6", "PB7", "PB8", "PB9"],
        i2c: { sda: "PB7", scl: "PB6" },
        spi: { mosi: "PA7", miso: "PA6", sck: "PA5", ss: "PA4" },
        uart: { tx: "PA9", rx: "PA10" },
        power: { vcc: "3.3V", gnd: "GND" }
    },
    "Teensy 4.0 / 4.1": {
        digital: Array.from({ length: 41 }, (_, i) => `D${i}`),
        analog: Array.from({ length: 23 }, (_, i) => `A${i}`),
        pwm: Array.from({ length: 41 }, (_, i) => `D${i}`),
        i2c: { sda: "D18", scl: "D19" },
        spi: { mosi: "D11", miso: "D12", sck: "D13", ss: "D10" },
        uart: { tx: "D1", rx: "D0" },
        power: { vcc: "3.3V", gnd: "GND" },
        notes: "Teensy 4.0/4.1 5V toleranslı değildir; 3.3V sinyaller kullanın."
    }
};

const CATEGORY_DEFAULTS = {
    "Sensör": [
        { label: "VCC", type: "power.vcc" },
        { label: "GND", type: "power.gnd" },
        { label: "Data", type: "digital", desc: "Veri pini (dijital veya analog)" }
    ],
    "Motor / Aktüatör": [
        { label: "VCC", type: "power.vcc" },
        { label: "GND", type: "power.gnd" },
        { label: "Signal", type: "pwm", desc: "Kontrol sinyali (PWM)" }
    ],
    "Sürücü / Röle": [
        { label: "VCC", type: "power.vcc" },
        { label: "GND", type: "power.gnd" },
        { label: "IN", type: "digital", desc: "Kontrol sinyali" }
    ],
    "Ekran": [
        { label: "VCC", type: "power.vcc" },
        { label: "GND", type: "power.gnd" },
        { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
        { label: "SCL", type: "i2c.scl", desc: "I2C saat" }
    ],
    "Haberleşme": [
        { label: "VCC", type: "power.vcc" },
        { label: "GND", type: "power.gnd" },
        { label: "TX", type: "uart.tx", desc: "Veri çıkışı" },
        { label: "RX", type: "uart.rx", desc: "Veri girişi" }
    ],
    "Modül / Çeşitli": [
        { label: "VCC", type: "power.vcc" },
        { label: "GND", type: "power.gnd" },
        { label: "Data", type: "digital", desc: "Veri pini" }
    ]
};

const COMPONENT_PINOUTS = {
    // ===== SENSÖRLER =====
    "LDR (Işığa Duyarlı Direnç Modülü)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "DO", type: "digital", desc: "Dijital çıkış (eşik ayarlı)" },
            { label: "AO", type: "analog", desc: "Analog çıkış (opsiyonel)" }
        ],
        notes: "Işık şiddetine göre direnç değişir; analog okuma daha hassastır."
    },
    "HC-SR04 Ultrasonik Mesafe Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "Trig", type: "digital", desc: "Tetikleme pini" },
            { label: "Echo", type: "digital", desc: "Yankı pini" }
        ],
        notes: "Echo pini 5V sinyal verir; 3.3V sistemlerde seviye dönüştürücü gerekebilir."
    },
    "HC-SR501 PIR Hareket Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "OUT", type: "digital", desc: "Hareket algılandığında HIGH olur" }
        ],
        notes: "Hassasiyet ve gecikme potansiyometreleri ile ayarlanabilir."
    },
    "DHT11 Sıcaklık ve Nem Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "Data", type: "digital", desc: "Tek veri pini, 10k pull-up direnci önerilir" }
        ],
        notes: "DHT11 düşük maliyetli, 2°C doğruluk. Daha hassas için DHT22 kullanın."
    },
    "DHT22 / AM2302 Hassas Sıcaklık ve Nem": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "Data", type: "digital", desc: "Tek veri pini, 10k pull-up direnci önerilir" }
        ],
        notes: "DHT11'e göre daha geniş aralık ve daha yüksek doğruluk sunar."
    },
    "LM35 / TMP36 Analog Sıcaklık Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "VOUT", type: "analog", desc: "Analog çıkış (10mV/°C)" }
        ],
        notes: "LM35 çıkışı 0-1V arası, TMP36 daha geniş aralık. ADC ile okuyun."
    },
    "Kapasitif Toprak Nem Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "AOUT", type: "analog", desc: "Analog nem seviyesi" },
            { label: "DOUT", type: "digital", desc: "Dijital eşik çıkışı (opsiyonel)" }
        ],
        notes: "Kapasitif sensör korozyona dayanıklıdır; analog çıkış daha hassastır."
    },
    "Yağmur Sensörü Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "AO", type: "analog", desc: "Analog yağış miktarı" },
            { label: "DO", type: "digital", desc: "Dijital eşik çıkışı" }
        ],
        notes: "Yağmur damlaları iletkenliği değiştirir; hassasiyet ayarlanabilir."
    },
    "KY-037 Ses Algılama Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "AO", type: "analog", desc: "Analog ses seviyesi" },
            { label: "DO", type: "digital", desc: "Dijital eşik çıkışı" }
        ],
        notes: "Mikrofonlu modül; ses seviyesine göre çıkış verir."
    },
    "Eğim / Titreşim Sensörü (SW-420)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "DO", type: "digital", desc: "Titreşim algılandığında LOW" }
        ],
        notes: "Eğim veya sarsıntı algılar."
    },
    "Manyetik Reed Röle (Kapı Sensörü)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "DO", type: "digital", desc: "Manyetik alan algılandığında değişir" }
        ],
        notes: "Kapı/pencere sensörü olarak kullanılır; mıknatısla tetiklenir."
    },
    "Analog Joystik Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "VRx", type: "analog", desc: "X ekseni analog çıkış" },
            { label: "VRy", type: "analog", desc: "Y ekseni analog çıkış" },
            { label: "SW", type: "digital", desc: "Buton çıkışı (basılınca LOW)" }
        ],
        notes: "İki analog okuma ve bir dijital buton gerektirir."
    },
    "Alev Algılayıcı Sensör Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "AO", type: "analog", desc: "Analog alev yoğunluğu" },
            { label: "DO", type: "digital", desc: "Dijital eşik çıkışı" }
        ],
        notes: "Alevden yayılan kızılötesi ışığı algılar."
    },
    "TTP223 Kapasitif Dokunmatik Sensör": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "OUT", type: "digital", desc: "Dokunma algılandığında HIGH" }
        ],
        notes: "Dokunmatik yüzey olarak kullanılır."
    },
    "Nabız Sensörü (Pulse Sensor)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "AOUT", type: "analog", desc: "Nabız dalga formu analog çıkış" }
        ],
        notes: "Parmak veya kulak memesine yerleştirilir."
    },
    "4x4 Membran Keypad (Tuş Takımı)": {
        pins: [
            { label: "R1-R4", type: "digital", count: 4, desc: "Satır pinleri" },
            { label: "C1-C4", type: "digital", count: 4, desc: "Sütun pinleri" }
        ],
        notes: "8 dijital pin gerektirir; keypad kütüphanesi kullanın."
    },
    "BME280 Sıcaklık, Nem ve Basınç Sensörü (I2C)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri hattı" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat hattı" }
        ],
        notes: "3.3V veya 5V ile çalışabilir; I2C adresi genellikle 0x76 veya 0x77."
    },
    "DS18B20 1-Wire Su Geçirmez Sıcaklık": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "Data", type: "digital", desc: "1-Wire veri pini, 4.7k pull-up direnci gerekir" }
        ],
        notes: "Parazit modda iki pinle de kullanılabilir."
    },
    "MQ Serisi (MQ-2/MQ-135) Gaz Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "AO", type: "analog", desc: "Analog gaz konsantrasyonu" },
            { label: "DO", type: "digital", desc: "Dijital eşik çıkışı" }
        ],
        notes: "Isınma süresi gerekir; kalibrasyon yapılmalıdır."
    },
    "TCS3200 Renk Algılama Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "S0", type: "digital", desc: "Frekans ölçekleme seçimi" },
            { label: "S1", type: "digital", desc: "Frekans ölçekleme seçimi" },
            { label: "S2", type: "digital", desc: "Fotodiyot seçimi" },
            { label: "S3", type: "digital", desc: "Fotodiyot seçimi" },
            { label: "OUT", type: "digital", desc: "Frekans çıkışı" }
        ],
        notes: "Renk algılamak için OUT pinindeki frekansı okuyun."
    },
    "Su Seviye Sensörü (Analog)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "AO", type: "analog", desc: "Analog su seviyesi" },
            { label: "DO", type: "digital", desc: "Dijital eşik çıkışı (opsiyonel)" }
        ],
        notes: "Su seviyesi arttıkça çıkış gerilimi artar."
    },
    "YF-S201 Su Akış Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "OUT", type: "digital", desc: "Pals çıkışı (akış hızına bağlı)" }
        ],
        notes: "Pals sayısı akış hızına dönüştürülür."
    },
    "MPU6050 6 Eksenli İvmeölçer ve Jiroskop": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat" }
        ],
        notes: "I2C adresi 0x68 veya 0x69; bazı modüllerde AD0 pini bulunur."
    },
    "RC522 13.56MHz RFID Okuyucu": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA (SS)", type: "spi.ss", desc: "Slave Select" },
            { label: "SCK", type: "spi.sck", desc: "SPI saat" },
            { label: "MOSI", type: "spi.mosi", desc: "SPI veri girişi" },
            { label: "MISO", type: "spi.miso", desc: "SPI veri çıkışı" },
            { label: "IRQ", type: "digital", desc: "Kesme pini (opsiyonel)" },
            { label: "RST", type: "digital", desc: "Sıfırlama pini" }
        ],
        notes: "SPI iletişim; RFID etiketleri ile kullanılır."
    },
    "VL53L0X Lazer ToF Mesafe Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat" },
            { label: "XSHUT", type: "digital", desc: "Kapatma pini (opsiyonel)" }
        ],
        notes: "I2C adresi 0x29; hassas mesafe ölçümü yapar."
    },
    "APDS-9960 RGB ve Jest (Hareket) Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat" },
            { label: "INT", type: "digital", desc: "Kesme pini (opsiyonel)" }
        ],
        notes: "RGB renk, yakınlık ve jest algılama."
    },
    "MAX30102 Nabız ve Oksimetre Sensörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat" },
            { label: "INT", type: "digital", desc: "Kesme pini (opsiyonel)" }
        ],
        notes: "Nabız ve SpO2 ölçümü; dikkatli yerleştirme gerektirir."
    },
    "HX711 Ağırlık Sensörü (Load Cell) Amplifikatörü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "DT", type: "digital", desc: "Veri pini" },
            { label: "SCK", type: "digital", desc: "Saat pini" }
        ],
        notes: "Load cell bağlantısı için HX711 kullanılır; kalibrasyon gerekir."
    },
    "NEO-6M GPS Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "TX", type: "uart.tx", desc: "GPS'ten veri çıkışı (MCU RX'e bağlanır)" },
            { label: "RX", type: "uart.rx", desc: "GPS'e veri girişi (MCU TX'ten bağlanır)" }
        ],
        notes: "UART ile NMEA cümleleri alınır."
    },
    "AS608 Optik Parmak İzi Okuyucu": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "TX", type: "uart.tx", desc: "Modülden veri çıkışı" },
            { label: "RX", type: "uart.rx", desc: "Modüle veri girişi" }
        ],
        notes: "UART ile parmak izi kayıt ve eşleştirme yapılır."
    },
    "Lidar (RPLIDAR A1 / TFmini)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "TX", type: "uart.tx", desc: "Lidar veri çıkışı" },
            { label: "RX", type: "uart.rx", desc: "Lidar komut girişi" }
        ],
        notes: "360° tarama yapan RPLIDAR veya tek nokta TFmini olabilir."
    },
    "Pixy2 / OV7670 Kamera Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat" }
        ],
        notes: "Pixy2 I2C/SPI/UART destekler; kamera görüntü işleme yapar."
    },

    // ===== MOTOR / AKTÜATÖR =====
    "SG90 9g Mini Servo Motor": {
        pins: [
            { label: "VCC (Kırmızı)", type: "power.vcc" },
            { label: "GND (Kahve)", type: "power.gnd" },
            { label: "Signal (Turuncu)", type: "pwm", desc: "PWM ile açı kontrolü" }
        ],
        notes: "Servo 5V ile çalışır; akım ihtiyacı için harici güç düşünün."
    },
    "MG996R Yüksek Torklu Servo Motor": {
        pins: [
            { label: "VCC (Kırmızı)", type: "power.vcc" },
            { label: "GND (Kahve)", type: "power.gnd" },
            { label: "Signal (Turuncu)", type: "pwm", desc: "PWM ile açı kontrolü" }
        ],
        notes: "Yüksek tork, daha fazla akım çeker; harici güç kaynağı önerilir."
    },
    "Aktif / Pasif Piezo Buzzer": {
        pins: [
            { label: "+", type: "pwm", desc: "Ses çıkışı (aktif buzzer için dijital de olabilir)" },
            { label: "-", type: "power.gnd", desc: "Toprak" }
        ],
        notes: "Aktif buzzer sadece DC ile çalışır; pasif buzzer kare dalga gerektirir."
    },
    "5V DC Motor (Standart)": {
        pins: [
            { label: "Motor+", type: "digital", desc: "Sürücü üzerinden bağlanır" },
            { label: "Motor-", type: "digital", desc: "Sürücü üzerinden bağlanır" }
        ],
        notes: "Doğrudan MCU'ya bağlamayın; motor sürücü (L298N, TB6612 vb.) kullanın."
    },
    "Mini Dalgıç Su Pompası (3-6V)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "Kontrol", type: "digital", desc: "Röle veya MOSFET ile kontrol edilir" }
        ],
        notes: "Su pompası doğrudan MCU pininden beslenmez; güç katı kullanın."
    },
    "Titreşim Motoru Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "Signal", type: "pwm", desc: "Titreşim şiddeti PWM ile ayarlanabilir" }
        ],
        notes: "Küçük motor; doğrudan MCU pinine bağlanabilir (akım sınırına dikkat)."
    },
    "28BYJ-48 Redüktörlü Step Motor": {
        pins: [
            { label: "IN1", type: "digital", desc: "ULN2003 sürücü girişi" },
            { label: "IN2", type: "digital", desc: "ULN2003 sürücü girişi" },
            { label: "IN3", type: "digital", desc: "ULN2003 sürücü girişi" },
            { label: "IN4", type: "digital", desc: "ULN2003 sürücü girişi" }
        ],
        notes: "Genellikle ULN2003 sürücü kartı ile birlikte gelir; 4 dijital pin gerektirir."
    },
    "NEMA 17 Bipolar Step Motor": {
        pins: [
            { label: "A+", type: "digital", desc: "A4988/DRV8825 sürücü çıkışına bağlanır" },
            { label: "A-", type: "digital", desc: "A4988/DRV8825 sürücü çıkışına bağlanır" },
            { label: "B+", type: "digital", desc: "A4988/DRV8825 sürücü çıkışına bağlanır" },
            { label: "B-", type: "digital", desc: "A4988/DRV8825 sürücü çıkışına bağlanır" }
        ],
        notes: "Doğrudan MCU'ya bağlanmaz; step motor sürücü kullanılır."
    },
    "Fırçasız DC Motor (BLDC) ve ESC": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "Signal", type: "pwm", desc: "ESC'ye PWM sinyali (genelde 50Hz)" }
        ],
        notes: "BLDC motorlar ESC ile sürülür; PWM sinyali ile hız kontrolü."
    },
    "12V Selenoid Kilit / Valf": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "Kontrol", type: "digital", desc: "Röle veya MOSFET ile sürülür" }
        ],
        notes: "Selenoid yüksek akım çeker; mutlaka sürücü devresi kullanın."
    },

    // ===== SÜRÜCÜ / RÖLE =====
    "1 Kanallı 5V Röle Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "IN", type: "digital", desc: "Röleyi tetikleyen sinyal" }
        ],
        notes: "Röle çektiğinde tık sesi duyulur; endüktif yüklerde flyback diyot kullanın."
    },
    "4 Kanallı Opto-İzole Röle Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "IN1", type: "digital", desc: "Kanal 1 kontrol" },
            { label: "IN2", type: "digital", desc: "Kanal 2 kontrol" },
            { label: "IN3", type: "digital", desc: "Kanal 3 kontrol" },
            { label: "IN4", type: "digital", desc: "Kanal 4 kontrol" }
        ],
        notes: "Opto-izole girişler; 4 dijital pin gerektirir."
    },
    "1 Kanallı Solid State Röle (SSR)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "IN", type: "digital", desc: "Kontrol sinyali" }
        ],
        notes: "SSR mekanik röleye göre daha hızlı ve sessizdir."
    },
    "L298N Çift H-Köprüsü Motor Sürücü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "IN1", type: "digital", desc: "Motor A yön kontrol" },
            { label: "IN2", type: "digital", desc: "Motor A yön kontrol" },
            { label: "IN3", type: "digital", desc: "Motor B yön kontrol" },
            { label: "IN4", type: "digital", desc: "Motor B yön kontrol" },
            { label: "ENA", type: "pwm", desc: "Motor A hız kontrol (PWM)" },
            { label: "ENB", type: "pwm", desc: "Motor B hız kontrol (PWM)" }
        ],
        notes: "Motor güç kaynağı ayrı olmalıdır; ENA/ENB genelde jumper ile 5V'a bağlanır."
    },
    "TB6612FNG Çift Motor Sürücü Modülü": {
        pins: [
            { label: "VM", type: "power.vcc", desc: "Motor güç kaynağı" },
            { label: "GND", type: "power.gnd" },
            { label: "AIN1", type: "digital", desc: "Motor A yön" },
            { label: "AIN2", type: "digital", desc: "Motor A yön" },
            { label: "BIN1", type: "digital", desc: "Motor B yön" },
            { label: "BIN2", type: "digital", desc: "Motor B yön" },
            { label: "PWMA", type: "pwm", desc: "Motor A hız" },
            { label: "PWMB", type: "pwm", desc: "Motor B hız" },
            { label: "STBY", type: "digital", desc: "Standby pini" }
        ],
        notes: "Daha verimli, düşük voltaj düşümü."
    },
    "L293D Motor Sürücü Shield": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "IN1", type: "digital", desc: "Motor yön" },
            { label: "IN2", type: "digital", desc: "Motor yön" },
            { label: "IN3", type: "digital", desc: "Motor yön" },
            { label: "IN4", type: "digital", desc: "Motor yön" },
            { label: "ENA", type: "pwm", desc: "Hız kontrol" },
            { label: "ENB", type: "pwm", desc: "Hız kontrol" }
        ],
        notes: "Arduino shield formundadır; doğrudan takılır."
    },
    "A4988 / DRV8825 Step Motor Sürücü": {
        pins: [
            { label: "VDD", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "STEP", type: "digital", desc: "Adım sinyali" },
            { label: "DIR", type: "digital", desc: "Yön sinyali" },
            { label: "ENABLE", type: "digital", desc: "Aktif düşük enable (opsiyonel)" }
        ],
        notes: "Mikro adım ayarları MS1-MS3 pinleri ile yapılır."
    },
    "IRFZ44N Güç MOSFET Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SIG", type: "pwm", desc: "PWM veya dijital kontrol" }
        ],
        notes: "Yüksek akım yüklerini anahtarlamak için kullanılır."
    },
    "BTS7960 Yüksek Akım Motor Sürücü (43A)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "RPWM", type: "pwm", desc: "İleri PWM" },
            { label: "LPWM", type: "pwm", desc: "Geri PWM" },
            { label: "R_EN", type: "digital", desc: "Sağ kanal enable" },
            { label: "L_EN", type: "digital", desc: "Sol kanal enable" }
        ],
        notes: "Yüksek akım motor kontrolü; ısınma için soğutucu gerekebilir."
    },

    // ===== EKRAN =====
    "16x2 Karakter LCD (I2C Modüllü)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat" }
        ],
        notes: "I2C adresi genellikle 0x27 veya 0x3F."
    },
    "20x4 Karakter LCD (I2C Modüllü)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat" }
        ],
        notes: "20x4 daha büyük ekran; adres 0x27 veya 0x3F."
    },
    "0.96 inç SSD1306 OLED Ekran": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat" }
        ],
        notes: "I2C adresi 0x3C veya 0x3D; SPI versiyonları da mevcuttur."
    },
    "4 Hane 7-Segment Ekran (TM1637)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "CLK", type: "digital", desc: "Saat pini" },
            { label: "DIO", type: "digital", desc: "Veri pini" }
        ],
        notes: "TM1637 kütüphanesi ile kullanın."
    },
    "8x8 MAX7219 Dot Matrix Ekran": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "DIN (MOSI)", type: "spi.mosi", desc: "SPI veri girişi" },
            { label: "CLK (SCK)", type: "spi.sck", desc: "SPI saat" },
            { label: "CS (SS)", type: "spi.ss", desc: "Chip select" }
        ],
        notes: "SPI ile kontrol edilir; birden fazla modül zincirlenebilir."
    },
    "WS2812B Adreslenebilir RGB LED (Neopixel)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "Data", type: "digital", desc: "Tek hat veri pini" }
        ],
        notes: "5V ile çalışır; 3.3V sistemlerde seviye dönüştürücü gerekebilir."
    },
    "1.8\" / 2.4\" TFT SPI Renkli LCD": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "MOSI", type: "spi.mosi", desc: "SPI veri girişi" },
            { label: "MISO", type: "spi.miso", desc: "SPI veri çıkışı" },
            { label: "SCK", type: "spi.sck", desc: "SPI saat" },
            { label: "CS", type: "spi.ss", desc: "Chip select" },
            { label: "DC", type: "digital", desc: "Data/Command" },
            { label: "RST", type: "digital", desc: "Reset" }
        ],
        notes: "SPI ile kontrol; pin bağlantıları modüle göre değişebilir."
    },
    "2.8\" / 3.2\" Dokunmatik TFT LCD (ILI9341)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "MOSI", type: "spi.mosi", desc: "SPI veri girişi" },
            { label: "MISO", type: "spi.miso", desc: "SPI veri çıkışı" },
            { label: "SCK", type: "spi.sck", desc: "SPI saat" },
            { label: "CS", type: "spi.ss", desc: "Chip select" },
            { label: "DC", type: "digital", desc: "Data/Command" },
            { label: "RST", type: "digital", desc: "Reset" },
            { label: "T_CS", type: "digital", desc: "Dokunmatik chip select" },
            { label: "T_IRQ", type: "digital", desc: "Dokunmatik kesme (opsiyonel)" }
        ],
        notes: "Dokunmatik sürücü genellikle XPT2046; ayrıca SPI gerektirir."
    },
    "Nextion HMI Akıllı Dokunmatik Ekran": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "TX", type: "uart.tx", desc: "Ekran TX (MCU RX)" },
            { label: "RX", type: "uart.rx", desc: "Ekran RX (MCU TX)" }
        ],
        notes: "UART ile haberleşir; baudrate ayarlanmalıdır."
    },
    "E-Paper / E-Ink Ekran Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "MOSI", type: "spi.mosi", desc: "SPI veri girişi" },
            { label: "MISO", type: "spi.miso", desc: "SPI veri çıkışı" },
            { label: "SCK", type: "spi.sck", desc: "SPI saat" },
            { label: "CS", type: "spi.ss", desc: "Chip select" },
            { label: "DC", type: "digital", desc: "Data/Command" },
            { label: "RST", type: "digital", desc: "Reset" },
            { label: "BUSY", type: "digital", desc: "Meşgul sinyali" }
        ],
        notes: "Düşük güç tüketimi; yenileme yavaştır."
    },

    // ===== HABERLEŞME =====
    "HC-05 / HC-06 Bluetooth Seri Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "TX", type: "uart.tx", desc: "Modül TX (MCU RX)" },
            { label: "RX", type: "uart.rx", desc: "Modül RX (MCU TX)" }
        ],
        notes: "3.3V/5V toleranslı; HC-05 AT komutları ile yapılandırılır."
    },
    "ESP-01 (ESP8266) Wi-Fi Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "TX", type: "uart.tx", desc: "Modül TX (MCU RX)" },
            { label: "RX", type: "uart.rx", desc: "Modül RX (MCU TX)" },
            { label: "CH_PD", type: "digital", desc: "Chip enable (HIGH)" }
        ],
        notes: "3.3V ile beslenmeli; 5V'a doğrudan bağlamayın."
    },
    "NRF24L01+ 2.4GHz RF Kablosuz Modül": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "MOSI", type: "spi.mosi", desc: "SPI veri girişi" },
            { label: "MISO", type: "spi.miso", desc: "SPI veri çıkışı" },
            { label: "SCK", type: "spi.sck", desc: "SPI saat" },
            { label: "CSN", type: "spi.ss", desc: "SPI chip select" },
            { label: "CE", type: "digital", desc: "Chip enable" }
        ],
        notes: "3.3V ile çalışır; 5V sistemlerde seviye dönüştürücü gerekir."
    },
    "W5100 / ENC28J60 Ethernet Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "MOSI", type: "spi.mosi", desc: "SPI veri girişi" },
            { label: "MISO", type: "spi.miso", desc: "SPI veri çıkışı" },
            { label: "SCK", type: "spi.sck", desc: "SPI saat" },
            { label: "CS", type: "spi.ss", desc: "Chip select" }
        ],
        notes: "Ethernet bağlantısı için SPI kullanılır."
    },
    "LoRa (SX1278) Uzun Mesafe Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "MOSI", type: "spi.mosi", desc: "SPI veri girişi" },
            { label: "MISO", type: "spi.miso", desc: "SPI veri çıkışı" },
            { label: "SCK", type: "spi.sck", desc: "SPI saat" },
            { label: "NSS", type: "spi.ss", desc: "Chip select" },
            { label: "RST", type: "digital", desc: "Reset" },
            { label: "DIO0", type: "digital", desc: "Kesme pini" }
        ],
        notes: "Uzun mesafe düşük güç haberleşme."
    },
    "SIM800L GSM / GPRS Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "TX", type: "uart.tx", desc: "Modül TX (MCU RX)" },
            { label: "RX", type: "uart.rx", desc: "Modül RX (MCU TX)" }
        ],
        notes: "Yüksek akım çeker; güçlü bir kaynak gerekir (2A)."
    },
    "MCP2515 CAN Bus Arayüz Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "MOSI", type: "spi.mosi", desc: "SPI veri girişi" },
            { label: "MISO", type: "spi.miso", desc: "SPI veri çıkışı" },
            { label: "SCK", type: "spi.sck", desc: "SPI saat" },
            { label: "CS", type: "spi.ss", desc: "Chip select" },
            { label: "INT", type: "digital", desc: "Kesme pini (opsiyonel)" }
        ],
        notes: "CAN bus iletişimi; otomotiv uygulamaları."
    },
    "RS485 (MAX485) Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "DI", type: "uart.tx", desc: "Veri girişi (MCU TX)" },
            { label: "RO", type: "uart.rx", desc: "Veri çıkışı (MCU RX)" },
            { label: "DE/RE", type: "digital", desc: "Sürücü/alıcı enable" }
        ],
        notes: "RS485 çok noktalı endüstriyel haberleşme."
    },

    // ===== MODÜL / ÇEŞİTLİ =====
    "DS1302 RTC (Gerçek Zamanlı Saat)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "CLK", type: "digital", desc: "Saat pini" },
            { label: "DAT", type: "digital", desc: "Veri pini" },
            { label: "RST", type: "digital", desc: "Reset pini" }
        ],
        notes: "3 pin ile çalışır; pil yedeği gerekebilir."
    },
    "DS3231 Hassas RTC (Gerçek Zamanlı Saat)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat" }
        ],
        notes: "DS1302'ye göre daha hassastır; I2C adresi 0x68."
    },
    "MicroSD Kart Okuyucu Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "MOSI", type: "spi.mosi", desc: "SPI veri girişi" },
            { label: "MISO", type: "spi.miso", desc: "SPI veri çıkışı" },
            { label: "SCK", type: "spi.sck", desc: "SPI saat" },
            { label: "CS", type: "spi.ss", desc: "Chip select" }
        ],
        notes: "SPI modunda çalışır; SD kütüphanesi kullanın."
    },
    "DFPlayer Mini MicroSD MP3 Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "RX", type: "uart.tx", desc: "Modül RX (MCU TX)" },
            { label: "TX", type: "uart.rx", desc: "Modül TX (MCU RX)" }
        ],
        notes: "UART ile kontrol; ses çıkışı hoparlöre bağlanır."
    },
    "ISD1820 Ses Kayıt ve Çalma Modülü": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "REC", type: "digital", desc: "Kayıt tetikleme" },
            { label: "PLAYE", type: "digital", desc: "Kenar tetiklemeli oynatma" },
            { label: "PLAYL", type: "digital", desc: "Seviye tetiklemeli oynatma" }
        ],
        notes: "Ses kaydı ve oynatma; hoparlör bağlanır."
    },
    "Rotary Encoder (Döner Kodlayıcı)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "CLK", type: "digital", desc: "Saat çıkışı" },
            { label: "DT", type: "digital", desc: "Veri çıkışı" },
            { label: "SW", type: "digital", desc: "Buton (opsiyonel)" }
        ],
        notes: "Dönüş yönü ve adım sayısı okunur."
    },
    "Lojik Seviye Dönüştürücü (3.3V - 5V)": {
        pins: [
            { label: "HV", type: "power.vcc", desc: "Yüksek voltaj tarafı (5V)" },
            { label: "LV", type: "power.vcc", desc: "Düşük voltaj tarafı (3.3V)" },
            { label: "GND", type: "power.gnd", desc: "Ortak toprak" },
            { label: "HV1-HV4", type: "digital", count: 4, desc: "Yüksek voltaj kanalları" },
            { label: "LV1-LV4", type: "digital", count: 4, desc: "Düşük voltaj kanalları" }
        ],
        notes: "Farklı voltaj seviyelerindeki cihazları bağlamak için kullanılır."
    },
    "PCA9685 16-Kanal PWM/Servo Sürücü (I2C)": {
        pins: [
            { label: "VCC", type: "power.vcc" },
            { label: "GND", type: "power.gnd" },
            { label: "SDA", type: "i2c.sda", desc: "I2C veri" },
            { label: "SCL", type: "i2c.scl", desc: "I2C saat" }
        ],
        notes: "16 PWM çıkışı; servo sürücü olarak idealdir."
    }
};

/* =========================================
   BAĞLANTI REHBERİ MOTORU
========================================= */
let pinCounters = {};

function resetPinCounters() {
    pinCounters = {
        digital: 0,
        analog: 0,
        pwm: 0
    };
}

function getPinFromCategory(type, mcuPinout) {
    if (!mcuPinout) return "—";

    // Sabit güç pinleri
    if (type === "power.vcc") return mcuPinout.power ? mcuPinout.power.vcc : "Yok";
    if (type === "power.gnd") return mcuPinout.power ? mcuPinout.power.gnd : "Yok";

    // I2C/SPI/UART spesifik alt pinler
    if (type.startsWith("i2c.")) {
        const sub = type.split(".")[1];
        return mcuPinout.i2c ? (mcuPinout.i2c[sub] || "Yok") : "Yok";
    }
    if (type.startsWith("spi.")) {
        const sub = type.split(".")[1];
        return mcuPinout.spi ? (mcuPinout.spi[sub] || "Yok") : "Yok";
    }
    if (type.startsWith("uart.")) {
        const sub = type.split(".")[1];
        return mcuPinout.uart ? (mcuPinout.uart[sub] || "Yok") : "Yok";
    }

    // Genel kategoriler: digital, analog, pwm
    if (!mcuPinout[type]) return "Yok";
    const pins = mcuPinout[type];
    if (pins.length === 0) return "Yok";

    const idx = pinCounters[type] || 0;
    const assigned = pins[idx % pins.length];
    pinCounters[type] = idx + 1;
    return assigned;
}

function renderWiringGuide(mcuName, requiredComps, extraComps = []) {
    const container = document.getElementById('wiringGuideContainer');
    const content = document.getElementById('wiringGuideContent');
    if (!container || !content) return;

    const mcuPinout = MCU_PINOUTS[mcuName];
    if (!mcuPinout) {
        container.classList.add('hidden');
        return;
    }

    resetPinCounters();

    const allComps = [
        ...requiredComps.map(c => ({ ...c, isExtra: false })),
        ...extraComps.map(c => ({ ...c, isExtra: true }))
    ];

    let html = `<div class="wiring-guide">`;
    html += `<div class="wiring-item-header" style="margin-bottom: 8px;"><span class="wiring-item-title">🧠 ${mcuName}</span>`;
    if (mcuPinout.notes) {
        html += `<span class="wiring-note" style="margin-top:0;"><strong>Not:</strong> ${mcuPinout.notes}</span>`;
    }
    html += `</div>`;

    allComps.forEach(comp => {
        const pinoutDef = COMPONENT_PINOUTS[comp.name] || 
                         (CATEGORY_DEFAULTS[comp.category] ? { pins: CATEGORY_DEFAULTS[comp.category], notes: null } : { pins: [], notes: null });
        const pins = pinoutDef.pins || [];
        const notes = pinoutDef.notes;

        html += `<div class="wiring-item" style="border-color: ${comp.isExtra ? 'var(--accent-cyan)' : 'var(--surface-border)'};">`;
        html += `<div class="wiring-item-header">`;
        html += `<span class="wiring-item-title">${comp.name}</span>`;
        if (comp.isExtra) html += `<span class="wiring-item-category">ÖNERİLEN EKSTRA</span>`;
        html += `</div>`;

        html += `<div class="wiring-pin-list">`;
        pins.forEach(pin => {
            const count = pin.count || 1;
            for (let i = 0; i < count; i++) {
                const target = getPinFromCategory(pin.type, mcuPinout);
                const label = count > 1 ? `${pin.label}${i+1}` : pin.label;
                html += `<div class="wiring-pin">`;
                html += `<span class="wiring-pin-label">${label}</span>`;
                html += `<span class="wiring-pin-arrow">➜</span>`;
                html += `<span class="wiring-pin-target">${target}</span>`;
                if (pin.desc) {
                    html += `<span class="wiring-pin-desc">${pin.desc}</span>`;
                }
                html += `</div>`;
            }
        });
        html += `</div>`;

        if (notes) {
            html += `<div class="wiring-note"><strong>Not:</strong> ${notes}</div>`;
        }
        html += `</div>`;
    });

    html += `</div>`;
    content.innerHTML = html;
    container.classList.remove('hidden');
}

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
    
    // Bağlantı rehberini de gizle
    if (wiringGuideContainer) {
        wiringGuideContainer.classList.add('hidden');
    }
    
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
        date: new Date().toLocaleDateString('tr-TR'),
        completed: false
    };

    if (completeChallengeBtn) {
        completeChallengeBtn.disabled = false;
        completeChallengeBtn.innerHTML = '✅ Görevi Tamamla <span class="xp-chip">+' + (finalDiffObj.level * 15) + ' XP</span>';
    }

    // Bağlantı rehberini oluştur
    renderWiringGuide(finalMCU, selectedComps, extraComps);

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
    let text = `🚀 PUBU MAKER CHALLENGE\nZorluk: ${currentChallenge.diffId} (Seviye ${currentChallenge.diffLevel})\nSistem Beyni: ${currentChallenge.mcu}\n\nDonanımlar:\n${comps}\n`;

    // Bağlantı rehberini dahil et
    const wiringContent = document.getElementById('wiringGuideContent');
    if (wiringContent && !wiringContent.closest('.hidden')) {
        text += `\n🔌 BAĞLANTI REHBERİ:\n${wiringContent.innerText}\n`;
    }

    text += `\nProje Fikrim: [Buraya yaz...]`;

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

            const diffLevel = (currentChallenge && currentChallenge.diffLevel) || 1;
            gameState.timerFinishedCount++;
            const bonus = 20 + diffLevel * 5;
            addXP(bonus, ' — Kronometre süresinde tamamlandı! Projeni bitirebildin mi?');
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
   GAMIFICATION — XP, SEVİYE VE ROZET SİSTEMİ
   (Tamamen frontend, localStorage tabanlı)
========================================= */
const GAME_STORAGE_KEY = 'pubu_gamification_v1';

// Seviye merdiveni — gerçek bir mühendislik kariyer basamağı gibi kademeli yükselir.
const LEVELS = [
    { name: 'Devre Çırağı',        dative: "Devre Çırağı'na",        icon: '🔌', minXp: 0 },
    { name: 'Breadboard Kâşifi',   dative: "Breadboard Kâşifi'ne",   icon: '🧭', minXp: 100 },
    { name: 'Devre Mühendisi',     dative: "Devre Mühendisi'ne",     icon: '🔧', minXp: 250 },
    { name: 'Kıdemli Mühendis',    dative: "Kıdemli Mühendis'e",     icon: '🧰', minXp: 500 },
    { name: 'Sistem Mimarı',       dative: "Sistem Mimarı'na",       icon: '🏗️', minXp: 900 },
    { name: 'Baş Mühendis',        dative: "Baş Mühendis'e",         icon: '⚙️', minXp: 1400 },
    { name: 'Donanım Üstadı',      dative: "Donanım Üstadı'na",      icon: '🛠️', minXp: 2000 },
    { name: 'Elektronik Efsanesi', dative: "Elektronik Efsanesi'ne", icon: '👑', minXp: 3000 },
];

// Rozetler — her biri gameState üzerinden kontrol edilen bir koşula sahip
const BADGES = [
    { id: 'ilk_kivilcim',  icon: '⚡', name: 'İlk Kıvılcım',    desc: 'İlk XP\'ni kazandın.',                         check: s => s.xp >= 1 },
    { id: 'ilk_devre',     icon: '🔧', name: 'İlk Devre',        desc: 'İlk meydan okumanı tamamladın.',              check: s => s.completedCount >= 1 },
    { id: 'atolye_ustasi', icon: '🛠️', name: 'Atölye Ustası',    desc: '5 meydan okuma tamamladın.',                  check: s => s.completedCount >= 5 },
    { id: 'seri_uretim',   icon: '🏭', name: 'Seri Üretim',      desc: '20 meydan okuma tamamladın.',                 check: s => s.completedCount >= 20 },
    { id: 'zamanla_yarisan', icon: '⏱️', name: 'Zamanla Yarışan', desc: 'Kronometreyi 3 kez süresinde bitirdin.',    check: s => s.timerFinishedCount >= 3 },
    { id: 'zirve_fatihi',  icon: '🏔️', name: 'Zirve Fatihi',     desc: '"Dahi" seviyesinde bir görev tamamladın.',    check: s => s.maxDiffCompleted >= 6 },
    { id: 'yuz_xp',        icon: '✨', name: '100 XP Kulübü',    desc: 'Toplam 100 XP\'ye ulaştın.',                  check: s => s.xp >= 100 },
    { id: 'bin_xp',        icon: '💎', name: '1000 XP Efsanesi', desc: 'Toplam 1000 XP\'ye ulaştın.',                 check: s => s.xp >= 1000 },
];

function loadGameState() {
    try {
        const raw = localStorage.getItem(GAME_STORAGE_KEY);
        if (!raw) throw new Error('yok');
        const parsed = JSON.parse(raw);
        return {
            xp: parsed.xp || 0,
            completedCount: parsed.completedCount || 0,
            timerFinishedCount: parsed.timerFinishedCount || 0,
            maxDiffCompleted: parsed.maxDiffCompleted || 0,
            unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
        };
    } catch {
        return { xp: 0, completedCount: 0, timerFinishedCount: 0, maxDiffCompleted: 0, unlockedBadges: [] };
    }
}

function saveGameState() {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState));
}

let gameState = loadGameState();

function getLevelForXp(xp) {
    let current = LEVELS[0];
    for (const lvl of LEVELS) {
        if (xp >= lvl.minXp) current = lvl; else break;
    }
    return current;
}

function getNextLevel(xp) {
    return LEVELS.find(lvl => lvl.minXp > xp) || null;
}

function showToast(html, variant = '') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${variant}`.trim();
    toast.innerHTML = html;
    toastContainer.appendChild(toast);
    // CSS animasyonu (toastOut) bittiğinde elementi DOM'dan kaldır
    toast.addEventListener('animationend', (e) => {
        if (e.animationName === 'toastOut') toast.remove();
    });
    // Güvenlik ağı: animationend tetiklenmezse (ör. reduced-motion) 4.5sn sonra kaldır
    setTimeout(() => toast.remove(), 4500);
}

function renderXpPanel() {
    if (!xpLevelName) return;
    const level = getLevelForXp(gameState.xp);
    const nextLevel = getNextLevel(gameState.xp);

    xpLevelIcon.textContent = level.icon;
    xpLevelName.textContent = level.name;
    xpTotalText.textContent = `${gameState.xp} XP`;

    if (nextLevel) {
        const span = nextLevel.minXp - level.minXp;
        const progress = ((gameState.xp - level.minXp) / span) * 100;
        xpBarFill.style.width = `${Math.max(4, Math.min(100, progress))}%`;
        xpNextText.textContent = `${nextLevel.dative} ${nextLevel.minXp - gameState.xp} XP kaldı`;
    } else {
        xpBarFill.style.width = '100%';
        xpNextText.textContent = 'En üst seviyedesin — efsane oldun! 👑';
    }
}

function renderBadgesModal() {
    if (!badgesGrid) return;
    badgesGrid.innerHTML = BADGES.map(b => {
        const unlocked = gameState.unlockedBadges.includes(b.id);
        return `
            <div class="badge-card ${unlocked ? 'unlocked' : ''}">
                <span class="badge-icon">${b.icon}</span>
                <span class="badge-name">${b.name}</span>
                <span class="badge-desc">${unlocked ? b.desc : '🔒 Henüz kilitli'}</span>
            </div>
        `;
    }).join('');
}

// XP ekle: seviye atlama ve yeni rozetleri kontrol edip bildirim gösterir
function addXP(amount, reasonLabel) {
    const levelBefore = getLevelForXp(gameState.xp);
    gameState.xp += amount;

    showToast(`<strong>+${amount} XP</strong>${reasonLabel}`, '');

    const levelAfter = getLevelForXp(gameState.xp);
    if (levelAfter.minXp > levelBefore.minXp) {
        showToast(`<strong>🎉 Seviye Atladın!</strong>${levelAfter.icon} Artık bir ${levelAfter.name} oldun.`, 'toast-levelup');
        if (xpLevelIcon) {
            xpLevelIcon.classList.remove('level-up-pop');
            void xpLevelIcon.offsetWidth;
            xpLevelIcon.classList.add('level-up-pop');
        }
    }

    BADGES.forEach(b => {
        if (!gameState.unlockedBadges.includes(b.id) && b.check(gameState)) {
            gameState.unlockedBadges.push(b.id);
            showToast(`<strong>🏅 Yeni Rozet!</strong>${b.icon} ${b.name} — ${b.desc}`, 'toast-badge');
        }
    });

    saveGameState();
    renderXpPanel();
}

// "Görevi Tamamla" — bir meydan okuma başına yalnızca bir kez XP verir
completeChallengeBtn.addEventListener('click', () => {
    if (!currentChallenge || currentChallenge.completed) return;

    currentChallenge.completed = true;
    completeChallengeBtn.disabled = true;
    completeChallengeBtn.innerHTML = '✅ Tamamlandı';

    gameState.completedCount++;
    gameState.maxDiffCompleted = Math.max(gameState.maxDiffCompleted, currentChallenge.diffLevel || 1);

    const xpGain = (currentChallenge.diffLevel || 1) * 15;
    addXP(xpGain, ` — "${currentChallenge.diffId}" görevi tamamlandı`);
});

// Rozetler modalı aç/kapat
if (openBadgesBtn) {
    openBadgesBtn.addEventListener('click', () => {
        renderBadgesModal();
        badgesModal.classList.remove('hidden');
    });
}
if (closeBadgesBtn) {
    closeBadgesBtn.addEventListener('click', () => badgesModal.classList.add('hidden'));
}

// İlk yüklemede paneli doldur
renderXpPanel();

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