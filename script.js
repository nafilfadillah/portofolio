/* =========================================================
   LANGUAGE TOGGLE (ID / EN)
========================================================= */
(function initLangToggle() {
    const langToggle = document.getElementById('langToggle');
    if (!langToggle) return;

    const saved = localStorage.getItem('lang') || 'id';
    applyLang(saved);

    langToggle.addEventListener('click', () => {
        const current = document.documentElement.lang === 'en' ? 'en' : 'id';
        const next = current === 'id' ? 'en' : 'id';
        applyLang(next);
        localStorage.setItem('lang', next);
    });

    function applyLang(lang) {
        document.documentElement.lang = lang;
        langToggle.textContent = lang.toUpperCase();

        document.querySelectorAll('[data-i18n-id][data-i18n-en]').forEach(el => {
            el.textContent = lang === 'en' ? el.dataset.i18nEn : el.dataset.i18nId;
        });

        document.querySelectorAll('[data-i18n-placeholder-id][data-i18n-placeholder-en]').forEach(el => {
            el.setAttribute('placeholder', lang === 'en' ? el.dataset.i18nPlaceholderEn : el.dataset.i18nPlaceholderId);
        });
    }
})();

/* =========================================================
   SCROLL PROGRESS BAR + BACK TO TOP
========================================================= */
(function initScrollUtils() {
    const progress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    function onScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (progress) progress.style.width = pct + '%';
        if (backToTop) backToTop.classList.toggle('is-visible', scrollTop > 500);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotionSafe() ? 'auto' : 'smooth' });
    });

    function prefersReducedMotionSafe() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
})();

/* =========================================================
   GITHUB LIVE STATS
   Fetch data publik dari GitHub REST API (nggak butuh auth/token).
========================================================= */
(function initGitHubStats() {
    const repoEl = document.getElementById('ghRepos');
    const followersEl = document.getElementById('ghFollowers');
    const followingEl = document.getElementById('ghFollowing');
    if (!repoEl) return;

    fetch('https://api.github.com/users/nafilfadillah')
        .then(res => { if (!res.ok) throw new Error('GitHub API error'); return res.json(); })
        .then(data => {
            repoEl.textContent = data.public_repos ?? '—';
            followersEl.textContent = data.followers ?? '—';
            followingEl.textContent = data.following ?? '—';
        })
        .catch(() => {
            [repoEl, followersEl, followingEl].forEach(el => { if (el) el.textContent = 'N/A'; });
        })
        .finally(() => {
            [repoEl, followersEl, followingEl].forEach(el => el?.classList.remove('is-loading'));
        });
})();

/* =========================================================
   TOAST NOTIFICATIONS
========================================================= */
function showToast(message, icon = 'fa-circle-check') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('is-visible'));

    setTimeout(() => {
        toast.classList.remove('is-visible');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

/* =========================================================
   VCARD DOWNLOAD ("Save Contact")
========================================================= */
document.getElementById('saveContactBtn')?.addEventListener('click', () => {
    const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Fadillah;Nafil;;;',
        'FN:Nafil Fadillah',
        'TITLE:Network Engineer & Web Developer',
        'EMAIL;TYPE=INTERNET:nafilfadillah09@gmail.com',
        'TEL;TYPE=CELL:+6281573903440',
        'URL:https://github.com/nafilfadillah',
        'URL:https://www.linkedin.com/in/nafil-fadillah-ab468a28b/',
        'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Nafil_Fadillah.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    showToast('vCard berhasil diunduh', 'fa-download');
});

/* =========================================================
   CONTACT FORM — builds a prefilled mailto: (no backend needed)
========================================================= */
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    const subject = encodeURIComponent(`Halo dari ${name} — via portofolio`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:nafilfadillah09@gmail.com?subject=${subject}&body=${body}`;

    showToast('Membuka aplikasi email...', 'fa-paper-plane');
});

/* =========================================================
   NAVBAR — scrolled state, mobile menu, scrollspy
========================================================= */
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navbar) {
        const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 30);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (navToggle && navLinks) {
        const closeMenu = () => {
            navToggle.classList.remove('is-open');
            navLinks.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        };
        navToggle.addEventListener('click', () => {
            const open = navLinks.classList.toggle('is-open');
            navToggle.classList.toggle('is-open', open);
            navToggle.setAttribute('aria-expanded', String(open));
        });
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    }

    const sections = Array.from(document.querySelectorAll('section[id]'));
    const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    if (sections.length && links.length && 'IntersectionObserver' in window) {
        const setActive = (id) => {
            links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
        };
        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        sections.forEach(s => spy.observe(s));
    }
})();

/* =========================================================
   PROJECT DETAIL DATA
   Edit di sini kalau mau update isi modal "Details" per project.
   key harus sama persis dengan data-project di HTML.
========================================================= */
/* =========================================================
   LIVE LOCAL CLOCK (WIB)
========================================================= */
(function initLiveClock() {
    const clockEl = document.getElementById('localClock');
    if (!clockEl) return;

    function tick() {
        const now = new Date().toLocaleTimeString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit'
        });
        clockEl.textContent = now;
    }
    tick();
    setInterval(tick, 15000);
})();

/* =========================================================
   GITHUB LAST ACTIVE (relative time from public events)
========================================================= */
(function initGitHubLastActive() {
    const el = document.getElementById('ghLastActive');
    if (!el) return;

    fetch('https://api.github.com/users/nafilfadillah/events/public')
        .then(res => { if (!res.ok) throw new Error('GitHub events error'); return res.json(); })
        .then(events => {
            if (!Array.isArray(events) || !events.length) {
                el.innerHTML = '<i class="fas fa-circle-info"></i> Belum ada aktivitas publik terbaru.';
                return;
            }
            const lastDate = new Date(events[0].created_at);
            el.innerHTML = `<i class="fas fa-bolt"></i> Terakhir aktif di GitHub: ${timeAgo(lastDate)}`;
        })
        .catch(() => {
            el.innerHTML = '<i class="fas fa-circle-info"></i> Aktivitas terakhir tidak tersedia saat ini.';
        });

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const units = [
            ['tahun', 31536000], ['bulan', 2592000], ['hari', 86400],
            ['jam', 3600], ['menit', 60]
        ];
        for (const [label, secs] of units) {
            const value = Math.floor(seconds / secs);
            if (value >= 1) return `${value} ${label} lalu`;
        }
        return 'baru saja';
    }
})();

/* =========================================================
   PROJECT DETAIL DATA
   Edit di sini kalau mau update isi modal "Details" per project.
   key harus sama persis dengan data-project di HTML.
========================================================= */
const PROJECTS = {
    'air-quality': {
        icon: 'fa-wind',
        caseStudy: 'case-study-air-quality.html',
        problem: {
            id: 'Kabin/ruangan tertutup nggak punya cara otomatis buat deteksi udara kotor (CO/VOC, PM2.5) dan langsung merespons tanpa campur tangan manual.',
            en: 'Enclosed cabins/rooms have no automatic way to detect poor air quality (CO/VOC, PM2.5) and respond right away without manual intervention.'
        },
        arch: {
            id: 'ESP32 baca sensor MQ135 (CO/VOC), GP2Y1010AU0F (PM2.5), DHT22 (suhu/kelembapan), dan PIR (kehadiran orang). Logic hysteresis berbasis flag (F1/F2/F3) menentukan kapan fan, ionizer, dan servo ventilasi aktif. Status ditampilkan di OLED SH1106.',
            en: 'An ESP32 reads the MQ135 (CO/VOC), GP2Y1010AU0F (PM2.5), DHT22 (temperature/humidity), and PIR (occupancy) sensors. A flag-based hysteresis logic (F1/F2/F3) determines when the fan, ionizer, and ventilation servo activate. Status is shown on an SH1106 OLED.'
        },
        tools: ['ESP32', 'MQ135', 'GP2Y1010AU0F', 'DHT22', 'PIR', 'SH1106 OLED', 'Relay'],
        outcome: {
            id: 'Sistem otomatis membersihkan &amp; memventilasi udara kabin berdasarkan kondisi real-time, jadi bagian dari skripsi Sistem Komputer.',
            en: 'The system automatically cleans &amp; ventilates cabin air based on real-time conditions, developed as part of a Computer Systems undergraduate thesis.'
        }
    },
    'hospital': {
        icon: 'fa-notes-medical',
        problem: {
            id: 'Pencatatan data pasien, dokter, dan rekam medis manual rawan hilang dan lambat direkap.',
            en: 'Manual recording of patient, doctor, and medical record data is prone to loss and slow to compile.'
        },
        arch: {
            id: 'Aplikasi berbasis Python dengan database MySQL untuk menyimpan data pasien, dokter, obat, dan rekam medis, plus modul laporan.',
            en: 'A Python-based application with a MySQL database to store patient, doctor, medication, and medical record data, plus a reporting module.'
        },
        tools: ['Python', 'MySQL', 'Database Design'],
        outcome: {
            id: 'Sistem terpusat untuk mengelola data rumah sakit dan menghasilkan laporan otomatis.',
            en: 'A centralized system to manage hospital data and generate automatic reports.'
        }
    },
    'mail-server': {
        icon: 'fa-envelope-open-text',
        problem: {
            id: 'Butuh mail server sendiri yang aman dan nggak gampang ditandai spam oleh penyedia email lain.',
            en: 'Needed a self-hosted, secure mail server that isn\'t easily flagged as spam by other email providers.'
        },
        arch: {
            id: 'Postfix sebagai MTA dan Dovecot sebagai IMAP/POP3 server di atas Ubuntu Server, dikonfigurasi dengan SPF, DKIM, dan DMARC untuk validasi pengirim.',
            en: 'Postfix as the MTA and Dovecot as the IMAP/POP3 server on Ubuntu Server, configured with SPF, DKIM, and DMARC for sender validation.'
        },
        tools: ['Ubuntu Server', 'Postfix', 'Dovecot', 'SPF/DKIM/DMARC'],
        outcome: {
            id: 'Mail server mandiri dengan deliverability yang lebih terjaga karena email terverifikasi dengan benar.',
            en: 'A self-hosted mail server with better deliverability, since outgoing email is properly verified.'
        }
    },
    'dns-server': {
        icon: 'fa-sitemap',
        problem: {
            id: 'Jaringan lokal butuh resolusi nama domain sendiri tanpa bergantung ke DNS publik.',
            en: 'The local network needed its own domain name resolution without depending on public DNS.'
        },
        arch: {
            id: 'BIND9 dikonfigurasi dengan forward zone dan reverse zone untuk resolusi nama ke IP dan sebaliknya di jaringan lab.',
            en: 'BIND9 configured with forward and reverse zones to resolve names to IPs and vice versa on the lab network.'
        },
        tools: ['Ubuntu Server', 'BIND9', 'DNS Zones'],
        outcome: {
            id: 'Resolusi nama domain internal berjalan mandiri dan konsisten di jaringan lokal.',
            en: 'Internal domain name resolution runs independently and consistently on the local network.'
        }
    },
    'vpn': {
        icon: 'fa-shield-halved',
        problem: {
            id: 'Anggota lab perlu akses aman ke jaringan laboratorium dari luar kampus tanpa membuka port yang berisiko.',
            en: 'Lab members needed secure access to the laboratory network from off-campus without exposing risky open ports.'
        },
        arch: {
            id: 'WireGuard di-setup sebagai VPN server ringan dengan enkripsi modern, key-pair per client untuk kontrol akses.',
            en: 'WireGuard set up as a lightweight VPN server with modern encryption, using a per-client key pair for access control.'
        },
        tools: ['WireGuard', 'Linux', 'Networking Security'],
        outcome: {
            id: 'Akses remote yang aman dan cepat ke jaringan lab dari mana saja.',
            en: 'Secure, fast remote access to the lab network from anywhere.'
        }
    },
    'monitoring': {
        icon: 'fa-chart-line',
        problem: {
            id: 'Nggak ada visibilitas real-time terhadap kondisi bandwidth, uptime, dan trafik server.',
            en: 'No real-time visibility into bandwidth, uptime, and server traffic conditions.'
        },
        arch: {
            id: 'Dashboard yang menarik data bandwidth, uptime, dan trafik jaringan, ditampilkan dalam grafik yang di-update berkala.',
            en: 'A dashboard that pulls bandwidth, uptime, and network traffic data, displayed in periodically updated charts.'
        },
        tools: ['Linux', 'Monitoring Tools', 'Dashboard'],
        outcome: {
            id: 'Tim bisa memantau kesehatan jaringan secara real-time dan lebih cepat merespons anomali.',
            en: 'The team can monitor network health in real time and respond to anomalies faster.'
        }
    },
    'cyberlab': {
        icon: 'fa-user-secret',
        problem: {
            id: 'Perlu ruang aman buat belajar teknik penetration testing dasar tanpa menyentuh sistem produksi.',
            en: 'Needed a safe space to learn basic penetration testing techniques without touching production systems.'
        },
        arch: {
            id: 'Lab tertutup menggunakan Kali Linux untuk simulasi serangan, Wireshark untuk analisis paket, Nmap untuk network scanning, dan Metasploit untuk exploit testing dasar.',
            en: 'A closed lab using Kali Linux for attack simulation, Wireshark for packet analysis, Nmap for network scanning, and Metasploit for basic exploit testing.'
        },
        tools: ['Kali Linux', 'Wireshark', 'Nmap', 'Metasploit'],
        outcome: {
            id: 'Pemahaman praktis soal alur penetration testing dan cara membaca trafik jaringan yang mencurigakan.',
            en: 'Practical understanding of the penetration testing workflow and how to read suspicious network traffic.'
        }
    },
    'portfolio': {
        icon: 'fa-globe',
        problem: {
            id: 'Butuh satu tempat terpusat untuk menampilkan project, sertifikasi, dan cara dihubungi.',
            en: 'Needed one centralized place to showcase projects, certifications, and contact info.'
        },
        arch: {
            id: 'Website statis HTML/CSS/JS, di-host di GitHub Pages dengan Cloudflare sebagai DNS &amp; CDN, custom domain.',
            en: 'A static HTML/CSS/JS website, hosted on GitHub Pages with Cloudflare as DNS &amp; CDN, on a custom domain.'
        },
        tools: ['HTML', 'CSS', 'JavaScript', 'Cloudflare', 'GitHub Pages'],
        outcome: {
            id: 'Portofolio yang cepat diakses, gratis di-hosting, dan gampang di-update lewat Git.',
            en: 'A fast-loading portfolio, free to host, and easy to update via Git.'
        }
    }
};

/* =========================================================
   PROJECT MODAL
========================================================= */
const modalOverlay = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');
let lastFocusedBeforeModal = null;

function getFocusableInModal() {
    if (!modalOverlay) return [];
    return Array.from(modalOverlay.querySelectorAll('a[href], button:not([disabled])'))
        .filter(el => el.offsetParent !== null || el === document.activeElement);
}

function trapFocus(e) {
    if (e.key !== 'Tab' || !modalOverlay?.classList.contains('is-open')) return;
    const focusable = getFocusableInModal();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}

function openProjectModal(key) {
    const data = PROJECTS[key];
    if (!data || !modalOverlay) return;

    lastFocusedBeforeModal = document.activeElement;

    const card = document.querySelector(`.project-card[data-project="${key}"]`);
    const title = card?.querySelector('h3')?.textContent ?? key;
    const repoLink = card?.querySelector('.card-repo')?.getAttribute('href') ?? '#';

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalVisual').innerHTML = `<i class="fas ${data.icon}"></i>`;
    const lang = document.documentElement.lang === 'en' ? 'en' : 'id';
    document.getElementById('modalProblem').textContent = data.problem[lang];
    document.getElementById('modalArch').textContent = data.arch[lang];
    document.getElementById('modalOutcome').innerHTML = data.outcome[lang];
    document.getElementById('modalRepo').setAttribute('href', repoLink);

    const toolsEl = document.getElementById('modalTools');
    toolsEl.innerHTML = data.tools.map(t => `<span class="tag">${t}</span>`).join('');

    const caseStudyBtn = document.getElementById('modalCaseStudy');
    if (caseStudyBtn) {
        if (data.caseStudy) {
            caseStudyBtn.href = data.caseStudy;
            caseStudyBtn.style.display = '';
        } else {
            caseStudyBtn.style.display = 'none';
        }
    }

    modalOverlay.classList.add('is-open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => modalClose?.focus());
    document.addEventListener('keydown', trapFocus);
}

function closeProjectModal() {
    modalOverlay?.classList.remove('is-open');
    modalOverlay?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapFocus);
    lastFocusedBeforeModal?.focus();
}

document.querySelectorAll('.card-details').forEach(btn => {
    btn.addEventListener('click', () => openProjectModal(btn.dataset.project));
});

modalClose?.addEventListener('click', closeProjectModal);
modalOverlay?.addEventListener('click', e => {
    if (e.target === modalOverlay) closeProjectModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProjectModal();
});

/* =========================================================
   PROJECT CATEGORY FILTER
========================================================= */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('#projectsGrid .project-card');
const filterEmpty = document.getElementById('filterEmpty');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.dataset.filter;
        let visibleCount = 0;

        projectCards.forEach(card => {
            const match = filter === 'all' || card.dataset.category === filter;
            card.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });

        if (filterEmpty) filterEmpty.hidden = visibleCount !== 0;
    });
});

/* =========================================================
   AOS
========================================================= */
AOS.init({ duration: 800, once: true, offset: 60 });

/* =========================================================
   LOADER
========================================================= */
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 800);
        }
    }, 900);
});

/* =========================================================
   THEME TOGGLE (persisted)
========================================================= */
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}
setThemeIcon();

themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    setThemeIcon();
});

function setThemeIcon() {
    const icon = themeToggle?.querySelector('i');
    if (!icon) return;
    const isLight = document.body.classList.contains('light-mode');
    icon.classList.toggle('fa-moon', !isLight);
    icon.classList.toggle('fa-sun', isLight);
}

/* =========================================================
   TYPING EFFECT
========================================================= */
const typingEl = document.getElementById('typing');
const roles = ['Network Engineer', 'Linux Enthusiast', 'Web Developer', 'IoT Developer'];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (typingEl) {
    if (prefersReducedMotion) {
        typingEl.textContent = roles[0];
    } else {
        let roleIndex = 0, charIndex = 0, deleting = false;

        function typeLoop() {
            const current = roles[roleIndex];

            if (!deleting) {
                charIndex++;
                typingEl.textContent = current.slice(0, charIndex);
                if (charIndex === current.length) {
                    deleting = true;
                    setTimeout(typeLoop, 1400);
                    return;
                }
            } else {
                charIndex--;
                typingEl.textContent = current.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                }
            }
            setTimeout(typeLoop, deleting ? 45 : 90);
        }
        typeLoop();
    }
}

/* =========================================================
   STATS — auto-computed from actual page content
========================================================= */
function computeStats() {
    const projectCount = document.querySelectorAll('#projects .project-card').length;

    const techNames = new Set();
    document.querySelectorAll('.logo-item span').forEach(el => techNames.add(el.textContent.trim()));

    const startYear = 2020;
    const years = new Date().getFullYear() - startYear;

    animateCount('statProjects', projectCount);
    animateCount('statTech', techNames.size);
    animateCount('statYears', years);
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    if (prefersReducedMotion || target === 0) { el.textContent = target; return; }

    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

const statsSection = document.getElementById('stats');
if (statsSection && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                computeStats();
                io.disconnect();
            }
        });
    }, { threshold: .4 });
    io.observe(statsSection);
} else {
    computeStats();
}

/* =========================================================
   TILT EFFECT ON CARDS (skip on touch devices)
========================================================= */
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('.skill-card, .project-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = (y - rect.height / 2) / 22;
            const rotateY = (rect.width / 2 - x) / 22;
            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* =========================================================
   CUSTOM CURSOR (desktop / mouse only)
========================================================= */
if (!isTouch) {
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    if (dot && outline) {
        document.body.classList.add('has-custom-cursor');
        document.addEventListener('mousemove', e => {
            dot.style.left = e.clientX + 'px';
            dot.style.top = e.clientY + 'px';
            outline.animate(
                { left: e.clientX + 'px', top: e.clientY + 'px' },
                { duration: 300, fill: 'forwards' }
            );
        });

        document.querySelectorAll('.skill-card, .project-card, .btn, .contact-card, .nav-links a, .cv-btn, .view-pdf-btn')
            .forEach(el => {
                el.addEventListener('mouseenter', () => {
                    outline.style.width = '58px';
                    outline.style.height = '58px';
                    outline.style.borderColor = 'var(--signal)';
                });
                el.addEventListener('mouseleave', () => {
                    outline.style.width = '34px';
                    outline.style.height = '34px';
                    outline.style.borderColor = 'rgba(240,180,41,.5)';
                });
            });
    }
}

/* =========================================================
   BACKGROUND PARTICLES (lightweight canvas)
========================================================= */
(function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    const mouse = { x: null, y: null, active: false };
    const LINK_DIST = 130;
    const MOUSE_DIST = 170;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function makeParticles() {
        const count = Math.min(70, Math.floor((w * h) / 18000));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.4 + 0.6
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // move + draw nodes
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            ctx.beginPath();
            ctx.fillStyle = 'rgba(217,168,87,0.65)';
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // draw edges between nearby nodes (network topology look)
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    ctx.strokeStyle = `rgba(217,168,87,${0.18 * (1 - dist / LINK_DIST)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            // connect cursor to nearby nodes, like a device "pinging" the network
            if (mouse.active) {
                const p = particles[i];
                const dx = p.x - mouse.x, dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_DIST) {
                    ctx.strokeStyle = `rgba(108,140,255,${0.35 * (1 - dist / MOUSE_DIST)})`;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }

        if (mouse.active) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(108,140,255,0.9)';
            ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }

    resize();
    makeParticles();
    draw();
    window.addEventListener('resize', () => { resize(); makeParticles(); });

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.active = false; });
})();
