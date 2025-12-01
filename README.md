# سفید یاب | Sefid Yab

**نسخه ۱.۰ | Version 1.0.0**

<div dir="rtl">

## 📢 اخبار و آپدیت‌ها

**تاریخ: ۱ دسامبر ۲۰۲۵**

> این ابزار توسط **توانا محمدی** و تیم **توانا پروکسی** به مرحله بررسی اولیه رسیده و در حال برنامه‌ریزی و ایجاد تغییرات هستیم.

---

## 🎯 درباره پروژه

**سفید یاب (Sefid Yab)** یک ابزار پیشرفته **OSINT** برای شناسایی و تحلیل حساب‌های کاربری در شبکه اجتماعی **ایکس (توییتر سابق)** است. این ابزار به‌طور خاص برای شناسایی حساب‌های کاربری که از **سیم‌کارت سفید** یا اینترنت دولتی استفاده می‌کنند، طراحی شده است.

### شعار
**شفافیت در فضای مجازی | Transparency in Cyberspace**

---

## ✨ ویژگی‌های کلیدی

### ۱. 📍 تحلیل عمیق پروفایل
- **موقعیت:** کشور واقعی ثبت‌شده برای حساب کاربری
- **دستگاه:** نوع گوشی (iPhone/Android) و منطقه اپ‌استور
- **شناسه ثابت:** عدد شناسایی که با تغییر نام کاربری تغییر نمی‌کند
- **تاریخ دقیق:** زمان ساخت حساب با دقت ثانیه
- **تاریخچه تغییرات:** تعداد دفعات تغییر نام کاربری

### ۲. 🛡️ تشخیص هوشمند ناهنجاری
- **شناسایی VPN/Proxy:** تشخیص استفاده از فیلترشکن
- **اتصال مستقیم:** شناسایی اتصال بدون واسطه
- **⚠️ هشدار سیم‌کارت سفید:** تشخیص الگوهای غیرعادی دسترسی از ایران

### ۳. 📊 داشبورد و پایگاه داده
- جستجو و فیلتر کاربران ذخیره‌شده
- خروجی CSV و JSON
- یادداشت‌گذاری شخصی برای هر حساب
- همگام‌سازی با پایگاه داده ابری

### ۴. 🔍 ابزارهای OSINT
- **Archive.org:** بررسی سوابق حساب
- **Google Search:** جستجوی پیشرفته
- **Google Lens:** جستجوی معکوس تصویر پروفایل

---

## 🚀 راهنمای نصب

### 💻 دسکتاپ (Windows / Mac / Linux)
1. افزونه **Tampermonkey** را از [tampermonkey.net](https://www.tampermonkey.net/) نصب کنید
2. فایل `sefidyab.js` را باز کرده و محتوای آن را کپی کنید
3. در Tampermonkey یک اسکریپت جدید بسازید و کد را جایگذاری کنید
4. ذخیره کنید و وارد x.com شوید
5. دکمه **سفید یاب** در منوی سمت راست ظاهر می‌شود

### 📱 موبایل Android (Kiwi Browser)
1. مرورگر **Kiwi Browser** را نصب کنید
2. افزونه Tampermonkey را روی آن نصب کنید
3. مراحل بالا را دنبال کنید
4. دکمه شناور در پایین صفحه نمایش داده می‌شود

### 🍎 موبایل iOS (Safari)
1. برنامه **Userscripts** را از App Store نصب کنید
2. در Settings > Safari > Extensions فعال کنید
3. اسکریپت را اضافه کنید
4. در Safari با زدن دکمه "aA" افزونه را فعال کنید

---

## 🗺️ نقشه راه (Roadmap)

### فاز ۱: پایه‌گذاری (تکمیل شده ✅)
- ✅ ساخت ابزار شناسایی پایه
- ✅ سیستم ذخیره‌سازی محلی
- ✅ رابط کاربری اولیه

### فاز ۲: بهبود و توسعه (در حال انجام 🔄)
- 🔄 ریبرند به سفید یاب
- 🔄 بهینه‌سازی SEO کامل
- 🔄 مستندات دوزبانه

### فاز ۳: ویژگی‌های پیشرفته (برنامه‌ریزی شده 📋)
- 📋 API عمومی برای محققان
- 📋 گزارش‌دهی خودکار
- 📋 یکپارچه‌سازی با ابزارهای OSINT دیگر

### فاز ۴: اجتماعی‌سازی (آینده 🔮)
- 🔮 پلتفرم اشتراک‌گذاری داده
- 🔮 تحلیل‌های آماری پیشرفته
- 🔮 مستندسازی الگوهای جدید

---

## ❓ سوالات متداول (FAQ)

**چرا نام "سفید یاب"؟**
این ابزار برای شناسایی حساب‌هایی که احتمالاً از سیم‌کارت سفید استفاده می‌کنند، طراحی شده است.

**آیا استفاده از این ابزار قانونی است؟**
بله. این ابزار تنها از API عمومی توییتر/ایکس استفاده می‌کند و هیچ داده خصوصی را جمع‌آوری نمی‌کند.

**آیا حساب من مسدود می‌شود؟**
خیر. ابزار از تکنیک Lazy Loading استفاده می‌کند تا از محدودیت نرخ API جلوگیری کند.

**یادداشت‌های من چه می‌شود؟**
یادداشت‌ها کاملاً محلی و خصوصی هستند. حتی هنگام مشارکت در پایگاه داده، یادداشت‌ها حذف می‌شوند.

---

## 🔗 پروژه‌های مرتبط

- **X-Analyzer**: ابزار تحلیل پیشرفته ایکس
- مقالات علمی و DOI مرتبط با OSINT و تحلیل شبکه‌های اجتماعی

---

## 🙏 قدردانی

این پروژه با الهام از کار ارزشمند **[@itsyebekhe](https://github.com/itsyebekhe)** و پروژه اولیه X-Forensics آغاز شد. از ایشان برای ایده و کد اولیه سپاسگزاریم.

---

## 👤 توسعه‌دهنده

**توانا محمدی (Tawana Mohammadi)**

- 🌐 وبسایت: [https://tawana.online](https://tawana.online)
- 📧 ایمیل: info@tawana.online
- 📱 تلفن: +98 990 112 0235
- 🐙 GitHub: [@tawanamohammadi](https://github.com/tawanamohammadi) | [@TAwR00T](https://github.com/TAwR00T)
- 🎓 ORCID: [0009-0005-6825-6728](https://orcid.org/0009-0005-6825-6728)
- 📚 Google Scholar: [VP8O0a4AAAAJ](https://scholar.google.com/citations?user=VP8O0a4AAAAJ)
- ✍️ Medium: [tawanamohammadi.medium.com](https://tawanamohammadi.medium.com/)
- 📰 Substack: [tawanamohammadi.substack.com](https://tawanamohammadi.substack.com/)

---

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

**ساخته شده برای شفافیت و امنیت.**

</div>

---

<div dir="ltr">

# Sefid Yab | White SIM Detector

**Version 1.0.0**

## 📢 News & Updates

**Date: December 1, 2025**

> This tool is currently under initial review by **Tawana Mohammadi** and the **Tawana Proxy** team. We are in the planning and implementation phase of improvements.

---

## 🎯 About the Project

**Sefid Yab (White Finder)** is an advanced **OSINT** tool for detecting and analyzing user accounts on the **X (formerly Twitter)** social network. This tool is specifically designed to identify accounts that may be using **white SIM cards** or government-provided internet access.

### Tagline
**Transparency in Cyberspace**

---

## ✨ Key Features

### 1. 📍 Deep Profile Analysis
- **Location**: Real registered country for the account
- **Device**: Phone type (iPhone/Android) and App Store region
- **Permanent ID**: Identifier that persists through username changes
- **Precise Date**: Account creation time down to the second
- **Change History**: Number of username modifications

### 2. 🛡️ Smart Anomaly Detection
- **VPN/Proxy Detection**: Identify use of circumvention tools
- **Direct Connection**: Detect unmediated access
- **⚠️ White SIM Alert**: Identify unusual access patterns from Iran

### 3. 📊 Dashboard & Database
- Search and filter saved users
- CSV and JSON export
- Personal notes for each account
- Cloud database synchronization

### 4. 🔍 OSINT Tools
- **Archive.org**: Review account history
- **Google Search**: Advanced searching
- **Google Lens**: Reverse image search for profiles

---

## 🚀 Installation Guide

### 💻 Desktop (Windows / Mac / Linux)
1. Install **Tampermonkey** extension from [tampermonkey.net](https://www.tampermonkey.net/)
2. Open `sefidyab.js` file and copy its contents
3. Create a new script in Tampermonkey and paste the code
4. Save and visit x.com
5. The **Sefid Yab** button will appear in the right sidebar

### 📱 Android Mobile (Kiwi Browser)
1. Install **Kiwi Browser**
2. Install Tampermonkey extension on it
3. Follow the steps above
4. A floating button will appear at the bottom of the page

### 🍎 iOS Mobile (Safari)
1. Install **Userscripts** app from the App Store
2. Enable it in Settings > Safari > Extensions
3. Add the script
4. Activate the extension in Safari by tapping the "aA" button

---

## 🗺️ Roadmap

### Phase 1: Foundation (Completed ✅)
- ✅ Core detection tool
- ✅ Local storage system
- ✅ Initial user interface

### Phase 2: Improvement & Development (In Progress 🔄)
- 🔄 Rebrand to Sefid Yab
- 🔄 Complete SEO optimization
- 🔄 Bilingual documentation

### Phase 3: Advanced Features (Planned 📋)
- 📋 Public API for researchers
- 📋 Automated reporting
- 📋 Integration with other OSINT tools

### Phase 4: Community Building (Future 🔮)
- 🔮 Data sharing platform
- 🔮 Advanced statistical analysis
- 🔮 Documentation of new patterns

---

## ❓ Frequently Asked Questions (FAQ)

**Why the name "Sefid Yab"?**
This tool is designed to identify accounts that likely use white SIM cards.

**Is using this tool legal?**
Yes. The tool only uses Twitter/X's public API and does not collect any private data.

**Will my account be blocked?**
No. The tool uses Lazy Loading techniques to avoid API rate limits.

**What happens to my notes?**
Notes are completely local and private. Even when contributing to the database, notes are removed.

---

## 🔗 Related Projects

- **X-Analyzer**: Advanced X analysis tool
- Scientific papers and DOIs related to OSINT and social network analysis

---

## 🙏 Acknowledgments

This project was inspired by the valuable work of **[@itsyebekhe](https://github.com/itsyebekhe)** and the original X-Forensics project. We thank them for the idea and initial code.

---

## 👤 Developer

**Tawana Mohammadi**

- 🌐 Website: [https://tawana.online](https://tawana.online)
- 📧 Email: info@tawana.online
- 📱 Phone: +98 990 112 0235
- 🐙 GitHub: [@tawanamohammadi](https://github.com/tawanamohammadi) | [@TAwR00T](https://github.com/TAwR00T)
- 🎓 ORCID: [0009-0005-6825-6728](https://orcid.org/0009-0005-6825-6728)
- 📚 Google Scholar: [VP8O0a4AAAAJ](https://scholar.google.com/citations?user=VP8O0a4AAAAJ)
- ✍️ Medium: [tawanamohammadi.medium.com](https://tawanamohammadi.medium.com/)
- 📰 Substack: [tawanamohammadi.substack.com](https://tawanamohammadi.substack.com/)

---

## 📄 License

This project is released under the MIT License.

**Built for transparency and security.**

</div>
