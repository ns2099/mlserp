@echo off
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
echo ---------------------------------------------------
echo JAVA_HOME set to: %JAVA_HOME%
echo ANDROID_HOME set to: %ANDROID_HOME%
echo ---------------------------------------------------
echo.
echo Checking for Android SDK...
if not exist "%ANDROID_HOME%" (
    echo [ERROR] Android SDK not found at %ANDROID_HOME%
    echo Please open Android Studio first and complete the setup wizard to install the SDK.
    pause
    exit /b
)

echo Building APK...
cd android
call gradlew.bat assembleDebug

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b
)

echo.
echo [SUCCESS] APK created successfully!
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
pause
