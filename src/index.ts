import express from "express";
import debug from "debug";
import { Result, Err, Ok } from "oxide.ts";
import BeeQueue from "bee-queue";
import { exec } from "child_process";
import fs from "fs";
import cors from "cors";

import { prisma } from "./utils";
import { generatePreviewQueue, uploadGifQueue } from "./workers/queues";

const logger = debug("api:main");

const app = express();

const port = (process.env.PORT || 8080) as number;

const takePhotoQueue = new BeeQueue("take-photo");

let processing = false;

const ITEMS_PER_PAGE = 15;

async function sendArduinoCommand(
  command: string
): Promise<Result<Response, Error>> {
  const responseResult = await Result.safe(
    fetch("http://0.0.0.0:8080/arduino")
  );

  if (responseResult.isErr()) {
    const error = responseResult.unwrapErr();

    logger(error);

    return Err(error);
  }

  const response = responseResult.unwrap();

  if (!response.ok) {
    logger("Error: arduino error");

    return Err(new Error("arduino error"));
  }

  return Ok(response);
}

app.use(cors({ origin: "*" }));

app.use("/public", express.static("public"));

app.get("/start", async (_, res) => {
  const session = await prisma.session.create({
    data: {
      state: 0,
    },
  });

  const result = await sendArduinoCommand("");

  if (result.isErr()) {
    res.send(500);

    return;
  }

  res.json({ id: session.id });
});

app.post("/update/:id/:state", async (req, res) => {
  const id = parseInt(req.params.id);

  const state = parseInt(req.params.state);

  if (isNaN(state) || isNaN(id)) {
    res.status(400).send("INVALID");

    return;
  }

  const updateGame = async (command?: string, takePhoto: boolean = false) => {
    await prisma.session.update({
      data: { state },
      where: { id },
    });

    if (takePhoto) {
      if (processing) {
        res.status(500).send("bussy");

        return;
      }

      processing = true;

      const framesPath = `resources/frames/session-${id}`;

      const gifPath = `public/gifs/gif-${id}.gif`;

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

      setTimeout(() => sendArduinoCommand(command), 2500);

      res.send(200);

      return;
    }

    const result = await sendArduinoCommand(command);

    if (result.isErr()) {
      res.send(500);

      return;
    }

    res.send(200);
  };

  switch (state) {
    case 1:
      await updateGame("", true);

      logger("hacking game");

      await takePhotoQueue.createJob({ id }).save();

      break;
    case 2:
      await updateGame();

      logger("stop hacking game");

      break;
    case 3:
      await updateGame();

      logger("explotion");

      break;
    case 4:
      await updateGame();

      logger("end");
      break;
    default:
      res.status(400).send("STATUS NOT VALID");

      return;
  }
});

app.get("/arduino", (_, res) => {
  logger("arduino received, simulating...");

  res.send("OK");
});

app.get("/sessions/:page", async (req, res) => {
  const page = req.params.page;

  const sessions = await prisma.session.findMany({
    where: {
      state: { gte: 1 },
    },
    orderBy: {
      id: "desc",
    },
    take: ITEMS_PER_PAGE,
    skip: Number(page) * ITEMS_PER_PAGE,
  });

  const total = await prisma.session.count({
    where: {
      state: { gte: 1 },
    },
  });

  res.json({
    sessions,
    total,
  });
});

function init() {
  app.listen(port, "0.0.0.0", () => {
    logger(`Started server in 0.0.0.0:${port}`);
  });
}

init();
