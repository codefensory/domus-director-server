import VideosManagerFactory from "./factories/VideosManagerFactory.js";
import { globalState } from "./state.js";

let canPressButton = false;

let greenCount = 0;

let currTimeout = null;

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
    if (event.key === "4") {
      window.location.reload();

      return;
    }

    switch (event.key) {
      case "1":
        if (globalState.currentVideo === 0) {
          videosManager.nextVideo();
        }
        break;

      case "2":
        if (globalState.currentVideo === 2 && globalState.canSkip) {
          videosManager.skipAndNextVideo();
          globalState.canSkip = false;
        }

        if (globalState.currentVideo === 3) {
          videosManager.nextVideo();
        }

        greenCount++;

        if (greenCount >= 3) {
          window.location.reload();
        } else {
          clearTimeout(currTimeout);

          currTimeout = setTimeout(() => {
            greenCount = 0;
          }, 500);
        }

        break;

      case "3":
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
