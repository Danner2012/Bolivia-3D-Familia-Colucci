/**
 * Bolivia Wars: Hyperdrive / Warp Speed Background (Pure Starfield)
 * Stars travel towards the camera.
 * Reacts to scroll speed with smooth interpolation.
 * Base speed is very slow (contemplative).
 */

(function() {
    let scene, camera, renderer, stars, starGeo;
    let starCount = 6000;
    
    // Velocity variables
    let baseVelocity = 0.05; // Very slow base speed
    let targetVelocity = baseVelocity;
    let currentVelocity = baseVelocity;
    let scrollTimeout;

    function init() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 1;

        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('bg-stars'),
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const positions = new Float32Array(starCount * 3);
        const velocities = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            // Spread stars in a large box
            positions[i * 3] = Math.random() * 800 - 400;     // X
            positions[i * 3 + 1] = Math.random() * 800 - 400; // Y
            positions[i * 3 + 2] = Math.random() * 800 - 400; // Z
            
            velocities[i] = Math.random() * 0.2 + 0.05; // Variation
        }

        starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeo.userData = { velocities: velocities };

        const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/circle.png');
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.8,
            map: sprite,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        stars = new THREE.Points(starGeo, starMaterial);
        scene.add(stars);

        // --- Event Listeners ---
        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('scroll', handleScroll, { passive: true });

        animate();
    }

    function handleScroll() {
        // Boost velocity on scroll (Hyperspace jump!)
        targetVelocity = 12.0; 
        
        // Reset to base velocity after a short delay
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            targetVelocity = baseVelocity;
        }, 200);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        
        // Smoothly interpolate velocity
        currentVelocity += (targetVelocity - currentVelocity) * 0.05;

        const positions = starGeo.attributes.position.array;
        const vels = starGeo.userData.velocities;

        for (let i = 0; i < starCount; i++) {
            // Move star towards camera (increase Z)
            positions[i * 3 + 2] += currentVelocity + vels[i];

            // If star passes the camera, reset it to the back
            if (positions[i * 3 + 2] > 400) {
                positions[i * 3 + 2] = -400;
                positions[i * 3] = Math.random() * 800 - 400;
                positions[i * 3 + 1] = Math.random() * 800 - 400;
            }
        }

        starGeo.attributes.position.needsUpdate = true;
        
        // Gentle spiral rotation
        stars.rotation.z += 0.0005;

        renderer.render(scene, camera);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
