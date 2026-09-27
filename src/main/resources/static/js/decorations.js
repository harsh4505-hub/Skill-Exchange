/**
 * ===================================================================
 * SKILL EXCHANGE — REUSABLE BACKGROUND & EDUCATIONAL DECORATION SYSTEM
 * Reusable Components: SubtleGrid, EducationDecor, ExchangePattern, KnowledgeNodes
 * Ultra-low opacity (0.04 - 0.10), accessible, responsive, zero overhead
 * ===================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SkillExchangeDecor = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // SVG Motif Library (Thin-line, architectural, educational & exchange symbols)
    const MOTIFS = {
        // 1. Graduation Cap Outline
        gradCap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
        </svg>`,

        // 2. Open Textbook Outline
        book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>`,

        // 3. Idea / Lightbulb Outline
        lightbulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 18h6m-4 3h2m-5-8.5a6 6 0 1 1 8 0c-.8 1-1.5 2-1.5 3.5h-5c0-1.5-.7-2.5-1.5-3.5z"/>
        </svg>`,

        // 4. Code Brackets </ >
        codeBrackets: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
            <line x1="14" y1="4" x2="10" y2="20"/>
        </svg>`,

        // 5. Code Braces { }
        codeBraces: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 4a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2M17 4a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2"/>
        </svg>`,

        // 6. Connected Knowledge Nodes (Graph / Peer Network)
        knowledgeNodes: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="10" cy="14" r="3"/>
            <circle cx="38" cy="10" r="3.5"/>
            <circle cx="24" cy="34" r="4"/>
            <circle cx="12" cy="38" r="2.5"/>
            <circle cx="36" cy="34" r="2.5"/>
            <line x1="13" y1="14" x2="35" y2="10"/>
            <line x1="11" y1="17" x2="22" y2="31"/>
            <line x1="36" y1="13" x2="26" y2="31"/>
            <line x1="14.5" y1="37" x2="20" y2="35"/>
            <line x1="28" y1="34" x2="33.5" y2="34"/>
        </svg>`,

        // 7. Reciprocal Skill Exchange Arrows (Two-way trade loop)
        exchangeLoop: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M8 14h20a5 5 0 0 1 5 5v1m0 0l-3-3m3 3l3-3"/>
            <path d="M32 26H12a5 5 0 0 1-5-5v-1m0 0l3 3m-3-3l-3 3"/>
            <circle cx="8" cy="14" r="1.5" fill="currentColor"/>
            <circle cx="32" cy="26" r="1.5" fill="currentColor"/>
        </svg>`,

        // 8. Subtle Certificate / Diploma
        certificate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="14" rx="2"/>
            <circle cx="12" cy="10" r="2.5"/>
            <path d="M12 12.5v3.5l1.5-.8 1.5.8v-3.5"/>
            <line x1="6" y1="8" x2="8" y2="8"/>
            <line x1="6" y1="12" x2="8" y2="12"/>
        </svg>`,

        // 9. Pencil / Compass Drafting Tool
        pencil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>`,

        // 10. Sparkle / Insight Star (✦)
        sparkle: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/>
        </svg>`,

        // 11. Learning Science Orbit / Atom
        atomOrbit: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
            <circle cx="20" cy="20" r="3" fill="currentColor"/>
            <ellipse cx="20" cy="20" rx="16" ry="6" transform="rotate(35 20 20)"/>
            <ellipse cx="20" cy="20" rx="16" ry="6" transform="rotate(-35 20 20)"/>
        </svg>`,

        // 12. Notebook / Document Outline
        notebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            <line x1="9" y1="7" x2="15" y2="7"/>
            <line x1="9" y1="11" x2="15" y2="11"/>
        </svg>`,

        // 13. Mathematical Logic Symbols (Integral & Summation motif)
        mathSymbols: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 10h10M6 16h6M6 22h8"/>
            <path d="M22 6c-2 0-3 1-3 3v14c0 2 1 3 3 3"/>
            <circle cx="27" cy="16" r="1.5" fill="currentColor"/>
        </svg>`
    };

    /**
     * Create wrapper for background decor to ensure absolute positioning,
     * zero pointer interception, and screen-reader invisibility.
     */
    function createDecorContainer(extraClass = '') {
        const div = document.createElement('div');
        div.className = `skill-decor-layer ${extraClass}`.trim();
        div.setAttribute('aria-hidden', 'true');
        div.setAttribute('role', 'presentation');
        return div;
    }

    /**
     * Component 1: <SubtleGrid />
     * Applies a non-uniform, soft blue-gray grid with optional radial center fade
     */
    function renderSubtleGrid(target, options = {}) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;

        const {
            density = 36, // grid cell size in px
            opacity = 0.04, // grid line opacity
            fadeCenter = true, // fade towards content center
            glow = false // soft ambient radial blue aura
        } = options;

        el.classList.add('has-subtle-grid');
        el.style.setProperty('--grid-density', `${density}px`);
        el.style.setProperty('--grid-line-opacity', opacity);

        if (fadeCenter) {
            el.classList.add('grid-fade-center');
        }
        if (glow) {
            el.classList.add('grid-hero-glow');
        }
    }

    /**
     * Component 2: <EducationDecor />
     * Places delicate, thin-line learning motifs (book, grad cap, pencil, lightbulb)
     */
    function renderEducationDecor(target, options = {}) {
        const container = typeof target === 'string' ? document.querySelector(target) : target;
        if (!container) return;

        const {
            motifs = ['gradCap', 'book', 'lightbulb', 'codeBrackets'],
            position = 'corners', // 'corners', 'top', 'bottom', 'sides'
            opacity = 0.065,
            size = 38,
            rotation = 0
        } = options;

        const layer = createDecorContainer('edu-decor-layer');

        const positions = {
            topLeft: { top: '8%', left: '4%', rot: -8 },
            topRight: { top: '10%', right: '5%', rot: 12 },
            bottomLeft: { bottom: '10%', left: '5%', rot: 6 },
            bottomRight: { bottom: '12%', right: '6%', rot: -10 }
        };

        const posKeys = Object.keys(positions);

        motifs.forEach((motifName, i) => {
            if (!MOTIFS[motifName]) return;
            const posKey = posKeys[i % posKeys.length];
            const pos = positions[posKey];

            const item = document.createElement('div');
            item.className = `decor-item decor-${motifName}`;
            item.innerHTML = MOTIFS[motifName];

            // Apply styling
            Object.assign(item.style, {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                opacity: String(opacity),
                color: 'var(--primary, #4f46e5)',
                transform: `rotate(${pos.rot + rotation}deg)`,
                pointerEvents: 'none',
                userSelect: 'none',
                transition: 'opacity 0.3s ease',
                ...pos
            });

            layer.appendChild(item);
        });

        // Ensure container is positioned relatively so absolute decor coordinates attach properly
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        container.insertBefore(layer, container.firstChild);
    }

    /**
     * Component 3: <ExchangePattern />
     * Visual motifs communicating peer-to-peer exchange, reciprocal barter, two-way loops
     */
    function renderExchangePattern(target, options = {}) {
        const container = typeof target === 'string' ? document.querySelector(target) : target;
        if (!container) return;

        const {
            opacity = 0.07,
            size = 44,
            position = 'center-sides'
        } = options;

        const layer = createDecorContainer('exchange-pattern-layer');

        const items = [
            { motif: 'exchangeLoop', top: '18%', right: '4%', rot: 5 },
            { motif: 'knowledgeNodes', bottom: '16%', left: '4%', rot: -6 }
        ];

        items.forEach(cfg => {
            const item = document.createElement('div');
            item.className = 'decor-item decor-exchange';
            item.innerHTML = MOTIFS[cfg.motif];
            Object.assign(item.style, {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                opacity: String(opacity),
                color: 'var(--primary, #4f46e5)',
                transform: `rotate(${cfg.rot}deg)`,
                pointerEvents: 'none',
                userSelect: 'none',
                top: cfg.top || 'auto',
                bottom: cfg.bottom || 'auto',
                left: cfg.left || 'auto',
                right: cfg.right || 'auto'
            });
            layer.appendChild(item);
        });

        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        container.insertBefore(layer, container.firstChild);
    }

    /**
     * Component 4: <KnowledgeNodes />
     * Subtle interconnected graph / network dots representing campus peer knowledge web
     */
    function renderKnowledgeNodes(target, options = {}) {
        const container = typeof target === 'string' ? document.querySelector(target) : target;
        if (!container) return;

        const {
            opacity = 0.06,
            size = 54,
            position = 'top-right'
        } = options;

        const layer = createDecorContainer('knowledge-nodes-layer');
        const item = document.createElement('div');
        item.className = 'decor-item decor-network';
        item.innerHTML = MOTIFS.knowledgeNodes;

        Object.assign(item.style, {
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            opacity: String(opacity),
            color: 'var(--primary, #4f46e5)',
            pointerEvents: 'none',
            userSelect: 'none',
            top: position.includes('top') ? '12%' : 'auto',
            bottom: position.includes('bottom') ? '12%' : 'auto',
            left: position.includes('left') ? '3%' : 'auto',
            right: position.includes('right') ? '3%' : 'auto'
        });

        layer.appendChild(item);

        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        container.insertBefore(layer, container.firstChild);
    }

    /**
     * Auto-mount decor for designated sections across the platform:
     * - Hero sections
     * - Main discovery containers
     * - Category explorations
     * - How It Works workflow
     */
    function initAutoDecor() {
        // 1. Subtle grid on entire body
        document.body.classList.add('bg-grid-subtle');

        // 2. Hero Section on Landing Page
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            renderSubtleGrid(heroSection, { density: 36, opacity: 0.045, fadeCenter: true, glow: true });
            
            // Add 4 subtle educational & exchange elements in empty corners
            const heroLayer = createDecorContainer('hero-decor-layer');
            const heroItems = [
                // Top-Left: Graduation cap + connected nodes
                {
                    motif: MOTIFS.gradCap,
                    styles: { top: '12%', left: '3%', width: '42px', height: '42px', opacity: '0.065', transform: 'rotate(-8deg)' }
                },
                // Top-Right: Lightbulb + Code Brackets
                {
                    motif: MOTIFS.lightbulb,
                    styles: { top: '15%', right: '4%', width: '38px', height: '38px', opacity: '0.065', transform: 'rotate(10deg)' }
                },
                // Bottom-Left: Open textbook
                {
                    motif: MOTIFS.book,
                    styles: { bottom: '14%', left: '4%', width: '38px', height: '38px', opacity: '0.06', transform: 'rotate(6deg)' }
                },
                // Bottom-Right: Two-Way Reciprocal Exchange Loop
                {
                    motif: MOTIFS.exchangeLoop,
                    styles: { bottom: '16%', right: '3.5%', width: '46px', height: '46px', opacity: '0.075', transform: 'rotate(-4deg)' }
                },
                // Far corner sparkle 1
                {
                    motif: MOTIFS.sparkle,
                    styles: { top: '35%', left: '7%', width: '16px', height: '16px', opacity: '0.05' }
                },
                // Far corner sparkle 2
                {
                    motif: MOTIFS.sparkle,
                    styles: { top: '30%', right: '8%', width: '18px', height: '18px', opacity: '0.05' }
                }
            ];

            heroItems.forEach(item => {
                const div = document.createElement('div');
                div.className = 'decor-item';
                div.innerHTML = item.motif;
                Object.assign(div.style, {
                    position: 'absolute',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    color: 'var(--primary, #4f46e5)',
                    transition: 'all 0.2s ease',
                    ...item.styles
                });
                heroLayer.appendChild(div);
            });

            heroSection.style.position = 'relative';
            heroSection.insertBefore(heroLayer, heroSection.firstChild);
        }

        // 3. Search / Discovery Section
        const searchSection = document.querySelector('section:has(.search-module-card), section:has(#heroSearchForm)');
        if (searchSection) {
            renderSubtleGrid(searchSection, { density: 44, opacity: 0.035, fadeCenter: true });
        }

        // 4. Categories Section
        const catSection = document.querySelector('section:has(#categoriesGrid)');
        if (catSection) {
            renderSubtleGrid(catSection, { density: 36, opacity: 0.035, fadeCenter: true });
            renderKnowledgeNodes(catSection, { opacity: 0.05, size: 48, position: 'top-right' });
        }

        // 5. How It Works Section
        const howItWorksSection = document.querySelector('section:has(.process-step-card)');
        if (howItWorksSection) {
            renderSubtleGrid(howItWorksSection, { density: 40, opacity: 0.04, fadeCenter: true });
            renderExchangePattern(howItWorksSection, { opacity: 0.06, size: 42 });
        }

        // 6. Platform Stats Section
        const statsSection = document.getElementById('platformStatsSection');
        if (statsSection) {
            renderSubtleGrid(statsSection, { density: 36, opacity: 0.035, fadeCenter: true });
        }

        // 7. Dashboard Welcome Banner / Container
        const dashWelcomeCard = document.querySelector('.card:has(#dashStudentName)');
        if (dashWelcomeCard) {
            dashWelcomeCard.classList.add('dash-welcome-aura');
            renderEducationDecor(dashWelcomeCard, {
                motifs: ['gradCap', 'lightbulb', 'sparkle'],
                opacity: 0.05,
                size: 32,
                position: 'sides'
            });
        }

        // 8. Custom data-decor containers
        document.querySelectorAll('[data-decor]').forEach(el => {
            const decorType = el.getAttribute('data-decor');
            if (decorType === 'education') renderEducationDecor(el);
            if (decorType === 'exchange') renderExchangePattern(el);
            if (decorType === 'knowledge') renderKnowledgeNodes(el);
            if (decorType === 'grid') renderSubtleGrid(el);
        });
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAutoDecor);
    } else {
        initAutoDecor();
    }

    // Public API
    return {
        motifs: MOTIFS,
        SubtleGrid: renderSubtleGrid,
        EducationDecor: renderEducationDecor,
        ExchangePattern: renderExchangePattern,
        KnowledgeNodes: renderKnowledgeNodes,
        mount: function (target, type = 'education', opts = {}) {
            if (type === 'grid') return renderSubtleGrid(target, opts);
            if (type === 'education') return renderEducationDecor(target, opts);
            if (type === 'exchange') return renderExchangePattern(target, opts);
            if (type === 'knowledge') return renderKnowledgeNodes(target, opts);
        }
    };
}));
