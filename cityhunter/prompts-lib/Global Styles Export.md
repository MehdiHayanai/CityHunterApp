/* CityHunter Global Design Tokens & Utility Classes
   Version: 1.2
   Exported for scalability and consistency across future pages.
*/

/* --- 1. CSS VARIABLES (THEMING) --- */
:root {
    /* Default Dark Mode Palette */
    --c-canvas: 5 5 5;         /* #050505 */
    --c-surface: 18 18 18;     /* #121212 */
    --c-primary: 255 255 255;  /* #FFFFFF */
    --c-secondary: 156 163 175;/* #9CA3AF */
    --c-accent: 204 255 0;     /* #CCFF00 - Electric Lime */
    --c-divider: 255 255 255;  /* White borders */
    
    /* Glassmorphism Tokens */
    --glass-bg: rgba(18, 18, 18, 0.6);
    --glass-border: rgba(255, 255, 255, 0.05);
    
    /* Gradient Tokens */
    --hero-overlay-start: rgba(5, 5, 5, 0);
    --hero-overlay-mid: rgba(5, 5, 5, 0.8);
    --hero-overlay-end: rgba(5, 5, 5, 1);
    
    /* Decoration Tokens */
    --grid-color: rgba(255, 255, 255, 0.05);
    --stroke-color: rgba(255, 255, 255, 0.2); 
    
    /* Component Specific */
    --mobile-menu-bg: rgba(5, 5, 5, 0.95);
    --mobile-menu-blur: 20px;
}

/* Light Mode Overrides */
[data-theme="light"] {
    --c-canvas: 248 250 252;   /* #F8FAFC (Slate 50) */
    --c-surface: 255 255 255;  /* #FFFFFF */
    --c-primary: 15 23 42;     /* #0F172A (Slate 900) */
    --c-secondary: 100 116 139;/* #64748B (Slate 500) */
    --c-accent: 180 230 0;     /* #B4E600 - Darker Lime for contrast */
    --c-divider: 0 0 0;        /* Black borders */

    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(0, 0, 0, 0.05);
    
    --hero-overlay-start: rgba(248, 250, 252, 0);
    --hero-overlay-mid: rgba(248, 250, 252, 0.8);
    --hero-overlay-end: rgba(248, 250, 252, 1);
    
    --grid-color: rgba(0, 0, 0, 0.05);
    --stroke-color: rgba(0, 0, 0, 0.2);
    
    --mobile-menu-bg: rgba(255, 255, 255, 0.95);
}

/* --- 2. GLOBAL UTILITIES --- */

/* Text Gradients (Used for headers) */
.text-gradient {
    background: linear-gradient(to right, rgb(var(--c-primary)), rgb(var(--c-secondary)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Grid Background Pattern */
.bg-grid {
    background-size: 40px 40px;
    background-image: 
        linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
        linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
    mask-image: linear-gradient(to bottom, transparent, black, transparent);
    -webkit-mask-image: linear-gradient(to bottom, transparent 5%, black 40%, black 80%, transparent 95%);
}

/* Glassmorphism Utility (Cards, Modals) */
.glass {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
}

/* Hero Gradient Overlay */
.bg-hero-gradient {
    background: linear-gradient(to top, var(--hero-overlay-end), var(--hero-overlay-mid), var(--hero-overlay-start));
}

/* Text Stroke Effect (Hollow text) */
.text-stroke {
    -webkit-text-stroke: 1px var(--stroke-color);
    color: transparent;
}

/* Spotlight Card Effect (Requires JS for --mouse-x/y) */
.spotlight-card {
    position: relative;
    overflow: hidden;
}
.spotlight-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(var(--c-accent) / 0.1), transparent 40%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 1;
}
.spotlight-card:hover::before {
    opacity: 1;
}

/* --- 3. UI PATTERNS & LEARNINGS (Components) --- */

/* Wizard / Split Layouts
   - Use fixed desktop height (e.g., h-[750px]) to prevent layout jitter on content change.
   - Use h-auto on mobile for natural flow.
   - Grid: Left=Context (Map), Right=Interaction (Form).
*/
.wizard-container {
    @apply w-full max-w-7xl mx-auto flex rounded-3xl overflow-hidden glass shadow-2xl border border-white/10 ring-1 ring-white/5 transition-all duration-300;
    @apply h-auto md:h-[750px] flex-col md:flex-row;
}

/* Form Inputs
   - Inspired by shadcn/ui: Minimalist, crisp borders, sophisticated focus rings.
   - Enhanced for CityHunter: Glassmorphism, subtle glows, and tactical depth.
*/
.input-glass {
    @apply flex h-14 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm ring-offset-black file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300;
}

.input-premium {
    @apply h-12 px-6 bg-black/40 border-white/10 text-white placeholder-white/20 focus:border-accent/40 focus:bg-black/60 backdrop-blur-xl shadow-2xl transition-all rounded-xl text-xs font-mono;
}

/* Labels
   - Uppercase, tracking-widest (0.2em), small font size (11px) for technical/dashboard feel.
   - Use `fa-icon` prefixes in labels for quick visual scanning.
*/
.label-tech {
    @apply text-[11px] font-bold text-secondary uppercase tracking-[0.2em] mb-3 block flex items-center gap-2;
}

/* Tag Selection (Alternative to Select/Text)
   - Use "Tag Clouds" instead of plain text inputs for categories.
   - Chips: `px-4 py-2 rounded-full`.
   - Selected State: Accent background, black text, slight scale transform.
   - Default State: Surface background, secondary text, hover effects.
*/
.tag-chip {
    @apply px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300;
}
.tag-chip-active {
    @apply bg-accent text-black border-accent scale-105 shadow-[0_0_15px_rgba(204,255,0,0.3)];
}

/* Buttons
   - Use rounded-full for modern tech/mission-oriented aesthetic.
   - Transitions: Smooth scale (1.05) and color shifts.
   - Primary: High-contrast (White/Black).
   - Accent: Brand color (Lime/Black).
   - Glass: Translucent backgrounds for secondary actions.
*/
.btn-primary {
    @apply px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2;
}
.btn-accent {
    @apply px-6 py-3 bg-accent text-black font-bold rounded-full shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2;
}
.btn-glass {
    @apply px-6 py-3 bg-surface/80 backdrop-blur-md border border-white/10 text-white font-bold rounded-full shadow-lg hover:bg-surface hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2;
}
.btn-xs {
    @apply px-3 py-1.5 text-[10px];
}

/* Map Interactions
   - Zoom controls should be top-right to avoid covering overlay cards.
   - Overlay cards (status/info) should be top-left.
*/

/* --- 4. ANIMATIONS --- */

.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.animate-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* --- 5. BASE ELEMENT TRANSITIONS --- */
body, div, nav, button, span, p, h1, h2, h3 {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}