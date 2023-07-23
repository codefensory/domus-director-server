import { uploadGifQueue } from "./queues";
import uploadGifProcessor from "./uploadGifProcessor";
import debug from "debug";

const logger = debug("api:workers");

logger("Starting uploadGifQueue worker...");

uploadGifQueue.process(uploadGifProcessor);
