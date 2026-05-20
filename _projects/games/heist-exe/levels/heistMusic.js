console.log("heistMusic.js loaded from _projects/PeppaPigGame/levels");
class heistMusic {
  constructor() {
    this.audio = null;
    this.started = false;
    this.isPlaying = false;
 
    // Rotate through several search terms so the vibe stays fresh across sessions
    const queries = [
      'dark ambient instrumental',
      'eerie atmospheric instrumental',
      'mysterious cinematic instrumental',
      'haunting piano instrumental',
      'gothic ambient instrumental',
    ];
    const picked = queries[Math.floor(Math.random() * queries.length)];
    this.endpoint =
      `https://itunes.apple.com/search?term=${encodeURIComponent(picked)}&entity=song&limit=25`;
 
    this.userActivated = false;
    this.activateFromUserGesture = this.activateFromUserGesture.bind(this);
    this.createToggleButton();
  }
 
  createToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'peppa-music-toggle';
    btn.innerHTML = '🔇 Music';
    btn.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 10000;
      padding: 8px 16px;
      font-size: 14px;
      font-family: sans-serif;
      background: #3a2a4d;
      color: #c9b8e8;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    `;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMusic();
    });
    document.body.appendChild(btn);
    this.toggleBtn = btn;
  }
 
  async fetchPreviewUrl() {
    const response = await fetch(this.endpoint);
    if (!response.ok) {
      throw new Error('API request failed (' + response.status + ')');
    }
    const data = await response.json();
    const tracks = (data && Array.isArray(data.results)) ? data.results : [];
 
    // Collect all tracks that have a preview and are likely instrumental:
    // filter out anything whose trackName or artistName hints at lyrics/vocals.
    const VOCAL_HINTS = /\b(feat|ft\.|vocal|voice|singer|rap|hip.?hop|pop|remix)\b/i;
    const candidates = tracks.filter((item) => {
      if (!item || !item.previewUrl) return false;
      const name = (item.trackName || '') + ' ' + (item.artistName || '');
      return !VOCAL_HINTS.test(name);
    });
 
    // Fall back to any track with a previewUrl if the filter removed everything
    const pool = candidates.length > 0 ? candidates : tracks.filter(t => t && t.previewUrl);
 
    if (pool.length === 0) {
      throw new Error('No playable preview URL found in API response');
    }
 
    // Pick randomly so repeated sessions feel different
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    console.log(`Background music: "${chosen.trackName}" by ${chosen.artistName}`);
    return chosen.previewUrl;
  }
 
  async startMusic() {
    if (this.started || !this.userActivated) return;
    try {
      const previewUrl = await this.fetchPreviewUrl();
      this.audio = new Audio(previewUrl);
      this.audio.volume = 0.3;
      this.audio.loop = true;
      await this.audio.play();
      this.started = true;
      this.isPlaying = true;
      this.removeGestureListeners();
      this.updateButton();
      console.log('Background music: playback started');
    } catch (error) {
      console.warn('Background music: failed to start', error);
    }
  }
 
  stopMusic() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      this.updateButton();
      console.log('Background music: playback stopped');
    }
  }
 
  async toggleMusic() {
    if (!this.started) {
      this.userActivated = true;
      await this.startMusic();
    } else if (this.isPlaying) {
      this.stopMusic();
    } else {
      if (this.audio) {
        await this.audio.play();
        this.isPlaying = true;
        this.updateButton();
        console.log('Background music: playback resumed');
      }
    }
  }
 
  updateButton() {
    if (this.toggleBtn) {
      this.toggleBtn.innerHTML = this.isPlaying ? '🔊 Music' : '🔇 Music';
    }
  }
 
  activateFromUserGesture = async () => {
    this.userActivated = true;
    await this.startMusic();
  }
 
  addGestureListeners() {
    window.addEventListener('click', this.activateFromUserGesture, { once: true });
    window.addEventListener('keydown', this.activateFromUserGesture, { once: true });
    window.addEventListener('touchstart', this.activateFromUserGesture, { once: true });
  }
 
  removeGestureListeners() {
    window.removeEventListener('click', this.activateFromUserGesture);
    window.removeEventListener('keydown', this.activateFromUserGesture);
    window.removeEventListener('touchstart', this.activateFromUserGesture);
  }
}
 
export default heistMusic;