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
        initDossiers(); // Inicializar dossiers al mostrar el sitio
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

// --- Gestión Dinámica de Dossiers ---
function initDossiers() {
    const container = document.getElementById('dossiers-container');
    if (!container) return;

    const subjects = [
        { name: 'Personaje Base', id: 'BW-001', model: 'assets/models/personaje_base.vox', render: 'assets/render/personaje_base.png' },
        { name: 'Milico Aria', id: 'BW-002', model: 'assets/models/Defensas/Aria.vox', render: 'assets/render/Aria.png' },
        { name: 'Milico Sunna', id: 'BW-004', model: 'assets/models/Defensas/Sunna.vox', render: 'assets/render/Sunna.png' },
        { name: 'Milico Nangong', id: 'BW-005', model: 'assets/models/Defensas/Nangong.vox', render: 'assets/render/Nangong.png' },
        { name: 'Milico Default', id: 'BW-006', model: 'assets/models/Defensas/Default.vox', render: 'assets/render/Default.png' }
    ];

    subjects.forEach((subject, index) => {
        const dossier = document.createElement('div');
        dossier.className = 'character-dossier vfx-reveal';
        const viewerId = `vox-viewer-${index}`;
        
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
x', render: 'assets/render/personaje_base.png' },
        { name: 'Milico Peter', id: 'BW-00                    </div>
                    <div class="view-tag">RENDERIZADO FINAL HQ</div>
                </div>
            </div>
            <div class="dossier-footer">
                <div class="footer-label">REPORTE TÁCTICO:</div>
                <p>Análisis del prototipo ${subject.name}. Unidad especializada para las crónicas de la galaxia paceña.</p>
            </div>
        `;
        
        container.appendChild(dossier);

        // Inicializar visor 3D para este dossier
        setTimeout(() => {
            if (typeof THREE !== 'undefined') {
                init3DVisor(viewerId, subject.model);
            }
        }, 100 * index);
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
