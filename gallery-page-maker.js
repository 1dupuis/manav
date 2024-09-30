// gallery-page-maker.js

const createGalleryPage = (() => {
    const createElement = (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        children.forEach(child => element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child));
        return element;
    };

    const createHead = (title) => {
        document.title = title;
        const head = document.head;
        const links = [
            { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' },
            { rel: 'stylesheet', href: 'styles.css' },
            { rel: 'stylesheet', href: 'about-styles.css' },
            { rel: 'preconnect', href: 'https://via.placeholder.com' }
        ];
        links.forEach(link => head.appendChild(createElement('link', link)));
    };

    const createBody = (title) => {
        const body = document.body;
        body.innerHTML = ''; // Clear existing content
        body.appendChild(createElement('header', {}, [
            createElement('nav', {}, [
                createElement('div', { class: 'logo' }, ['Sport Focus']),
                createElement('ul', {}, [
                    createElement('li', {}, [
                        createElement('a', { href: '/' }, [
                            createElement('i', { class: 'fas fa-home' }),
                            ' Home'
                        ])
                    ])
                ]),
                createElement('div', { class: 'menu-toggle' }, [
                    createElement('i', { class: 'fas fa-bars' })
                ])
            ])
        ]));
        body.appendChild(createElement('main', { class: 'about-page' }, [
            createElement('section', { class: 'intro' }, [
                createElement('h1', {}, [title])
            ]),
            createElement('div', { id: 'photo-grid', class: 'photo-grid' })
        ]));
        body.appendChild(createElement('footer', {}, [
            createElement('p', {}, [`© ${new Date().getFullYear()} Sport Focus by Manav. All rights reserved.`])
        ]));
    };

    const loadImages = (() => {
        const imageCache = new Map();
        const imagesToLoad = new Set();
        let observer;

        const preloadImage = (src) => {
            if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    imageCache.set(src, img);
                    resolve(img);
                };
                img.onerror = () => {
                    const fallbackSrc = `https://via.placeholder.com/400x300?text=Image+Not+Found`;
                    imageCache.set(src, fallbackSrc);
                    reject(new Error('Image load failed'));
                };
                img.src = src;
            });
        };

        const loadVisibleImages = () => {
            imagesToLoad.forEach(placeholder => {
                if (placeholder.isConnected) {
                    observer.observe(placeholder);
                } else {
                    imagesToLoad.delete(placeholder);
                }
            });
        };

        return (pageName, images) => {
            const photoGrid = document.getElementById('photo-grid');
            if (images.length === 0) {
                photoGrid.textContent = 'No images found for this gallery.';
                return;
            }

            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const placeholder = entry.target;
                        const src = placeholder.dataset.src;
                        preloadImage(src)
                            .then(img => {
                                placeholder.parentNode.replaceChild(img.cloneNode(), placeholder);
                            })
                            .catch(() => {
                                const fallbackImg = createElement('img', {
                                    src: 'https://via.placeholder.com/400x300?text=Image+Not+Found',
                                    alt: 'Image not found'
                                });
                                placeholder.parentNode.replaceChild(fallbackImg, placeholder);
                            })
                            .finally(() => {
                                observer.unobserve(placeholder);
                                imagesToLoad.delete(placeholder);
                            });
                    }
                });
            }, { rootMargin: '200px' });

            const fragment = document.createDocumentFragment();
            images.forEach((image, index) => {
                const photoItem = createElement('div', { class: `photo-item${index === 0 ? ' large' : ''}` }, [
                    createElement('div', {
                        class: 'image-placeholder',
                        'data-src': `/images/${pageName}/${image.src}`,
                        'data-alt': image.caption
                    }),
                    createElement('div', { class: 'photo-caption' }, [image.caption])
                ]);
                fragment.appendChild(photoItem);
                imagesToLoad.add(photoItem.firstChild);
            });
            photoGrid.appendChild(fragment);

            requestIdleCallback(loadVisibleImages);
        };
    })();

    return (title) => {
        document.documentElement.lang = 'en';
        createHead(title);
        createBody(title);

        const pageName = window.location.pathname.split('/').pop().replace('.html', '').toLowerCase();
        const images = window.galleryConfig?.[pageName] || [];
        loadImages(pageName, images);

        ['script.js', 'about.js'].forEach(src => {
            const script = createElement('script', { src, async: true });
            document.body.appendChild(script);
        });
    };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createGalleryPage(document.title || 'Gallery'));
} else {
    createGalleryPage(document.title || 'Gallery');
}
