document.addEventListener('DOMContentLoaded', () => {
    const skipButton = document.getElementById('skip-intro');
    const introContainer = document.getElementById('intro-container');
    const mainSite = document.getElementById('main-site');

    const mainNav = document.getElementById('main-nav');

    const showMainSite = () => {
        introContainer.style.display = 'none';
        mainSite.classList.remove('hidden');
        mainNav.classList.remove('hidden');
        initScrollAnimations();
        window.scrollTo(0, 0);
    };

    // Animaciones de Scroll (Reveal)
    const initScrollAnimations = () => {
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.vfx-reveal').forEach(el => observer.observe(el));
    };

    // Smooth Scroll para la navegación
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Saltar el intro al hacer clic en el botón
    skipButton.addEventListener('click', showMainSite);

    // Saltar con la tecla Espacio
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !introContainer.classList.contains('hidden')) {
            showMainSite();
        }
    });

    // Opcional: Saltar automáticamente después de que termine la animación (60s aprox)
    setTimeout(() => {
        if (!mainSite.classList.contains('hidden')) return;
        showMainSite();
    }, 65000);
});
