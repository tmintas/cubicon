/*
  Warnings:

  - You are about to drop the column `isPublished` on the `Contest` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Round` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Contest` DROP COLUMN `isPublished`,
    ADD COLUMN `status` ENUM('NEW', 'EDITING_RESULTS', 'PUBLISHED') NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE `Round` DROP COLUMN `type`,
    ADD COLUMN `format` ENUM('AVERAGE_OF_5', 'MEAN_OF_3') NOT NULL DEFAULT 'AVERAGE_OF_5';
