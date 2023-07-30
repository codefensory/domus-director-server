import BeeQueue from "bee-queue";

export const uploadGifQueue = new BeeQueue("upload-gif");
export const generatePreviewQueue = new BeeQueue("generate-preview");
