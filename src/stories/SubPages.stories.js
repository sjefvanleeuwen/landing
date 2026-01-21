export default {
  title: 'Pages/SubPages',
};

const Header = `
  <m-nav class="scrolled">
    <a href="#" class="logo">SJEF VAN LEEUWEN1</a>
    <div class="nav-links">
      <a href="#">Home</a>
      <a href="#">Stories</a>
      <a href="#">Blog</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </div>
  </m-nav>
`;

const Footer = `
  <footer>
    <div class="footer-grid">
      <div class="footer-col">
        <h4 style="font-family: 'Orbitron'; font-size: 1.5rem; letter-spacing: 5px;">SJEF VAN LEEUWEN</h4>
        <p style="color: #666; line-height: 1.8; margin-top: 20px;">A exploration of high-end digital editorial design using modern vanilla web technologies.</p>
      </div>
      <div class="footer-col">
        <h4>Sections</h4>
        <ul>
          <li><a href="#">Architecture</a></li>
          <li><a href="#">Performance</a></li>
          <li><a href="#">Visual Impact</a></li>
          <li><a href="#">Editorial</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Use</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Stay Connected</h4>
        <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">Subscribe to our newsletter for weekly tech and strategy insights.</p>
        <div style="display: flex;">
          <input type="email" placeholder="Email" style="padding: 10px; background: #111; border: 1px solid #222; color: #fff; flex: 1;">
          <button style="background: #fff; border: none; padding: 10px 15px; cursor: pointer;">GO</button>
        </div>
      </div>
    </div>
    <div class="copyright">
      &copy; 2026 SJEF VAN LEEUWEN. ALL RIGHTS RESERVED.
    </div>
  </footer>
`;

export const Blog = () => {
  return `
    <div class="sub-page">
      ${Header}
      
      <main style="padding-top: 100px;">
        <section>
          <m-reveal class="fly-in-up">
            <h1 style="font-size: 3rem; margin-bottom: 40px;">Editorial Blog</h1>
          </m-reveal>
          
          <div class="magazine-grid">
            <m-reveal class="feature-large fly-in-left">
              <img src="/images/image2.png" alt="Blog Post" style="width: 100%; height: 100%; object-fit: cover;">
              <div class="content">
                <h2>The Future of Web Typography</h2>
                <p>How variable fonts and local hosting are changing the design landscape.</p>
              </div>
            </m-reveal>
            
            <m-reveal class="feature-small fly-in-right">
              <h3>Recent Updates</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                  <a href="#" style="text-decoration: none; color: inherit;">
                    <span style="font-family: 'Orbitron'; font-size: 0.7rem; color: #3498db;">January 12</span>
                    <h4 style="margin: 5px 0;">Sass vs CSS Variables</h4>
                  </a>
                </li>
                <li style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                  <a href="#" style="text-decoration: none; color: inherit;">
                    <span style="font-family: 'Orbitron'; font-size: 0.7rem; color: #3498db;">January 10</span>
                    <h4 style="margin: 5px 0;">The Return of Static Sites</h4>
                  </a>
                </li>
              </ul>
            </m-reveal>

            <m-reveal class="feature-half fly-in-up delay-1">
              <img src="/images/image3.png" alt="Design Art" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
              <div class="content" style="position: static; color: inherit; background: none; padding: 20px 0;">
                <h3 style="margin-top: 10px;">Minimalism in 2026</h3>
                <p>Why less is still more when it comes to user experience and performance.</p>
              </div>
            </m-reveal>

            <m-reveal class="feature-half fly-in-up delay-2">
              <img src="/images/image1.png" alt="Code" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
              <div class="content" style="position: static; color: inherit; background: none; padding: 20px 0;">
                <h3 style="margin-top: 10px;">Vanilla JS Power</h3>
                <p>Building complex animations with zero dependencies and maximum speed.</p>
              </div>
            </m-reveal>
          </div>
        </section>
      </main>

      ${Footer}
    </div>
  `;
};

export const About = () => {
  return `
    <div class="sub-page">
      ${Header}
      
      <main style="padding-top: 100px;">
        <section class="magazine-grid">
          <m-reveal class="feature-large fly-in-left">
            <img src="/images/image1.png" alt="Our Team" style="width: 100%; height: 100%; object-fit: cover;">
            <div class="content">
              <h2>Our Mission</h2>
              <p>We believe in high-contrast design and low-overhead code.</p>
            </div>
          </m-reveal>
          
          <m-reveal class="feature-small fly-in-right">
            <h3>Philosophy</h3>
            <p>Powered by modern browser capabilities, Magazine aims to redefine the digital reading experience through advanced typography and fluid layouts.</p>
            <p>Every line of code is written to be understandable, performant, and beautiful.</p>
          </m-reveal>
        </section>

        <section style="background: #111;">
           <m-reveal class="fly-in-up" style="max-width: 800px; margin: 0 auto; text-align: center;">
             <h2>The Team</h2>
             <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 50px;">
                <div>
                  <div style="width: 80px; height: 80px; background: #ddd; border-radius: 50%; margin: 0 auto 15px auto;"></div>
                  <h4 style="margin-bottom: 5px;">Alex Rivera</h4>
                  <p style="font-size: 0.8rem; color: #666;">Creative Director</p>
                </div>
                <div>
                  <div style="width: 80px; height: 80px; background: #ddd; border-radius: 50%; margin: 0 auto 15px auto;"></div>
                  <h4 style="margin-bottom: 5px;">Jordan Smith</h4>
                  <p style="font-size: 0.8rem; color: #666;">Lead Architect</p>
                </div>
                <div>
                  <div style="width: 80px; height: 80px; background: #ddd; border-radius: 50%; margin: 0 auto 15px auto;"></div>
                  <h4 style="margin-bottom: 5px;">Casey Wong</h4>
                  <p style="font-size: 0.8rem; color: #666;">Editorial Lead</p>
                </div>
             </div>
           </m-reveal>
        </section>
      </main>

      ${Footer}
    </div>
  `;
};
