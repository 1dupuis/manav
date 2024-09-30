// gallery-page-maker.js

(function() {
    'use strict';

    // Configuration
    const config = {
        batchSize: 5,
        placeholderColor: '#f0f0f0',
        breakpoints: {
            small: 640,
            medium: 1024,
            large: 1440
        }
    };

    // Utility functions
    const utils = {
        debounce: (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(null, args), delay);
            };
        },
        getImageSize: () => {
            const width = window.innerWidth;
            if (width <= config.breakpoints.small) return 'small';
            if (width <= config.breakpoints.medium) return 'medium';
            return 'large';
        }
    };

    // Image loading and management
    const imageManager = {
        images: [],
        currentIndex: 0,
        
        setImages: function(newImages) {
            this.images = newImages;
            this.currentIndex = 0;
        },
        
        getNextBatch: function() {
            const start = this.currentIndex;
            const end = Math.min(start + config.batchSize, this.images.length);
            this.currentIndex = end;
            return this.images.slice(start, end);
        },
        
        hasMore: function() {
            return this.currentIndex < this.images.length;
        },
        
        reset: function() {
            this.currentIndex = 0;
        }
    };

    // DOM manipulation
    const domManager = {
        photoGrid: null,
        modal: null,
        
        init: function() {
            this.photoGrid = document.getElementById('photo-grid');
            this.createModal();
        },
        
        createModal: function() {
            this.modal = document.createElement('div');
            this.modal.className = 'image-modal';
            this.modal.innerHTML = `
                <span class="close">&times;</span>
                <img class="modal-content" alt="Modal Image">
                <div class="modal-caption"></div>
                <button class="prev">&#10094;</button>
                <button class="next">&#10095;</button>
            `;
            document.body.appendChild(this.modal);
        },
        
        createPlaceholder: function(image, index) {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item' + (index === 0 ? ' large' : '');
            photoItem.innerHTML = `
                <div class="placeholder" style="background-color: ${config.placeholderColor};" data-src="${image.src}">
                    <div class="spinner"></div>
                </div>
                <div class="photo-caption">${image.caption}</div>
            `;
            return photoItem;
        },
        
        appendImages: function(images) {
            const fragment = document.createDocumentFragment();
            images.forEach((image, index) => {
                fragment.appendChild(this.createPlaceholder(image, imageManager.currentIndex + index));
            });
            this.photoGrid.appendChild(fragment);
        },
        
        updateModalImage: function(src, caption) {
            const modalImg = this.modal.querySelector('.modal-content');
            const captionText = this.modal.querySelector('.modal-caption');
            modalImg.src = src;
            captionText.textContent = caption;
        }
    };

    // Event handlers
    const eventHandlers = {
        onScroll: utils.debounce(() => {
            if (imageManager.hasMore() && isBottomVisible()) {
                loadNextBatch();
            }
        }, 200),
        
        onImageClick: (e) => {
            const img = e.target.closest('.photo-item img');
            if (img) {
                openModal(img);
            }
        },
        
        onCloseModal: () => {
            domManager.modal.style.display = 'none';
        },
        
        onPrevImage: () => {
            navigateImage(-1);
        },
        
        onNextImage: () => {
            navigateImage(1);
        },
        
        onKeyDown: (e) => {
            if (domManager.modal.style.display === 'block') {
                if (e.key === 'ArrowLeft') navigateImage(-1);
                else if (e.key === 'ArrowRight') navigateImage(1);
                else if (e.key === 'Escape') eventHandlers.onCloseModal();
            }
        },
        
        onResize: utils.debounce(() => {
            updateImageSources();
        }, 200)
    };

    // Core functions
    function createGalleryPage(title) {
        setPageStructure(title);
        domManager.init();
        setupEventListeners();
        loadImages();
    }

    function setPageStructure(title) {
        document.documentElement.lang = 'en';
        document.head.innerHTML = `
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <link rel="stylesheet" href="styles.css">
            <link rel="stylesheet" href="about-styles.css">
        `;

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
                <div id="photo-grid" class="photo-grid"></div>
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
    }

    function setupEventListeners() {
        window.addEventListener('scroll', eventHandlers.onScroll);
        window.addEventListener('resize', eventHandlers.onResize);
        domManager.photoGrid.addEventListener('click', eventHandlers.onImageClick);
        domManager.modal.querySelector('.close').addEventListener('click', eventHandlers.onCloseModal);
        domManager.modal.querySelector('.prev').addEventListener('click', eventHandlers.onPrevImage);
        domManager.modal.querySelector('.next').addEventListener('click', eventHandlers.onNextImage);
        document.addEventListener('keydown', eventHandlers.onKeyDown);
    }

    function loadImages() {
        const pageName = window.location.pathname.split('/').pop().replace('.html', '').toLowerCase();
        const images = window.galleryConfig && window.galleryConfig[pageName] ? window.galleryConfig[pageName] : [];

        if (images.length === 0) {
            domManager.photoGrid.innerHTML = '<p>No images found for this gallery.</p>';
            return;
        }

        imageManager.setImages(images);
        loadNextBatch();
    }

    function loadNextBatch() {
        const images = imageManager.getNextBatch();
        domManager.appendImages(images);
        images.forEach((_, index) => {
            const placeholder = domManager.photoGrid.children[imageManager.currentIndex - config.batchSize + index].querySelector('.placeholder');
            loadImage(placeholder);
        });
    }

    function loadImage(placeholder) {
        const img = new Image();
        const size = utils.getImageSize();
        img.src = placeholder.dataset.src.replace('.jpg', `_${size}.jpg`);
        img.alt = placeholder.nextElementSibling.textContent;

        img.onload = function() {
            placeholder.innerHTML = '';
            placeholder.appendChild(img);
            placeholder.classList.add('loaded');
        };

        img.onerror = function() {
            placeholder.innerHTML = 'Image not found';
            placeholder.classList.add('error');
        };
    }

    function isBottomVisible() {
        const rect = domManager.photoGrid.getBoundingClientRect();
        return rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    }

    function openModal(img) {
        domManager.modal.style.display = 'block';
        domManager.updateModalImage(img.src, img.alt);
    }

    function navigateImage(direction) {
        const currentImg = domManager.modal.querySelector('.modal-content');
        const currentItem = Array.from(domManager.photoGrid.children).find(item => item.querySelector('img').src === currentImg.src);
        let nextItem = currentItem[direction > 0 ? 'nextElementSibling' : 'previousElementSibling'];
        
        if (!nextItem && direction > 0 && imageManager.hasMore()) {
            loadNextBatch();
            nextItem = currentItem.nextElementSibling;
        }

        if (nextItem) {
            const nextImg = nextItem.querySelector('img');
            if (nextImg) {
                domManager.updateModalImage(nextImg.src, nextImg.alt);
            }
        }
    }

    function updateImageSources() {
        const size = utils.getImageSize();
        const images = domManager.photoGrid.querySelectorAll('img');
        images.forEach(img => {
            img.src = img.src.replace(/_(?:small|medium|large)\.jpg/, `_${size}.jpg`);
        });
    }

    // Initialize
    if (document.readyState !== 'loading') {
        createGalleryPage(document.title || 'Gallery');
    } else {
        document.addEventListener('DOMContentLoaded', () => createGalleryPage(document.title || 'Gallery'));
    }
})();
