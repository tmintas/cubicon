/*
  Warnings:

  - You are about to drop the column `roundType` on the `Round` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Round` DROP COLUMN `roundType`,
    ADD COLUMN `type` ENUM('AVERAGE_OF_5', 'MEAN_OF_3') NOT NULL DEFAULT 'AVERAGE_OF_5';
