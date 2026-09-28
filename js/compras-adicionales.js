// === COMPRAS ADICIONALES - MODAL AND CHART HANDLING ===

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Initialize charts if opening Graficos Pro modal
        if (modalId === 'graficosProModal') {
            initializeCharts();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Chart Initialization for Graficos Pro
let chartsInitialized = false;

function initializeCharts() {
    if (chartsInitialized) return;
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    // Chart.js default configuration
    Chart.defaults.color = '#b8c4c0';
    Chart.defaults.borderColor = '#2a3530';
    
    // Bar Chart
    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                datasets: [{
                    label: 'Ventas',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: 'rgba(0, 255, 136, 0.6)',
                    borderColor: 'rgba(0, 255, 136, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Line Chart
    const lineCtx = document.getElementById('lineChart');
    if (lineCtx) {
        new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                datasets: [{
                    label: 'Crecimiento',
                    data: [65, 59, 80, 81, 56, 55],
                    fill: false,
                    borderColor: 'rgba(72, 202, 228, 1)',
                    backgroundColor: 'rgba(72, 202, 228, 0.6)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    }
    
    // Pie Chart
    const pieCtx = document.getElementById('pieChart');
    if (pieCtx) {
        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Producto A', 'Producto B', 'Producto C'],
                datasets: [{
                    data: [300, 50, 100],
                    backgroundColor: [
                        'rgba(0, 255, 136, 0.6)',
                        'rgba(157, 78, 221, 0.6)',
                        'rgba(72, 202, 228, 0.6)'
                    ],
                    borderColor: [
                        'rgba(0, 255, 136, 1)',
                        'rgba(157, 78, 221, 1)',
                        'rgba(72, 202, 228, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    }
    
    // Area Chart
    const areaCtx = document.getElementById('areaChart');
    if (areaCtx) {
        new Chart(areaCtx, {
            type: 'line',
            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                datasets: [{
                    label: 'Rendimiento',
                    data: [28, 48, 40, 19, 86, 27],
                    fill: true,
                    backgroundColor: 'rgba(157, 78, 221, 0.2)',
                    borderColor: 'rgba(157, 78, 221, 1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    chartsInitialized = true;
}

// Add fade-in animation to compras adicionales section
document.addEventListener('DOMContentLoaded', function() {
    const comprasSection = document.querySelector('.compras-adicionales');
    if (comprasSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.fade-in').forEach(el => {
                        el.classList.add('visible');
                    });
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(comprasSection);
    }
});
