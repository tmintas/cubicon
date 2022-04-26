/*
  Warnings:

  - You are about to drop the column `location` on the `Contest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Contest` DROP COLUMN `location`,
    ADD COLUMN `city` VARCHAR(191) NULL;
