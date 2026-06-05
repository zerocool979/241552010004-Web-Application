// ==========================================
// 1. LOGIKA DARK MODE TOGGLE (LOCALSTORAGE)
// ==========================================
const themeBtn = document.querySelector('#theme-btn');

// Fungsi untuk memperbarui teks tombol tema
function perbaruiTeksTombol(isGelap) {
  themeBtn.textContent = isGelap ? 'Mode Terang' : 'Mode Gelap';
}

// Cek preferensi tema yang tersimpan di localStorage saat pertama dimuat
if (localStorage.getItem('tema') === 'gelap') {
  document.body.classList.add('gelap');
  perbaruiTeksTombol(true);
} else {
  perbaruiTeksTombol(false);
}

// Event handler klik tombol ganti tema
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('gelap');
  const isGelap = document.body.classList.contains('gelap');
  
  // Simpan status state ke dalam localStorage
  localStorage.setItem('tema', isGelap ? 'gelap' : 'terang');
  perbaruiTeksTombol(isGelap);
});


// ==========================================
// 2. LOGIKA COMPONENT UI: TAB NAVIGATION
// ==========================================
function gantiTab(idPanel) {
  // Hapus kelas aktif dari semua panel dan semua tombol tab
  document.querySelectorAll('.panel, .tombol-tab').forEach(el => {
    el.classList.remove('aktif');
  });

  // Tambahkan kelas aktif pada panel target
  document.querySelector('#' + idPanel).classList.add('aktif');

  // Tambahkan kelas aktif pada tombol tab yang diklik
  document.querySelector(`[data-tab="${idPanel}"]`).classList.add('aktif');
}

// Daftarkan event listener untuk semua tombol tab navigation
document.querySelectorAll('.tombol-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    gantiTab(btn.dataset.tab);
  });
});


// ==========================================
// 3. LOGIKA COMPONENT UI: ACCORDION
// ==========================================
document.querySelectorAll('.judul-akordion').forEach(tombol => {
  tombol.addEventListener('click', () => {
    const itemSaatIni = tombol.closest('.item-akordion');
    const konten = itemSaatIni.querySelector('.konten-akordion');
    
    // Cek apakah item ini sudah terbuka
    const sudahTerbuka = itemSaatIni.classList.contains('terbuka');

    // Tutup seluruh accordion lain terlebih dahulu (Sifat eksklusif)
    document.querySelectorAll('.item-akordion').forEach(item => {
      item.classList.remove('terbuka');
      item.querySelector('.konten-akordion').style.maxHeight = null;
    });

    // Jika sebelumnya belum terbuka, buka item yang diklik
    if (!sudahTerbuka) {
      itemSaatIni.classList.add('terbuka');
      // Menggunakan scrollHeight agar animasi max-height CSS berjalan mulus dan dinamis
      konten.style.maxHeight = konten.scrollHeight + "px";
    }
  });
});


// ==========================================
// 4. LOGIKA REAL-TIME FORM VALIDATION
// ==========================================

/**
 * Fungsi pembantu validasi yang reusable (dapat digunakan kembali)
 * @param {string} id - ID Elemen Input HTML
 * @param {function} aturan - Fungsi callback penentu aturan validasi (mengembalikan boolean)
 * @param {string} pesan - Pesan kesalahan jika tidak lolos validasi
 */
function validasi(id, aturan, pesan) {
  const el = document.querySelector("#" + id);
  const errSpan = el.nextElementSibling; // Mencari elemen span pesan-error setelah input
  
  // Ambil value tanpa spasi di awal/akhir
  const nilaiUji = el.value.trim();
  const lulus = aturan(nilaiUji);

  // Jika input masih kosong, jangan tampilkan feedback visual merah/error dulu
  if (el.value === "") {
    el.classList.remove('valid', 'invalid');
    if (errSpan && errSpan.classList.contains('pesan-error')) errSpan.textContent = "";
    return false;
  }

  // Manipulasi class DOM sesuai hasil pengujian aturan
  el.classList.toggle('valid', lulus);
  el.classList.toggle('invalid', !lulus);

  // Ubah konten teks pesan error di bawah field input
  if (errSpan && errSpan.classList.contains('pesan-error')) {
    errSpan.textContent = lulus ? "" : pesan;
  }

  return lulus;
}

// Memasang Event Listener tipe 'input' agar validasi berjalan langsung saat mengetik
const inputNama = document.querySelector('#nama');
inputNama.addEventListener('input', () => {
  validasi('nama', v => v.length >= 3, 'Nama lengkap minimal berisi 3 karakter.');
});

const inputEmail = document.querySelector('#email');
inputEmail.addEventListener('input', () => {
  // Regex standar untuk pengujian format alamat email umum
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  validasi('email', v => regexEmail.test(v), 'Format penulisan alamat email tidak valid.');
});

const inputPassword = document.querySelector('#password');
inputPassword.addEventListener('input', (e) => {
  // 1. Validasi teks standar minimal 8 karakter
  validasi('password', v => v.length >= 8, 'Password wajib minimal 8 karakter.');

  // 2. Penghitungan Visual Kekuatan Password (Strength Bar)
  const isianKekuatan = document.querySelector('.isian-kekuatan');
  const panjangText = e.target.value.length;
  
  // Hitung persentase bar (maksimal 100% pada panjang 12 karakter)
  const persen = Math.min((panjangText / 12) * 100, 100);
  isianKekuatan.style.width = persen + '%';

  // Penentuan warna bar berdasarkan panjang karakter input
  if (panjangText === 0) {
    isianKekuatan.style.width = '0%';
  } else if (panjangText < 5) {
    isianKekuatan.style.background = '#e54b5a'; // Merah (Lemah)
  } else if (panjangText < 9) {
    isianKekuatan.style.background = '#ff9933'; // Oranye (Sedang)
  } else {
    isianKekuatan.style.background = '#27c467'; // Hijau (Kuat)
  }
});


// ==========================================
// 5. PENANGANAN SUBMIT FORMULIR
// ==========================================
const formulir = document.querySelector('#formulir');
const notifSukses = document.querySelector('#sukses');

formulir.addEventListener('submit', (e) => {
  e.preventDefault(); // Mencegah reload halaman bawaan browser

  // Jalankan fungsi validasi secara serentak ke semua field saat tombol submit ditekan
  const namaValid = validasi('nama', v => v.length >= 3, 'Nama lengkap minimal berisi 3 karakter.');
  const emailValid = validasi('email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Format penulisan alamat email tidak valid.');
  const passValid = validasi('password', v => v.length >= 8, 'Password wajib minimal 8 karakter.');

  // Memastikan array mengembalikan nilai true untuk semua pengecekan
  const formulirValid = [namaValid, emailValid, passValid].every(Boolean);

  if (!formulirValid) {
    // Jika ada satu saja field yang gagal validasi, hentikan proses submit
    alert('Silakan lengkapi seluruh kolom formulir dengan benar terlebih dahulu!');
    return;
  }

  // Jika sukses tervalidasi semua, sembunyikan form dan munculkan pesan sukses
  formulir.classList.add('tersembunyi');
  notifSukses.classList.remove('tersembunyi');
});
