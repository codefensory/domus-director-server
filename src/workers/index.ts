import debug from "debug";

import { generatePreviewQueue, uploadGifQueue } from "./queues";
import uploadGifProcessor from "./uploadGifProcessor";
import generatePreviewProcessor from "./generatePreviewProcessor";

const logger = debug("api:workers");

logger("Starting uploadGifQueue worker...");
uploadGifQueue.process(uploadGifProcessor);

logger("Starting generatePreview worker...");
generatePreviewQueue.process(generatePreviewProcessor);
