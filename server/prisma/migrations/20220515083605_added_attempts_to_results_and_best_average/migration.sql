/*
  Warnings:

  - You are about to drop the column `attempt` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `record` on the `Result` table. All the data in the column will be lost.
  - Added the required column `attempt1` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attempt2` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attempt3` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attempt4` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attempt5` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `average` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `best` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performedByStr` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Result` DROP COLUMN `attempt`,
    DROP COLUMN `record`,
    ADD COLUMN `attempt1` INTEGER NOT NULL,
    ADD COLUMN `attempt2` INTEGER NOT NULL,
    ADD COLUMN `attempt3` INTEGER NOT NULL,
    ADD COLUMN `attempt4` INTEGER NOT NULL,
    ADD COLUMN `attempt5` INTEGER NOT NULL,
    ADD COLUMN `average` INTEGER NOT NULL,
    ADD COLUMN `best` INTEGER NOT NULL,
    ADD COLUMN `performedByStr` VARCHAR(191) NOT NULL;
