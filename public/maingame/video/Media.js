class Media {
  constructor(media) {
    /** @type {HTMLMediaElement} */
    this.media = media;
  }

  preload(video) {
    if (this.media.src === video.src) {
      return;
    }

    this.media.muted = true;

    return new Promise((resolve) => {
      setTimeout(() => {
        this.media.style.opacity = 0;
        this.media.src = video.src;
        this.media.loop = video.loop;

        this.media.pause();
        this.media.currentTime = 0;
        resolve();
      }, 100);
    });
  }
}

export default Media;
