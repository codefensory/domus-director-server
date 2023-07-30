import express from "express";
import debug from "debug";
import { Result, Err, Ok } from "oxide.ts";
import BeeQueue from "bee-queue";
import { exec } from "child_process";
import fs from "fs";

import { prisma } from "./utils";
import { uploadGifQueue } from "./workers/queues";

const logger = debug("api:main");

const app = express();

const port = (process.env.PORT || 8080) as number;

const takePhotoQueue = new BeeQueue("take-photo");

let processing = false;

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

app.use(express.static('public'))

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

      const gifPath = `gifs/gif-${id}.gif`;

      try {
        fs.rmSync(gifPath);
      } catch {}

      exec(
        `ffmpeg -f v4l2 -video_size 640x480 -i /dev/video0 -i resources/overlay.png -ss 1 -t 5 -filter_complex "[0:v] fps=4,overlay=0:0" "${gifPath}"`,
        (error) => {
          processing = false;

          if (error) {
            console.error(`error: ${error.message}`);

            return;
          }

          uploadGifQueue.createJob({ id }).save();
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

function init() {
  app.listen(port, "0.0.0.0", () => {
    logger(`Started server in 0.0.0.0:${port}`);
  });
}

init();
