import express from "express";
import debug from "debug";
import cors from "cors";

import { prisma, sendArduinoCommand, events } from "./utils";
import { globalState } from "./state";

const logger = debug("api:main");

const app = express();

const port = (process.env.PORT || 8080) as number;

const ITEMS_PER_PAGE = 12;

app.use(cors({ origin: "*" }));

app.use("/public", express.static("public"));

app.get("/command/:event", async (req, res) => {
  const event = req.params.event;

  const result = await sendArduinoCommand(event);

  if (result.isErr()) {
    logger("Error sending command to arduino", result.unwrapErr());
  }

  await events[event]?.(globalState.currentSessionId);

  res.status(200).send("OK");
});

app.get("/arduino", (req, res) => {
  logger("arduino received, simulating...", { commands: req.query });

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

app.delete("/sessions/", async (req, res) => {
  const ids = (req.query.ids as string).split(",");

  logger("ids", ids);

  const result = await prisma.session.deleteMany({
    where: {
      id: {
        in: ids.map((id) => Number(id)),
      },
    },
  });

  logger("result", result);

  res.send("ok");
});

function init() {
  app.listen(port, "0.0.0.0", () => {
    logger(`Started server in 0.0.0.0:${port}`);
  });
}

init();
