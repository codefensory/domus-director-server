import fs from "fs";
import debug from "debug";
import { prisma, sendArduinoCommand } from "../utils";
import { exec } from "child_process";
import { generatePreviewQueue, uploadGifQueue } from "../workers/queues";

const logger = debug("api:events:hacking");

let processing = false;

const startCamera = async (sessionId: number) => {
  if (!sessionId) {
    logger("no session id");

    return;
  }

  await prisma.session.update({
    data: { state: 1 },
    where: { id: sessionId },
  });

  if (processing) {
    logger("hacking bussy");

    return;
  }

  const id = sessionId;

  processing = true;

  const framesPath = `resources/frames/session-${id}`;

  const gifPath = `public/gifs/gif-${id}.gif`;

  if (!fs.existsSync("public/gifs")) {
    fs.mkdirSync("public/gifs", { recursive: true });
  }

  if (fs.existsSync(framesPath)) {
    fs.rmSync(framesPath, { recursive: true });
  }

  fs.mkdirSync(framesPath, { recursive: true });

  exec(
    `${process.env.FFMPEG_CAMERA} "${framesPath}/frame%04d.png" && ${process.env.GIFSKI} -o public/gifs/gif-${id}.gif resources/frames/session-${id}/frame*.png`,
    async (error) => {
      processing = false;

      if (error) {
        logger("Error:", error);

        return;
      }

      logger("Gif capture complete!");

      await prisma.session.update({
        data: {
          url: gifPath,
        },
        where: {
          id,
        },
      });

      uploadGifQueue.createJob({ id }).save();

      generatePreviewQueue.createJob({ id }).save();

      try {
        fs.rmSync(framesPath, { recursive: true });
      } catch {}
    }
  );
};

export default startCamera;
