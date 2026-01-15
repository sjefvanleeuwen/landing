export async function initBlog() {
    const grid = document.querySelector('.blog-grid');
    if (!grid) return;

    try {
        // In a real environment, we'd have an index.json or similar.
        // For this demo/SPA, we'll fetch the list of files if possible, 
        // but since we're in a browser, we usually need a manifest.
        // I will assume we have a list of important articles to show.
        
        const articles = [
            {
                title: "NOISE FLOOR",
                file: "noise-floor.html",
                date: "LIVE",
                category: "REBEL_SONIC",
                isInternal: true
            },
            {
                title: "NEURAL ARCH",
                file: "neural-arch.html",
                date: "LIVE",
                category: "COGNITIVE",
                isInternal: true
            },
            {
                title: "What Transformation Workshops Look Like",
                file: "2025-11-26 16_30_49.0-🚀 What Transformation Workshops Really Look Like in Practice.html",
                date: "Nov 2025",
                category: "LEADERSHIP"
            },
            {
                title: "The AI Boom Needs a Power Source",
                file: "2025-04-02 06_13_33.0-The AI Boom Needs a Power Source — And That Might Be the Sun.html",
                date: "Apr 2025",
                category: "AI & ENERGY"
            },
            {
                title: "Work Should Flow to Teams, Not People",
                file: "2025-04-12 08_25_40.0-Work Should Flow to Teams, Not People — Fixing Cross-Team Planning with Scrum.html",
                date: "Apr 2025",
                category: "AGILE"
            },
            {
                title: "DeepSeek-R1: Redefining AI Innovation",
                file: "deepseek-r1-redefining-ai-innovation-accessibility-van-leeuwen--tilme.html",
                date: "2025",
                category: "AI"
            },
            {
                title: "Vibe Coding: The Third Way",
                file: "beyond-build-vs-buy-rise-vibe-coding-third-way-sjef-van-leeuwen--big9e.html",
                date: "2025",
                category: "DEVELOPMENT"
            },
            {
                title: "MIT's Applied Generative AI",
                file: "article-7.html",
                date: "Apr 2025",
                category: "AI & STRATEGY",
                isInternal: true
            },
            {
                title: "The Case for Graph-Shaped Data",
                file: "article-8.html",
                date: "Dec 2023",
                category: "ARCHITECTURE",
                isInternal: true
            },
            {
                title: "AGILE ADR STRATEGIES",
                file: "article-9.html",
                date: "APR 2024",
                category: "ENGINEERING",
                isInternal: true
            }
        ];

        grid.innerHTML = articles.map((art, index) => {
            const link = art.isInternal ? `${art.file}` : `article-viewer.html?file=${encodeURIComponent(art.file)}`;
            return `
            <m-reveal class="article-card fly-in-up" style="transition-delay: ${index * 0.1}s">
                <a href="${link}" class="card-link">
                    <div class="card-meta">
                        <span class="category">${art.category}</span>
                        <span class="date">${art.date}</span>
                    </div>
                    <h2 class="card-title">${art.title}</h2>
                    <div class="card-footer">
                        <span class="read-more">Read Article </span>
                    </div>
                </a>
            </m-reveal>
        `}).join('');

    } catch (err) {
        console.error("Error loading blog articles:", err);
    }
}
