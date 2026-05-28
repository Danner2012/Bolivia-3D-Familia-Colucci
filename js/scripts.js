document.addEventListener('DOMContentLoaded', () => {
    const skipButton = document.getElementById('skip-intro');
    const introContainer = document.getElementById('intro-container');
    const mainSite = document.getElementById('main-site');
    const mainNav = document.getElementById('main-nav');
    const navLogoBtn = document.getElementById('nav-logo-btn');
    
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
        
        // Iniciar carruseles
        initGenericCarousel('.story-part', 'chronicle-prev', 'chronicle-next', 'current-slide-num', 'total-slides-num');
        initGenericCarousel('.boceto-part', 'bocetos-prev', 'bocetos-next', 'bocetos-current-slide-num', 'bocetos-total-slides-num');
        
        fetchGitHubAvatars(); // Cargar fotos de perfil de GitHub
        window.scrollTo(0, 0);
    };

    const fetchGitHubAvatars = () => {
        document.querySelectorAll('.member-card[data-github]').forEach(card => {
            const username = card.getAttribute('data-github');
            const img = card.querySelector('.member-avatar');
            
            if (username && img) {
                fetch(`https://api.github.com/users/${username}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.avatar_url) {
                            img.src = data.avatar_url;
                        } else {
                            img.src = 'https://github.com/identicons/jedi.png'; // Fallback
                        }
                    })
                    .catch(err => {
                        console.error(`Error al cargar avatar de ${username}:`, err);
                        img.src = 'https://github.com/identicons/jedi.png';
                    });
            }
        });
    };

    const initGenericCarousel = (slideSelector, prevBtnId, nextBtnId, currentCounterId, totalCounterId) => {
        const slides = document.querySelectorAll(slideSelector);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        const currentCounter = document.getElementById(currentCounterId);
        const totalCounter = document.getElementById(totalCounterId);
        
        let currentSlide = 0;

        if (!slides.length || !prevBtn || !nextBtn) return;

        // Inicializar contador total
        if (totalCounter) {
            totalCounter.textContent = slides.length.toString().padStart(2, '0');
        }

        const updateSlides = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                    // Actualizar contador con formato 01, 02...
                    if (currentCounter) {
                        currentCounter.textContent = (i + 1).toString().padStart(2, '0');
                    }
                }
            });
        };

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateSlides(currentSlide);
        });

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlides(currentSlide);
        });
        
        // Soporte para teclado (solo si es el carrusel de crónica para evitar conflictos)
        if (prevBtnId === 'chronicle-prev') {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') prevBtn.click();
                if (e.key === 'ArrowRight') nextBtn.click();
            });
        }
    };

    const showIntro = () => {
        if (mainSite) mainSite.classList.add('hidden');
        if (mainNav) mainNav.classList.add('hidden');
        if (introContainer) {
            introContainer.style.display = 'flex';
            
            // Reiniciar animaciones
            const introText = introContainer.querySelector('.intro-text');
            const crawlContent = document.getElementById('crawl-content');
            
            if (introText) {
                introText.style.animation = 'none';
                void introText.offsetWidth; // trigger reflow
                introText.style.animation = 'fade-in-out 5s forwards';
            }
            
            if (crawlContent) {
                crawlContent.style.animation = 'none';
                void crawlContent.offsetWidth; // trigger reflow
                crawlContent.style.animation = 'crawl 90s linear forwards';
                crawlContent.style.animationDelay = '5s';
            }
        }
        
        if (mainMusic) {
            mainMusic.pause();
            mainMusic.currentTime = 0;
        }
        if (bgMusic) {
            bgMusic.muted = mainMusic ? mainMusic.muted : false;
            bgMusic.play().catch(e => console.log("Error al iniciar música de intro"));
        }
        window.scrollTo(0, 0);
    };

    if (navLogoBtn) navLogoBtn.addEventListener('click', showIntro);

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
        sectionImage: 'assets/render/renderfinal.png', 
        subjects: []
    },
    {
        id: 'jefaso',
        containerId: 'jefaso-container',
        sectionTitle: 'JEVVO',
        sectionImage: 'assets/render/jabbarender.png',
        sectionModel: 'assets/models/Jefaso/jabba2.vox',
        subjects: [] 
    },
    {
        id: 'defensas',
        containerId: 'defensas-container',
        sectionTitle: 'Unidades de Defensa',
        sectionImage: 'assets/models/Defensas/Defensas.png',
        subjects: [
            { name: 'Defensor Base', id: 'DF-001', model: 'assets/models/Defensas/Default.vox' },
            { name: 'Defensor Armado', id: 'DF-002', model: 'assets/models/Defensas/rifle.vox' },
            { name: 'Defensor Táctico', id: 'DF-003', model: 'assets/models/Defensas/rifleagachado.vox' },
            { name: 'Defensor EN GARDE!!', id: 'DF-004', model: 'assets/models/Defensas/espadamistica.vox' },
            { name: 'Defensor Sord', id: 'DF-005', model: 'assets/models/Defensas/sord.vox' },
            { name: 'Mortero', id: 'DF-006', model: 'assets/models/Defensas/mortero.vox' },
            { name: 'El Pibe del Mortero', id: 'DF-007', model: 'assets/models/Defensas/morteropibe.vox' },
            { name: 'Defensor Defensor', id: 'DF-008', model: 'assets/models/Defensas/escuditoescudoso.vox' },
            { name: 'Baja-1', id: 'DF-009', model: 'assets/models/Defensas/Aria.vox' },
            { name: 'Baja-2', id: 'DF-010', model: 'assets/models/Defensas/Sunna.vox' },
            { name: 'Baja-3', id: 'DF-011', model: 'assets/models/Defensas/Nangong.vox' },
            { name: 'Baja-4', id: 'DF-012', model: 'assets/models/Defensas/Petter.vox' }
        ]
    },
    {
        id: 'droides',
        containerId: 'droides-basic-container',
        sectionTitle: 'Batallón Droide',
        sectionImage: 'assets/models/Droides_Basic/Masistas.png',
        subjects: [
            { name: 'Droide MA-S0', id: 'DB-001', model: 'assets/models/Droides_Basic/droide1.vox' },
            { name: 'Droide MA-S1', id: 'DB-002', model: 'assets/models/Droides_Basic/droide2.vox' },
            { name: 'Droide MA-S2', id: 'DB-003', model: 'assets/models/Droides_Basic/droide3.vox' },
            { name: 'Droide MA-S3', id: 'DB-004', model: 'assets/models/Droides_Basic/droide4.vox' },
            { name: 'Droide MA-S4', id: 'DB-005', model: 'assets/models/Droides_Basic/droide5.vox' },
            { name: 'Droide Ponchado CO-B0', id: 'DM-001', model: 'assets/models/Droides_Mega/droide_m0.vox' },
            { name: 'Droide Ponchado CO-B1', id: 'DM-002', model: 'assets/models/Droides_Mega/droide_m1.vox' },
            { name: 'Droide Ponchado CO-B2', id: 'DM-003', model: 'assets/models/Droides_Mega/droide_m2.vox' }
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
        grid.classList.add('imploding');
        
        setTimeout(() => {
            grid.querySelectorAll('.vox-canvas-wrapper').forEach(el => {
                if (ACTIVE_VISORS.has(el.id)) {
                    ACTIVE_VISORS.get(el.id).dispose();
                    ACTIVE_VISORS.delete(el.id);
                }
            });

            grid.innerHTML = '';
            grid.classList.remove('imploding');
            
            const currentPage = PAGINATION_STATE[sectionId];
            const itemsPerPage = 2;
            const start = currentPage * itemsPerPage;
            const end = start + itemsPerPage;
            
            section.subjects.slice(start, end).forEach((subject, idx) => {
                renderSubjectCard(grid, subject, `${sectionId}-${start + idx}`);
            });

            renderPaginationControls(sectionId);
            grid.classList.add('exploding');
            
            if (window.lazyObserver) {
                grid.querySelectorAll('.vox-canvas-wrapper').forEach(el => window.lazyObserver.observe(el));
            }

            setTimeout(() => {
                grid.classList.remove('exploding');
            }, 600);

        }, 500);
    }
}

function renderBannerCard(container, section) {
    const card = document.createElement('div');
    card.className = 'character-dossier banner-card';
    
    const has3D = !!section.sectionModel;
    const isJefaso = section.id === 'jefaso';
    
    card.innerHTML = `
        <div class="dossier-header">
            <div class="dossier-title">
                <h3>${isJefaso ? 'Masista supremo' : 'Archivo Visual'}: 
                <span class="${isJefaso ? 'glitch' : ''}" data-text="${section.sectionTitle}">${section.sectionTitle}</span></h3>
            </div>
            ${has3D ? `<button class="view-3d-btn" onclick="toggleBanner3D('${section.id}', '${section.sectionImage}')">PROYECTAR 3D</button>` : ''}
        </div>
        <div class="dossier-main-single" id="${section.id}-main-content" style="position: relative; height: 550px; background: #000; overflow: hidden;">
            <div class="render-frame-large" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; transition: opacity 0.5s ease; background: #000;">
                <img src="${section.sectionImage}" class="section-hero-img">
            </div>
            ${has3D ? `
            <div class="vox-canvas-wrapper" id="vox-viewer-special-${section.id}" data-model="${section.sectionModel}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; z-index: 1; transition: opacity 0.5s ease;">
                <p class="loading-text">INICIALIZANDO PROYECCIÓN...</p>
            </div>` : ''}
        </div>
        <div class="dossier-footer"><div class="footer-label">${isJefaso ? 'ARCHIVO VISUAL DEL ALTO MANDO SEPARATISTA' : 'VISTA GENERAL RENDERIZADA COMPLETA'}</div></div>
    `;
    container.appendChild(card);
}

window.toggleBanner3D = (sectionId, originalImage) => {
    const mainContent = document.getElementById(`${sectionId}-main-content`);
    if (!mainContent) return;

    const imgContainer = mainContent.querySelector('.render-frame-large');
    const voxContainer = mainContent.querySelector('.vox-canvas-wrapper');
    const btn = mainContent.closest('.character-dossier').querySelector('.view-3d-btn');
    
    const is3DActive = voxContainer.style.opacity === '1';

    if (is3DActive) {
        // Volver a imagen
        voxContainer.classList.add('projecting-glitch');
        
        setTimeout(() => {
            voxContainer.style.opacity = '0';
            voxContainer.style.zIndex = '1';
            imgContainer.style.opacity = '1';
            imgContainer.style.zIndex = '2';
            voxContainer.classList.remove('projecting-glitch');
            btn.innerText = 'PROYECTAR 3D';
        }, 400);
    } else {
        // Proyectar 3D
        imgContainer.classList.add('projecting-glitch');
        
        // Efecto de interferencia (overlay)
        const overlay = document.createElement('div');
        overlay.className = 'glitch-overlay';
        mainContent.appendChild(overlay);

        setTimeout(() => {
            imgContainer.style.opacity = '0';
            imgContainer.style.zIndex = '1';
            voxContainer.style.opacity = '1';
            voxContainer.style.zIndex = '2';
            voxContainer.classList.add('projection-active');
            imgContainer.classList.remove('projecting-glitch');
            btn.innerText = 'VOLVER AL RENDER';
            
            // Forzar carga 3D si no está cargado
            if (window.lazyObserver) {
                window.lazyObserver.observe(voxContainer);
            }
            
            setTimeout(() => {
                overlay.remove();
                voxContainer.classList.remove('projection-active');
            }, 800);
        }, 400);
    }
};

function renderSubjectCard(container, subject, globalIdx) {
    const card = document.createElement('div');
    card.className = 'character-dossier';
    const viewerId = `vox-viewer-${globalIdx}`;
    card.innerHTML = `
        <div class="dossier-header">
            <div class="dossier-title"><h3>Archivo: <span>${subject.name}</span></h3></div>
        </div>
        <div class="dossier-main-single">
            <div class="view-container"><div id="${viewerId}" class="vox-canvas-wrapper" data-model="${subject.model}">
                <p class="loading-text">CARGANDO MODELO...</p>
            </div><div class="view-tag">HOLOGRAMA INTERACTIVO 3D</div></div>
        </div>
        <div class="dossier-footer"><div class="footer-label">DISEÑO 3D HECHO 100% A MANO</div></div>
    `;
    container.appendChild(card);
}

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
        }
    };
}
