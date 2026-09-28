// ============================================
// CRYSANTEM - ANIMATIONS MODULE
// ============================================

// === INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ===
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Optional: Unobserve after animation
            // animationObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// === INITIALIZE ANIMATIONS ===
document.addEventListener('DOMContentLoaded', () => {
    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up, .scale-in');
    fadeElements.forEach(el => {
        animationObserver.observe(el);
    });
    
    // Stagger animations for grids
    const grids = document.querySelectorAll('.plans-grid, .channels-grid, .about-values');
    grids.forEach(grid => {
        const cards = grid.querySelectorAll('.fade-in');
        cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
        });
    });
    
    // Stagger FAQ items
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.05}s`;
    });
    
    console.log('Crysantem - Animations module loaded');
});

// === HERO SEQUENCE ANIMATION ===
const heroSequence = () => {
    const heroElements = document.querySelectorAll('.hero .fade-in');
    
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, index * 300);
    });
};

// Run hero sequence on load
window.addEventListener('load', heroSequence);

// === CAPABILITIES FLOW ANIMATION ===
const capabilitySteps = document.querySelectorAll('.capability-step');
if (capabilitySteps.length > 0) {
    const capabilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const steps = entry.target.querySelectorAll('.capability-step');
                steps.forEach((step, index) => {
                    setTimeout(() => {
                        step.classList.add('visible');
                    }, index * 400);
                });
            }
        });
    }, { threshold: 0.3 });
    
    const capabilitiesSection = document.querySelector('.capabilities');
    if (capabilitiesSection) {
        capabilityObserver.observe(capabilitiesSection);
    }
}

// === ACTION FLOW ANIMATION ===
const flowExample = document.querySelector('.flow-example');
if (flowExample) {
    const flowObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const steps = entry.target.querySelectorAll('.flow-step');
                steps.forEach((step, index) => {
                    setTimeout(() => {
                        step.style.opacity = '1';
                        step.style.transform = 'translateY(0)';
                    }, index * 300);
                });
            }
        });
    }, { threshold: 0.3 });
    
    flowObserver.observe(flowExample);
}

// === PARALLAX EFFECT FOR HERO ===
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const hero = document.querySelector('.hero');
            if (hero) {
                const scrolled = window.pageYOffset;
                const heroVisual = document.querySelector('.hero-visual');
                if (heroVisual && scrolled < window.innerHeight) {
                    heroVisual.style.transform = `translateY(${scrolled * 0.1}px)`;
                }
            }
            ticking = false;
        });
        ticking = true;
    }
});

console.log('Crysantem - Animations initialized');
