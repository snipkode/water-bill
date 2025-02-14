/*
  # Sistem Langganan Air

  1. Tabel Baru
    - `pelanggan`
      - Informasi dasar pelanggan
      - Melacak detail dan status pelanggan
    - `meteran`
      - Informasi meteran air
      - Menghubungkan ke pelanggan dan melacak detail meteran
    - `pembacaan`
      - Pembacaan meteran bulanan
      - Melacak penggunaan dan data tagihan
    - `tagihan`
      - Tagihan bulanan
      - Melacak status pembayaran dan jumlah
    - `diskusi`
      - Forum diskusi/komplain/status tagihan belum diverifikasi
      - Sarana mediasi antara pelanggan dan admin
    - `user_sessions`
      - Melacak sesi pengguna
    - `roles`
      - Menyimpan informasi role pengguna
    - `user_roles`
      - Menghubungkan pengguna dengan role mereka

  2. Keamanan
    - Mengaktifkan RLS pada semua tabel
    - Kebijakan untuk pengguna yang terautentikasi
*/

SET TIME ZONE 'Asia/Jakarta';

-- Tabel Pelanggan
CREATE TABLE IF NOT EXISTS pelanggan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  nama_lengkap text NOT NULL,
  alamat text NOT NULL,
  nomor_telepon text,
  email text NOT NULL,
  aktif boolean DEFAULT true,
  dibuat_pada timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Tabel Meteran
CREATE TABLE IF NOT EXISTS meteran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pelanggan_id uuid REFERENCES pelanggan(id),
  nomor_meteran text UNIQUE NOT NULL,
  tanggal_instalasi date NOT NULL,
  pembacaan_terakhir numeric(10,2) DEFAULT 0,
  dibuat_pada timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now(),
  komentar text -- Menambahkan kolom komentar untuk meteran yang di-upload tidak sesuai dengan tagihan
);

-- Tabel Pembacaan
CREATE TABLE IF NOT EXISTS pembacaan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meteran_id uuid REFERENCES meteran(id),
  tanggal_pembacaan date NOT NULL,
  pembacaan_saat_ini numeric(10,2) NOT NULL,
  penggunaan numeric(10,2) NOT NULL,
  dibuat_pada timestamptz DEFAULT now()
);

-- Tabel Tagihan
CREATE TABLE IF NOT EXISTS tagihan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pembacaan_id uuid REFERENCES pembacaan(id),
  pelanggan_id uuid REFERENCES pelanggan(id),
  tanggal_tagihan date NOT NULL,
  jumlah numeric(10,2) NOT NULL,
  status text DEFAULT 'belum_dibayar' CHECK (status IN ('dibayar', 'belum_dibayar', 'terlambat')),
  tanggal_jatuh_tempo date NOT NULL,
  tanggal_dibayar timestamptz,
  dibuat_pada timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now()
);

-- Tabel Diskusi
CREATE TABLE IF NOT EXISTS diskusi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tagihan_id uuid REFERENCES tagihan(id),
  user_id uuid REFERENCES auth.users(id),
  pesan text NOT NULL,
  status text DEFAULT 'belum_diverifikasi' CHECK (status IN ('belum_diverifikasi', 'diverifikasi', 'ditolak')),
  dibuat_pada timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now()
);

-- Tabel User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  login_time timestamptz DEFAULT now(),
  logout_time timestamptz,
  is_active boolean DEFAULT true
);

-- Tabel Roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL
);

-- Tabel User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  role_id uuid REFERENCES roles(id)
);

-- Mengaktifkan RLS
ALTER TABLE pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE meteran ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembacaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE diskusi ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Kebijakan
CREATE POLICY "Pengguna dapat melihat data pelanggan mereka sendiri"
  ON pelanggan FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat melihat meteran mereka sendiri"
  ON meteran FOR SELECT
  TO authenticated
  USING (pelanggan_id IN (
    SELECT id FROM pelanggan WHERE user_id = auth.uid()
  ));

CREATE POLICY "Pengguna dapat melihat pembacaan mereka sendiri"
  ON pembacaan FOR SELECT
  TO authenticated
  USING (meteran_id IN (
    SELECT id FROM meteran WHERE pelanggan_id IN (
      SELECT id FROM pelanggan WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Pengguna dapat melihat tagihan mereka sendiri"
  ON tagihan FOR SELECT
  TO authenticated
  USING (pelanggan_id IN (
    SELECT id FROM pelanggan WHERE user_id = auth.uid()
  ));

CREATE POLICY "Pengguna dapat melihat diskusi mereka sendiri"
  ON diskusi FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat melihat sesi mereka sendiri"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat melihat role mereka sendiri"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Kebijakan untuk admin
CREATE POLICY "Admin dapat mengupdate tagihan"
  ON tagihan FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.role_name = 'admin'));

CREATE POLICY "Admin dapat mengupdate meteran"
  ON meteran FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.role_name = 'admin'));

CREATE POLICY "Admin dapat mengupdate pembacaan"
  ON pembacaan FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.role_name = 'admin'));

CREATE POLICY "Admin dapat mengupdate pelanggan"
  ON pelanggan FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.role_name = 'admin'));

CREATE POLICY "Admin dapat mengupdate diskusi"
  ON diskusi FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.role_name = 'admin'));

CREATE POLICY "Admin dapat mengupdate sesi pengguna"
  ON user_sessions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.role_name = 'admin'));

-- Dummy Data

-- Data Roles
INSERT INTO roles (id, role_name)
VALUES
  (gen_random_uuid(), 'admin'),
  (gen_random_uuid(), 'officer'),
  (gen_random_uuid(), 'customer');

-- Data Pelanggan
INSERT INTO pelanggan (id, user_id, nama_lengkap, alamat, nomor_telepon, email, aktif, dibuat_pada, diperbarui_pada, last_active)
VALUES
  (gen_random_uuid(), 'user-uuid-1', 'Budi Santoso', 'Jl. Merdeka No. 1', '081234567890', 'budi@example.com', true, now(), now(), now()),
  (gen_random_uuid(), 'user-uuid-2', 'Siti Aminah', 'Jl. Sudirman No. 2', '081234567891', 'siti@example.com', true, now(), now(), now());

-- Data User Roles
INSERT INTO user_roles (id, user_id, role_id)
VALUES
  (gen_random_uuid(), 'user-uuid-1', (SELECT id FROM roles WHERE role_name = 'customer')),
  (gen_random_uuid(), 'user-uuid-2', (SELECT id FROM roles WHERE role_name = 'customer'));

-- Data Meteran
INSERT INTO meteran (id, pelanggan_id, nomor_meteran, tanggal_instalasi, pembacaan_terakhir, dibuat_pada, diperbarui_pada, komentar)
VALUES
  (gen_random_uuid(), (SELECT id FROM pelanggan WHERE nama_lengkap = 'Budi Santoso'), 'MTR-001', '2023-01-01', 100.0, now(), now(), 'Meteran baru diinstal'),
  (gen_random_uuid(), (SELECT id FROM pelanggan WHERE nama_lengkap = 'Siti Aminah'), 'MTR-002', '2023-01-01', 150.0, now(), now(), 'Meteran baru diinstal');

-- Data Pembacaan
INSERT INTO pembacaan (id, meteran_id, tanggal_pembacaan, pembacaan_saat_ini, penggunaan, dibuat_pada)
VALUES
  (gen_random_uuid(), (SELECT id FROM meteran WHERE nomor_meteran = 'MTR-001'), '2023-02-01', 120.0, 20.0, now()),
  (gen_random_uuid(), (SELECT id FROM meteran WHERE nomor_meteran = 'MTR-002'), '2023-02-01', 170.0, 20.0, now());

-- Data Tagihan
INSERT INTO tagihan (id, pembacaan_id, pelanggan_id, tanggal_tagihan, jumlah, status, tanggal_jatuh_tempo, dibuat_pada, diperbarui_pada)
VALUES
  (gen_random_uuid(), (SELECT id FROM pembacaan WHERE meteran_id = (SELECT id FROM meteran WHERE nomor_meteran = 'MTR-001')), (SELECT id FROM pelanggan WHERE nama_lengkap = 'Budi Santoso'), '2023-02-05', 200000.0, 'belum_dibayar', '2023-02-20', now(), now()),
  (gen_random_uuid(), (SELECT id FROM pembacaan WHERE meteran_id = (SELECT id FROM meteran WHERE nomor_meteran = 'MTR-002')), (SELECT id FROM pelanggan WHERE nama_lengkap = 'Siti Aminah'), '2023-02-05', 250000.0, 'belum_dibayar', '2023-02-20', now(), now());

-- Data Diskusi
INSERT INTO diskusi (id, tagihan_id, user_id, pesan, status, dibuat_pada, diperbarui_pada)
VALUES
  (gen_random_uuid(), (SELECT id FROM tagihan WHERE pelanggan_id = (SELECT id FROM pelanggan WHERE nama_lengkap = 'Budi Santoso')), 'user-uuid-1', 'Tagihan saya terlalu tinggi, mohon dicek kembali.', 'belum_diverifikasi', now(), now()),
  (gen_random_uuid(), (SELECT id FROM tagihan WHERE pelanggan_id = (SELECT id FROM pelanggan WHERE nama_lengkap = 'Siti Aminah')), 'user-uuid-2', 'Pembacaan meteran tidak sesuai dengan penggunaan saya.', 'belum_diverifikasi', now(), now());

-- Data User Sessions
INSERT INTO user_sessions (id, user_id, login_time, logout_time, is_active)
VALUES
  (gen_random_uuid(), 'user-uuid-1', now(), NULL, true),
  (gen_random_uuid(), 'user-uuid-2', now(), NULL, true);