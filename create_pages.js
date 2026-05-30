const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Extract Navbar and Footer parts
const headMatch = indexHtml.match(/(<!DOCTYPE html>.*?<\/nav>)/s);
const footerMatch = indexHtml.match(/(<footer class="footer">.*?<\/html>)/s);

const headTemplate = headMatch ? headMatch[1] : '';
const footerTemplate = footerMatch ? footerMatch[1] : '';

// Helper to wrap content
function createPage(title, content) {
    let page = headTemplate.replace(/<title>.*?<\/title>/, `<title>${title} - SMK Karya Nugraha Boyolali</title>`);
    page += `\n\n  <div class="page-header" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; padding: 100px 0 50px 0; text-align: center;">
    <div class="container">
      <h1 style="font-size: 2.5rem; margin-bottom: 15px;">${title}</h1>
    </div>
  </div>\n\n`;
    page += content;
    page += '\n\n' + footerTemplate;
    return page;
}

// 1. Tentang.html
const tentangContent = `
  <section id="tentang" class="section">
    <div class="container">
      <div class="tentang-wrapper" style="display:flex; flex-wrap:wrap; gap:40px; align-items:center;">
        <div class="tentang-img" style="flex:1; min-width:300px;">
          <img src="/img/siswa.jpg" alt="Siswa Jurusan Telkom" style="width:100%; border-radius:15px; box-shadow: var(--shadow);">
        </div>
        <div class="tentang-text" style="flex:1; min-width:300px;">
          <h2>Tentang <span class="highlight">Jurusan</span></h2>
          <p id="tentang_desc">Jurusan Teknik Telekomunikasi didesain khusus untuk menghasilkan lulusan yang kompeten di bidang instalasi jaringan fiber optic, administrasi server, keamanan jaringan, dan komunikasi digital modern. Didukung laboratorium berstandar industri dan pengajar profesional.</p>
          <ul class="check-list" id="tentang_list_ul">
            <li><i>✓</i> Lab Fiber Optic Terlengkap</li>
            <li><i>✓</i> Sertifikasi Mikrotik Academy</li>
            <li><i>✓</i> Kerja Sama Industri (Telkom, ISP Lokal)</li>
            <li><i>✓</i> Pengajar Praktisi Ahli</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
`;
fs.writeFileSync('public/tentang.html', createPage('Tentang Jurusan', tentangContent));

// 2. Keunggulan.html
const keunggulanContent = `
  <section id="keunggulan" class="section bg-light">
    <div class="container">
      <div class="section-title">
        <h2>Keunggulan <span class="highlight">Jurusan</span></h2>
        <p>Alasan mengapa Anda harus memilih jurusan kami.</p>
      </div>
      <div class="advantages-grid" id="advantages_container">
        <!-- Rendered by JS -->
      </div>
    </div>
  </section>
`;
fs.writeFileSync('public/keunggulan.html', createPage('Keunggulan', keunggulanContent));

// 3. Galeri.html
const galeriContent = `
  <section id="galeri" class="section">
    <div class="container">
      <div class="section-title">
        <h2>Galeri <span class="highlight">Kegiatan</span></h2>
        <p>Momen-momen berharga selama pembelajaran.</p>
      </div>
      <div class="galeri-grid" id="gallery_container">
        <!-- Rendered by JS -->
      </div>
    </div>
  </section>
`;
fs.writeFileSync('public/galeri.html', createPage('Galeri Kegiatan', galeriContent));

// 4. Karier.html
const karierContent = `
  <section id="karier" class="section bg-light">
    <div class="container">
      <div class="section-title">
        <h2>Prospek <span class="highlight">Karier</span></h2>
        <p>Pilihan jalur profesional bagi lulusan kami.</p>
      </div>
      <div class="karier-list" id="careers_container">
        <!-- Karier render -->
      </div>
    </div>
  </section>
`;
fs.writeFileSync('public/karier.html', createPage('Prospek Karier', karierContent));

// 5. FAQ.html
const faqContent = `
  <section id="faq" class="section">
    <div class="container">
      <div class="section-title">
        <h2>FAQ <span class="highlight">(Tanya Jawab)</span></h2>
      </div>
      <div class="faq-container accordion" id="faqs_container">
        <!-- FAQ Render -->
      </div>
    </div>
  </section>
`;
fs.writeFileSync('public/faq.html', createPage('Tanya Jawab (FAQ)', faqContent));

// 6. Kontak.html
const kontakContent = `
  <section id="kontak" class="section bg-light">
    <div class="container">
      <div class="section-title">
        <h2>Hubungi <span class="highlight">Kami</span></h2>
        <p>Ada pertanyaan? Jangan ragu untuk menghubungi kami.</p>
      </div>
      <div class="contact-wrapper">
        <div class="contact-info">
          <div class="info-card">
            <h3>Alamat</h3>
            <p id="school_address">📍 Memuat alamat...</p>
          </div>
          <div class="info-card">
            <h3>Hubungi</h3>
            <p id="school_wa">📞 Memuat telepon...</p>
            <p id="school_email">✉️ Memuat email...</p>
          </div>
          <div class="info-card">
            <h3>Sosial Media</h3>
            <div class="social-links">
              <a href="#" id="school_ig" target="_blank" class="btn btn-outline">Instagram</a>
              <a href="#" id="school_tiktok" target="_blank" class="btn btn-outline">TikTok</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
fs.writeFileSync('public/kontak.html', createPage('Hubungi Kami', kontakContent));

console.log("Semua halaman berhasil digenerate!");
