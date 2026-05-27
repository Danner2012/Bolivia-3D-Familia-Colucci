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
    
    // Auto-saltar para desarrollo rápido
    setTimeout(showMainSite, 1000); 
});

// --- Motor 3D Simplificado ---
function init3DVisor(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const light = new THREE.DirectionalLight(0x00ff88, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Usamos FileLoader para tener control sobre los bytes
    const fileLoader = new THREE.FileLoader();
    fileLoader.setResponseType('arraybuffer');
    
    console.log('Iniciando carga de:', 'assets/models/personaje_base.vox');

    fileLoader.load('assets/models/personaje_base.vox', function (buffer) {
        try {
            const view = new DataView(buffer);
            const version = view.getUint32(4, true);
            
            if (version === 200) {
                console.log('Detectada versión 200, parcheando a 150 para compatibilidad...');
                view.setUint32(4, 150, true);
            }

            const loader = new THREE.VOXLoader();
            const chunks = loader.parse(buffer);
            
            if (!chunks || chunks.length === 0) {
                throw new Error('No se encontraron bloques de datos en el archivo');
            }

            console.log('Procesando chunks:', chunks.length);
            for (let i = 0; i < chunks.length; i++) {
                const mesh = new THREE.VOXMesh(chunks[i]);
                mesh.scale.setScalar(0.15); 
                modelGroup.add(mesh);
            }
            
            const box = new THREE.Box3().setFromObject(modelGroup);
            const center = box.getCenter(new THREE.Vector3());
            modelGroup.position.sub(center);
            
            // Centrar cámara basado en el tamaño
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5);
            camera.lookAt(0, 0, 0);

            console.log('Modelo cargado exitosamente');

        } catch (e) {
            console.error('Error procesando el modelo:', e);
            container.innerHTML = `<div style="color:red; padding:10px; font-size:10px;">ERROR_PROCESO: ${e.message}</div>`;
        }
    }, 
    (xhr) => {
        if (xhr.total > 0) console.log((xhr.loaded / xhr.total * 100) + '% cargado');
    }, 
    (error) => {
        console.error('Error de red:', error);
        container.innerHTML = `<div style="color:red; padding:10px; font-size:10px;">ERROR_RED: Verifica la ruta del archivo</div>`;
    });

    function animate() {
        requestAnimationFrame(animate);
        modelGroup.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

// Funciones del túnel eliminadas para evitar conflictos hasta que funcione el visor principal
window.startInmersiveExp = () => { document.getElementById('inmersive-tunnel').classList.add('active-exp'); init3DVisor('scene-1-holo'); };
window.closeInmersiveExp = () => { document.getElementById('inmersive-tunnel').classList.remove('active-exp'); };
window.advanceTunnel = () => {};
