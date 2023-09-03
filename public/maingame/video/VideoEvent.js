class VideoEvent {
  constructor(time, event) {
    this.time = time;
    this.event = event;
    this.prepared = true;
  }

  update(time) {
    if (time >= this.time && this.prepared) {
      this.event();

      this.prepared = false;
    }
  }

  prepare() {
    this.prepared = true;
  }

  end() {
    this.prepared = false;
  }
}

export default VideoEvent;
