// =========================================================
// PASSWORD ADMIN
// =========================================================
// GANTI password ini sebelum dipakai beneran. Ini cuma gerbang
// tampilan biasa (dicek di browser) — bukan keamanan tingkat
// tinggi, karena SUPABASE_URL & SUPABASE_KEY di script.js sudah
// public dan siapa pun yang buka DevTools tetap bisa query tabel
// leaderboard langsung. Untuk proteksi yang beneran kuat, perlu
// Supabase Auth + Row Level Security (RLS) di sisi database.
const ADMIN_PASSWORD = "GANTI_PASSWORD_INI";

// =========================================================
// SUPABASE (pakai config yang sama dengan script.js)
// =========================================================
const SUPABASE_URL = "https://qogvmjnxmbwyzfkrfvie.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZ3Ztam54bWJ3eXpma3JmdmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODY3MzMsImV4cCI6MjEwMDQ2MjczM30.1r3B4_0RzRhFUBBM33bKeWh2eb-gfw0gqngLyBiwuRE";

let db = null;
try {
    db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.warn("Supabase belum dikonfigurasi:", e);
}

// =========================================================
// ELEMEN
// =========================================================
const adminLogin = document.getElementById("adminLogin");
const adminPanel = document.getElementById("adminPanel");
const adminPass = document.getElementById("adminPass");
const loginError = document.getElementById("loginError");
const adminStats = document.getElementById("adminStats");
const adminList = document.getElementById("adminList");
const searchName = document.getElementById("searchName");

let allRows = [];

// =========================================================
// LOGIN / LOGOUT
// (sessionStorage: status login hilang otomatis kalau tab ditutup)
// =========================================================
function tryLogin() {
    if (adminPass.value === ADMIN_PASSWORD) {
        sessionStorage.setItem("isAdmin", "1");
        showPanel();
    } else {
        loginError.classList.remove("hidden");
        adminPass.value = "";
        adminPass.focus();
    }
}

function logout() {
    sessionStorage.removeItem("isAdmin");
    adminPanel.classList.add("hidden");
    adminLogin.classList.remove("hidden");
    adminPass.value = "";
}

function showPanel() {
    adminLogin.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadAllScores();
}

adminPass.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin();
});

if (sessionStorage.getItem("isAdmin") === "1") {
    showPanel();
}

// =========================================================
// UTIL
// =========================================================
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

// =========================================================
// AMBIL SEMUA DATA
// =========================================================
async function loadAllScores() {
    if (!db) {
        adminList.innerHTML = `<div class="empty">Supabase belum dikonfigurasi.</div>`;
        return;
    }

    adminList.innerHTML = `<div class="empty">Memuat data…</div>`;

    try {
        const { data, error } = await db
            .from("leaderboard")
            .select("*")
            .order("id", { ascending: false })
            .limit(500);

        if (error) throw error;

        allRows = data || [];
        renderStats();
        renderRows();
    } catch (e) {
        console.error("Gagal memuat data admin:", e);
        adminList.innerHTML = `<div class="empty">Gagal memuat data. Coba lagi nanti.</div>`;
    }
}

// =========================================================
// STATISTIK RINGKAS
// =========================================================
function renderStats() {
    const total = allRows.length;
    const avg = total ? Math.round(allRows.reduce((s, r) => s + (r.score || 0), 0) / total) : 0;
    const highest = total ? Math.max(...allRows.map(r => r.score || 0)) : 0;

    adminStats.innerHTML = `
        <div class="statBox"><span class="statNum">${total}</span><span class="statLabel">Total main</span></div>
        <div class="statBox"><span class="statNum">${avg}</span><span class="statLabel">Rata-rata</span></div>
        <div class="statBox"><span class="statNum">${highest}</span><span class="statLabel">Tertinggi</span></div>
    `;
}

// =========================================================
// RENDER DAFTAR (dengan filter pencarian nama)
// =========================================================
function renderRows() {
    const q = searchName.value.trim().toLowerCase();
    const rows = q
        ? allRows.filter(r => (r.nama || "").toLowerCase().includes(q))
        : allRows;

    if (rows.length === 0) {
        adminList.innerHTML = `<div class="empty">Tidak ada data yang cocok.</div>`;
        return;
    }

    adminList.innerHTML = "";
    rows.forEach(row => {
        const div = document.createElement("div");
        div.className = "row adminRow";
        div.innerHTML = `
            <span class="name">${escapeHtml(row.nama || "-")}</span>
            <span class="adminDate">${formatDate(row.created_at)}</span>
            <span class="score">${row.score ?? "-"}</span>
        `;
        adminList.appendChild(div);
    });
}
