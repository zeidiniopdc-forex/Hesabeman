#!/bin/bash

echo "🔨 ساخت APK اپلیکیشن حسابدار من"
echo "================================"

# Check prerequisites
echo "📋 بررسی پیش‌نیازها..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js نصب نیست. لطفاً Node.js 18+ نصب کنید."
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "❌ Java JDK نصب نیست. لطفاً JDK 17 نصب کنید."
    exit 1
fi

if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  متغیر ANDROID_HOME تنظیم نیست. لطفاً Android SDK را نصب و ANDROID_HOME را تنظیم کنید."
    echo "   export ANDROID_HOME=/path/to/android/sdk"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
    exit 1
fi

echo "✅ پیش‌نیازها بررسی شد."
echo ""

# Step 1: Install dependencies
echo "📦 نصب وابستگی‌های npm..."
npm install
echo ""

# Step 2: Build web app
echo "🌐 ساخت وب‌اپلیکیشن..."
npm run build
echo ""

# Step 3: Add Android platform (if not exists)
if [ ! -d "android" ]; then
    echo "📱 اضافه کردن پلتفرم اندروید..."
    npx cap add android
else
    echo "📱 پلتفرم اندروید موجود است."
fi
echo ""

# Step 4: Sync Capacitor
echo "🔄 همگام‌سازی Capacitor..."
npx cap sync android
echo ""

# Step 5: Build APK
echo "🔧 ساخت APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug
cd ..
echo ""

# Check if APK was built
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK با موفقیت ساخته شد!"
    echo "📍 مسیر فایل: $APK_PATH"
    echo "📦 اندازه فایل: $(du -h "$APK_PATH" | cut -f1)"
    echo ""
    echo "📲 برای نصب روی دستگاه:"
    echo "   adb install $APK_PATH"
    echo ""
    echo "   یا فایل را مستقیماً روی دستگاه اندروید کپی و نصب کنید."
else
    echo "❌ خطا در ساخت APK. لطفاً لاگ‌ها را بررسی کنید."
    exit 1
fi
