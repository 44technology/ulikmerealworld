@echo off
echo ========================================
echo Admin Portal Değişikliklerini Push Etme
echo ========================================
echo.

cd /d "c:\Users\ALI\Downloads\meetupapp\vibe-connect-main"

echo [1/3] Değişiklikleri stage'e ekliyorum...
git add admin-portal/

echo.
echo [2/3] Commit ediyorum...
git commit -m "Fix: Admin portal Netlify deployment configuration and ticket system"

echo.
echo [3/3] GitHub'a push ediyorum...
git push origin main

echo.
echo ========================================
echo Tamamlandi!
echo ========================================
echo.
echo Simdi Netlify Dashboard'da deploy edin.
pause
