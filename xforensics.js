// ==UserScript==
// @name         X Profile Forensics (v18.0 Mobile UX)
// @namespace    http://tampermonkey.net/
// @version      18.0.0
// @description  Forensics tool. Mobile Fixes: Dashboard button moved to Bottom-Left FAB. Dashboard layout resized to fit small screens perfectly.
// @author       A Pleasant Experience
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
            title: "Forensics v18.0",
            menu_btn: "Forensics",
            labels: { location: "Location", device: "Device", id: "Perm ID", created: "Created", renamed: "Renamed", identity: "Identity", lang: "Language", type: "Type" },
            risk: { safe: "SAFE", detected: "DETECTED", anomaly: "ANOMALY", caution: "CAUTION", normal: "NORMAL", verified: "VERIFIED ID" },
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
                search_placeholder: "Search Username or ID...",
                filter_loc: "Filter Location",
                filter_risk: "Filter Risk Level",
                opt_all: "All Risks",
                btn_export: "💾 Export CSV",
                btn_backup: "💾 Backup JSON",
                btn_restore: "📥 Restore JSON",
                btn_cloud: "☁️ Update from GitHub",
                btn_contrib: "📤 Contribute Data",
                btn_clear: "🗑️ Clear Cache",
                count: "Users Stored: {n}",
                list_header: "User List (Click to Visit)",
                list_empty: "No users found matching filters.",
                page_prev: "◀ Prev",
                page_next: "Next ▶",
                page_info: "Page {c} of {t}",
                msg_cleared: "Database wiped successfully!",
                msg_restored: "Restored {n} users.",
                msg_cloud_ok: "Success! Added {n} users from GitHub.",
                msg_cloud_fail: "Failed to fetch database.",
                msg_err: "Invalid file.",
                contrib_info: "1. A file (contribution.json) has been downloaded.\n2. A GitHub tab will open.\n3. DRAG & DROP the file into the comment box to upload it."
            },
            btn: { view_avatar: "View Avatar", close: "Close", retry: "Refresh Data" },
            values: { gov: "Government", unknown: "Unknown", west_asia: "West Asia", fa_script: "Farsi/Arabic" },
            notes_placeholder: "Add personal notes...",
            osint_titles: { archive: "Check Wayback Machine", google: "Google Dork", lens: "Reverse Image Search" },
            lang_sel: "Lang:"
        },
        fa: {
            title: "تحلیلگر پروفایل ۱۸.۰",
            menu_btn: "جرم‌شناسی",
            labels: { location: "موقعیت", device: "دستگاه", id: "شناسه", created: "ساخت", renamed: "تغییر نام", identity: "هویت", lang: "زبان", type: "نوع" },
            risk: { safe: "امن", detected: "هشدار", anomaly: "ناهنجاری", caution: "احتیاط", normal: "طبیعی", verified: "تایید شده" },
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
                search_placeholder: "جستجوی نام کاربری یا ID...",
                filter_loc: "فیلتر کشور",
                filter_risk: "فیلتر ریسک",
                opt_all: "همه",
                btn_export: "💾 خروجی CSV",
                btn_backup: "💾 بک‌آپ JSON",
                btn_restore: "📥 بازگردانی",
                btn_cloud: "☁️ آپدیت از گیت‌هاب",
                btn_contrib: "📤 ارسال دیتا (مشارکت)",
                btn_clear: "🗑️ حذف دیتا",
                count: "ذخیره شده: {n}",
                list_header: "لیست کاربران (برای مشاهده کلیک کنید)",
                list_empty: "کاربری با این مشخصات یافت نشد.",
                page_prev: "◀ قبلی",
                page_next: "بعدی ▶",
                page_info: "صفحه {c} از {t}",
                msg_cleared: "پایگاه داده پاک شد!",
                msg_restored: "تعداد {n} کاربر بازیابی شد.",
                msg_cloud_ok: "موفق! {n} کاربر از گیت‌هاب اضافه شد.",
                msg_cloud_fail: "خطا در دریافت دیتابیس.",
                msg_err: "فایل نامعتبر است.",
                contrib_info: "۱. یک فایل (contribution.json) دانلود شد.\n۲. صفحه گیت‌هاب باز می‌شود.\n۳. فایل دانلود شده را داخل کادر متن بکشید و رها کنید (Drag & Drop)."
            },
            btn: { view_avatar: "آواتار اصلی", close: "بستن", retry: "بروزرسانی" },
            values: { gov: "دولتی", unknown: "نامشخص", west_asia: "غرب آسیا", fa_script: "فارسی/عربی" },
            notes_placeholder: "یادداشت شخصی بنویسید...",
            osint_titles: { archive: "آرشیو اینترنت", google: "جستجوی گوگل", lens: "جستجوی تصویر" },
            lang_sel: "زبان:"
        }
    };

    const TEXT = TRANSLATIONS[ACTIVE_LANG] || TRANSLATIONS['en'];

    // --- 2. STORAGE ---
    const STORAGE_KEY = "xf_db_v1";
    const GITHUB_REPO_ISSUES = "https://github.com/itsyebekhe/xforensics/issues/new";
    const CLOUD_DB_URL = "https://raw.githubusercontent.com/itsyebekhe/xforensics/main/database.json";

    let db = {};
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            db = JSON.parse(saved);
            let cleaned = false;
            Object.keys(db).forEach(k => { if(db[k].html) { delete db[k].html; cleaned=true; } });
            if(cleaned) saveDB();
        }
    } catch (e) { console.error("XF DB Load Error", e); }

    function saveDB() {
        const keys = Object.keys(db);
        if (keys.length > 20000) { keys.slice(0, 2000).forEach(k => delete db[k]); }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }

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

        /* Native Menu Item (Desktop) */
        .xf-menu-item { display: flex; align-items: center; padding: 12px; cursor: pointer; transition: 0.2s; border-radius: 99px; margin: 4px 0; }
        .xf-menu-item:hover { background: rgba(239, 243, 244, 0.1); }
        .xf-menu-icon { width: 26px; height: 26px; margin-right: 20px; fill: currentColor; }
        .xf-menu-text { font-size: 20px; font-weight: 700; font-family: ${FONT_STACK}; color: var(--xf-text); line-height: 24px; }

        /* Mobile Floating Button (Bottom Left) */
        #xf-mob-fab {
            position: fixed; bottom: 75px; left: 20px;
            width: 48px; height: 48px;
            background: var(--xf-blue); border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(29,155,240,0.4);
            cursor: pointer; z-index: 9000; transition: 0.2s;
            border: 2px solid #000;
        }
        #xf-mob-fab:hover { transform: scale(1.1); }
        .xf-mob-icon { width: 24px; height: 24px; fill: #fff; }

        /* Dashboard - Responsive Fix */
        #xf-dash-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 10001; display: none; align-items: center; justify-content: center; backdrop-filter: blur(8px); direction: ${IS_RTL?'rtl':'ltr'}; }
        #xf-dash-box {
            width: 95%; max-width: 400px; max-height: 80vh;
            background: #000; border: 1px solid var(--xf-border); border-radius: 16px; padding: 16px;
            font-family: ${FONT_STACK}; box-shadow: 0 20px 50px rgba(0,0,0,0.8); color: #fff;
            display: flex; flex-direction: column;
        }
        .xf-dash-title { font-size: 18px; font-weight: 800; margin-bottom: 10px; border-bottom: 1px solid var(--xf-border); padding-bottom: 8px; display:flex; justify-content:space-between; align-items:center; }

        /* Buttons Grid */
        .xf-btn-row { display: flex; gap: 8px; margin-top: 8px; }
        .xf-input { width: 100%; padding: 8px; margin-bottom: 8px; background: #16181c; border: 1px solid var(--xf-border); color: #fff; border-radius: 8px; outline: none; box-sizing: border-box; font-family: ${FONT_STACK}; }
        .xf-dash-btn { flex: 1; padding: 10px; border-radius: 99px; font-weight: bold; cursor: pointer; border: none; transition: 0.2s; font-family: ${FONT_STACK}; font-size: 12px; white-space: nowrap; }

        /* Colors */
        .xf-btn-blue { background: var(--xf-blue); color: #fff; }
        .xf-btn-green { background: var(--xf-green); color: #fff; }
        .xf-btn-purple { background: var(--xf-purple); color: #fff; }
        .xf-btn-orange { background: var(--xf-orange); color: #000; }
        .xf-btn-red { background: rgba(249, 24, 128, 0.2); color: var(--xf-red); border: 1px solid var(--xf-red); }

        /* User List Scroll Fix */
        #xf-user-list {
            flex: 1; overflow-y: auto; margin: 8px 0;
            border: 1px solid var(--xf-border); border-radius: 8px; padding: 5px;
            background: rgba(255,255,255,0.03); min-height: 100px;
        }
        .xf-user-row { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid var(--xf-border); cursor: pointer; font-size: 12px; }
        .xf-user-row:hover { background: rgba(255,255,255,0.1); }
        .xf-u-name { font-weight: bold; color: var(--xf-text); }
        .xf-u-meta { font-size: 11px; color: var(--xf-dim); display: block; margin-top: 2px; }
        .xf-u-risk { font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #000; }
        .xf-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 11px; color: var(--xf-dim); border-top: 1px solid var(--xf-border); padding-top: 5px; }
        .xf-page-btn { cursor: pointer; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.1); user-select: none; }

        /* Card */
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

        /* Language Switcher */
        .xf-lang-section { margin-top:10px; font-size:11px; color:var(--xf-dim); display:flex; gap:5px; align-items:center; }
        .xf-lang-opt { cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: 0.2s; }
        .xf-lang-opt:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .xf-lang-active { background: rgba(29,155,240,0.2); color: var(--xf-blue); font-weight: bold; }

        #xf-mob-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 99999; display: none; align-items: flex-end; justify-content: center; backdrop-filter: blur(5px); direction: ${IS_RTL?'rtl':'ltr'}; }
        #xf-mob-sheet { width: 100%; max-width: 450px; background: #000; border-top: 1px solid var(--xf-border); border-radius: 20px 20px 0 0; padding: 20px; animation: xf-up 0.3s; font-family: ${FONT_STACK}; }
        @keyframes xf-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .xf-close { margin-top: 15px; padding: 12px; background: #eff3f4; color: #000; text-align: center; border-radius: 99px; font-weight: 700; font-size: 14px; cursor: pointer; user-select: none; }

        /* Notes & OSINT */
        .xf-textarea { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--xf-border); color: #fff; border-radius: 8px; padding: 8px; margin-top: 12px; font-family: ${FONT_STACK}; font-size: 12px; resize: vertical; min-height: 50px; box-sizing: border-box; outline: none; }
        .xf-textarea:focus { border-color: var(--xf-blue); }
        .xf-osint-row { display: flex; gap: 10px; margin-top: 12px; justify-content: center; }
        .xf-osint-icon { font-size: 16px; cursor: pointer; opacity: 0.7; transition: 0.2s; text-decoration: none; }
        .xf-osint-icon:hover { opacity: 1; transform: scale(1.1); }
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

    // --- DASHBOARD UI ---
    function injectNativeMenu() {
        if (document.getElementById('xf-menu-btn') || document.getElementById('xf-mob-fab')) return;

        if (!IS_MOBILE) {
            // Desktop Sidebar
            const nav = document.querySelector('nav[aria-label="Primary"]');
            if (!nav) return;

            const item = document.createElement('a');
            item.id = "xf-menu-btn";
            item.className = "xf-menu-item";
            item.href = "#"; // Prevent navigation
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
            // Mobile FAB (Bottom-Left)
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

    function renderUserList(db) {
        const listContainer = document.getElementById('xf-user-list');
        const paginationContainer = document.getElementById('xf-pagination');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        const locFilter = document.getElementById("xf-filter-loc").value.toLowerCase();
        const riskFilter = document.getElementById("xf-filter-risk").value;
        const searchFilter = document.getElementById("xf-search-user").value.toLowerCase();

        const allKeys = Object.keys(db).reverse();
        const filteredKeys = [];

        for (const user of allKeys) {
            const entry = db[user].data;
            const riskTag = entry.riskLabel;

            if (locFilter && !entry.country.toLowerCase().includes(locFilter)) continue;
            if (riskFilter !== "ALL" && riskTag !== riskFilter) continue;
            if (searchFilter && !user.toLowerCase().includes(searchFilter) && !entry.id.includes(searchFilter)) continue;

            filteredKeys.push(user);
        }

        const totalPages = Math.ceil(filteredKeys.length / ITEMS_PER_PAGE) || 1;
        if (currentPage > totalPages) currentPage = 1;

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageItems = filteredKeys.slice(startIndex, endIndex);

        for (const user of pageItems) {
            const entry = db[user].data;
            const riskTag = entry.riskLabel;
            let badgeColor = "#fff";
            if (riskTag === TEXT.risk.safe || riskTag === TEXT.risk.normal) badgeColor = "var(--xf-green)";
            else if (riskTag === TEXT.risk.detected) badgeColor = "var(--xf-red)";
            else if (riskTag === TEXT.risk.anomaly) badgeColor = "var(--xf-orange)";

            const row = document.createElement("div");
            row.className = "xf-user-row";
            row.innerHTML = `<div><div class="xf-u-name">@${user}</div><span class="xf-u-meta">📍 ${entry.country} | 📱 ${entry.device.split(' ')[0]}</span></div><div class="xf-u-risk" style="background:${badgeColor}">${riskTag}</div>`;
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
                    <button id="xf-btn-backup" class="xf-dash-btn xf-btn-blue">${TEXT.dashboard.btn_backup}</button>
                    <button id="xf-btn-cloud" class="xf-dash-btn xf-btn-purple">${TEXT.dashboard.btn_cloud}</button>
                </div>
                <div class="xf-btn-row">
                    <button id="xf-btn-restore" class="xf-dash-btn xf-btn-green">${TEXT.dashboard.btn_restore}</button>
                    <button id="xf-btn-contrib" class="xf-dash-btn xf-btn-orange" style="color:#000;">${TEXT.dashboard.btn_contrib}</button>
                </div>
                <div class="xf-btn-row">
                    <button id="xf-btn-csv" class="xf-dash-btn xf-btn-blue" style="background:transparent;border:1px solid var(--xf-blue);color:var(--xf-blue)">${TEXT.dashboard.btn_export}</button>
                    <button id="xf-btn-clear" class="xf-dash-btn xf-btn-red">${TEXT.dashboard.btn_clear}</button>
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
        document.getElementById("xf-dash-close-btn").onclick = () => { overlay.style.display = "none"; };

        document.getElementById('xf-dash-l-auto').onclick = () => setLang('auto');
        document.getElementById('xf-dash-l-en').onclick = () => setLang('en');
        document.getElementById('xf-dash-l-fa').onclick = () => setLang('fa');

        renderUserList(db);
    }

    // --- CLOUD UPDATE ---
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

    // --- CONTRIBUTION LOGIC ---
    function contributeData() {
        const count = Object.keys(db).length;
        if (count === 0) return alert("No data to contribute.");
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `contribution.json`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        alert(TEXT.dashboard.contrib_info);
        const issueUrl = `${GITHUB_REPO_ISSUES}?title=Database+Contribution+(${count}+Users)`;
        window.open(issueUrl, '_blank');
    }

    function backupJSON() {
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
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
                db = { ...db, ...imported }; saveDB();
                alert(TEXT.dashboard.msg_restored.replace("{n}", Object.keys(imported).length));
                showDashboard();
            } catch (err) { alert(TEXT.dashboard.msg_err); }
        };
        reader.readAsText(file); e.target.value = "";
    }

    function exportCSV() {
        const locFilter = document.getElementById("xf-filter-loc").value.toLowerCase();
        const riskFilter = document.getElementById("xf-filter-risk").value;
        let csv = "\uFEFFUsername,ID,Location,Device,Risk,Created,Link\n";
        Object.keys(db).forEach(user => {
            const entry = db[user].data;
            const riskTag = entry.riskLabel;
            if (locFilter && !entry.country.toLowerCase().includes(locFilter)) return;
            if (riskFilter !== "ALL" && riskTag !== riskFilter) return;
            const safeDev = `"${entry.deviceFull.replace(/"/g, '""')}"`;
            csv += `${user},${entry.id},${entry.country},${safeDev},${riskTag},${entry.created},https://x.com/${user}\n`;
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

    function renderCardHTML(data, username) {
        let color = "var(--xf-green)", label = TEXT.risk.safe, pct = "5%", title = TEXT.status.high_conf, desc = TEXT.status.high_desc, bg = "rgba(0, 186, 124, 0.1)";
        const isTargetLoc = (data.countryCode === "Iran" || data.countryCode === "West Asia");
        const isTargetDev = (data.deviceFull || "").match(/Iran|West Asia/i);
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

        const existingNote = db[username]?.note || "";

        return `
            <div class="xf-header">
                <div style="display:flex;align-items:center;"><span class="xf-title">${TEXT.title}</span><span class="xf-badge" style="background:${color}">${label}</span></div>
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
            result.html = renderCardHTML(result.data, user);
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

            const data = {
                country: countryDisplay, countryCode: rawCountry, device: devShort, deviceFull: devFull, id: res.rest_id,
                created: formatTime(res.core?.created_at || res.legacy?.created_at), renamed: parseInt(about.username_changes?.count || 0),
                isAccurate: about.location_accurate, isIdVerified: verif.is_identity_verified === true, langCode: isPersianSpeaker ? 'fa' : null,
                avatar: (res.avatar?.image_url || "").replace("_normal", "_400x400")
            };

            let pillText = `📍 ${data.country}`;
            if (data.country === TEXT.values.unknown) pillText = `📱 ${IS_MOBILE ? data.device : data.deviceFull}`;
            else if (!IS_MOBILE) pillText += ` | 📱 ${data.deviceFull}`; else pillText += ` | 📱 ${data.device}`;

            let color = "var(--xf-green)";
            const isTargetLoc = (data.countryCode === "Iran" || data.countryCode === "West Asia");
            const isTargetDev = (data.deviceFull || "").match(/Iran|West Asia/i);
            if (!data.isAccurate) color = isTargetDev ? "var(--xf-green)" : "var(--xf-red)";
            else if (isTargetLoc) color = "var(--xf-orange)";

            result = { data, pillText, color, html: renderCardHTML(data, user) };
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
        const targets = document.querySelectorAll('article[data-testid="tweet"], [data-testid="UserCell"]');
        targets.forEach(node => {
            if (node.getAttribute('data-xf')) return;
            let userLink = node.querySelector('a[href^="/"][role="link"]');
            if (!userLink) return;
            const username = userLink.getAttribute('href').replace('/', '');
            if (!username) return;
            if (node.querySelector('.xf-mini-pill')) return;

            const mini = createMiniPill(username);
            let nameRow = node.querySelector('div[data-testid="User-Name"] > div:first-child');
            if (!nameRow) {
                const allDirs = node.querySelectorAll('div[dir="ltr"]');
                if (allDirs.length > 0) nameRow = allDirs[0];
            }
            if (nameRow) { nameRow.appendChild(mini); node.setAttribute('data-xf', 'true'); }
        });
    }

    // POLLING & INIT
    setInterval(() => {
        const user = getUser();
        if (user && document.querySelector('[data-testid="UserProfileHeader_Items"]') && !document.getElementById("xf-pill")) inject(user);
        injectLists();
        injectNativeMenu();
    }, 1000); // 1s Poll Backup

    setTimeout(initDashboard, 2000);

    new MutationObserver(() => {
        if (location.href !== lastUrl) { lastUrl = location.href; document.getElementById("xf-pill")?.remove(); if(tooltipEl) tooltipEl.className=""; }
        const user = getUser();
        if (user && document.querySelector('[data-testid="UserProfileHeader_Items"]') && !document.getElementById("xf-pill")) inject(user);
        injectLists();
        injectNativeMenu();
    }).observe(document.body, {childList:true, subtree:true});

})();
