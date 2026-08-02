-- =========================================================
-- SKEMA DATABASE BARU UNTUK KUIS SERU
-- Jalankan seluruh isi file ini di:
-- Supabase Dashboard > SQL Editor > New query > Run
-- =========================================================

-- 1) Tabel leaderboard
create table if not exists public.leaderboard (
    id bigint generated always as identity primary key,
    nama text not null check (char_length(nama) between 1 and 20),
    score int not null check (score >= 0 and score <= 100),
    created_at timestamptz not null default now()
);

-- Index supaya query "urutkan berdasarkan skor tertinggi" cepat
create index if not exists leaderboard_score_idx
    on public.leaderboard (score desc);

-- 2) Aktifkan Row Level Security (wajib di Supabase)
alter table public.leaderboard enable row level security;

-- 3) Izinkan siapa saja MEMBACA papan skor
create policy "Leaderboard bisa dibaca semua orang"
    on public.leaderboard
    for select
    to anon
    using (true);

-- 4) Izinkan siapa saja MENAMBAH skor baru (tidak bisa edit/hapus punya orang lain)
create policy "Siapa saja boleh menambah skor"
    on public.leaderboard
    for insert
    to anon
    with check (true);
