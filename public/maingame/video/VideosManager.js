import Media from "./Media.js";
import { globalState } from "../state.js";

class VideosManager {
  constructor(videos, medias) {
    this.videos = videos;
    /** @type {Media[]} */
    this.medias = medias.map((media) => new Media(media));
    this.currentMedia = 0;
    this.currentVideo = 0;

    this.onChangeListeners = [];
  }

  async run() {
    this.medias[0].media.src = this.videos[0].src;

    this.medias[0].media.loop = this.videos[0].loop;

    for (let i = 0; i < this.medias.length; i++) {
      const media = this.medias[i].media;

      media.addEventListener("ended", this.nextVideo.bind(this));

      media.addEventListener("timeupdate", () => this.handleTimeUpdate(media));
    }

    await this.prepare();
  }

  async prepare() {
    const media = this.medias[0];

    const video = this.videos[this.currentVideo];

    video.prepare();

    this.emitOnChangeListeners(video, this.currentVideo);

    await media.media.play();

    const promise = this.preloadMedias();

    media.media.muted = false;

    media.media.style.opacity = 1;

    return promise;
  }

  async preloadMedias() {
    const promises = [];

    for (let i = 1; i < this.medias.length; i++) {
      const video = this.videos[(this.currentVideo + i) % this.videos.length];

      promises.push(this.medias[i].preload(video));
    }

    globalState.canPress = false;

    const result = await Promise.all(promises);

    globalState.canPress = true;

    return result;
  }

  nextVideo() {
    this.videos[this.currentVideo].end();

    this.currentVideo = (this.currentVideo + 1) % this.videos.length;

    const firstMedia = this.medias.splice(0, 1);

    this.medias.push(...firstMedia);

    this.prepare();
  }

  skipAndNextVideo() {
    this.videos[this.currentVideo].end();

    this.currentVideo = (this.currentVideo + 2) % this.videos.length;

    const firstMedia = this.medias.splice(0, 2);

    this.medias.push(...firstMedia);

    this.prepare();
  }

  handleTimeUpdate(media) {
    if (!media.src.includes(this.videos[this.currentVideo].src)) {
      return;
    }

    const time = media.currentTime;

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
