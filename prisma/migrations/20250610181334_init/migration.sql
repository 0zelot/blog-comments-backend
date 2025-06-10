-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" DATETIME,
    "postSlug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "previousContent" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "replyTo" INTEGER,
    CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("authorId", "content", "createdAt", "editedAt", "hidden", "id", "postSlug", "previousContent", "replyTo") SELECT "authorId", "content", "createdAt", "editedAt", "hidden", "id", "postSlug", "previousContent", "replyTo" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
CREATE UNIQUE INDEX "comments_id_key" ON "comments"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
