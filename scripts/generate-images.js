const { exec } = require("child_process");

let processing = false;

function process() {
  if (processing) {
    console.log("bussy");

    return;
  }

  processing = true;

  exec(
    'ffmpeg -f v4l2 -video_size 640x480 -i /dev/video0 -i resources/overlay.png -ss 1 -t 5 -filter_complex "[0:v] fps=4,overlay=0:0" "gifs/output.gif"',
    (error) => {
      processing = false;
      if (error) {
        console.error(`error: ${error.message}`);

        return;
      }
    }
  );

  setTimeout(() => {
    console.log("send to arduino");
  }, 2500);
}

process();

setTimeout(process, 1000);
