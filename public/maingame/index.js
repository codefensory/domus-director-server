import VideosManagerFactory from "./factories/VideosManagerFactory.js";
import { globalState } from "./state.js";

const stateText = document.getElementById("state");

const infoText = document.getElementById("info");

let canPressButton = false;

async function start() {
  const videosManager = await VideosManagerFactory.create();

  videosManager.addOnChangeListener((video, index) => {
    globalState.currentVideo = index;

    canPressButton = video.loop;

    infoText.innerHTML = canPressButton ? "presiona" : "espera";

    stateText.innerHTML = index;
  });

  await videosManager.run();

  window.addEventListener("keydown", (event) => {
    // TODO: hacer el reinicio manual

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
