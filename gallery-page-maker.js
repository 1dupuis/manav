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
                    <li><a href="/manav"><i class="fas fa-home"></i> Home</a></li>
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
    async function loadImages() {
        const pageName = window.location.pathname.split('/').pop().replace('.html', '').toLowerCase();
        const imageDir = `/manav/images/${pageName}/`;

        try {
            const response = await fetch(imageDir);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();

            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(text, 'text/html');
            const links = Array.from(htmlDoc.getElementsByTagName('a'));
            const imageLinks = links.filter(link => link.href.match(/\.(jpg|jpeg|png|gif)$/i));

            if (imageLinks.length === 0) {
                throw new Error('No images found in the directory');
            }

            const photoGrid = document.getElementById('photo-grid');
            imageLinks.forEach((link, index) => {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item' + (index === 0 ? ' large' : '');

                const img = document.createElement('img');
                img.src = imageDir + link.href.split('/').pop();
                img.alt = `Image ${index + 1}`;
                img.loading = 'lazy';

                const caption = document.createElement('div');
                caption.className = 'photo-caption';
                caption.textContent = `Image ${index + 1}`;

                photoItem.appendChild(img);
                photoItem.appendChild(caption);
                photoGrid.appendChild(photoItem);
            });
        } catch (error) {
            console.error('Error loading images:', error);
            fallbackImageLoad();
        }
    }

    // Fallback function to load images if directory listing fails
    function fallbackImageLoad() {
        const photoGrid = document.getElementById('photo-grid');
        photoGrid.innerHTML = '<p>Unable to load images. Please check your connection and try again.</p>';
        
        // You could also add some default images here if you have them
        // const defaultImages = ['default1.jpg', 'default2.jpg', 'default3.jpg'];
        // defaultImages.forEach((img, index) => {
        //     // Create image elements similar to the loadImages function
        // });
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
