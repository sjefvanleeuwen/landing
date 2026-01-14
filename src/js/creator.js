/**
 * Title Card Creator Logic
 */
export function initCreator() {
    const preview = document.querySelector('.preview-card');
    const heroImg = document.getElementById('creator-hero-img');
    const copyBtn = document.getElementById('copy-config');
    
    // Add class to body to manage scroll while in creator
    document.body.classList.add('creator-mode');
    
    // UI Elements
    const inputs = {
        title: document.getElementById('c-title'),
        subtitle: document.getElementById('c-subtitle'),
        meta: document.getElementById('c-meta'),
        fontTitle: document.getElementById('c-font-title'),
        fontSubtitle: document.getElementById('c-font-subtitle'),
        fontMeta: document.getElementById('c-font-meta'),
        fontSize: document.getElementById('c-font-size'),
        letterSpacing: document.getElementById('c-spacing'),
        lineHeight: document.getElementById('c-line-height'),
        blendMode: document.getElementById('c-blend'),
        padding: document.getElementById('c-padding'),
        borderWidth: document.getElementById('c-border'),
        blur: document.getElementById('c-blur'),
        brightness: document.getElementById('c-brightness'),
        invert: document.getElementById('c-invert'),
        useColorThief: document.getElementById('c-thief-toggle')
    };

    const colorTargets = {
        title: document.getElementById('c-color-title'),
        subtitle: document.getElementById('c-color-subtitle'),
        meta: document.getElementById('c-color-meta'),
        border: document.getElementById('c-color-border')
    };

    const values = {
        'c-font-size': document.getElementById('v-font-size'),
        'c-spacing': document.getElementById('v-spacing'),
        'c-line-height': document.getElementById('v-line-height'),
        'c-padding': document.getElementById('v-padding'),
        'c-border': document.getElementById('v-border'),
        'c-blur': document.getElementById('v-blur'),
        'c-brightness': document.getElementById('v-brightness'),
        'c-invert': document.getElementById('v-invert')
    };

    function updatePreview() {
        if (!preview) return;

        const titleEl = preview.querySelector('.combo-title');
        const subEl = preview.querySelector('.combo-sub');
        const metaEl = preview.querySelector('.combo-meta');

        // Content
        const rawTitle = inputs.title.value;
        const processedTitle = rawTitle
            .replace(/\n/g, '<br>')
            .replace(/\[(.*?)\]/g, '<span class="accent">$1</span>');
        
        titleEl.innerHTML = processedTitle;
        subEl.textContent = inputs.subtitle.value;
        metaEl.textContent = inputs.meta.value;

        // Individual Fonts
        titleEl.style.fontFamily = inputs.fontTitle.value;
        subEl.style.fontFamily = inputs.fontSubtitle.value;
        metaEl.style.fontFamily = inputs.fontMeta.value;

        // Sizing & Spacing
        titleEl.style.fontSize = `${inputs.fontSize.value}rem`;
        titleEl.style.letterSpacing = `${inputs.letterSpacing.value}px`;
        titleEl.style.lineHeight = inputs.lineHeight.value;

        // Individual Colors
        titleEl.style.color = colorTargets.title.value;
        subEl.style.color = colorTargets.subtitle.value;
        metaEl.style.color = colorTargets.meta.value;

        // FX
        titleEl.style.mixBlendMode = inputs.blendMode.value;
        preview.style.padding = `${inputs.padding.value}px`;
        preview.style.borderWidth = `${inputs.borderWidth.value}px`;
        preview.style.borderColor = colorTargets.border.value;
        
        if (inputs.borderWidth.value > 0) {
            preview.style.borderStyle = 'solid';
        } else {
            preview.style.borderStyle = 'none';
        }

        // Image FX
        if (heroImg) {
            heroImg.style.filter = `blur(${inputs.blur.value}px) brightness(${inputs.brightness.value}) invert(${inputs.invert.value}%)`;
        }

        // Update value displays
        if (values['c-font-size']) values['c-font-size'].textContent = inputs.fontSize.value;
        if (values['c-spacing']) values['c-spacing'].textContent = inputs.letterSpacing.value;
        if (values['c-line-height']) values['c-line-height'].textContent = inputs.lineHeight.value;
        if (values['c-padding']) values['c-padding'].textContent = inputs.padding.value;
        if (values['c-border']) values['c-border'].textContent = inputs.borderWidth.value;
        if (values['c-blur']) values['c-blur'].textContent = inputs.blur.value;
        if (values['c-brightness']) values['c-brightness'].textContent = inputs.brightness.value;
        if (values['c-invert']) values['c-invert'].textContent = inputs.invert.value;
    }

    function updateColorSwatches(palette, invertedPalette = []) {
        const swatchContainer = document.getElementById('color-swatches');
        if (!swatchContainer) return;
        
        swatchContainer.innerHTML = '';
        const defaults = ['#ffffff', '#000000'];
        
        // Combine standard and inverted palettes for maximum color choice
        const sections = [
            { title: 'Standard', colors: [...defaults, ...palette.map(p => p.rgbPrimary)] },
            { title: 'Inverted', colors: invertedPalette.map(p => p.rgbPrimary) }
        ];

        sections.forEach(section => {
            if (section.colors.length === 0) return;
            
            const label = document.createElement('div');
            label.className = 'swatch-label';
            label.textContent = section.title;
            swatchContainer.appendChild(label);

            const grid = document.createElement('div');
            grid.className = 'swatch-row';
            
            section.colors.forEach(color => {
                const btn = document.createElement('button');
                btn.className = 'swatch-btn';
                btn.style.backgroundColor = color;
                btn.title = color;
                btn.addEventListener('click', () => {
                    const activeColorInput = document.querySelector('.color-input-btn.active');
                    if (activeColorInput) {
                        const targetId = activeColorInput.dataset.target;
                        colorTargets[targetId].value = color;
                        updatePreview();
                    }
                });
                grid.appendChild(btn);
            });
            swatchContainer.appendChild(grid);
        });
    }

    function copyToClipboard() {
        const scss = `// Generated Title Card Styles
.custom-title-card {
    .combo-title {
        font-family: '${inputs.fontTitle.value}';
        font-size: ${inputs.fontSize.value}rem;
        letter-spacing: ${inputs.letterSpacing.value}px;
        line-height: ${inputs.lineHeight.value};
        color: ${colorTargets.title.value};
        mix-blend-mode: ${inputs.blendMode.value};

        .accent {
            color: var(--theme-accent, ${inputs.blendMode.value === 'difference' ? '#0ff' : 'inherit'});
            mix-blend-mode: normal;
        }
    }
    .combo-sub {
        font-family: '${inputs.fontSubtitle.value}';
        color: ${colorTargets.subtitle.value};
    }
    .combo-meta {
        font-family: '${inputs.fontMeta.value}';
        color: ${colorTargets.meta.value};
    }
    .preview-card {
        padding: ${inputs.padding.value}px;
        border: ${inputs.borderWidth.value}px solid ${colorTargets.border.value};
    }
    img {
        filter: blur(${inputs.blur.value}px) brightness(${inputs.brightness.value}) invert(${inputs.invert.value}%);
    }
}`;
        navigator.clipboard.writeText(scss).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'COPIED!';
            setTimeout(() => copyBtn.textContent = originalText, 2000);
        });
    }

    // Event Listeners
    document.addEventListener('theme-updated', (e) => {
        if (inputs.useColorThief.checked && e.detail.palette) {
            updateColorSwatches(e.detail.palette, e.detail.invertedPalette || []);
        }
    });

    document.querySelectorAll('.color-input-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-input-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    inputs.useColorThief.addEventListener('change', async () => {
        if (inputs.useColorThief.checked && window.dynamicTheme) {
            await window.dynamicTheme.applyFromImage(heroImg);
        }
        updatePreview();
    });

    Object.values(inputs).forEach(input => {
        if (input) input.addEventListener('input', updatePreview);
    });

    Object.values(colorTargets).forEach(input => {
        if (input) input.addEventListener('input', updatePreview);
    });

    document.querySelectorAll('.img-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            const imgEl = thumb.querySelector('img');
            heroImg.src = imgEl.src;
            document.querySelectorAll('.img-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');

            heroImg.onload = async () => {
                if (window.dynamicTheme) {
                    await window.dynamicTheme.applyFromImage(heroImg);
                }
                updatePreview();
            };
            if (heroImg.complete) heroImg.onload();
        });
    });

    if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);

    // Initial trigger
    if (heroImg.complete && window.dynamicTheme) {
        window.dynamicTheme.applyFromImage(heroImg);
    }
    updatePreview();
}
