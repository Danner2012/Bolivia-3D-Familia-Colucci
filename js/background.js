/**
 * Bolivia Wars: Background Starfield Animation
 * Uses Three.js to create a rotating 3D starfield.
 */

(function() {
    let scene, camera, renderer, stars, starGeo;

    function init() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 1;
        camera.rotation.x = Math.PI / 2;

        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('bg-stars'),
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const starCount = 6000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            positions[i * 3] = Math.random() * 600 - 300;
            positions[i * 3 + 1] = Math.random() * 600 - 300;
            positions[i * 3 + 2] = Math.random() * 600 - 300;
        }

        starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/circle.png');
        const starMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.7,
            map: sprite,
            transparent: true,
            opacity: 0.8
        });

        stars = new THREE.Points(starGeo, starMaterial);
        scene.add(stars);

        window.addEventListener('resize', onWindowResize, false);
        animate();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        
        stars.rotation.y += 0.0005;
        stars.rotation.x += 0.0002;

        renderer.render(scene, camera);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
