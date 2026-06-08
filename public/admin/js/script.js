document.addEventListener('DOMContentLoaded', () => {

    // Login logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Memproses...';
            btn.style.opacity = '0.7';

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    window.location.href = 'index.html';
                } else {
                    alert('Login gagal: ' + data.message);
                    btn.innerHTML = originalText;
                    btn.style.opacity = '1';
                }
            } catch (err) {
                alert('Terjadi kesalahan koneksi.');
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
            }
        });
        return; // Stop further execution since we are on login page
    }

    // Route Protection
    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (!data.authenticated) {
                window.location.href = 'login.html';
            } else {
                const avatar = document.querySelector('.avatar');
                const profileName = document.querySelector('.profile-menu span');
                if (avatar && profileName && data.user) {
                    avatar.innerText = data.user.name.charAt(0).toUpperCase();
                    profileName.innerText = data.user.name;
                }
            }
        } catch (e) {
            window.location.href = 'login.html';
        }
    };
    checkAuth();

    // Logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = 'login.html';
        });
    }

    // Single Page Navigation logic
    const navLinks = document.querySelectorAll('.nav-link[data-target]');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                navLinks.forEach(l => l.classList.remove('active'));
                sections.forEach(s => {
                    s.classList.add('d-none');
                    s.classList.remove('active');
                });

                link.classList.add('active');
                const targetId = link.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.remove('d-none');
                    targetSection.classList.add('active');
                    if (window.innerWidth <= 768) {
                        document.querySelector('.sidebar')?.classList.remove('open');
                    }
                    if (window.scrollTo) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                } else {
                    alert('Menu tidak ditemukan: ' + targetId);
                }
            } catch(err) {
                console.error(err);
                alert('Kesalahan navigasi: ' + err.message);
            }
        });
    });

    // Mobile Sidebar Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    if(mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                themeToggle.innerText = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.innerText = '☀️';
            }
        });
    }

    // Quick Action switch tab
    const switchTabs = document.querySelectorAll('.switch-tab');
    switchTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            const link = document.querySelector(`.nav-link[data-target="${target}"]`);
            if(link) link.click();
        });
    });

    // Toast Notification System
    window.showToast = function(message) {
        const toast = document.getElementById('toast');
        if(!toast) return;
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // CMS State
    const cmsState = {
        advantages: [],
        gallery: [],
        careers: [],
        testimonials: [],
        faqs: [],
        materials: []
    };

    // Fetch Data from DB
    const loadContent = async () => {
        try {
            const res = await fetch('/api/content/all');
            const result = await res.json();
            if(result.success && result.data) {
                // Populate Settings
                const settings = result.data.settings;
                document.querySelectorAll('.db-setting').forEach(input => {
                    const key = input.id;
                    if(settings[key]) {
                        input.value = settings[key];
                    }
                });
                
                // Populate Tentang Logo Preview
                const tentangLogoPreview = document.getElementById('tentang-logo-preview');
                if (tentangLogoPreview && settings['tentang_logo']) {
                    tentangLogoPreview.innerHTML = `<img src="${settings['tentang_logo']}" style="width: 100%; height: 100%; object-fit: contain;">`;
                }

                // Populate Advantages (Placeholder)
                const advList = document.getElementById('advantages-list');
                if(advList) {
                    advList.innerHTML = result.data.advantages.map(adv => `
                        <div class="edit-card glass-panel">
                            <div class="card-drag-handle">☰</div>
                            <div class="form-row">
                                <div class="form-group"><label>Icon</label><input type="text" class="form-control" value="${adv.icon}"></div>
                                <div class="form-group"><label>Judul</label><input type="text" class="form-control" value="${adv.title}"></div>
                            </div>
                            <div class="form-group"><label>Deskripsi</label><input type="text" class="form-control" value="${adv.description}"></div>
                        </div>
                    `).join('');
                }

                // Populate FAQs (Placeholder)
                const faqsList = document.getElementById('faqs-list');
                if(faqsList) {
                    faqsList.innerHTML = result.data.faqs.map(faq => `
                        <div class="edit-card glass-panel">
                            <div class="form-group"><label>Pertanyaan</label><input type="text" class="form-control" value="${faq.question}"></div>
                            <div class="form-group"><label>Jawaban</label><textarea class="form-control" rows="3">${faq.answer}</textarea></div>
                        </div>
                    `).join('');
                }

                // Populate Careers
                const careersList = document.getElementById('careers-list');
                if(careersList && result.data.careers) {
                    if (result.data.careers.length === 0) {
                        careersList.innerHTML = '<p class="text-muted">Belum ada karier. Silakan tambahkan.</p>';
                    } else {
                        careersList.innerHTML = result.data.careers.map(career => `
                            <div class="edit-card glass-panel" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <div style="flex: 1;">
                                    <h4 style="margin: 0 0 5px 0;">${career.title}</h4>
                                    <p style="margin: 0; font-size: 0.9em; color: #555;">${career.description}</p>
                                </div>
                                <button class="btn btn-outline btn-delete-career" data-id="${career.id}" style="color: red; border-color: red;">Hapus</button>
                            </div>
                        `).join('');
                        
                        document.querySelectorAll('.btn-delete-career').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                if(confirm("Yakin hapus karier ini?")) {
                                    const id = e.currentTarget.getAttribute('data-id');
                                    const res = await fetch('/api/content/careers/' + id, { method: 'DELETE' });
                                    const resData = await res.json();
                                    if(resData.success) {
                                        alert("Karier dihapus!");
                                        location.reload();
                                    } else {
                                        alert("Gagal menghapus");
                                    }
                                }
                            });
                        });
                    }
                }

                // Populate Testimonials
                const testimonialsList = document.getElementById('testimonials-list');
                if(testimonialsList && result.data.testimonials) {
                    if (result.data.testimonials.length === 0) {
                        testimonialsList.innerHTML = '<p class="text-muted">Belum ada testimoni. Silakan tambahkan.</p>';
                    } else {
                        testimonialsList.innerHTML = result.data.testimonials.map(testi => `
                            <div class="edit-card glass-panel" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <div style="flex: 1;">
                                    <h4 style="margin: 0 0 5px 0;">${testi.name} <span style="font-size: 0.8em; color: #777;">(${testi.role})</span></h4>
                                    <p style="margin: 0; font-size: 0.9em; color: #555;">"${testi.content}"</p>
                                </div>
                                <button class="btn btn-outline btn-delete-testi" data-id="${testi.id}" style="color: red; border-color: red;">Hapus</button>
                            </div>
                        `).join('');
                        
                        document.querySelectorAll('.btn-delete-testi').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                if(confirm("Yakin hapus testimoni ini?")) {
                                    const id = e.currentTarget.getAttribute('data-id');
                                    const res = await fetch('/api/content/testimonials/' + id, { method: 'DELETE' });
                                    const resData = await res.json();
                                    if(resData.success) {
                                        alert("Testimoni dihapus!");
                                        location.reload();
                                    } else {
                                        alert("Gagal menghapus");
                                    }
                                }
                            });
                        });
                    }
                }

                // Populate Hero Slides
                const heroGrid = document.getElementById('admin_hero_grid');
                if(heroGrid && result.data.hero_slides) {
                    if (result.data.hero_slides.length === 0) {
                        heroGrid.innerHTML = '<p class="text-muted">Belum ada slide. Silakan unggah.</p>';
                    } else {
                        heroGrid.innerHTML = result.data.hero_slides.map(slide => `
                            <div class="gallery-item-edit" style="background-image: url('${slide.imageUrl}'); background-size: cover; background-position: center; position: relative;">
                                <div style="background: rgba(0,0,0,0.6); padding: 10px; color: white; position: absolute; bottom: 0; width: 100%; box-sizing: border-box;">
                                    <h4 style="margin: 0; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${slide.title}</h4>
                                    <p style="margin: 5px 0 0; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${slide.description}</p>
                                </div>
                                <button class="icon-btn btn-delete-hero" data-id="${slide.id}" style="position: absolute; top: 10px; right: 10px; background: white; border-radius: 50%; padding: 5px; cursor: pointer; border: none;">🗑️</button>
                            </div>
                        `).join('');
                        
                        document.querySelectorAll('.btn-delete-hero').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                if(confirm("Yakin hapus slide ini?")) {
                                    const id = e.currentTarget.getAttribute('data-id');
                                    await fetch('/api/content/hero_slides/' + id, { method: 'DELETE' });
                                    loadContent();
                                    showToast("Slide dihapus");
                                }
                            });
                        });
                    }
                }

                // Populate Gallery
                const galleryList = document.getElementById('gallery-list');
                if(galleryList && result.data.gallery) {
                    galleryList.innerHTML = result.data.gallery.map(img => `
                        <div class="gallery-item-edit" style="background-image: url('${img.imageUrl}'); background-size: cover; background-position: center;">
                            <div class="gallery-item-actions" style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 5px;">
                                <span style="background: rgba(0,0,0,0.7); padding: 2px 6px; color: white; font-size: 12px; border-radius: 4px;">${img.title}</span>
                                <button class="icon-btn btn-delete-gallery" data-id="${img.id}" style="background: white; border-radius: 50%; padding: 5px; cursor: pointer;">🗑️</button>
                            </div>
                        </div>
                    `).join('');
                    
                    document.querySelectorAll('.btn-delete-gallery').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            if(confirm("Yakin hapus gambar ini?")) {
                                const id = e.currentTarget.getAttribute('data-id');
                                await fetch('/api/content/gallery/' + id, { method: 'DELETE' });
                                loadContent();
                                showToast("Gambar dihapus");
                            }
                        });
                    });
                }

                // Populate Materials
                const materiList = document.getElementById('materi-list');
                if (materiList && result.data.materials) {
                    materiList.innerHTML = result.data.materials.map(m => `
                        <div class="gallery-item-edit" style="background: #f8fafc; border: 1px solid #e2e8f0; display:flex; flex-direction:column; padding: 10px;">
                            ${m.imageUrl ? `<img src="${m.imageUrl}" style="width:100%; height:120px; object-fit:cover; border-radius:8px; margin-bottom:10px;">` : `<div style="width:100%; height:120px; background:#e2e8f0; border-radius:8px; margin-bottom:10px; display:flex; align-items:center; justify-content:center; color:#64748b;">No Image</div>`}
                            <h4 style="margin-bottom:5px; font-size:14px;">${m.title}</h4>
                            <p style="font-size:11px; color:#64748b; margin-bottom:10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${m.description}</p>
                            <a href="${m.fileUrl}" target="_blank" style="font-size:12px; color:var(--primary-color); margin-bottom:10px;">📄 Lihat Dokumen</a>
                            <button class="btn btn-outline btn-delete-materi" data-id="${m.id}" style="color:#ef4444; border-color:#ef4444; padding:5px;">Hapus 🗑️</button>
                        </div>
                    `).join('');

                    document.querySelectorAll('.btn-delete-materi').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            if(confirm("Hapus materi ini secara permanen?")) {
                                const id = e.currentTarget.getAttribute('data-id');
                                await fetch('/api/content/material/' + id, { method: 'DELETE' });
                                loadContent();
                                showToast("Materi dihapus");
                            }
                        });
                    });
                }
            }
        } catch(e) {
            console.error("Gagal memuat konten dari server", e);
        }
    };

    // Save All Data to DB
    const saveAllContent = async (btn) => {
        const originalText = btn.innerText;
        btn.innerText = 'Menyimpan ke Database...';
        btn.style.opacity = '0.7';

        // Gather all settings
        const settingsPayload = {};
        document.querySelectorAll('.db-setting').forEach(input => {
            settingsPayload[input.id] = input.value;
        });

        try {
            const res = await fetch('/api/content/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsPayload)
            });
            const data = await res.json();
            if(data.success) {
                showToast('Perubahan berhasil disimpan ke Database!');
                const statusText = document.querySelector('.status-indicator');
                if(statusText) statusText.innerHTML = '<span class="dot green"></span> Status: Tersimpan & Sinkron dengan Database';
            } else {
                showToast('Gagal menyimpan: ' + data.message);
            }
        } catch(e) {
            showToast('Kesalahan koneksi jaringan.');
        }

        btn.innerText = originalText;
        btn.style.opacity = '1';
    };

    const saveAllBtns = document.querySelectorAll('.btn-save-all');
    saveAllBtns.forEach(btn => {
        btn.addEventListener('click', () => saveAllContent(btn));
    });

    // Modified Auto-Save
    const autoSaveInputs = document.querySelectorAll('.auto-save');
    const statusDot = document.querySelector('.status-indicator .dot');
    const statusText = document.querySelector('.status-indicator');
    
    let autoSaveTimeout;

    if(statusDot && statusText) {
        autoSaveInputs.forEach(input => {
            input.addEventListener('input', () => {
                // Typing effect
                statusDot.classList.remove('green');
                statusDot.style.background = '#feca57';
                statusDot.style.boxShadow = 'none';
                statusText.innerHTML = '<span class="dot" style="background:#feca57"></span> Terdapat perubahan (Belum Disimpan)';

                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    // Automatically trigger save after 2 seconds of typing
                    const publishBtn = document.querySelector('.btn-primary.btn-save-all');
                    if(publishBtn) saveAllContent(publishBtn);
                }, 2000);
            });
        });
    }

    // Initialize Content
    loadContent();

    // Gallery Upload Listener
    const uploadGalleryForm = document.getElementById('upload-gallery-form');
    if (uploadGalleryForm) {
        uploadGalleryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = uploadGalleryForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Uploading...';
            btn.disabled = true;

            const fileInput = document.getElementById('gallery_image');
            const titleInput = document.getElementById('gallery_title');
            
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            formData.append('title', titleInput.value);

            try {
                const res = await fetch('/api/content/gallery', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if(data.success) {
                    showToast('Gambar berhasil diunggah!');
                    uploadGalleryForm.reset();
                    loadContent(); 
                } else {
                    showToast('Gagal: ' + data.message);
                }
            } catch(err) {
                showToast('Terjadi kesalahan jaringan');
            }
            btn.innerText = originalText;
            btn.disabled = false;
        });
    }

    // Materi Upload Listener
    const uploadMateriForm = document.getElementById('upload-materi-form');
    if (uploadMateriForm) {
        uploadMateriForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = uploadMateriForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Mengunggah Materi...';
            btn.disabled = true;

            const title = document.getElementById('materi_title').value;
            const desc = document.getElementById('materi_desc').value;
            const imageFile = document.getElementById('materi_image').files[0];
            const docFile = document.getElementById('materi_doc').files[0];

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', desc);
            if(imageFile) formData.append('image', imageFile);
            if(docFile) formData.append('document', docFile);

            try {
                const res = await fetch('/api/content/material', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if(data.success) {
                    showToast('Materi berhasil diunggah!');
                    uploadMateriForm.reset();
                    loadContent(); 
                } else {
                    showToast('Gagal: ' + data.message);
                }
            } catch(err) {
                showToast('Terjadi kesalahan jaringan');
            }
            btn.innerText = originalText;
            btn.disabled = false;
        });
    }


    // Upload Hero Slide
    const heroUploadForm = document.getElementById('heroUploadForm');
    if (heroUploadForm) {
        heroUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnUploadHero');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Mengunggah...';
            btn.disabled = true;

            const fileInput = document.getElementById('heroImageInput');
            const file = fileInput.files[0];
            if(!file) { alert('Pilih gambar!'); btn.innerHTML = originalText; btn.disabled = false; return; }

            const formData = new FormData();
            formData.append('image', file);
            formData.append('title', document.getElementById('heroTitleInput').value);
            formData.append('description', document.getElementById('heroDescInput').value);
            formData.append('buttonText', document.getElementById('heroBtnTextInput').value);
            formData.append('buttonLink', document.getElementById('heroBtnLinkInput').value);

            try {
                const res = await fetch('/api/content/hero_slides', {
                    method: 'POST',
                    body: formData
                });
                const result = await res.json();
                if(result.success) {
                    showToast('Slide berhasil ditambahkan!');
                    heroUploadForm.reset();
                    loadContent(); // Reload grid
                } else {
                    alert('Gagal: ' + result.message);
                }
            } catch(e) {
                alert('Terjadi kesalahan');
            }
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    }

    // Handle Upload Karier Baru
    const addCareerForm = document.getElementById('add-career-form');
    if(addCareerForm) {
        addCareerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('career_title').value;
            const desc = document.getElementById('career_desc').value;
            
            const submitBtn = addCareerForm.querySelector('button[type="submit"]');
            const oldText = submitBtn.innerText;
            submitBtn.innerText = "Menyimpan...";
            submitBtn.disabled = true;
            
            try {
                const res = await fetch('/api/content/careers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, description: desc })
                });
                const result = await res.json();
                if(result.success) {
                    alert("Berhasil menambah karier!");
                    location.reload();
                } else {
                    alert("Gagal: " + result.message);
                }
            } catch(e) {
                alert("Terjadi kesalahan sistem");
            } finally {
                submitBtn.innerText = oldText;
                submitBtn.disabled = false;
            }
        });
    }

    // Handle Upload Testimoni Baru
    const addTestiForm = document.getElementById('add-testimonial-form');
    if(addTestiForm) {
        addTestiForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('testi_name').value;
            const role = document.getElementById('testi_role').value;
            const content = document.getElementById('testi_content').value;
            
            const submitBtn = addTestiForm.querySelector('button[type="submit"]');
            const oldText = submitBtn.innerText;
            submitBtn.innerText = "Menyimpan...";
            submitBtn.disabled = true;
            
            try {
                const res = await fetch('/api/content/testimonials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, role, content, rating: 5 })
                });
                const result = await res.json();
                if(result.success) {
                    alert("Berhasil menambah testimoni!");
                    location.reload();
                } else {
                    alert("Gagal: " + result.message);
                }
            } catch(e) {
                alert("Terjadi kesalahan sistem");
            } finally {
                submitBtn.innerText = oldText;
                submitBtn.disabled = false;
            }
        });
    }

    // Tentang Logo Upload Listener
    const btnUploadTentangLogo = document.getElementById('btn-upload-tentang-logo');
    const inputTentangLogo = document.getElementById('tentang_logo_input');
    
    if (btnUploadTentangLogo && inputTentangLogo) {
        btnUploadTentangLogo.addEventListener('click', async () => {
            const file = inputTentangLogo.files[0];
            if (!file) {
                showToast('Pilih file logo terlebih dahulu');
                return;
            }
            
            const originalText = btnUploadTentangLogo.innerText;
            btnUploadTentangLogo.innerText = 'Mengunggah...';
            btnUploadTentangLogo.disabled = true;
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                const res = await fetch('/api/content/tentang_logo', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    showToast('Logo berhasil diunggah!');
                    const preview = document.getElementById('tentang-logo-preview');
                    if(preview) {
                        preview.innerHTML = `<img src="${data.imageUrl}" style="width: 100%; height: 100%; object-fit: contain;">`;
                    }
                } else {
                    showToast('Gagal mengunggah logo: ' + data.message);
                }
            } catch(e) {
                showToast('Kesalahan jaringan saat mengunggah logo');
            }
            
            btnUploadTentangLogo.innerText = originalText;
            btnUploadTentangLogo.disabled = false;
        });
    }

});

