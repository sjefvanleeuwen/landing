# Automatically Synchronized Lyrics System

To implement synchronized lyrics in the `MagazineAudioPlayer`, we can use the industry-standard **LRC format** and a simple JavaScript parser.

## 1. The LRC Format
Create a file (e.g., `track-name.lrc`) in your `public/audio/` folder:
```lrc
[00:12.30]Welcome to the Arcade Boulevard
[00:15.50]Where the neon lights are shining bright
[00:18.20]Spent my quarters, won some tickets
```

## 2. Proposed JavaScript Implementation

### A. LRC Parser
Add a parser to `src/js/audio-service.js` or directly in `audio-component.js`:

```javascript
parseLRC(lrcText) {
    const lines = lrcText.split('\n');
    const lyrics = [];
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    lines.forEach(line => {
        const match = timeReg.exec(line);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const ms = parseInt(match[3]);
            const time = minutes * 60 + seconds + ms / 1000;
            const text = line.replace(timeReg, '').trim();
            if (text) lyrics.push({ time, text });
        }
    });
    return lyrics;
}
```

### B. Synchronization Logic
In `audio-component.js`, inside the `initVisualizer` method, add a listener to the `audio` element:

```javascript
let currentLyricIndex = -1;
const lyricsContainer = this.querySelector('.lyrics-container');

audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    const activeLyric = lyrics.findLast(l => l.time <= currentTime);
    
    if (activeLyric && activeLyric.text !== currentText) {
        this.updateLyricUI(activeLyric.text);
    }
});
```

## 3. Recommended UI Integration
Update the `connectedCallback` in `audio-component.js` to include a scrolling lyrics area:

```html
<div class="lyrics-overlay" style="
    position: absolute;
    bottom: 120px;
    width: 100%;
    text-align: center;
    pointer-events: none;
    z-index: 20;
">
    <p class="current-lyric" style="
        font-family: 'Michroma', sans-serif;
        font-size: 1.2rem;
        color: #C5A028;
        text-shadow: 0 0 10px rgba(0,0,0,0.5);
        transition: all 0.3s ease;
    "></p>
</div>
```

## 4. Automatic Timing (If you only have plain text)

If you have the lyrics but **no timestamps**, you can use these methods to generate them automatically:

### A. The AI Implementation (Client-to-Server Flow)

To use AI for automatic timing, you typically send your audio file to an endpoint (like OpenAI's Whisper API) which returns word-level timestamps.

#### 1. The Frontend Request (JavaScript)
To implement this in your `MagazineAudioPlayer`, you would add a method to "Fetch AI Timing":

```javascript
async generateAITiming(audioUrl, plainLyrics) {
    const response = await fetch('/api/sync-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl, lyrics: plainLyrics })
    });
    
    const timedLyrics = await response.json();
    this.startLyricSync(timedLyrics);
}
```

#### 2. The Backend Handler (Node.js/AI)
Since you cannot safely store API keys in the frontend, you'll need a small backend function. Here is how it processes the audio:

```javascript
// Backend Example (Node.js + OpenAI)
import OpenAI from "openai";
const openai = new OpenAI();

async function handleSync(audioFile, textLyrics) {
    const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word"]
    });

    // The AI returns word timestamps. We map them to your lines:
    return alignLyricsToWhisper(transcription.words, textLyrics);
}
```

### B. In-Browser AI (The Sync Tool)

I have created a dedicated tool for you to generate these timestamps locally using **Transformers.js**. This runs a lightweight version of OpenAI's Whisper entirely inside your browser.

#### How to use the Sync Tool:
1.  Open [lyric-sync-tool.html](lyric-sync-tool.html) in your browser.
2.  **Upload**: Select your MP3 file.
3.  **Lyrics**: Paste your plain text lyrics into the text area.
4.  **Process**: Click "Start AI Sync". The browser will download the AI model (~40MB) and transcribe your audio.
5.  **Result**: 
    *   An **LRC formatted text** will appear in the output box.
    *   A preview player will allow you to hear the song and see the lyrics changing in real-time.
6.  **Save**: Copy the generated text and save it as a `.lrc` file or paste it into your production metadata.

#### The Implementation Detail (`src/js/lyric-sync-tool.js`):
*   **Model**: Uses `Xenova/whisper-tiny.en` for fast, private processing.
*   **Logic**: Word-level timestamps are extracted from the audio and then aligned to yours line-by-line.

### C. Proportional Estimation (Zero API Cost)

If you just want it to "work" without AI or a backend, you can distribute the lyrics based on total song duration:
```javascript
estimateTimestamps(lyricsText, totalDuration) {
    const lines = lyricsText.split('\n').filter(l => l.trim());
    const totalChars = lines.join('').length;
    let currentTime = 0;
    
    return lines.map(line => {
        const duration = (line.length / totalChars) * totalDuration;
        const entry = { time: currentTime, text: line };
        currentTime += duration;
        return entry;
    });
}
```
*Note: This creates a dynamic feel without any manual work or cost.*
If you just want it to "work" without AI, you can distribute the lyrics based on total song duration:
```javascript
estimateTimestamps(lyricsText, totalDuration) {
    const lines = lyricsText.split('\n').filter(l => l.trim());
    const totalChars = lines.join('').length;
    let currentTime = 0;
    
    return lines.map(line => {
        const duration = (line.length / totalChars) * totalDuration;
        const entry = { time: currentTime, text: line };
        currentTime += duration;
        return entry;
    });
}
```
*Note: This is rarely perfect but creates a dynamic feel without manual work.*

### C. The "Lyric Tapper" Utility
You can create a small hidden tool in your site to sync them yourself in one pass:
1.  Load the audio and the plain text.
2.  Play the song.
3.  **Action**: Every time a new line starts, press **Space**.
4.  **Result**: The tool outputs a perfectly timed LRC file you can save.

