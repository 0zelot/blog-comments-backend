-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authorId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" DATETIME,
    "postSlug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "previousContent" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "replyTo" INTEGER,
    CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("authorId", "content", "createdAt", "editedAt", "id", "postSlug", "replyTo") SELECT "authorId", "content", "createdAt", "editedAt", "id", "postSlug", "replyTo" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
CREATE UNIQUE INDEX "comments_id_key" ON "comments"("id");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_users" ("displayName", "email", "id", "ipAddress", "joinedAt", "lastLoginAt") SELECT "displayName", "email", "id", "ipAddress", "joinedAt", "lastLoginAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
