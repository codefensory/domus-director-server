/*
  Warnings:

  - You are about to drop the column `gifId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `Gif` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_gifId_fkey`;

-- AlterTable
ALTER TABLE `Session` DROP COLUMN `gifId`,
    ADD COLUMN `downloadUrl` VARCHAR(191) NULL,
    ADD COLUMN `preview` VARCHAR(191) NULL,
    ADD COLUMN `url` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Gif`;
