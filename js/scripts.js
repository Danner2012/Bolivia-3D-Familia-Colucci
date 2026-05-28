document.addEventListener('DOMContentLoaded', () => {
    const skipButton = document.getElementById('skip-intro');
    const introContainer = document.getElementById('intro-container');
    const mainSite = document.getElementById('main-site');
    const mainNav = document.getElementById('main-nav');

    const showMainSite = () => {
        if (introContainer) introContainer.style.display = 'none';
        if (mainSite) mainSite.classList.remove('hidden');
        if (mainNav) mainNav.classList.remove('hidden');
        initScrollAnimations();
        initDossiers();
        window.scrollTo(0, 0);
    };

    const initScrollAnimations = () => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, observerOptions);
        document.querySelectorAll('.vfx-reveal').forEach(el => observer.observe(el));
    };

    if (skipButton) skipButton.addEventListener('click', showMainSite);
});

// --- Configuración de Datos ---
const SECTIONS_DATA = [
    {
        id: 'jefaso',
        containerId: 'jefaso-container',
        sectionTitle: 'Comandantes Jefaso',
        sectionImage: 'assets/render/personaje_base.png',
        subjects: [] 
    },
    {
        id: 'defensas',
        containerId: 'defensas-container',
        sectionTitle: 'Unidades de Defensa',
        sectionImage: 'assets/render/personaje_base.png',
        subjects: [
            { name: 'Aria', id: 'DF-001', model: 'assets/models/Defensas/Aria.vox' },
            { name: 'Peter', id: 'DF-002', model: 'assets/models/Defensas/Peter.vox' },
            { name: 'Sunna', id: 'DF-003', model: 'assets/models/Defensas/Sunna.vox' },
            { name: 'Nangong', id: 'DF-004', model: 'assets/models/Defensas/Nangong.vox' },
            { name: 'Default Defensa', id: 'DF-005', model: 'assets/models/Defensas/Default.vox' },
            { name: 'Mortero', id: 'DF-006', model: 'assets/models/Defensas/mortero.vox' }
        ]
    },
    {
        id: 'droides',
        containerId: 'droides-basic-container',
        sectionTitle: 'Batallón Droide',
        sectionImage: 'assets/render/personaje_base.png',
        subjects: [
            { name: 'Droide B-0', id: 'DB-001', model: 'assets/models/Droides_Basic/droide0.vox' },
            { name: 'Droide B-1', id: 'DB-002', model: 'assets/models/Droides_Basic/droide1.vox' },
            { name: 'Droide B-2', id: 'DB-003', model: 'assets/models/Droides_Basic/droide2.vox' },
            { name: 'Droide B-3', id: 'DB-004', model: 'assets/models/Droides_Basic/droide3.vox' },
            { name: 'Mega Droide M-0', id: 'DM-001', model: 'assets/models/Droides_Mega/droide_m0.vox' },
            { name: 'Mega Droide M-1', id: 'DM-002', model: 'assets/models/Droides_Mega/droide_m1.vox' }
        ]
    }
];

const PAGINATION_STATE = {};

function initDossiers() {
    SECTIONS_DATA.forEach(section => {
        PAGINATION_STATE[section.id] = 0;
        renderSectionPage(section.id);
    });
}

function renderSectionPage(sectionId) {
    const section = SECTIONS_DATA.find(s => s.id === sectionId);
    const container = document.getElementById(section.containerId);
    if (!container) return;

    // Inicializar Banner PERMANENTE
    if (!container.dataset.initialized) {
        container.innerHTML = '';
        renderBannerCard(container, section);
        
        // Solo crear el grid si hay sujetos que mostrar
        if (section.subjects.length > 0) {
            const grid = document.createElement('div');
            grid.id = `${sectionId}-grid`;
            grid.className = 'dossiers-grid';
            container.appendChild(grid);
        }
        
        container.dataset.initialized = "true";
    }

    const grid = document.getElementById(`${sectionId}-grid`);
    if (!grid) return; // Si no hay grid (como en Jefaso), no hacer nada más

    // Solo pestañean los sujetos
    if (section.subjects.length > 0) {
        grid.classList.add('blinking');
        setTimeout(() => {
            grid.innerHTML = '';
            const currentPage = PAGINATION_STATE[sectionId];
            const itemsPerPage = 2;
            const start = currentPage * itemsPerPage;
            const end = start + itemsPerPage;
            
            section.subjects.slice(start, end).forEach((subject, idx) => {
                renderSubjectCard(grid, subject, `${sectionId}-${start + idx}`);
            });

            renderPaginationControls(sectionId);
            grid.classList.remove('blinking');
        }, 300);
    }
}

function renderBannerCard(container, section) {
    const card = document.createElement('div');
    card.className = 'character-dossier banner-card';
    
    if (section.id === 'jefaso') {
        const viewerId = `vox-viewer-jefazo`;
        card.innerHTML = `
            <div class="dossier-header">
                <div class="dossier-title"><h3>Comandante Supremo: <span>${section.sectionTitle}</span></h3></div>
            </div>
            <div class="dossier-main">
                <div class="view-container"><div id="${viewerId}" class="vox-canvas-wrapper"></div><div class="view-tag">VISOR 3D</div></div>
                <div class="view-container"><div class="render-frame"><img src="${section.sectionImage}"></div><div class="view-tag">RENDER HQ</div></div>
            </div>
            <div class="dossier-footer"><div class="footer-label">ALTO MANDO</div></div>
        `;
        container.appendChild(card);
        setTimeout(() => init3DVisor(viewerId, 'assets/models/personaje_base.vox'), 100);
    } else {
        card.innerHTML = `
            <div class="dossier-header">
                <div class="dossier-title"><h3>Archivo Visual: <span>${section.sectionTitle}</span></h3></div>
            </div>
            <div class="dossier-main-single">
                <div class="render-frame-large"><img src="${section.sectionImage}" class="section-hero-img"></div>
            </div>
            <div class="dossier-footer"><div class="footer-label">DOCUMENTACIÓN GRÁFICA</div></div>
        `;
        container.appendChild(card);
    }
}

function renderSubjectCard(container, subject, globalIdx) {
    const card = document.createElement('div');
    card.className = 'character-dossier';
    const viewerId = `vox-viewer-${globalIdx}`;
    card.innerHTML = `
        <div class="dossier-header">
            <div class="dossier-title"><h3>Sujeto: <span>${subject.name}</span></h3></div>
        </div>
        <div class="dossier-main-single">
            <div class="view-container"><div id="${viewerId}" class="vox-canvas-wrapper"></div><div class="view-tag">INTERACTIVO 3D</div></div>
        </div>
        <div class="dossier-footer"><div class="footer-label">REPORTE TÁCTICO</div></div>
    `;
    container.appendChild(card);
    setTimeout(() => init3DVisor(viewerId, subject.model), 100);
}

function renderPaginationControls(sectionId) {
    const section = SECTIONS_DATA.find(s => s.id === sectionId);
    if (section.id === 'jefaso' || section.subjects.length <= 2) return;

    let controls = document.getElementById(`pagination-${sectionId}`);
    if (!controls) {
        controls = document.createElement('div');
        controls.id = `pagination-${sectionId}`;
        controls.className = 'pagination-controls';
        document.getElementById(section.containerId).after(controls);
    }

    const totalPages = Math.ceil(section.subjects.length / 2);
    const currentPage = PAGINATION_STATE[sectionId];

    controls.innerHTML = `
        <button class="page-btn" ${currentPage === 0 ? 'disabled' : ''} onclick="changePage('${sectionId}', -1)">ANTERIOR</button>
        <span class="page-info">EXPEDIENTES: ${currentPage + 1} / ${totalPages}</span>
        <button class="page-btn" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="changePage('${sectionId}', 1)">SIGUIENTE</button>
    `;
}

window.changePage = (sectionId, direction) => {
    PAGINATION_STATE[sectionId] += direction;
    renderSectionPage(sectionId);
};

// --- Motor 3D ---
function init3DVisor(containerId, modelPath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(20, 40, 20);
    scene.add(mainLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    new THREE.FileLoader().setResponseType('arraybuffer').load(modelPath, function (buffer) {
        try {
            const view = new DataView(buffer);
            if (view.getUint32(4, true) === 200) view.setUint32(4, 150, true);
            const chunks = new THREE.VOXLoader().parse(buffer);
            for (let i = 0; i < chunks.length; i++) {
                const mesh = new THREE.VOXMesh(chunks[i]);
                mesh.scale.setScalar(0.35);
                modelGroup.add(mesh);
            }
            const box = new THREE.Box3().setFromObject(modelGroup);
            modelGroup.position.sub(box.getCenter(new THREE.Vector3()));
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5);
            controls.update();
        } catch (e) { container.innerHTML = `<div style="color:red; font-size:10px;">ERROR: ${e.message}</div>`; }
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
