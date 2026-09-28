// ============================================
// CRYSANTEM - MAIN JAVASCRIPT
// ============================================

// === CONFIGURATION ===
const WHATSAPP_NUMBER = "13237093568"; // +1 (323) 709-3568

// === DOM ELEMENTS ===
const navbar = document.getElementById('navbar');
const navbarToggle = document.getElementById('navbarToggle');
const navbarMenu = document.getElementById('navbarMenu');
const navbarMenuOverlay = document.getElementById('navbarMenuOverlay');
const whatsappButton = document.getElementById('whatsappButton');
const faqQuestions = document.querySelectorAll('.faq-question');

// === NAVBAR SCROLL EFFECT ===
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// === MOBILE MENU TOGGLE ===
if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
        
        // Toggle overlay
        if (navbarMenuOverlay) {
            navbarMenuOverlay.classList.toggle('active');
        }
        
        // Animate hamburger icon
        const spans = navbarToggle.querySelectorAll('span');
        if (navbarMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu when clicking on a link
    const menuLinks = navbarMenu.querySelectorAll('.navbar-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            navbarMenu.classList.remove('active');
            if (navbarMenuOverlay) {
                navbarMenuOverlay.classList.remove('active');
            }
            const spans = navbarToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Close menu when clicking on overlay
    if (navbarMenuOverlay) {
        navbarMenuOverlay.addEventListener('click', () => {
            navbarMenu.classList.remove('active');
            navbarMenuOverlay.classList.remove('active');
            const spans = navbarToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    }
}

// === WHATSAPP BUTTON ===
if (whatsappButton && WHATSAPP_NUMBER) {
    whatsappButton.href = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20me%20gustaría%20consultar%20sobre%20Crysantem`;
} else if (whatsappButton) {
    whatsappButton.addEventListener('click', (e) => {
        e.preventDefault();
        alert('WhatsApp número será configurado próximamente.');
    });
}


// === SMOOTH SCROLL FOR ANCHOR LINKS ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// === FAQ ACCORDION ===
if (faqQuestions.length > 0) {
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// === HERO TYPING ANIMATION ===
const heroTyping = () => {
    const typingIndicator = document.querySelector('.hero-visual .typing-indicator');
    if (typingIndicator) {
        setInterval(() => {
            typingIndicator.style.opacity = typingIndicator.style.opacity === '0' ? '1' : '0';
        }, 500);
    }
};

// Initialize hero typing animation
heroTyping();

console.log('Crysantem - Main.js loaded');
