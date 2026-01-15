export default {
  title: 'Pages/LandingPage',
};

export const Default = () => {
  return `
    <div class="landing-page">
      <m-nav>
        <a href="#" class="logo">SJEF VAN LEEUWEN</a>
        <div class="nav-links">
          <a href="#">Home</a>
          <a href="#">Stories</a>
          <a href="#">Blog</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </m-nav>

      <header>
        <m-reveal class="hero-content fly-in-up">
          <h1>SJEF VAN LEEUWEN</h1>
          <p>A vanilla exploration of style and motion.</p>
        </m-reveal>
        <m-chevron text="Explore"></m-chevron>
      </header>

      <section class="magazine-grid">
        <m-reveal class="feature-large fly-in-left">
          <img src="/images/image2.png" alt="Featured Story" style="width: 100%; height: 100%; object-fit: cover;">
          <div class="content">
            <h2>Featured Story</h2>
            <p>Exploring the boundaries of vanilla web development with high-end magazine aesthetics.</p>
          </div>
        </m-reveal>
        
        <m-reveal class="feature-small fly-in-right">
          <h3>Sidebar Insight</h3>
          <p>Details about the modern web architecture without heavy frameworks.</p>
          <img src="/images/image3.png" alt="Sidebar Ad" style="width: 100%; height: auto; margin-top: 20px;">
        </m-reveal>
        
        <div style="grid-column: 1 / -1; display: flex; justify-content: center; padding-bottom: 2rem;">
          <m-chevron text="News"></m-chevron>
        </div>
      </section>

      <section style="background: #111;">
        <div class="magazine-grid">
           <m-reveal class="feature-small fly-in-left">
            <h3>Breaking News</h3>
            <p>Scroll down to see more animations in action. We are using a minimalist approach with maximum visual impact.</p>
            <div class="placeholder-img" style="aspect-ratio: 1/1;">Editorial Art</div>
          </m-reveal>
          <m-reveal class="feature-large fly-in-right">
            <img src="/images/image3.png" alt="Gallery" style="width: 100%; height: 100%; object-fit: cover;">
            <div class="content">
              <h2>Visual Impact</h2>
              <p>Intersection Observer makes it easy to trigger animations without external libraries. This keeps the site fast and lightweight.</p>
            </div>
          </m-reveal>
          
          <div style="grid-column: 1 / -1; display: flex; justify-content: center; padding-bottom: 2rem;">
            <m-chevron text="Architecture"></m-chevron>
          </div>
        </div>
      </section>

      <section class="magazine-grid">
        <m-reveal class="feature-half fly-in-up delay-1">
           <h3>Architecture</h3>
           <p>Modern layouts using CSS Grid and Flexbox provide the structure needed for complex magazine designs.</p>
        </m-reveal>
        <m-reveal class="feature-half fly-in-up delay-2">
           <h3>Performance</h3>
           <p>By avoiding heavy frameworks, we ensure that the page remains responsive and accessibility remains a priority.</p>
        </m-reveal>
        
        <div style="grid-column: 1 / -1; display: flex; justify-content: center; padding-bottom: 2rem;">
          <m-chevron text="Contact"></m-chevron>
        </div>
      </section>

      <section>
        <m-reveal class="fly-in-up" style="max-width: 1000px; margin: 0 auto; text-align: center;">
          <h2>Editorial Design</h2>
          <p style="font-size: 1.4rem;">"Good design is obvious. Great design is transparent."</p>
          <img src="/images/image1.png" alt="Panoramic View" style="margin-top: 40px; width: 100%; aspect-ratio: 21/9; object-fit: cover;">
        </m-reveal>
      </section>

      <m-reveal class="contact-section-wrapper fly-in-up">
        <div class="contact-grid">
          <div class="contact-info">
            <h2>Get In Touch</h2>
            <p>Our editorial team is always looking for new stories and perspectives. Reach out if you have something to share.</p>
            <div class="social-links">
              <a href="#" class="social-icon">TW</a>
              <a href="#" class="social-icon">IG</a>
              <a href="#" class="social-icon">LI</a>
            </div>
          </div>
          <div class="contact-form">
            <form onsubmit="event.preventDefault(); alert('Message Sent!');">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe">
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com">
              </div>
              <div class="form-group">
                <label>Message</label>
                <textarea rows="5" placeholder="Your story starts here..."></textarea>
              </div>
              <button type="submit" class="btn-submit">Send Message</button>
            </form>
          </div>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 50px;">
          <m-chevron text="The Team"></m-chevron>
        </div>
      </m-reveal>

      <section>
        <m-reveal class="fly-in-up" style="max-width: 1000px; margin: 0 auto; text-align: center;">
          <h2>The Team</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 50px;">
             <div>
               <div style="width: 120px; height: 120px; background: #1a1a1a; border-radius: 50%; margin: 0 auto 15px auto; border: 1px solid #333; overflow: hidden;">
                 <img src="/images/member1.png" alt="Alex Rivera" style="width: 100%; height: 100%; object-fit: cover;">
               </div>
               <h4 style="margin-bottom: 5px;">Alex Rivera</h4>
               <p style="font-size: 0.8rem; color: #666;">Creative Director</p>
             </div>
             <div>
               <div style="width: 120px; height: 120px; background: #1a1a1a; border-radius: 50%; margin: 0 auto 15px auto; border: 1px solid #333; overflow: hidden;">
                 <img src="/images/member2.png" alt="Jordan Smith" style="width: 100%; height: 100%; object-fit: cover;">
               </div>
               <h4 style="margin-bottom: 5px;">Jordan Smith</h4>
               <p style="font-size: 0.8rem; color: #666;">Lead Architect</p>
             </div>
             <div>
               <div style="width: 120px; height: 120px; background: #1a1a1a; border-radius: 50%; margin: 0 auto 15px auto; border: 1px solid #333; overflow: hidden;">
                 <img src="/images/member3.png" alt="Casey Wong" style="width: 100%; height: 100%; object-fit: cover;">
               </div>
               <h4 style="margin-bottom: 5px;">Casey Wong</h4>
               <p style="font-size: 0.8rem; color: #666;">Editorial Lead</p>
             </div>
          </div>
        </m-reveal>
      </section>

      <footer>
        <div class="footer-grid">
          <div class="footer-col">
            <h4 style="font-family: 'Orbitron'; font-size: 1.5rem; letter-spacing: 5px;">MAGAZINE</h4>
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
    </div>
  `;
};
