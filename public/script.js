// Sticky Navbar & Active links
const navbar = document.getElementById('navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

document.addEventListener('DOMContentLoaded', async () => {

    // Fetch Dynamic CMS Content
    try {
        const res = await fetch('/api/content/all');
        const result = await res.json();
        
        if (result.success && result.data) {
            const set = result.data.settings;
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

            bindText('stat1_val', set.stat1_val);
            document.getElementById('stat1_val')?.setAttribute('data-target', set.stat1_val);
            bindText('stat1_label', set.stat1_label);
            bindText('stat2_val', set.stat2_val);
            document.getElementById('stat2_val')?.setAttribute('data-target', set.stat2_val);
            bindText('stat2_label', set.stat2_label);
            bindText('stat3_val', set.stat3_val);
            document.getElementById('stat3_val')?.setAttribute('data-target', set.stat3_val);
            bindText('stat3_label', set.stat3_label);
            bindText('stat4_val', set.stat4_val);
            document.getElementById('stat4_val')?.setAttribute('data-target', set.stat4_val);
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
                const safeTitle = item.title.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                return `
                <div class="galeri-item" onclick="window.openLightbox('${item.imageUrl}', '${safeTitle}')">
                  <div class="galeri-img" style="background-image: url('${item.imageUrl}'); background-size: cover; background-position: center;"></div>
                  <div class="galeri-overlay"><span>${item.title}</span></div>
                </div>
                `;
            });

            renderList('materi_container', result.data.materials, item => `
                <div class="materi-card">
                  ${item.imageUrl ? `<div class="materi-img" style="background-image: url('${item.imageUrl}');"></div>` : `<div class="materi-img" style="display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:40px;">📄</div>`}
                  <div class="materi-content">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <a href="${item.fileUrl}" class="btn btn-outline" target="_blank" download>Download Materi</a>
                  </div>
                </div>
            `);

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
        }
    } catch(err) {
        console.error('Failed to fetch CMS content:', err);
        alert("CMS Load Error: " + err.message);
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
let hasCounted = false;

const startCounters = () => {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // ms
        const increment = target / (duration / 16); // 60fps
        
        let current = 0;
        const updateCounter = () => {
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
        if (entries[0].isIntersecting && !hasCounted) {
            startCounters();
            hasCounted = true;
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
