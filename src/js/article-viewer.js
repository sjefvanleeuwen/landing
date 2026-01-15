export async function initArticleViewer() {
    // Check both standard search and hash-based search (for SPA stability)
    const hash = window.location.hash;
    const searchPart = hash.includes('?') ? hash.split('?')[1] : window.location.search.slice(1);
    const params = new URLSearchParams(searchPart);
    const fileName = params.get('file');
    
    if (!fileName) {
        window.location.hash = '#/404';
        return;
    }

    const titleEl = document.getElementById('view-title');
    const bodyEl = document.getElementById('view-body');
    const dateEl = document.getElementById('view-date');

    try {
        const response = await fetch(`linkedin/articles/${fileName}`);
        const html = await response.text();
        
        // Parse the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract Title
        const title = doc.querySelector('h1')?.textContent || fileName.split('-').pop().replace('.html', '');
        if (titleEl) titleEl.textContent = title;

        // Extract Date (Published or Created)
        const dateStr = doc.querySelector('.published')?.textContent?.replace('Published on ', '') || 
                        doc.querySelector('.created')?.textContent?.replace('Created on ', '') || '';
        if (dateEl) dateEl.textContent = dateStr;

        // Extract Body Content
        const bodyContent = doc.body;

        // Strip out multiple metadata tags and the main title to avoid duplication
        bodyContent.querySelectorAll('h1').forEach(h => h.remove());
        bodyContent.querySelectorAll('.created, .published, .article-metadata').forEach(m => m.remove());

        if (bodyEl) {
            // TRANSFORMATION LOGIC: Turn LinkedIn HTML into Magazine Layout
            const paragraphs = Array.from(bodyContent.querySelectorAll('p, h2, h3, ul, ol, blockquote'));
            
            if (paragraphs.length > 0) {
                // Change page layout to dense
                const pageWrapper = document.querySelector('.article-viewer-page');
                if (pageWrapper) pageWrapper.classList.add('article-dense');

                // 1. Create Lead Section (First paragraph)
                let leadHtml = '';
                const firstP = paragraphs.find(p => p.tagName === 'P');
                if (firstP) {
                    const text = firstP.innerHTML;
                    const dropCap = text.charAt(0);
                    const remaining = text.slice(1);
                    leadHtml = `
                        <div class="main-column">
                            <section class="article-lead">
                                <m-reveal class="fly-in-up active">
                                    <p class="lead-text">
                                        <span class="drop-cap">${dropCap}</span>${remaining}
                                    </p>
                                </m-reveal>
                            </section>
                    `;
                    // Remove first P from processing
                    const index = paragraphs.indexOf(firstP);
                    paragraphs.splice(index, 1);
                }

                // 2. Wrap remaining in text-columns blocks
                // We'll chunk them or just wrap the whole thing
                let bodyHtml = `
                    <section class="article-body text-columns">
                        <m-reveal class="fly-in-up active">
                            ${paragraphs.map(p => {
                                // Ensure headings look good
                                if (p.tagName === 'H2' || p.tagName === 'H3') {
                                    p.classList.add('dynamic-heading');
                                }
                                return p.outerHTML;
                            }).join('')}
                        </m-reveal>
                    </section>
                </div>`;

                bodyEl.innerHTML = leadHtml + bodyHtml;
            } else {
                bodyEl.innerHTML = bodyContent.innerHTML;
            }
            
            // Final cleanup of any style blocks or broken images
            bodyEl.querySelectorAll('style, script, link').forEach(s => s.remove());
            
            // Fix images - if any exist in the LinkedIn article, make them full bleed blocks
            bodyEl.querySelectorAll('img').forEach(img => {
                const figure = document.createElement('figure');
                figure.className = 'article-image full-bleed';
                const reveal = document.createElement('m-reveal');
                reveal.className = 'fly-in-up active';
                
                // Copy the image
                const newImg = img.cloneNode(true);
                reveal.appendChild(newImg);
                figure.appendChild(reveal);
                
                img.replaceWith(figure);
            });

            // Ensure all links open in new tab
            bodyEl.querySelectorAll('a').forEach(a => {
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noopener noreferrer');
            });
        }

    } catch (err) {
        console.error("Error loading article:", err);
        if (bodyEl) bodyEl.innerHTML = "<p>Failed to load article content.</p>";
    }
}
