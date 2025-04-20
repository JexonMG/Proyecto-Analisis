-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "carnetNumber" TEXT NOT NULL DEFAULT '',
    "career" TEXT NOT NULL DEFAULT '',
    "schedule" TEXT NOT NULL DEFAULT '',
    "hours" INTEGER NOT NULL DEFAULT 0,
    "profileImage" TEXT,
    "lastLogin" DATETIME NOT NULL
);
INSERT INTO "new_User" ("career", "carnetNumber", "id", "lastLogin", "password", "profileImage", "role", "schedule", "username") SELECT "career", "carnetNumber", "id", "lastLogin", "password", "profileImage", "role", "schedule", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_carnetNumber_key" ON "User"("carnetNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
