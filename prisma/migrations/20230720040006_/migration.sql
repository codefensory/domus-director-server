/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `Gif` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gifId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Gif` ADD COLUMN `sessionId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Gif_sessionId_key` ON `Gif`(`sessionId`);

-- CreateIndex
CREATE UNIQUE INDEX `Session_gifId_key` ON `Session`(`gifId`);

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_gifId_fkey` FOREIGN KEY (`gifId`) REFERENCES `Gif`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
