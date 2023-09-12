import { Job } from "bee-queue";
import debug from "debug";
import fs from "fs";
import { prisma } from "../utils";
import axios from "axios";
import AWS from "aws-sdk";

const logger = debug("api:workers:uploadGif");

const uploadGifProcessor = async (job: Job<any>) => {
  try {
    logger("Getting image...");

    const s3 = new AWS.S3();

    const fileName = `gif-${job.data.id}.gif`;

    const fileData = fs.readFileSync(`public/gifs/gif-${job.data.id}.gif`);

    logger("Uploading image...");

    s3.upload(
      {
        Bucket: "domus-simulator-gif",
        Key: fileName,
        Body: fileData,
      },
      async (err, data) => {
        if (err) {
          logger("Upload Error:", err);

          return;
        }

        logger("response:", data);

        logger("Updating db...");

        await prisma.session.update({
          data: {
            downloadUrl: data.Location,
          },
          where: { id: job.data.id },
        });

        logger("Upload image complete!");
      }
    );
  } catch (error) {
    logger("Error:", error);

    throw error;
  }
};

export default uploadGifProcessor;
