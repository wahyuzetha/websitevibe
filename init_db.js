import mysql from 'mysql2/promise';

async function initDb() {
  const connection = await mysql.createConnection({
    uri: "mysql://root:@localhost:3306/websitevibe_db"
  });

  const queries = [
    `CREATE TABLE IF NOT EXISTS settings (\`key\` VARCHAR(255) PRIMARY KEY, \`value\` TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS advantages (id INT AUTO_INCREMENT PRIMARY KEY, icon VARCHAR(50), title VARCHAR(255), description TEXT);`,
    `CREATE TABLE IF NOT EXISTS gallery (id INT AUTO_INCREMENT PRIMARY KEY, image_url VARCHAR(500), title VARCHAR(255));`,
    `CREATE TABLE IF NOT EXISTS careers (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT);`,
    `CREATE TABLE IF NOT EXISTS testimonials (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), rating INT DEFAULT 5, text TEXT);`,
    `CREATE TABLE IF NOT EXISTS faqs (id INT AUTO_INCREMENT PRIMARY KEY, question TEXT, answer TEXT);`
  ];

  for (const q of queries) {
    try { await connection.query(q); } catch(e) { console.log(e.message); }
  }

  // Insert default settings if empty
  try {
     const [rows] = await connection.query("SELECT COUNT(*) as cnt FROM settings");
     if(rows[0].cnt === 0) {
        const defaultSettings = {
           hero_title: "Jurusan Telkom — Siap Kerja, Siap Kuliah, Siap Masa Depan",
           hero_subtitle: "Belajar teknologi jaringan, internet, komunikasi digital, dan keterampilan industri modern bersama SMK Karya Nugraha Boyolali.",
           hero_btn1: "Daftar Sekarang",
           hero_btn2: "Lihat Keunggulan",
           tentang_desc: "Jurusan Telkom mempelajari teknologi jaringan komputer, komunikasi digital, fiber optik, serta sistem telekomunikasi modern yang dibutuhkan dunia industri.",
           tentang_list: "Jaringan Komputer, Fiber Optik, Konfigurasi Router, Internet & Telekomunikasi, Praktik Industri",
           stat1_label: "Siswa", stat1_val: "500",
           stat2_label: "Alumni Bekerja", stat2_val: "100",
           stat3_label: "Mitra Industri", stat3_val: "20",
           stat4_label: "Prestasi", stat4_val: "15",
           school_name: "SMK Karya Nugraha Boyolali",
           school_address: "Jl. Pandanaran No.123, Boyolali",
           school_maps: "https://maps.google.com",
           school_wa: "+62 812-3456-7890",
           school_email: "info@smkknboyolali.sch.id",
           school_ig: "https://instagram.com",
           school_tiktok: "https://tiktok.com"
        };
        for(const [k, v] of Object.entries(defaultSettings)) {
            await connection.query("INSERT INTO settings (`key`, `value`) VALUES (?, ?)", [k, v]);
        }
        
        // Seed lists too
        await connection.query("INSERT INTO advantages (icon, title, description) VALUES ('💻', 'Praktik Langsung', 'Belajar dengan metode praktik langsung di lapangan.'), ('🏢', 'Lab Modern', 'Fasilitas laboratorium dengan perangkat industri terbaru.')");
        await connection.query("INSERT INTO faqs (question, answer) VALUES ('Apa itu jurusan Telkom?', 'Jurusan Telkom mempelajari ilmu komputer dan jaringan internet.')");
     }
  } catch(e) { console.log("Seeding failed: ", e.message); }

  console.log("DB Content Init Done");
  process.exit(0);
}

initDb();
