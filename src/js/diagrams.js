/**
 * Magazine Flowchart Component
 */
class MagazineFlowchart extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="diagram-container">
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
            </marker>
          </defs>
          <g class="node" transform="translate(50, 50)" data-info="Start Point">
            <rect width="80" height="40" rx="4" />
            <text x="40" y="25" text-anchor="middle">Input</text>
          </g>
          <g class="node" transform="translate(180, 50)" data-info="Processing Layer">
            <rect width="80" height="40" rx="4" />
            <text x="40" y="25" text-anchor="middle">Process</text>
          </g>
          <g class="node" transform="translate(310, 50)" data-info="Output Result">
            <rect width="80" height="40" rx="4" />
            <text x="40" y="25" text-anchor="middle">Output</text>
          </g>
          <line x1="130" y1="70" x2="175" y2="70" stroke="currentColor" marker-end="url(#arrowhead)" />
          <line x1="260" y1="70" x2="305" y2="70" stroke="currentColor" marker-end="url(#arrowhead)" />
        </svg>
      </div>
    `;

    this.querySelectorAll(".node").forEach(node => {
      node.addEventListener("click", () => {
        const info = node.getAttribute("data-info");
        alert(`System Info: ${info}`);
      });
    });
  }
}

/**
 * Magazine Bar Chart Component
 */
class MagazineBarChart extends HTMLElement {
  connectedCallback() {
    const rawData = this.getAttribute("data") || "70,90,50,85";
    const labels = (this.getAttribute("labels") || "UX,UI,DEV,SEO").split(",");
    const values = rawData.split(",").map(Number);

    let barsHTML = values.map((val, i) => `
      <div class="bar" style="--height: ${val}%" data-label="${labels[i] || ""}">
        <span>${val}%</span>
      </div>
    `).join("");

    const ySteps = [100, 75, 50, 25, 0];
    const yAxisHTML = `
      <div class="y-axis">
        ${ySteps.map(step => `<div class="y-label"><span>${step}</span></div>`).join("")}
      </div>
    `;

    this.innerHTML = `
      <div class="diagram-container">
        <div class="bar-chart-wrapper">
          ${yAxisHTML}
          <div class="bar-chart">
            ${barsHTML}
          </div>
        </div>
      </div>
    `;

    // Intersection observer for animation trigger if not inside m-reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            this.classList.add("active");
            observer.unobserve(this);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(this);
  }
}

/**
 * Magazine Mind Map Component
 */
class MagazineMindMap extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="diagram-container mind-map-container">
        <canvas></canvas>
      </div>
    `;
    this.init();
  }

  init() {
    const canvas = this.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement;

    let width, height;
    const nodes = [
        { id: "core", text: "Editorial", x: 0, y: 0, size: 45, color: "#D4AF37" },
        { id: "design", text: "Design", x: -110, y: -40, size: 30, color: "#ffffff" },
        { id: "tech", text: "System", x: 110, y: -40, size: 30, color: "#ffffff" },
        { id: "concept", text: "Concept", x: 0, y: 100, size: 30, color: "#ffffff" },
        { id: "inter", text: "Interactive", x: 0, y: -100, size: 25, color: "#ffffff" },
        { id: "ux", text: "User Exp", x: -180, y: 20, size: 20, color: "#aaaaaa" },
        { id: "perf", text: "Speed", x: 180, y: 20, size: 20, color: "#aaaaaa" },
        { id: "motion", text: "Motion", x: 160, y: -100, size: 18, color: "#aaaaaa" },
        { id: "typo", text: "Typography", x: -160, y: -100, size: 18, color: "#aaaaaa" },
        { id: "acc", text: "A11y", x: -230, y: -20, size: 15, color: "#888888" },
        { id: "seo", text: "SEO", x: 230, y: -20, size: 15, color: "#888888" },
        { id: "grid", text: "Grid", x: -90, y: 160, size: 20, color: "#aaaaaa" },
        { id: "build", text: "Vite", x: 90, y: 160, size: 20, color: "#aaaaaa" }
    ];

    const links = [
        { source: "core", target: "design" },
        { source: "core", target: "tech" },
        { source: "core", target: "concept" },
        { source: "core", target: "inter" },
        { source: "design", target: "ux" },
        { source: "design", target: "typo" },
        { source: "tech", target: "perf" },
        { source: "tech", target: "motion" },
        { source: "ux", target: "acc" },
        { source: "perf", target: "seo" },
        { source: "concept", target: "grid" },
        { source: "concept", target: "build" }
    ];

    // Subtle background particles for depth/dith effect
    const particles = Array.from({ length: 50 }, () => ({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 500,
        size: Math.random() * 2,
        opacity: Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2
    }));

    const resize = () => {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    resize();

    let mouseX = 0, mouseY = 0;
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        mouseX = (e.clientX - rect.left) * scaleX - width / 2;
        mouseY = (e.clientY - rect.top) * scaleY - height / 2;
    });

    const animate = () => {
        if (!this.isConnected) {
            resizeObserver.disconnect();
            return;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, height / 2);

        // Responsive scale - more aggressive factor to fill width
        const scaleFactor = width / 550; 

        // Draw Background Particles with drift
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Soft wrap
            if (p.x > 400) p.x = -400;
            if (p.x < -400) p.x = 400;
            if (p.y > 250) p.y = -250;
            if (p.y < -250) p.y = 250;

            ctx.beginPath();
            const px = p.x * (width / 800);
            const py = p.y * (height / 500);
            ctx.arc(px, py, p.size * Math.max(1, scaleFactor), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity * Math.min(1, scaleFactor)})`;
            ctx.fill();
        });

        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        links.forEach(link => {
            const s = nodes.find(n => n.id === link.source);
            const t = nodes.find(n => n.id === link.target);
            if (s && t) {
              ctx.moveTo(s.x * scaleFactor, s.y * scaleFactor);
              ctx.lineTo(t.x * scaleFactor, t.y * scaleFactor);
            }
        });
        ctx.stroke();

        nodes.forEach(node => {
            const nx = node.x * scaleFactor;
            const ny = node.y * scaleFactor;
            const ns = node.size * scaleFactor;

            const dist = Math.hypot(mouseX - nx, mouseY - ny);
            const hoverScale = dist < (60 * scaleFactor) ? 1.2 : 1.0;
            
            ctx.beginPath();
            ctx.arc(nx, ny, ns * hoverScale, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(10, 10, 10, 0.95)";
            ctx.fill();
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 2 * Math.max(1, scaleFactor);
            ctx.stroke();

            ctx.fillStyle = node.color;
            ctx.font = `700 ${ns * 0.35 * hoverScale}px Orbitron`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(node.text, nx, ny);
        });

        ctx.restore();
        requestAnimationFrame(animate);
    };

    animate();
  }
}

/**
 * Magazine Line Chart Component
 */
class MagazineLineChart extends HTMLElement {
  connectedCallback() {
    const rawData = this.getAttribute("data") || "10,40,25,70,45,90";
    const labels = (this.getAttribute("labels") || "").split(",");
    const values = rawData.split(",").map(Number);
    const max = Math.max(...values, 100);
    const width = 400;
    const height = 200;
    const padding = 35; // Increased padding for vertical labels

    const points = values.map((v, i) => {
      const x = padding + (i * (width - padding * 2)) / (values.length - 1);
      const y = height - padding - (v / max) * (height - padding * 2);
      return `${x},${y}`;
    }).join(" ");

    const xLabelsHTML = labels.map((l, i) => {
      if (!l) return "";
      const x = padding + (i * (width - padding * 2)) / (values.length - 1);
      const y = height - 5;
      return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Orbitron" font-size="7" fill="#888">${l}</text>`;
    }).join("");

    // Vertical Y-Axis values (0, 25, 50, 75, 100)
    const ySteps = [0, 25, 50, 75, 100];
    const yLabelsHTML = ySteps.map(step => {
      const y = height - padding - (step / 100) * (height - padding * 2);
      return `
        <text x="${padding - 8}" y="${y}" text-anchor="end" dominant-baseline="middle" font-family="Orbitron" font-size="6" fill="#666">${step}</text>
        <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="rgba(255,255,255,0.05)" />
      `;
    }).join("");

    this.innerHTML = `
      <div class="diagram-container">
        <svg viewBox="0 0 ${width} ${height}" class="line-chart">
          ${yLabelsHTML}
          <polyline points="${points}" fill="none" stroke="#D4AF37" stroke-width="2" />
          ${values.map((v, i) => {
            const x = padding + (i * (width - padding * 2)) / (values.length - 1);
            const y = height - padding - (v / max) * (height - padding * 2);
            return `<circle cx="${x}" cy="${y}" r="3" fill="#fff" />`;
          }).join("")}
          ${xLabelsHTML}
        </svg>
      </div>
    `;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            this.classList.add("active");
            observer.unobserve(this);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(this);
  }
}

/**
 * Magazine Spider (Radar) Chart Component
 */
class MagazineSpiderChart extends HTMLElement {
  connectedCallback() {
    const rawData = this.getAttribute("data") || "80,70,90,60,85";
    const labels = (this.getAttribute("labels") || "Design,Speed,UX,Tech,SEO").split(",");
    const values = rawData.split(",").map(Number);
    
    const size = 300;
    const center = size / 2;
    const radius = size * 0.4;
    const angleStep = (Math.PI * 2) / values.length;

    // Grid lines
    let grid = "";
    for (let i = 1; i <= 4; i++) {
        const r = (radius / 4) * i;
        let points = "";
        for (let j = 0; j <= values.length; j++) {
            const angle = j * angleStep - Math.PI / 2;
            points += `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)} `;
        }
        grid += `<polygon points="${points}" fill="none" stroke="rgba(255,255,255,0.1)" />`;
    }

    // Data polygon
    const dataPoints = values.map((v, i) => {
        const r = (v / 100) * radius;
        const angle = i * angleStep - Math.PI / 2;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(" ");

    // Labels
    const labelsHTML = labels.map((l, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + (radius + 20) * Math.cos(angle);
        const y = center + (radius + 20) * Math.sin(angle);
        return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Orbitron" font-size="8" fill="#888">${l}</text>`;
    }).join("");

    this.innerHTML = `
      <div class="diagram-container">
        <svg viewBox="0 0 ${size} ${size}" class="spider-chart">
          ${grid}
          <polygon points="${dataPoints}" fill="rgba(212, 175, 55, 0.2)" stroke="#D4AF37" stroke-width="2" />
          ${labelsHTML}
        </svg>
      </div>
    `;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            this.classList.add("active");
            observer.unobserve(this);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(this);
  }
}

customElements.define("m-flowchart", MagazineFlowchart);
customElements.define("m-barchart", MagazineBarChart);
customElements.define("m-mindmap", MagazineMindMap);
customElements.define("m-linechart", MagazineLineChart);
customElements.define("m-spiderchart", MagazineSpiderChart);

