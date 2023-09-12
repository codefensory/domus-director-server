import fs from "fs";
import debug from "debug";
import { prisma } from "../utils";
import { exec } from "child_process";
import { generatePreviewQueue, uploadGifQueue } from "../workers/queues";
import { globalState } from "../state";

const logger = debug("api:events:hacking");

const recordAndSave = async (sessionId: number) => {
  if (!sessionId) {
    logger("no session id");

    return;
  }

  await prisma.session.update({
    data: { state: 1 },
    where: { id: sessionId },
  });

  if (globalState.processing) {
    logger("hacking bussy");

    return;
  }

  const id = sessionId;

  globalState.processing = true;

  const framesPath = `resources/frames/session-${id}`;

  const gifPath = `public/gifs/gif-${id}.gif`;

  if (!fs.existsSync("public/gifs")) {
    fs.mkdirSync("public/gifs", { recursive: true });
  }

  if (!fs.existsSync(framesPath)) {
    fs.mkdirSync(framesPath, { recursive: true });
  }

  globalState.recordCount++;

  exec(
    `${process.env.FFMPEG_CAMERA} "${framesPath}/frame-${globalState.recordCount}%04d.png" && ${process.env.GIFSKI} -o public/gifs/gif-${id}.gif resources/frames/session-${id}/frame-*.png`,
    async (error) => {
      globalState.processing = false;

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

      globalState.recordCount = 0;

      try {
        fs.rmSync(framesPath, { recursive: true });
      } catch {}
    }
  );
};

export default recordAndSave;
