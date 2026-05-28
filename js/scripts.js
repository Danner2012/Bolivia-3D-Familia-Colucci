document.addEventListener('DOMContentLoaded', () => {
    const skipButton = document.getElementById('skip-intro');
    const introContainer = document.getElementById('intro-container');
    const mainSite = document.getElementById('main-site');
    const mainNav = document.getElementById('main-nav');
    
    const bgMusic = document.getElementById('bg-music');
    const mainMusic = document.getElementById('main-music');
    const audioToggle = document.getElementById('audio-toggle');

    const showMainSite = () => {
        if (introContainer) introContainer.style.display = 'none';
        if (mainSite) mainSite.classList.remove('hidden');
        if (mainNav) mainNav.classList.remove('hidden');
        
        if (bgMusic) {
            bgMusic.pause();
            bgMusic.currentTime = 0;
        }
        if (mainMusic) {
            mainMusic.muted = bgMusic ? bgMusic.muted : false;
            mainMusic.play().catch(e => console.log("Error al iniciar música principal"));
        }
        
        initScrollAnimations();
        initDossiers();
        initLazyLoading(); // Iniciar observador de visores
        window.scrollTo(0, 0);
    };

    if (bgMusic && audioToggle) {
        bgMusic.volume = 1.0; 
        if (mainMusic) mainMusic.volume = 1.0;

        const forcePlay = () => {
            if (introContainer && introContainer.style.display !== 'none') {
                bgMusic.play().then(() => {
                    document.removeEventListener('mousedown', forcePlay);
                    document.removeEventListener('keydown', forcePlay);
                    document.removeEventListener('touchstart', forcePlay);
                }).catch(err => {});
            }
        };

        forcePlay();
        document.addEventListener('mousedown', forcePlay);
        document.addEventListener('keydown', forcePlay);
        document.addEventListener('touchstart', forcePlay);

        audioToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isMuted = !bgMusic.muted;
            if (bgMusic) bgMusic.muted = isMuted;
            if (mainMusic) mainMusic.muted = isMuted;
            audioToggle.classList.toggle('muted');
            audioToggle.innerHTML = isMuted ? '🔇' : '🔊';
            if (!isMuted) {
                if (introContainer && introContainer.style.display !== 'none') bgMusic.play();
                else if (mainMusic) mainMusic.play();
            }
        });
    }

    if (skipButton) skipButton.addEventListener('click', showMainSite);
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && introContainer && introContainer.style.display !== 'none') {
            e.preventDefault();
            showMainSite();
        }
    });
});

const initScrollAnimations = () => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);
    document.querySelectorAll('.vfx-reveal').forEach(el => observer.observe(el));
};

// --- Configuración de Datos ---
const SECTIONS_DATA = [
    {
        id: 'ejemplo-0',
        containerId: 'ejemplo-0-container',
        sectionTitle: 'Render Principal',
        sectionImage: 'assets/models/Elataquemasista.png', 
        subjects: []
    },
    {
        id: 'jefaso',
        containerId: 'jefaso-container',
        sectionTitle: 'Comandantes Jefaso',
        sectionImage: 'assets/models/Jefaso/Jabba.png',
        subjects: [] 
    },
    {
        id: 'defensas',
        containerId: 'defensas-container',
        sectionTitle: 'Unidades de Defensa',
        sectionImage: 'assets/models/Defensas/Defensas.png',
        subjects: [
            { name: 'Default', id: 'DF-001', model: 'assets/models/Defensas/Default.vox' },
            { name: 'Rifle', id: 'DF-002', model: 'assets/models/Defensas/rifle.vox' },
            { name: 'Rifleagachado', id: 'DF-003', model: 'assets/models/Defensas/rifleagachado.vox' },
            { name: 'Espadita magica', id: 'DF-004', model: 'assets/models/Defensas/espadamistica.vox' },
            { name: 'Sord', id: 'DF-005', model: 'assets/models/Defensas/sord.vox' },
            { name: 'Mortero', id: 'DF-006', model: 'assets/models/Defensas/mortero.vox' },
            { name: 'Mortero Pibe', id: 'DF-007', model: 'assets/models/Defensas/morteropibe.vox' },
            { name: 'Escudito Escudoso', id: 'DF-008', model: 'assets/models/Defensas/escuditoescudoso.vox' },
            { name: 'Aria', id: 'DF-009', model: 'assets/models/Defensas/Aria.vox' },
            { name: 'Sunna', id: 'DF-010', model: 'assets/models/Defensas/Sunna.vox' },
            { name: 'Nangong', id: 'DF-011', model: 'assets/models/Defensas/Nangong.vox' },
            { name: 'Peter', id: 'DF-012', model: 'assets/models/Defensas/Petter.vox' }
        ]
    },
    {
        id: 'droides',
        containerId: 'droides-basic-container',
        sectionTitle: 'Batallón Droide',
        sectionImage: 'assets/models/Droides_Basic/Masistas.png',
        subjects: [
            { name: 'Droide B-0', id: 'DB-001', model: 'assets/models/Droides_Basic/droide1.vox' },
            { name: 'Droide B-1', id: 'DB-002', model: 'assets/models/Droides_Basic/droide2.vox' },
            { name: 'Droide B-2', id: 'DB-003', model: 'assets/models/Droides_Basic/droide3.vox' },
            { name: 'Droide B-3', id: 'DB-004', model: 'assets/models/Droides_Basic/droide4.vox' },
            { name: 'Droide B-4', id: 'DB-005', model: 'assets/models/Droides_Basic/droide5.vox' },
            { name: 'Mega Droide M-0', id: 'DM-001', model: 'assets/models/Droides_Mega/droide_m0.vox' },
            { name: 'Mega Droide M-1', id: 'DM-002', model: 'assets/models/Droides_Mega/droide_m1.vox' },
            { name: 'Mega Droide M-2', id: 'DM-003', model: 'assets/models/Droides_Mega/droide_m2.vox' }
        ]
    }
];

const PAGINATION_STATE = {};
const ACTIVE_VISORS = new Map();

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

    if (!container.dataset.initialized) {
        container.innerHTML = '';
        renderBannerCard(container, section);
        if (section.subjects.length > 0) {
            const grid = document.createElement('div');
            grid.id = `${sectionId}-grid`;
            grid.className = 'dossiers-grid';
            container.appendChild(grid);
        }
        container.dataset.initialized = "true";
    }

    const grid = document.getElementById(`${sectionId}-grid`);
    if (!grid) return;

    if (section.subjects.length > 0) {
        // Limpiar visores previos de este grid antes de borrar HTML
        grid.querySelectorAll('.vox-canvas-wrapper').forEach(el => {
            if (ACTIVE_VISORS.has(el.id)) {
                ACTIVE_VISORS.get(el.id).dispose();
                ACTIVE_VISORS.delete(el.id);
            }
        });

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
            
            // Re-vincular elementos nuevos al LazyLoader si es necesario
            if (window.lazyObserver) {
                grid.querySelectorAll('.vox-canvas-wrapper').forEach(el => window.lazyObserver.observe(el));
            }
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
                <div class="view-container"><div id="${viewerId}" class="vox-canvas-wrapper" data-model="assets/models/Jefaso/Jabba.vox">
                    <p class="loading-text">SOLICITANDO ACCESO...</p>
                </div><div class="view-tag">VISOR 3D</div></div>
                <div class="view-container"><div class="render-frame"><img src="${section.sectionImage}"></div><div class="view-tag">RENDER HD</div></div>
            </div>
            <div class="dossier-footer"><div class="footer-label">ALTO MANDO</div></div>
        `;
        container.appendChild(card);
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
            <div class="view-container"><div id="${viewerId}" class="vox-canvas-wrapper" data-model="${subject.model}">
                <p class="loading-text">CARGANDO MODELO...</p>
            </div><div class="view-tag">INTERACTIVO 3D</div></div>
        </div>
        <div class="dossier-footer"><div class="footer-label">REPORTE TÁCTICO</div></div>
    `;
    container.appendChild(card);
}

// --- Lazy Loading de Visores ---
function initLazyLoading() {
    const options = {
        root: null,
        rootMargin: '200px', 
        threshold: 0.01
    };

    window.lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const container = entry.target;
            const modelPath = container.getAttribute('data-model');
            
            if (entry.isIntersecting) {
                
                if (!ACTIVE_VISORS.has(container.id)) {
                    const visor = init3DVisor(container.id, modelPath);
                    if (visor) ACTIVE_VISORS.set(container.id, visor);
                }
            } else {
                
                if (ACTIVE_VISORS.has(container.id)) {
                    ACTIVE_VISORS.get(container.id).dispose();
                    ACTIVE_VISORS.delete(container.id);
                    container.innerHTML = '<p class="loading-text">MODO AHORRO DE ENERGÍA (FUERA DE VISTA)</p>';
                }
            }
        });
    }, options);

    // Observar visores iniciales
    document.querySelectorAll('.vox-canvas-wrapper[data-model]').forEach(el => window.lazyObserver.observe(el));
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

// --- Motor 3D con Gestión de Memoria ---
function init3DVisor(containerId, modelPath) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    let animationId;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(20, 40, 20);
    scene.add(mainLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const loader = new THREE.FileLoader();
    loader.setResponseType('arraybuffer');
    loader.load(modelPath, function (buffer) {
        try {
            const view = new DataView(buffer);
            if (view.getUint32(4, true) === 200) view.setUint32(4, 150, true);
            const voxLoader = new THREE.VOXLoader();
            const chunks = voxLoader.parse(buffer);
            for (let i = 0; i < chunks.length; i++) {
                const mesh = new THREE.VOXMesh(chunks[i]);
                mesh.scale.setScalar(0.35);
                modelGroup.add(mesh);
            }
            const box = new THREE.Box3().setFromObject(modelGroup);
            modelGroup.position.sub(box.getCenter(new THREE.Vector3()));
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.set(maxDim * 0.01, maxDim * 0.5, maxDim * 1.4);
            controls.update();
        } catch (e) { container.innerHTML = `<div style="color:red; font-size:10px;">ERROR: ${e.message}</div>`; }
    });

    function animate() {
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Función de limpieza para liberar GPU y memoria
    return {
        dispose: () => {
            cancelAnimationFrame(animationId);
            renderer.dispose();
            renderer.forceContextLoss();
            scene.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
                    else object.material.dispose();
                }
            });
            if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
            console.log(`Visor ${containerId} liberado.`);
        }
    };
}
