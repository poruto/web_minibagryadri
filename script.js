console.log('MINIBAGRYADRI Premium website loaded.');

// Header Scroll Effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth Scroll for Anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Animate once
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-up').forEach(el => {
    observer.observe(el);
});

// Excavator Interaction
const excavatorContainer = document.querySelector('.excavator-hero-container');
if (excavatorContainer) {
    excavatorContainer.addEventListener('click', () => {
        if (!excavatorContainer.classList.contains('digging')) {
            excavatorContainer.classList.add('digging');

            // Remove class after animation completes (2s defined in CSS)
            setTimeout(() => {
                excavatorContainer.classList.remove('digging');
            }, 2000);
        }
    });
}
