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
        diagrams: './diagrams.html',
        elements: './elements.html',
        article1: './article-1.html',
        article2: './article-2.html',
        article3: './article-3.html',
        article4: './article-4.html',
        article5: './article-5.html',
        article6: './article-6.html',
      }
    }
  }
});
