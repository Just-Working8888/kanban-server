/*
  Warnings:

  - You are about to drop the column `staus` on the `SubTask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SubTask" DROP COLUMN "staus",
ADD COLUMN     "status" "SubTaskStatus" NOT NULL DEFAULT 'INCOMPLETE';
