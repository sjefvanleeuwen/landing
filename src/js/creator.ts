/**
 * Title Card Creator Logic
 */
export function initCreator(): void {
    const preview = document.querySelector('.preview-card') as HTMLElement;
    const heroImg = document.getElementById('creator-hero-img') as HTMLImageElement;
    const copyBtn = document.getElementById('copy-config') as HTMLButtonElement;
    
    // Add class to body to manage scroll while in creator
    document.body.classList.add('creator-mode');
    
    // UI Elements
    const inputs = {
        title: document.getElementById('c-title') as HTMLTextAreaElement,
        subtitle: document.getElementById('c-subtitle') as HTMLInputElement,
        meta: document.getElementById('c-meta') as HTMLInputElement,
        fontTitle: document.getElementById('c-font-title') as HTMLSelectElement,
        fontSubtitle: document.getElementById('c-font-subtitle') as HTMLSelectElement,
        fontMeta: document.getElementById('c-font-meta') as HTMLSelectElement,
        fontSize: document.getElementById('c-font-size') as HTMLInputElement,
        letterSpacing: document.getElementById('c-spacing') as HTMLInputElement,
        lineHeight: document.getElementById('c-line-height') as HTMLInputElement,
        blendMode: document.getElementById('c-blend') as HTMLSelectElement,
        padding: document.getElementById('c-padding') as HTMLInputElement,
        borderWidth: document.getElementById('c-border') as HTMLInputElement,
        blur: document.getElementById('c-blur') as HTMLInputElement,
        brightness: document.getElementById('c-brightness') as HTMLInputElement,
        invert: document.getElementById('c-invert') as HTMLInputElement,
        useColorThief: document.getElementById('c-thief-toggle') as HTMLInputElement
    };

    const colorTargets: Record<string, HTMLInputElement> = {
        title: document.getElementById('c-color-title') as HTMLInputElement,
        subtitle: document.getElementById('c-color-subtitle') as HTMLInputElement,
        meta: document.getElementById('c-color-meta') as HTMLInputElement,
        border: document.getElementById('c-color-border') as HTMLInputElement
    };

    const values: Record<string, HTMLElement | null> = {
        'c-font-size': document.getElementById('v-font-size'),
        'c-spacing': document.getElementById('v-spacing'),
        'c-line-height': document.getElementById('v-line-height'),
        'c-padding': document.getElementById('v-padding'),
        'c-border': document.getElementById('v-border'),
        'c-blur': document.getElementById('v-blur'),
        'c-brightness': document.getElementById('v-brightness'),
        'c-invert': document.getElementById('v-invert')
    };

    function updatePreview(): void {
        if (!preview) return;

        const titleEl = preview.querySelector('.combo-title') as HTMLElement;
        const subEl = preview.querySelector('.combo-sub') as HTMLElement;
        const metaEl = preview.querySelector('.combo-meta') as HTMLElement;

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
        titleEl.style.mixBlendMode = inputs.blendMode.value as any;
        preview.style.padding = `${inputs.padding.value}px`;
        preview.style.borderWidth = `${inputs.borderWidth.value}px`;
        preview.style.borderColor = colorTargets.border.value;
        
        if (Number(inputs.borderWidth.value) > 0) {
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

    function updateColorSwatches(palette: any[], invertedPalette: any[] = []): void {
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
                    const activeColorInput = document.querySelector('.color-input-btn.active') as HTMLElement;
                    if (activeColorInput) {
                        const targetId = activeColorInput.dataset.target;
                        if (targetId && colorTargets[targetId]) {
                            colorTargets[targetId].value = color;
                            updatePreview();
                        }
                    }
                });
                grid.appendChild(btn);
            });
            swatchContainer.appendChild(grid);
        });
    }

    function copyToClipboard(): void {
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
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'COPIED!';
                setTimeout(() => copyBtn.textContent = originalText, 2000);
            }
        });
    }

    // Event Listeners
    document.addEventListener('theme-updated', (e: any) => {
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
        if (inputs.useColorThief.checked && (window as any).dynamicTheme) {
            await (window as any).dynamicTheme.applyFromImage(heroImg);
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
            if (!imgEl) return;
            heroImg.src = imgEl.src;
            document.querySelectorAll('.img-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');

            heroImg.onload = async () => {
                if ((window as any).dynamicTheme) {
                    await (window as any).dynamicTheme.applyFromImage(heroImg);
                }
                updatePreview();
            };
            if (heroImg.complete) heroImg.onload(new Event('load'));
        });
    });

    if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);

    // Initial trigger
    const initialApply = async () => {
        if (heroImg.complete && (window as any).dynamicTheme) {
            await (window as any).dynamicTheme.applyFromImage(heroImg);
        }
        updatePreview();
    };
    initialApply();
}
