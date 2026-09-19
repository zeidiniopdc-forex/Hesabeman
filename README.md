# 📱 حسابدار من - اپلیکیشن مدیریت مالی

یک اپلیکیشن حسابداری شخصی با رابط کاربری زیبا و فارسی

## ✨ ویژگی‌ها

- 🏠 **داشبورد رنگی** - نمایش وضعیت مالی، نمودارها و خلاصه‌ها
- 📨 **اسکن پیامک بانکی** - شناسایی خودکار الگوهای پیامکی بانک‌ها
- 💳 **مدیریت حساب‌ها** - ثبت و مدیریت حساب‌های بانکی
- 💰 **ثبت تراکنش** - درآمد و هزینه با دسته‌بندی
- 🤝 **طلب و بدهی** - پیگیری مطالبات و بدهکاری‌ها
- 📊 **بودجه‌بندی هوشمند** - تولید خودکار بودجه بر اساس درآمد و هزینه‌ها
- 🔔 **هشدار بودجه** - اعلان هنگام نزدیک شدن به سقف بودجه

## 🚀 ساخت APK

### روش ۱: GitHub Actions (خودکار)

فقط کافیست کد را به ریپازیتوری GitHub پوش کنید. GitHub Actions به صورت خودکار APK را می‌سازد.

1. این ریپازیتوری را fork کنید
2. تغییرات را push کنید
3. به تب **Actions** بروید
4. Workflow "Build Android APK" را انتخاب کنید
5. پس از اتمام build، فایل APK از بخش **Artifacts** قابل دانلود است

### روش ۲: ساخت محلی

#### پیش‌نیازها:
- Node.js 18+
- JDK 17
- Android SDK (ANDROID_HOME تنظیم شده)

```bash
# نصب وابستگی‌ها
npm install

# ساخت وب‌اپ
npm run build

# اضافه کردن پلتفرم اندروید
npx cap add android

# همگام‌سازی
npx cap sync android

# ساخت APK
cd android
./gradlew assembleDebug
cd ..

# مسیر APK:
# android/app/build/outputs/apk/debug/app-debug.apk
```

یا به صورت خودکار:
```bash
chmod +x build-apk.sh
./build-apk.sh
```

### روش ۳: استفاده از Android Studio

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

سپس در Android Studio:
1. صبر کنید تا Gradle sync تمام شود
2. از منوی Build > Build Bundle(s) / APK(s) > Build APK(s)
3. APK در مسیر `android/app/build/outputs/apk/debug/` ساخته می‌شود

## 📲 نصب APK

### مستقیم روی دستگاه:
1. فایل `app-debug.apk` را به دستگاه اندروید منتقل کنید
2. در تنظیمات دستگاه، نصب از منابع ناشناس را فعال کنید
3. فایل APK را باز و نصب کنید

### با ADB:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🛠️ توسعه

```bash
# اجرای سرور توسعه
npm run dev

# ساخت نسخه تولید
npm run build

# بررسی تایپ‌اسکریپت
npm run typecheck
```

## 📁 ساختار پروژه

```
├── .github/workflows/    # GitHub Actions
│   └── build-apk.yml    # Workflow ساخت APK
├── src/
│   ├── components/      # کامپوننت‌های React
│   │   ├── Dashboard.tsx
│   │   ├── SmsScanner.tsx
│   │   ├── SmsPatterns.tsx
│   │   ├── Accounts.tsx
│   │   ├── Transactions.tsx
│   │   ├── Debts.tsx
│   │   └── Budget.tsx
│   ├── App.tsx          # کامپوننت اصلی
│   ├── types.ts         # تایپ‌ها
│   └── store.ts         # مدیریت داده‌ها
├── capacitor.config.ts  # تنظیمات Capacitor
├── build-apk.sh         # اسکریپت ساخت APK
└── package.json
```

## 📝 مجوز

MIT
