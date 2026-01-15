import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages
  // Using './' allows the project to be deployed to any subpath (like /landing/)
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        home: './home.html',
        about: './about.html',
        blog: './blog.html',
        journal: './journal.html',
        cv: './cv.html',
        diagrams: './diagrams.html',
        elements: './elements.html',
        article1: './article-1.html',
        article2: './article-2.html',
        article3: './article-3.html',
        article4: './article-4.html',
        article5: './article-5.html',
        article6: './article-6.html',
        article7: './article-7.html',
        article8: './article-8.html',
        article9: './article-9.html',
        articleViewer: './article-viewer.html',
        blogBackup: './blog-backup.html',
        creator: './creator.html',
        neuralArch: './neural-arch.html',
        noiseFloor: './noise-floor.html',
        error404: './404.html'
      }
    }
  }
});
