// gallery-page-maker.js

function createGalleryPage(title) {
    // Create the basic HTML structure
    document.documentElement.lang = 'en';
    document.head.innerHTML = `
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <link rel="stylesheet" href="styles.css">
        <link rel="stylesheet" href="about-styles.css">
    `;

    // Create the body content
    document.body.innerHTML = `
        <header>
            <nav>
                <div class="logo">Sport Focus</div>
                <ul>
                    <li><a href="/"><i class="fas fa-home"></i> Home</a></li>
                </ul>
                <div class="menu-toggle"><i class="fas fa-bars"></i></div>
            </nav>
        </header>
        <main class="about-page">
            <section class="intro">
                <h1>${title}</h1>
            </section>
            <div id="photo-grid" class="photo-grid">
                <!-- Photos will be dynamically inserted here -->
            </div>
        </main>
        <footer>
            <p>&copy; ${new Date().getFullYear()} Sport Focus by Manav. All rights reserved.</p>
        </footer>
    `;

    // Add necessary scripts
    const scripts = ['script.js', 'about.js'];
    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        document.body.appendChild(script);
    });

    // Function to load images
    function loadImages() {
        const pageName = window.location.pathname.split('/').pop().replace('.html', '').toLowerCase();
        const images = galleryConfig[pageName] || [];

        const photoGrid = document.getElementById('photo-grid');

        if (images.length === 0) {
            photoGrid.innerHTML = '<p>No images found for this gallery.</p>';
            return;
        }

        images.forEach((image, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item' + (index === 0 ? ' large' : '');

            const img = document.createElement('img');
            img.src = `/images/${pageName}/${image.src}`;
            img.alt = image.caption;
            img.loading = 'lazy';

            // Add error handling for individual images
            img.onerror = function() {
                this.onerror = null; // Prevent infinite loop
                this.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                this.alt = 'Image not found';
            };

            const caption = document.createElement('div');
            caption.className = 'photo-caption';
            caption.textContent = image.caption;

            photoItem.appendChild(img);
            photoItem.appendChild(caption);
            photoGrid.appendChild(photoItem);
        });

        // Add lazy loading
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.src; // Trigger load
                        imageObserver.unobserve(image);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // Call loadImages when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadImages);
    } else {
        loadImages();
    }
}

// Auto-execute the function if the script is loaded after the DOM is ready
if (document.readyState !== 'loading') {
    const title = document.title || 'Gallery';
    createGalleryPage(title);
}
