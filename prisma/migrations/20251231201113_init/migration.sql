-- CreateTable
CREATE TABLE "Firma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "adres" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "YetkiliKisi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firmaId" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "pozisyon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "YetkiliKisi_firmaId_fkey" FOREIGN KEY ("firmaId") REFERENCES "Firma" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Teklif" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ad" TEXT,
    "firmaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "makinaId" TEXT,
    "durum" INTEGER NOT NULL DEFAULT 1,
    "toplamFiyat" REAL NOT NULL DEFAULT 0,
    "aciklama" TEXT,
    "teklifTarihi" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Teklif_makinaId_fkey" FOREIGN KEY ("makinaId") REFERENCES "Makina" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Teklif_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Teklif_firmaId_fkey" FOREIGN KEY ("firmaId") REFERENCES "Firma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeklifUrun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teklifId" TEXT NOT NULL,
    "urunAdi" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" REAL NOT NULL,
    "toplamFiyat" REAL NOT NULL,
    "aciklama" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeklifUrun_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Planlama" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teklifId" TEXT NOT NULL,
    "baslangicTarihi" DATETIME NOT NULL,
    "bitisTarihi" DATETIME NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'Planlandı',
    "aciklama" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Planlama_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Makina" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "model" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'Aktif',
    "aciklama" TEXT,
    "fotograf" TEXT,
    "toplamMaliyet" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MakinaBilesen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "makinaId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "miktar" INTEGER NOT NULL DEFAULT 1,
    "birimMaliyet" REAL NOT NULL DEFAULT 0,
    "paraBirimi" TEXT NOT NULL DEFAULT 'EUR',
    "toplamMaliyet" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MakinaBilesen_makinaId_fkey" FOREIGN KEY ("makinaId") REFERENCES "Makina" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MakinaAtama" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "makinaId" TEXT NOT NULL,
    "uretimId" TEXT NOT NULL,
    "baslangicTarihi" DATETIME NOT NULL,
    "bitisTarihi" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MakinaAtama_uretimId_fkey" FOREIGN KEY ("uretimId") REFERENCES "Uretim" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MakinaAtama_makinaId_fkey" FOREIGN KEY ("makinaId") REFERENCES "Makina" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Uretim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teklifId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'Üretimde',
    "baslangicTarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bitisTarihi" DATETIME,
    "aciklama" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Uretim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Uretim_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UretimGelisme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uretimId" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "tahminiIlerleme" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UretimGelisme_uretimId_fkey" FOREIGN KEY ("uretimId") REFERENCES "Uretim" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UrunGideri" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uretimId" TEXT NOT NULL,
    "giderAdi" TEXT NOT NULL,
    "tutar" REAL NOT NULL,
    "aciklama" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UrunGideri_uretimId_fkey" FOREIGN KEY ("uretimId") REFERENCES "Uretim" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DuzenlemeGecmisi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tablo" TEXT NOT NULL,
    "kayitId" TEXT NOT NULL,
    "kayitAdi" TEXT,
    "islem" TEXT NOT NULL,
    "kullaniciId" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "eskiDeger" TEXT,
    "yeniDeger" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DuzenlemeGecmisi_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sozlesme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teklifId" TEXT NOT NULL,
    "dosyaUrl" TEXT,
    "notlar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sozlesme_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "adSoyad" TEXT,
    "email" TEXT,
    "emailOnaylandiMi" BOOLEAN NOT NULL DEFAULT false,
    "emailOnayToken" TEXT,
    "emailOnayTarih" DATETIME,
    "ilkGirisVarmi" BOOLEAN NOT NULL DEFAULT false,
    "sifreSifirlamaToken" TEXT,
    "sifreSifirlamaTarih" DATETIME,
    "yetki" TEXT NOT NULL DEFAULT 'Kullanıcı',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UretimPlanlamaAdimi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teklifId" TEXT NOT NULL,
    "adimAdi" TEXT NOT NULL,
    "siraNo" INTEGER NOT NULL,
    "kullaniciId" TEXT NOT NULL,
    "makinaId" TEXT,
    "baslangicTarihi" DATETIME NOT NULL,
    "bitisTarihi" DATETIME NOT NULL,
    "isMaliyeti" REAL,
    "durum" TEXT NOT NULL DEFAULT 'Planlandı',
    "aciklama" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UretimPlanlamaAdimi_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UretimPlanlamaAdimi_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UretimPlanlamaAdimi_makinaId_fkey" FOREIGN KEY ("makinaId") REFERENCES "Makina" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SatinAlma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "genelGider" BOOLEAN NOT NULL DEFAULT false,
    "tekrarlayanMi" BOOLEAN NOT NULL DEFAULT false,
    "tekrarlamaSuresi" TEXT,
    "sonrakiTekrarTarihi" DATETIME,
    "uretimId" TEXT,
    "uretimPlanlamaAdimiId" TEXT,
    "urunAdi" TEXT NOT NULL,
    "miktar" REAL NOT NULL,
    "birim" TEXT NOT NULL DEFAULT 'Adet',
    "birimFiyat" REAL NOT NULL,
    "toplamFiyat" REAL NOT NULL,
    "tedarikciFirma" TEXT,
    "tedarikciIletisim" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'Planlandı',
    "siparisTarihi" DATETIME,
    "teslimTarihi" DATETIME,
    "faturaNo" TEXT,
    "aciklama" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SatinAlma_uretimId_fkey" FOREIGN KEY ("uretimId") REFERENCES "Uretim" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SatinAlma_uretimPlanlamaAdimiId_fkey" FOREIGN KEY ("uretimPlanlamaAdimiId") REFERENCES "UretimPlanlamaAdimi" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SatinAlmaTeklif" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "satinAlmaId" TEXT NOT NULL,
    "tedarikciAdi" TEXT NOT NULL,
    "teklifNo" TEXT NOT NULL,
    "birimFiyat" REAL NOT NULL,
    "toplamFiyat" REAL NOT NULL,
    "teslimSuresi" INTEGER NOT NULL,
    "odemeKosullari" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'Beklemede',
    "aciklama" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SatinAlmaTeklif_satinAlmaId_fkey" FOREIGN KEY ("satinAlmaId") REFERENCES "SatinAlma" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Odeme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tur" TEXT NOT NULL,
    "tutar" REAL NOT NULL,
    "paraBirimi" TEXT NOT NULL DEFAULT 'TRY',
    "odemeTarihi" DATETIME NOT NULL,
    "odemeYontemi" TEXT NOT NULL,
    "aciklama" TEXT,
    "teklifId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Odeme_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "Teklif" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Odeme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Sozlesme_teklifId_key" ON "Sozlesme"("teklifId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
