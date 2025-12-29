@echo off
echo ========================================
echo Odeme Verileri Olusturuluyor
echo ========================================
echo.
echo Seed script calistiriliyor...
echo.

call npx tsx prisma/seed.ts

echo.
echo ========================================
echo Tamamlandi!
echo ========================================
echo.
echo Odeme verileri olusturuldu.
echo Dashboard sayfasinda odeme dengesini gorebilirsiniz.
echo.
pause













