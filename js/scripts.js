document.addEventListener('DOMContentLoaded', () => {
    const skipButton = document.getElementById('skip-intro');
    const introContainer = document.getElementById('intro-container');
    const mainSite = document.getElementById('main-site');

    const showMainSite = () => {
        introContainer.style.display = 'none';
        mainSite.classList.remove('hidden');
        window.scrollTo(0, 0);
    };

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
