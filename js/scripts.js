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
        
        // Inicializar visor directo al mostrar el sitio
        if (document.getElementById('direct-vox-viewer')) {
            init3DVisor('direct-vox-viewer');
        }
    };

    const initScrollAnimations = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.vfx-reveal, .vfx-zoom-in').forEach(el => observer.observe(el));
    };

    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (skipButton) {
        skipButton.addEventListener('click', showMainSite);
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && introContainer && introContainer.style.display !== 'none') {
            showMainSite();
        }
    });

    setTimeout(() => {
        if (mainSite && !mainSite.classList.contains('hidden')) return;
        showMainSite();
    }, 65000);
});

// --- Motor 3D Three.js para Bitácora ---
function init3DVisor(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(12, 12, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00ff88, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00ff88, 0.5);
    pointLight.position.set(-10, -10, -10);
    scene.add(pointLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const loader = new THREE.VOXLoader();
    loader.load('assets/models/personaje_base.vox', function (chunks) {
        try {
            if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
                throw new Error('El archivo no contiene bloques válidos');
            }

            console.log('Chunks recibidos:', chunks.length);

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                // En versiones más recientes, VOXMesh se crea así
                const mesh = new THREE.VOXMesh(chunk);
                mesh.scale.setScalar(0.1); 
                modelGroup.add(mesh);
            }
            
            const box = new THREE.Box3().setFromObject(modelGroup);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            modelGroup.position.sub(center);
            
            if (size.length() < 1) modelGroup.scale.setScalar(10);
            
            // Eliminar texto de carga si todo salió bien
            const loadingText = container.querySelector('.loading-text');
            if (loadingText) loadingText.style.display = 'none';

        } catch (e) {
            console.error('Error en proceso:', e);
            showErrorInViewer(container, 'ERROR_VOX: ' + e.message);
        }
        
    }, undefined, function (error) {
        console.error('Error de carga:', error);
        showErrorInViewer(container, 'ARCHIVO_NO_LEIBLE (Verifica ruta)');
        
        // Cubo de respaldo
        const geometry = new THREE.BoxGeometry(4, 4, 4);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff88, wireframe: true });
        const cube = new THREE.Mesh(geometry, material);
        modelGroup.add(cube);
    });

    function showErrorInViewer(cont, msg) {
        // Limpiar errores previos si existen
        const oldErr = cont.querySelector('.error-overlay');
        if (oldErr) oldErr.remove();

        const errorEl = document.createElement('div');
        errorEl.className = 'error-overlay';
        errorEl.style.position = 'absolute';
        errorEl.style.top = '10px';
        errorEl.style.left = '10px';
        errorEl.style.background = 'rgba(0,0,0,0.7)';
        errorEl.style.padding = '5px';
        errorEl.style.border = '1px solid #ff3d00';
        errorEl.style.color = '#ff3d00';
        errorEl.style.fontSize = '10px';
        errorEl.style.fontFamily = 'monospace';
        errorEl.style.zIndex = '10';
        errorEl.innerText = msg;
        cont.appendChild(errorEl);
    }

    function animate() {
        requestAnimationFrame(animate);
        if (modelGroup) {
            modelGroup.rotation.y += 0.01;
        }
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Manejar redimensionamiento
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// --- Lógica Túnel 3D Inmersivo ---
let tunnelStep = 0;
const totalSteps = 3;

window.startInmersiveExp = function() {
    const tunnel = document.getElementById('inmersive-tunnel');
    if (!tunnel) return;
    
    tunnel.classList.add('active-exp');
    document.body.style.overflow = 'hidden'; 
    tunnelStep = 0;
    updateTunnelView();
    
    // Iniciar visor 3D en el túnel
    setTimeout(() => {
        init3DVisor('scene-1-holo');
    }, 500);
};

window.closeInmersiveExp = function() {
    const tunnel = document.getElementById('inmersive-tunnel');
    if (!tunnel) return;
    tunnel.classList.remove('active-exp');
    document.body.style.overflow = 'auto';
};

window.advanceTunnel = function() {
    tunnelStep = (tunnelStep + 1) % totalSteps;
    updateTunnelView();
    
    if (tunnelStep === 0) {
        init3DVisor('scene-1-holo');
    }
};

function updateTunnelView() {
    const world = document.getElementById('world-3d');
    if (!world) return;
    
    const zOffset = tunnelStep * 2000;
    world.style.transform = `translateZ(${zOffset}px)`;
    
    document.querySelectorAll('.scene-block').forEach((block, idx) => {
        if (idx === tunnelStep) {
            block.style.opacity = '1';
            block.style.visibility = 'visible';
        } else {
            block.style.opacity = '0';
            block.style.visibility = 'hidden';
        }
    });

    const progressEl = document.getElementById('tunnel-progress');
    if (progressEl) {
        progressEl.innerText = `PROGRESO: ${Math.round((tunnelStep/(totalSteps-1))*100)}%`;
    }
}

document.addEventListener('keydown', (e) => {
    const tunnel = document.getElementById('inmersive-tunnel');
    if (!tunnel || !tunnel.classList.contains('active-exp')) return;
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        advanceTunnel();
    }
    if (e.key === 'Escape') closeInmersiveExp();
});
