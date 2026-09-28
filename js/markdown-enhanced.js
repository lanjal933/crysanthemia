// ============================================
// CRYSANTEM - ENHANCED MARKDOWN MODULE
// ============================================

// === CONFIGURATION ===
const MARKDOWN_IMAGES_PATH = '/IMG/imagenes_markdown/';

// === ENHANCED MARKDOWN RENDERER ===
class EnhancedMarkdown {
    constructor() {
        // No custom renderer - use standard marked
    }

    // === CUSTOM COMPONENTS ===

    // Plan Card Component
    renderPlanCard(plan) {
        const { name, price, features, highlight = false } = plan;
        const highlightClass = highlight ? 'plan-card-highlight' : '';
        
        return `
            <div class="markdown-plan-card ${highlightClass}">
                <h3 class="plan-name">${name}</h3>
                <div class="plan-price">${price}</div>
                <ul class="plan-features">
                    ${features.map(feature => `<li class="plan-feature">${feature}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    renderPlanCards(plans) {
        return `
            <div class="markdown-plan-cards">
                ${plans.map(plan => this.renderPlanCard(plan)).join('')}
            </div>
        `;
    }

    // Chart Component (using Chart.js)
    renderChart(chartData) {
        const { type, data, options, id } = chartData;
        const chartId = id || `chart-${Date.now()}`;
        
        // Store chart data in a global object for later execution
        if (!window.markdownCharts) {
            window.markdownCharts = {};
        }
        window.markdownCharts[chartId] = {
            type,
            data,
            options: options || {}
        };
        
        return `
            <div class="markdown-chart-container">
                <canvas id="${chartId}" data-chart-id="${chartId}"></canvas>
            </div>
        `;
    }

    // Execute all pending charts after HTML is inserted into DOM
    executeCharts() {
        if (!window.markdownCharts || typeof Chart === 'undefined') return;
        
        for (const [chartId, chartData] of Object.entries(window.markdownCharts)) {
            const canvas = document.getElementById(chartId);
            if (canvas && !canvas.chart) {
                try {
                    const ctx = canvas.getContext('2d');
                    
                    // Improve canvas resolution for better quality on mobile
                    const dpr = window.devicePixelRatio || 1;
                    const rect = canvas.getBoundingClientRect();
                    
                    // Set actual size in memory (scaled to account for extra pixel density)
                    canvas.width = rect.width * dpr;
                    canvas.height = rect.height * dpr;
                    
                    // Normalize coordinate system to use css pixels
                    ctx.scale(dpr, dpr);
                    
                    // Merge custom options with responsive defaults
                    const defaultOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2), // Force at least 2x for better quality
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    color: '#b8c4c0',
                                    font: {
                                        size: 14,
                                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                    },
                                    padding: 15
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(10, 14, 12, 0.9)',
                                titleColor: '#00ff88',
                                bodyColor: '#ffffff',
                                borderColor: '#00ff88',
                                borderWidth: 1,
                                padding: 12,
                                titleFont: {
                                    size: 14,
                                    weight: 'bold'
                                },
                                bodyFont: {
                                    size: 13
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: '#b8c4c0',
                                    font: {
                                        size: 12,
                                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                    },
                                    maxRotation: 45,
                                    minRotation: 0
                                },
                                grid: {
                                    color: '#2a3530',
                                    drawBorder: false
                                }
                            },
                            y: {
                                ticks: {
                                    color: '#b8c4c0',
                                    font: {
                                        size: 12,
                                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                    }
                                },
                                grid: {
                                    color: '#2a3530',
                                    drawBorder: false
                                }
                            }
                        },
                        elements: {
                            line: {
                                borderWidth: 3,
                                tension: 0.4,
                                pointRadius: 4,
                                pointHoverRadius: 6
                            },
                            bar: {
                                borderWidth: 2,
                                borderRadius: 4
                            },
                            point: {
                                radius: 4,
                                hoverRadius: 6
                            }
                        }
                    };
                    
                    // Remove scales for radar and pie charts
                    if (chartData.type === 'radar' || chartData.type === 'pie' || chartData.type === 'doughnut') {
                        delete defaultOptions.scales;
                        
                        if (chartData.type === 'radar') {
                            defaultOptions.scales = {
                                r: {
                                    ticks: {
                                        color: '#b8c4c0',
                                        font: {
                                            size: 11,
                                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                        },
                                        backdropColor: 'transparent'
                                    },
                                    grid: {
                                        color: '#2a3530'
                                    },
                                    angleLines: {
                                        color: '#2a3530'
                                    },
                                    pointLabels: {
                                        color: '#b8c4c0',
                                        font: {
                                            size: 12,
                                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                        }
                                    }
                                }
                            };
                        }
                    }
                    
                    // Merge user options with defaults
                    const mergedOptions = {
                        ...defaultOptions,
                        ...chartData.options,
                        plugins: {
                            ...defaultOptions.plugins,
                            ...chartData.options?.plugins
                        },
                        scales: {
                            ...defaultOptions.scales,
                            ...chartData.options?.scales
                        },
                        elements: {
                            ...defaultOptions.elements,
                            ...chartData.options?.elements
                        }
                    };
                    
                    canvas.chart = new Chart(ctx, {
                        type: chartData.type,
                        data: chartData.data,
                        options: mergedOptions
                    });
                    console.log('Chart rendered:', chartId);
                } catch (e) {
                    console.error('Error rendering chart:', chartId, e);
                }
            }
        }
    }

    // Info Box Component
    renderInfoBox(content, type = 'info') {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            tip: '💡'
        };
        
        const parsedContent = marked.parse(content);
        
        return `
            <div class="markdown-info-box markdown-info-box-${type}">
                <span class="info-box-icon">${icons[type] || icons.info}</span>
                <div class="info-box-content">${parsedContent}</div>
            </div>
        `;
    }

    // WhatsApp Button Component
    renderWhatsAppButton(phone, message = '') {
        const formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${formattedPhone}${message ? '?text=' + encodedMessage : ''}`;
        
        return `
            <div class="markdown-whatsapp-button">
                <a href="${whatsappUrl}" target="_blank" class="btn-whatsapp-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>Hablar con un humano</span>
                </a>
            </div>
        `;
    }

    // Custom Syntax for Plans: [PLAN]...[/PLAN]
    parseCustomComponents(markdown) {
        let processed = markdown;

        // Parse plan cards: [PLAN name="Basic" price="$99" highlight=true]
        // Features:
        // - Feature 1
        // - Feature 2
        // [/PLAN]
        processed = processed.replace(/\[PLAN\s+([^\]]+)\]([\s\S]*?)\[\/PLAN\]/g, (match, attrs, content) => {
            const nameMatch = attrs.match(/name="([^"]+)"/);
            const priceMatch = attrs.match(/price="([^"]+)"/);
            const highlightMatch = attrs.match(/highlight=(true|false)/);
            
            const name = nameMatch ? nameMatch[1] : 'Plan';
            const price = priceMatch ? priceMatch[1] : '$0';
            const highlight = highlightMatch ? highlightMatch[1] === 'true' : false;
            
            const features = content
                .split('\n')
                .map(line => line.replace(/^[-*]\s*/, '').trim())
                .filter(line => line.length > 0);
            
            return this.renderPlanCard({ name, price, features, highlight });
        });

        // Parse info boxes: [INFO type="warning"]Content[/INFO]
        processed = processed.replace(/\[INFO\s+type="([^"]+)"\]([\s\S]*?)\[\/INFO\]/g, (match, type, content) => {
            return this.renderInfoBox(content, type);
        });

        // Parse WhatsApp buttons: [WHATSAPP phone="+1234567890" message="Hello"]
        processed = processed.replace(/\[WHATSAPP\s+phone="([^"]+)"(?:\s+message="([^"]+)")?\s*\/\]/g, (match, phone, message) => {
            return this.renderWhatsAppButton(phone, message || '');
        });

        // Parse charts: [CHART type="bar" id="myChart"]
        // {
        //   "labels": ["Jan", "Feb"],
        //   "datasets": [...]
        // }
        // [/CHART]
        processed = processed.replace(/\[CHART\s+([^\]]+)\]([\s\S]*?)\[\/CHART\]/g, (match, attrs, content) => {
            try {
                const typeMatch = attrs.match(/type="([^"]+)"/);
                const idMatch = attrs.match(/id="([^"]+)"/);
                
                const type = typeMatch ? typeMatch[1] : 'bar';
                const id = idMatch ? idMatch[1] : null;
                const data = JSON.parse(content.trim());
                
                return this.renderChart({ type, data, id });
            } catch (e) {
                console.error('Error parsing chart:', e);
                return '<div class="markdown-error">Error al renderizar gráfico</div>';
            }
        });

        return processed;
    }

    // Process markdown images after parsing
    processMarkdownImages(html) {
        return html.replace(/<img[^>]*src="markdown:([^"]+)"[^>]*>/g, (match, imageName) => {
            const imagePath = `${MARKDOWN_IMAGES_PATH}${imageName}`;
            return match.replace(`src="markdown:${imageName}"`, `src="${imagePath}"`);
        });
    }

    // Main parse function with custom components
    parseWithComponents(markdown) {
        try {
            console.log('=== PARSE WITH COMPONENTS ===');
            console.log('Input markdown:', markdown);
            
            // Check if content already has rendered HTML components (from backend)
            const hasRenderedComponents = markdown.includes('markdown-plan-card') || 
                                          markdown.includes('markdown-chart-container') ||
                                          markdown.includes('markdown-info-box');
            
            if (hasRenderedComponents) {
                console.log('Content already has rendered components, skipping custom component parsing');
                // Just process markdown images and return
                const withImages = this.processMarkdownImages(markdown);
                console.log('After image processing:', withImages);
                return withImages;
            }
            
            // Use placeholder approach: replace custom components with placeholders
            const placeholders = {};
            let withPlaceholders = markdown;
            let placeholderIndex = 0;
            
            // Replace [PLAN]...[/PLAN] with placeholders (use HTML comments to avoid markdown interpretation)
            withPlaceholders = withPlaceholders.replace(/\[PLAN\s+([^\]]+)\]([\s\S]*?)\[\/PLAN\]/g, (match, attrs, content) => {
                const placeholder = `<!--PLAN${placeholderIndex}-->`;
                placeholders[placeholder] = { type: 'plan', attrs, content };
                placeholderIndex++;
                return placeholder;
            });
            
            // Replace [INFO]...[/INFO] with placeholders
            withPlaceholders = withPlaceholders.replace(/\[INFO\s+type="([^"]+)"\]([\s\S]*?)\[\/INFO\]/g, (match, type, content) => {
                const placeholder = `<!--INFO${placeholderIndex}-->`;
                placeholders[placeholder] = { type: 'info', typeVal: type, content };
                placeholderIndex++;
                return placeholder;
            });
            
            // Replace [CHART]...[/CHART] with placeholders
            withPlaceholders = withPlaceholders.replace(/\[CHART\s+([^\]]+)\]([\s\S]*?)\[\/CHART\]/g, (match, attrs, content) => {
                const placeholder = `<!--CHART${placeholderIndex}-->`;
                placeholders[placeholder] = { type: 'chart', attrs, content };
                placeholderIndex++;
                return placeholder;
            });

            // Replace [WHATSAPP] with placeholders
            withPlaceholders = withPlaceholders.replace(/\[WHATSAPP\s+phone="([^"]+)"(?:\s+message="([^"]+)")?\s*\/\]/g, (match, phone, message) => {
                const placeholder = `<!--WHATSAPP${placeholderIndex}-->`;
                placeholders[placeholder] = { type: 'whatsapp', phone, message: message || '' };
                placeholderIndex++;
                return placeholder;
            });
            
            console.log('After placeholders:', withPlaceholders);
            
            // Parse standard markdown with marked
            const parsed = marked.parse(withPlaceholders);
            console.log('After marked.parse:', parsed);
            
            // Replace placeholders with rendered components
            let withComponents = parsed;
            
            console.log('Placeholders to replace:', Object.keys(placeholders));
            
            for (const [placeholder, data] of Object.entries(placeholders)) {
                let rendered = '';
                if (data.type === 'plan') {
                    const nameMatch = data.attrs.match(/name="([^"]+)"/);
                    const priceMatch = data.attrs.match(/price="([^"]+)"/);
                    const highlightMatch = data.attrs.match(/highlight=(true|false)/);
                    
                    const name = nameMatch ? nameMatch[1] : 'Plan';
                    const price = priceMatch ? priceMatch[1] : '$0';
                    const highlight = highlightMatch ? highlightMatch[1] === 'true' : false;
                    
                    const features = data.content
                        .split('\n')
                        .map(line => line.replace(/^[-*]\s*/, '').trim())
                        .filter(line => line.length > 0);
                    
                    rendered = this.renderPlanCard({ name, price, features, highlight });
                } else if (data.type === 'info') {
                    rendered = this.renderInfoBox(data.content, data.typeVal);
                } else if (data.type === 'chart') {
                    const typeMatch = data.attrs.match(/type="([^"]+)"/);
                    const idMatch = data.attrs.match(/id="([^"]+)"/);
                    
                    const type = typeMatch ? typeMatch[1] : 'bar';
                    const id = idMatch ? idMatch[1] : null;
                    const chartData = JSON.parse(data.content.trim());
                    
                    rendered = this.renderChart({ type, data: chartData, id });
                } else if (data.type === 'whatsapp') {
                    rendered = this.renderWhatsAppButton(data.phone, data.message);
                }
                
                console.log('Replacing placeholder:', placeholder, 'with rendered component');
                console.log('Placeholder found in parsed:', parsed.includes(placeholder));
                
                // Use global replace to handle multiple occurrences
                withComponents = withComponents.split(placeholder).join(rendered);
            }
            
            console.log('After replacing placeholders:', withComponents);
            
            // Finally, process markdown images
            const withImages = this.processMarkdownImages(withComponents);
            console.log('After image processing:', withImages);
            
            return withImages;
        } catch (e) {
            console.error('Error parsing markdown:', e);
            console.error('Error stack:', e.stack);
            return markdown; // Return original if parsing fails
        }
    }
}

// === GLOBAL INSTANCE ===
const enhancedMarkdown = new EnhancedMarkdown();

// === EXPORT ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = enhancedMarkdown;
}
