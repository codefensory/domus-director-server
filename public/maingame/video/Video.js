class Video {
  constructor(src, loop = false) {
    this.src = src;
    this.loop = loop;

    this.events = [];
  }

  addTimeEvent(event) {
    this.events.push(event);
  }

  update(time) {
    for (let event of this.events) {
      event.update(time);
    }
  }

  prepare() {
    for (let event of this.events) {
      event.prepare();
    }
  }

  end() {
    for (let event of this.events) {
      event.end();
    }
  }
}

export default Video;
