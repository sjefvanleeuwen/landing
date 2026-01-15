# Magazine Style Landing Page

A high-end, vanilla HTML/Sass/JS landing page built with Storybook.

## Features
- **Magazine Aesthetics**: Bold headers, grid layouts, and high contrast.
- **Local Fonts**: Configured for Exo 2 and Orbitron.
- **Scroll Animations**: Vanilla JS Intersection Observer for "fly-in" effects.
- **Zero Frameworks**: No React or UI libraries used in the landing page code.

## Setup
1. **Fonts**: Place the following files in `public/fonts/`:
   - `exo2-regular.woff2`
   - `orbitron-bold.woff2`
2. **Install**: `npm install`
3. **Run Storybook**: `npm run storybook`

## Structure
- `src/scss/base.scss`: Typography and variable settings.
- `src/scss/animations.scss`: Fly-in animation keyframes and classes.
- `src/js/animations.js`: Logic to trigger animations on scroll.
- `src/stories/LandingPage.stories.js`: The Storybook story defining the page structure.
