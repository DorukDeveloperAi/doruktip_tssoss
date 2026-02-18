const PRIORITY_NAMES = ["ALLİANZ SİGORTA", "ANADOLU SİGORTA", "AXA SİGORTA", "BUPA ACIBADEM"];

let ALL_INSTITUTIONS = [];
let ALL_DOCTORS = [];
let currentHospital = 'all';
let currentMode = 'doctors';

const instContainer = document.getElementById('institutions-container');
const docsContainer = document.getElementById('doctors-list');
const searchInput = document.getElementById('doctor-search');
const hospitalFilter = document.getElementById('hospital-filter');
const branchFilter = document.getElementById('branch-filter');
const tssFilter = document.getElementById('tss-filter');
// tssFilter already declared on line 13
// const modeBtns removed


async function fetchData() {
    try {
        const [instRes, docRes] = await Promise.all([
            fetch('src/data/institutions.json'),
            fetch('src/data/doctors_data.json')
        ]);

        const institutions = await instRes.json();
        const doctorsData = await docRes.json();

        // Hospital ID mapping helper
        const getHospitalId = (name) => {
            if (!name) return 'nilufer'; // Default
            const mapping = {
                'Doruk Özel Nilüfer Hastanesi': 'nilufer',
                'Doruk Özel Yıldırım Hastanesi': 'yildirim',
                'Doruk Özel Bursa Hastanesi': 'cekirge'
            };
            return mapping[name] || 'nilufer';
        };
        // Map doctors data to app format
        ALL_DOCTORS = doctorsData.map(doc => ({
            name: doc.name.trim().toUpperCase(),
            title: doc.title || '',
            branch: doc.unit_name || 'Genel',
            hospital: getHospitalId(doc.hosp),
            hospitalName: doc.hosp || '', // Store full hospital name
            link: doc.link || '',
            fotograf_url: doc.fotograf_url || '',
            tss_agreement: doc.tss_agreement || false,
            tss_new: doc.tss_new || false
        }));

        // Process and sort institutions
        const priorityInsts = institutions.filter(item => PRIORITY_NAMES.includes(item.name))
            .sort((a, b) => PRIORITY_NAMES.indexOf(a.name) - PRIORITY_NAMES.indexOf(b.name));
        const otherInsts = institutions.filter(item => !PRIORITY_NAMES.includes(item.name))
            .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
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
        // Removed name display as requested
        card.innerHTML = `
            <div class="inst-logo-wrap" style="height: 100%; display: flex; align-items: center; justify-content: center;">
                <img src="${inst.logo}" alt="${inst.name}" 
                     style="max-height: 80px; width: auto;"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/40x40?text=?';">
            </div>
        `;
        card.title = inst.name; // Show name on hover via tooltip
        instContainer.appendChild(card);
    });

    // Reset scroll position to start to prevent empty view if scrolled
    instContainer.scrollLeft = 0;
}

// Function to render doctors as a flat list
let currentPage = 1;
const itemsPerPage = 12;

// Function to render doctors with pagination
function renderDoctors(data) {
    if (!docsContainer) return;
    docsContainer.innerHTML = '';

    const paginationContainer = document.getElementById('pagination-controls');
    if (paginationContainer) paginationContainer.innerHTML = '';

    if (data.length === 0) {
        docsContainer.innerHTML = '<div class="no-results-box"><i class="fas fa-search"></i><p>Aradığınız kriterlere uygun doktor bulunamadı.</p></div>';
        return;
    }

    // Sort by name
    const sortedDocs = data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    // Pagination Logic
    const totalPages = Math.ceil(sortedDocs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDocs = sortedDocs.slice(startIndex, endIndex);

    // Render Current Page Items
    const listDiv = document.createElement('div');
    listDiv.className = 'doctor-items';

    listDiv.innerHTML = currentDocs.map(doc => {
        return `
        <div class="doctor-item">
            ${doc.tss_agreement ? '<div class="agreement-badge"><i class="fas fa-check-circle"></i> TSS / ÖSS</div>' : ''}
            
            <div class="doctor-image-wrapper" style="position: relative;">
                ${doc.fotograf_url ?
                `<img src="${doc.fotograf_url}" class="doc-thumb" alt="${doc.name}">` :
                `<div class="doc-thumb-placeholder"><i class="fas fa-user-md"></i></div>`
            }
            </div>
            
            <div class="doc-text">
                <span class="doc-title">${doc.title}</span>
                <span class="doc-name">${doc.name}</span>
                <span class="doc-branch">${doc.branch}</span>
                <span class="doc-hospital"><i class="far fa-hospital"></i> ${doc.hospitalName}</span>
                ${doc.tss_new ? '<div class="new-agreement-alert"><i class="fas fa-star"></i> TSS/OSS Kapsamına Yeni Geçti</div>' : ''}
            </div>
            ${doc.link ? `<a href="${doc.link}" target="_blank" class="doc-profile-link" title="Profili Gör"><i class="fas fa-external-link-alt"></i></a>` : ''}
        </div>
    `}).join('');

    docsContainer.appendChild(listDiv);

    // Render Pagination Controls
    if (totalPages > 1) {
        renderPagination(totalPages, paginationContainer);
    }
}

function renderPagination(totalPages, container) {
    if (!container) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.onclick = () => changePage(currentPage - 1, totalPages);
    container.appendChild(prevBtn);

    // Page Numbers
    // Logic to show limited page numbers (e.g. 1, 2, ..., 5, 6) could be added here
    // For now, let's simple show all if less than 7, or compact logic

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
    }
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }

    if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.className = 'pagination-btn';
        firstPageBtn.innerText = '1';
        firstPageBtn.onclick = () => changePage(1, totalPages);
        container.appendChild(firstPageBtn);

        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.innerText = '...';
            container.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => changePage(i, totalPages);
        container.appendChild(btn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.innerText = '...';
            container.appendChild(dots);
        }
        const lastPageBtn = document.createElement('button');
        lastPageBtn.className = 'pagination-btn';
        lastPageBtn.innerText = totalPages;
        lastPageBtn.onclick = () => changePage(totalPages, totalPages);
        container.appendChild(lastPageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.onclick = () => changePage(currentPage + 1, totalPages);
    container.appendChild(nextBtn);
}

function changePage(newPage, totalPages) {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    currentPage = newPage;

    // Scroll to top of doctor list
    const sectionTop = document.querySelector('.doctors-section').offsetTop - 100;
    window.scrollTo({ top: sectionTop, behavior: 'smooth' });

    applyFilters(); // Re-render with new page
}

function populateBranchFilter() {
    if (!branchFilter) return;

    // Get unique branches from all doctors
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
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const hospitalValue = hospitalFilter ? hospitalFilter.value : 'all';
    const branchValue = branchFilter ? branchFilter.value : '';
    const tssValue = tssFilter ? tssFilter.value : '';

    // Note: We don't reset currentPage here because renderDoctors needs it
    // But if we are called from an event listener (filter change), we should reset it.
    // However, applyFilters is also called by changePage.
    // To handle this, we can rely on the fact that changePage updates currentPage BEFORE calling applyFilters.
    // BUT, if this call comes from a filter change event, we should reset to 1.
    // Solution: We'll modify the event listeners to reset currentPage instead.

    if (currentMode === 'doctors') {
        const filtered = ALL_DOCTORS.filter(doc => {
            const matchesHospital = hospitalValue === 'all' || doc.hospital === hospitalValue;
            const matchesBranch = branchValue === '' || doc.branch === branchValue;
            const matchesTss = tssValue === '' || (tssValue === 'true' && doc.tss_agreement === true);
            const matchesSearch = doc.name.toLowerCase().includes(query) ||
                doc.branch.toLowerCase().includes(query);
            return matchesHospital && matchesBranch && matchesSearch && matchesTss;
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



    // --- Global Search Logic with Tabs and Find Button ---
    const globalSearchInput = document.getElementById('global-search-input');
    const globalSearchBtn = document.getElementById('global-search-btn');
    const tabBtns = document.querySelectorAll('.search-tab-btn');
    let activeSearchMode = 'doctor'; // Default

    // Function to perform search
    const performGlobalSearch = () => {
        if (!globalSearchInput) return;
        const query = globalSearchInput.value.toLowerCase().trim();

        if (activeSearchMode === 'institution') {
            // Filter Institutions
            const filteredInsts = ALL_INSTITUTIONS.filter(inst =>
                inst.name.toLowerCase().includes(query)
            );
            renderInstitutions(filteredInsts);

            // Scroll to Institutions
            const instSection = document.getElementById('institutions');
            if (instSection) {
                const offset = 100;
                const top = instSection.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        } else {
            // Filter Doctors
            if (searchInput) {
                searchInput.value = query;
                currentPage = 1;
                applyFilters();
            }
            // Ensure all institutions are shown or reset? 
            // If searching for doctors, we might want to reset institutions to show all/random
            renderInstitutions(ALL_INSTITUTIONS);

            // Scroll to Doctors
            const docsSection = document.getElementById('doctors');
            if (docsSection) {
                const offset = 100;
                const top = docsSection.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        }
    };

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSearchMode = btn.dataset.target;

            // Clear input on tab switch
            if (globalSearchInput) {
                globalSearchInput.value = '';
                globalSearchInput.focus();
            }

            if (activeSearchMode === 'doctor') {
                globalSearchInput.placeholder = "Doktor adı veya branş yazınız...";
                // Reset Doctor List
                if (searchInput) {
                    searchInput.value = '';
                    currentPage = 1;
                    applyFilters();
                }
            } else {
                globalSearchInput.placeholder = "Kurum adı yazınız...";
                // Reset Institution List
                renderInstitutions(ALL_INSTITUTIONS);
            }
        });
    });

    // Event Listeners for Search
    if (globalSearchBtn) {
        globalSearchBtn.addEventListener('click', performGlobalSearch);
    }

    if (globalSearchInput) {
        globalSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performGlobalSearch();
            }
        });
        // Optional: Keep real-time filtering without scrolling?
        // User asked for "filter find show button style", implying manual trigger.
        // But for better UX, we can filter AS they type, but only SCROLL on button/enter.
        globalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (activeSearchMode === 'institution') {
                const filteredInsts = ALL_INSTITUTIONS.filter(inst =>
                    inst.name.toLowerCase().includes(query)
                );
                renderInstitutions(filteredInsts);
            } else {
                if (searchInput) {
                    searchInput.value = query;
                    currentPage = 1;
                    applyFilters();
                }
            }
        });
    }

});

// Mode logic removed


if (hospitalFilter) {
    hospitalFilter.addEventListener('change', () => { currentPage = 1; applyFilters(); });
}

if (branchFilter) {
    branchFilter.addEventListener('change', () => { currentPage = 1; applyFilters(); });
}

if (tssFilter) {
    tssFilter.addEventListener('change', () => { currentPage = 1; applyFilters(); });
}

if (searchInput) {
    searchInput.addEventListener('input', () => { currentPage = 1; applyFilters(); });
}

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
            // Start auto scroll again after manual interaction
            setTimeout(startAutoScroll, 4000);
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
