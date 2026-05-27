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
        window.scrollTo(0, 0);
        
        // Carga inmediata del modelo con verificación de librería
        setTimeout(() => {
            if (typeof THREE !== 'undefined') {
                init3DVisor('direct-vox-viewer');
            } else {
                const container = document.getElementById('direct-vox-viewer');
                if (container) container.innerHTML = '<div style="color:red; padding:20px;">ERROR: Librería 3D bloqueada por el navegador. Intenta desactivar la "Prevención de Seguimiento" o usa otro navegador.</div>';
            }
        }, 500);
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

// --- Motor 3D Simplificado con Interacción ---
function init3DVisor(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(30, 30, 30);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    // Controles de Órbita (Zoom, Rotación, Paneo)
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Iluminación Neutra (Sin tintes verdes)
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(20, 40, 20);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xffffff, 0.5);
    fillLight.position.set(-20, 10, -20);
    scene.add(fillLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const fileLoader = new THREE.FileLoader();
    fileLoader.setResponseType('arraybuffer');
    
    fileLoader.load('assets/models/personaje_base.vox', function (buffer) {
        try {
            const view = new DataView(buffer);
            const version = view.getUint32(4, true);
            if (version === 200) view.setUint32(4, 150, true);

            const loader = new THREE.VOXLoader();
            const chunks = loader.parse(buffer);
            
            for (let i = 0; i < chunks.length; i++) {
                const mesh = new THREE.VOXMesh(chunks[i]);
                mesh.scale.setScalar(0.35); // Escala aumentada
                modelGroup.add(mesh);
            }
            
            const box = new THREE.Box3().setFromObject(modelGroup);
            const center = box.getCenter(new THREE.Vector3());
            modelGroup.position.sub(center);
            
            // Ajustar cámara para que el modelo se vea grande
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.set(maxDim * 1.2, maxDim * 1.0, maxDim * 1.2);
            controls.target.set(0, 0, 0);
            controls.update();

        } catch (e) {
            console.error('Error:', e);
            container.innerHTML = `<div style="color:red; font-size:10px;">ERROR: ${e.message}</div>`;
        }
    }, undefined, (error) => {
        container.innerHTML = `<div style="color:red; font-size:10px;">ERROR_CARGA</div>`;
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Necesario para el damping y auto-rotate
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Funciones del túnel eliminadas para evitar conflictos hasta que funcione el visor principal
window.startInmersiveExp = () => { document.getElementById('inmersive-tunnel').classList.add('active-exp'); init3DVisor('scene-1-holo'); };
window.closeInmersiveExp = () => { document.getElementById('inmersive-tunnel').classList.remove('active-exp'); };
window.advanceTunnel = () => {};
