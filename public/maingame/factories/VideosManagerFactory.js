import VideosManager from "../video/VideosManager.js";
import Video from "../video/Video.js";
import VideoEvent from "../video/VideoEvent.js";
import { globalState } from "../state.js";
import events from "../events.js";

const URL = "http://localhost:8080";

class VideosManagerFactory {
  static async create() {
    const medias = [
      document.getElementById("media1"),
      document.getElementById("media2"),
      document.getElementById("media3"),
    ];

    const videosData = await fetch(`${URL}/public/maingame/assets/videoConfig.json`).then((response) =>
      response.json()
    );

    console.log(videosData);

    const videosByName = {};

    const videos = [];

    for (let videoData of videosData.videos) {
      const video = new Video(videoData.src, videoData.loop);

      videosByName[videoData.name] = video;

      videos.push(video);
    }

    const commands = await fetch(`${URL}/public/config.json`).then((response) => response.json());

    console.log(commands);

    Object.keys(commands).forEach((key) => {
      const { clip, clientCommand } = commands[key];

      videosByName[clip.name].addTimeEvent(
        new VideoEvent(clip.time, () => {
          console.log("event: ", {
            name: clip.name,
            command: key,
            time: clip.time,
            clientCommand: clientCommand,
          });

          fetch(`${URL}/command/${key}`);

          events[clientCommand]?.();
        })
      );
    });

    return new VideosManager(videos, medias);
  }
}

export default VideosManagerFactory;
