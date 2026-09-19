@echo off
echo ========================================
echo   ساخت APK اپلیکیشن حسابدار من
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js نصب نيست. لطفاً Node.js 18+ نصب کنيد.
    exit /b 1
)

:: Check Java
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java JDK نصب نيست. لطفاً JDK 17 نصب کنيد.
    exit /b 1
)

:: Check Android SDK
if "%ANDROID_HOME%"=="" (
    echo [WARNING] متغير ANDROID_HOME تنظيم نيست.
    echo لطفاً Android SDK را نصب کنيد.
    exit /b 1
)

echo [OK] پيش‌نيازها بررسي شد.
echo.

:: Install dependencies
echo نصب وابستگي‌هاي npm...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] خطا در نصب وابستگي‌ها
    exit /b 1
)
echo.

:: Build web app
echo ساخت وب‌اپليکيشن...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] خطا در ساخت وب‌اپليکيشن
    exit /b 1
)
echo.

:: Add Android platform
if not exist "android" (
    echo اضافه کردن پلتفرم اندرويد...
    call npx cap add android
) else (
    echo پلتفرم اندرويد موجود است.
)
echo.

:: Sync Capacitor
echo همگام‌سازي Capacitor...
call npx cap sync android
echo.

:: Build APK
echo ساخت APK...
cd android
call gradlew.bat assembleDebug
cd ..
echo.

:: Check result
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
if exist "%APK_PATH%" (
    echo ========================================
    echo   APK با موفقيت ساخته شد!
    echo ========================================
    echo مسير فايل: %APK_PATH%
    echo.
    echo براي نصب روي دستگاه:
    echo   adb install %APK_PATH%
) else (
    echo [ERROR] خطا در ساخت APK
    exit /b 1
)
