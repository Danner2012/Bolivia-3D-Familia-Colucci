/**
 * Bolivia Wars: Hyperdrive / Warp Speed Background
 * Stars travel towards the camera to create a space travel effect.
 */

(function() {
    let scene, camera, renderer, stars, starGeo;
    let starCount = 6000;
    let velocity = 2; // Speed of travel

    function init() {
        scene = new THREE.Scene();

        // Camera looks straight ahead
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 1;
        // No extra rotation needed for warp effect, we look down the Z axis

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
            positions[i * 3] = Math.random() * 600 - 300;     // X
            positions[i * 3 + 1] = Math.random() * 600 - 300; // Y
            positions[i * 3 + 2] = Math.random() * 600 - 300; // Z
            
            velocities[i] = Math.random() * 0.5 + 0.2; // Individual star speed variation
        }

        starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        // We'll store velocities in a custom property for access during animation
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
        
        const positions = starGeo.attributes.position.array;
        const vels = starGeo.userData.velocities;

        for (let i = 0; i < starCount; i++) {
            // Move star towards camera (increase Z)
            // In Three.js, looking forward usually means stars move from negative Z to positive Z or vice versa
            // Let's make them move from -300 to 300.
            positions[i * 3 + 2] += velocity + vels[i];

            // If star passes the camera (Z > 200), reset it to the back
            if (positions[i * 3 + 2] > 300) {
                positions[i * 3 + 2] = -300;
                // Optional: Randomize X and Y again for variety
                positions[i * 3] = Math.random() * 600 - 300;
                positions[i * 3 + 1] = Math.random() * 600 - 300;
            }
        }

        // Tell Three.js the positions have changed
        starGeo.attributes.position.needsUpdate = true;
        
        // Gentle rotation for extra dynamism
        stars.rotation.z += 0.001;

        renderer.render(scene, camera);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
