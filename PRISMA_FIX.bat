@echo off
echo ========================================
echo Prisma Client Yeniden Kurulumu
echo ========================================
echo.

echo [1/3] npm install calistiriliyor...
call npm install
if %errorlevel% neq 0 (
    echo HATA: npm install basarisiz!
    pause
    exit /b 1
)

echo.
echo [2/3] Prisma Client generate ediliyor...
call npx prisma generate
if %errorlevel% neq 0 (
    echo HATA: Prisma generate basarisiz!
    pause
    exit /b 1
)

echo.
echo [3/3] Migration kontrol ediliyor...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo UYARI: Migration hatasi olabilir, devam ediliyor...
)

echo.
echo ========================================
echo Tamamlandi!
echo ========================================
echo.
echo Simdi Next.js sunucusunu baslatin:
echo npm run dev
echo.
pause













