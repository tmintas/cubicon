-- DropForeignKey
ALTER TABLE `Result` DROP FOREIGN KEY `Result_roundId_fkey`;

-- DropForeignKey
ALTER TABLE `Round` DROP FOREIGN KEY `Round_contestId_fkey`;

-- AddForeignKey
ALTER TABLE `Round` ADD CONSTRAINT `Round_contestId_fkey` FOREIGN KEY (`contestId`) REFERENCES `Contest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `Round`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
