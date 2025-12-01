// ==UserScript==
// @name         Sefid Yab - سفید یاب (v1.0)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  White SIM Detector for X (Twitter) - ابزار شناسایی سیم‌کارت سفید در ایکس
// @author       https://tawana.online - Tawana Mohammadi
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
            title: "Sefid Yab v1.0",
            menu_btn: "Sefid Yab",
            labels: { location: "Location", device: "Device", id: "Perm ID", created: "Created", renamed: "Renamed", identity: "Identity", lang: "Language", type: "Type" },
            risk: { safe: "SAFE", detected: "DETECTED", anomaly: "ANOMALY", caution: "CAUTION", normal: "NORMAL", verified: "VERIFIED ID" },
            tags: {
                title: "Manual Tags / Classification",
                loc_change: "Location Changed",
                base_iran: "Suspect Base Iran",
                cyber: "Cyber/Organized",
                fake: "Fake/Bot"
            },
            status: {
                high_conf: "High Confidence",
                high_desc: "Connection matches organic traffic patterns.",
                shield: "Shield Active",
                shield_desc: "Traffic obfuscated via Proxy/VPN or flagged for relocation.",
                shield_norm: "Shield Active (Normal)",
                shield_norm_desc: "User identified as Iranian/West Asia using VPN. Standard behavior.",
                anomaly: "Anomaly Detected",
                anomaly_desc: "Direct access blocked in Iran. Likely causes: White SIM, Serverless config",
                hidden_anomaly: "Hidden Identity",
                hidden_anomaly_desc: "Farsi speaker in 'West Asia' with Direct Access. High probability of Iran-based White SIM/Gov Net usage.",
                renamed_msg: "Renamed {n}x"
            },
            dashboard: {
                title: "Forensics Database",
                btn_open: "📂 DB",
                search_placeholder: "Search Username, ID or Tag...",
                filter_loc: "Filter Location",
                filter_risk: "Filter Risk Level",
                opt_all: "All Risks",
                btn_export: "💾 Export CSV",
                btn_backup: "💾 Backup JSON",
                btn_restore: "📥 Restore JSON",
                btn_cloud: "☁️ Update from GitHub",
                btn_contrib: "📤 Contribute Data",
                btn_clear: "🗑️ Clear Cache",
                btn_block: "🚫 Mass Block Listed",
                btn_stop: "🛑 STOP Process",
                btn_lookup: "🆔 ID Lookup",
                count: "Users Stored: {n}",
                list_header: "User List (Click to Visit)",
                list_empty: "No users found matching filters.",
                page_prev: "◀ Prev",
                page_next: "Next ▶",
                page_info: "Page {c} of {t}",
                msg_cleared: "Database wiped successfully!",
                msg_restored: "Restored {n} users.",
                msg_imported_batch: "Imported {n} users from Batch file with full details.",
                msg_cloud_ok: "Success! Added {n} users from GitHub.",
                msg_cloud_fail: "Failed to fetch database.",
                msg_err: "Invalid file.",
                msg_block_conf: "⚠️ WARNING ⚠️\n\nYou are about to BLOCK {n} users currently visible in the list (excluding those already blocked).\n\nProcess takes time (1.2s per user).\nContinue?",
                msg_blocking: "Blocking {c}/{t}...",
                msg_block_done: "Process Complete. Blocked {n} users.",
                msg_block_stop: "Process stopped by user.",
                msg_no_targets: "All users in this filter are already blocked!",
                contrib_info: "1. A CLEAN file (contribution.json) has been downloaded (Block status removed).\n2. A GitHub tab will open.\n3. DRAG & DROP the file into the comment box to upload it."
            },
            lookup: {
                title: "Find User by ID",
                desc: "Enter a Numeric ID (e.g. 44196397). Twitter will redirect you to the current profile.",
                input_ph: "Numeric ID...",
                btn_go: "Visit Profile",
                btn_back: "Back to DB"
            },
            batch: {
                title: "Batch Processing",
                btn_open: "⚙️ Batch",
                input_placeholder: "One username per line (no @ symbol)",
                btn_start: "Start Processing",
                btn_export_json: "💾 Export JSON",
                status_idle: "Idle",
                status_running: "Running...",
                status_paused: "Paused (Rate Limit)",
                status_stopped: "Stopped",
                status_done: "Finished",
                progress: "Progress: {c} of {t} | OK: {ok} | Error: {err}",
                rate_limit_msg: "API Rate Limit hit. Pausing for 1 minute...",
                rate_limit_wait: "Pausing: {s} seconds remaining...",
                export_filename: "batch_export",
                fields_label: "Select Fields to Export:",
                col_username: "Username",
                col_name: "Display Name",
                col_id_changes: "ID Change Count",
                col_last_change: "Last ID Change (UTC)",
                col_created: "Created Date (UTC)",
                col_deleted: "Account Status (0: Deleted/Suspended, 1: Active)",
                col_device: "Device Type (0: Android, 1: iPhone, 2: Web/Other)",
                col_location_status: "Location Status (0: None, 1: Accurate/i, 2: VPN/Proxy)",
                col_gender: "Gender (2: Unknown)",
                col_numeric_id: "Numeric ID",
                col_location: "Location",
                col_avatar: "Avatar URL",
                col_lang: "Language (fa/other)",
                col_verified: "Verified (0/1)"
            },
            btn: { view_avatar: "View Avatar", close: "Close", retry: "Refresh Data" },
            values: { gov: "Government", unknown: "Unknown", west_asia: "West Asia", fa_script: "Farsi/Arabic" },
            notes_placeholder: "Add personal notes...",
            osint_titles: { archive: "Check Wayback Machine", google: "Google Dork", lens: "Reverse Image Search" },
            lang_sel: "Lang:"
        },
        fa: {
            title: "سفید یاب ۱.۰",
            menu_btn: "سفید یاب",
            labels: { location: "موقعیت", device: "دستگاه", id: "شناسه", created: "ساخت", renamed: "تغییر نام", identity: "هویت", lang: "زبان", type: "نوع" },
            risk: { safe: "امن", detected: "هشدار", anomaly: "ناهنجاری", caution: "احتیاط", normal: "طبیعی", verified: "تایید شده" },
            tags: {
                title: "دسته‌بندی / تگ‌ها",
                loc_change: "تغییر لوکیشن",
                base_iran: "مشکوک به Base Iran",
                cyber: "سایبری/سازمانی",
                fake: "فیک/جعلی"
            },
            status: {
                high_conf: "اطمینان بالا",
                high_desc: "اتصال طبیعی و ارگانیک است.",
                shield: "سپر فعال",
                shield_desc: "استفاده از VPN/پروکسی تشخیص داده شد.",
                shield_norm: "سپر فعال (طبیعی)",
                shield_norm_desc: "کاربر ایران/غرب آسیا با VPN. رفتار طبیعی.",
                anomaly: "ناهنجاری",
                anomaly_desc: "اتصال مستقیم در ایران غیرممکن است. دلایل: سیم‌کارت سفید، کانفیگ سرورلس.",
                hidden_anomaly: "هویت پنهان",
                hidden_anomaly_desc: "فارسی‌زبان در «غرب آسیا» با اتصال مستقیم. احتمال قوی: سیم‌کارت سفید یا اینترنت دولتی.",
                renamed_msg: "{n} بار تغییر نام"
            },
            dashboard: {
                title: "پایگاه داده جرم‌شناسی",
                btn_open: "📂 دیتا",
                search_placeholder: "جستجوی کاربر، ID یا تگ...",
                filter_loc: "فیلتر کشور",
                filter_risk: "فیلتر ریسک",
                opt_all: "همه",
                btn_export: "💾 خروجی CSV",
                btn_backup: "💾 بک‌آپ JSON",
                btn_restore: "📥 بازگردانی",
                btn_cloud: "☁️ آپدیت از گیت‌هاب",
                btn_contrib: "📤 ارسال دیتا (مشارکت)",
                btn_clear: "🗑️ حذف دیتا",
                btn_block: "🚫 مسدودسازی لیست",
                btn_stop: "🛑 توقف عملیات",
                btn_lookup: "🆔 یابنده ID",
                count: "ذخیره شده: {n}",
                list_header: "لیست کاربران (برای مشاهده کلیک کنید)",
                list_empty: "کاربری با این مشخصات یافت نشد.",
                page_prev: "◀ قبلی",
                page_next: "بعدی ▶",
                page_info: "صفحه {c} از {t}",
                msg_cleared: "پایگاه داده پاک شد!",
                msg_restored: "تعداد {n} کاربر بازیابی شد.",
                msg_imported_batch: "تعداد {n} کاربر از فایل Batch با جزئیات کامل وارد شد.",
                msg_cloud_ok: "موفق! {n} کاربر از گیت‌هاب اضافه شد.",
                msg_cloud_fail: "خطا در دریافت دیتابیس.",
                msg_err: "فایل نامعتبر است.",
                msg_block_conf: "⚠️ هشدار ⚠️\n\nشما در حال مسدود کردن (Block) تعداد {n} کاربر هستید (کاربرانی که قبلا بلاک شده‌اند نادیده گرفته می‌شوند).\n\nاین فرآیند زمان‌بر است.\nادامه می‌دهید؟",
                msg_blocking: "مسدودسازی {c} از {t}...",
                msg_block_done: "پایان! {n} کاربر بلاک شدند.",
                msg_block_stop: "عملیات توسط کاربر متوقف شد.",
                msg_no_targets: "تمام کاربران این لیست قبلا بلاک شده‌اند!",
                contrib_info: "۱. یک فایل پاکسازی شده (contribution.json) دانلود شد (وضعیت بلاک حذف شد).\n۲. صفحه گیت‌هاب باز می‌شود.\n۳. فایل دانلود شده را داخل کادر متن بکشید و رها کنید (Drag & Drop)."
            },
            lookup: {
                title: "جستجو با شناسه عددی",
                desc: "شناسه عددی (مانند 44196397) را وارد کنید تا به پروفایل فعلی هدایت شوید.",
                input_ph: "شناسه عددی...",
                btn_go: "مشاهده پروفایل",
                btn_back: "بازگشت"
            },
            batch: {
                title: "پردازش دسته‌ای (Batch Processing)",
                btn_open: "⚙️ پردازش",
                input_placeholder: "هر خط یک نام کاربری (@ بدون علامت)",
                btn_start: "شروع پردازش",
                btn_export_json: "💾 خروجی JSON",
                status_idle: "آماده",
                status_running: "در حال اجرا...",
                status_paused: "متوقف شده (Rate Limit)",
                status_stopped: "متوقف شد",
                status_done: "پایان یافت",
                progress: "پیشرفت: {c} از {t} | موفق: {ok} | خطا: {err}",
                rate_limit_msg: "محدودیت نرخ API فعال شد. ۱ دقیقه صبر می‌کند...",
                rate_limit_wait: "توقف: {s} ثانیه باقی مانده...",
                export_filename: "خروجی-دسته-ای",
                fields_label: "انتخاب فیلدها برای خروجی:",
                col_username: "نام کاربری",
                col_name: "نام نمایشی",
                col_id_changes: "تعداد تغییر نام",
                col_last_change: "آخرین تغییر نام (میلادی)",
                col_created: "تاریخ ثبت نام (میلادی)",
                col_deleted: "وضعیت اکانت (0: حذف/تعلیق, 1: فعال)",
                col_device: "نوع دستگاه (0: اندروید, 1: آیفون, 2: وب/دیگر)",
                col_location_status: "وضعیت مکان (0: بدون علامت, 1: دقیق, 2: VPN/پروکسی)",
                col_gender: "جنسیت (2: نامشخص)",
                col_numeric_id: "آی‌دی عددی",
                col_location: "موقعیت",
                col_avatar: "لینک آواتار",
                col_lang: "زبان (fa/other)",
                col_verified: "تیک (0/1)"
            },
            btn: { view_avatar: "آواتار اصلی", close: "بستن", retry: "بروزرسانی" },
            values: { gov: "دولتی", unknown: "نامشخص", west_asia: "غرب آسیا", fa_script: "فارسی/عربی" },
            notes_placeholder: "یادداشت شخصی بنویسید...",
            osint_titles: { archive: "آرشیو اینترنت", google: "جستجوی گوگل", lens: "جستجوی تصویر" },
            lang_sel: "زبان:"
        }
    };

    const TEXT = TRANSLATIONS[ACTIVE_LANG] || TRANSLATIONS['en'];

    // --- 2. STORAGE & GLOBALS ---
    const STORAGE_KEY = "xf_db_v1";
    const GITHUB_REPO_ISSUES = "https://github.com/tawanamohammadi/xforensics/issues/new";
    const CLOUD_DB_URL = "https://raw.githubusercontent.com/tawanamohammadi/xforensics/main/database.json";

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
        enabledFields: new Set(BATCH_FIELDS.map(f => f.id))
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
        :root { --xf-bg: rgba(0,0,0,0.9); --xf-border: rgba(255,255,255,0.15); --xf-blue: #1d9bf0; --xf-green: #00ba7c; --xf-red: #f91880; --xf-orange: #ffd400; --xf-purple: #794BC4; --xf-text: #e7e9ea; --xf-dim: #71767b; }

        #xf-pill { display: inline-flex; align-items: center; background: rgba(255,255,255,0.05); border: 1px solid var(--xf-border); border-radius: 99px; padding: 4px 12px; margin-right: 12px; margin-bottom: 4px; cursor: pointer; font-family: ${FONT_STACK}; font-size: 13px; user-select: none; direction: ltr; }
        #xf-pill:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
        .xf-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; box-shadow: 0 0 6px currentColor; animation: xf-pulse 2s infinite; }
        .xf-mini-pill { display: inline-flex; align-items: center; margin-left: 4px; padding: 2px 6px; border-radius: 4px; font-size: 11px; cursor: pointer; user-select: none; background: rgba(255,255,255,0.05); border: 1px solid var(--xf-border); color: var(--xf-dim); vertical-align: middle; font-family: ${FONT_STACK}; direction: ltr; }
        .xf-mini-pill:hover { background: rgba(29,155,240,0.15); color: var(--xf-blue); border-color: var(--xf-blue); }
        .xf-mini-pill.xf-loaded { background: transparent; border: none; padding: 0 4px; font-weight: bold; }
        @keyframes xf-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .xf-menu-item { display: flex; align-items: center; padding: 12px; cursor: pointer; transition: 0.2s; border-radius: 99px; margin: 4px 0; }
        .xf-menu-item:hover { background: rgba(239, 243, 244, 0.1); }
        .xf-menu-icon { width: 26px; height: 26px; margin-right: 20px; fill: currentColor; }
        .xf-menu-text { font-size: 20px; font-weight: 700; font-family: ${FONT_STACK}; color: var(--xf-text); line-height: 24px; }

        #xf-mob-fab { position: fixed; bottom: 75px; left: 20px; width: 48px; height: 48px; background: var(--xf-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(29,155,240,0.4); cursor: pointer; z-index: 9000; transition: 0.2s; border: 2px solid #000; }
        #xf-mob-fab:hover { transform: scale(1.1); }
        .xf-mob-icon { width: 24px; height: 24px; fill: #fff; }

        #xf-dash-overlay, #xf-batch-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 10001; display: none; align-items: center; justify-content: center; backdrop-filter: blur(8px); direction: ${IS_RTL?'rtl':'ltr'}; }
        #xf-dash-box, #xf-batch-box { width: 95%; max-width: 400px; max-height: 80vh; background: #000; border: 1px solid var(--xf-border); border-radius: 16px; padding: 16px; font-family: ${FONT_STACK}; box-shadow: 0 20px 50px rgba(0,0,0,0.8); color: #fff; display: flex; flex-direction: column; }
        .xf-dash-title { font-size: 18px; font-weight: 800; margin-bottom: 10px; border-bottom: 1px solid var(--xf-border); padding-bottom: 8px; display:flex; justify-content:space-between; align-items:center; }
        .xf-btn-row { display: flex; gap: 8px; margin-top: 8px; }
        .xf-input { width: 100%; padding: 8px; margin-bottom: 8px; background: #16181c; border: 1px solid var(--xf-border); color: #fff; border-radius: 8px; outline: none; box-sizing: border-box; font-family: ${FONT_STACK}; }
        .xf-dash-btn { flex: 1; padding: 10px; border-radius: 99px; font-weight: bold; cursor: pointer; border: none; transition: 0.2s; font-family: ${FONT_STACK}; font-size: 12px; white-space: nowrap; }
        .xf-btn-blue { background: var(--xf-blue); color: #fff; }
        .xf-btn-green { background: var(--xf-green); color: #fff; }
        .xf-btn-purple { background: var(--xf-purple); color: #fff; }
        .xf-btn-orange { background: var(--xf-orange); color: #000; }
        .xf-btn-red { background: rgba(249, 24, 128, 0.2); color: var(--xf-red); border: 1px solid var(--xf-red); }
        .xf-btn-red:hover { background: var(--xf-red); color: #fff; }

        #xf-user-list { flex: 1; overflow-y: auto; margin: 8px 0; border: 1px solid var(--xf-border); border-radius: 8px; padding: 5px; background: rgba(255,255,255,0.03); min-height: 100px; }
        .xf-user-row { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid var(--xf-border); cursor: pointer; font-size: 12px; }
        .xf-user-row:hover { background: rgba(255,255,255,0.1); }
        .xf-user-row.xf-blocked { opacity: 0.5; background: rgba(100,0,0,0.1); }
        .xf-u-name { font-weight: bold; color: var(--xf-text); }
        .xf-u-meta { font-size: 11px; color: var(--xf-dim); display: block; margin-top: 2px; }
        .xf-u-risk { font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #000; }
        .xf-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 11px; color: var(--xf-dim); border-top: 1px solid var(--xf-border); padding-top: 5px; }
        .xf-page-btn { cursor: pointer; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.1); user-select: none; }

        #xf-card { position: fixed; z-index: 10000; width: 320px; background: var(--xf-bg); backdrop-filter: blur(12px); border: 1px solid var(--xf-border); border-radius: 16px; padding: 16px; color: var(--xf-text); font-family: ${FONT_STACK}; box-shadow: 0 15px 40px rgba(0,0,0,0.7); opacity: 0; transform: translateY(10px); transition: 0.2s; pointer-events: none; direction: ${IS_RTL?'rtl':'ltr'}; text-align: ${IS_RTL?'right':'left'}; }
        #xf-card.visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .xf-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--xf-border); padding-bottom: 10px; margin-bottom: 10px; }
        .xf-title { font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--xf-dim); }
        .xf-badge { font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: var(--xf-border); color: #fff; }
        .xf-retry { font-size: 18px; cursor: pointer; color: var(--xf-blue); padding: 4px; border-radius: 50%; transition: all 0.3s; display: flex; align-items: center; justify-content: center; margin-left: 10px; }
        .xf-retry:hover { background: rgba(29, 155, 240, 0.1); transform: rotate(180deg); }
        .xf-bar-bg { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 12px; overflow: hidden; }
        .xf-bar-fill { height: 100%; transition: width 0.5s; }
        .xf-status { padding: 10px; border-radius: 8px; font-size: 12px; line-height: 1.4; margin-bottom: 12px; background: rgba(255,255,255,0.03); border-${IS_RTL?'right':'left'}: 3px solid transparent; }
        .xf-grid { display: grid; gap: 6px; font-size: 13px; }
        .xf-row { display: flex; justify-content: space-between; }
        .xf-lbl { color: var(--xf-dim); }
        .xf-val { font-weight: 600; direction: ltr; }
        .xf-mono { font-family: monospace; background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 4px; }
        .xf-ftr { margin-top: 15px; text-align: center; }
        .xf-btn { display: block; padding: 8px; background: rgba(29,155,240,0.15); color: var(--xf-blue); border-radius: 8px; font-weight: bold; font-size: 12px; text-decoration: none; font-family: ${FONT_STACK}; }
        .xf-lang-section { margin-top:10px; font-size:11px; color:var(--xf-dim); display:flex; gap:5px; align-items:center; }
        .xf-lang-opt { cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: 0.2s; }
        .xf-lang-opt:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .xf-lang-active { background: rgba(29,155,240,0.2); color: var(--xf-blue); font-weight: bold; }
        #xf-mob-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 99999; display: none; align-items: flex-end; justify-content: center; backdrop-filter: blur(5px); direction: ${IS_RTL?'rtl':'ltr'}; }
        #xf-mob-sheet { width: 100%; max-width: 450px; background: #000; border-top: 1px solid var(--xf-border); border-radius: 20px 20px 0 0; padding: 20px; animation: xf-up 0.3s; font-family: ${FONT_STACK}; }
        @keyframes xf-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .xf-close { margin-top: 15px; padding: 12px; background: #eff3f4; color: #000; text-align: center; border-radius: 99px; font-weight: 700; font-size: 14px; cursor: pointer; user-select: none; }
        .xf-textarea { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--xf-border); color: #fff; border-radius: 8px; padding: 8px; margin-top: 12px; font-family: ${FONT_STACK}; font-size: 12px; resize: vertical; min-height: 50px; box-sizing: border-box; outline: none; }
        .xf-textarea:focus { border-color: var(--xf-blue); }
        .xf-osint-row { display: flex; gap: 10px; margin-top: 12px; justify-content: center; }
        .xf-osint-icon { font-size: 16px; cursor: pointer; opacity: 0.7; transition: 0.2s; text-decoration: none; }
        .xf-osint-icon:hover { opacity: 1; transform: scale(1.1); }

        .xf-batch-options { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin: 10px 0; max-height: 100px; overflow-y: auto; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 8px; }
        .xf-batch-opt { display: flex; align-items: center; font-size: 11px; color: var(--xf-dim); cursor: pointer; }
        .xf-batch-opt input { margin-right: 5px; cursor: pointer; accent-color: var(--xf-blue); }

        .xf-tags-container { margin-top: 10px; border-top: 1px solid var(--xf-border); padding-top: 8px; }
        .xf-tags-title { font-size: 11px; font-weight: bold; color: var(--xf-dim); margin-bottom: 5px; }
        .xf-tags-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .xf-tag-opt { display: flex; align-items: center; font-size: 11px; color: var(--xf-text); cursor: pointer; user-select: none; }
        .xf-tag-opt input { margin-right: 5px; accent-color: var(--xf-blue); cursor: pointer; }
    `;

    const styleEl = document.createElement("style");
    styleEl.innerHTML = STYLES;
    document.head.appendChild(styleEl);

    // --- 4. LOGIC ---
    const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    const SOURCE_REGEX = /^(.*?)\s+(App\s?Store|Google\s?Play|Play\s?Store|Android\s?App|iOS\s?App)$/i;
    const ARABIC_SCRIPT_REGEX = /[\u0600-\u06FF]/;

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

    // --- BATCH PROCESSING LOGIC ---

    function initBatchModal() {
        batchOverlayEl = document.createElement("div");
        batchOverlayEl.id = "xf-batch-overlay";
        batchOverlayEl.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 10002; display: none; align-items: center; justify-content: center; backdrop-filter: blur(8px);";
        document.body.appendChild(batchOverlayEl);
    }

    function updateBatchUI(clearList = false) {
        const statusEl = document.getElementById('xf-batch-status');
        const progressEl = document.getElementById('xf-batch-progress');
        const rateEl = document.getElementById('xf-batch-rate-status');
        const startBtn = document.getElementById('xf-batch-start');
        const resultsListEl = document.getElementById('xf-batch-results-list');

        if (!statusEl) return;

        if (batchState.isAborted && !batchState.isRunning) {
            statusEl.textContent = TEXT.batch.status_stopped;
            statusEl.style.color = 'var(--xf-red)';
            startBtn.textContent = TEXT.batch.btn_start;
            startBtn.disabled = false;
            startBtn.classList.remove('xf-btn-red');
            startBtn.classList.add('xf-btn-blue');
        } else if (batchState.isPaused) {
            statusEl.textContent = TEXT.batch.status_paused;
            statusEl.style.color = 'var(--xf-orange)';
            rateEl.textContent = TEXT.batch.rate_limit_wait.replace('{s}', batchState.currentWaitTime);
            startBtn.textContent = TEXT.dashboard.btn_stop;
        } else if (batchState.isRunning) {
            statusEl.textContent = TEXT.batch.status_running;
            statusEl.style.color = 'var(--xf-blue)';
            rateEl.textContent = '';
            startBtn.textContent = TEXT.dashboard.btn_stop;
            startBtn.classList.remove('xf-btn-blue');
            startBtn.classList.add('xf-btn-red');
        } else {
            // Idle or Done
            if (batchState.total > 0 && batchState.index === batchState.total) {
                statusEl.textContent = TEXT.batch.status_done;
                statusEl.style.color = 'var(--xf-green)';
            } else {
                statusEl.textContent = TEXT.batch.status_idle;
                statusEl.style.color = 'var(--xf-green)';
            }
            rateEl.textContent = '';
            startBtn.textContent = TEXT.batch.btn_start;
            startBtn.disabled = false;
            startBtn.classList.remove('xf-btn-red');
            startBtn.classList.add('xf-btn-blue');
        }

        progressEl.innerHTML = TEXT.batch.progress
            .replace('{c}', batchState.index)
            .replace('{t}', batchState.total)
            .replace('{ok}', batchState.okCount)
            .replace('{err}', batchState.errCount);

        if (clearList) {
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
            const username = batchState.list[batchState.index];
            const index = batchState.index;
            const resultsListEl = document.getElementById('xf-batch-results-list');

            if (batchState.isPaused) return;

            let result = null;
            let statusChar = '❌';

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
                    batchState.isRunning = true;
                    await handleRateLimit();
                    return;
                }

                const json = await response.json();

                if (json.errors && json.errors.length > 0) {
                     const error = json.errors[0].message;
                     let displayName = 'ERROR';

                     if (error.includes("Not found") || error.includes("Suspended") || error.includes("Could not find user")) {
                         result = mapRawDataToBatchOutput({
                             core: { screen_name: username, name: 'N/A' },
                             rest_id: 'N/A',
                             about_profile: {},
                             is_deleted: true
                         });
                         displayName = 'Suspended';
                         statusChar = '🚫';
                         batchState.okCount++;
                     } else {
                         throw new Error(`API Error: ${error}`);
                     }

                     if (resultsListEl) {
                         resultsListEl.innerHTML += `<div style="color:var(--xf-red);">[${index + 1}/${batchState.total}] ${statusChar} @${username} (${displayName})</div>`;
                     }


                } else {
                    const res = json?.data?.user?.result || json?.data?.user_result_by_screen_name?.result;
                    if (!res) throw new Error("No user result data.");

                    result = mapRawDataToBatchOutput(res);
                    batchState.okCount++;
                    statusChar = '✅';

                    const displayLabel = result[TEXT.batch.col_name] || username;
                    if (resultsListEl) {
                         resultsListEl.innerHTML += `<div>[${index + 1}/${batchState.total}] ${statusChar} @${username} (${displayLabel})</div>`;
                    }
                }

                batchState.results.push(result);

            } catch (e) {
                console.error(`Error fetching @${username}:`, e);
                batchState.errCount++;
                const errorObj = {};
                if(batchState.enabledFields.has('username')) errorObj[TEXT.batch.col_username] = username;
                if(batchState.enabledFields.has('name')) errorObj[TEXT.batch.col_name] = 'API ERROR';

                batchState.results.push(errorObj);

                if (resultsListEl) {
                    resultsListEl.innerHTML += `<div style="color:var(--xf-red);">[${index + 1}/${batchState.total}] ❌ @${username} (API Error)</div>`;
                }
            }

            batchState.index++;
            updateBatchUI();
            await new Promise(r => setTimeout(r, BATCH_DELAY));
        }

        if (batchState.index === batchState.total || batchState.isAborted) {
            batchState.isRunning = false;
        }
        updateBatchUI();
    }

    function startBatchProcessing() {
        if (batchState.isRunning) {
            batchState.isAborted = true;
            updateBatchUI();
            return;
        }

        const inputArea = document.getElementById('xf-batch-input');
        const rawList = inputArea.value.split('\n').map(u => u.trim().replace(/^@/, '')).filter(u => u.length > 0);

        if (rawList.length === 0) return;

        batchState.list = rawList;
        batchState.total = rawList.length;
        batchState.index = 0;
        batchState.okCount = 0;
        batchState.errCount = 0;
        batchState.isRunning = true;
        batchState.isAborted = false;
        batchState.isPaused = false;
        batchState.results = [];

        document.getElementById('xf-batch-results-list').innerHTML = '';

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

    function showBatchModal() {
        document.getElementById("xf-dash-overlay").style.display = "none";

        batchOverlayEl.innerHTML = `
            <div id="xf-batch-box" class="xf-dash-box" style="max-width: 500px; max-height: 90vh;">
                <div class="xf-dash-title">${TEXT.batch.title}</div>

                <div style="font-size:12px; font-weight:bold; margin-top:5px;">${TEXT.batch.fields_label}</div>
                <div class="xf-batch-options">
                    ${BATCH_FIELDS.map(field => `
                        <label class="xf-batch-opt">
                            <input type="checkbox" data-id="${field.id}" ${batchState.enabledFields.has(field.id) ? 'checked' : ''}>
                            ${TEXT.batch[field.labelKey]}
                        </label>
                    `).join('')}
                </div>

                <textarea id="xf-batch-input" class="xf-textarea" style="height: 100px; margin-top: 5px; direction: ltr;" placeholder="${TEXT.batch.input_placeholder}"></textarea>

                <div style="margin: 5px 0; font-size: 13px; font-weight: bold; display: flex; justify-content: space-between;">
                    <span id="xf-batch-status" style="color: var(--xf-green);">${TEXT.batch.status_idle}</span>
                    <span id="xf-batch-rate-status" style="color: var(--xf-orange); font-size: 11px;"></span>
                </div>

                <div id="xf-batch-progress" style="font-size: 11px; color: var(--xf-dim); margin-bottom: 5px; direction: ltr;">
                    ${TEXT.batch.progress.replace('{c}', 0).replace('{t}', 0).replace('{ok}', 0).replace('{err}', 0)}
                </div>

                <div class="xf-btn-row">
                    <button id="xf-batch-start" class="xf-dash-btn xf-btn-blue">${TEXT.batch.btn_start}</button>
                    <button id="xf-batch-export" class="xf-dash-btn xf-btn-green">${TEXT.batch.btn_export_json}</button>
                </div>
                <div class="xf-btn-row">
                    <button id="xf-batch-clear-list" class="xf-dash-btn xf-btn-red" style="flex: 0.5;">Clear Input</button>
                    <button id="xf-batch-close" class="xf-dash-btn xf-btn-red" style="background:transparent;border:1px solid var(--xf-dim);color:var(--xf-dim); flex: 1.5;">${TEXT.btn.close}</button>
                </div>

                <h3 style="font-size: 14px; margin-top: 10px; border-bottom: 1px solid var(--xf-border); padding-bottom: 5px;">Results</h3>
                <div id="xf-batch-results-list" style="flex: 1; overflow-y: auto; background: #16181c; border-radius: 8px; padding: 5px; font-size: 12px; font-family: monospace; color: var(--xf-text); direction: ltr;">
                    <!-- Results go here -->
                </div>
            </div>
        `;

        batchOverlayEl.style.display = "flex";

        const checks = batchOverlayEl.querySelectorAll('.xf-batch-options input[type="checkbox"]');
        checks.forEach(chk => {
            chk.onchange = (e) => {
                const id = e.target.getAttribute('data-id');
                if (e.target.checked) batchState.enabledFields.add(id);
                else batchState.enabledFields.delete(id);
            };
        });

        document.getElementById('xf-batch-start').onclick = startBatchProcessing;
        document.getElementById('xf-batch-export').onclick = exportBatchJson;
        document.getElementById('xf-batch-close').onclick = () => {
            if (batchState.isRunning) {
                batchState.isAborted = true;
            }
            batchOverlayEl.style.display = "none";
        };
        document.getElementById('xf-batch-clear-list').onclick = () => {
            document.getElementById('xf-batch-input').value = '';
            batchState.results = [];
            updateBatchUI(true);
        };

        if (batchState.list.length > 0 && batchState.index < batchState.total) {
            document.getElementById('xf-batch-input').value = batchState.list.slice(batchState.index).join('\n');
        } else if (batchState.list.length > 0) {
            document.getElementById('xf-batch-input').value = batchState.list.join('\n');
        }

        const resultsListEl = document.getElementById('xf-batch-results-list');
        if (resultsListEl) {
             batchState.results.forEach(result => {
                 const username = result[TEXT.batch.col_username] || "???";
                 const name = result[TEXT.batch.col_name] || "???";
                 const statusChar = (name === 'ERROR' || name === 'API ERROR' || name === 'SUSPENDED/DELETED') ? '❌' : '✅';
                 resultsListEl.innerHTML += `<div>${statusChar} @${username} (${name})</div>`;
             });
        }

        updateBatchUI();
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

    // New Function for ID Lookup Page
    function showLookupPage() {
        const box = document.getElementById('xf-dash-box');
        if(!box) return;

        box.innerHTML = `
            <div class="xf-dash-title">${TEXT.lookup.title}</div>
            <div style="padding: 20px; text-align: center; flex:1; display:flex; flex-direction:column; justify-content:center;">
                <p style="color: #71767b; font-size: 12px; margin-bottom: 10px;">${TEXT.lookup.desc}</p>
                <input type="text" id="xf-lookup-input" class="xf-input" placeholder="${TEXT.lookup.input_ph}" style="text-align:center; font-family:monospace;">
                <button id="xf-lookup-go" class="xf-dash-btn xf-btn-blue" style="width:100%; margin-top:10px;">${TEXT.lookup.btn_go}</button>
                <button id="xf-lookup-back" class="xf-dash-btn xf-btn-red" style="width:100%; margin-top:10px; background:transparent; border:1px solid #71767b; color:#71767b;">${TEXT.lookup.btn_back}</button>
            </div>
        `;

        document.getElementById('xf-lookup-go').onclick = () => {
            const val = document.getElementById('xf-lookup-input').value.trim();
            if(!/^\d+$/.test(val)) return alert("Please enter numbers only.");
            window.open(`https://x.com/i/user/${val}`, '_blank');
        };

        document.getElementById('xf-lookup-back').onclick = showDashboard;
    }

    function getFilteredUsers() {
        const locFilter = document.getElementById("xf-filter-loc")?.value.toLowerCase() || "";
        const riskFilter = document.getElementById("xf-filter-risk")?.value || "ALL";
        const searchFilter = document.getElementById("xf-search-user")?.value.toLowerCase() || "";

        const allKeys = Object.keys(db).reverse();
        const filteredKeys = [];

        for (const user of allKeys) {
            const entry = db[user].data;
            const tags = db[user].tags || [];
            const riskTag = entry.riskLabel;

            if (locFilter && !entry.country.toLowerCase().includes(locFilter)) continue;
            if (riskFilter !== "ALL" && riskTag !== riskFilter) continue;
            // Search in username, ID, or tags
            if (searchFilter) {
                const tagMatch = tags.some(t => t.toLowerCase().includes(searchFilter));
                const userMatch = user.toLowerCase().includes(searchFilter) || entry.id.includes(searchFilter);
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
            const riskTag = entry.riskLabel;
            const isBlocked = entry.isBlocked === true;
            let badgeColor = "#fff";

            if (riskTag === TEXT.risk.safe || riskTag === TEXT.risk.normal) badgeColor = "var(--xf-green)";
            else if (riskTag === TEXT.risk.detected) badgeColor = "var(--xf-red)";
            else if (riskTag === TEXT.risk.anomaly) badgeColor = "var(--xf-orange)";

            const row = document.createElement("div");
            row.className = `xf-user-row ${isBlocked ? 'xf-blocked' : ''}`;
            const displayRisk = isBlocked ? `🚫 ${riskTag}` : riskTag;

            row.innerHTML = `<div><div class="xf-u-name">@${user}</div><span class="xf-u-meta">📍 ${entry.country} | 📱 ${entry.device.split(' ')[0]}</span></div><div class="xf-u-risk" style="background:${badgeColor}">${displayRisk}</div>`;
            row.onclick = () => window.open(`https://x.com/${user}`, '_blank');
            listContainer.appendChild(row);
        }

        if (pageItems.length === 0) listContainer.innerHTML = `<div style="padding:10px;text-align:center;color:var(--xf-dim);">${TEXT.dashboard.list_empty}</div>`;

        paginationContainer.innerHTML = `<div class="xf-page-btn" id="xf-page-prev">${TEXT.dashboard.page_prev}</div><span>${TEXT.dashboard.page_info.replace('{c}', currentPage).replace('{t}', totalPages)}</span><div class="xf-page-btn" id="xf-page-next">${TEXT.dashboard.page_next}</div>`;
        document.getElementById('xf-page-prev').onclick = () => { if (currentPage > 1) { currentPage--; renderUserList(db); } };
        document.getElementById('xf-page-next').onclick = () => { if (currentPage < totalPages) { currentPage++; renderUserList(db); } };
    }

    function showDashboard() {
        currentPage = 1;
        const count = Object.keys(db).length;
        const overlay = document.getElementById("xf-dash-overlay");

        overlay.innerHTML = `
            <div id="xf-dash-box">
                <div class="xf-dash-title">
                    ${TEXT.dashboard.title}
                    <div class="xf-lang-section">
                        <span>${TEXT.lang_sel}</span>
                        <span class="xf-lang-opt ${PREF_LANG==='auto'?'xf-lang-active':''}" id="xf-dash-l-auto">Auto</span>
                        <span class="xf-lang-opt ${PREF_LANG==='en'?'xf-lang-active':''}" id="xf-dash-l-en">En</span>
                        <span class="xf-lang-opt ${PREF_LANG==='fa'?'xf-lang-active':''}" id="xf-dash-l-fa">Fa</span>
                    </div>
                </div>
                <div style="font-size:12px;color:#71767b;margin-bottom:10px;">${TEXT.dashboard.count.replace("{n}", count)}</div>

                <input id="xf-search-user" class="xf-input" placeholder="${TEXT.dashboard.search_placeholder}">
                <input id="xf-filter-loc" class="xf-input" placeholder="${TEXT.dashboard.filter_loc}">

                <select id="xf-filter-risk" class="xf-input">
                    <option value="ALL">${TEXT.dashboard.opt_all}</option>
                    <option value="${TEXT.risk.anomaly}">${TEXT.risk.anomaly}</option>
                    <option value="${TEXT.risk.detected}">${TEXT.risk.detected}</option>
                    <option value="${TEXT.risk.safe}">${TEXT.risk.safe}</option>
                    <option value="${TEXT.risk.normal}">${TEXT.risk.normal}</option>
                </select>

                <div style="font-size:11px;color:var(--xf-dim);margin-top:5px;font-weight:bold;">${TEXT.dashboard.list_header}</div>
                <div id="xf-user-list"></div>
                <div id="xf-pagination" class="xf-pagination"></div>

                <div class="xf-btn-row">
                    <button id="xf-btn-batch" class="xf-dash-btn xf-btn-blue" style="flex:1.5">${TEXT.batch.btn_open}</button>
                    <button id="xf-btn-lookup" class="xf-dash-btn xf-btn-blue" style="flex:1">${TEXT.dashboard.btn_lookup}</button>
                </div>
                <div class="xf-btn-row">
                    <button id="xf-btn-cloud" class="xf-dash-btn xf-btn-purple">${TEXT.dashboard.btn_cloud}</button>
                    <button id="xf-btn-contrib" class="xf-dash-btn xf-btn-orange" style="color:#000;">${TEXT.dashboard.btn_contrib}</button>
                </div>
                <div class="xf-btn-row">
                    <button id="xf-btn-backup" class="xf-dash-btn xf-btn-blue">${TEXT.dashboard.btn_backup}</button>
                    <button id="xf-btn-restore" class="xf-dash-btn xf-btn-green">${TEXT.dashboard.btn_restore}</button>
                </div>
                <div class="xf-btn-row">
                    <button id="xf-btn-csv" class="xf-dash-btn xf-btn-blue" style="background:transparent;border:1px solid var(--xf-blue);color:var(--xf-blue)">${TEXT.dashboard.btn_export}</button>
                    <button id="xf-btn-clear" class="xf-dash-btn xf-btn-red" style="flex: 0.5;">${TEXT.dashboard.btn_clear}</button>
                    <button id="xf-btn-block" class="xf-dash-btn xf-btn-red" style="border:1px solid #fff;background:#420000; flex: 1.5;">${TEXT.dashboard.btn_block}</button>
                </div>

                <div id="xf-dash-close-btn" style="margin-top:10px;text-align:center;font-size:12px;cursor:pointer;color:#71767b;">${TEXT.btn.close}</div>
            </div>
        `;

        overlay.style.display = "flex";

        document.getElementById("xf-search-user").oninput = () => { currentPage = 1; renderUserList(db); };
        document.getElementById("xf-filter-loc").oninput = () => { currentPage = 1; renderUserList(db); };
        document.getElementById("xf-filter-risk").onchange = () => { currentPage = 1; renderUserList(db); };
        document.getElementById("xf-btn-backup").onclick = backupJSON;
        document.getElementById("xf-btn-cloud").onclick = loadFromCloud;
        document.getElementById("xf-btn-contrib").onclick = contributeData;
        document.getElementById("xf-btn-restore").onclick = () => document.getElementById("xf-restore-input").click();
        document.getElementById("xf-btn-csv").onclick = exportCSV;
        document.getElementById("xf-btn-clear").onclick = clearCache;
        document.getElementById("xf-btn-block").onclick = handleMassBlock;
        document.getElementById("xf-btn-batch").onclick = showBatchModal;
        document.getElementById("xf-btn-lookup").onclick = showLookupPage;
        document.getElementById("xf-dash-close-btn").onclick = () => { overlay.style.display = "none"; };

        document.getElementById('xf-dash-l-auto').onclick = () => setLang('auto');
        document.getElementById('xf-dash-l-en').onclick = () => setLang('en');
        document.getElementById('xf-dash-l-fa').onclick = () => setLang('fa');

        renderUserList(db);
    }

    async function handleMassBlock() {
        if (isBlockingProcess) {
            abortBlock = true;
            return;
        }

        const rawList = getFilteredUsers();
        const usersToBlock = rawList.filter(u => !db[u].data.isBlocked);

        if(usersToBlock.length === 0) return alert(TEXT.dashboard.msg_no_targets);

        if(!confirm(TEXT.dashboard.msg_block_conf.replace("{n}", usersToBlock.length))) return;

        const btn = document.getElementById("xf-btn-block");
        const originalText = TEXT.dashboard.btn_block;

        isBlockingProcess = true;
        abortBlock = false;
        btn.innerText = TEXT.dashboard.btn_stop;
        btn.style.background = "#fff";
        btn.style.color = "#000";

        let successCount = 0;

        for (let i = 0; i < usersToBlock.length; i++) {
            if (abortBlock) break;

            const username = usersToBlock[i];
            const userId = db[username].data.id;

            btn.innerText = `${TEXT.dashboard.btn_stop} (${i+1}/${usersToBlock.length})`;

            try {
                await performBlock(userId);
                db[username].data.isBlocked = true;
                saveDB();
                renderUserList(db);
                successCount++;
            } catch (e) {
                console.error("Block failed for", username, e);
            }
            await new Promise(r => setTimeout(r, 1200));
        }

        isBlockingProcess = false;
        btn.style.background = "#420000";
        btn.style.color = "#fff";
        btn.innerText = originalText;

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

        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `sefidyab_backup_${Date.now()}.json`;
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
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `sefidyab_report_${Date.now()}.csv`;
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

        if (data.renamed > 0 && label === TEXT.risk.safe) { color = "var(--xf-orange)"; label = TEXT.risk.caution; pct = "40%"; }
        if (data.isIdVerified) { pct = "0%"; label = TEXT.risk.verified; color = "var(--xf-blue)"; }

        data.riskLabel = label;

        // Use passed args or fallback to global DB
        const existingNote = note !== null ? note : (db[username]?.note || "");
        const userTags = tags !== null ? tags : (db[username]?.tags || []);
        const blockedBadge = data.isBlocked ? `<span style="background:red;color:white;font-size:10px;padding:2px 4px;border-radius:4px;margin-left:5px;">BLOCKED</span>` : "";

        // Available tags
        const availableTags = [
            { id: 'loc_change', label: TEXT.tags.loc_change },
            { id: 'base_iran', label: TEXT.tags.base_iran },
            { id: 'cyber', label: TEXT.tags.cyber },
            { id: 'fake', label: TEXT.tags.fake }
        ];

        let tagsHtml = `
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
        `;

        return `
            <div class="xf-header">
                <div style="display:flex;align-items:center;"><span class="xf-title">${TEXT.title}</span><span class="xf-badge" style="background:${color}">${label}</span>${blockedBadge}</div>
                <div class="xf-retry" id="xf-retry-btn" title="${TEXT.btn.retry}" data-user="${username}">↻</div>
            </div>
            <div class="xf-bar-bg"><div class="xf-bar-fill" style="width:${pct};background:${color}"></div></div>
            <div class="xf-status" style="border-${IS_RTL?'right':'left'}-color:${color};background:${bg}"><strong style="color:${color}">${title}</strong><br><span style="opacity:0.9">${desc}</span></div>
            <div class="xf-grid">
                ${data.country!==TEXT.values.unknown ? `<div class="xf-row"><span class="xf-lbl">${TEXT.labels.location}</span><span class="xf-val">📍 ${data.country}</span></div>` : ''}
                <div class="xf-row"><span class="xf-lbl">${TEXT.labels.device}</span><span class="xf-val">${data.deviceFull}</span></div>
                <div class="xf-row"><span class="xf-lbl">${TEXT.labels.id}</span><span class="xf-val xf-mono">${data.id}</span></div>
                <div class="xf-row"><span class="xf-lbl">${TEXT.labels.created}</span><span class="xf-val">${data.created}</span></div>
                ${data.langCode ? `<div class="xf-row"><span class="xf-lbl">${TEXT.labels.lang}</span><span class="xf-val">🗣️ ${data.langCode === 'fa' ? TEXT.values.fa_script : 'Other'}</span></div>` : ''}
                ${data.renamed>0 ? `<div class="xf-row"><span class="xf-lbl" style="color:var(--xf-orange)">${TEXT.labels.renamed}</span><span class="xf-val" style="color:var(--xf-orange)">${data.renamed}x</span></div>` : ''}
                ${data.isIdVerified ? `<div class="xf-row"><span class="xf-lbl">${TEXT.labels.identity}</span><span class="xf-val" style="color:var(--xf-green)">${TEXT.values.gov_id}</span></div>` : ''}
            </div>

            <textarea class="xf-textarea" id="xf-note-input" data-user="${username}" placeholder="${TEXT.notes_placeholder}">${existingNote}</textarea>

            ${tagsHtml}

            <div class="xf-osint-row">
                <a href="https://web.archive.org/web/*/twitter.com/${username}" target="_blank" title="${TEXT.osint_titles.archive}" class="xf-osint-icon">🏛️</a>
                <a href="https://www.google.com/search?q=%22${username}%22" target="_blank" title="${TEXT.osint_titles.google}" class="xf-osint-icon">🔍</a>
                <a href="https://lens.google.com/upload?url=${encodeURIComponent(data.avatar)}" target="_blank" title="${TEXT.osint_titles.lens}" class="xf-osint-icon">📷</a>
            </div>

            <div class="xf-ftr"><a href="${data.avatar}" target="_blank" class="xf-btn">${TEXT.btn.view_avatar}</a></div>
        `;
    }

    // --- UI UTILS ---
    function bindEvents(container) {
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
        if (IS_RTL) left -= 320; if (left + 340 > window.innerWidth) left = window.innerWidth - 360; if (top + 400 > window.innerHeight) top = e.clientY - 400;
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
        if (!forceRefresh && db[user]) {
            result = db[user];
            // FORCE REGENERATE HTML to include latest tags/notes
            const currentTags = result.tags || [];
            const currentNote = result.note || "";
            result.html = renderCardHTML(result.data, user, currentTags, currentNote);
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

            // Preserve existing tags/notes if just refreshing
            const existingTags = db[user]?.tags || [];
            const existingNote = db[user]?.note || "";

            const data = {
                country: countryDisplay, countryCode: rawCountry, device: devShort, deviceFull: devFull, id: res.rest_id,
                created: formatTime(res.core?.created_at || res.legacy?.created_at), renamed: parseInt(about.username_changes?.count || 0),
                isAccurate: about.location_accurate, isIdVerified: verif.is_identity_verified === true, langCode: isPersianSpeaker ? 'fa' : null,
                avatar: (res.avatar?.image_url || "").replace("_normal", "_400x400"),
                isBlocked: finalBlockedState
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
        initBatchModal();
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
