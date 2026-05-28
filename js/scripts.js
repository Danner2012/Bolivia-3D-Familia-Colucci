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

// --- Gestión Dinámica de Dossiers por Secciones ---
function initDossiers() {
    const sections = [
        {
            containerId: 'jefaso-container',
            subjects: [
                // Carpeta Jefaso está vacía actualmente
            ]
        },
        {
            containerId: 'defensas-container',
            subjects: [
                { name: 'Aria', id: 'DF-001', model: 'assets/models/Defensas/Aria.vox', render: 'assets/render/personaje_base.png' },
                { name: 'Peter', id: 'DF-002', model: 'assets/models/Defensas/Peter.vox', render: 'assets/render/personaje_base.png' },
                { name: 'Sunna', id: 'DF-003', model: 'assets/models/Defensas/Sunna.vox', render: 'assets/render/personaje_base.png' },
                { name: 'Nangong', id: 'DF-004', model: 'assets/models/Defensas/Nangong.vox', render: 'assets/render/personaje_base.png' },
                { name: 'Default Defensa', id: 'DF-005', model: 'assets/models/Defensas/Default.vox', render: 'assets/render/personaje_base.png' },
                { name: 'Mortero', id: 'DF-006', model: 'assets/models/Defensas/mortero.vox', render: 'assets/render/personaje_base.png' }
            ]
        },
        {
            containerId: 'droides-basic-container',
            subjects: [
                { name: 'Droide B-0', id: 'DB-001', model: 'assets/models/Droides_Basic/droide0.vox', render: 'assets/render/personaje_base.png' },
                { name: 'Droide B-1', id: 'DB-002', model: 'assets/models/Droides_Basic/droide1.vox', render: 'assets/render/personaje_base.png' },
                { name: 'Droide B-2', id: 'DB-003', model: 'assets/models/Droides_Basic/droide2.vox', render: 'assets/render/personaje_base.png' },
                { name: 'Droide B-3', id: 'DB-004', model: 'assets/models/Droides_Basic/droide3.vox', render: 'assets/render/personaje_base.png' }
            ]
        },
        {
            containerId: 'droides-mega-container',
            subjects: [
                { name: 'Mega Droide M-0', id: 'DM-001', model: 'assets/models/Droides_Mega/droide_m0.vox', render: 'assets/render/personaje_base.png' },
                { name: 'Mega Droide M-1', id: 'DM-002', model: 'assets/models/Droides_Mega/droide_m1.vox', render: 'assets/render/personaje_base.png' },
                { name: 'Mega Droide M-2', id: 'DM-003', model: 'assets/models/Droides_Mega/droide_m2.vox', render: 'assets/render/personaje_base.png' }
            ]
        }
    ];

    let globalIndex = 0;
    sections.forEach(section => {
        const container = document.getElementById(section.containerId);
        if (!container) return;

        if (section.subjects.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; opacity: 0.5; padding: 2rem; text-align: center;">SIN DATOS DE INTELIGENCIA (Carpeta vacía)</p>';
            return;
        }

        section.subjects.forEach(subject => {
            const dossier = document.createElement('div');
            dossier.className = 'character-dossier vfx-reveal';
            const viewerId = `vox-viewer-${globalIndex}`;
            
            dossier.innerHTML = `
                <div class="dossier-header">
                    <div class="dossier-title">
                        <h3>Sujeto: <span>${subject.name}</span></h3>
                        <p class="dossier-id">ID_REF: ${subject.id}</p>
                    </div>
                </div>
                <div class="dossier-main">
                    <div class="view-container">
                        <div id="${viewerId}" class="vox-canvas-wrapper">
                            <p class="loading-text">INICIALIZANDO VISOR 3D...</p>
                        </div>
                        <div class="view-tag">MODELO INTERACTIVO VÓXEL</div>
                    </div>
                    <div class="view-container">
                        <div class="render-frame">
                            <img src="${subject.render}" alt="Render HQ de ${subject.name}">
                        </div>
                        <div class="view-tag">RENDERIZADO FINAL HQ</div>
                    </div>
                </div>
                <div class="dossier-footer">
                    <div class="footer-label">REPORTE TÁCTICO:</div>
                    <p>Análisis del sujeto ${subject.name}. Registrado en los archivos de la Galaxia Paceña.</p>
                </div>
            `;
            
            container.appendChild(dossier);

            setTimeout(() => {
                if (typeof THREE !== 'undefined') {
                    init3DVisor(viewerId, subject.model);
                }
            }, 100 * globalIndex);
            
            globalIndex++;
        });
    });
}

// --- Motor 3D Simplificado con Interacción ---
function init3DVisor(containerId, modelPath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(20, 40, 20);
    scene.add(mainLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const fileLoader = new THREE.FileLoader();
    fileLoader.setResponseType('arraybuffer');
    
    fileLoader.load(modelPath, function (buffer) {
        try {
            const view = new DataView(buffer);
            const version = view.getUint32(4, true);
            if (version === 200) view.setUint32(4, 150, true);

            const loader = new THREE.VOXLoader();
            const chunks = loader.parse(buffer);
            
            for (let i = 0; i < chunks.length; i++) {
                const mesh = new THREE.VOXMesh(chunks[i]);
                mesh.scale.setScalar(0.35);
                modelGroup.add(mesh);
            }
            
            const box = new THREE.Box3().setFromObject(modelGroup);
            const center = box.getCenter(new THREE.Vector3());
            modelGroup.position.sub(center);
            
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5);
            controls.update();

        } catch (e) {
            container.innerHTML = `<div style="color:red; font-size:10px;">ERROR: ${e.message}</div>`;
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

// Funciones del túnel eliminadas para evitar conflictos hasta que funcione el visor principal
window.startInmersiveExp = () => { document.getElementById('inmersive-tunnel').classList.add('active-exp'); init3DVisor('scene-1-holo'); };
window.closeInmersiveExp = () => { document.getElementById('inmersive-tunnel').classList.remove('active-exp'); };
window.advanceTunnel = () => {};
