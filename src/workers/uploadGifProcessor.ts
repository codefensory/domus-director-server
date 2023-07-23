import { Job } from "bee-queue";
import debug from "debug";
import fs from "fs";
import { prisma } from "../utils";

const logger = debug("api:workers:uploadGif");

const uploadGifProcessor = async (job: Job<any>) => {
  const fromData = new FormData();

  const gif = await fs.promises.readFile(`images/${job.id}.gif`);

  fromData.append("photo", gif.toString("base64"));

  const response = await fetch(
    "https://black_hole-3kf-1-g3800601.deta.app/api/integration/pm9pdj9x8aqx",
    { body: fromData, method: "POST" }
  ).then((res) => res.json());

  await prisma.gif.create({
    data: {
      url: response.url,
      sessionId: job.id as any as number,
    },
  });
};

export default uploadGifProcessor;
