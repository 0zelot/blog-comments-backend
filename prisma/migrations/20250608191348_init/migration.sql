/*
  Warnings:

  - You are about to drop the column `banned` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "githubId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "displayName" TEXT,
    "ipAddress" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("displayName", "email", "githubId", "id", "ipAddress", "joinedAt", "lastSeenAt", "login") SELECT "displayName", "email", "githubId", "id", "ipAddress", "joinedAt", "lastSeenAt", "login" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
