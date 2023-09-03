import VideosManagerFactory from "./factories/VideosManagerFactory.js";
import { globalState } from "./state.js";

let canPressButton = false;

async function start() {
  const videosManager = await VideosManagerFactory.create();

  videosManager.addOnChangeListener((video, index) => {
    globalState.currentVideo = index;

    canPressButton = video.loop;

    console.log("video: ", index);

    console.log(canPressButton ? "presiona" : "espera");
  });

  await videosManager.run();

  window.addEventListener("keydown", (event) => {
    if (event.key === "p") {
      window.location.reload();

      return;
    }

    if (!canPressButton) {
      return;
    }

    switch (event.key) {
      case "q":
        if (globalState.currentVideo === 0) {
          videosManager.nextVideo();
        }
        break;

      case "v":
        if (globalState.currentVideo === 3) {
          videosManager.nextVideo();
        }
        break;

      case "r":
        if (globalState.currentVideo === 7) {
          videosManager.nextVideo();
        }
        break;

      default:
        break;
    }
  });
}

start();
