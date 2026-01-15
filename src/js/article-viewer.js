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
        const response = await fetch(`/linkedin/articles/${fileName}`);
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
            bodyEl.innerHTML = bodyContent.innerHTML;
            
            // Final cleanup of any style blocks or broken images
            bodyEl.querySelectorAll('style, script, link').forEach(s => s.remove());
            
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
