import fs from "fs";
import debug from "debug";
import { prisma } from "../utils";
import { exec } from "child_process";
import { globalState } from "../state";

const logger = debug("api:events:hacking");

const record = async (sessionId: number) => {
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

  if (!fs.existsSync(framesPath)) {
    fs.mkdirSync(framesPath, { recursive: true });
  }

  globalState.recordCount++;

  exec(`${process.env.FFMPEG_CAMERA} "${framesPath}/frame-${globalState.recordCount}%04d.png"`, async (error) => {
    globalState.processing = false;

    if (error) {
      logger("Error:", error);

      return;
    }
  });
};

export default record;
