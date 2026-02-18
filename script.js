const PRIORITY_NAMES = ["ALLİANZ SİGORTA", "ANADOLU SİGORTA", "AXA SİGORTA", "BUPA ACIBADEM"];

let ALL_INSTITUTIONS = [];
let ALL_DOCTORS = [];
let currentHospital = 'nilufer';
let currentMode = 'doctors';

const instContainer = document.getElementById('institutions-container');
const docsContainer = document.getElementById('doctors-list');
const searchInput = document.getElementById('main-search');
const branchFilter = document.getElementById('branch-filter');
const modeBtns = document.querySelectorAll('.segment-btn');
const tabBtns = document.querySelectorAll('.tab-btn');

async function fetchData() {
    try {
        const [instRes, docRes] = await Promise.all([
            fetch('src/data/institutions.json'),
            fetch('src/data/tss_doktor.json')
        ]);

        const institutions = await instRes.json();
        const rawDoctors = await docRes.json();

        // Hospital ID mapping helper
        const getHospitalId = (name) => {
            const mapping = {
                'Doruk Özel Nilüfer Hastanesi': 'nilufer',
                'Doruk Özel Yıldırım Hastanesi': 'yildirim',
                'Doruk Özel Bursa Hastanesi': 'cekirge'
            };
            return mapping[name] || 'nilufer';
        };

        // Map tss_doktor.json format to app format (with full details)
        ALL_DOCTORS = rawDoctors.map(doc => ({
            name: doc.name.toUpperCase(),
            title: doc.title || '',
            branch: doc.unit_name || 'Genel',
            hospital: getHospitalId(doc.hosp),
            link: doc.link || '',
            fotograf_url: doc.fotograf_url || '',
            updated: doc.updated || false
        }));

        // Process and sort institutions
        const priorityInsts = institutions.filter(item => PRIORITY_NAMES.includes(item.name))
            .sort((a, b) => PRIORITY_NAMES.indexOf(a.name) - PRIORITY_NAMES.indexOf(b.name));
        const otherInsts = institutions.filter(item => !PRIORITY_NAMES.includes(item.name))
            .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        ALL_INSTITUTIONS = [...priorityInsts, ...otherInsts];

        ALL_INSTITUTIONS = [...priorityInsts, ...otherInsts];

        init();
    } catch (error) {
        console.error('Error loading data:', error);
        docsContainer.innerHTML = '<p class="error-msg">Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.</p>';
    }
}

function init() {
    renderInstitutions(ALL_INSTITUTIONS);
    populateBranchFilter();
    applyFilters();
    startAutoScroll();
}

// Function to render institutions
function renderInstitutions(data) {
    if (!instContainer) return;
    instContainer.innerHTML = '';

    if (data.length === 0) {
        instContainer.innerHTML = '<p class="no-results">Kurum bulunamadı.</p>';
        return;
    }

    data.forEach(inst => {
        const card = document.createElement('div');
        card.className = 'institution-card';
        card.innerHTML = `
            <div class="inst-logo-wrap">
                <img src="${inst.logo}" alt="${inst.name}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/40x40?text=?';">
            </div>
            <p style="font-size: 13px; font-weight: 600; line-height: 1.2;">${inst.name}</p>
        `;
        instContainer.appendChild(card);
    });

    // Reset scroll position to start to prevent empty view if scrolled
    instContainer.scrollLeft = 0;
}

// Function to render doctors as a flat list
function renderDoctors(data) {
    if (!docsContainer) return;
    docsContainer.innerHTML = '';

    if (data.length === 0) {
        docsContainer.innerHTML = '<div class="no-results-box"><i class="fas fa-search"></i><p>Aradığınız kriterlere uygun doktor bulunamadı.</p></div>';
        return;
    }

    const listDiv = document.createElement('div');
    listDiv.className = 'doctor-items';

    // Sort by name
    const sortedDocs = data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    listDiv.innerHTML = sortedDocs.map(doc => `
        <div class="doctor-item">
            ${doc.updated ? '<div class="new-badge"><i class="fas fa-star"></i></div>' : ''}
            <div class="doc-info-main">
                ${doc.fotograf_url ? `<img src="${doc.fotograf_url}" class="doc-thumb" alt="${doc.name}">` : `<div class="doc-thumb-placeholder"><i class="fas fa-user-md"></i></div>`}
                <div class="doc-text">
                    <span class="doc-title">${doc.title}</span>
                    <span class="doc-name">${doc.name}</span>
                    <span class="doc-branch">${doc.branch}</span>
                </div>
            </div>
            ${doc.link ? `<a href="${doc.link}" target="_blank" class="doc-profile-link" title="Profili Gör"><i class="fas fa-external-link-alt"></i></a>` : ''}
        </div>
    `).join('');

    docsContainer.appendChild(listDiv);
}

function populateBranchFilter() {
    if (!branchFilter) return;

    // Get unique branches from all doctors (regardless of current hospital to populate full list, 
    // or we could filter by current hospital if desired. Let's use ALL_DOCTORS for now)
    const branches = [...new Set(ALL_DOCTORS.map(doc => doc.branch))].sort();

    branchFilter.innerHTML = '<option value="">Tüm Branşlar</option>';
    branches.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch;
        option.textContent = branch;
        branchFilter.appendChild(option);
    });
}

function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();

    const branchValue = branchFilter ? branchFilter.value : '';

    if (currentMode === 'doctors') {
        const filtered = ALL_DOCTORS.filter(doc => {
            const matchesHospital = doc.hospital === currentHospital;
            const matchesBranch = branchValue === '' || doc.branch === branchValue;
            const matchesSearch = doc.name.toLowerCase().includes(query) ||
                doc.branch.toLowerCase().includes(query);
            return matchesHospital && matchesBranch && matchesSearch;
        });
        renderDoctors(filtered);
    } else {
        const filtered = ALL_INSTITUTIONS.filter(inst =>
            inst.name.toLowerCase().includes(query)
        );
        renderInstitutions(filtered);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    // Institution Search
    const instSearchInput = document.getElementById('institution-search');
    if (instSearchInput) {
        instSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = ALL_INSTITUTIONS.filter(inst =>
                inst.name.toLowerCase().includes(query)
            );
            renderInstitutions(filtered);
        });
    }
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;

        // Update placeholder
        searchInput.placeholder = currentMode === 'doctors' ?
            'Doktor adı veya branş giriniz' : 'Kurum adı giriniz';

        applyFilters();
    });
});

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentHospital = btn.dataset.hospital;

        applyFilters();
    });
});

// Update branch filter when hospital changes? 
// Current logic: populateBranchFilter uses ALL_DOCTORS, so it shows all branches. 
// If we want to show only branches relevant to selected hospital, we need to update populateBranchFilter to take hospital as arg.
// For now, keeping it simple as per plan.

if (branchFilter) {
    branchFilter.addEventListener('change', applyFilters);
}

searchInput.addEventListener('input', applyFilters);

// Slider Navigation Logic
const prevBtn = document.getElementById('slider-prev');
const nextBtn = document.getElementById('slider-next');
let autoScrollInterval;

function startAutoScroll() {
    stopAutoScroll();
    autoScrollInterval = setInterval(() => {
        if (!instContainer) return;
        const firstCard = instContainer.querySelector('.institution-card');
        if (!firstCard) return;

        const cardWidth = firstCard.offsetWidth + 16; // width + gap

        // Check if we are at the end
        if (instContainer.scrollLeft + instContainer.clientWidth >= instContainer.scrollWidth - 10) {
            instContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            instContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
    }, 4000); // 4 seconds
}

function stopAutoScroll() {
    clearInterval(autoScrollInterval);
}

if (prevBtn && nextBtn && instContainer) {
    prevBtn.addEventListener('click', () => {
        const firstCard = instContainer.querySelector('.institution-card');
        if (firstCard) {
            const cardWidth = firstCard.offsetWidth + 16;
            instContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            stopAutoScroll();
        }
    });
    nextBtn.addEventListener('click', () => {
        const firstCard = instContainer.querySelector('.institution-card');
        if (firstCard) {
            const cardWidth = firstCard.offsetWidth + 16;
            instContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
            stopAutoScroll();
        }
    });

    instContainer.addEventListener('mouseenter', stopAutoScroll);
    instContainer.addEventListener('mouseleave', startAutoScroll);
}

// Start auto scroll initially
document.addEventListener('DOMContentLoaded', () => {
    // wait a bit for render
    setTimeout(startAutoScroll, 2000);
});

// Toggle Branch logic removed as requested for open grid layout

