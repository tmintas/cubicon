-- AlterTable
ALTER TABLE `Round` ADD COLUMN `roundType` ENUM('AVERAGE_OF_5', 'MEAN_OF_3') NOT NULL DEFAULT 'AVERAGE_OF_5';
