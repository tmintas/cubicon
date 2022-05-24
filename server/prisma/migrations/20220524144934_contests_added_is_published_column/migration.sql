/*
  Warnings:

  - Added the required column `isPublished` to the `Contest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Contest` ADD COLUMN `isPublished` BOOLEAN NOT NULL;

UPDATE `Contest`
SET isPublished = false;