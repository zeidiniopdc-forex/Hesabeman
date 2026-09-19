# 📱 حسابدار من - اپلیکیشن مدیریت مالی

اپلیکیشن حسابداری شخصی با رابط کاربری فارسی و زیبا

## ✨ ویژگی‌ها

- 🏠 داشبورد رنگی با نمودارها و آمار مالی
- 📨 اسکن خودکار پیامک‌های بانکی
- 💳 مدیریت حساب‌های بانکی
- 💰 ثبت درآمد و هزینه با دسته‌بندی
- 🤝 پیگیری طلب و بدهی
- 📊 بودجه‌بندی هوشمند خودکار
- 🔔 هشدار هنگام نزدیک شدن به سقف بودجه

## 🚀 ساخت APK با GitHub Actions

### مراحل:

1. **ریپازیتوری را به GitHub بفرستید:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

2. **به GitHub Actions بروید:**
   - در ریپازیتوری خود، تب **Actions** را باز کنید
   - Workflow "Build Android APK" را انتخاب کنید
   - روی **Run workflow** کلیک کنید یا منتظر push بعدی بمانید

3. **دانلود APK:**
   - پس از اتمام build (حدود ۵-۱۰ دقیقه)
   - به تب **Actions** بروید
   - روی آخرین run کلیک کنید
   - در بخش **Artifacts**، فایل `app-debug-apk` را دانلود کنید
   - فایل ZIP را extract کنید تا `app-debug.apk` را داشته باشید

4. **نصب روی دستگاه:**
   - فایل APK را به دستگاه اندروید منتقل کنید
   - در تنظیمات: Settings > Security > Unknown Sources را فعال کنید
   - فایل APK را باز و نصب کنید

## 🛠️ ساخت محلی APK

### پیش‌نیازها:
- Node.js 18+
- JDK 17
- Android SDK (ANDROID_HOME تنظیم شده)

### مراحل:

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
chmod +x gradlew
./gradlew assembleDebug
cd ..

# مسیر APK:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 📁 ساختار پروژه

```
├── .github/workflows/
│   └── build-apk.yml          # GitHub Actions workflow
├── src/
│   ├── components/            # کامپوننت‌های React
│   │   ├── Dashboard.tsx
│   │   ├── SmsScanner.tsx
│   │   ├── SmsPatterns.tsx
│   │   ├── Accounts.tsx
│   │   ├── Transactions.tsx
│   │   ├── Debts.tsx
│   │   └── Budget.tsx
│   ├── App.tsx
│   ├── types.ts
│   └── store.ts
├── capacitor.config.json      # تنظیمات Capacitor
└── package.json
```

## 🔧 توسعه محلی

```bash
# نصب وابستگی‌ها
npm install

# اجرای سرور توسعه
npm run dev

# ساخت نسخه تولید
npm run build
```

## 📝 مجوز

MIT
