# 🚀 راهنمای سریع ساخت APK با GitHub Actions

## مراحل راه‌اندازی

### ۱. ایجاد ریپازیتوری GitHub

```bash
# اگر هنوز ریپازیتوری ندارید:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### ۲. فعال‌سازی GitHub Actions

1. به ریپازیتوری خود در GitHub بروید
2. به تب **Actions** بروید
3. اگر پیامی درباره فعال‌سازی workflows دیدید، روی **I understand my workflows, go ahead and enable them** کلیک کنید

### ۳. مشاهده ساخت خودکار

1. به تب **Actions** بروید
2. Workflow "Build Android APK" را انتخاب کنید
3. روی آخرین run کلیک کنید
4. صبر کنید تا مراحل تکمیل شود (معمولاً ۵-۱۰ دقیقه)

### ۴. دانلود APK

پس از اتمام build:

**روش ۱ - از Artifacts:**
1. در صفحه run، به بخش **Artifacts** بروید
2. روی `accounting-app-debug-apk` کلیک کنید
3. فایل ZIP دانلود می‌شود
4. آن را extract کنید تا فایل `app-debug.apk` را داشته باشید

**روش ۲ - از Releases (فقط برای branch main):**
1. به تب **Releases** بروید
2. آخرین release را پیدا کنید
3. فایل APK را دانلود کنید

## 🔧 تنظیمات پیشرفته

### ساخت Release خودکار

به صورت پیش‌فرض، هر push به branch `main` یک Release جدید با APK می‌سازد.

### تغییر نام اپلیکیشن

فایل `capacitor.config.ts` را ویرایش کنید:

```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.appname',  // شناسه یکتا
  appName: 'نام اپلیکیشن شما',       // نام نمایشی
  // ...
};
```

### ساخت APK امضا شده (Release)

برای ساخت نسخه signed release، باید:

1. یک keystore file بسازید:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```

2. فایل `android/app/build.gradle` را ویرایش کنید و تنظیمات signing را اضافه کنید

3. secrets زیر را در GitHub تنظیم کنید (Settings > Secrets and variables > Actions):
   - `ANDROID_KEYSTORE_BASE64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`

## 📱 نصب APK

### روش ۱: انتقال مستقیم
1. فایل APK را به دستگاه اندروید منتقل کنید
2. در تنظیمات: Settings > Security > Unknown Sources را فعال کنید
3. فایل APK را باز و نصب کنید

### روش ۲: با ADB
```bash
adb install app-debug.apk
```

## ❓ عیب‌یابی

### Build شکست خورد
- لاگ‌های GitHub Actions را بررسی کنید
- مطمئن شوید تمام وابستگی‌ها در package.json هستند
- بررسی کنید `npm run build` به صورت محلی کار می‌کند

### APK نصب نمی‌شود
- مطمئن شوید "Unknown Sources" فعال است
- نسخه اندروید دستگاه را بررسی کنید (حداقل Android 5.0+)
- اگر APK قبلی نصب است، ابتدا آن را حذف کنید

### حجم APK زیاد است
این طبیعی است چون شامل تمام وابستگی‌ها و WebView است. برای کاهش حجم:
- از ProGuard/R8 استفاده کنید
- تصاویر غیرضروری را حذف کنید
- از App Bundle به جای APK استفاده کنید

## 📞 پشتیبانی

اگر مشکلی دارید:
1. Issues را در GitHub بررسی کنید
2. لاگ‌های build را مطالعه کنید
3. مستندات Capacitor را ببینید: https://capacitorjs.com/docs
