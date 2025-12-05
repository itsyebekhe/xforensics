// ==UserScript==
// @name         X Profile Forensics (v20.8.0)
// @namespace    http://tampermonkey.net/
// @version      20.8.0
// @description  Forensics tool. additon of Forensic Search.
// @author       https://x.com/yebekhe
// @match        https://x.com/*
// @match        https://twitter.com/*
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // --- 1. LOCALIZATION ---
    const PREF_LANG = localStorage.getItem("xf_lang_pref") || "auto";
    const DETECTED_LANG = (navigator.language || 'en').split('-')[0];
    const ACTIVE_LANG = PREF_LANG === "auto" ? DETECTED_LANG : PREF_LANG;
    const IS_RTL = (ACTIVE_LANG === 'fa' || ACTIVE_LANG === 'ar');

    const TRANSLATIONS = {
        en: {
            title: "Forensics v20.8",
            menu_btn: "Forensics",
            labels: { location: "Location", device: "Device", id: "Perm ID", created: "Created", renamed: "Renamed", identity: "Identity", lang: "Language", type: "Type" },
            risk: { safe: "SAFE", detected: "DETECTED", anomaly: "ANOMALY", caution: "CAUTION", normal: "NORMAL", verified: "VERIFIED ID" },
            tags: { title: "Manual Tags", loc_change: "Location Changed", base_iran: "Suspect Base Iran", cyber: "Cyber/Organized", fake: "Fake/Bot", flag_ir: "🇮🇷 Iran Flag",
                suspicious: "Suspicious Behavior",
                foreigner: "Foreigner (Non-IR)" },
            status: {
                high_conf: "High Confidence", high_desc: "Connection matches organic traffic patterns.",
                shield: "Shield Active", shield_desc: "Traffic obfuscated via Proxy/VPN or flagged for relocation.",
                shield_norm: "Shield Active (Normal)", shield_norm_desc: "User identified as Iranian/West Asia using VPN. Standard behavior.",
                anomaly: "Anomaly Detected", anomaly_desc: "Direct access blocked in Iran. Likely causes: White SIM, Serverless config",
                hidden_anomaly: "Hidden Identity", hidden_anomaly_desc: "Farsi speaker in 'West Asia' with Direct Access. High probability of Iran-based White SIM/Gov Net usage.",
                renamed_msg: "Renamed {n}x"
            },
            tabs: { info: "Overview", analysis: "Analysis", tools: "Tools" },
            analysis: {
                title: "Detailed Behavior Report",
                // Evidence Badges
                badge_farm: "Network Ratio",
                badge_spam: "High Volume",
                badge_renamed: "Identity Flux",
                badge_phishing: "Risk Link",
                // Dynamic Analysis Text Builder
                intro_safe: "Analysis of activity patterns suggests organic, authentic user behavior.",
                intro_warn: "Multiple behavioral anomalies detected. This account exhibits characteristics common to:",
                intro_danger: "CRITICAL: The convergence of multiple risk factors strongly suggests this is a:",
                // Specific reasons to append
                reason_farm: "A 'Follow-Back' Bot/Network. The artificial follower ratio ({r}) combined with high volume following ({f}) indicates organized growth tactics.",
                reason_spam: "Automated/Spam Account. The tweet volume ({n}/day) exceeds human norms, suggesting script-based activity.",
                reason_rented: "Rented/Repurposed Account. Significant identity changes ({n}x) suggest the account was sold or repurposed to mislead followers.",
                reason_phishing: "Data Harvester. The bio contains links to anonymous services ({l}) often used for social engineering.",
                // Connectors
                connector: " Additionally, it appears to be ",
                conclusion_safe: "No red flags found in metadata.",
                conclusion_risk: "Caution is advised."
            },
            dashboard: {
                title: "Forensics Database", btn_open: "📂 DB", search_placeholder: "Search Username, ID or Tag...",
                filter_loc: "Filter Location", filter_risk: "Filter Risk Level", opt_all: "All Risks",
                btn_export: "💾 Export CSV", btn_backup: "💾 Backup JSON", btn_restore: "📥 Restore JSON",
                btn_cloud: "☁️ Update from GitHub", btn_contrib: "📤 Contribute Data", btn_clear: "🗑️ Clear Cache",
                btn_block: "🚫 Mass Block Listed", btn_stop: "🛑 STOP Process", btn_lookup: "🆔 ID Lookup",
                btn_tags: "🏷️ Tag Filter",
                count: "Users Stored: {n}", list_header: "User List (Click to Visit)", list_empty: "No users found matching filters.",
                page_prev: "◀ Prev", page_next: "Next ▶", page_info: "Page {c} of {t}",
                msg_cleared: "Database wiped successfully!", msg_restored: "Restored {n} users.", msg_imported_batch: "Imported {n} users from Batch file.",
                msg_cloud_ok: "Success! Added {n} users from GitHub.", msg_cloud_fail: "Failed to fetch database.", msg_err: "Invalid file.",
                msg_block_conf: "⚠️ WARNING ⚠️\n\nBlock {n} users?\nContinue?", msg_blocking: "Blocking {c}/{t}...", msg_block_done: "Done. Blocked {n} users.",
                msg_block_stop: "Stopped.", msg_no_targets: "All users in this filter are already blocked!", contrib_info: "Clean file downloaded.",
                nav_home: "Database",
                nav_tools: "Tools",
                nav_data: "Settings",
                filter_tag: "Filter Tag",
                btn_back: "← Back",
                tools_title: "Tools & Utilities",
                batch_desc: "Process multiple users & auto-merge.",
                tags_desc: "Visual tag cloud & stats.",
                lookup_desc: "Find profile by numeric ID."
            },
            lookup: { title: "Find User by ID", desc: "Enter a Numeric ID.", input_ph: "Numeric ID...", btn_go: "Visit Profile", btn_back: "Back to DB" },
            batch: {
                title: "Batch Processing", btn_open: "⚙️ Batch", input_placeholder: "One username per line", btn_start: "Start Processing", btn_export_json: "💾 Export JSON",
                status_idle: "Idle", status_running: "Running...", status_paused: "Paused (Rate Limit)", status_stopped: "Stopped", status_done: "Finished",
                progress: "Progress: {c} of {t} | OK: {ok} | Error: {err}", rate_limit_msg: "Rate Limit. Pausing 1 min...", rate_limit_wait: "Pausing: {s}s...",
                export_filename: "batch_export", fields_label: "Select Fields:",
                col_username: "Username", col_name: "Name", col_id_changes: "Renamed Count", col_last_change: "Last Renamed",
                col_created: "Created", col_deleted: "Status", col_device: "Device", col_location_status: "Loc Status",
                col_gender: "Gender", col_numeric_id: "ID", col_location: "Location", col_avatar: "Avatar", col_lang: "Lang", col_verified: "Verified",
                merge_label: "Merge valid results into Database automatically",
                skip_label: "Skip users already in Database"
            },
            btn: { view_avatar: "View Avatar", close: "Close", retry: "Refresh Data" },
            values: { gov: "Government", unknown: "Unknown", west_asia: "West Asia", fa_script: "Farsi/Arabic" },
            notes_placeholder: "Add personal notes...",
            osint_titles: { archive: "Check Wayback Machine", google: "Google Dork", lens: "Reverse Image Search" },
            lang_sel: "Lang:",
            data: {
                cloud_title: "Cloud & Sync",
                update_db: "Update DB",
                update_desc: "Fetch latest forensics data from GitHub.",
                contrib_title: "Contribute",
                contrib_desc: "Share data (Anonymized).",
                backup_title: "Backup & Maintenance",
                backup_json: "Backup JSON",
                restore_json: "Restore JSON",
                clear_cache: "Clear Cache",
                lang_label: "Language:"
            },
            search: {
                title: "Forensic Search",
                interact: "Interactions (Replies)",
                keywords: "Keyword Check",
                custom: "Custom Search",
            },
        },
        fa: {
            title: "تحلیلگر پروفایل ۲۰.۸",
            menu_btn: "جرم‌شناسی",
            labels: { location: "موقعیت", device: "دستگاه", id: "شناسه", created: "ساخت", renamed: "تغییر نام", identity: "هویت", lang: "زبان", type: "نوع" },
            risk: { safe: "امن", detected: "هشدار", anomaly: "ناهنجاری", caution: "احتیاط", normal: "طبیعی", verified: "تایید شده" },
            tags: { title: "دسته‌بندی / تگ‌ها", loc_change: "تغییر لوکیشن", base_iran: "مشکوک به Base Iran", cyber: "سایبری/سازمانی", fake: "فیک/جعلی", flag_ir: "🇮🇷 پرچم ایران",
                suspicious: "رفتار مشکوک",
                foreigner: "خارجی (غیر ایرانی)" },
            status: {
                high_conf: "اطمینان بالا", high_desc: "اتصال طبیعی و ارگانیک است.",
                shield: "سپر فعال", shield_desc: "استفاده از VPN/پروکسی تشخیص داده شد.",
                shield_norm: "سپر فعال (طبیعی)", shield_norm_desc: "کاربر ایران/غرب آسیا با VPN. رفتار طبیعی.",
                anomaly: "ناهنجاری", anomaly_desc: "اتصال مستقیم در ایران غیرممکن است. دلایل: سیم‌کارت سفید، کانفیگ سرورلس.",
                hidden_anomaly: "هویت پنهان", hidden_anomaly_desc: "فارسی‌زبان در «غرب آسیا» با اتصال مستقیم. احتمال قوی: سیم‌کارت سفید یا اینترنت دولتی.",
                renamed_msg: "{n} بار تغییر نام"
            },
            tabs: { info: "بررسی کلی", analysis: "تحلیل رفتار", tools: "ابزارها" },
            analysis: {
                title: "گزارش رفتارشناسی",
                // Badges
                badge_farm: "شبکه تعاملی",
                badge_spam: "حجم بالا",
                badge_renamed: "تغییر هویت",
                badge_phishing: "لینک خطرناک",
                // Builder
                intro_safe: "تحلیل الگوهای فعالیت نشان‌دهنده رفتار طبیعی و ارگانیک است.",
                intro_warn: "چندین ناهنجاری رفتاری شناسایی شد. این حساب ویژگی‌های زیر را دارد:",
                intro_danger: "بحرانی: همگرایی چندین فاکتور ریسک قویاً نشان‌دهنده موارد زیر است:",
                // Reasons
                reason_farm: "عضویت در شبکه فالو-بک/ارتش سایبری. نسبت فالوور/فالوینگ مصنوعی ({r}) همراه با حجم فالوینگ بالا ({f}) نشانگر رشد سازمان‌یافته است.",
                reason_spam: "ربات یا حساب اسپم. حجم توییت ({n} در روز) فراتر از توان انسانی است و نشانگر استفاده از اسکریپت است.",
                reason_rented: "اکانت اجاره‌ای/خریداری شده. تغییرات مکرر نام کاربری ({n} بار) نشان‌دهنده تغییر کاربری اکانت برای فریب مخاطب است.",
                reason_phishing: "جمع‌آوری کننده اطلاعات. بیو حاوی لینک‌ به سرویس‌های ناشناس ({l}) است که اغلب برای مهندسی اجتماعی استفاده می‌شود.",
                // Connectors
                connector: " همچنین، شواهد نشان می‌دهد ",
                conclusion_safe: "هیچ پرچم قرمزی در متادیتا یافت نشد.",
                conclusion_risk: "احتیاط توصیه می‌شود."
            },
            dashboard: {
                title: "پایگاه داده جرم‌شناسی", btn_open: "📂 دیتا", search_placeholder: "جستجوی کاربر، ID یا تگ...",
                filter_loc: "فیلتر کشور", filter_risk: "فیلتر ریسک", opt_all: "همه",
                btn_export: "💾 خروجی CSV", btn_backup: "💾 بک‌آپ JSON", btn_restore: "📥 بازگردانی",
                btn_cloud: "☁️ آپدیت از گیت‌هاب", btn_contrib: "📤 ارسال دیتا (مشارکت)", btn_clear: "🗑️ حذف دیتا",
                btn_block: "🚫 مسدودسازی لیست", btn_stop: "🛑 توقف عملیات", btn_lookup: "🆔 یابنده ID",
                btn_tags: "🏷️ فیلتر تگ‌ها",
                count: "ذخیره شده: {n}", list_header: "لیست کاربران (برای مشاهده کلیک کنید)", list_empty: "کاربری با این مشخصات یافت نشد.",
                page_prev: "◀ قبلی", page_next: "بعدی ▶", page_info: "صفحه {c} از {t}",
                msg_cleared: "پایگاه داده پاک شد!", msg_restored: "تعداد {n} کاربر بازیابی شد.", msg_imported_batch: "تعداد {n} کاربر از فایل Batch وارد شد.",
                msg_cloud_ok: "موفق! {n} کاربر از گیت‌هاب اضافه شد.", msg_cloud_fail: "خطا در دریافت دیتابیس.", msg_err: "فایل نامعتبر است.",
                msg_block_conf: "⚠️ هشدار ⚠️\n\nمسدودسازی {n} کاربر.\nادامه می‌دهید؟", msg_blocking: "مسدودسازی {c} از {t}...", msg_block_done: "پایان! {n} کاربر بلاک شدند.",
                msg_block_stop: "توقف شد.", msg_no_targets: "کاربری برای بلاک یافت نشد.", contrib_info: "فایل contribution.json دانلود شد.",
                nav_home: "پایگاه داده",
                nav_tools: "ابزارها",
                nav_data: "تنظیمات",
                filter_tag: "فیلتر تگ",
                btn_back: "← بازگشت",
                tools_title: "ابزارها و امکانات",
                batch_desc: "پردازش گروهی و ادغام خودکار.",
                tags_desc: "آمار و ابر تگ‌ها.",
                lookup_desc: "جستجو با شناسه عددی."
            },
            lookup: { title: "جستجو با شناسه عددی", desc: "شناسه عددی را وارد کنید.", input_ph: "شناسه عددی...", btn_go: "مشاهده پروفایل", btn_back: "بازگشت" },
            batch: {
                title: "پردازش دسته‌ای (Batch Processing)", btn_open: "⚙️ پردازش", input_placeholder: "هر خط یک نام کاربری", btn_start: "شروع پردازش", btn_export_json: "💾 خروجی JSON",
                status_idle: "آماده", status_running: "در حال اجرا...", status_paused: "متوقف شده (Rate Limit)", status_stopped: "متوقف شد", status_done: "پایان یافت",
                progress: "پیشرفت: {c} از {t} | موفق: {ok} | خطا: {err}", rate_limit_msg: "محدودیت API. ۱ دقیقه صبر...", rate_limit_wait: "توقف: {s} ثانیه...",
                export_filename: "خروجی-دسته-ای", fields_label: "انتخاب فیلدها:",
                col_username: "نام کاربری", col_name: "نام نمایشی", col_id_changes: "تغییر نام", col_last_change: "آخرین تغییر",
                col_created: "تاریخ ساخت", col_deleted: "وضعیت", col_device: "دستگاه", col_location_status: "وضعیت مکان",
                col_gender: "جنسیت", col_numeric_id: "ID", col_location: "موقعیت", col_avatar: "آواتار", col_lang: "زبان", col_verified: "تیک",
                merge_label: "ذخیره خودکار نتایج سالم در دیتابیس",
                skip_label: "رد کردن کاربران موجود در دیتابیس"
            },
            btn: { view_avatar: "آواتار اصلی", close: "بستن", retry: "بروزرسانی" },
            values: { gov: "دولتی", unknown: "نامشخص", west_asia: "غرب آسیا", fa_script: "فارسی/عربی" },
            notes_placeholder: "یادداشت شخصی بنویسید...",
            osint_titles: { archive: "آرشیو اینترنت", google: "جستجوی گوگل", lens: "جستجوی تصویر" },
            lang_sel: "زبان:",
            data: {
                cloud_title: "همگام‌سازی ابری",
                update_db: "بروزرسانی دیتابیس",
                update_desc: "دریافت آخرین داده‌ها از گیت‌هاب.",
                contrib_title: "مشارکت",
                contrib_desc: "ارسال داده‌ها (بدون نام).",
                backup_title: "پشتیبانی و نگهداری",
                backup_json: "بک‌آپ JSON",
                restore_json: "بازگردانی JSON",
                clear_cache: "حذف حافظه",
                lang_label: "زبان رابط کاربری:"
            },
            search: {
                title: "جستجوی جرم‌شناسی",
                interact: "تعاملات (پاسخ‌ها)",
                keywords: "بررسی کلیدواژه‌ها",
                custom: "جستجوی دلخواه"
            }
        }
    };

    const TEXT = TRANSLATIONS[ACTIVE_LANG] || TRANSLATIONS['en'];

    // --- 2. STORAGE & GLOBALS ---
    const STORAGE_KEY = "xf_db_v1";
    const GITHUB_REPO_ISSUES = "https://github.com/itsyebekhe/xforensics/issues/new";
    const CLOUD_DB_URL = "https://raw.githubusercontent.com/itsyebekhe/xforensics/main/database.json";

    let saveTimeout;
    let db = {};

    // Globals for Blocking
    let isBlockingProcess = false;
    let abortBlock = false;

    // Globals for Batch Processing
    const BATCH_DELAY = 1000;
    const RATE_LIMIT_PAUSE = 60;

    const BATCH_FIELDS = [
        { id: 'username', labelKey: 'col_username' },
        { id: 'name', labelKey: 'col_name' },
        { id: 'numeric_id', labelKey: 'col_numeric_id' },
        { id: 'location', labelKey: 'col_location' },
        { id: 'device', labelKey: 'col_device' },
        { id: 'created', labelKey: 'col_created' },
        { id: 'id_changes', labelKey: 'col_id_changes' },
        { id: 'last_change', labelKey: 'col_last_change' },
        { id: 'deleted', labelKey: 'col_deleted' },
        { id: 'loc_status', labelKey: 'col_location_status' },
        { id: 'gender', labelKey: 'col_gender' },
        { id: 'avatar', labelKey: 'col_avatar' },
        { id: 'lang', labelKey: 'col_lang' },
        { id: 'verified', labelKey: 'col_verified' }
    ];

    let batchOverlayEl = null;

    let batchState = {
        isRunning: false,
        isAborted: false,
        isPaused: false,
        currentWaitTime: 0,
        list: [],
        index: 0,
        results: [],
        total: 0,
        okCount: 0,
        errCount: 0,
        enabledFields: new Set(BATCH_FIELDS.map(f => f.id)),
        config: { merge: true, skip: false }
    };

    function saveDB() {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            const keys = Object.keys(db);
            if (keys.length > 20000) {
                keys.slice(0, 2000).forEach(k => delete db[k]);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        }, 2000);
    }

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            db = JSON.parse(saved);
            let cleaned = false;
            Object.keys(db).forEach(k => {
                if(db[k].html) {
                    delete db[k].html;
                    cleaned = true;
                }
            });
            if(cleaned) saveDB();
        }
    } catch (e) { console.error("XF DB Load Error", e); }

    // --- 3. CONFIG & STYLES ---
    const CONFIG = {
        bearerToken: "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs=1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        queryId: "XRqGa7EeokUU5kppkh13EA",
        features: { hidden_profile_subscriptions_enabled: true, subscriptions_verification_info_is_identity_verified_enabled: true, subscriptions_verification_info_verified_since_enabled: true, responsive_web_graphql_skip_user_profile_image_extensions_enabled: true, responsive_web_graphql_timeline_navigation_enabled: true, responsive_web_graphql_timeline_navigation_enabled_elsewhere: true, responsive_web_enhance_cards_enabled: true, verified_phone_label_enabled: true, creator_subscriptions_tweet_preview_api_enabled: true, highlights_tweets_tab_ui_enabled: true, longform_notetweets_consumption_enabled: true, tweetypie_unmention_optimization_enabled: true, vibe_api_enabled: true }
    };

    const FONT_STACK = 'TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    const STYLES = `
        :root { --xf-bg: #000000; --xf-sidebar: #16181c; --xf-border: #2f3336; --xf-blue: #1d9bf0; --xf-green: #00ba7c; --xf-red: #f91880; --xf-orange: #ffd400; --xf-purple: #794BC4; --xf-text: #e7e9ea; --xf-dim: #71767b; }

        /* --- GLOBAL INJECTIONS --- */
        #xf-pill { display: inline-flex; align-items: center; background: rgba(255,255,255,0.05); border: 1px solid var(--xf-border); border-radius: 99px; padding: 4px 12px; margin-right: 12px; margin-bottom: 4px; cursor: pointer; font-family: ${FONT_STACK}; font-size: 13px; user-select: none; direction: ltr; }
        #xf-pill:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
        .xf-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; box-shadow: 0 0 6px currentColor; animation: xf-pulse 2s infinite; }
        .xf-mini-pill { display: inline-flex; align-items: center; margin-left: 4px; padding: 2px 6px; border-radius: 4px; font-size: 11px; cursor: pointer; user-select: none; background: rgba(255,255,255,0.05); border: 1px solid var(--xf-border); color: var(--xf-dim); vertical-align: middle; font-family: ${FONT_STACK}; direction: ltr; }
        .xf-mini-pill:hover { background: rgba(29,155,240,0.15); color: var(--xf-blue); border-color: var(--xf-blue); }
        .xf-mini-pill.xf-loaded { background: transparent; border: none; padding: 0 4px; font-weight: bold; }
        @keyframes xf-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        /* --- NATIVE MENU ITEM --- */
        .xf-menu-item { display: flex; align-items: center; padding: 12px; cursor: pointer; transition: 0.2s; border-radius: 99px; margin: 4px 0; }
        .xf-menu-item:hover { background: rgba(239, 243, 244, 0.1); }
        .xf-menu-icon { width: 26px; height: 26px; margin-right: 20px; fill: currentColor; }
        .xf-menu-text { font-size: 20px; font-weight: 700; font-family: ${FONT_STACK}; color: var(--xf-text); line-height: 24px; }
        #xf-mob-fab { position: fixed; bottom: 75px; left: 20px; width: 48px; height: 48px; background: var(--xf-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(29,155,240,0.4); cursor: pointer; z-index: 9000; transition: 0.2s; border: 2px solid #000; }
        #xf-mob-fab:hover { transform: scale(1.1); }
        .xf-mob-icon { width: 24px; height: 24px; fill: #fff; }

        /* --- DASHBOARD REDESIGN --- */
        #xf-dash-overlay { position: fixed; inset: 0; background: rgba(91, 112, 131, 0.4); z-index: 10001; display: none; align-items: center; justify-content: center; backdrop-filter: blur(5px); direction: ${IS_RTL?'rtl':'ltr'}; }

        #xf-dash-box {
            width: 750px; height: 550px; max-width: 95vw; max-height: 90vh;
            background: var(--xf-bg); border-radius: 16px;
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
            display: flex; overflow: hidden; border: 1px solid var(--xf-border);
            font-family: ${FONT_STACK}; color: #fff;
        }

        /* SIDEBAR */
        .xf-dash-sidebar { width: 60px; background: var(--xf-sidebar); display: flex; flex-direction: column; align-items: center; padding-top: 20px; border-${IS_RTL?'left':'right'}: 1px solid var(--xf-border); }
        .xf-nav-btn { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; margin-bottom: 15px; color: var(--xf-dim); transition: 0.2s; }
        .xf-nav-btn:hover { background: rgba(255,255,255,0.1); color: var(--xf-text); }
        .xf-nav-btn.active { color: var(--xf-blue); background: rgba(29, 155, 240, 0.1); }

        /* CONTENT AREA */
        .xf-dash-content { flex: 1; padding: 20px; display: flex; flex-direction: column; overflow-y: auto; position: relative; }
        .xf-view-header { font-size: 20px; font-weight: 800; margin-bottom: 15px; color: var(--xf-text); display: flex; justify-content: space-between; align-items: center; }

        /* COMPONENTS */
        .xf-input { width: 100%; padding: 10px; margin-bottom: 10px; background: transparent; border: 1px solid var(--xf-border); color: #fff; border-radius: 4px; outline: none; box-sizing: border-box; font-family: ${FONT_STACK}; font-size: 13px; }
        .xf-input:focus { border-color: var(--xf-blue); }

        .xf-filters-row { display: flex; gap: 10px; margin-bottom: 10px; }

        /* LIST */
        #xf-user-list { flex: 1; overflow-y: auto; border: 1px solid var(--xf-border); border-radius: 8px; margin-bottom: 10px; }
        .xf-user-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-bottom: 1px solid var(--xf-border); cursor: pointer; transition: 0.1s; font-size: 12px; }
        .xf-user-row:hover { background: rgba(255,255,255,0.03); }
        .xf-user-row.xf-blocked { opacity: 0.5; background: rgba(100,0,0,0.1); }
        .xf-u-name { font-weight: bold; color: var(--xf-text); }
        .xf-u-meta { font-size: 11px; color: var(--xf-dim); display: block; margin-top: 2px; }
        .xf-u-risk { font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #000; }
        .xf-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 11px; color: var(--xf-dim); border-top: 1px solid var(--xf-border); padding-top: 5px; }
        .xf-page-btn { cursor: pointer; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.1); user-select: none; }

        /* GRID CARDS (Tools/Data) */
        .xf-tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .xf-tool-card { background: var(--xf-sidebar); border: 1px solid var(--xf-border); border-radius: 12px; padding: 20px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .xf-tool-card:hover { border-color: var(--xf-dim); transform: translateY(-2px); background: rgba(255,255,255,0.05); }
        .xf-tool-icon { font-size: 30px; margin-bottom: 10px; }
        .xf-tool-title { font-weight: bold; font-size: 14px; margin-bottom: 5px; color: var(--xf-text); }
        .xf-tool-desc { font-size: 11px; color: var(--xf-dim); }

        /* ACTION BUTTONS */
        .xf-action-btn { padding: 8px 16px; border-radius: 99px; border: none; font-weight: bold; font-size: 12px; cursor: pointer; transition: 0.2s; }
        .xf-btn-primary { background: var(--xf-text); color: #000; }
        .xf-btn-primary:hover { opacity: 0.9; }
        .xf-btn-danger { background: transparent; border: 1px solid var(--xf-red); color: var(--xf-red); }
        .xf-btn-danger:hover { background: rgba(249, 24, 128, 0.1); }

        /* --- BATCH MODAL (Legacy Style maintained for Modal) --- */
        #xf-batch-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 10002; display: none; align-items: center; justify-content: center; backdrop-filter: blur(8px); direction: ${IS_RTL?'rtl':'ltr'}; }
        .xf-dash-box { /* Used by Batch Modal */ width: 95%; max-width: 400px; max-height: 80vh; background: #000; border: 1px solid var(--xf-border); border-radius: 16px; padding: 16px; font-family: ${FONT_STACK}; box-shadow: 0 20px 50px rgba(0,0,0,0.8); color: #fff; display: flex; flex-direction: column; }
        .xf-batch-options { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin: 10px 0; max-height: 100px; overflow-y: auto; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 8px; }
        .xf-batch-opt { display: flex; align-items: center; font-size: 11px; color: var(--xf-dim); cursor: pointer; }
        .xf-batch-opt input { margin-right: 5px; cursor: pointer; accent-color: var(--xf-blue); }
        .xf-btn-row { display: flex; gap: 8px; margin-top: 8px; }
        .xf-dash-btn { flex: 1; padding: 10px; border-radius: 99px; font-weight: bold; cursor: pointer; border: none; transition: 0.2s; font-family: ${FONT_STACK}; font-size: 12px; white-space: nowrap; }
        .xf-btn-blue { background: var(--xf-blue); color: #fff; }
        .xf-btn-green { background: var(--xf-green); color: #fff; }
        .xf-btn-red { background: rgba(249, 24, 128, 0.2); color: var(--xf-red); border: 1px solid var(--xf-red); }

        /* --- POPUP CARD --- */
        #xf-card { position: fixed; z-index: 10000; width: 300px; background: var(--xf-bg); backdrop-filter: blur(12px); border: 1px solid var(--xf-border); border-radius: 16px; padding: 12px; color: var(--xf-text); font-family: ${FONT_STACK}; box-shadow: 0 15px 40px rgba(0,0,0,0.7); opacity: 0; transform: translateY(10px); transition: 0.2s; pointer-events: none; direction: ${IS_RTL?'rtl':'ltr'}; text-align: ${IS_RTL?'right':'left'}; }
        #xf-card.visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .xf-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--xf-border); padding-bottom: 8px; margin-bottom: 8px; }
        .xf-title { font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--xf-dim); }
        .xf-badge { font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: var(--xf-border); color: #fff; }
        .xf-retry { font-size: 16px; cursor: pointer; color: var(--xf-blue); padding: 2px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: 10px; }

        /* CARD TABS */
        .xf-tabs-nav { display: flex; border-bottom: 1px solid var(--xf-border); margin-bottom: 10px; gap: 5px; }
        .xf-tab-btn { flex: 1; text-align: center; padding: 6px 0; font-size: 11px; font-weight: bold; color: var(--xf-dim); cursor: pointer; border-bottom: 2px solid transparent; transition: 0.2s; }
        .xf-tab-btn:hover { color: var(--xf-text); background: rgba(255,255,255,0.05); border-radius: 4px 4px 0 0; }
        .xf-tab-btn.active { color: var(--xf-blue); border-bottom-color: var(--xf-blue); }
        .xf-tab-content { display: none; animation: xf-fade 0.2s; max-height: 450px; overflow-y: auto; }
        .xf-tab-content.active { display: block; }
        @keyframes xf-fade { from { opacity: 0; } to { opacity: 1; } }

        /* CARD CONTENT */
        .xf-bar-bg { height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 10px; overflow: hidden; }
        .xf-bar-fill { height: 100%; transition: width 0.5s; }
        .xf-status { padding: 8px; border-radius: 6px; font-size: 11px; line-height: 1.3; margin-bottom: 10px; background: rgba(255,255,255,0.03); border-${IS_RTL?'right':'left'}: 3px solid transparent; }
        .xf-grid { display: grid; gap: 5px; font-size: 12px; }
        .xf-row { display: flex; justify-content: space-between; }
        .xf-lbl { color: var(--xf-dim); }
        .xf-val { font-weight: 600; direction: ltr; }
        .xf-mono { font-family: monospace; background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 4px; font-size: 11px; }
        .xf-ftr { margin-top: 10px; text-align: center; }
        .xf-btn { display: block; padding: 8px; background: rgba(29,155,240,0.15); color: var(--xf-blue); border-radius: 8px; font-weight: bold; font-size: 11px; text-decoration: none; font-family: ${FONT_STACK}; }

        /* CARD ANALYSIS */
        .xf-analysis-section { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 8px; border: 1px solid var(--xf-border); }
        .xf-analysis-title { font-size: 11px; font-weight: 800; color: var(--xf-dim); margin-bottom: 8px; text-transform: uppercase; border-bottom: 1px solid var(--xf-border); padding-bottom: 4px; }
        .xf-evidence-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 8px; }
        .xf-evidence-badge { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 10px; padding: 4px; border-radius: 4px; background: rgba(255,255,255,0.08); border: 1px solid var(--xf-border); color: #fff; font-weight: bold; white-space: nowrap; }
        .xf-evidence-badge.xf-ev-danger { background: rgba(249, 24, 128, 0.15); border-color: var(--xf-red); color: #ffadad; }
        .xf-evidence-badge.xf-ev-warn { background: rgba(255, 212, 0, 0.1); border-color: var(--xf-orange); color: #ffeaa7; }
        .xf-evidence-badge.xf-ev-ok { background: rgba(0, 186, 124, 0.1); border-color: var(--xf-green); color: #a2ffce; }
        .xf-analysis-summary { font-size: 11px; color: var(--xf-text); line-height: 1.4; padding: 5px; border-left: 2px solid var(--xf-dim); }

        /* CARD TOOLS */
        .xf-tags-container { margin-top: 5px; }
        .xf-tags-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .xf-tag-opt { display: flex; align-items: center; font-size: 11px; color: var(--xf-text); cursor: pointer; user-select: none; }
        .xf-tag-opt input { margin-right: 5px; accent-color: var(--xf-blue); cursor: pointer; }
        .xf-textarea { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--xf-border); color: #fff; border-radius: 8px; padding: 8px; margin-top: 10px; font-family: ${FONT_STACK}; font-size: 11px; resize: vertical; min-height: 40px; box-sizing: border-box; outline: none; }
        .xf-textarea:focus { border-color: var(--xf-blue); }
        .xf-osint-row { display: flex; gap: 15px; margin-top: 15px; justify-content: center; padding-top:10px; border-top:1px solid var(--xf-border); }
        .xf-osint-icon { font-size: 18px; cursor: pointer; opacity: 0.7; transition: 0.2s; text-decoration: none; }
        .xf-osint-icon:hover { opacity: 1; transform: scale(1.2); }

        /* TAG CLOUD (New) */
        .xf-tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--xf-border); }
        .xf-tag-btn { background: rgba(255,255,255,0.1); border: 1px solid var(--xf-border); color: var(--xf-dim); padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 11px; transition: 0.2s; user-select: none; }
        .xf-tag-btn:hover { background: rgba(29,155,240,0.15); color: var(--xf-blue); border-color: var(--xf-blue); }
        .xf-tag-btn.active { background: var(--xf-blue); color: #fff; border-color: var(--xf-blue); }
        .xf-tag-count { background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 10px; margin-left: 5px; font-size: 9px; opacity: 0.8; }

        /* Language & Misc */
        .xf-lang-section { margin-top:10px; font-size:11px; color:var(--xf-dim); display:flex; gap:5px; align-items:center; }
        .xf-lang-opt { cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: 0.2s; }
        .xf-lang-opt:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .xf-lang-active { background: rgba(29,155,240,0.2); color: var(--xf-blue); font-weight: bold; }
        #xf-mob-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 99999; display: none; align-items: flex-end; justify-content: center; backdrop-filter: blur(5px); direction: ${IS_RTL?'rtl':'ltr'}; }
        #xf-mob-sheet { width: 100%; max-width: 450px; background: #000; border-top: 1px solid var(--xf-border); border-radius: 20px 20px 0 0; padding: 20px; animation: xf-up 0.3s; font-family: ${FONT_STACK}; }
        .xf-close { margin-top: 15px; padding: 12px; background: #eff3f4; color: #000; text-align: center; border-radius: 99px; font-weight: 700; font-size: 14px; cursor: pointer; user-select: none; }
    `;

    const styleEl = document.createElement("style");
    styleEl.innerHTML = STYLES;
    document.head.appendChild(styleEl);

    // --- 4. LOGIC ---
    const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    const SOURCE_REGEX = /^(.*?)\s+(App\s?Store|Google\s?Play|Play\s?Store|Android\s?App|iOS\s?App)$/i;
    const ARABIC_SCRIPT_REGEX = /[\u0600-\u06FF]/;
    const SUSPICIOUS_LINKS = /(t\.me|telegram\.me|ngl\.link|harfeto|biocast|daigo|sarahah|f3\.cool|tellonym)/i;

    const COUNTRY_MAP={AF:"Afghanistan",AL:"Albania",DZ:"Algeria",AD:"Andorra",AO:"Angola",AR:"Argentina",AM:"Armenia",AU:"Australia",AT:"Austria",AZ:"Azerbaijan",BS:"Bahamas",BH:"Bahrain",BD:"Bangladesh",BB:"Barbados",BY:"Belarus",BE:"Belgium",BZ:"Belize",BJ:"Benin",BT:"Bhutan",BO:"Bolivia",BA:"Bosnia",BW:"Botswana",BR:"Brazil",BG:"Bulgaria",BF:"Burkina Faso",BI:"Burundi",KH:"Cambodia",CM:"Cameroon",CA:"Canada",CL:"Chile",CN:"China",CO:"Colombia",CR:"Costa Rica",HR:"Croatia",CU:"Cuba",CY:"Cyprus",CZ:"Czechia",DK:"Denmark",DO:"Dominican Republic",EC:"Ecuador",EG:"Egypt",SV:"El Salvador",EE:"Estonia",ET:"Ethiopia",FI:"Finland",FR:"France",GE:"Georgia",DE:"Germany",GH:"Ghana",GR:"Greece",GT:"Guatemala",HN:"Honduras",HU:"Hungary",IS:"Iceland",IN:"India",ID:"Indonesia",IR:"Iran",IQ:"Iraq",IE:"Ireland",IL:"Israel",IT:"Italy",JM:"Jamaica",JP:"Japan",JO:"Jordan",KZ:"Kazakhstan",KE:"Kenya",KW:"Kuwait",LV:"Latvia",LB:"Lebanon",LY:"Libya",LT:"Lithuania",LU:"Luxembourg",MG:"Madagascar",MY:"Malaysia",MV:"Maldives",MX:"Mexico",MC:"Monaco",MA:"Morocco",NP:"Nepal",NL:"Netherlands",NZ:"New Zealand",NG:"Nigeria",NO:"Norway",OM:"Oman",PK:"Pakistan",PA:"Panama",PY:"Paraguay",PE:"Peru",PH:"Philippines",PL:"Poland",PT:"Portugal",QA:"Qatar",RO:"Romania",RU:"Russia",SA:"Saudi Arabia",SN:"Senegal",RS:"Serbia",SG:"Singapore",SK:"Slovakia",SI:"Slovenia",ZA:"South Africa",KR:"South Korea",ES:"Spain",LK:"Sri Lanka",SE:"Sweden",CH:"Switzerland",TW:"Taiwan",TH:"Thailand",TN:"Tunisia",TR:"Turkey",UA:"Ukraine",AE:"United Arab Emirates",GB:"United Kingdom",US:"United States",UY:"Uruguay",VE:"Venezuela",VN:"Vietnam",YE:"Yemen",ZW:"Zimbabwe"};

    let lastUrl = location.href;
    let tooltipEl = null, hideTimeout = null, isInjecting = false;
    let currentPage = 1;
    const ITEMS_PER_PAGE = 50;

    // --- HELPERS ---
    function getCsrf() { return document.cookie.match(/(?:^|; )ct0=([^;]+)/)?.[1] || ""; }
    function getUser() { return window.location.pathname.split('/')[1]; }
    function formatTime(ts) { return ts ? new Date(ts).toLocaleString(ACTIVE_LANG === 'en' ? 'en-US' : 'fa-IR') : "N/A"; }
    function setLang(lang) { localStorage.setItem("xf_lang_pref", lang); location.reload(); }
    function getCountryDisplay(code) {
        if (!code) return TEXT.values.unknown;
        if (code === "West Asia") return TEXT.values.west_asia;
        return COUNTRY_MAP[code] || code;
    }

    function getCleanDB() {
        const clean = JSON.parse(JSON.stringify(db));
        Object.keys(clean).forEach(k => {
            if (clean[k].data) delete clean[k].data.isBlocked;
            if (clean[k].html) delete clean[k].html;
        });
        return clean;
    }

    // --- DATE & PARSING HELPERS ---
    function toEnglishDigits(str) {
        if (!str) return "";
        const persianNums = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
        const arabicNums = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
        return str.toString()
            .replace(/[۰-۹]/g, w => persianNums.indexOf(w))
            .replace(/[٠-٩]/g, w => arabicNums.indexOf(w));
    }

    // Simple Jalaali to Gregorian converter (Math based)
    function jalaliToGregorian(jy, jm, jd) {
        jy = parseInt(jy) - 979;
        jm = parseInt(jm) - 1;
        jd = parseInt(jd) - 1;
        let j_day_no = 365 * jy + parseInt(jy / 33) * 8 + parseInt((jy % 33 + 3) / 4);
        for (let i = 0; i < jm; ++i) j_day_no += (i < 6) ? 31 : 30;
        let g_day_no = j_day_no + jd + 79;
        let gy = 1600 + 400 * parseInt(g_day_no / 146097);
        g_day_no = g_day_no % 146097;
        let leap = true;
        if (g_day_no >= 36525) {
            g_day_no--;
            gy += 100 * parseInt(g_day_no / 36524);
            g_day_no = g_day_no % 36524;
            if (g_day_no >= 365) g_day_no++; else leap = false;
        }
        gy += 4 * parseInt(g_day_no / 1461);
        g_day_no %= 1461;
        if (g_day_no >= 366) {
            leap = false;
            g_day_no--;
            gy += parseInt(g_day_no / 365);
            g_day_no = g_day_no % 365;
        }
        let i;
        for (i = 0; g_day_no >= ((i < 1 || !leap) ? [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i] : [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i]); i++) {
            g_day_no -= ((i < 1 || !leap) ? [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i] : [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i]);
        }
        return new Date(gy, i - 1, g_day_no + 1);
    }

    function parseFlexibleDate(dateStr) {
        if (!dateStr) return Date.now();
        // If it's a raw timestamp number
        if (typeof dateStr === 'number') return dateStr;

        // Normalize digits
        let safeStr = toEnglishDigits(dateStr);

        // Check for Shamsi pattern: YYYY/MM/DD or YYYY-MM-DD (where YYYY starts with 13 or 14)
        // Regex looks for 4 digits (starting with 13 or 14), separator, 1-2 digits, separator, 1-2 digits
        const shamsiMatch = safeStr.match(/^(1[34][0-9]{2})[\/\-]([0-9]{1,2})[\/\-]([0-9]{1,2})/);

        if (shamsiMatch) {
            // It's Shamsi
            const y = parseInt(shamsiMatch[1]);
            const m = parseInt(shamsiMatch[2]);
            const d = parseInt(shamsiMatch[3]);
            const gDate = jalaliToGregorian(y, m, d);
            return gDate.getTime();
        }

        // Fallback to standard Gregorian parse
        const gTs = Date.parse(safeStr);
        return isNaN(gTs) ? Date.now() : gTs;
    }

    // --- DOM SCRAPING HELPERS ---
    function parseStatString(str) {
        if (!str) return 0;
        // Remove "Following", "Followers", "posts", newlines, etc.
        let clean = str.replace(/\n/g, ' ').replace(/Following|Followers|posts|post/gi, '').trim();
        // Take the first part if there are spaces (e.g. "2,664 ")
        clean = clean.split(' ')[0];
        clean = clean.replace(/,/g, '');

        let multiplier = 1;
        if (clean.toUpperCase().includes('K')) { multiplier = 1000; clean = clean.replace(/K/i, ''); }
        else if (clean.toUpperCase().includes('M')) { multiplier = 1000000; clean = clean.replace(/M/i, ''); }
        else if (clean.toUpperCase().includes('B')) { multiplier = 1000000000; clean = clean.replace(/B/i, ''); }

        const val = parseFloat(clean);
        return isNaN(val) ? 0 : val * multiplier;
    }

    function scrapeProfileStats(username) {
        // We search within the primary column to avoid picking up sidebars/who-to-follow
        const mainCol = document.querySelector('div[data-testid="primaryColumn"]');
        if (!mainCol) return { following: null, followers: null, tweets: null };

        // 1. Tweet Count (Top Sticky Header)
        // Looks for text like "4,673 posts" inside the header div
        let tweets = null;
        const headerDivs = mainCol.querySelectorAll('h2[role="heading"] + div');
        headerDivs.forEach(div => {
            if (div.innerText.toLowerCase().includes('post')) {
                tweets = parseStatString(div.innerText);
            }
        });

        // 2. Following/Followers (Links in the bio area)
        const links = Array.from(mainCol.querySelectorAll('a[role="link"]'));
        let following = null;
        let followers = null;

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // Check using endsWith to ignore username casing issues
            if (href.endsWith('/following')) {
                following = parseStatString(link.innerText);
            }
            else if (href.endsWith('/verified_followers') || href.endsWith('/followers')) {
                // X sometimes redirects /followers to /verified_followers, check both
                followers = parseStatString(link.innerText);
            }
        });

        return { following, followers, tweets };
    }

    // --- BATCH PROCESSING LOGIC ---

    function updateBatchUI(clearList = false) {
        const statusEl = document.getElementById('xf-batch-status');
        const progressEl = document.getElementById('xf-batch-progress');
        const rateEl = document.getElementById('xf-batch-rate-status');
        const startBtn = document.getElementById('xf-batch-start');
        const resultsListEl = document.getElementById('xf-batch-results-list');

        // Safety Exit
        if (!statusEl || !startBtn) return;

        if (batchState.isPaused) {
            statusEl.textContent = TEXT.batch.status_paused;
            statusEl.style.color = 'var(--xf-orange)';
            if (rateEl) rateEl.textContent = TEXT.batch.rate_limit_wait.replace('{s}', batchState.currentWaitTime);
            startBtn.textContent = TEXT.dashboard.btn_stop;
            startBtn.classList.remove('xf-btn-blue');
            startBtn.classList.add('xf-btn-red');
        } else if (batchState.isRunning) {
            statusEl.textContent = TEXT.batch.status_running;
            statusEl.style.color = 'var(--xf-blue)';
            if (rateEl) rateEl.textContent = '';
            startBtn.textContent = TEXT.dashboard.btn_stop;
            startBtn.classList.remove('xf-btn-blue');
            startBtn.classList.add('xf-btn-red');
        } else {
            if (batchState.total > 0 && batchState.index >= batchState.total) {
                statusEl.textContent = TEXT.batch.status_done;
                statusEl.style.color = 'var(--xf-green)';
            } else {
                statusEl.textContent = batchState.isAborted ? TEXT.batch.status_stopped : TEXT.batch.status_idle;
                statusEl.style.color = batchState.isAborted ? 'var(--xf-red)' : 'var(--xf-green)';
            }
            if (rateEl) rateEl.textContent = '';
            startBtn.textContent = TEXT.batch.btn_start;
            startBtn.disabled = false;
            startBtn.classList.remove('xf-btn-red');
            startBtn.classList.add('xf-btn-blue');
        }

        if (progressEl) {
            progressEl.innerHTML = TEXT.batch.progress
                .replace('{c}', batchState.index)
                .replace('{t}', batchState.total)
                .replace('{ok}', batchState.okCount)
                .replace('{err}', batchState.errCount);
        }

        if (clearList && resultsListEl) {
            resultsListEl.innerHTML = '';
        } else if (resultsListEl) {
            resultsListEl.scrollTop = resultsListEl.scrollHeight;
        }
    }

    function mapRawDataToBatchOutput(res) {
        const output = {};
        const isDeleted = res.is_deleted === true;

        const isFieldEnabled = (id) => batchState.enabledFields.has(id);

        if (isDeleted) {
            if(isFieldEnabled('username')) output[TEXT.batch.col_username] = res.core.screen_name;
            if(isFieldEnabled('name')) output[TEXT.batch.col_name] = 'SUSPENDED/DELETED';
            if(isFieldEnabled('id_changes')) output[TEXT.batch.col_id_changes] = 0;
            if(isFieldEnabled('last_change')) output[TEXT.batch.col_last_change] = 'N/A';
            if(isFieldEnabled('created')) output[TEXT.batch.col_created] = 'N/A';
            if(isFieldEnabled('deleted')) output[TEXT.batch.col_deleted] = 0;
            if(isFieldEnabled('device')) output[TEXT.batch.col_device] = 2;
            if(isFieldEnabled('loc_status')) output[TEXT.batch.col_location_status] = 0;
            if(isFieldEnabled('gender')) output[TEXT.batch.col_gender] = 2;
            if(isFieldEnabled('numeric_id')) output[TEXT.batch.col_numeric_id] = 'N/A';
            if(isFieldEnabled('location')) output[TEXT.batch.col_location] = 'N/A';
            if(isFieldEnabled('avatar')) output[TEXT.batch.col_avatar] = 'N/A';
            if(isFieldEnabled('lang')) output[TEXT.batch.col_lang] = 'other';
            if(isFieldEnabled('verified')) output[TEXT.batch.col_verified] = 0;
            return output;
        }

        const core = res.core || res.legacy || {};
        const about = res.about_profile || res.aboutProfile || {};
        const verif = res.verification_info || {};

        const username = core.screen_name || 'N/A';
        const name = core.name || 'N/A';
        const rest_id = res.rest_id || 'N/A';
        const renameCount = parseInt(about.username_changes?.count || 0);

        const lastChangedMsec = about.username_changes?.last_changed_at_msec;
        let lastChangedDate = 'N/A';
        if (lastChangedMsec) {
            lastChangedDate = formatTime(parseInt(lastChangedMsec));
        }

        const createdAt = core.created_at;
        const createdDate = createdAt ? formatTime(createdAt) : 'N/A';
        const accountStatus = 1;

        const sourceRaw = about.source || TEXT.values.unknown;
        let deviceType = 2;
        const match = sourceRaw.match(SOURCE_REGEX);
        if (match) {
            const type = match[2].toLowerCase();
            if (type.includes("app") || type.includes("ios") || type.includes("iphone")) deviceType = 1;
            else if (type.includes("play") || type.includes("android")) deviceType = 0;
        }

        let locationStatus = 0;
        if (about.account_based_in) {
            if (about.location_accurate === true) locationStatus = 1;
            else locationStatus = 2;
        }

        const rawCountry = about.account_based_in;
        const countryDisplay = getCountryDisplay(rawCountry);
        const avatarUrl = (res.avatar?.image_url || "").replace("_normal", "_400x400");
        const isVerified = verif.is_identity_verified === true ? 1 : 0;

        const bio = core.description || "";
        const isPersianSpeaker = ARABIC_SCRIPT_REGEX.test(name) || ARABIC_SCRIPT_REGEX.test(bio);
        const langCode = isPersianSpeaker ? 'fa' : 'other';

        if(isFieldEnabled('username')) output[TEXT.batch.col_username] = username;
        if(isFieldEnabled('name')) output[TEXT.batch.col_name] = name;
        if(isFieldEnabled('id_changes')) output[TEXT.batch.col_id_changes] = renameCount;
        if(isFieldEnabled('last_change')) output[TEXT.batch.col_last_change] = lastChangedDate;
        if(isFieldEnabled('created')) output[TEXT.batch.col_created] = createdDate;
        if(isFieldEnabled('deleted')) output[TEXT.batch.col_deleted] = accountStatus;
        if(isFieldEnabled('device')) output[TEXT.batch.col_device] = deviceType;
        if(isFieldEnabled('loc_status')) output[TEXT.batch.col_location_status] = locationStatus;
        if(isFieldEnabled('gender')) output[TEXT.batch.col_gender] = 2;
        if(isFieldEnabled('numeric_id')) output[TEXT.batch.col_numeric_id] = rest_id;
        if(isFieldEnabled('location')) output[TEXT.batch.col_location] = countryDisplay;
        if(isFieldEnabled('avatar')) output[TEXT.batch.col_avatar] = avatarUrl;
        if(isFieldEnabled('lang')) output[TEXT.batch.col_lang] = langCode;
        if(isFieldEnabled('verified')) output[TEXT.batch.col_verified] = isVerified;

        return output;
    }

    async function handleRateLimit() {
        batchState.isPaused = true;
        batchState.currentWaitTime = RATE_LIMIT_PAUSE;

        const resultsListEl = document.getElementById('xf-batch-results-list');
        if (resultsListEl) resultsListEl.innerHTML += `<div style="color:var(--xf-orange); font-weight: bold;">--- ${TEXT.batch.rate_limit_msg} ---</div>`;

        updateBatchUI();

        const startTime = Date.now();

        while (batchState.currentWaitTime > 0 && !batchState.isAborted) {
            await new Promise(r => setTimeout(r, 1000));
            batchState.currentWaitTime = Math.max(0, RATE_LIMIT_PAUSE - Math.floor((Date.now() - startTime) / 1000));
            updateBatchUI();
        }

        if (!batchState.isAborted) {
            batchState.isPaused = false;
            if (resultsListEl) resultsListEl.innerHTML += `<div style="color:var(--xf-green);">--- Resuming Processing ---</div>`;
            processBatchStep();
        } else {
            batchState.isRunning = false;
            updateBatchUI();
        }
    }


    async function processBatchStep() {
        while (batchState.index < batchState.total && batchState.isRunning && !batchState.isAborted) {

            // Check Paused State (Rate Limit)
            if (batchState.isPaused) {
                updateBatchUI();
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }

            const username = batchState.list[batchState.index];
            const resultsListEl = document.getElementById('xf-batch-results-list');

            // --- SKIP LOGIC ---
            if (batchState.config.skip && db[username]) {
                if (resultsListEl) {
                    resultsListEl.innerHTML += `<div style="color:var(--xf-dim);">⏭️ @${username} (Skipped - In DB)</div>`;
                }
                batchState.results.push({ [TEXT.batch.col_username]: username, [TEXT.batch.col_name]: 'SKIPPED' });
                batchState.index++;
                updateBatchUI();
                await new Promise(r => setTimeout(r, 10)); // Tiny delay to prevent UI freeze
                continue;
            }

            // --- FETCH ---
            try {
                const url = `https://${location.host}/i/api/graphql/${CONFIG.queryId}/AboutAccountQuery?variables=${encodeURIComponent(JSON.stringify({screenName:username}))}&features=${encodeURIComponent(JSON.stringify(CONFIG.features))}&fieldToggles=${encodeURIComponent(JSON.stringify({withAuxiliaryUserLabels:false}))}`;

                const response = await fetch(url, {
                    headers: {
                        "authorization": `Bearer ${CONFIG.bearerToken}`,
                        "x-csrf-token": getCsrf(),
                        "content-type": "application/json"
                    }
                });

                if (response.status === 429) {
                    batchState.isPaused = true;
                    batchState.currentWaitTime = 60; // 60 seconds
                    handleRateLimit(); // Start countdown
                    continue; // Restart loop iteration
                }

                const json = await response.json();

                // --- HANDLE ERRORS ---
                if (json.errors && json.errors.length > 0) {
                     const errorMsg = json.errors[0].message;
                     let statusStr = 'ERROR';
                     if (errorMsg.includes("Not found") || errorMsg.includes("Suspended")) statusStr = 'SUSPENDED';

                     batchState.results.push({ [TEXT.batch.col_username]: username, [TEXT.batch.col_name]: statusStr });
                     if (resultsListEl) resultsListEl.innerHTML += `<div style="color:var(--xf-red);">❌ @${username} (${statusStr})</div>`;

                     // Don't count as error if it's just suspended, it's a valid result
                     if(statusStr === 'SUSPENDED') batchState.okCount++; else batchState.errCount++;

                } else {
                    // --- HANDLE SUCCESS ---
                    const res = json?.data?.user?.result || json?.data?.user_result_by_screen_name?.result;

                    if (res) {
                        const resultObj = mapRawDataToBatchOutput(res);
                        batchState.results.push(resultObj);
                        batchState.okCount++;

                        if (resultsListEl) resultsListEl.innerHTML += `<div>✅ @${username}</div>`;

                        // --- MERGE LOGIC ---
                        if (batchState.config.merge) {
                            try {
                                const core = res.core || res.legacy || {};
                                const about = res.about_profile || res.aboutProfile || {};
                                const verif = res.verification_info || {};

                                // --- FIX: Parse Device Source ---
                                const sourceRaw = about.source || TEXT.values.unknown;
                                let devShort = sourceRaw, devFull = sourceRaw;
                                const match = sourceRaw.match(SOURCE_REGEX);
                                if (match) {
                                    const region = match[1].trim();
                                    const type = match[2].toLowerCase();
                                    let tech = TEXT.labels.device;
                                    if (type.includes("app") || type.includes("ios")) tech = "iPhone";
                                    else if (type.includes("play") || type.includes("android")) tech = "Android";
                                    devShort = tech;
                                    devFull = `${tech} (${region})`;
                                } else if (sourceRaw !== TEXT.values.unknown) {
                                    devShort = TEXT.labels.device;
                                }
                                // --------------------------------

                                const createdAt = new Date(res.core?.created_at || res.legacy?.created_at);
                                const createdTs = createdAt.getTime();
                                const now = Date.now();
                                const ageDays = Math.max(1, (now - createdTs) / (1000 * 60 * 60 * 24));
                                const tweetCount = res.legacy?.statuses_count || 0;

                                const data = {
                                    country: getCountryDisplay(about.account_based_in),
                                    countryCode: about.account_based_in,
                                    device: devShort,
                                    deviceFull: devFull,
                                    id: res.rest_id,
                                    created: formatTime(createdTs),
                                    created_raw: createdTs,
                                    renamed: parseInt(about.username_changes?.count || 0),
                                    isAccurate: about.location_accurate,
                                    isIdVerified: verif.is_identity_verified === true,
                                    langCode: (ARABIC_SCRIPT_REGEX.test(core.name||"") ? 'fa' : null),
                                    avatar: (res.avatar?.image_url || "").replace("_normal", "_400x400"),
                                    isBlocked: res.legacy?.blocking === true,
                                    tpd: (tweetCount / ageDays).toFixed(1),
                                    ratio: (res.legacy?.followers_count > 0 ? (res.legacy?.friends_count / res.legacy?.followers_count).toFixed(2) : 0),
                                    following: res.legacy?.friends_count || 0,
                                    hasSusLink: SUSPICIOUS_LINKS.test(core.description || "")
                                };

                                let color = "var(--xf-green)";
                                if (!data.isAccurate) {
                                    // Check if device indicates Iran/West Asia to determine risk
                                    const isTargetDev = (data.deviceFull || "").match(/Iran|West Asia|غرب آسیا/i);
                                    if (isTargetDev) {
                                        color = "var(--xf-green)"; // Shield Normal
                                    } else {
                                        color = "var(--xf-red)"; // Shield Active
                                    }
                                }
                                else if (data.countryCode === "Iran" || data.countryCode === "West Asia") {
                                    color = "var(--xf-orange)";
                                }

                                const existingTags = db[username]?.tags || [];
                                const existingNote = db[username]?.note || "";

                                db[username] = {
                                    data, pillText: `📍 ${data.country}`, color, note: existingNote, tags: existingTags,
                                    html: renderCardHTML(data, username, existingTags, existingNote)
                                };
                                saveDB();
                            } catch(e) { console.error("Merge error", e); }
                        }
                    }
                }

            } catch (e) {
                console.error(e);
                batchState.errCount++;
                if (resultsListEl) resultsListEl.innerHTML += `<div style="color:var(--xf-red);">❌ @${username} (Net Error)</div>`;
            }

            batchState.index++;
            updateBatchUI();
            await new Promise(r => setTimeout(r, BATCH_DELAY));
        }

        // Loop Finished
        if (!batchState.isPaused) {
            batchState.isRunning = false;
            updateBatchUI();
        }
    }

    function startBatchProcessing() {
        if (batchState.isRunning) {
            batchState.isAborted = true;
            updateBatchUI();
            return;
        }

        const inputArea = document.getElementById('xf-batch-input');
        if (!inputArea) return; // Safety check

        const rawList = inputArea.value.split('\n').map(u => u.trim().replace(/^@/, '')).filter(u => u.length > 0);

        if (rawList.length === 0) return;

        // --- SAVE CONFIG BEFORE STARTING ---
        batchState.config.merge = document.getElementById('xf-batch-auto-save')?.checked || false;
        batchState.config.skip = document.getElementById('xf-batch-skip-existing')?.checked || false;

        batchState.list = rawList;
        batchState.total = rawList.length;
        batchState.index = 0;
        batchState.okCount = 0;
        batchState.errCount = 0;
        batchState.isRunning = true;
        batchState.isAborted = false;
        batchState.isPaused = false;
        batchState.results = [];

        // Clear UI Log
        const resultsListEl = document.getElementById('xf-batch-results-list');
        if(resultsListEl) resultsListEl.innerHTML = '';

        updateBatchUI();
        processBatchStep();
    }

    function exportBatchJson() {
        if (batchState.results.length === 0) {
            alert("No results to export yet.");
            return;
        }
        const blob = new Blob([JSON.stringify(batchState.results, null, 2)], { type: "application/json" });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${TEXT.batch.export_filename}_${Date.now()}.json`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }

    function renderBatchView(container) {
        container.innerHTML = `
            <div class="xf-view-header">
                <button class="xf-action-btn xf-btn-primary" id="xf-back-btn" style="margin-right:10px;">${TEXT.dashboard.btn_back}</button>
                ${TEXT.batch.title}
            </div>

            <div style="display:flex; gap:10px; height:100%; overflow:hidden;">
                <!-- Left: Config -->
                <div style="flex:1; display:flex; flex-direction:column; overflow-y:auto;">
                    <textarea id="xf-batch-input" class="xf-textarea" style="height:120px; direction:ltr;" placeholder="${TEXT.batch.input_placeholder}"></textarea>

                    <div style="margin:10px 0; border:1px solid var(--xf-border); padding:10px; border-radius:8px;">
                        <label class="xf-batch-opt" style="font-weight:bold; color:var(--xf-blue); display:flex; margin-bottom:5px;">
                            <input type="checkbox" id="xf-batch-auto-save" ${batchState.config.merge ? 'checked' : ''}> ${TEXT.batch.merge_label}
                        </label>
                        <label class="xf-batch-opt" style="font-weight:bold; color:var(--xf-orange); display:flex;">
                            <input type="checkbox" id="xf-batch-skip-existing" ${batchState.config.skip ? 'checked' : ''}> ${TEXT.batch.skip_label}
                        </label>
                    </div>

                    <div style="font-size:11px; font-weight:bold; margin-bottom:5px;">${TEXT.batch.fields_label}</div>
                    <div class="xf-batch-options" style="max-height:150px;">
                        ${BATCH_FIELDS.map(field => `
                            <label class="xf-batch-opt"><input type="checkbox" data-id="${field.id}" ${batchState.enabledFields.has(field.id) ? 'checked' : ''}> ${TEXT.batch[field.labelKey]}</label>
                        `).join('')}
                    </div>

                    <div class="xf-btn-row" style="margin-top:auto;">
                        <button id="xf-batch-start" class="xf-dash-btn xf-btn-blue">${TEXT.batch.btn_start}</button>
                        <button id="xf-batch-export" class="xf-dash-btn xf-btn-green">${TEXT.batch.btn_export_json}</button>
                    </div>
                </div>

                <!-- Right: Log -->
                <div style="flex:1; display:flex; flex-direction:column; border-left:1px solid var(--xf-border); padding-left:10px;">
                    <div style="font-size:12px; font-weight:bold; margin-bottom:5px;">Log</div>
                    <div id="xf-batch-results-list" style="flex:1; overflow-y:auto; background:rgba(255,255,255,0.05); border-radius:8px; padding:5px; font-size:11px; font-family:monospace; direction:ltr;"></div>

                    <!-- FIXED: Added Rate Status Element Here -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                        <div id="xf-batch-status" style="font-size:11px; color:var(--xf-green); font-weight:bold;">${TEXT.batch.status_idle}</div>
                        <div id="xf-batch-rate-status" style="font-size:10px; color:var(--xf-orange);"></div>
                    </div>

                    <div id="xf-batch-progress" style="font-size:10px; color:var(--xf-dim); direction:ltr;"></div>
                </div>
            </div>
        `;

        if (batchState.list.length > 0) {
             document.getElementById('xf-batch-input').value = batchState.list.join('\n');
        }

        const resultsListEl = document.getElementById('xf-batch-results-list');
        if (batchState.results.length > 0) {
            batchState.results.forEach((res) => {
                let char = '✅';
                let name = res[TEXT.batch.col_username] || "User";
                if (Object.values(res).some(v => v === 'API ERROR' || v === 'SUSPENDED')) char = '❌';
                if (Object.values(res).some(v => v === 'SKIPPED')) char = '⏭️';
                resultsListEl.innerHTML += `<div>${char} @${name}</div>`;
            });
            resultsListEl.scrollTop = resultsListEl.scrollHeight;
        }

        updateBatchUI();

        document.getElementById('xf-back-btn').onclick = () => window.xfNavigate('tools');

        const checks = container.querySelectorAll('.xf-batch-options input[type="checkbox"]');
        checks.forEach(chk => {
            chk.onchange = (e) => {
                const id = e.target.getAttribute('data-id');
                if (e.target.checked) batchState.enabledFields.add(id); else batchState.enabledFields.delete(id);
            };
        });

        document.getElementById('xf-batch-auto-save').onchange = (e) => { batchState.config.merge = e.target.checked; };
        document.getElementById('xf-batch-skip-existing').onchange = (e) => { batchState.config.skip = e.target.checked; };

        document.getElementById('xf-batch-start').onclick = startBatchProcessing;
        document.getElementById('xf-batch-export').onclick = exportBatchJson;
    }

    // --- DASHBOARD UI ---
    function injectNativeMenu() {
        if (document.getElementById('xf-menu-btn') || document.getElementById('xf-mob-fab')) return;

        if (!IS_MOBILE) {
            const nav = document.querySelector('nav[aria-label="Primary"]');
            if (!nav) return;

            const item = document.createElement('a');
            item.id = "xf-menu-btn";
            item.className = "xf-menu-item";
            item.href = "#";
            item.setAttribute("role", "link");
            item.innerHTML = `
                <div style="display:flex;align-items:center;">
                <svg viewBox="0 0 24 24" class="xf-menu-icon"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"></path></svg>
                <span class="xf-menu-text">${TEXT.menu_btn}</span>
                </div>
            `;
            item.onclick = (e) => { e.preventDefault(); showDashboard(); };

            const more = nav.querySelector('[data-testid="AppTabBar_More_Menu"]');
            if (more) more.parentNode.insertBefore(item, more);
            else nav.appendChild(item);

        } else {
            const fab = document.createElement('div');
            fab.id = "xf-mob-fab";
            fab.innerHTML = `<svg viewBox="0 0 24 24" class="xf-mob-icon" style="fill:#fff"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"></path></svg>`;
            fab.onclick = showDashboard;
            document.body.appendChild(fab);
        }
    }

    function initDashboard() {
        const overlay = document.createElement("div");
        overlay.id = "xf-dash-overlay";
        overlay.onclick = (e) => { if(e.target===overlay) overlay.style.display="none"; };
        document.body.appendChild(overlay);

        const input = document.createElement("input");
        input.type = "file"; input.id = "xf-restore-input"; input.style.display = "none"; input.accept = ".json";
        input.onchange = handleRestore;
        document.body.appendChild(input);
    }

    function getRiskKey(label) {
        if (!label) return null;
        // Check English definitions
        for (const [key, val] of Object.entries(TRANSLATIONS.en.risk)) {
            if (val === label) return key;
        }
        // Check Persian definitions
        for (const [key, val] of Object.entries(TRANSLATIONS.fa.risk)) {
            if (val === label) return key;
        }
        return null; // Unknown or custom
    }

    function getFilteredUsers() {
        const locFilter = document.getElementById("xf-filter-loc")?.value.toLowerCase() || "";
        const riskFilterLabel = document.getElementById("xf-filter-risk")?.value || "ALL";
        const tagFilter = document.getElementById("xf-filter-tag")?.value || "ALL"; // <--- NEW INPUT
        const searchFilter = document.getElementById("xf-search-user")?.value.toLowerCase() || "";

        const riskFilterKey = riskFilterLabel === "ALL" ? "ALL" : getRiskKey(riskFilterLabel);
        const allKeys = Object.keys(db).reverse();
        const filteredKeys = [];

        for (const user of allKeys) {
            if (!db[user] || !db[user].data) continue;

            const entry = db[user].data;
            const tags = db[user].tags || [];
            const entryRiskKey = getRiskKey(entry.riskLabel);

            // 1. Location
            if (locFilter && !entry.country.toLowerCase().includes(locFilter)) continue;

            // 2. Risk
            if (riskFilterKey !== "ALL" && entryRiskKey !== riskFilterKey) continue;

            // 3. Tag Filter (NEW)
            if (tagFilter !== "ALL" && !tags.includes(tagFilter)) continue;

            // 4. Search
            if (searchFilter) {
                const tagMatch = tags.some(t => t.toLowerCase().includes(searchFilter));
                const idString = entry.id ? String(entry.id) : "";
                const userMatch = user.toLowerCase().includes(searchFilter) || idString.includes(searchFilter);
                if (!userMatch && !tagMatch) continue;
            }

            filteredKeys.push(user);
        }
        return filteredKeys;
    }

    function renderUserList(db) {
        const listContainer = document.getElementById('xf-user-list');
        const paginationContainer = document.getElementById('xf-pagination');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        const filteredKeys = getFilteredUsers();

        const totalPages = Math.ceil(filteredKeys.length / ITEMS_PER_PAGE) || 1;
        if (currentPage > totalPages) currentPage = 1;

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageItems = filteredKeys.slice(startIndex, endIndex);

        for (const user of pageItems) {
            const entry = db[user].data;
            const isBlocked = entry.isBlocked === true;

            // Translate stored risk to current language
            const riskKey = getRiskKey(entry.riskLabel) || 'safe';
            const displayRisk = TEXT.risk[riskKey] || entry.riskLabel;

            let badgeColor = "#fff";
            if (riskKey === 'safe' || riskKey === 'normal') badgeColor = "var(--xf-green)";
            else if (riskKey === 'detected') badgeColor = "var(--xf-red)";
            else if (riskKey === 'anomaly') badgeColor = "var(--xf-orange)";
            else if (riskKey === 'caution') badgeColor = "var(--xf-orange)";
            else if (riskKey === 'verified') badgeColor = "var(--xf-blue)";

            const row = document.createElement("div");
            row.className = `xf-user-row ${isBlocked ? 'xf-blocked' : ''}`;
            const displayRiskLabel = isBlocked ? `🚫 ${displayRisk}` : displayRisk;

            row.innerHTML = `<div><div class="xf-u-name">@${user}</div><span class="xf-u-meta">📍 ${entry.country} | 📱 ${entry.device.split(' ')[0]}</span></div><div class="xf-u-risk" style="background:${badgeColor}">${displayRiskLabel}</div>`;
            row.onclick = () => window.open(`https://x.com/${user}`, '_blank');
            listContainer.appendChild(row);
        }

        if (pageItems.length === 0) listContainer.innerHTML = `<div style="padding:10px;text-align:center;color:var(--xf-dim);">${TEXT.dashboard.list_empty}</div>`;

        paginationContainer.innerHTML = `<div class="xf-page-btn" id="xf-page-prev">${TEXT.dashboard.page_prev}</div><span>${TEXT.dashboard.page_info.replace('{c}', currentPage).replace('{t}', totalPages)}</span><div class="xf-page-btn" id="xf-page-next">${TEXT.dashboard.page_next}</div>`;
        document.getElementById('xf-page-prev').onclick = () => { if (currentPage > 1) { currentPage--; renderUserList(db); } };
        document.getElementById('xf-page-next').onclick = () => { if (currentPage < totalPages) { currentPage++; renderUserList(db); } };
    }

    // --- DASHBOARD CONTROLLER ---
    function showDashboard() {
        currentPage = 1;
        const overlay = document.getElementById("xf-dash-overlay");

        // Structure
        overlay.innerHTML = `
            <div id="xf-dash-box">
                <div class="xf-dash-sidebar">
                    <div class="xf-nav-btn active" id="xf-nav-home" title="${TEXT.dashboard.nav_home}">🏠</div>
                    <div class="xf-nav-btn" id="xf-nav-tools" title="${TEXT.dashboard.nav_tools}">🛠️</div>
                    <div class="xf-nav-btn" id="xf-nav-data" title="${TEXT.dashboard.nav_data}">💾</div>
                    <div style="flex:1"></div>
                    <div class="xf-nav-btn" id="xf-nav-close" title="${TEXT.btn.close}" style="color:var(--xf-red)">✕</div>
                </div>
                <div class="xf-dash-content" id="xf-dash-main"></div>
            </div>
        `;
        overlay.style.display = "flex";

        const contentDiv = document.getElementById("xf-dash-main");
        const navBtns = document.querySelectorAll('.xf-nav-btn:not(#xf-nav-close)');

        // Router
        window.xfNavigate = (viewName) => {
            // Update Sidebar
            navBtns.forEach(btn => btn.classList.remove('active'));
            if(['home','tools','data'].includes(viewName)) {
                document.getElementById(`xf-nav-${viewName}`).classList.add('active');
            }

            // Render View
            if (viewName === 'home') renderHomeView(contentDiv);
            else if (viewName === 'tools') renderToolsView(contentDiv);
            else if (viewName === 'data') renderDataView(contentDiv);
            else if (viewName === 'batch') renderBatchView(contentDiv); // Sub-view
            else if (viewName === 'tags') renderTagCloudView(contentDiv); // Sub-view
            else if (viewName === 'lookup') renderLookupView(contentDiv); // Sub-view
        };

        // Bind Sidebar
        document.getElementById('xf-nav-home').onclick = () => window.xfNavigate('home');
        document.getElementById('xf-nav-tools').onclick = () => window.xfNavigate('tools');
        document.getElementById('xf-nav-data').onclick = () => window.xfNavigate('data');
        document.getElementById('xf-nav-close').onclick = () => { overlay.style.display = "none"; };

        // Init
        window.xfNavigate('home');
    }

    // --- VIEW 1: HOME (Database) ---
    function renderHomeView(container) {
        const count = Object.keys(db).length;

        // Collect all unique tags for the dropdown
        const allTags = new Set();
        Object.values(db).forEach(u => (u.tags || []).forEach(t => allTags.add(t)));
        const tagOptions = Array.from(allTags).map(t => `<option value="${t}">${TEXT.tags[t] || t}</option>`).join('');

        container.innerHTML = `
            <div class="xf-view-header">
                <span>${TEXT.dashboard.title} <span style="font-size:12px;color:var(--xf-dim);">(${count})</span></span>
                <div style="display:flex; gap:5px;">
                    <button class="xf-action-btn xf-btn-primary" id="xf-act-export">${TEXT.dashboard.btn_export}</button>
                    <button class="xf-action-btn xf-btn-danger" id="xf-act-block">${TEXT.dashboard.btn_block}</button>
                </div>
            </div>

            <div class="xf-filters-row">
                <input id="xf-search-user" class="xf-input" style="flex:2;margin:0" placeholder="${TEXT.dashboard.search_placeholder}">
                <input id="xf-filter-loc" class="xf-input" style="flex:1;margin:0" placeholder="${TEXT.dashboard.filter_loc}">
            </div>
            <div class="xf-filters-row">
                <select id="xf-filter-risk" class="xf-input" style="flex:1;margin:0;background:var(--xf-sidebar);">
                    <option value="ALL">${TEXT.dashboard.opt_all}</option>
                    <option value="${TEXT.risk.anomaly}">${TEXT.risk.anomaly}</option>
                    <option value="${TEXT.risk.detected}">${TEXT.risk.detected}</option>
                    <option value="${TEXT.risk.safe}">${TEXT.risk.safe}</option>
                </select>
                <select id="xf-filter-tag" class="xf-input" style="flex:1;margin:0;background:var(--xf-sidebar);">
                    <option value="ALL">${TEXT.dashboard.opt_all} (Tags)</option>
                    ${tagOptions}
                </select>
            </div>

            <div id="xf-user-list"></div>
            <div id="xf-pagination" class="xf-pagination"></div>
        `;

        document.getElementById("xf-search-user").oninput = () => { currentPage = 1; renderUserList(db); };
        document.getElementById("xf-filter-loc").oninput = () => { currentPage = 1; renderUserList(db); };
        document.getElementById("xf-filter-risk").onchange = () => { currentPage = 1; renderUserList(db); };
        document.getElementById("xf-filter-tag").onchange = () => { currentPage = 1; renderUserList(db); }; // Tag Event

        document.getElementById("xf-act-export").onclick = exportCSV;
        document.getElementById("xf-act-block").onclick = handleMassBlock;

        renderUserList(db);
    }

    // --- VIEW 2: TOOLS MENU ---
    function renderToolsView(container) {
        container.innerHTML = `
            <div class="xf-view-header">${TEXT.dashboard.tools_title}</div>
            <div class="xf-tools-grid">
                <div class="xf-tool-card" id="xf-tool-batch">
                    <div class="xf-tool-icon">⚙️</div>
                    <div class="xf-tool-title">${TEXT.batch.title}</div>
                    <div class="xf-tool-desc">${TEXT.dashboard.batch_desc}</div>
                </div>

                <div class="xf-tool-card" id="xf-tool-tags">
                    <div class="xf-tool-icon">🏷️</div>
                    <div class="xf-tool-title">${TEXT.dashboard.btn_tags}</div>
                    <div class="xf-tool-desc">${TEXT.dashboard.tags_desc}</div>
                </div>

                <div class="xf-tool-card" id="xf-tool-lookup">
                    <div class="xf-tool-icon">🆔</div>
                    <div class="xf-tool-title">${TEXT.dashboard.btn_lookup}</div>
                    <div class="xf-tool-desc">${TEXT.dashboard.lookup_desc}</div>
                </div>
            </div>
        `;

        document.getElementById("xf-tool-batch").onclick = () => window.xfNavigate('batch');
        document.getElementById("xf-tool-tags").onclick = () => window.xfNavigate('tags');
        document.getElementById("xf-tool-lookup").onclick = () => window.xfNavigate('lookup');
    }

    // --- VIEW 3: DATA (Settings) ---
    function renderDataView(container) {
        container.innerHTML = `
            <div class="xf-view-header">${TEXT.dashboard.nav_data}</div>

            <div style="font-size:12px; font-weight:bold; color:var(--xf-dim); margin-bottom:10px;">${TEXT.data.cloud_title}</div>
            <div class="xf-tools-grid" style="margin-bottom:20px;">
                <div class="xf-tool-card" id="xf-data-cloud">
                    <div class="xf-tool-icon">☁️</div>
                    <div class="xf-tool-title">${TEXT.data.update_db}</div>
                    <div class="xf-tool-desc">${TEXT.data.update_desc}</div>
                </div>
                <div class="xf-tool-card" id="xf-data-contrib">
                    <div class="xf-tool-icon">📤</div>
                    <div class="xf-tool-title">${TEXT.data.contrib_title}</div>
                    <div class="xf-tool-desc">${TEXT.data.contrib_desc}</div>
                </div>
            </div>

            <div style="font-size:12px; font-weight:bold; color:var(--xf-dim); margin-bottom:10px;">${TEXT.data.backup_title}</div>
            <div class="xf-tools-grid">
                <div class="xf-tool-card" id="xf-data-backup">
                    <div class="xf-tool-icon">💾</div>
                    <div class="xf-tool-title">${TEXT.data.backup_json}</div>
                </div>
                <div class="xf-tool-card" id="xf-data-restore">
                    <div class="xf-tool-icon">📥</div>
                    <div class="xf-tool-title">${TEXT.data.restore_json}</div>
                </div>
                <div class="xf-tool-card" id="xf-data-clear" style="border-color:var(--xf-red)">
                    <div class="xf-tool-icon">🗑️</div>
                    <div class="xf-tool-title" style="color:var(--xf-red)">${TEXT.data.clear_cache}</div>
                </div>
            </div>

            <div style="margin-top:30px; text-align:center;">
                <div class="xf-lang-section" style="justify-content:center;">
                    <span>${TEXT.data.lang_label}</span>
                    <span class="xf-lang-opt ${PREF_LANG==='auto'?'xf-lang-active':''}" id="xf-l-auto">Auto</span>
                    <span class="xf-lang-opt ${PREF_LANG==='en'?'xf-lang-active':''}" id="xf-l-en">En</span>
                    <span class="xf-lang-opt ${PREF_LANG==='fa'?'xf-lang-active':''}" id="xf-l-fa">Fa</span>
                </div>
            </div>
        `;

        document.getElementById("xf-data-cloud").onclick = loadFromCloud;
        document.getElementById("xf-data-contrib").onclick = contributeData;
        document.getElementById("xf-data-backup").onclick = backupJSON;
        document.getElementById("xf-data-restore").onclick = () => document.getElementById("xf-restore-input").click();
        document.getElementById("xf-data-clear").onclick = clearCache;

        document.getElementById('xf-l-auto').onclick = () => setLang('auto');
        document.getElementById('xf-l-en').onclick = () => setLang('en');
        document.getElementById('xf-l-fa').onclick = () => setLang('fa');
    }

    // --- SUB-VIEW: TAG CLOUD ---
    function renderTagCloudView(container) {
        const tagCounts = {};
        const tagLabels = {};
        const allTagKeys = ['loc_change', 'base_iran', 'cyber', 'fake', 'flag_ir', 'suspicious', 'foreigner'];

        allTagKeys.forEach(k => { tagCounts[k] = 0; tagLabels[k] = TEXT.tags[k] || k; });
        Object.values(db).forEach(user => { (user.tags || []).forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }); });

        let tagsHtml = '';
        allTagKeys.forEach(key => {
            tagsHtml += `<div class="xf-tag-btn" data-tag="${key}">${tagLabels[key]} <span class="xf-tag-count">${tagCounts[key]}</span></div>`;
        });

        container.innerHTML = `
            <div class="xf-view-header">
                <button class="xf-action-btn xf-btn-primary" id="xf-back-btn" style="margin-right:10px;">${TEXT.dashboard.btn_back}</button>
                ${TEXT.dashboard.btn_tags}
            </div>
            <div class="xf-tag-cloud">${tagsHtml}</div>
            <div style="font-size:11px;color:var(--xf-dim);margin-bottom:5px;font-weight:bold;">Filtered Users:</div>
            <div id="xf-tag-results" style="flex:1; overflow-y:auto; border:1px solid var(--xf-border); border-radius:8px; padding:5px; background:rgba(255,255,255,0.03);">
                <div style="padding:20px; text-align:center; color:var(--xf-dim);">Select a tag above.</div>
            </div>
        `;

        document.getElementById('xf-back-btn').onclick = () => window.xfNavigate('tools');

        const resultsDiv = document.getElementById("xf-tag-results");
        container.querySelectorAll('.xf-tag-btn').forEach(btn => {
            btn.onclick = () => {
                container.querySelectorAll('.xf-tag-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderTaggedUsers(btn.dataset.tag, resultsDiv);
            };
        });
    }

    // --- SUB-VIEW: ID LOOKUP ---
    function renderLookupView(container) {
        container.innerHTML = `
            <div class="xf-view-header">
                <button class="xf-action-btn xf-btn-primary" id="xf-back-btn" style="margin-right:10px;">${TEXT.dashboard.btn_back}</button>
                ${TEXT.lookup.title}
            </div>
            <div style="padding: 40px; text-align: center; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <p style="color:var(--xf-dim); font-size:13px; margin-bottom:20px; max-width:300px;">${TEXT.lookup.desc}</p>
                <input type="text" id="xf-lookup-input" class="xf-input" placeholder="${TEXT.lookup.input_ph}" style="text-align:center; font-family:monospace; font-size:16px; width:220px; margin-bottom: 15px;">

                <!-- Fixed Button Style -->
                <button id="xf-lookup-go" class="xf-btn-blue" style="
                    width: 220px;
                    padding: 10px;
                    border-radius: 99px;
                    border: none;
                    cursor: pointer;
                    font-weight: bold;
                    font-family: inherit;
                    flex: 0 0 auto; /* Prevent Flex Stretch */
                ">
                    ${TEXT.lookup.btn_go}
                </button>
            </div>
        `;

        document.getElementById('xf-back-btn').onclick = () => window.xfNavigate('tools');
        document.getElementById('xf-lookup-go').onclick = () => {
            const val = document.getElementById('xf-lookup-input').value.trim();
            if(!/^\d+$/.test(val)) return alert("Invalid ID (Numbers only)");
            window.open(`https://x.com/i/user/${val}`, '_blank');
        };
    }

    function renderTaggedUsers(tag, container) {
        container.innerHTML = '';
        const users = [];
        Object.entries(db).forEach(([username, data]) => { if (data.tags && data.tags.includes(tag)) users.push({ username, ...data }); });

        if (users.length === 0) {
            container.innerHTML = `<div style="padding:10px;text-align:center;color:var(--xf-dim);">No users found.</div>`;
            return;
        }

        users.forEach(u => {
            const row = document.createElement("div");
            row.className = "xf-user-row";
            row.innerHTML = `<div><div class="xf-u-name">@${u.username}</div><span class="xf-u-meta">📍 ${u.data.country}</span></div><div style="font-size:10px; color:var(--xf-blue); cursor:pointer;">OPEN ↗</div>`;
            row.onclick = () => window.open(`https://x.com/${u.username}`, '_blank');
            container.appendChild(row);
        });
    }

    async function handleMassBlock() {
        // Correct ID for the new dashboard layout
        const btn = document.getElementById("xf-act-block");

        if (isBlockingProcess) {
            abortBlock = true;
            return;
        }

        const rawList = getFilteredUsers();
        const usersToBlock = rawList.filter(u => !db[u].data.isBlocked);

        if(usersToBlock.length === 0) return alert(TEXT.dashboard.msg_no_targets);

        if(!confirm(TEXT.dashboard.msg_block_conf.replace("{n}", usersToBlock.length))) return;

        // Visual State Update
        isBlockingProcess = true;
        abortBlock = false;

        const originalText = TEXT.dashboard.btn_block;

        if (btn) {
            btn.innerText = TEXT.dashboard.btn_stop;
            btn.style.background = "#fff";
            btn.style.color = "#000";
        }

        let successCount = 0;

        for (let i = 0; i < usersToBlock.length; i++) {
            if (abortBlock) break;

            const username = usersToBlock[i];
            const userId = db[username].data.id;

            // Check if button still exists (in case user switched views)
            if (document.getElementById("xf-act-block")) {
                document.getElementById("xf-act-block").innerText = `${TEXT.dashboard.btn_stop} (${i+1}/${usersToBlock.length})`;
            }

            try {
                await performBlock(userId);
                if (db[username]) {
                    db[username].data.isBlocked = true;
                }
                saveDB();
                // Only re-render if we are still on the Home view
                if (document.getElementById("xf-user-list")) {
                    renderUserList(db);
                }
                successCount++;
            } catch (e) {
                console.error("Block failed for", username, e);
            }
            await new Promise(r => setTimeout(r, 1200));
        }

        isBlockingProcess = false;

        // Restore Button State if visible
        const finalBtn = document.getElementById("xf-act-block");
        if (finalBtn) {
            finalBtn.style.background = ""; // Reset to CSS default (red class)
            finalBtn.style.color = "";
            finalBtn.innerText = originalText;
        }

        if (abortBlock) {
            alert(TEXT.dashboard.msg_block_stop);
        } else {
            alert(TEXT.dashboard.msg_block_done.replace("{n}", successCount));
        }
    }

    async function performBlock(userId) {
        const body = new URLSearchParams();
        body.append("user_id", userId);

        await fetch("https://x.com/i/api/1.1/blocks/create.json", {
            method: "POST",
            headers: {
                "authorization": `Bearer ${CONFIG.bearerToken}`,
                "x-csrf-token": getCsrf(),
                "content-type": "application/x-www-form-urlencoded"
            },
            body: body
        });
    }

    function loadFromCloud() {
        GM_xmlhttpRequest({
            method: "GET", url: CLOUD_DB_URL,
            onload: function(response) {
                try {
                    const cloudData = JSON.parse(response.responseText);
                    const beforeCount = Object.keys(db).length;
                    db = { ...cloudData, ...db }; saveDB();
                    const afterCount = Object.keys(db).length;
                    const added = afterCount - beforeCount;
                    alert(TEXT.dashboard.msg_cloud_ok.replace("{n}", added));
                    showDashboard();
                } catch (e) { alert(TEXT.dashboard.msg_cloud_fail); }
            },
            onerror: function() { alert(TEXT.dashboard.msg_cloud_fail); }
        });
    }

    function contributeData() {
        const count = Object.keys(db).length;
        if (count === 0) return alert("No data to contribute.");

        const cleanDB = getCleanDB();
        const blob = new Blob([JSON.stringify(cleanDB, null, 2)], { type: "application/json" });

        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `contribution.json`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        alert(TEXT.dashboard.contrib_info);
        const issueUrl = `${GITHUB_REPO_ISSUES}?title=Database+Contribution+(${count}+Users)`;
        window.open(issueUrl, '_blank');
    }

    function backupJSON() {
        const cleanDB = getCleanDB();
        const blob = new Blob([JSON.stringify(cleanDB, null, 2)], { type: "application/json" });

        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `xf_backup_${Date.now()}.json`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }

    function handleRestore(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                let addedCount = 0;

                if (Array.isArray(imported)) {
                    imported.forEach(item => {
                        const uKey = Object.keys(item).find(k => k === "Username" || k === "نام کاربری");
                        if (!uKey) return;
                        const username = item[uKey];
                        if (!username) return;

                        const idKey = Object.keys(item).find(k => k === "Numeric ID" || k === "آی‌دی عددی");
                        const locKey = Object.keys(item).find(k => k === "Location" || k === "موقعیت");
                        const devKey = Object.keys(item).find(k => k.includes("Device") || k.includes("دستگاه"));
                        const createdKey = Object.keys(item).find(k => k.includes("Created") || k.includes("ساخت"));
                        const renamedKey = Object.keys(item).find(k => k.includes("Change Count") || k.includes("تعداد تغییر"));
                        const avatarKey = Object.keys(item).find(k => k.includes("Avatar") || k.includes("آواتار"));
                        const accStatusKey = Object.keys(item).find(k => k.includes("Account Status") || k.includes("وضعیت اکانت"));
                        const locStatusKey = Object.keys(item).find(k => k.includes("Location Status") || k.includes("وضعیت مکان"));
                        const langKey = Object.keys(item).find(k => k.includes("Language") || k.includes("زبان"));
                        const verKey = Object.keys(item).find(k => k.includes("Verified") || k.includes("تیک"));

                        if (item[accStatusKey] === 0) return;

                        let devStr = "Unknown";
                        if (item[devKey] === 0) devStr = "Android";
                        else if (item[devKey] === 1) devStr = "iPhone";
                        else devStr = "Web/Other";

                        const rawUtc = item[createdKey] || "";
                        let formattedCreated = "N/A";
                        if (rawUtc && rawUtc !== "N/A") {
                             const dateObj = new Date(rawUtc);
                             if (!isNaN(dateObj.getTime())) {
                                 formattedCreated = formatTime(dateObj);
                             } else {
                                 formattedCreated = rawUtc;
                             }
                        }
                        const isVerified = item[verKey] === 1;
                        const langCode = (item[langKey] === 'fa') ? 'fa' : null;

                        const data = {
                            country: item[locKey] || "Unknown",
                            countryCode: item[locKey],
                            device: devStr,
                            deviceFull: devStr,
                            id: item[idKey] || "",
                            created: formattedCreated,
                            renamed: parseInt(item[renamedKey] || 0),
                            isAccurate: item[locStatusKey] === 1,
                            isIdVerified: isVerified,
                            langCode: langCode,
                            avatar: item[avatarKey] || "",
                            isBlocked: false
                        };

                        let pillText = `📍 ${data.country}`;
                        if (data.country === "Unknown" || data.country === "نامشخص") {
                             pillText = `📱 ${data.device}`;
                        }

                        let color = "var(--xf-green)";
                        const isTargetLoc = (data.countryCode === "Iran" || data.countryCode === "West Asia" || data.countryCode === "غرب آسیا");
                        const isTargetDev = (data.deviceFull.includes("Android") || data.deviceFull.includes("iPhone"));

                        if (!data.isAccurate) {
                            color = "var(--xf-red)";
                        } else if (isTargetLoc && data.isAccurate) {
                            color = "var(--xf-orange)";
                        }

                        db[username] = {
                            data: data,
                            pillText: pillText,
                            color: color,
                            html: renderCardHTML(data, username)
                        };
                        addedCount++;
                    });

                    saveDB();
                    alert(TEXT.dashboard.msg_imported_batch.replace("{n}", addedCount));

                } else {
                    db = { ...db, ...imported };
                    saveDB();
                    alert(TEXT.dashboard.msg_restored.replace("{n}", Object.keys(imported).length));
                }
                showDashboard();
            } catch (err) {
                console.error(err);
                alert(TEXT.dashboard.msg_err);
            }
        };
        reader.readAsText(file); e.target.value = "";
    }

    function exportCSV() {
        const keys = getFilteredUsers();
        let csv = "\uFEFFUsername,ID,Location,Device,Risk,Created,Link,Blocked,Tags\n";
        keys.forEach(user => {
            const entry = db[user].data;
            const riskTag = entry.riskLabel;
            const safeDev = `"${entry.deviceFull.replace(/"/g, '""')}"`;
            const blockedStatus = entry.isBlocked ? "Yes" : "No";
            const tags = (db[user].tags || []).join(' | ');
            csv += `${user},${entry.id},${entry.country},${safeDev},${riskTag},${entry.created},https://x.com/${user},${blockedStatus},"${tags}"\n`;
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `xf_report_${Date.now()}.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }

    function clearCache() {
        if(confirm("Are you sure?")) {
            db = {}; localStorage.removeItem(STORAGE_KEY);
            document.querySelectorAll('.xf-mini-pill').forEach(el => el.remove());
            alert(TEXT.dashboard.msg_cleared); document.getElementById('xf-dash-overlay').style.display='none';
        }
    }

    // --- UI & INJECTION ---
    function createMiniPill(username) {
        const mini = document.createElement("span");
        mini.className = "xf-mini-pill";
        mini.innerHTML = "⌖";
        mini.dataset.user = username;

        if (db[username]) {
            mini.innerHTML = `📍 ${db[username].data.country}`;
            mini.classList.add('xf-loaded');
            mini.style.color = db[username].color;
            mini.style.borderColor = db[username].color;
        }

        const handle = async (e) => {
            e.stopPropagation(); e.preventDefault();
            mini.innerHTML = "⏳";
            const info = await fetchData(username);
            if (info) {
                mini.innerHTML = `📍 ${info.data.country}`;
                mini.classList.add('xf-loaded');
                mini.style.color = info.color;
                mini.style.borderColor = info.color;
                if (IS_MOBILE) showMobile(info.html, username); else showDesktop(e, info.html, username);
            } else mini.innerHTML = "❌";
        };

        if (IS_MOBILE) mini.onclick = handle;
        else { mini.onmouseenter = handle; mini.onmouseleave = hideDesktop; }
        return mini;
    }

    // --- NOTES LOGIC ---
    function saveNote(user, note) {
        if (!db[user]) return;
        db[user].note = note;
        saveDB();
    }

    function toggleTag(user, tag) {
        if (!db[user]) return;
        if (!db[user].tags) db[user].tags = [];

        const idx = db[user].tags.indexOf(tag);
        if (idx === -1) {
            db[user].tags.push(tag);
        } else {
            db[user].tags.splice(idx, 1);
        }

        // IMMEDIATE UPDATE OF HTML TO PERSIST STATE
        db[user].html = renderCardHTML(db[user].data, user, db[user].tags, db[user].note);

        saveDB();
    }

    function renderCardHTML(data, username, tags = null, note = null) {
        let color = "var(--xf-green)", label = TEXT.risk.safe, pct = "5%", title = TEXT.status.high_conf, desc = TEXT.status.high_desc, bg = "rgba(0, 186, 124, 0.1)";
        const isTargetLoc = (data.countryCode === "Iran" || data.countryCode === "West Asia" || data.countryCode === "غرب آسیا");
        const isTargetDev = (data.deviceFull || "").match(/Iran|West Asia|غرب آسیا/i);
        const isFarsi = data.langCode === 'fa';

        if (!data.isAccurate) {
            if (isTargetDev) {
                label = TEXT.risk.normal; pct = "15%"; title = TEXT.status.shield_norm; desc = TEXT.status.shield_norm_desc;
            } else {
                color = "var(--xf-red)"; label = TEXT.risk.detected; pct = "90%"; title = TEXT.status.shield; desc = TEXT.status.shield_desc; bg = "rgba(249, 24, 128, 0.1)";
            }
        } else if (isTargetLoc && data.isAccurate) {
            color = "var(--xf-orange)"; label = TEXT.risk.anomaly; pct = "70%"; bg = "rgba(255, 212, 0, 0.1)";
            if (data.countryCode === "West Asia" && isFarsi) { title = TEXT.status.hidden_anomaly; desc = TEXT.status.hidden_anomaly_desc; }
            else { title = TEXT.status.anomaly; desc = TEXT.status.anomaly_desc; }
        }

        // UPDATED THRESHOLD: Only flag as CAUTION if renames > 10
        if (data.renamed > 10 && label === TEXT.risk.safe) { color = "var(--xf-orange)"; label = TEXT.risk.caution; pct = "40%"; }
        if (data.isIdVerified) { pct = "0%"; label = TEXT.risk.verified; color = "var(--xf-blue)"; }

        data.riskLabel = label;

        const existingNote = note !== null ? note : (db[username]?.note || "");
        const userTags = tags !== null ? tags : (db[username]?.tags || []);
        const blockedBadge = data.isBlocked ? `<span style="background:red;color:white;font-size:9px;padding:1px 4px;border-radius:3px;margin-left:5px;">BLOCKED</span>` : "";

        // --- TAB 1: OVERVIEW CONTENT ---
        const overviewContent = `
            <div class="xf-status" style="border-${IS_RTL?'right':'left'}-color:${color};background:${bg}"><strong style="color:${color}">${title}</strong><br><span style="opacity:0.9">${desc}</span></div>
            <div class="xf-bar-bg"><div class="xf-bar-fill" style="width:${pct};background:${color}"></div></div>
            <div class="xf-grid">
                ${data.country!==TEXT.values.unknown ? `<div class="xf-row"><span class="xf-lbl">${TEXT.labels.location}</span><span class="xf-val">📍 ${data.country}</span></div>` : ''}
                <div class="xf-row"><span class="xf-lbl">${TEXT.labels.device}</span><span class="xf-val">${data.deviceFull}</span></div>
                <div class="xf-row"><span class="xf-lbl">${TEXT.labels.id}</span><span class="xf-val xf-mono">${data.id}</span></div>
                <div class="xf-row"><span class="xf-lbl">${TEXT.labels.created}</span><span class="xf-val">${data.created}</span></div>
                ${data.langCode ? `<div class="xf-row"><span class="xf-lbl">${TEXT.labels.lang}</span><span class="xf-val">🗣️ ${data.langCode === 'fa' ? TEXT.values.fa_script : 'Other'}</span></div>` : ''}
                ${data.renamed>0 ? `<div class="xf-row"><span class="xf-lbl" style="color:var(--xf-orange)">${TEXT.labels.renamed}</span><span class="xf-val" style="color:var(--xf-orange)">${data.renamed}x</span></div>` : ''}
                ${data.isIdVerified ? `<div class="xf-row"><span class="xf-lbl">${TEXT.labels.identity}</span><span class="xf-val" style="color:var(--xf-green)">${TEXT.values.gov_id}</span></div>` : ''}
            </div>
            <div class="xf-ftr"><a href="${data.avatar}" target="_blank" class="xf-btn">${TEXT.btn.view_avatar}</a></div>
        `;

        // --- TAB 2: ANALYSIS CONTENT ---
        let badges = [];
        let reportParts = [];
        let riskScore = 0;

        // 1. Rename Analysis (UPDATED: Check > 10)
        if (data.renamed > 0) {
            let style = data.renamed > 10 ? "xf-ev-warn" : "xf-ev-ok";
            if (data.renamed > 10) {
                reportParts.push(TEXT.analysis.reason_rented.replace('{n}', data.renamed));
                riskScore += 2;
            }
            badges.push(`<span class="xf-evidence-badge ${style}">🎭 ${TEXT.labels.renamed}: ${data.renamed}</span>`);
        }

        // 2. Ratio/Network Analysis
        if (data.ratio !== undefined && data.ratio !== null) {
            const r = parseFloat(data.ratio);
            let style = "xf-ev-ok";
            if (data.following > 1000 && r > 0.8 && r < 1.2) {
                style = "xf-ev-danger";
                reportParts.push(TEXT.analysis.reason_farm.replace('{r}', r).replace('{f}', data.following));
                riskScore += 3;
            }
            badges.push(`<span class="xf-evidence-badge ${style}">⚖️ Ratio: ${r}</span>`);
        }

        // 3. Activity Analysis
        if (data.tpd !== undefined && data.tpd !== null) {
             const tpd = parseFloat(data.tpd);
             let style = "xf-ev-ok";
             if (tpd > 30) {
                 style = "xf-ev-warn";
                 reportParts.push(TEXT.analysis.reason_spam.replace('{n}', tpd));
                 riskScore += 2;
             }
             badges.push(`<span class="xf-evidence-badge ${style}">📨 ${tpd}/day</span>`);
        }

        // 4. Bio Link Analysis
        if (data.hasSusLink) {
             badges.push(`<span class="xf-evidence-badge xf-ev-danger">🎣 ${TEXT.analysis.badge_phishing}</span>`);
             reportParts.push(TEXT.analysis.reason_phishing.replace('{l}', 'Hidden'));
             riskScore += 3;
        }

        let finalReport = reportParts.length === 0 ? TEXT.analysis.intro_safe + " " + TEXT.analysis.conclusion_safe : "";
        let borderColor = "var(--xf-green)";
        if (reportParts.length > 0) {
            let intro = riskScore >= 4 ? TEXT.analysis.intro_danger : TEXT.analysis.intro_warn;
            borderColor = riskScore >= 4 ? "var(--xf-red)" : "var(--xf-orange)";
            finalReport = `<strong>${intro}</strong><br><br>• ` + reportParts.join('<br>• ') + `<br><br><em>${TEXT.analysis.conclusion_risk}</em>`;
        }

        const analysisContent = `
            <div class="xf-analysis-section" style="border-top: 1px solid ${borderColor}">
                <div class="xf-evidence-grid">
                    ${badges.length > 0 ? badges.join('') : '<span class="xf-evidence-badge xf-ev-ok" style="grid-column: span 2">✅ No Data</span>'}
                </div>
                <div class="xf-analysis-summary" style="border-left-color:${borderColor}">
                    ${finalReport}
                </div>
            </div>
        `;

        // --- TAB 3: TOOLS CONTENT ---
        const availableTags = [
            { id: 'loc_change', label: TEXT.tags.loc_change },
            { id: 'base_iran', label: TEXT.tags.base_iran },
            { id: 'cyber', label: TEXT.tags.cyber },
            { id: 'fake', label: TEXT.tags.fake },
            { id: 'flag_ir', label: TEXT.tags.flag_ir },
            { id: 'suspicious', label: TEXT.tags.suspicious },
            { id: 'foreigner', label: TEXT.tags.foreigner }
        ];

        // Specific keywords requested
        const searchKeywords = [
            { label: "Pahlavi/Monarchy", query: "پهلوی OR شاه OR سلطنت OR رضا پهلوی" },
            { label: "Israel/Zionist", query: "اسراییل OR صهیونیست OR رژیم OR Zionist" },
            { label: "Military/War", query: "نظامی OR سپاه OR جنگ OR ارتش" },
            { label: "Civilian Casualties", query: "کشته OR غیرنظامی OR کودک OR زن" },
            { label: "Regime/Gov", query: "نظام OR جمهوری اسلامی OR انقلاب" }
        ];

        const toolsContent = `
            <div class="xf-tags-container">
                <div class="xf-tags-title">${TEXT.tags.title}</div>
                <div class="xf-tags-grid">
                    ${availableTags.map(t => `
                        <label class="xf-tag-opt">
                            <input type="checkbox" class="xf-tag-check" data-user="${username}" data-tag="${t.id}" ${userTags.includes(t.id) ? 'checked' : ''}>
                            ${t.label}
                        </label>
                    `).join('')}
                </div>
            </div>

            <!-- NEW FORENSIC SEARCH SECTION -->
            <div class="xf-analysis-section" style="margin-top:10px; border-color:var(--xf-border);">
                <div class="xf-analysis-title">${TEXT.search ? TEXT.search.title : "Forensic Search"}</div>

                <!-- 1. Interactions -->
                <div style="margin-bottom:8px; display:flex; gap:5px;">
                    <a href="https://x.com/search?q=(from:${username}) filter:replies&src=typed_query&f=live" target="_blank" class="xf-btn" style="flex:1; text-align:center;">
                        💬 ${TEXT.search ? TEXT.search.interact : "Replies"}
                    </a>
                    <!-- NEW: 12 Day War Date Search -->
                    <a href="https://x.com/search?q=(from:${username}) since:2025-06-13 until:2025-06-25&src=typed_query&f=live" target="_blank" class="xf-btn" style="flex:1; text-align:center; background:rgba(255, 212, 0, 0.1); color:#ffd400; border:1px solid #ffd400;">
                        📅 ${ACTIVE_LANG === 'fa' ? "جنگ ۱۲ روزه (خرداد)" : "12-Day War"}
                    </a>
                </div>

                <!-- 2. Keyword Buttons -->
                <div style="font-size:10px; color:var(--xf-dim); margin-bottom:4px;">${TEXT.search ? TEXT.search.keywords : "Keywords"}:</div>
                <div class="xf-tags-grid">
                    ${searchKeywords.map(k => `
                        <a href="https://x.com/search?q=(from:${username}) (${encodeURIComponent(k.query)})&src=typed_query&f=live"
                           target="_blank" class="xf-tag-btn" style="text-align:center; text-decoration:none; display:block;">
                           ${k.label}
                        </a>
                    `).join('')}
                </div>
            </div>

            <textarea class="xf-textarea" id="xf-note-input" data-user="${username}" placeholder="${TEXT.notes_placeholder}">${existingNote}</textarea>

            <div class="xf-osint-row">
                <a href="https://web.archive.org/web/*/twitter.com/${username}" target="_blank" title="${TEXT.osint_titles.archive}" class="xf-osint-icon">🏛️</a>
                <a href="https://www.google.com/search?q=%22${username}%22" target="_blank" title="${TEXT.osint_titles.google}" class="xf-osint-icon">🔍</a>
                <a href="https://lens.google.com/upload?url=${encodeURIComponent(data.avatar)}" target="_blank" title="${TEXT.osint_titles.lens}" class="xf-osint-icon">📷</a>
            </div>
        `;

        return `
            <div class="xf-header">
                <div style="display:flex;align-items:center;"><span class="xf-title">${TEXT.title}</span><span class="xf-badge" style="background:${color};margin-left:5px;">${label}</span>${blockedBadge}</div>
                <div class="xf-retry" id="xf-retry-btn" title="${TEXT.btn.retry}" data-user="${username}">↻</div>
            </div>

            <div class="xf-tabs-nav">
                <div class="xf-tab-btn active" data-tab="info">${TEXT.tabs.info}</div>
                <div class="xf-tab-btn" data-tab="analysis">${TEXT.tabs.analysis}</div>
                <div class="xf-tab-btn" data-tab="tools">${TEXT.tabs.tools}</div>
            </div>

            <div id="xf-tab-info" class="xf-tab-content active">${overviewContent}</div>
            <div id="xf-tab-analysis" class="xf-tab-content">${analysisContent}</div>
            <div id="xf-tab-tools" class="xf-tab-content">${toolsContent}</div>
        `;
    }

    // --- UI UTILS ---
    function bindEvents(container) {
        // Tab switching logic
        const tabs = container.querySelectorAll('.xf-tab-btn');
        tabs.forEach(tab => {
            tab.onclick = (e) => {
                e.stopPropagation();
                // Deactivate all
                container.querySelectorAll('.xf-tab-btn').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.xf-tab-content').forEach(c => c.classList.remove('active'));
                // Activate clicked
                tab.classList.add('active');
                const targetId = `xf-tab-${tab.dataset.tab}`;
                const targetContent = container.querySelector(`#${targetId}`);
                if(targetContent) targetContent.classList.add('active');
            };
        });

        const retryBtn = container.querySelector('#xf-retry-btn');
        if(retryBtn) {
            retryBtn.onclick = async (e) => {
                e.stopPropagation(); retryBtn.style.transform = "rotate(360deg)"; container.style.opacity = "0.6";
                const user = retryBtn.dataset.user;
                const newData = await fetchData(user, true);
                if (newData) {
                    container.innerHTML = newData.html; bindEvents(container); container.style.opacity = "1";
                    const pill = document.getElementById("xf-pill");
                    if(pill && pill.dataset.user === user) { pill.innerHTML = `<div class="xf-dot" style="color:${newData.color}"></div><span>${newData.pillText}</span>`; }
                }
            };
        }
        const noteInput = container.querySelector('#xf-note-input');
        if(noteInput) {
            noteInput.addEventListener('input', (e) => {
                saveNote(e.target.dataset.user, e.target.value);
            });
        }

        const tagChecks = container.querySelectorAll('.xf-tag-check');
        tagChecks.forEach(chk => {
            chk.onchange = (e) => {
                toggleTag(e.target.dataset.user, e.target.dataset.tag);
            };
        });
    }

    function showDesktop(e, html, username) {
        if (hideTimeout) clearTimeout(hideTimeout);
        if (!tooltipEl) { tooltipEl = document.createElement("div"); tooltipEl.id = "xf-card"; tooltipEl.onmouseenter = () => clearTimeout(hideTimeout); tooltipEl.onmouseleave = hideDesktop; document.body.appendChild(tooltipEl); }
        tooltipEl.innerHTML = html; bindEvents(tooltipEl); tooltipEl.className = "visible";
        let top = e.clientY + 20, left = e.clientX;
        if (IS_RTL) left -= 320; if (left + 340 > window.innerWidth) left = window.innerWidth - 360; if (top + 400 > window.innerHeight) top = e.clientY - 450;
        tooltipEl.style.top = top + "px"; tooltipEl.style.left = left + "px";
    }
    function hideDesktop() { hideTimeout = setTimeout(() => { if (tooltipEl) tooltipEl.className = ""; }, 200); }
    function showMobile(html, username) {
        let overlay = document.getElementById("xf-mob-overlay");
        if (!overlay) { overlay = document.createElement("div"); overlay.id = "xf-mob-overlay"; overlay.innerHTML = `<div id="xf-mob-sheet"></div>`; overlay.onclick = (e) => { if (e.target === overlay) overlay.style.display = "none"; }; document.body.appendChild(overlay); }
        const sheet = document.getElementById("xf-mob-sheet"); sheet.innerHTML = html; bindEvents(sheet);
        const closeBtn = document.createElement("div"); closeBtn.className = "xf-close"; closeBtn.textContent = TEXT.btn.close; closeBtn.onclick = () => { overlay.style.display = "none"; };
        sheet.appendChild(closeBtn); overlay.style.display = "flex";
    }

    async function fetchData(user, forceRefresh = false) {
        let result = null;

        const currentPath = window.location.pathname.toLowerCase();
        const targetPath = "/" + user.toLowerCase();
        const isOnProfile = currentPath === targetPath || currentPath.startsWith(targetPath + "/");

        let domStats = { following: null, followers: null, tweets: null };

        if (isOnProfile) {
            domStats = scrapeProfileStats(user);
        }

        if (!forceRefresh && db[user]) {
            result = db[user];
            let needsUpdate = false;

            if (isOnProfile) {
                 if (domStats.following !== null) { result.data.following = domStats.following; needsUpdate = true; }
                 if (domStats.followers !== null) {
                     const r = domStats.followers > 0 ? (domStats.following / domStats.followers).toFixed(2) : 0;
                     result.data.ratio = r;
                     needsUpdate = true;
                 }
                 if (domStats.tweets !== null) {
                     // Prefer raw timestamp if valid, else parse the string
                     let createdTs = result.data.created_raw;
                     if (!createdTs || isNaN(createdTs)) {
                         createdTs = parseFlexibleDate(result.data.created);
                     }

                     const now = Date.now();
                     // Calculate days, ensure min 1 day to prevent Infinity
                     const ageDays = Math.max(1, (now - createdTs) / (1000 * 60 * 60 * 24));

                     result.data.tpd = (domStats.tweets / ageDays).toFixed(1);
                     // Store the fixed timestamp for future
                     if(!result.data.created_raw) { result.data.created_raw = createdTs; }
                     needsUpdate = true;
                 }
            }

            const currentTags = result.tags || [];
            const currentNote = result.note || "";
            result.html = renderCardHTML(result.data, user, currentTags, currentNote);

            if(needsUpdate) { db[user] = result; saveDB(); }

            return result;
        }

        const url = `https://${location.host}/i/api/graphql/${CONFIG.queryId}/AboutAccountQuery?variables=${encodeURIComponent(JSON.stringify({screenName:user}))}&features=${encodeURIComponent(JSON.stringify(CONFIG.features))}&fieldToggles=${encodeURIComponent(JSON.stringify({withAuxiliaryUserLabels:false}))}`;
        try {
            const resp = await fetch(url, { headers: { "authorization": `Bearer ${CONFIG.bearerToken}`, "x-csrf-token": getCsrf(), "content-type": "application/json" } });
            const json = await resp.json();
            const res = json?.data?.user?.result || json?.data?.user_result_by_screen_name?.result;
            if (!res) return null;

            const about = res.about_profile || res.aboutProfile || {};
            const verif = res.verification_info || {};
            const core = res.core || res.legacy || {};
            const sourceRaw = about.source || TEXT.values.unknown;
            let devShort = sourceRaw, devFull = sourceRaw;
            const match = sourceRaw.match(SOURCE_REGEX);
            if (match) {
                const region = match[1].trim(); const type = match[2].toLowerCase(); let tech = TEXT.labels.device;
                if (type.includes("app") || type.includes("ios")) tech = "iPhone"; if (type.includes("play") || type.includes("android")) tech = "Android";
                devShort = tech; devFull = `${tech} (${region})`;
            } else if (IS_MOBILE && sourceRaw !== TEXT.values.unknown) devShort = TEXT.labels.device;

            const rawCountry = about.account_based_in;
            const countryDisplay = getCountryDisplay(rawCountry);
            const name = core.name || ""; const bio = core.description || "";
            const isPersianSpeaker = ARABIC_SCRIPT_REGEX.test(name) || ARABIC_SCRIPT_REGEX.test(bio);

            const apiBlocked = res.legacy?.blocking === true;
            const existingBlocked = db[user]?.data?.isBlocked || false;
            const finalBlockedState = apiBlocked || existingBlocked;

            // --- OSINT METRICS ---
            const tweetCount = domStats.tweets !== null ? domStats.tweets : (res.legacy?.statuses_count || 0);
            const following = domStats.following !== null ? domStats.following : (res.legacy?.friends_count || 0);
            const followers = domStats.followers !== null ? domStats.followers : (res.legacy?.followers_count || 0);

            // API always returns Gregorian string, safe to parse
            const createdAt = new Date(res.core?.created_at || res.legacy?.created_at);
            const createdTs = createdAt.getTime();
            const now = Date.now();
            const ageDays = Math.max(1, (now - createdTs) / (1000 * 60 * 60 * 24));

            const tweetsPerDay = (tweetCount / ageDays).toFixed(1);
            const ratio = followers > 0 ? (following / followers).toFixed(2) : 0;
            const suspiciousLink = SUSPICIOUS_LINKS.test(bio);

            // Preserve existing tags/notes if just refreshing
            const existingTags = db[user]?.tags || [];
            const existingNote = db[user]?.note || "";

            const data = {
                country: countryDisplay, countryCode: rawCountry, device: devShort, deviceFull: devFull, id: res.rest_id,
                created: formatTime(createdAt), created_raw: createdTs,
                renamed: parseInt(about.username_changes?.count || 0),
                isAccurate: about.location_accurate, isIdVerified: verif.is_identity_verified === true, langCode: isPersianSpeaker ? 'fa' : null,
                avatar: (res.avatar?.image_url || "").replace("_normal", "_400x400"),
                isBlocked: finalBlockedState,
                tpd: tweetsPerDay,
                ratio: ratio,
                following: following,
                hasSusLink: suspiciousLink
            };

            let pillText = `📍 ${data.country}`;
            if (data.country === TEXT.values.unknown) pillText = `📱 ${IS_MOBILE ? data.device : data.deviceFull}`;
            else if (!IS_MOBILE) pillText += ` | 📱 ${data.deviceFull}`; else pillText += ` | 📱 ${data.device}`;

            let color = "var(--xf-green)";
            const isTargetLoc = (data.countryCode === "Iran" || data.countryCode === "West Asia");
            const isTargetDev = (data.deviceFull || "").match(/Iran|West Asia/i);
            if (!data.isAccurate) color = isTargetDev ? "var(--xf-green)" : "var(--xf-red)";
            else if (isTargetLoc) color = "var(--xf-orange)";

            result = { data, pillText, color, note: existingNote, tags: existingTags };
            result.html = renderCardHTML(data, user, existingTags, existingNote);
            db[user] = result; saveDB(); return result;
        } catch(e) { console.error(e); return null; }
    }

    async function inject(user) {
        if (isInjecting) return; isInjecting = true;
        try {
            const header = document.querySelector('[data-testid="UserProfileHeader_Items"]');
            if (!header) return;
            const info = await fetchData(user);
            if (getUser() !== user || !info) return;
            const old = document.getElementById("xf-pill"); if (old) old.remove();
            const pill = document.createElement("div"); pill.id = "xf-pill";
            pill.dataset.user = user;
            pill.innerHTML = `<div class="xf-dot" style="color:${info.color}"></div><span>${info.pillText}</span>`;
            if (IS_MOBILE) pill.onclick = (e) => { e.stopPropagation(); showMobile(info.html, user); };
            else { pill.onmouseenter = (e) => showDesktop(e, info.html, user); pill.onmouseleave = hideDesktop; }
            header.insertBefore(pill, header.firstChild);
        } finally { isInjecting = false; }
    }

    function injectLists() {
        const targets = document.querySelectorAll('article[data-testid="tweet"]:not([data-xf]), [data-testid="UserCell"]:not([data-xf])');
        if (targets.length === 0) return;

        targets.forEach(node => {
            if (node.getAttribute('data-xf')) return;
            let userLink = node.querySelector('a[href^="/"][role="link"]');
            if (!userLink) return;

            const username = userLink.getAttribute('href').replace('/', '');
            if (!username) return;

            node.setAttribute('data-xf', 'true');
            if (node.querySelector('.xf-mini-pill')) return;

            const mini = createMiniPill(username);
            let nameRow = node.querySelector('div[data-testid="User-Name"] > div:first-child');
            if (!nameRow) {
                const allDirs = node.querySelectorAll('div[dir="ltr"]');
                if (allDirs.length > 0) nameRow = allDirs[0];
            }
            if (nameRow) { nameRow.appendChild(mini); }
        });
    }

    setInterval(() => {
        injectLists();
        injectNativeMenu();
    }, 5000);

    setTimeout(() => {
        initDashboard();
    }, 2000);

    let observerTimeout;
    const observer = new MutationObserver((mutations) => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            document.getElementById("xf-pill")?.remove();
            if(tooltipEl) tooltipEl.className="";
            const user = getUser();
            if (user) inject(user);
        }
        if (observerTimeout) return;
        observerTimeout = setTimeout(() => {
            const user = getUser();
            if (user && document.querySelector('[data-testid="UserProfileHeader_Items"]') && !document.getElementById("xf-pill")) { inject(user); }
            injectLists();
            injectNativeMenu();
            observerTimeout = null;
        }, 500);
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
