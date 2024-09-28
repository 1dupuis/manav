document.addEventListener('DOMContentLoaded', function() {
    // Count photos
    const photoItems = document.querySelectorAll('.photo-item');
    const photoCount = photoItems.length;

    // Update photo count in the DOM
    const photoCountElement = document.getElementById('photo-count');
    photoCountElement.textContent = `Showcasing ${photoCount} inspiring moments in sports`;

    // Add hover effect for photo captions
    photoItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const caption = this.querySelector('.photo-caption');
            if (caption) {
                caption.style.opacity = '1';
            }
        });

        item.addEventListener('mouseleave', function() {
            const caption = this.querySelector('.photo-caption');
            if (caption) {
                caption.style.opacity = '0';
            }
        });
    });

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.remove('lazy');
                    imageObserver.unobserve(image);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img.lazy');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});
