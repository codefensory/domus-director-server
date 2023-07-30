import fs from "fs";
import { Job } from "bee-queue";
import { exec } from "child_process";
import debug from "debug";

import { prisma } from "../utils";

const logger = debug("api:workers:generatePreview");

const generatePreviewProcessor = async (job: Job<any>) => {
  return new Promise((resolve, reject) => {
    logger("Generating preview %s...", job.data.id);

    const previewPath = `public/gifs/preview-${job.data.id}.gif`;

    try {
      fs.rmSync(previewPath);
    } catch {}

    exec(
      `ffmpeg -i "public/gifs/gif-${job.data.id}.gif" -vf "fps=fps=1,scale=200:-1" ${previewPath}`,
      async (error) => {
        if (error) return reject(error);

        await prisma.session.update({
          data: { preview: previewPath },
          where: { id: job.data.id },
        });

        logger("Generating preview %s complete!", job.data.id);

        resolve("Correct");
      }
    );
  });
};

export default generatePreviewProcessor;
