/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "carnetNumber" TEXT NOT NULL DEFAULT '',
    "career" TEXT NOT NULL DEFAULT '',
    "schedule" TEXT NOT NULL DEFAULT '',
    "profileImage" TEXT,
    "lastLogin" DATETIME NOT NULL
);
INSERT INTO "new_User" ("id", "lastLogin", "name", "password", "profileImage", "role", "username") SELECT "id", "lastLogin", "name", "password", "profileImage", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_carnetNumber_key" ON "User"("carnetNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
