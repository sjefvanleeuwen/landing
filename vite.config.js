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
        article1: './blog/article-1.html',
        article2: './blog/article-2.html',
        article3: './blog/article-3.html',
        article4: './blog/article-4.html',
        article5: './blog/article-5.html',
        article6: './blog/article-6.html',
        article7: './blog/article-7.html',
        article8: './blog/article-8.html',
        article9: './blog/article-9.html',
        noiseFloor: './blog/noise-floor.html',
        neuralArch: './blog/neural-arch.html',
        cityLights: './music/city-lights.html',
        solitudeMachine: './music/solitude-machine.html',
        articleViewer: './article-viewer.html',
        blogBackup: './blog-backup.html',
        creator: './creator.html',
        lyricSync: './lyric-sync-tool.html',
        error404: './404.html'
      }
    }
  }
});
