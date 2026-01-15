export function initAudioPlayer() {
    const canvas = document.getElementById('visualizer');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const playPauseBtn = document.querySelector('.play-pause-btn');
    const timeDisplayBottom = document.querySelector('.time-display-bottom');
    const timeDisplayMiddle = document.querySelector('.time-display-middle');
    
    let isPlaying = false;
    let animationId;
    
    // Simulate audio data for visualizer
    const barCount = 100;
    const bars = new Array(barCount).fill(0).map(() => Math.random() * 50);
    
    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    function draw() {
        if (!isPlaying) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const spacing = 4;
        const totalWidth = canvas.width;
        const barWidth = (totalWidth / barCount) - spacing;
        const centerY = canvas.height / 2;

        for (let i = 0; i < barCount; i++) {
            // Smoothly update bar heights
            bars[i] += (Math.random() - 0.5) * 10;
            if (bars[i] < 5) bars[i] = 5;
            if (bars[i] > 80) bars[i] = 80;

            const h = bars[i];
            const x = i * (barWidth + spacing);
            
            // Draw orange bars with glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff6a00';
            ctx.fillStyle = '#ff6a00';
            
            // Symmetric bars from center
            ctx.fillRect(x, centerY - h/2, barWidth, h);
            
            // Dots at the top and bottom of each bar
            ctx.beginPath();
            ctx.arc(x + barWidth/2, centerY - h/2 - 2, 1, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x + barWidth/2, centerY + h/2 + 2, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        animationId = requestAnimationFrame(draw);
    }

    playPauseBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
            draw();
        } else {
            playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
            cancelAnimationFrame(animationId);
        }
    });

    // Dummy time update
    let currentTime = 7;
    const totalTime = 186; // 3:06

    function formatTime(s) {
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    setInterval(() => {
        if (isPlaying) {
            currentTime++;
            if (currentTime >= totalTime) currentTime = 0;
            const formatted = formatTime(currentTime);
            timeDisplayBottom.textContent = `${formatted} / ${formatTime(totalTime)}`;
            timeDisplayMiddle.textContent = `${formatted.split(':').join(' : ')}`;
        }
    }, 1000);
}
