// Sticky Navbar & Active links
const navbar = document.getElementById('navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

document.addEventListener('DOMContentLoaded', async () => {

    // Fetch Dynamic CMS Content
    try {
        // Menggunakan fetch biasa agar browser bisa me-reuse cache JSON
        const res = await fetch('/api/content/all');
        const result = await res.json();
        
        if (result.success && result.data) {
            const set = result.data.settings || {};
            const bindText = (id, text) => {
                const el = document.getElementById(id);
                if (el && text) el.innerHTML = text;
            };
            const bindHref = (id, link) => {
                const el = document.getElementById(id);
                if (el && link) el.href = link;
            }

            bindText('hero_title', set.hero_title);
            bindText('hero_subtitle', set.hero_subtitle);
            bindText('hero_btn1', set.hero_btn1);
            bindText('hero_btn2', set.hero_btn2);
            bindText('tentang_desc', set.tentang_desc);
            
            if (set.tentang_list) {
                const ul = document.getElementById('tentang_list_ul');
                if (ul) ul.innerHTML = set.tentang_list.split(',').map(item => `<li><i>✓</i> ${item.trim()}</li>`).join('');
            }
            if (set.tentang_logo) {
                const visualContainer = document.querySelector('.tentang-visual');
                if (visualContainer) {
                    visualContainer.innerHTML = `<img src="${set.tentang_logo}" alt="Logo Jurusan" loading="lazy" style="width: 100%; height: auto; max-height: 400px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); object-fit: cover;">`;
                }
            }

            // Update Stat Targets
            const updateStat = (id, val) => {
                const el = document.getElementById(id);
                if (el && val) {
                    el.setAttribute('data-target', val);
                    // Jika counter sudah pernah dijalankan atau sedang berjalan, 
                    // langsung timpa teksnya agar tidak bentrok dengan animasi bawaan HTML
                    if (window.hasCounted) {
                        el.innerText = val;
                        el.classList.add('stop-anim');
                    }
                }
            };
            
            updateStat('stat1_val', set.stat1_val);
            bindText('stat1_label', set.stat1_label);
            
            updateStat('stat2_val', set.stat2_val);
            bindText('stat2_label', set.stat2_label);
            
            updateStat('stat3_val', set.stat3_val);
            bindText('stat3_label', set.stat3_label);
            
            updateStat('stat4_val', set.stat4_val);
            bindText('stat4_label', set.stat4_label);

            bindText('navbar_school_name', set.school_name);
            bindText('footer_school_name', set.school_name);
            bindText('school_address', '📍 ' + set.school_address);
            bindText('school_wa', '📞 WhatsApp: ' + set.school_wa);
            bindText('school_email', '✉️ Email: ' + set.school_email);
            bindHref('school_ig', set.school_ig);
            bindHref('school_tiktok', set.school_tiktok);
            bindHref('school_maps', set.school_maps);

            // Lists rendering
            const renderList = (id, items, mapper) => {
                const container = document.getElementById(id);
                if (container && items && items.length > 0) {
                    const limitStr = container.getAttribute('data-limit');
                    let displayItems = items;
                    if (limitStr) {
                        const limit = parseInt(limitStr);
                        if (!isNaN(limit)) displayItems = items.slice(0, limit);
                    }
                    container.innerHTML = displayItems.map(mapper).join('');
                }
            };

            renderList('advantages_container', result.data.advantages, item => `
                <div class="card">
                    <div class="icon-wrapper">${item.icon}</div>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `);

            renderList('gallery_container', result.data.gallery, item => {
                const titleStr = item.title || '';
                const safeTitle = titleStr.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                return `
                <div class="galeri-item" onclick="window.openLightbox('${item.imageUrl}', '${safeTitle}')">
                  <div class="galeri-img" style="background-image: url('${item.imageUrl}'); background-size: cover; background-position: center;"></div>
                  <div class="galeri-overlay"><span>${titleStr}</span></div>
                </div>
                `;
            });

            renderList('materi_container', result.data.materials, item => {
                const defaultImg = 'https://placehold.co/600x400/e2e8f0/64748b?text=Materi+Pembelajaran';
                const imgSrc = item.imageUrl ? item.imageUrl : defaultImg;
                return `
                <div class="materi-card">
                  <div class="materi-img" style="background-image: url('${imgSrc}');"></div>
                  <div class="materi-content">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <a href="/detail-materi.html?id=${item.id}" class="btn btn-outline">Lihat Detail Materi ↗</a>
                  </div>
                </div>
                `;
            });

            // Expose lightbox function
            window.openLightbox = (src, title) => {
                const lightbox = document.getElementById('lightbox');
                const img = document.getElementById('lightbox-img');
                const caption = document.getElementById('lightbox-caption');
                if(lightbox && img && caption) {
                    img.src = src;
                    caption.innerText = title;
                    lightbox.classList.add('show');
                }
            };
            
            // Lightbox close events
            const lightbox = document.getElementById('lightbox');
            if (lightbox) {
                const closeBtn = lightbox.querySelector('.lightbox-close');
                if (closeBtn) closeBtn.onclick = () => lightbox.classList.remove('show');
                lightbox.onclick = (e) => {
                    if (e.target === lightbox) lightbox.classList.remove('show');
                };
            }

            renderList('faqs_container', result.data.faqs, item => `
                <div class="accordion-item">
                    <button class="accordion-header">${item.question} <span class="icon">+</span></button>
                    <div class="accordion-content">
                        <p>${item.answer}</p>
                    </div>
                </div>
            `);
            
            // Render Hero Slides
            if (result.data.hero_slides && result.data.hero_slides.length > 0) {
                const carousel = document.querySelector('.hero-carousel');
                if (carousel) {
                    let slidesHtml = '';
                    let dotsHtml = '';
                    result.data.hero_slides.forEach((slide, idx) => {
                        const activeClass = idx === 0 ? 'active' : '';
                        slidesHtml += `
                            <div class="carousel-slide ${activeClass}" style="background-image: url('${slide.imageUrl}'); background-size: cover; background-position: center;">
                                <div class="carousel-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(15, 23, 42, 0.6);"></div>
                                <div class="carousel-content" style="position: relative; z-index: 3; color: white; max-width: 800px; padding: 0 20px; text-align: left; display: flex; flex-direction: column; justify-content: center; height: 100%; margin: 0 auto;">
                                    <h1 class="slide-title" style="margin-bottom: 20px;">${slide.title}</h1>
                                    <p class="slide-desc" style="margin-bottom: 30px;">${slide.description}</p>
                                    <div class="hero-buttons">
                                        ${slide.buttonText ? `<a href="${slide.buttonLink || '#'}" class="btn btn-slider-primary" style="display: inline-block;">${slide.buttonText}</a>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                        dotsHtml += `<div class="dot ${activeClass}"></div>`;
                    });
                    
                    const container = document.getElementById('hero_slider_container');
                    const indicators = document.getElementById('hero_slider_indicators');
                    
                    if (container) container.innerHTML = slidesHtml;
                    if (indicators) indicators.innerHTML = dotsHtml;
                }
            }

            // Initialize Hero Carousel now that DOM is ready
            if (typeof initCarousel === 'function') initCarousel();

            // Re-initialize accordion logic
            setTimeout(() => {
                const accordionHeaders = document.querySelectorAll('.accordion-header');
                accordionHeaders.forEach(header => {
                    header.addEventListener('click', () => {
                        const content = header.nextElementSibling;
                        const icon = header.querySelector('.icon');
                        const isOpen = content.style.maxHeight;
                        document.querySelectorAll('.accordion-content').forEach(c => c.style.maxHeight = null);
                        document.querySelectorAll('.accordion-header .icon').forEach(i => i.textContent = '+');
                        if (!isOpen) {
                            content.style.maxHeight = content.scrollHeight + "px";
                            icon.textContent = '-';
                        }
                    });
                });
            }, 100);

            renderList('materi_page_container', result.data.materials, item => {
                const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
                const defaultImg = 'https://placehold.co/800x500/e2e8f0/64748b?text=Materi+Pembelajaran';
                const imgSrc = item.imageUrl ? item.imageUrl : defaultImg;
                return `
                <div class="materi-card-full" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); display: flex; flex-direction: column; border: 1px solid #f1f5f9;">
                    <div class="img-wrapper" style="width: 100%; height: 300px; background-color: #f8fafc;">
                        <img src="${imgSrc}" alt="${item.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="content" style="padding: 30px;">
                        <h3 style="font-size: 1.8rem; color: var(--primary-color); margin-bottom: 15px;">${item.title}</h3>
                        <span class="date" style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 20px; display: block;">Diunggah pada: ${dateStr}</span>
                        <p style="color: var(--text-color); line-height: 1.7; margin-bottom: 30px; white-space: pre-line;">${item.description}</p>
                        <a href="/detail-materi.html?id=${item.id}" class="btn btn-primary btn-download" style="display: inline-flex; align-items: center; gap: 10px; font-weight: 600; padding: 12px 30px; font-size: 1.1rem;">Lihat Detail Materi &#8599;</a>
                    </div>
                </div>
                `;
            });

            // Initialize detail-materi if we are on that page
            const urlParams = new URLSearchParams(window.location.search);
            const detailId = urlParams.get('id');
            const detailContainer = document.getElementById('detail_content');
            
            if (detailContainer) {
                if (!detailId) {
                    detailContainer.innerHTML = '<div style="text-align: center; padding: 50px; color: #64748b;">Silakan pilih materi terlebih dahulu.</div>';
                } else if (result.data.materials) {
                    const item = result.data.materials.find(m => m.id == detailId);
                    if (item) {
                        const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
                        const isPdf = item.fileUrl && item.fileUrl.toLowerCase().endsWith('.pdf');
                        let viewerHTML = '';
                        
                        if (isPdf) {
                            viewerHTML = `
                                <div class="pdf-container" style="width: 100%; height: 70vh; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); margin-bottom: 30px;">
                                    <iframe src="${item.fileUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
                                </div>
                            `;
                        } else if (item.fileUrl) {
                            viewerHTML = `
                                <div class="file-download-box" style="background: #f8fafc; padding: 40px; border-radius: 10px; text-align: center; border: 2px dashed #cbd5e1; margin-bottom: 30px;">
                                    <div style="font-size: 50px; margin-bottom: 15px;">&#128193;</div>
                                    <h4 style="margin-bottom: 15px; color: var(--primary-color);">File Tersedia untuk Diunduh</h4>
                                    <a href="${item.fileUrl}" target="_blank" class="btn btn-primary btn-download-large">Unduh File Sekarang &darr;</a>
                                </div>
                            `;
                        }

                        detailContainer.innerHTML = `
                            <div style="max-width: 900px; margin: 0 auto;">
                                <div class="detail-card" style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
                                    <div class="detail-header" style="padding: 40px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 30px; align-items: flex-start; flex-wrap: wrap;">
                                        <div class="detail-header-img" style="width: 200px; height: 250px; background-color: #f8fafc; border-radius: 10px; overflow: hidden; flex-shrink: 0; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:40px;">
                                            <img src="${item.imageUrl ? item.imageUrl : 'https://placehold.co/600x800/e2e8f0/64748b?text=Materi'}" alt="${item.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                                        </div>
                                        <div class="detail-header-info" style="flex: 1; min-width: 300px;">
                                            <h1 class="detail-title" style="font-size: 2.2rem; color: var(--primary-color); margin-bottom: 10px; line-height: 1.2;">${item.title}</h1>
                                            <div class="detail-meta" style="display: flex; gap: 20px; color: #94a3b8; font-size: 0.95rem; margin-bottom: 25px;">
                                                <span>&#128197; Diunggah: ${dateStr}</span>
                                            </div>
                                            <div class="detail-desc" style="font-size: 1.05rem; color: #475569; line-height: 1.8; margin-bottom: 30px; white-space: pre-line;">${item.description}</div>
                                        </div>
                                    </div>
                                    ${viewerHTML}
                                </div>
                            </div>
                        `;
                    } else {
                        detailContainer.innerHTML = '<div style="text-align: center; padding: 50px; color:red;">Materi tidak ditemukan.</div>';
                    }
                } else {
                    detailContainer.innerHTML = '<div style="text-align: center; padding: 50px; color:red;">Gagal memuat materi.</div>';
                }
            }
        }
    } catch(err) {
        console.error('Failed to fetch CMS content:', err);
        const errDiv = document.createElement('div');
        errDiv.style.padding = '20px';
        errDiv.style.background = '#ffebee';
        errDiv.style.color = '#c62828';
        errDiv.style.textAlign = 'center';
        errDiv.style.margin = '20px';
        errDiv.style.borderRadius = '8px';
        errDiv.innerHTML = `<strong>Koneksi Gagal:</strong> Gagal memuat data dari server. <br><small>${err.message}</small>`;
        
        // Try to inject error message into main containers so user sees it instead of a blank screen
        const mc = document.getElementById('materi_page_container');
        if (mc) mc.innerHTML = '';
        if (mc) mc.appendChild(errDiv.cloneNode(true));
        
        const hc = document.getElementById('hero_slider_container');
        if (hc) hc.innerHTML = '';
        if (hc) hc.appendChild(errDiv.cloneNode(true));
    }
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Counter Animation for Stats
const counters = document.querySelectorAll('.counter');
window.hasCounted = false;

const startCounters = () => {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // ms
        const increment = target / (duration / 16); // 60fps
        
        let current = 0;
        const updateCounter = () => {
            if (counter.classList.contains('stop-anim')) return;
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        };
        updateCounter();
    });
};

// Intersection Observer for Stats
const statSection = document.querySelector('.stat-section');
if (statSection) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !window.hasCounted) {
            window.hasCounted = true;
            startCounters();
        }
    }, { threshold: 0.5 });
    observer.observe(statSection);
}

// Testimonial Slider
const slides = document.querySelectorAll('.testimoni-slide');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    
    if (index >= slides.length) currentSlide = 0;
    if (index < 0) currentSlide = slides.length - 1;
    
    slides[currentSlide].classList.add('active');
}

if(prevBtn && nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentSlide++;
        showSlide(currentSlide);
    });

    prevBtn.addEventListener('click', () => {
        currentSlide--;
        showSlide(currentSlide);
    });

    // Auto slide
    setInterval(() => {
        currentSlide++;
        showSlide(currentSlide);
    }, 5000);
}

// FAQ Accordion
const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
        const currentlyActive = document.querySelector('.accordion-item.active');
        if (currentlyActive && currentlyActive !== item) {
            currentlyActive.classList.remove('active');
        }
        item.classList.toggle('active');
    });
});

/* =========================================
   Hero Carousel Logic
   ========================================= */
function initCarousel() {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-indicators .dot');
    const prevBtn = carousel.querySelector('.carousel-control.prev');
    const nextBtn = carousel.querySelector('.carousel-control.next');
    
    let currentIndex = 0;
    let slideInterval;
    const intervalTime = 5000; // 5 detik

    const updateSlide = (index) => {
        // Hapus class active dari slide & dot saat ini
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        
        currentIndex = index;
        
        // Cek batasan index
        if (currentIndex < 0) currentIndex = slides.length - 1;
        if (currentIndex >= slides.length) currentIndex = 0;
        
        // Tambahkan class active ke slide & dot baru
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    };

    const nextSlide = () => updateSlide(currentIndex + 1);
    const prevSlide = () => updateSlide(currentIndex - 1);

    // Event listeners tombol
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });

    // Event listeners dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateSlide(index);
            resetInterval();
        });
    });

    // Auto Slide
    const startInterval = () => {
        slideInterval = setInterval(nextSlide, intervalTime);
    };
    
    const resetInterval = () => {
        clearInterval(slideInterval);
        startInterval();
    };

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
    carousel.addEventListener('mouseleave', () => startInterval());

    // Touch Support (Swipe)
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(slideInterval);
    }, {passive: true});

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startInterval();
    }, {passive: true});

    const handleSwipe = () => {
        const swipeThreshold = 50; // minimum distance to trigger swipe
        if (touchEndX < touchStartX - swipeThreshold) {
            nextSlide(); // Swipe left -> next
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            prevSlide(); // Swipe right -> prev
        }
    };

    // Mulai auto-slide pertama kali
    startInterval();
};



