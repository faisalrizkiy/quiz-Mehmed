// =========================================================
// KONFIGURASI SUPABASE (DATABASE BARU)
// =========================================================
// 1. Buat project baru di https://supabase.com (gratis).
// 2. Buka project itu > Settings > API, lalu salin:
//    - "Project URL"      -> SUPABASE_URL
//    - "anon public" key  -> SUPABASE_KEY
// 3. Jalankan file database.sql (ada di folder yang sama)
//    lewat SQL Editor di dashboard Supabase-mu untuk membuat
//    tabel "leaderboard" beserta izin aksesnya.
// =========================================================
const SUPABASE_URL = "https://qogvmjnxmbwyzfkrfvie.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZ3Ztam54bWJ3eXpma3JmdmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODY3MzMsImV4cCI6MjEwMDQ2MjczM30.1r3B4_0RzRhFUBBM33bKeWh2eb-gfw0gqngLyBiwuRE";

let db = null;
try {
    if (!SUPABASE_URL.startsWith("GANTI_")) {
        db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) {
    console.warn("Supabase belum dikonfigurasi:", e);
}

// =========================================================
// ELEMEN
// =========================================================
const openingScreen = document.getElementById("openingScreen");
const startMenu = document.getElementById("startMenu");
const nameBox = document.getElementById("nameBox");
const quizBox = document.getElementById("quizBox");
const leaderboard = document.getElementById("leaderboard");
const quiz = document.getElementById("quiz");
const restartBtn = document.getElementById("restartBtn");
const quizLeaderBtn = document.getElementById("quizLeaderBtn");
const progressDots = document.getElementById("progressDots");
const leaderList = document.getElementById("leaderList");
const playerNameInput = document.getElementById("playerName");
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");

const QUESTIONS_PER_ROUND = 5;

// =========================================================
// MUSIK
// =========================================================
function toggleMusic() {
    if (bgm.paused) {
        bgm.play().catch(() => {});
        musicBtn.textContent = "🔊";
    } else {
        bgm.pause();
        musicBtn.textContent = "🔇";
    }
}

// =========================================================
// BANK SOAL
// =========================================================
const questionsBank = [
    { q: "Hasil 2² + 3² adalah?", opt: ["9", "13", "17", "21"], ans: 1 },
    { q: "Ibu kota Indonesia?", opt: ["Bandung", "Surabaya", "Jakarta", "Medan"], ans: 2 },
    { q: "Organ pemompa darah?", opt: ["Paru-paru", "Ginjal", "Jantung", "Usus"], ans: 2 },
    { q: "Rumus luas segitiga?", opt: ["a × t", "1/2 × a × t", "a + t", "2a × t"], ans: 1 },
    { q: "Planet terbesar?", opt: ["Mars", "Jupiter", "Saturnus", "Neptunus"], ans: 1 },
    { q: "Bahasa Inggris 'melihat'?", opt: ["See", "Saw", "Looked", "Seen"], ans: 0 },
    { q: "Simbol Oksigen?", opt: ["H", "O", "N", "C"], ans: 1 },
    { q: "7 × 8 =", opt: ["54", "56", "64", "58"], ans: 1 },
    { q: "3x + 4x =", opt: ["12x", "3x²", "7x", "1x"], ans: 2 },
    { q: "Ibu kota Jepang?", opt: ["Seoul", "Tokyo", "Kyoto", "Beijing"], ans: 1 },
    { q: "Proses tumbuhan membuat makanan?", opt: ["Respirasi", "Fotosintesis", "Difusi", "Reproduksi"], ans: 1 },
    { q: "Percepatan gravitasi bumi?", opt: ["8 m/s²", "9.8 m/s²", "10 m/s²", "12 m/s²"], ans: 1 },
    { q: "Simbol Carbon?", opt: ["C", "Co", "Ca", "Cr"], ans: 0 },
    { q: "Gunung tertinggi di dunia?", opt: ["K2", "Fuji", "Everest", "Denali"], ans: 2 },
    { q: "Ciri bilangan prima?", opt: ["Hanya 2 faktor", "Tak terbatas", "Faktor 3", "Bilangan genap"], ans: 0 },
    { q: "Bahasa Inggris 'makan'?", opt: ["Eat", "Ate", "Eaten", "Eating"], ans: 0 },
    { q: "5 + 7 × 2 =", opt: ["19", "24", "26", "17"], ans: 0 },
    { q: "Negara terbesar di dunia?", opt: ["China", "Kanada", "Rusia", "India"], ans: 2 },
    { q: "Warna primer?", opt: ["Merah", "Hijau", "Ungu", "Hitam"], ans: 0 },
    { q: "Ibu kota Malaysia?", opt: ["Kuala Lumpur", "Johor", "Penang", "Sabah"], ans: 0 },
];

let currentQuestions = [];
let index = 0;
let score = 0;
let username = "";
let answering = false;

// =========================================================
// UTIL
// =========================================================
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function switchTo(target) {
    [startMenu, nameBox, quizBox, leaderboard].forEach(el => {
        el.classList.remove("fadeIn");
        el.classList.add("hidden");
    });
    target.classList.remove("hidden");
    // force reflow so the fadeIn animation replays
    void target.offsetWidth;
    target.classList.add("fadeIn");
}

// =========================================================
// NAVIGASI
// =========================================================
function goToName() {
    switchTo(nameBox);
    bgm.play().catch(() => {});
    setTimeout(() => playerNameInput.focus(), 150);
}

function openLeaderboard() {
    switchTo(leaderboard);
    loadLeaderboard();
}

function backToMenu() {
    openingScreen.style.display = "none";
    switchTo(startMenu);
}

// =========================================================
// PROGRESS DOTS
// =========================================================
function buildProgressDots() {
    progressDots.innerHTML = "";
    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
        const dot = document.createElement("span");
        progressDots.appendChild(dot);
    }
}

function markDot(i, state) {
    const dot = progressDots.children[i];
    if (!dot) return;
    dot.classList.add("lit", state === "correct" ? "on-correct" : "on-wrong");
}

// =========================================================
// QUIZ
// =========================================================
function startGame() {
    const raw = playerNameInput.value.trim();
    username = raw ? raw.slice(0, 20) : "Pemain";

    switchTo(quizBox);

    index = 0;
    score = 0;
    answering = false;

    restartBtn.classList.add("hidden");
    quizLeaderBtn.classList.add("hidden");

    buildProgressDots();

    currentQuestions = shuffle([...questionsBank]).slice(0, QUESTIONS_PER_ROUND);
    showQuestion();
}

function showQuestion() {
    if (index >= currentQuestions.length) return endGame();

    answering = false;
    const q = currentQuestions[index];

    quiz.innerHTML = `
        <div class="question">${escapeHtml(q.q)}</div>
        ${q.opt.map((t, i) => `
            <button type="button" class="option" id="opt${i}" onclick="checkAnswer(${i})">
                ${escapeHtml(t)}
            </button>
        `).join("")}
    `;
}

function checkAnswer(i) {
    if (answering) return;
    answering = true;

    const correct = currentQuestions[index].ans;
    const chosen = document.getElementById("opt" + i);
    const correctOpt = document.getElementById("opt" + correct);

    document.querySelectorAll(".option").forEach(opt => opt.disabled = true);

    if (i === correct) {
        chosen.classList.add("correct");
        score += 20;
        markDot(index, "correct");
    } else {
        chosen.classList.add("wrong");
        correctOpt.classList.add("correct");
        markDot(index, "wrong");
    }

    setTimeout(() => {
        index++;
        showQuestion();
    }, 1000);
}

function endGame() {
    const passed = score >= 60;
    quiz.innerHTML = `
        <div class="resultScore">${username}, skormu ${score}/100 ${passed ? "🎉" : ""}</div>
        <div class="resultNote">${passed ? "Mantap, hasil bagus!" : "Terus berlatih, kamu pasti bisa lebih baik!"}</div>
    `;
    restartBtn.classList.remove("hidden");
    quizLeaderBtn.classList.remove("hidden");
    saveScore(username, score);
}

// =========================================================
// SUPABASE SAVE/LOAD
// =========================================================
async function saveScore(nama, skor) {
    if (!db) {
        console.warn("Skor tidak disimpan: Supabase belum dikonfigurasi.");
        return;
    }
    try {
        const { error } = await db.from("leaderboard").insert([{ nama, score: skor }]);
        if (error) console.error("Gagal menyimpan skor:", error.message);
    } catch (e) {
        console.error("Gagal menyimpan skor:", e);
    }
}

async function loadLeaderboard() {
    if (!db) {
        leaderList.innerHTML = `<div class="empty">Papan skor belum tersambung ke database. Lihat script.js untuk konfigurasi Supabase.</div>`;
        return;
    }

    leaderList.innerHTML = `<div class="empty">Memuat papan skor…</div>`;

    try {
        const { data, error } = await db
            .from("leaderboard")
            .select("*")
            .order("score", { ascending: false })
            .limit(20);

        if (error) throw error;

        if (!data || data.length === 0) {
            leaderList.innerHTML = `<div class="empty">Belum ada skor. Jadilah yang pertama!</div>`;
            return;
        }

        leaderList.innerHTML = "";
        data.forEach((row, i) => {
            let rankClass = "";
            if (i === 0) rankClass = "rank1";
            else if (i === 1) rankClass = "rank2";
            else if (i === 2) rankClass = "rank3";

            const div = document.createElement("div");
            div.className = `row leaderAnim ${rankClass}`;
            div.style.animationDelay = `${i * 0.08}s`;
            div.innerHTML = `
                <span class="rank">${i + 1}</span>
                <span class="name">${escapeHtml(row.nama)}${i === 0 ? ' <span class="crown">👑</span>' : ""}</span>
                <span class="score">${row.score}</span>
            `;
            leaderList.appendChild(div);
        });
    } catch (e) {
        console.error("Gagal memuat papan skor:", e);
        leaderList.innerHTML = `<div class="empty">Gagal memuat papan skor. Coba lagi nanti.</div>`;
    }
}

// =========================================================
// OPENING SCREEN
// =========================================================
setTimeout(() => {
    openingScreen.style.display = "none";
    // startAnim cuma dipakai sekali untuk animasi masuk pertama.
    // Kalau dibiarkan, class ini bikin startMenu nunggu delay 1.3s
    // lagi setiap kali disembunyikan lalu dimunculkan (mis. tombol
    // "Kembali"), makanya dilepas di sini biar transisi berikutnya
    // langsung pakai fadeIn tanpa jeda.
    startMenu.classList.remove("startAnim");
}, 2400);
