import { Job } from "bee-queue";
import debug from "debug";
import fs from "fs";
import FormData from "form-data";
import { prisma } from "../utils";
import axios from "axios";

const logger = debug("api:workers:uploadGif");

const uploadGifProcessor = async (job: Job<any>) => {
  try {
    const formData = new FormData();

    logger("Getting image...");

    formData.append(
      "photo",
      fs.createReadStream(`public/gifs/gif-${job.data.id}.gif`)
    );

    logger("Uploading image...");

    const response = await axios.post(
      "https://black_hole-3kf-1-g3800601.deta.app/api/integration/pm9pdj9x8aqx",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    logger("response:", response.data);

    logger("Updating db...");

    await prisma.session.update({
      data: {
        downloadUrl: response.data.url,
      },
      where: { id: job.data.id },
    });

    logger("Upload image complete!");
  } catch (error) {
    logger("Error:", error);

    throw error;
  }
};

export default uploadGifProcessor;
