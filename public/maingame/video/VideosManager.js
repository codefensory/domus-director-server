class VideosManager {
  constructor(videos, medias) {
    this.videos = videos;
    /** @type {HTMLMediaElement[]} */
    this.medias = medias;
    this.currentMedia = 0;
    this.currentVideo = 0;

    this.onChangeListeners = [];
  }

  async run() {
    this.medias[0].src = this.videos[0].src;

    this.medias[0].loop = this.videos[0].loop;

    for (let i = 0; i < this.medias.length; i++) {
      const media = this.medias[i];

      media.addEventListener("ended", this.nextVideo.bind(this));

      media.addEventListener("timeupdate", () => this.handleTimeUpdate(i));
    }

    await this.prepare();
  }

  async prepare() {
    const media = this.medias[this.currentMedia];

    const nextMediaIndex = (this.currentMedia + 1) % this.medias.length;

    const nextMedia = this.medias[nextMediaIndex];

    const nextVideoIndex = (this.currentVideo + 1) % this.videos.length;

    const video = this.videos[this.currentVideo];

    video.prepare();

    this.emitOnChangeListeners(video, this.currentVideo);

    await media.play();

    nextMedia.muted = true;

    media.muted = false;

    media.style.opacity = 1;

    this.currentMedia = nextMediaIndex;

    // Wait for the video to be ready
    return new Promise((resolve) => {
      setTimeout(() => {
        nextMedia.style.opacity = 0;
        nextMedia.src = this.videos[nextVideoIndex].src;
        nextMedia.loop = this.videos[nextVideoIndex].loop;

        nextMedia.pause();
        nextMedia.currentTime = 0;
        resolve();
      }, 100);
    });
  }

  nextVideo() {
    this.videos[this.currentVideo].end();

    this.currentVideo = (this.currentVideo + 1) % this.videos.length;

    this.prepare();
  }

  goToVideo(index) {
    this.videos[this.currentVideo].end();

    this.currentVideo = index;

    this.prepare();
  }

  handleTimeUpdate(mediaIndex) {
    if (mediaIndex === this.currentMedia) {
      return;
    }

    const time = this.medias[mediaIndex].currentTime;

    this.videos[this.currentVideo].update(time);
  }

  emitOnChangeListeners(video, currentVideo) {
    for (const listener of this.onChangeListeners) {
      listener(video, currentVideo);
    }
  }

  addOnChangeListener(listener) {
    this.onChangeListeners.push(listener);
  }
}

export default VideosManager;
