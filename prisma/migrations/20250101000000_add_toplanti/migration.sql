-- CreateTable
CREATE TABLE "Toplanti" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firmaId" TEXT NOT NULL,
    "yetkiliKisiId" TEXT,
    "toplantiTarihi" DATETIME NOT NULL,
    "konu" TEXT,
    "notlar" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Toplanti_firmaId_fkey" FOREIGN KEY ("firmaId") REFERENCES "Firma" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Toplanti_yetkiliKisiId_fkey" FOREIGN KEY ("yetkiliKisiId") REFERENCES "YetkiliKisi" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Toplanti_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Toplanti_firmaId_idx" ON "Toplanti"("firmaId");
CREATE INDEX "Toplanti_yetkiliKisiId_idx" ON "Toplanti"("yetkiliKisiId");
CREATE INDEX "Toplanti_userId_idx" ON "Toplanti"("userId");
CREATE INDEX "Toplanti_toplantiTarihi_idx" ON "Toplanti"("toplantiTarihi");

