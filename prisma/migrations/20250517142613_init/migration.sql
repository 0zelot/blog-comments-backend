/*
  Warnings:

  - Added the required column `login` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `githubId` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "githubId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "displayName" TEXT,
    "ipAddress" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_users" ("banned", "displayName", "email", "githubId", "id", "ipAddress", "joinedAt", "lastSeenAt") SELECT "banned", "displayName", "email", "githubId", "id", "ipAddress", "joinedAt", "lastSeenAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
