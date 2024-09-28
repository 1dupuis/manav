document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
        easing: 'ease-in-out'
    });

    // Smooth scrolling for navigation links
    const smoothScroll = (target) => {
        const element = document.querySelector(target);
        if (!element) return;
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            smoothScroll(this.getAttribute('href'));
        });
    });

    // Parallax effect for fullscreen background
    const parallaxSections = document.querySelectorAll('.parallax-section');
    const parallaxEffect = () => {
        const scrollPosition = window.pageYOffset;
        parallaxSections.forEach(section => {
            const speed = parseFloat(section.dataset.speed) || 0.5;
            section.style.backgroundPositionY = `${scrollPosition * speed}px`;
        });
    };

    // Throttle function to limit the rate at which parallaxEffect is called
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    window.addEventListener('scroll', throttle(parallaxEffect, 16));

    // Navbar color change on scroll
    const header = document.querySelector('header');
    const heroSection = document.querySelector('#home');

    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            header.classList.toggle('scrolled', !entry.isIntersecting);
        });
    }, { threshold: 0.1 });

    if (heroSection) {
        headerObserver.observe(heroSection);
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('nav ul');

    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('show');
        menuToggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav') && navList.classList.contains('show')) {
            navList.classList.remove('show');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Gallery filtering
    const galleryContainer = document.querySelector('.gallery-container');
    const tabButtons = document.querySelectorAll('.tab-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterGallery(category);
        });
    });

    function filterGallery(category) {
        const items = galleryContainer.querySelectorAll('.gallery-item');
        items.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Lazy loading images
    const lazyImages = document.querySelectorAll('img[data-src]');
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                lazyImageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => lazyImageObserver.observe(img));

    // Form validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm()) {
                // Simulate form submission
                console.log('Form submitted successfully');
                contactForm.reset();
            }
        });
    }

    function validateForm() {
        let isValid = true;
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                showError(input, 'This field is required');
            } else {
                clearError(input);
            }
        });
        return isValid;
    }

    function showError(input, message) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
        } else {
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = message;
            input.parentNode.insertBefore(error, input.nextSibling);
        }
        input.classList.add('error');
    }

    function clearError(input) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
        input.classList.remove('error');
    }
});
