// === ?? пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ пїЅпїЅпїЅпїЅпїЅпїЅпїЅ (пїЅпїЅпїЅпїЅ пїЅпїЅпїЅ пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ пїЅпїЅпїЅ пїЅ пїЅпїЅпїЅпїЅпїЅ) ===
const CONFIG = {
    // 1. пїЅпїЅпїЅпїЅ (пїЅпїЅпїЅпїЅпїЅпїЅ пїЅпїЅ пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ)
    tariffs: {
        day: [
            { start: '05-23', end: '05-31', tourist: { ADL: 11100, CHLD: 8860 }, agent: { ADL: 10900, CHLD: 8660 } },
            { start: '06-01', end: '08-23', tourist: { ADL: 14000, CHLD: 11500 }, agent: { ADL: 13450, CHLD: 10700 } },
            { start: '08-24', end: '09-06', tourist: { ADL: 11500, CHLD: 9200 }, agent: { ADL: 11200, CHLD: 8860 } },
            { start: '09-07', end: '09-20', tourist: { ADL: 9500, CHLD: 7500 }, agent: { ADL: 9200, CHLD: 7300 } },
            { start: '09-21', end: '09-30', tourist: { ADL: 8500, CHLD: 6700 }, agent: { ADL: 8350, CHLD: 6520 } },
        ],
        evening: [
            { start: '06-01', end: '08-31', tourist: { ADL: 9500, CHLD: 7500 }, agent: { ADL: 9000, CHLD: 7180 } }
        ]
    },
    // 2. пїЅпїЅпїЅпїЅпїЅпїЅ (пїЅ пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ)
    discounts: {
        earlyBooking: 15, // пїЅпїЅпїЅпїЅпїЅ: пїЅпїЅпїЅпїЅпїЅпїЅ пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ
        pensioner: 50,    // пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ
        birthday: 100,    // пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ
        disabled: 100     // пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ
    },
    // 3. пїЅпїЅпїЅпїЅпїЅпїЅпїЅ (пїЅпїЅпїЅпїЅпїЅпїЅ пїЅ пїЅпїЅпїЅпїЅпїЅпїЅ)
    credentials: {
        'admin': 'tetys2026',
        'manager': '0606'
    }
};
// ======================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Р РµРіРёСЃС‚СЂР°С†РёСЏ Service Worker РґР»СЏ PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.error('SW registration failed', err));
    }

    // i18n Translation Dictionary and Object
    const i18n = {
        currentLang: localStorage.getItem('tetisLang') || 'ru',
        locales: {
            ru: {
                panelTitle: "РџР°РЅРµР»СЊ СЂР°СЃС‡РµС‚РѕРІ",
                season: "РЎРµР·РѕРЅ 2026",
                loginPlaceholder: "Р›РћР“РРќ",
                passwordPlaceholder: "РџРђР РћР›Р¬",
                authError: "РќРµРІРµСЂРЅС‹Р№ Р»РѕРіРёРЅ РёР»Рё РїР°СЂРѕР»СЊ",
                signInBtn: "Р’РѕР№С‚Рё РІ СЃРёСЃС‚РµРјСѓ",
                salesDept: "РћС‚РґРµР» РїСЂРѕРґР°Р¶",
                archiveBtn: "РђСЂС…РёРІ",
                logoutBtn: "Р’С‹Р№С‚Рё",
                calcTitle: "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ Р±РёР»РµС‚РѕРІ",
                calcSubtitle: "РћС„РёС†РёР°Р»СЊРЅР°СЏ С„РѕСЂРјР° СЂР°СЃС‡РµС‚РѕРІ РґР»СЏ СЃРѕС‚СЂСѓРґРЅРёРєРѕРІ РїСЂРѕРґР°Р¶",
                visitParams: "РџР°СЂР°РјРµС‚СЂС‹ РїРѕСЃРµС‰РµРЅРёСЏ",
                clientTypeText: "РўРёРї РєР»РёРµРЅС‚Р°",
                touristDirect: "РўСѓСЂРёСЃС‚ (РџСЂСЏРјС‹Рµ РїСЂРѕРґР°Р¶Рё)",
                agentWholesale: "РђРіРµРЅС‚ (РћРїС‚РѕРІС‹Рµ РїСЂРѕРґР°Р¶Рё)",
                visitDate: "Р”Р°С‚Р° РІРёР·РёС‚Р°",
                dateWarning: "РўР°СЂРёС„ РЅРµ РЅР°Р№РґРµРЅ РЅР° СЌС‚Сѓ РґР°С‚Сѓ",
                tariffCategory: "РљР°С‚РµРіРѕСЂРёСЏ С‚Р°СЂРёС„Р°",
                dayTariff: "Р”РЅРµРІРЅРѕР№ С‚Р°СЂРёС„",
                eveningTariff: "Р’РµС‡РµСЂРЅРёР№ С‚Р°СЂРёС„",
                bulkInputTitle: "РўРµРєСЃС‚РѕРІС‹Р№ РІРІРѕРґ РіРѕСЃС‚РµР№",
                bulkInputDesc: "Р’СЃС‚Р°РІСЊС‚Рµ СЃРїРёСЃРѕРє РіРѕСЃС‚РµР№. РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРёР№ РїР°СЂСЃРµСЂ РёР·РІР»РµС‡РµС‚ РёРјРµРЅР° Рё РґР°С‚С‹ СЂРѕР¶РґРµРЅРёСЏ.",
                example: "РџСЂРёРјРµСЂ",
                bulkInputPlaceholder: "РўРµС‚РёСЃ РЅР° 06.06\nKossymov Dias 15.04.2017 chld\nOtemissova Meruert 18.05.1998 adl",
                parseBtn: "Р Р°СЃРїРѕР·РЅР°С‚СЊ Рё РґРѕР±Р°РІРёС‚СЊ",
                clearTextBtn: "РћС‡РёСЃС‚РёС‚СЊ С‚РµРєСЃС‚",
                visitorListTitle: "РЎРїРёСЃРѕРє РїРѕСЃРµС‚РёС‚РµР»РµР№",
                visitorListDesc: "Р”РѕР±Р°РІСЊС‚Рµ РіРѕСЃС‚РµР№ РёР»Рё Р·Р°РіСЂСѓР·РёС‚Рµ С‚РµРєСЃС‚РѕРІС‹Р№ СЂРµРµСЃС‚СЂ",
                addGuestBtn: "Р”РѕР±Р°РІРёС‚СЊ РіРѕСЃС‚СЏ",
                clearListBtn: "РћС‡РёСЃС‚РёС‚СЊ СЃРїРёСЃРѕРє",
                importBtn: "РРјРїРѕСЂС‚",
                exportBtn: "Р­РєСЃРїРѕСЂС‚",
                exportCsv: "РЎРєР°С‡Р°С‚СЊ CSV (Excel)",
                exportTxt: "РЎРєР°С‡Р°С‚СЊ TXT",
                resetCountBtn: "РЎР±СЂРѕСЃРёС‚СЊ РєРѕР»РёС‡РµСЃС‚РІРѕ",
                detailedTab: "РџРѕСЃРїРёСЃРѕС‡РЅС‹Р№ РІРІРѕРґ",
                quickTab: "Р‘С‹СЃС‚СЂС‹Р№ СЂР°СЃС‡РµС‚ РєРѕР»РёС‡РµСЃС‚РІР°",
                tableHeaderName: "Р¤РРћ С‚СѓСЂРёСЃС‚Р°",
                tableHeaderDob: "Р”Р°С‚Р° СЂРѕР¶РґРµРЅРёСЏ",
                tableHeaderAge: "Р’РѕР·СЂР°СЃС‚",
                tableHeaderType: "РўРёРї",
                tableHeaderPrice: "РЎС‚РѕРёРјРѕСЃС‚СЊ",
                statAdl: "Р’Р·СЂРѕСЃР»С‹Рµ (ADL)",
                statChld: "Р”РµС‚Рё (CHLD)",
                statPens: "РџРµРЅСЃРёРѕРЅРµСЂС‹ (SNR)",
                statInf: "РњР»Р°РґРµРЅС†С‹ (INF)",
                emptyStateTitle: "РЎРїРёСЃРѕРє РіРѕСЃС‚РµР№ РїСѓСЃС‚",
                emptyStateDesc: "РќР°Р¶РјРёС‚Рµ РєРЅРѕРїРєСѓ В«Р”РѕР±Р°РІРёС‚СЊ РіРѕСЃС‚СЏВ» РёР»Рё РІРѕСЃРїРѕР»СЊР·СѓР№С‚РµСЃСЊ РїР°РєРµС‚РЅС‹Рј СЂР°СЃРїРѕР·РЅР°РІР°РЅРёРµРј С‚РµРєСЃС‚Р°",
                totalEstimate: "РС‚РѕРіРѕРІС‹Р№ СЂР°СЃС‡РµС‚",
                downloadReceipt: "РЎРєР°С‡Р°С‚СЊ С‡РµРє",
                shareReceipt: "РџРѕРґРµР»РёС‚СЊСЃСЏ С‡РµРєРѕРј",
                statsTitle: "РЎРІРѕРґРЅР°СЏ СЃС‚Р°С‚РёСЃС‚РёРєР°",
                statBoxAdl: "Р’Р·СЂ (ADL)",
                statBoxChld: "Р”РµС‚Рё (CHLD)",
                statBoxInf: "РњР»Р°Рґ (INF)",
                statBoxPens: "РџРµРЅСЃРёРѕРЅРµСЂС‹",
                statBoxBday: "РРјРµРЅРёРЅРЅРёРєРё",
                exportTitle: "РўРµРєСЃС‚ РґР»СЏ РїРѕС‡С‚С‹ / CRM",
                copyBtn: "РљРѕРїРёСЂРѕРІР°С‚СЊ",
                exportPlaceholder: "РўСѓС‚ РїРѕСЏРІРёС‚СЃСЏ С‚РµРєСЃС‚ РґР»СЏ СЌРєСЃРїРѕСЂС‚Р° РІ CRM...",
                footerText: "В© 2026 Tetys Blu. РћРєРµР°РЅ РІРїРµС‡Р°С‚Р»РµРЅРёР№.",
                receiptTotalToPay: "РС‚РѕРіРѕ Рє РѕРїР»Р°С‚Рµ:",
                receiptWelcome: "Р–РґРµРј РІР°СЃ РІ С‚РµРјР°С‚РёС‡РµСЃРєРѕРј РїР°СЂРєРµ Tetys Blu!",
                historyTitle: "РќРµРґР°РІРЅРёРµ СЂР°СЃС‡РµС‚С‹",
                historyEmpty: "РђСЂС…РёРІ РїСѓСЃС‚",
                loadCalcBtn: "Р—Р°РіСЂСѓР·РёС‚СЊ СЂР°СЃС‡РµС‚",
                sharePreviewTitle: "РџСЂРµРґРїСЂРѕСЃРјРѕС‚СЂ С‡РµРєР°",
                finalShareBtn: "Р’С‹Р±СЂР°С‚СЊ СЃРїРѕСЃРѕР± РѕС‚РїСЂР°РІРєРё",
                shareDesc: "WhatsApp, РџРѕС‡С‚Р°, Telegram Рё РґСЂСѓРіРёРµ РїСЂРёР»РѕР¶РµРЅРёСЏ",
                emptyListExportError: "РЎРїРёСЃРѕРє РіРѕСЃС‚РµР№ РїСѓСЃС‚!",
                exportSuccess: "Р­РєСЃРїРѕСЂС‚ СѓСЃРїРµС€РЅРѕ Р·Р°РІРµСЂС€РµРЅ!",
                importSuccess: "РЈСЃРїРµС€РЅРѕ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅРѕ {count} РіРѕСЃС‚РµР№",
                importError: "РќРµ СѓРґР°Р»РѕСЃСЊ РёРјРїРѕСЂС‚РёСЂРѕРІР°С‚СЊ РіРѕСЃС‚РµР№ РёР· С„Р°Р№Р»Р°",
                receiptSaved: "Р§РµРє СѓСЃРїРµС€РЅРѕ СЃРѕС…СЂР°РЅРµРЅ!",
                receiptError: "РћС€РёР±РєР° РїСЂРё СЃРѕР·РґР°РЅРёРё С‡РµРєР°",
                loadSuccess: "Р Р°СЃС‡РµС‚ СѓСЃРїРµС€РЅРѕ Р·Р°РіСЂСѓР¶РµРЅ",
                deleteConfirm: "Р’С‹ СѓРІРµСЂРµРЅС‹, С‡С‚Рѕ С…РѕС‚РёС‚Рµ СѓРґР°Р»РёС‚СЊ РІСЃРµС… РіРѕСЃС‚РµР№ Рё РЅР°С‡Р°С‚СЊ Р·Р°РЅРѕРІРѕ?",
                unrecognizedLinesToast: "Р§Р°СЃС‚СЊ РіРѕСЃС‚РµР№ РЅРµ СЂР°СЃРїРѕР·РЅР°РЅР° ({count} СЃС‚СЂРѕРє)",
                noTariff: "РќРµС‚ С‚Р°СЂРёС„Р°",
                bdayTag: "Р”Р ",
                pensTag: "РџРµРЅСЃ",
                invTag: "РРЅРІ",
                touristClient: "РўСѓСЂРёСЃС‚",
                agentClient: "РўСѓСЂР°РіРµРЅС‚",
                guestNameDefault: "Р“РѕСЃС‚СЊ",
                guestNumName: "Р“РѕСЃС‚СЊ {num}",
                visitHeader: "Р’РёР·РёС‚",
                guestsHeaderCount: "Р“РѕСЃС‚РµР№",
                dateHeaderExport: "Р”Р°С‚Р° РїРѕСЃРµС‰РµРЅРёСЏ",
                tariffHeaderExport: "РўР°СЂРёС„",
                compositionGuestsExport: "РЎРѕСЃС‚Р°РІ РіРѕСЃС‚РµР№",
                listGuestsExport: "РЎРїРёСЃРѕРє РіРѕСЃС‚РµР№",
                emptyTextExport: "РџСѓСЃС‚Рѕ",
                copiedToast: "РЎРєРѕРїРёСЂРѕРІР°РЅРѕ",
                dobPlaceholder: "РґРґ.РјРј.РіРіРіРі РёР»Рё РіРіРіРі",
                deleteBtn: "РЈРґР°Р»РёС‚СЊ"
            },
            kk: {
                panelTitle: "Р•СЃРµРїС‚РµСѓ РїР°РЅРµР»С–",
                season: "2026 РјР°СѓСЃС‹Рј",
                loginPlaceholder: "Р›РћР“РРќ",
                passwordPlaceholder: "ТљТ°РџРРЇ РЎУЁР—",
                authError: "ТљР°С‚Рµ Р»РѕРіРёРЅ РЅРµРјРµСЃРµ Т›Т±РїРёСЏ СЃУ©Р·",
                signInBtn: "Р–ТЇР№РµРіРµ РєС–СЂСѓ",
                salesDept: "РЎР°С‚Сѓ Р±У©Р»С–РјС–",
                archiveBtn: "РњТ±СЂР°Т“Р°С‚",
                logoutBtn: "РЁС‹Т“Сѓ",
                calcTitle: "Р‘РёР»РµС‚С‚РµСЂ РєР°Р»СЊРєСѓР»СЏС‚РѕСЂС‹",
                calcSubtitle: "РЎР°С‚Сѓ Т›С‹Р·РјРµС‚РєРµСЂР»РµСЂС–РЅРµ Р°СЂРЅР°Р»Т“Р°РЅ СЂРµСЃРјРё РµСЃРµРїС‚РµСѓ С„РѕСЂРјР°СЃС‹",
                visitParams: "РљРµР»Сѓ РїР°СЂР°РјРµС‚СЂР»РµСЂС–",
                clientTypeText: "РљР»РёРµРЅС‚ С‚ТЇСЂС–",
                touristDirect: "РўСѓСЂРёСЃС‚ (РўС–РєРµР»РµР№ СЃР°С‚Сѓ)",
                agentWholesale: "РђРіРµРЅС‚ (РљУ©С‚РµСЂРјРµ СЃР°С‚Сѓ)",
                visitDate: "РљРµР»Сѓ РєТЇРЅС–",
                dateWarning: "Р‘Т±Р» РєТЇРЅРіРµ С‚Р°СЂРёС„ С‚Р°Р±С‹Р»РјР°РґС‹",
                tariffCategory: "РўР°СЂРёС„ СЃР°РЅР°С‚С‹",
                dayTariff: "РљТЇРЅРґС–Р·РіС– С‚Р°СЂРёС„",
                eveningTariff: "РљРµС€РєС– С‚Р°СЂРёС„",
                bulkInputTitle: "ТљРѕРЅР°Т›С‚Р°СЂРґС‹ РјУ™С‚С–РЅРјРµРЅ РµРЅРіС–Р·Сѓ",
                bulkInputDesc: "ТљРѕРЅР°Т›С‚Р°СЂ С‚С–Р·С–РјС–РЅ Т›РѕР№С‹ТЈС‹Р·. РђРІС‚РѕРјР°С‚С‚С‹ РїР°СЂСЃРµСЂ РµСЃС–РјРґРµСЂ РјРµРЅ С‚СѓТ“Р°РЅ РєТЇРЅРґРµСЂРґС– Р°РЅС‹Т›С‚Р°Р№РґС‹.",
                example: "РњС‹СЃР°Р»",
                bulkInputPlaceholder: "РўРµС‚РёСЃ 06.06 РєТЇРЅС–РЅРµ\nKossymov Dias 15.04.2017 chld\nOtemissova Meruert 18.05.1998 adl",
                parseBtn: "РўР°РЅСѓ Р¶У™РЅРµ Т›РѕСЃСѓ",
                clearTextBtn: "РњУ™С‚С–РЅРґС– С‚Р°Р·Р°Р»Р°Сѓ",
                visitorListTitle: "РљРµР»СѓС€С–Р»РµСЂ С‚С–Р·С–РјС–",
                visitorListDesc: "ТљРѕРЅР°Т›С‚Р°СЂРґС‹ Т›РѕСЃС‹ТЈС‹Р· РЅРµРјРµСЃРµ РјУ™С‚С–РЅРґС–Рє СЂРµРµСЃС‚СЂРґС– Р¶ТЇРєС‚РµТЈС–Р·",
                addGuestBtn: "ТљРѕРЅР°Т›С‚С‹ Т›РѕСЃСѓ",
                clearListBtn: "РўС–Р·С–РјРґС– С‚Р°Р·Р°Р»Р°Сѓ",
                importBtn: "РРјРїРѕСЂС‚",
                exportBtn: "Р­РєСЃРїРѕСЂС‚",
                exportCsv: "CSV (Excel) Р¶ТЇРєС‚РµСѓ",
                exportTxt: "TXT Р¶ТЇРєС‚РµСѓ",
                resetCountBtn: "РЎР°РЅС‹РЅ Т›Р°Р№С‚Р° РѕСЂРЅР°С‚Сѓ",
                detailedTab: "РўС–Р·С–Рј Р±РѕР№С‹РЅС€Р° РµРЅРіС–Р·Сѓ",
                quickTab: "РЎР°РЅС‹РЅ Р¶С‹Р»РґР°Рј РµСЃРµРїС‚РµСѓ",
                tableHeaderName: "РўСѓСЂРёСЃС‚С–ТЈ РђУР–",
                tableHeaderDob: "РўСѓТ“Р°РЅ РєТЇРЅС–",
                tableHeaderAge: "Р–Р°СЃС‹",
                tableHeaderType: "РўТЇСЂС–",
                tableHeaderPrice: "ТљТ±РЅС‹",
                statAdl: "Р•СЂРµСЃРµРєС‚РµСЂ (ADL)",
                statChld: "Р‘Р°Р»Р°Р»Р°СЂ (CHLD)",
                statPens: "Р—РµР№РЅРµС‚РєРµСЂР»РµСЂ (SNR)",
                statInf: "РЎУ™Р±РёР»РµСЂ (INF)",
                emptyStateTitle: "ТљРѕРЅР°Т›С‚Р°СЂ С‚С–Р·С–РјС– Р±РѕСЃ",
                emptyStateDesc: "В«ТљРѕРЅР°Т›С‚С‹ Т›РѕСЃСѓВ» Р±Р°С‚С‹СЂРјР°СЃС‹РЅ Р±Р°СЃС‹ТЈС‹Р· РЅРµРјРµСЃРµ РїР°РєРµС‚С‚С–Рє РјУ™С‚С–РЅРґС– С‚Р°РЅСѓ РјТЇРјРєС–РЅРґС–РіС–РЅ РїР°Р№РґР°Р»Р°РЅС‹ТЈС‹Р·",
                totalEstimate: "ТљРѕСЂС‹С‚С‹РЅРґС‹ РµСЃРµРї",
                downloadReceipt: "Р§РµРєС‚С– Р¶ТЇРєС‚РµСѓ",
                shareReceipt: "Р§РµРєРїРµРЅ Р±У©Р»С–СЃСѓ",
                statsTitle: "Р–РёС‹РЅС‚С‹Т› СЃС‚Р°С‚РёСЃС‚РёРєР°",
                statBoxAdl: "Р•СЂРµСЃ (ADL)",
                statBoxChld: "Р‘Р°Р»Р°Р»Р°СЂ (CHLD)",
                statBoxInf: "РЎУ™Р±РёР»РµСЂ (INF)",
                statBoxPens: "Р—РµР№РЅРµС‚РєРµСЂР»РµСЂ",
                statBoxBday: "РўСѓТ“Р°РЅ РєТЇРЅ РёРµР»РµСЂС–",
                exportTitle: "РџРѕС€С‚Р° / CRM ТЇС€С–РЅ РјУ™С‚С–РЅ",
                copyBtn: "РљУ©С€С–СЂСѓ",
                exportPlaceholder: "РњТ±РЅРґР° CRM-РіРµ СЌРєСЃРїРѕСЂС‚С‚Р°СѓТ“Р° Р°СЂРЅР°Р»Т“Р°РЅ РјУ™С‚С–РЅ РїР°Р№РґР° Р±РѕР»Р°РґС‹...",
                footerText: "В© 2026 Tetys Blu. УСЃРµСЂР»РµСЂ РјТ±С…РёС‚С‹.",
                receiptTotalToPay: "РўУ©Р»РµСѓРіРµ Р±Р°СЂР»С‹Т“С‹:",
                receiptWelcome: "РЎС–Р·РґС– Tetys Blu С‚Р°Т›С‹СЂС‹РїС‚С‹Т› РїР°СЂРєС–РЅРґРµ РєТЇС‚РµРјС–Р·!",
                historyTitle: "РЎРѕТЈТ“С‹ РµСЃРµРїС‚РµСѓР»РµСЂ",
                historyEmpty: "РњТ±СЂР°Т“Р°С‚ Р±РѕСЃ",
                loadCalcBtn: "Р•СЃРµРїС‚РµСѓРґС– Р¶ТЇРєС‚РµСѓ",
                sharePreviewTitle: "Р§РµРєС‚С– Р°Р»РґС‹РЅ Р°Р»Р° Т›Р°СЂР°Сѓ",
                finalShareBtn: "Р–С–Р±РµСЂСѓ У™РґС–СЃС–РЅ С‚Р°ТЈРґР°Сѓ",
                shareDesc: "WhatsApp, РџРѕС€С‚Р°, Telegram Р¶У™РЅРµ Р±Р°СЃТ›Р° Т›РѕР»РґР°РЅР±Р°Р»Р°СЂ",
                emptyListExportError: "ТљРѕРЅР°Т›С‚Р°СЂ С‚С–Р·С–РјС– Р±РѕСЃ!",
                exportSuccess: "Р­РєСЃРїРѕСЂС‚ СЃУ™С‚С‚С– Р°СЏТ›С‚Р°Р»РґС‹!",
                importSuccess: "РЎУ™С‚С‚С– С‚ТЇСЂРґРµ {count} Т›РѕРЅР°Т› РёРјРїРѕСЂС‚С‚Р°Р»РґС‹",
                importError: "Р¤Р°Р№Р»РґР°РЅ Т›РѕРЅР°Т›С‚Р°СЂРґС‹ РёРјРїРѕСЂС‚С‚Р°Сѓ РјТЇРјРєС–РЅ Р±РѕР»РјР°РґС‹",
                receiptSaved: "Р§РµРє СЃУ™С‚С‚С– СЃР°Т›С‚Р°Р»РґС‹!",
                receiptError: "Р§РµРє Р¶Р°СЃР°Сѓ РєРµР·С–РЅРґРµРіС– Т›Р°С‚Рµ",
                loadSuccess: "Р•СЃРµРїС‚РµСѓ СЃУ™С‚С‚С– Р¶ТЇРєС‚РµР»РґС–",
                deleteConfirm: "Р‘Р°СЂР»С‹Т› Т›РѕРЅР°Т›С‚Р°СЂРґС‹ Р¶РѕР№С‹Рї, Т›Р°Р№С‚Р° Р±Р°СЃС‚Р°Т“С‹ТЈС‹Р· РєРµР»РµС‚С–РЅС–РЅРµ СЃРµРЅС–РјРґС–СЃС–Р· Р±Рµ?",
                unrecognizedLinesToast: "ТљРѕРЅР°Т›С‚Р°СЂРґС‹ТЈ Р±С–СЂ Р±У©Р»С–РіС– С‚Р°РЅС‹Р»РјР°РґС‹ ({count} Р¶РѕР»)",
                noTariff: "РўР°СЂРёС„ Р¶РѕТ›",
                bdayTag: "РўРљ",
                pensTag: "Р—РµР№РЅ",
                invTag: "РњТЇРіРµРґ",
                touristClient: "РўСѓСЂРёСЃС‚",
                agentClient: "РўСѓСЂР°РіРµРЅС‚",
                guestNameDefault: "ТљРѕРЅР°Т›",
                guestNumName: "ТљРѕРЅР°Т› {num}",
                visitHeader: "РљРµР»Сѓ",
                guestsHeaderCount: "ТљРѕРЅР°Т›С‚Р°СЂ",
                dateHeaderExport: "РљРµР»Сѓ РєТЇРЅС–",
                tariffHeaderExport: "РўР°СЂРёС„",
                compositionGuestsExport: "ТљРѕРЅР°Т›С‚Р°СЂ Т›Т±СЂР°РјС‹",
                listGuestsExport: "ТљРѕРЅР°Т›С‚Р°СЂ С‚С–Р·С–РјС–",
                emptyTextExport: "Р‘РѕСЃ",
                copiedToast: "РљУ©С€С–СЂС–Р»РґС–",
                dobPlaceholder: "РєРє.Р°Р°.Р¶Р¶Р¶Р¶ РЅРµРјРµСЃРµ Р¶Р¶Р¶Р¶",
                deleteBtn: "Р–РѕСЋ"
            },
            en: {
                panelTitle: "Calculation Panel",
                season: "Season 2026",
                loginPlaceholder: "LOGIN",
                passwordPlaceholder: "PASSWORD",
                authError: "Invalid username or password",
                signInBtn: "Sign In",
                salesDept: "Sales Dept",
                archiveBtn: "Archive",
                logoutBtn: "Logout",
                calcTitle: "Ticket Calculator",
                calcSubtitle: "Official calculation form for sales staff",
                visitParams: "Visit Parameters",
                clientTypeText: "Client Type",
                touristDirect: "Tourist (Direct Sales)",
                agentWholesale: "Agent (Wholesale)",
                visitDate: "Visit Date",
                dateWarning: "Tariff not found for this date",
                tariffCategory: "Tariff Category",
                dayTariff: "Day Tariff",
                eveningTariff: "Evening Tariff",
                bulkInputTitle: "Text Input for Guests",
                bulkInputDesc: "Paste guest list. The parser will extract names and birth dates.",
                example: "Example",
                bulkInputPlaceholder: "Tetys on 06.06\nKossymov Dias 15.04.2017 chld\nOtemissova Meruert 18.05.1998 adl",
                parseBtn: "Parse and Add",
                clearTextBtn: "Clear Text",
                visitorListTitle: "Visitor List",
                visitorListDesc: "Add guests or upload text registry",
                addGuestBtn: "Add Guest",
                clearListBtn: "Clear List",
                importBtn: "Import",
                exportBtn: "Export",
                exportCsv: "Download CSV (Excel)",
                exportTxt: "Download TXT",
                resetCountBtn: "Reset Count",
                detailedTab: "Detailed Input",
                quickTab: "Quick Count Calculator",
                tableHeaderName: "Tourist Full Name",
                tableHeaderDob: "Date of Birth",
                tableHeaderAge: "Age",
                tableHeaderType: "Type",
                tableHeaderPrice: "Price",
                statAdl: "Adults (ADL)",
                statChld: "Children (CHLD)",
                statPens: "Pensioners (SNR)",
                statInf: "Infants (INF)",
                emptyStateTitle: "Guest list is empty",
                emptyStateDesc: "Click 'Add Guest' or use bulk text recognition",
                totalEstimate: "Total Estimate",
                downloadReceipt: "Download Receipt",
                shareReceipt: "Share Receipt",
                statsTitle: "Summary Statistics",
                statBoxAdl: "Adl (ADL)",
                statBoxChld: "Chld (CHLD)",
                statBoxInf: "Inf (INF)",
                statBoxPens: "Pensioners",
                statBoxBday: "Birthdays",
                exportTitle: "Text for Mail / CRM",
                copyBtn: "Copy",
                exportPlaceholder: "Text for CRM export will appear here...",
                footerText: "В© 2026 Tetys Blu. Ocean of impressions.",
                receiptTotalToPay: "Total to Pay:",
                receiptWelcome: "We look forward to seeing you at Tetys Blu theme park!",
                historyTitle: "Recent Calculations",
                historyEmpty: "Archive is empty",
                loadCalcBtn: "Load Calculation",
                sharePreviewTitle: "Receipt Preview",
                finalShareBtn: "Choose Share Method",
                shareDesc: "WhatsApp, Email, Telegram and other apps",
                emptyListExportError: "Guest list is empty!",
                exportSuccess: "Export completed successfully!",
                importSuccess: "Successfully imported {count} guests",
                importError: "Failed to import guests from file",
                receiptSaved: "Receipt saved successfully!",
                receiptError: "Error creating receipt",
                loadSuccess: "Calculation loaded successfully",
                deleteConfirm: "Are you sure you want to delete all guests and start over?",
                unrecognizedLinesToast: "Some guests were not recognized ({count} lines)",
                noTariff: "No tariff",
                bdayTag: "BD",
                pensTag: "Pen",
                invTag: "Dis",
                touristClient: "Tourist",
                agentClient: "Agent",
                guestNameDefault: "Guest",
                guestNumName: "Guest {num}",
                visitHeader: "Visit",
                guestsHeaderCount: "Guests",
                dateHeaderExport: "Visit Date",
                tariffHeaderExport: "Tariff",
                compositionGuestsExport: "Guest Composition",
                listGuestsExport: "Guest List",
                emptyTextExport: "Empty",
                copiedToast: "Copied",
                dobPlaceholder: "dd.mm.yyyy or yyyy",
                deleteBtn: "Delete"
            }
        },
        translate(key) {
            return this.locales[this.currentLang][key] || key;
        },
        setLang(lang) {
            if (this.locales[lang]) {
                this.currentLang = lang;
                localStorage.setItem('tetisLang', lang);
                this.applyTranslations();
                
                // Re-render UI
                if (typeof render === 'function') {
                    render();
                }
            }
        },
        applyTranslations() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const translation = this.translate(key);
                
                let iconNode = el.querySelector('i, svg');
                if (iconNode) {
                    el.innerHTML = '';
                    el.appendChild(iconNode);
                    el.appendChild(document.createTextNode(' ' + translation));
                } else {
                    el.textContent = translation;
                }
            });
            
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                el.setAttribute('placeholder', this.translate(key));
            });
        }
    };
    window.i18n = i18n;


    window.showToast = function(message, icon = '', bgColor = 'bg-blue-600') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 transform translate-y-5 opacity-0 ${bgColor}`;
        toast.style.minWidth = '280px';
        toast.style.maxWidth = '400px';
        
        let iconHtml = '';
        if (icon) {
            if (icon.startsWith('fa-')) {
                iconHtml = `<i class="fa-solid ${icon}"></i>`;
            } else {
                iconHtml = icon;
            }
        }
        
        toast.innerHTML = `
            ${iconHtml ? `<div class="text-lg">${iconHtml}</div>` : ''}
            <div class="flex-1 font-sans text-sm">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Trigger reflow
        toast.offsetHeight;
        
        // Animate in
        toast.classList.remove('translate-y-5', 'opacity-0');
        
        setTimeout(() => {
            // Animate out
            toast.classList.add('-translate-y-5', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    };

    // --- РђР’РўРћР РР—РђР¦РРЇ ---
    const authScreen = document.getElementById('authScreen');
    const appContent = document.getElementById('appContent');
    const authLogin = document.getElementById('authLogin');
    const authPin = document.getElementById('authPin');
    const authBtn = document.getElementById('authBtn');
    const authError = document.getElementById('authError');
    const authFormBody = document.getElementById('authFormBody');
    const logoutBtn = document.getElementById('logoutBtn');

    // РР·РјРµРЅРёР»Рё РєР»СЋС‡, С‡С‚РѕР±С‹ СЃР±СЂРѕСЃРёС‚СЊ СЃС‚Р°СЂСѓСЋ СЃРµСЃСЃРёСЋ Р±РµР· РїР°СЂРѕР»СЏ
    if (localStorage.getItem('tetysAuthV2') === 'true') {
        authScreen.classList.add('hidden');
        appContent.classList.remove('hidden');
    } else {
        if (authLogin) authLogin.focus();
    }

    function checkAuth() {
        const login = authLogin.value.trim().toLowerCase();
        const pass = authPin.value;
        
        if (CONFIG.credentials[login] && CONFIG.credentials[login] === pass) {
            localStorage.setItem('tetysAuthV2', 'true');
            localStorage.setItem('tetysUser', login); // Р—Р°РїРѕРјРёРЅР°РµРј РєС‚Рѕ РІРѕС€РµР»
            
            authScreen.style.opacity = '0';
            setTimeout(() => {
                authScreen.classList.add('hidden');
                appContent.classList.remove('hidden');
                appContent.style.animation = 'popIn 0.5s ease-out forwards';
            }, 300);
        } else {
            authError.classList.remove('hidden');
            authPin.value = '';
            
            if (authFormBody) {
                authFormBody.style.animation = 'shake 0.4s ease-in-out';
                setTimeout(() => { authFormBody.style.animation = ''; }, 400);
            }
        }
    }

    if (authBtn) {
        authBtn.addEventListener('click', checkAuth);
        authPin.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAuth(); });
        authLogin.addEventListener('keypress', (e) => { if (e.key === 'Enter') authPin.focus(); });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('tetysAuthV2');
            localStorage.removeItem('tetysUser');
            location.reload();
        });
    }
    
    if (!document.getElementById('authStyles')) {
        const style = document.createElement('style');
        style.id = 'authStyles';
        style.innerHTML = `@keyframes shake { 0%, 100% {transform: translateX(0);} 20%, 60% {transform: translateX(-10px);} 40%, 80% {transform: translateX(10px);} }`;
        document.head.appendChild(style);
    }
    // -------------------

    // РўР°СЂРёС„С‹
    const tariffs = {
        day: [
            { start: '05-23', end: '05-31', tourist: { ADL: 11100, CHLD: 8860 }, agent: { ADL: 10900, CHLD: 8660 } },
            { start: '06-01', end: '08-23', tourist: { ADL: 14000, CHLD: 11500 }, agent: { ADL: 13450, CHLD: 10700 } },
            { start: '08-24', end: '09-06', tourist: { ADL: 11500, CHLD: 9200 }, agent: { ADL: 11200, CHLD: 8860 } },
            { start: '09-07', end: '09-20', tourist: { ADL: 9500, CHLD: 7500 }, agent: { ADL: 9200, CHLD: 7300 } },
            { start: '09-21', end: '09-30', tourist: { ADL: 8500, CHLD: 6700 }, agent: { ADL: 8350, CHLD: 6520 } },
        ],
        evening: [
            { start: '06-01', end: '08-31', tourist: { ADL: 9500, CHLD: 7500 }, agent: { ADL: 9000, CHLD: 7180 } }
        ]
    };

    // РўСЂР°РЅСЃР»РёС‚РµСЂР°С†РёСЏ
    const cyrillicToLatinMap = {
        'Рђ': 'A', 'Р‘': 'B', 'Р’': 'V', 'Р“': 'G', 'Р”': 'D', 'Р•': 'E', 'РЃ': 'E', 'Р–': 'ZH', 'Р—': 'Z', 'Р': 'I',
        'Р™': 'Y', 'Рљ': 'K', 'Р›': 'L', 'Рњ': 'M', 'Рќ': 'N', 'Рћ': 'O', 'Рџ': 'P', 'Р ': 'R', 'РЎ': 'S', 'Рў': 'T',
        'РЈ': 'U', 'Р¤': 'F', 'РҐ': 'KH', 'Р¦': 'TS', 'Р§': 'CH', 'РЁ': 'SH', 'Р©': 'SHCH', 'РЄ': '', 'Р«': 'Y', 'Р¬': '',
        'Р­': 'E', 'Р®': 'YU', 'РЇ': 'YA', 'У': 'A', 'Р†': 'I', 'Тў': 'NG', 'Т’': 'GH', 'Т®': 'U', 'Т°': 'U', 'Тљ': 'Q', 'УЁ': 'O', 'Тє': 'H',
        'Р°': 'A', 'Р±': 'B', 'РІ': 'V', 'Рі': 'G', 'Рґ': 'D', 'Рµ': 'E', 'С‘': 'E', 'Р¶': 'ZH', 'Р·': 'Z', 'Рё': 'I',
        'Р№': 'Y', 'Рє': 'K', 'Р»': 'L', 'Рј': 'M', 'РЅ': 'N', 'Рѕ': 'O', 'Рї': 'P', 'СЂ': 'R', 'СЃ': 'S', 'С‚': 'T',
        'Сѓ': 'U', 'С„': 'F', 'С…': 'KH', 'С†': 'TS', 'С‡': 'CH', 'С€': 'SH', 'С‰': 'SHCH', 'СЉ': '', 'С‹': 'Y', 'СЊ': '',
        'СЌ': 'E', 'СЋ': 'YU', 'СЏ': 'YA', 'У™': 'A', 'С–': 'I', 'ТЈ': 'NG', 'Т“': 'GH', 'ТЇ': 'U', 'Т±': 'U', 'Т›': 'Q', 'У©': 'O', 'Т»': 'H'
    };

    function transliterate(text) {
        if (!text) return '';
        return text.split('').map(char => cyrillicToLatinMap[char] || char.toUpperCase()).join('');
    }

    // РЎРѕСЃС‚РѕСЏРЅРёРµ РїСЂРёР»РѕР¶РµРЅРёСЏ
    let tourists = [];
    let currentCalcMode = 'detailed';
    let quickCounts = { adl: 0, chld: 0, pens: 0, inf: 0 };
    
    // Р­Р»РµРјРµРЅС‚С‹ DOM
    const visitDateInput = document.getElementById('visitDate');
    const clientTypeInput = document.getElementById('clientType');
    const tariffTypeInput = document.getElementById('tariffType');
    const dateWarning = document.getElementById('dateWarning');
    const touristListEl = document.getElementById('touristList');
    const addTouristBtn = document.getElementById('addTouristBtn');
    const parseBulkBtn = document.getElementById('parseBulkBtn');
    const bulkText = document.getElementById('bulkText');
    const emptyState = document.getElementById('emptyState');
    const totalPriceEl = document.getElementById('totalPrice');
    const exportDataEl = document.getElementById('exportData');
    const copyExportBtn = document.getElementById('copyExportBtn');

    // Dummy auth logic removed to prevent conflicts with checkAuth

    // РЎС‚Р°С‚РёСЃС‚РёРєР°
    const stats = {
        adl: document.getElementById('statAdl'),
        chld: document.getElementById('statChld'),
        inf: document.getElementById('statInf'),
        pens: document.getElementById('statPens'),
        bday: document.getElementById('statBday')
    };

    // РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј СЃРµРіРѕРґРЅСЏС€РЅСЋСЋ РґР°С‚Сѓ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
    const today = new Date();
    // Р¤РѕСЂРјР°С‚РёСЂСѓРµРј СЃ СѓС‡РµС‚РѕРј Р»РѕРєР°Р»СЊРЅРѕР№ Р·РѕРЅС‹ (РґР»СЏ РєРѕСЂСЂРµРєС‚РЅРѕРіРѕ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ YYYY-MM-DD)
    const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    visitDateInput.value = todayStr;
    
    // РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРёР№ РіРѕРґ СЃРµР·РѕРЅР°
    const currentSeasonYearEl = document.getElementById('currentSeasonYear');
    if (currentSeasonYearEl) {
        currentSeasonYearEl.textContent = `РЎРµР·РѕРЅ ${today.getFullYear()}`;
    }

    if (visitDateInput) visitDateInput.addEventListener('change', render);
    if (clientTypeInput) clientTypeInput.addEventListener('change', render);
    if (tariffTypeInput) tariffTypeInput.addEventListener('change', render);
    if (addTouristBtn) addTouristBtn.addEventListener('click', addTourist);

    // i18n Language Switchers binding
    const langSelect = document.getElementById('langSelect');
    const authLangSelect = document.getElementById('authLangSelect');
    
    if (langSelect) {
        langSelect.value = i18n.currentLang;
        langSelect.addEventListener('change', (e) => {
            i18n.setLang(e.target.value);
            if (authLangSelect) authLangSelect.value = e.target.value;
        });
    }
    if (authLangSelect) {
        authLangSelect.value = i18n.currentLang;
        authLangSelect.addEventListener('change', (e) => {
            i18n.setLang(e.target.value);
            if (langSelect) langSelect.value = e.target.value;
        });
    }
    
    i18n.applyTranslations();

    // Р—Р°РіСЂСѓР·РєР° С‡РµСЂРЅРѕРІРёРєР° (РђРІС‚Рѕ-СЃРѕС…СЂР°РЅРµРЅРёРµ)
    const draft = localStorage.getItem('tetisBluDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            // Restore visitDate as required by "РђРІС‚РѕСЃРѕС…СЂР°РЅРµРЅРёРµ РґР°РЅРЅС‹С… (Р§РµСЂРЅРѕРІРёРє)"
            if (data.visitDate) visitDateInput.value = data.visitDate;
            if (data.clientType) clientTypeInput.value = data.clientType;
            if (data.tariffType) tariffTypeInput.value = data.tariffType;
            if (data.tourists && Array.isArray(data.tourists) && data.tourists.length > 0) {
                tourists = data.tourists;
            } else {
                addTourist();
            }
            if (data.currentCalcMode) {
                currentCalcMode = data.currentCalcMode;
            }
            if (data.quickCounts) {
                quickCounts = data.quickCounts;
            }
            setTimeout(() => {
                switchCalcMode(currentCalcMode);
            }, 50);
        } catch (e) {
            console.error('РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё С‡РµСЂРЅРѕРІРёРєР°', e);
            addTourist();
        }
    } else {
        addTourist();
    }
    
    // РџРµСЂРІРёС‡РЅС‹Р№ СЂРµРЅРґРµСЂ РµСЃР»Рё РґР°РЅРЅС‹Рµ Р·Р°РіСЂСѓР¶РµРЅС‹
    if (tourists.length > 0) render();

    // Parse Bulk Text Input
    parseBulkBtn.addEventListener('click', () => {
        const text = bulkText.value.trim();
        if (!text) return;
        
        // Check if the input represents quantities instead of names with dates of birth
        const dobRegex = /\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b/;
        
        // Function to parse quantity descriptions like "2 РІР·СЂРѕСЃР»С‹С… Рё 1 СЂРµР±РµРЅРѕРє"
        function parseQuantityDescription(inputText) {
            if (dobRegex.test(inputText)) {
                return null; // Contains DOBs, so it's a detailed list, not just counts
            }

            const cleanText = inputText.toLowerCase();
            
            // Regex patterns to detect counts of different guest categories.
            const adlRegex = /(\d+)\s*(?:РІР·СЂРѕСЃР»[С‹РµСЏР№Р°С…]*|РІР·СЂ|adl|adults?|РµСЂРµСЃРµРєС‚РµСЂ?)/g;
            // Map "СЂРµР±РµРЅРѕРє", "СЂРµР±РµРЅРєР°", "СЂРµР±", "inf", "РјР»Р°РґРµРЅРµС†", "РјР»" to INF by default, as requested ("РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РЅР°РїРёСЃР°С‚СЊ ADL, INF")
            // But also check for "РґРµС‚Рё", "РґРµС‚", "chld", "child" which can map to CHLD.
            const infRegex = /(\d+)\s*(?:СЂРµР±РµРЅ[РѕРєР°С†]*|СЂРµР±|РјР»Р°РґРµРЅ[РµС†Р°С‹]*|РјР»[Р°Рґ]*|inf(?:ants?)?|СЃУ™Р±Рё|Р±У©Р±РµРє)/g;
            const chldRegex = /(\d+)\s*(?:РґРµС‚Рё|РґРµС‚[СЏРјРЅСЃРєР°]*|chld|child(?:ren)?|Р±Р°Р»Р°(?:Р»Р°СЂ)?)/g;
            const snrRegex = /(\d+)\s*(?:РїРµРЅСЃРёРѕРЅРµСЂ[С‹РѕРІ]*|РїРµРЅСЃ|snr|pensioners?|Р·РµР№РЅРµС‚РєРµСЂ(?:Р»РµСЂ)?)/g;
            
            let adlCount = 0;
            let chldCount = 0;
            let infCount = 0;
            let snrCount = 0;
            
            let matched = false;
            let match;
            
            while ((match = adlRegex.exec(cleanText)) !== null) {
                adlCount += parseInt(match[1], 10);
                matched = true;
            }
            while ((match = chldRegex.exec(cleanText)) !== null) {
                chldCount += parseInt(match[1], 10);
                matched = true;
            }
            while ((match = infRegex.exec(cleanText)) !== null) {
                infCount += parseInt(match[1], 10);
                matched = true;
            }
            while ((match = snrRegex.exec(cleanText)) !== null) {
                snrCount += parseInt(match[1], 10);
                matched = true;
            }
            
            if (!matched) {
                // If no numbers were matched, check if there are keywords present (meaning singular, like "РІР·СЂРѕСЃР»С‹Р№ Рё СЂРµР±РµРЅРѕРє" -> 1 adult, 1 child)
                const hasAdl = /(?:РІР·СЂРѕСЃР»[С‹РµСЏР№Р°С…]*|РІР·СЂ|adl|adults?|РµСЂРµСЃРµРєС‚РµСЂ?)/i.test(cleanText);
                const hasChld = /(?:РґРµС‚Рё|РґРµС‚[СЏРјРЅСЃРєР°]*|chld|child(?:ren)?|Р±Р°Р»Р°(?:Р»Р°СЂ)?)/i.test(cleanText);
                const hasInf = /(?:СЂРµР±РµРЅ[РѕРєР°С†]*|СЂРµР±|РјР»Р°РґРµРЅ[РµС†Р°С‹]*|РјР»[Р°Рґ]*|inf(?:ants?)?|СЃУ™Р±Рё|Р±У©Р±РµРє)/i.test(cleanText);
                const hasSnr = /(?:РїРµРЅСЃРёРѕРЅРµСЂ[С‹РѕРІ]*|РїРµРЅСЃ|snr|pensioners?|Р·РµР№РЅРµС‚РєРµСЂ(?:Р»РµСЂ)?)/i.test(cleanText);
                
                if (hasAdl || hasChld || hasInf || hasSnr) {
                    if (hasAdl) adlCount = 1;
                    if (hasChld) chldCount = 1;
                    if (hasInf) infCount = 1;
                    if (hasSnr) snrCount = 1;
                    matched = true;
                }
            }
            
            if (!matched) return null;
            
            return { adl: adlCount, chld: chldCount, inf: infCount, snr: snrCount };
        }

        const quantityData = parseQuantityDescription(text);
        if (quantityData) {
            const today = new Date();
            const visitDateStr = visitDateInput ? visitDateInput.value : '';
            const visitYear = visitDateStr ? new Date(visitDateStr).getFullYear() : today.getFullYear();
            
            tourists = []; // Clear existing list
            
            // Add Adults (ADL)
            for (let i = 0; i < quantityData.adl; i++) {
                tourists.push({
                    id: createId(),
                    fullName: `Р“РѕСЃС‚СЊ ${tourists.length + 1}`,
                    dob: `${visitYear - 25}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: 'none'
                });
            }
            // Add Children (CHLD)
            for (let i = 0; i < quantityData.chld; i++) {
                tourists.push({
                    id: createId(),
                    fullName: `Р“РѕСЃС‚СЊ ${tourists.length + 1}`,
                    dob: `${visitYear - 8}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: 'none'
                });
            }
            // Add Pensioners (SNR)
            for (let i = 0; i < quantityData.snr; i++) {
                tourists.push({
                    id: createId(),
                    fullName: `Р“РѕСЃС‚СЊ ${tourists.length + 1}`,
                    dob: `${visitYear - 65}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: 'none'
                });
            }
            // Add Infants (INF)
            for (let i = 0; i < quantityData.inf; i++) {
                tourists.push({
                    id: createId(),
                    fullName: `Р“РѕСЃС‚СЊ ${tourists.length + 1}`,
                    dob: `${visitYear - 1}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: 'none'
                });
            }
            
            render();
            bulkText.value = '';
            return;
        }

    // Helper to parse a single line for bulk import/text parsing
    function parseLineForBulk(line, index = 1) {
        line = line.trim();
        if (!line) return null;

        let tAge = undefined;
        let tYear = undefined;

        // РџСЂРѕРІРµСЂСЏРµРј, РЅРµ Р·Р°РіРѕР»РѕРІРѕРє Р»Рё СЌС‚Рѕ
        if (index === 0) {
            const headerDateMatch = line.match(/(?:РЅР°\s+|РґР°С‚Р°\s*РїРѕСЃРµС‰РµРЅРёСЏ\s*)?(\d{1,2})[\.\-\/](\d{1,2})(?:[\.\-\/](\d{2}|\d{4}))?/i);
            const lowerLine = line.toLowerCase();
            const isHeader = headerDateMatch && (
                lowerLine.includes('РЅР° ') || 
                lowerLine.includes('РґР°С‚Р°') || 
                lowerLine.includes('С‚РµС‚РёСЃ') ||
                lowerLine.includes('tour') ||
                lowerLine.includes('С‚СѓСЂ') ||
                lowerLine.includes('Р±СЂРѕРЅСЊ') ||
                lowerLine.includes('Р·Р°СЏРІРєР°') ||
                lowerLine.includes('РіСЂСѓРїРї')
            );

            if (isHeader) {
                const day = headerDateMatch[1].padStart(2, '0');
                const month = headerDateMatch[2].padStart(2, '0');
                let currentYear = new Date().getFullYear();
                
                if (headerDateMatch[3]) {
                    let y = headerDateMatch[3];
                    if (y.length === 2) {
                        const yInt = parseInt(y);
                        currentYear = yInt > 50 ? 1900 + yInt : 2000 + yInt;
                    } else {
                        currentYear = parseInt(y);
                    }
                }
                
                if (visitDateInput) visitDateInput.value = `${currentYear}-${month}-${day}`;
                return null;
            }
        }

        // Р”РµС‚РµРєС†РёСЏ РєР°С‚РµРіРѕСЂРёРё РёР· РёСЃС…РѕРґРЅРѕРіРѕ С‚РµРєСЃС‚Р°
        let parsedCategory = null;
        const lowerLineForCat = line.toLowerCase();
        if (/(?:^|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])(?:adl|adults?|РІР·СЂРѕСЃР»[С‹РµСЏР№Р°С…]*|РІР·СЂ|ТЇР»РєРµРЅ)(?=$|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])/i.test(lowerLineForCat)) {
            parsedCategory = 'ADL';
        } else if (/(?:^|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])(?:chld|child(?:ren)?|РґРµС‚Рё|РґРµС‚[СЏРјРЅСЃРєР°]*|Р±Р°Р»Р°(?:Р»Р°СЂ)?)(?=$|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])/i.test(lowerLineForCat)) {
            parsedCategory = 'CHLD';
        } else if (/(?:^|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])(?:inf(?:ants?)?|РјР»Р°РґРµРЅ[РµС†Р°С‹]*|РјР»[Р°Рґ]*|СЂРµР±РµРЅ[РѕРєР°С†]*|СЂРµР±|СЃУ™Р±Рё|Р±У©Р±РµРє)(?=$|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])/i.test(lowerLineForCat)) {
            parsedCategory = 'INF';
        } else if (/(?:^|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])(?:snr|pensioners?|РїРµРЅСЃРёРѕРЅРµСЂ[С‹РѕРІ]*|РїРµРЅСЃ|Р·РµР№РЅРµС‚РєРµСЂ(?:Р»РµСЂ)?)(?=$|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])/i.test(lowerLineForCat)) {
            parsedCategory = 'SNR';
        }

        // РџРµСЂРµРІРѕРґ РјРµСЃСЏС†РµРІ РЅР° С‚СЂРµС… СЏР·С‹РєР°С… РІ С‡РёСЃР»РѕРІРѕР№ С„РѕСЂРјР°С‚ РїРµСЂРµРґ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёРµРј РґР°С‚
        const monthMap = {
            'СЏРЅРІР°СЂСЏ': '01', 'СЏРЅРІР°СЂСЊ': '01', 'СЏРЅРІ': '01',
            'С„РµРІСЂР°Р»СЏ': '02', 'С„РµРІСЂР°Р»СЊ': '02', 'С„РµРІ': '02',
            'РјР°СЂС‚Р°': '03', 'РјР°СЂС‚': '03', 'РјР°СЂ': '03',
            'Р°РїСЂРµР»СЏ': '04', 'Р°РїСЂРµР»СЊ': '04', 'Р°РїСЂ': '04',
            'РјР°СЏ': '05', 'РјР°Р№': '05',
            'РёСЋРЅСЏ': '06', 'РёСЋРЅСЊ': '06', 'РёСЋРЅ': '06',
            'РёСЋР»СЏ': '07', 'РёСЋР»СЊ': '07', 'РёСЋР»': '07',
            'Р°РІРіСѓСЃС‚Р°': '08', 'Р°РІРіСѓСЃС‚': '08', 'Р°РІРі': '08',
            'СЃРµРЅС‚СЏР±СЂСЏ': '09', 'СЃРµРЅС‚СЏР±СЂСЊ': '09', 'СЃРµРЅ': '09',
            'РѕРєС‚СЏР±СЂСЏ': '10', 'РѕРєС‚СЏР±СЂСЊ': '10', 'РѕРєС‚': '10',
            'РЅРѕСЏР±СЂСЏ': '11', 'РЅРѕСЏР±СЂСЊ': '11', 'РЅРѕСЏ': '11',
            'РґРµРєР°Р±СЂСЏ': '12', 'РґРµРєР°Р±СЂСЊ': '12', 'РґРµРє': '12',
            'Т›Р°ТЈС‚Р°СЂ': '01', 'РєР°РЅС‚Р°СЂ': '01', 'Т›Р°ТЈ': '01',
            'Р°Т›РїР°РЅ': '02', 'Р°РєРїР°РЅ': '02', 'Р°Т›Рї': '02',
            'РЅР°СѓСЂС‹Р·': '03', 'РЅР°Сѓ': '03',
            'СЃУ™СѓС–СЂ': '04', 'СЃСЌСѓС–СЂ': '04', 'СЃУ™Сѓ': '04',
            'РјР°РјС‹СЂ': '05', 'РјР°Рј': '05',
            'РјР°СѓСЃС‹Рј': '06', 'РјР°Сѓ': '06',
            'С€С–Р»РґРµ': '07', 'С€РёР»РґРµ': '07', 'С€С–Р»': '07',
            'С‚Р°РјС‹Р·': '08', 'С‚Р°Рј': '08',
            'Т›С‹СЂРєТЇР№РµРє': '09', 'РєС‹СЂРєСѓР№РµРє': '09', 'Т›С‹СЂ': '09',
            'Т›Р°Р·Р°РЅ': '10', 'РєР°Р·Р°РЅ': '10', 'Т›Р°Р·': '10',
            'Т›Р°СЂР°С€Р°': '11', 'РєР°СЂР°С€Р°': '11', 'Т›Р°СЂ': '11',
            'Р¶РµР»С‚РѕТ›СЃР°РЅ': '12', 'Р¶РµР»С‚РѕРєСЃР°РЅ': '12', 'Р¶РµР»': '12',
            'january': '01', 'jan': '01',
            'february': '02', 'feb': '02',
            'march': '03', 'mar': '03',
            'april': '04', 'apr': '04',
            'may': '05',
            'june': '06', 'jun': '06',
            'july': '07', 'jul': '07',
            'august': '08', 'aug': '08',
            'september': '09', 'sep': '09',
            'october': '10', 'oct': '10',
            'november': '11', 'nov': '11',
            'december': '12', 'dec': '12'
        };

        const monthKeys = Object.keys(monthMap).sort((a, b) => b.length - a.length);
        for (let key of monthKeys) {
            const regex = new RegExp(`(?<![a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])${key}(?![a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])`, 'gi');
            if (regex.test(line)) {
                line = line.replace(regex, monthMap[key]);
            }
        }

        // РС‰РµРј РґР°С‚Сѓ СЂРѕР¶РґРµРЅРёСЏ РїРѕ РЅР°С€РµРјСѓ СѓР»СѓС‡С€РµРЅРЅРѕРјСѓ regex (РґРµРЅСЊ 1-31, РјРµСЃСЏС† 1-12, РіРѕРґ 2 РёР»Рё 4 С†РёС„СЂС‹)
        const dobRegex = /\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b/;
        const dobMatch = line.match(dobRegex);
        
        let dobIso = '';
        let matchedStr = '';
        
        if (dobMatch) {
            matchedStr = dobMatch[0];
            const parts = matchedStr.split(/[\.\-\/\s]+/);
            
            let day = '';
            let month = '';
            let year = '';
            
            if (parts.length >= 3) {
                day = parts[0].padStart(2, '0');
                month = parts[1].padStart(2, '0');
                year = parts[2];
            } else if (parts.length === 2) {
                day = parts[0].padStart(2, '0');
                month = parts[1].slice(0, 2).padStart(2, '0');
                year = parts[1].slice(2);
            } else {
                day = matchedStr.slice(0, 2);
                month = matchedStr.slice(2, 4);
                year = matchedStr.slice(4);
            }
            
            if (year.length === 2) {
                const yInt = parseInt(year);
                year = (yInt > 50 ? 1900 + yInt : 2000 + yInt).toString();
            }

            dobIso = `${year}-${month}-${day}`;
        } else {
            // РС‰РµРј СѓРєР°Р·Р°РЅРёРµ РІРѕР·СЂР°СЃС‚Р°, РЅР°РїСЂРёРјРµСЂ "35 Р»РµС‚", "5 Р¶Р°СЃ", "12 years", "2 РіРѕРґР°"
            const ageRegex = /(?<!\d)(\d{1,2})\s*(?:Р»РµС‚|РіРѕРґР°|РіРѕРґ|Р¶Р°СЃС‚Р°|Р¶Р°СЃ|yo|y\.o\.|years?(?:\s+old)?|old)(?![a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє0-9_])/i;
            const ageMatch = line.match(ageRegex);
            if (ageMatch) {
                matchedStr = ageMatch[0];
                const age = parseInt(ageMatch[1], 10);
                dobIso = '';
                tAge = age;
            } else {
                // РС‰РµРј С‚РѕР»СЊРєРѕ С‡РµС‚С‹СЂРµС…Р·РЅР°С‡РЅС‹Р№ РіРѕРґ СЂРѕР¶РґРµРЅРёСЏ, РЅР°РїСЂРёРјРµСЂ "1995", "2018 Рі.", "2015 Рі.СЂ."
                const yearRegex = /(?<!\d)(19\d{2}|20[0-2]\d)(?![0-9])(?:\s*(?:Рі\.|Рі|РіРѕРґР°|Рі\.СЂ\.|РіСЂ))?/i;
                const yearMatch = line.match(yearRegex);
                if (yearMatch) {
                    matchedStr = yearMatch[0];
                    const birthYear = parseInt(yearMatch[1], 10);
                    dobIso = '';
                    tYear = birthYear;
                }
            }
        }
        
        // Р’С‹СЂРµР·Р°РµРј РґР°С‚Сѓ/РІРѕР·СЂР°СЃС‚/РіРѕРґ РёР· СЃС‚СЂРѕРєРё РµСЃР»Рё РЅР°Р№РґРµРЅРѕ
        let namePart = line;
        if (matchedStr) {
            namePart = line.replace(matchedStr, '');
        }
        
        // РЈР±РёСЂР°РµРј СѓРєР°Р·Р°РЅРёРµ РІРѕР·СЂР°СЃС‚Р° С‚РёРїР° "(29 Р¶Р°СЃ)", "29 Р¶Р°СЃ", "(7 Р»РµС‚)", "7 Р»РµС‚"
        namePart = namePart.replace(/\(?\b\d+\s*(?:Р¶Р°СЃ|Р»РµС‚|РіРѕРґ[Р°-СЏ]*|yo|y\.o\.|years?|old)(?![a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє0-9])\)?/ig, '');
        namePart = namePart.replace(/\(\s*\d+\s*\)/g, '');
        
        // РЈР±РёСЂР°РµРј РѕР±СЂР°С‰РµРЅРёСЏ (MR, MRS, MS, CHD, INF, ADL, SNR Рё С‚.Рґ.)
        namePart = namePart.replace(/(?:^|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])(?:mr|mrs|ms|chd|inf|adl|snr|adults?|pensioners?|children|infants?)(?=$|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])/ig, ' ');
        
        // РЈР±РёСЂР°РµРј РєР°С‚РµРіРѕСЂРёРё РЅР° С‚СЂРµС… СЏР·С‹РєР°С…
        namePart = namePart.replace(/(?:^|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])(?:РІР·СЂ[Р°-СЏ]*|СЂРµР±[Р°-СЏ]*|РґРµС‚Рё|РґРµС‚[Р°-СЏ]*|РјР»Р°Рґ[Р°-СЏ]*|РїРµРЅСЃ[Р°-СЏ]*|Р·РµР№РЅРµС‚РєРµСЂ[Р°-СЏ]*|Р±Р°Р»Р°[Р°-СЏ]*|ТЇР»РєРµРЅ[Р°-СЏ]*)(?=$|\s|[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])/ig, ' ');
        
        // РЈР±РёСЂР°РµРј CRM-РјРµС‚РєРё
        namePart = namePart.replace(/РґР°С‚Р°\s*СЂРѕР¶Рґ[Р°-СЏРђ-РЇ]*/ig, '');
        namePart = namePart.replace(/data\s*rozhd[a-zA-Z]*/ig, '');
        namePart = namePart.replace(/\bРґ\.?СЂ\.?\b/ig, '');
        namePart = namePart.replace(/\bd\.?r\.?\b/ig, '');
        
        // РћС‡РёС‰Р°РµРј РёРјСЏ РѕС‚ Р»РёС€РЅРёС… СЃРёРјРІРѕР»РѕРІ (РѕСЃС‚Р°РІР»СЏРµРј С‚РѕР»СЊРєРѕ Р±СѓРєРІС‹ С‚СЂРµС… СЏР·С‹РєРѕРІ Рё РґРµС„РёСЃС‹)
        namePart = namePart.replace(/[^a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє\s\-]/g, ' ').trim();
        namePart = namePart.replace(/^-+|-+$/g, '').trim();
        namePart = namePart.replace(/\s+/g, ' ');

        if (namePart.length >= 2) {
            namePart = namePart.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');

            const guessed = guessGender(namePart);
            const touristObj = {
                id: createId(),
                fullName: namePart,
                dob: dobIso,
                gender: guessed,
                genderManuallySet: false,
                disability: 'none'
            };
            if (tAge !== undefined) touristObj.age = tAge;
            if (tYear !== undefined) touristObj.year = tYear;
            
            if (parsedCategory) {
                touristObj.category = parsedCategory;
                touristObj.categoryManuallySet = true;
            } else if (!dobIso && tAge === undefined && tYear === undefined) {
                touristObj.category = 'ADL';
                touristObj.categoryManuallySet = false;
            }
            
            return touristObj;
        }
        return null;
    }

    // 1. РџСЂРµРґРѕР±СЂР°Р±РѕС‚РєР°: СЂР°Р·Р±РёРІР°РµРј РЅР° СЃС‚СЂРѕРєРё РїРѕ РґР°С‚Р°Рј СЂРѕР¶РґРµРЅРёСЏ РїРµСЂРµРґ РёРјРµРЅР°РјРё
    const dobSplitRegex = /(?:\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b)([\.\s\-\/]+)(?=[a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])/g;
    
    // Parse Bulk Text Input
    parseBulkBtn.addEventListener('click', () => {
        const text = bulkText.value.trim();
        if (!text) return;
        
        const quantityData = parseQuantityDescription(text);
        if (quantityData) {
            const today = new Date();
            const visitDateStr = visitDateInput ? visitDateInput.value : '';
            const visitYear = visitDateStr ? new Date(visitDateStr).getFullYear() : today.getFullYear();
            
            tourists = [];
            
            for (let i = 0; i < quantityData.adl; i++) {
                tourists.push({
                    id: createId(),
                    fullName: `${i18n.translate('guestNameDefault')} ${tourists.length + 1}`,
                    dob: `${visitYear - 25}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: 'none'
                });
            }
            for (let i = 0; i < quantityData.chld; i++) {
                tourists.push({
                    id: createId(),
                    fullName: `${i18n.translate('guestNameDefault')} ${tourists.length + 1}`,
                    dob: `${visitYear - 8}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: 'none'
                });
            }
            for (let i = 0; i < quantityData.snr; i++) {
                tourists.push({
                    id: createId(),
                    fullName: `${i18n.translate('guestNameDefault')} ${tourists.length + 1}`,
                    dob: `${visitYear - 65}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: 'none'
                });
            }
            for (let i = 0; i < quantityData.inf; i++) {
                tourists.push({
                    id: createId(),
                    fullName: `${i18n.translate('guestNameDefault')} ${tourists.length + 1}`,
                    dob: `${visitYear - 1}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: 'none'
                });
            }
            
            render();
            bulkText.value = '';
            return;
        }

        let normalizedText = text.replace(dobSplitRegex, '$&\n');
        normalizedText = normalizedText.replace(/(?:^|\n)\s*\d+[\.\)\s\-]+\s*(?=[a-zA-ZР°-СЏРђ-РЇС‘РЃУ™С–ТЈТ“ТЇТ±Т›У©Т»УР†ТўТ’Т®Т°ТљУЁТє])/g, '\n');
        
        const lines = normalizedText.split('\n');
        const unrecognizedLines = [];
        
        lines.forEach((line, index) => {
            const originalLine = line;
            const parsed = parseLineForBulk(line, index);
            if (parsed) {
                tourists.push(parsed);
            } else {
                // If it wasn't recognized and wasn't header
                if (line.trim() && index > 0) {
                    unrecognizedLines.push(originalLine);
                }
            }
        });
        
        if (tourists.length > 1 && tourists[0].fullName === '' && tourists[0].dob === '') {
            tourists.shift();
        }

        render();
        
        if (unrecognizedLines.length > 0) {
            bulkText.value = unrecognizedLines.join('\n');
            window.showToast(i18n.translate('unrecognizedLinesToast').replace('{count}', unrecognizedLines.length), 'fa-triangle-exclamation', 'bg-amber-500');
        } else {
            bulkText.value = '';
        }
    });

    function createId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    window.clearAllTourists = function() {
        if (confirm('Р’С‹ СѓРІРµСЂРµРЅС‹, С‡С‚Рѕ С…РѕС‚РёС‚Рµ СѓРґР°Р»РёС‚СЊ РІСЃРµС… РіРѕСЃС‚РµР№ Рё РЅР°С‡Р°С‚СЊ Р·Р°РЅРѕРІРѕ?')) {
            tourists = [];
            
            // РЎР±СЂР°СЃС‹РІР°РµРј РґР°С‚Сѓ РІРёР·РёС‚Р° РЅР° СЃРµРіРѕРґРЅСЏ
            const today = new Date();
            const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            if (visitDateInput) visitDateInput.value = todayStr;
            
            render();
        }
    };

    function addTourist() {
        tourists.push({
            id: createId(),
            fullName: '',
            dob: '',
            gender: 'male',
            genderManuallySet: false,
            disability: 'none'
        });
        render();
    }

    function removeTourist(id) {
        tourists = tourists.filter(t => t.id !== id);
        render();
    }

    function updateTourist(id, field, value) {
        const tourist = tourists.find(t => t.id === id);
        if (tourist) {
            tourist[field] = value;
            if (field === 'fullName') {
                if (!tourist.genderManuallySet) {
                    tourist.gender = guessGender(value);
                }
                delete tourist.category;
                delete tourist.categoryManuallySet;
            }
            if (field === 'gender') {
                tourist.genderManuallySet = true;
            }
            if (field === 'dob') {
                delete tourist.age;
                delete tourist.year;
                delete tourist.category;
                delete tourist.categoryManuallySet;
            }
            render();
        }
    }
    function updateTouristDobDirect(id, value) {
        const tourist = tourists.find(t => t.id === id);
        if (!tourist) return;
        
        value = value.trim();
        if (!value) {
            tourist.dob = '';
            delete tourist.age;
            delete tourist.year;
            delete tourist.category;
            delete tourist.categoryManuallySet;
            render();
            return;
        }
        
        // 1. РџСЂРѕРІРµСЂСЏРµРј, РїРѕР»РЅР°СЏ Р»Рё СЌС‚Рѕ РґР°С‚Р° (РЅР°РїСЂРёРјРµСЂ, 15.06.1990)
        const dobRegex = /\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b/;
        const match = value.match(dobRegex);
        if (match) {
            const parts = match[0].split(/[\.\-\/\s]+/);
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) {
                const yInt = parseInt(year);
                year = (yInt > 50 ? 1900 + yInt : 2000 + yInt).toString();
            }
            tourist.dob = `${year}-${month}-${day}`;
            delete tourist.age;
            delete tourist.year;
            delete tourist.category;
            delete tourist.categoryManuallySet;
            render();
            return;
        }
        
        // 2. РџСЂРѕРІРµСЂСЏРµРј, С‚РѕР»СЊРєРѕ Р»Рё СЌС‚Рѕ РіРѕРґ (РЅР°РїСЂРёРјРµСЂ, 4 С†РёС„СЂС‹ С‚РёРїР° 2018)
        const yearRegex = /\b(19\d{2}|20[0-2]\d)\b/;
        const yearMatch = value.match(yearRegex);
        if (yearMatch) {
            tourist.year = parseInt(yearMatch[1], 10);
            tourist.dob = '';
            delete tourist.age;
            delete tourist.category;
            delete tourist.categoryManuallySet;
            render();
            return;
        }
        
        // 3. РџСЂРѕРІРµСЂСЏРµРј, С‚РѕР»СЊРєРѕ Р»Рё СЌС‚Рѕ РІРѕР·СЂР°СЃС‚ (РЅР°РїСЂРёРјРµСЂ, 1 РёР»Рё 2 С†РёС„СЂС‹ С‚РёРїР° 35)
        const ageRegex = /\b(\d{1,2})\b/;
        const ageMatch = value.match(ageRegex);
        if (ageMatch) {
            tourist.age = parseInt(ageMatch[1], 10);
            tourist.dob = '';
            delete tourist.year;
            delete tourist.category;
            delete tourist.categoryManuallySet;
            render();
            return;
        }
        
        // Р•СЃР»Рё РЅРµ СЂР°СЃРїРѕР·РЅР°Р»Рё, Р·Р°РїРёСЃС‹РІР°РµРј РєР°Рє dob
        tourist.dob = value;
        delete tourist.age;
        delete tourist.year;
        delete tourist.category;
        delete tourist.categoryManuallySet;
        render();
    }
    function updateTouristCategory(id, value) {
        const tourist = tourists.find(t => t.id === id);
        if (tourist) {
            tourist.category = value;
            tourist.categoryManuallySet = true;
            render();
        }
    }

    function guessGender(name) {
        if (!name) return 'male';
        const cleanName = name.trim().toLowerCase();
        const words = cleanName.split(/\s+/);
        
        for (let word of words) {
            // 1. Р–РµРЅСЃРєРёРµ РѕРєРѕРЅС‡Р°РЅРёСЏ (РєР°Р·Р°С…СЃРєРёРµ РѕС‚С‡РµСЃС‚РІР° Рё С„Р°РјРёР»РёРё)
            if (word.endsWith('Т›С‹Р·С‹') || word.endsWith('kyzy') || word.endsWith('qyzy')) return 'female';
            // 2. РњСѓР¶СЃРєРёРµ РѕРєРѕРЅС‡Р°РЅРёСЏ (РєР°Р·Р°С…СЃРєРёРµ РѕС‚С‡РµСЃС‚РІР°)
            if (word.endsWith('Т±Р»С‹') || word.endsWith('uly') || word.endsWith('СѓР»С‹')) return 'male';
            
            // 3. Р СѓСЃСЃРєРёРµ РѕС‚С‡РµСЃС‚РІР°
            if (word.endsWith('РѕРІРЅР°') || word.endsWith('РµРІРЅР°') || word.endsWith('РёС‡РЅР°')) return 'female';
            if (word.endsWith('РѕРІРёС‡') || word.endsWith('РµРІРёС‡') || word.endsWith('РёС‡')) return 'male';
            if (word.endsWith('ovna') || word.endsWith('evna') || word.endsWith('ichna')) return 'female';
            if (word.endsWith('ovich') || word.endsWith('evich') || word.endsWith('ich')) return 'male';
            
            // 4. Р СѓСЃСЃРєРёРµ/РєР°Р·Р°С…СЃРєРёРµ С„Р°РјРёР»РёРё РЅР° ova/eva/ina/aya/РѕРІР°/РµРІР°/РёРЅР°/Р°СЏ
            if (word.endsWith('РѕРІР°') || word.endsWith('РµРІР°') || word.endsWith('РёРЅР°') || word.endsWith('Р°СЏ')) return 'female';
            if (word.endsWith('ova') || word.endsWith('eva') || word.endsWith('ina') || word.endsWith('aya')) return 'female';
            
            // 5. РћРєРѕРЅС‡Р°РЅРёСЏ РєР°Р·Р°С…СЃРєРёС… Р¶РµРЅСЃРєРёС… РёРјРµРЅ (РЅТ±СЂ/РЅСѓСЂ/nur, РіТЇР»/РіСѓР»/gul, С‹Рј/С–Рј/ym/im)
            if (word.endsWith('РЅТ±СЂ') || word.endsWith('РЅСѓСЂ') || word.endsWith('nur')) return 'female';
            if (word.endsWith('РіТЇР»') || word.endsWith('РіСѓР»') || word.endsWith('gul')) return 'female';
            if (word.endsWith('РЅС‹Рј') || word.endsWith('Р»С‹Рј') || word.endsWith('СЂС‹Рј') || word.endsWith('РЅС‹Рј')) return 'female';
            
            // РР·РІРµСЃС‚РЅС‹Рµ Р¶РµРЅСЃРєРёРµ РёРјРµРЅР° Р±РµР· С‡РµС‚РєРёС… РѕРєРѕРЅС‡Р°РЅРёР№
            if (word.endsWith('Р°Р№С‹Рј') || word.endsWith('Р°СЂСѓ') || word.endsWith('Р°СЂСѓР¶Р°РЅ') || word.endsWith('СѓР»Р¶Р°РЅ') || 
                word.endsWith('Т±Р»Р¶Р°РЅ') || word.endsWith('Р°СЃРµРј') || word.endsWith('У™СЃРµРј') || word.endsWith('Р°СЃРµР»СЊ') || 
                word.endsWith('У™СЃРµР»') || word.endsWith('Р°Р№РіРµСЂС–Рј') || word.endsWith('Р°Р№РіРµСЂРёРј') || word.endsWith('Р°СЂР°Р№Р»С‹Рј')) {
                return 'female';
            }
            
            // 6. РћРєРѕРЅС‡Р°РЅРёСЏ РјСѓР¶СЃРєРёС… РёРјРµРЅ/С„Р°РјРёР»РёР№ РЅР° РѕРІ/РµРІ/РёРЅ/РёР№
            if (word.endsWith('РѕРІ') || word.endsWith('РµРІ') || word.endsWith('РёРЅ') || word.endsWith('РёР№')) return 'male';
            if (word.endsWith('ov') || word.endsWith('ev') || word.endsWith('in') || word.endsWith('iy') || word.endsWith('y')) {
                // Р•СЃР»Рё СЌС‚Рѕ Seidaly - СЌС‚Рѕ С„Р°РјРёР»РёСЏ, РјРѕР¶РµС‚ Р±С‹С‚СЊ Рё РјСѓР¶СЃРєРѕР№ Рё Р¶РµРЅСЃРєРѕР№. РќРѕ РїРѕ РґРµС„РѕР»С‚Сѓ РѕСЃС‚Р°РІРёРј male.
            }
        }
        
        // Р’С‚РѕСЂР°СЏ РёС‚РµСЂР°С†РёСЏ РїРѕ РѕС‚РґРµР»СЊРЅС‹Рј СЃР»РѕРІР°Рј РґР»СЏ РїРѕРёСЃРєР° Р¶РµРЅСЃРєРёС… РѕРєРѕРЅС‡Р°РЅРёР№ РЅР° -Р° / -СЏ РІ РёРјРµРЅР°С…
        for (let word of words) {
            if (word.length > 2 && (word.endsWith('Р°') || word.endsWith('СЏ') || word.endsWith('a') || word.endsWith('ya'))) {
                // РСЃРєР»СЋС‡Р°РµРј РјСѓР¶СЃРєРёРµ РёРјРµРЅР°/РѕС‚С‡РµСЃС‚РІР°
                if (!word.endsWith('РѕРІРёС‡Р°') && !word.endsWith('РµРІРёС‡Р°') && !word.endsWith('РёС‡Р°') && 
                    !word.endsWith('РёР»СЊСЏ') && !word.endsWith('РЅРёРєРёС‚Р°') && !word.endsWith('РґР°РЅРёР»Р°') && !word.endsWith('Р±Р°С…Р°')) {
                    return 'female';
                }
            }
        }
        
        return 'male';
    }

    function getRetirementAge(gender, visitDateStr) {
        if (gender === 'female') {
            if (!visitDateStr) return 61;
            const visitYear = new Date(visitDateStr).getFullYear();
            if (visitYear <= 2027) return 61;
            if (visitYear === 2028) return 61.5;
            if (visitYear === 2029) return 62;
            if (visitYear === 2030) return 62.5;
            return 63;
        }
        return 63; // Men
    }

    function validateBirthYear(year) {
        if (year === undefined || year === null || year === '') return false;
        const y = parseInt(year, 10);
        if (isNaN(y)) return false;
        const currentYear = new Date().getFullYear();
        return y >= 1900 && y <= currentYear;
    }

    function validateAge(age) {
        if (age === undefined || age === null || age === '') return false;
        const a = parseInt(age, 10);
        if (isNaN(a)) return false;
        return a >= 0 && a <= 120;
    }

    function validateFullDate(dobStr) {
        if (!dobStr) return false;
        const parts = dobStr.split('-');
        if (parts.length !== 3) return false;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
        
        const currentYear = new Date().getFullYear();
        if (y < 1900 || y > currentYear) return false;
        if (m < 1 || m > 12) return false;
        
        const daysInMonth = new Date(y, m, 0).getDate();
        if (d < 1 || d > daysInMonth) return false;
        
        const dateObj = new Date(y, m - 1, d);
        if (dateObj > new Date()) return false;
        
        return true;
    }

    function calculateAge(dobStr, visitDateStr) {
        if (!dobStr || !visitDateStr) return null;
        const dob = new Date(dobStr);
        const visit = new Date(visitDateStr);
        return visit.getFullYear() - dob.getFullYear();
    }

    function getPassengerCategory(age, gender, visitDateStr) {
        if (age === null) return '-';
        const retirementAge = getRetirementAge(gender, visitDateStr);
        if (age >= retirementAge) return 'SNR';
        if (age >= 12) return 'ADL';
        if (age >= 4) return 'CHLD';
        return 'INF';
    }

    function getBasePrice(visitDateStr, clientType, tariffType, passengerCategory) {
        if (!visitDateStr || passengerCategory === '-') return 0;
        
        const visitDate = new Date(visitDateStr);
        const md = String(visitDate.getMonth() + 1).padStart(2, '0') + '-' + String(visitDate.getDate()).padStart(2, '0');
        
        const periods = CONFIG.tariffs[tariffType] || [];
        let activePeriod = null;
        for (let p of periods) {
            if (md >= p.start && md <= p.end) {
                activePeriod = p;
                break;
            }
        }
        
        if (!activePeriod) return -1; // -1 РѕР·РЅР°С‡Р°РµС‚ С‡С‚Рѕ РЅРµС‚ С‚Р°СЂРёС„Р°
        
        if (passengerCategory === 'INF') return 0; // РњР»Р°РґРµРЅС†С‹ РІСЃРµРіРґР° Р±РµСЃРїР»Р°С‚РЅРѕ РїРѕ Р±Р°Р·Рµ
        
        const priceCategory = passengerCategory === 'SNR' ? 'ADL' : passengerCategory;
        return activePeriod[clientType][priceCategory] || 0;
    }

    function calculateDiscount(dobStr, visitDateStr, disability, age, gender) {
        if (age === null || !visitDateStr) return 0;
        
        let maxDiscount = 0;
        
        if (age <= 3) maxDiscount = Math.max(maxDiscount, 100);
        if (disability === '1') maxDiscount = Math.max(maxDiscount, 100);
        
        let isBirthday = false;
        if (dobStr) {
            const dob = new Date(dobStr);
            const visit = new Date(visitDateStr);
            isBirthday = dob.getDate() === visit.getDate() && dob.getMonth() === visit.getMonth();
        }
        if (isBirthday) maxDiscount = Math.max(maxDiscount, 50);
        
        const retirementAge = getRetirementAge(gender, visitDateStr);
        const isPensioner = age >= retirementAge;
        if (isPensioner) maxDiscount = Math.max(maxDiscount, 50);
        
        if (disability === '2') maxDiscount = Math.max(maxDiscount, 15);
        if (disability === '3') maxDiscount = Math.max(maxDiscount, 10);
        
        return { percent: maxDiscount, isBirthday: isBirthday, isPensioner: isPensioner, isInfant: age <= 3 };
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
        return dateStr;
    }

    function render() {
        const visitDate = visitDateInput ? visitDateInput.value : '';
        const clientType = clientTypeInput ? clientTypeInput.value : 'tourist';
        const tariffType = tariffTypeInput ? tariffTypeInput.value : 'day';

        if (touristListEl) touristListEl.innerHTML = '';
        
        if (emptyState) {
            if (tourists.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
            }
        }

        let totalSum = 0;
        let isTariffFound = true;

        // Р”Р»СЏ СЃС‚Р°С‚РёСЃС‚РёРєРё
        let counts = { adl: 0, chld: 0, inf: 0, pens: 0, bday: 0 };
        let exportDataList = [];

        tourists.forEach((t, index) => {
            if (!t.gender) t.gender = 'male';
            if (t.genderManuallySet === undefined) t.genderManuallySet = false;

            let age = null;
            let displayDob = '';
            if (t.age !== undefined) {
                age = t.age;
                const visitYear = visitDate ? new Date(visitDate).getFullYear() : new Date().getFullYear();
                displayDob = (visitYear - t.age).toString();
            } else if (t.year !== undefined) {
                age = (visitDate ? new Date(visitDate).getFullYear() : new Date().getFullYear()) - t.year;
                displayDob = t.year.toString();
            } else {
                age = calculateAge(t.dob, visitDate);
                if (t.dob) {
                    displayDob = formatDate(t.dob);
                }
            }

            const category = getPassengerCategory(age, t.gender, visitDate);
            const basePrice = getBasePrice(visitDate, clientType, tariffType, category);
            
            if (basePrice === -1) isTariffFound = false;

            const today = new Date();
            const vDate = visitDate ? new Date(visitDate) : null;
            const earlyBookingEnabled = vDate && ((vDate.getFullYear() > today.getFullYear()) || (vDate.getFullYear() === today.getFullYear() && vDate.getMonth() > today.getMonth()));
            const discountInfo = calculateDiscount(t.dob, visitDate, t.disability, age, t.gender);
            let discountPercent = discountInfo.percent || 0;
            
            if (earlyBookingEnabled && discountPercent < 100 && age >= 4) {
                discountPercent = Math.max(discountPercent, CONFIG.discounts.earlyBooking);
            }
            
            let finalPrice = 0;
            if (basePrice > 0) {
                finalPrice = basePrice * (1 - discountPercent / 100);
            }

            // РќР°РєРѕРїР»РµРЅРёРµ СЃС‚Р°С‚РёСЃС‚РёРєРё
            if (category === 'ADL') counts.adl++;
            if (category === 'CHLD') counts.chld++;
            if (category === 'INF') counts.inf++;
            if (category === 'SNR') counts.pens++;
            if (discountInfo.isBirthday) counts.bday++;

            totalSum += finalPrice;

            // РЎС‚СЂРѕРіР°СЏ РІР°Р»РёРґР°С†РёСЏ РІРІРµРґРµРЅРЅС‹С… Р»РµС‚/РґР°С‚ РґР»СЏ РїРѕРґСЃРІРµС‚РєРё РѕС€РёР±РѕРє
            let isDobInvalid = false;
            if (t.dob) {
                isDobInvalid = !validateFullDate(t.dob);
            } else if (t.year !== undefined) {
                isDobInvalid = !validateBirthYear(t.year);
            } else if (t.age !== undefined) {
                isDobInvalid = !validateAge(t.age);
            }

            // РЎС‚СЂРѕРєР° РґР»СЏ СЌРєСЃРїРѕСЂС‚Р° (РїРѕРґРіРѕС‚РѕРІРєР° РґР°РЅРЅС‹С…)
            if (t.fullName && (t.dob || t.age !== undefined || t.year !== undefined)) {
                let tags = [];
                if (discountInfo.isBirthday) tags.push(i18n.translate('bdayTag'));
                if (discountInfo.isPensioner) tags.push(i18n.translate('pensTag'));
                if (t.disability === '1') tags.push(`${i18n.translate('invTag')} 100%`);
                if (t.disability === '2') tags.push(`${i18n.translate('invTag')} 15%`);
                if (t.disability === '3') tags.push(`${i18n.translate('invTag')} 10%`);

                let formattedDob = '';
                if (t.dob) {
                    formattedDob = formatDate(t.dob);
                } else if (t.year !== undefined) {
                    formattedDob = i18n.currentLang === 'en' ? `${t.year} y.o.` : `${t.year} Рі.`;
                } else if (t.age !== undefined) {
                    formattedDob = i18n.currentLang === 'en' ? `${t.age} y.o.` : `${t.age} Р»РµС‚`;
                }

                exportDataList.push({
                    translitName: transliterate(t.fullName),
                    category: category,
                    formattedDob: formattedDob,
                    tags: tags,
                    gender: t.gender === 'female' ? 'F' : 'M',
                    isBirthday: discountInfo.isBirthday
                });
            }

            // Р”РёРЅР°РјРёС‡РµСЃРєРёР№ Р±РµР№РґР¶ СЃ РјРёРєСЂРѕ-Р°РЅРёРјР°С†РёРµР№ (СЃРІРµС‡РµРЅРёРµ)
            // Р”РёРЅР°РјРёС‡РµСЃРєРёР№ СЃС‚РёР»СЊ РґР»СЏ РІС‹РїР°РґР°СЋС‰РµРіРѕ СЃРїРёСЃРєР° С‚РёРїР° (Р±РµР№РґР¶)
            let catSelectClass = 'border-slate-200 text-slate-700 bg-white';
            if (category === 'ADL') catSelectClass = 'bg-blue-50 text-blue-600 border-blue-200';
            if (category === 'SNR') catSelectClass = 'bg-purple-50 text-purple-600 border-purple-200';
            if (category === 'CHLD') catSelectClass = 'bg-teal-50 text-teal-600 border-teal-200';
            if (category === 'INF') catSelectClass = 'bg-green-50 text-green-600 border-green-200';

            // РЎРѕР·РґР°РЅРёРµ DOM СЌР»РµРјРµРЅС‚Р° СЃС‚СЂРѕРєРё
            const row = document.createElement('div');
            row.className = 'tourist-row p-1.5 md:p-1 flex flex-col md:grid md:grid-cols-12 gap-1.5 md:gap-1 items-start md:items-center transition-all relative hover:bg-slate-50 animate-row-in';
            row.innerHTML = `
                <!-- Mobile Label: Delete Button -->
                <div class="absolute top-1.5 right-1.5 md:static md:col-span-1 md:w-full flex justify-end md:order-last">
                    <button onclick="removeTourist('${t.id}')" class="btn-danger p-0.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="${i18n.translate('deleteBtn')}">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
                
                <div class="w-full flex gap-2 pr-6 md:pr-0 md:contents">
                    <!-- Full Name -->
                    <div class="flex-1 md:col-span-4 w-full relative">
                        <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5 block">${i18n.translate('tableHeaderName')}</label>
                        <input type="text" placeholder="${i18n.translate('tableHeaderName')}" value="${t.fullName}" 
                            onblur="updateTourist('${t.id}', 'fullName', this.value)"
                            class="w-full text-left bg-transparent text-slate-800 border ${!t.fullName ? 'border-red-300 bg-red-50/40' : 'border-transparent'} hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-2 py-1 text-xs font-medium transition-colors ${discountInfo.isBirthday ? 'pr-7' : ''}">
                        ${discountInfo.isBirthday ? `<div class="absolute right-2 top-[calc(50%+4px)] md:top-1/2 -translate-y-1/2 text-amber-500 text-[10px]" title="${i18n.translate('statBoxBday')}"><i class="fa-solid fa-cake-candles"></i></div>` : ''}
                    </div>
                    
                    <!-- DOB -->
                    <!-- DOB -->
                    <div class="w-[100px] shrink-0 md:w-full md:col-span-2">
                        <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5 block">${i18n.translate('tableHeaderDob')}</label>
                        <input type="text" value="${displayDob}" 
                            placeholder="${i18n.translate('dobPlaceholder')}"
                            onblur="updateTouristDobDirect('${t.id}', this.value)"
                            class="w-full text-left bg-transparent text-slate-800 border ${isDobInvalid ? 'border-red-500 bg-red-50' : ((!t.dob && t.age === undefined && t.year === undefined) ? 'border-red-300 bg-red-50/40' : 'border-transparent')} hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-0.5 py-1 text-xs font-medium transition-colors">
                    </div>
                </div>
                
                <!-- Stats Row (Age, Category, Price) -->
                <div class="col-span-12 w-full flex justify-between items-center mt-1 md:mt-0 md:contents border-t border-slate-100 md:border-0 pt-1.5 md:pt-0">
                    <div class="flex space-x-6 md:contents">
                        <!-- Age -->
                        <div class="md:col-span-1 text-left md:text-center flex flex-col items-start md:items-center">
                            <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5">${i18n.translate('tableHeaderAge')}</label>
                            <span class="text-xs font-bold ${age === null ? 'text-slate-400' : 'text-[#0076ba]'}">
                                ${age !== null ? age : '-'}
                            </span>
                        </div>
                        
                        <!-- Category -->
                        <div class="md:col-span-2 text-left md:text-center flex flex-col items-start md:items-center w-full md:w-auto">
                            <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5">${i18n.translate('tableHeaderType')}</label>
                            <select onchange="updateTouristCategory('${t.id}', this.value)"
                                class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${catSelectClass} focus:outline-none transition-all duration-300 cursor-pointer text-center w-full md:w-auto">
                                <option value="ADL" ${category === 'ADL' ? 'selected' : ''}>ADL</option>
                                <option value="CHLD" ${category === 'CHLD' ? 'selected' : ''}>CHLD</option>
                                <option value="INF" ${category === 'INF' ? 'selected' : ''}>INF</option>
                                <option value="SNR" ${category === 'SNR' ? 'selected' : ''}>SNR</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Price -->
                    <div class="md:col-span-2 text-right flex flex-col items-end justify-center pr-2">
                        ${discountPercent > 0 ? `<span class="badge-discount text-[8px] px-1.5 py-0.5 rounded-full mb-0.5 leading-none font-bold">-${discountPercent}%</span>` : ''}
                        <span class="text-xs font-bold ${finalPrice > 0 ? 'text-slate-900' : 'text-slate-400'}">
                            ${basePrice === -1 ? i18n.translate('noTariff') : Math.round(finalPrice).toLocaleString('ru-RU') + ' в‚ё'}
                        </span>
                    </div>
                </div>
            `;
            
            touristListEl.appendChild(row);
        });

        // РћР±РЅРѕРІР»РµРЅРёРµ РёС‚РѕРіРѕРІ
        totalPriceEl.textContent = Math.round(totalSum).toLocaleString('ru-RU');
        
        if (!isTariffFound) {
            dateWarning.classList.remove('hidden');
        } else {
            dateWarning.classList.add('hidden');
        }

        // РћР±РЅРѕРІР»РµРЅРёРµ СЃС‚Р°С‚РёСЃС‚РёРєРё
        stats.adl.textContent = counts.adl;
        stats.chld.textContent = counts.chld;
        stats.inf.textContent = counts.inf;
        stats.pens.textContent = counts.pens;
        stats.bday.textContent = counts.bday;

        let exportText = `${i18n.translate('dateHeaderExport')}: ${visitDate ? formatDate(visitDate) : i18n.translate('emptyTextExport')}\n`;
        exportText += `${i18n.translate('tariffHeaderExport')}: ${tariffType === 'evening' ? i18n.translate('eveningTariff') : i18n.translate('dayTariff')}\n\n`;

        if (currentCalcMode === 'quick') {
            exportText += `${i18n.translate('compositionGuestsExport')}:\n`;
            let hasQuickGuests = false;
            if (quickCounts.adl > 0) { exportText += `${i18n.translate('statAdl')}: ${quickCounts.adl}\n`; hasQuickGuests = true; }
            if (quickCounts.chld > 0) { exportText += `${i18n.translate('statChld')}: ${quickCounts.chld}\n`; hasQuickGuests = true; }
            if (quickCounts.pens > 0) { exportText += `${i18n.translate('statPens')}: ${quickCounts.pens}\n`; hasQuickGuests = true; }
            if (quickCounts.inf > 0) { exportText += `${i18n.translate('statInf')}: ${quickCounts.inf}\n`; hasQuickGuests = true; }
            if (!hasQuickGuests) {
                exportText += `${i18n.translate('emptyTextExport')}\n`;
            }
        } else {
            // РЎРѕСЂС‚РёСЂСѓРµРј: Сѓ РєРѕРіРѕ Р”Р  - РІ СЃР°РјС‹Р№ РєРѕРЅРµС† СЃРїРёСЃРєР°
            exportDataList.sort((a, b) => {
                if (a.isBirthday && !b.isBirthday) return 1;
                if (!a.isBirthday && b.isBirthday) return -1;
                return 0;
            });

            // Р¤РѕСЂРјРёСЂСѓРµРј С„РёРЅР°Р»СЊРЅС‹Рµ СЃС‚СЂРѕРєРё
            let exportLines = exportDataList.map((item) => {
                const tagsStr = item.tags.length > 0 ? ` (${item.tags.join(', ')})` : '';
                return `${item.translitName.toUpperCase()} ${item.formattedDob}${tagsStr} ${item.category}`;
            });

            exportText += `${i18n.translate('listGuestsExport')}:\n`;
            exportText += exportLines.length > 0 ? exportLines.join('\n') : i18n.translate('emptyTextExport');
        }

        // Р­РєСЃРїРѕСЂС‚ РґР°РЅРЅС‹С…
        exportDataEl.value = exportText;
        exportDataEl.style.height = 'auto';
        exportDataEl.style.height = exportDataEl.scrollHeight + 'px';

        // РђРІС‚Рѕ-СЃРѕС…СЂР°РЅРµРЅРёРµ
        saveDraft();

        // Р”Р»СЏ РґРѕСЃС‚СѓРїР° РёР· HTML
        window.updateTourist = updateTourist;
        window.removeTourist = removeTourist;
        window.updateTouristDobDirect = updateTouristDobDirect;
        window.updateTouristCategory = updateTouristCategory;
    }

    function saveDraft() {
        const data = {
            visitDate: visitDateInput ? visitDateInput.value : '',
            clientType: clientTypeInput ? clientTypeInput.value : 'tourist',
            tariffType: tariffTypeInput ? tariffTypeInput.value : 'day',
            tourists: tourists,
            currentCalcMode: currentCalcMode,
            quickCounts: quickCounts
        };
        localStorage.setItem('tetisBluDraft', JSON.stringify(data));
    }

    function syncDetailedToQuick() {
        let counts = { adl: 0, chld: 0, pens: 0, inf: 0 };
        const visitDate = visitDateInput ? visitDateInput.value : '';
        tourists.forEach(t => {
            let age = null;
            if (t.age !== undefined) {
                age = t.age;
            } else if (t.year !== undefined) {
                const visitYear = visitDate ? new Date(visitDate).getFullYear() : new Date().getFullYear();
                age = visitYear - t.year;
            } else {
                age = calculateAge(t.dob, visitDate);
            }
            const category = getPassengerCategory(age, t.gender, visitDate);
            if (category === 'ADL') counts.adl++;
            if (category === 'CHLD') counts.chld++;
            if (category === 'SNR') counts.pens++;
            if (category === 'INF') counts.inf++;
        });
        quickCounts = counts;
        updateQuickInputsDOM();
    }

    function syncQuickToDetailed() {
        tourists = [];
        const today = new Date();
        const visitDateStr = visitDateInput ? visitDateInput.value : '';
        const visitYear = visitDateStr ? new Date(visitDateStr).getFullYear() : today.getFullYear();
        
        // Add Adults (age 25)
        for (let i = 0; i < quickCounts.adl; i++) {
            tourists.push({
                id: createId(),
                fullName: `Р“РѕСЃС‚СЊ ${tourists.length + 1}`,
                dob: `${visitYear - 25}-06-15`,
                gender: 'male',
                genderManuallySet: false,
                disability: 'none'
            });
        }
        // Add Children (age 8)
        for (let i = 0; i < quickCounts.chld; i++) {
            tourists.push({
                id: createId(),
                fullName: `Р“РѕСЃС‚СЊ ${tourists.length + 1}`,
                dob: `${visitYear - 8}-06-15`,
                gender: 'male',
                genderManuallySet: false,
                disability: 'none'
            });
        }
        // Add Pensioners (age 65)
        for (let i = 0; i < quickCounts.pens; i++) {
            tourists.push({
                id: createId(),
                fullName: `Р“РѕСЃС‚СЊ ${tourists.length + 1}`,
                dob: `${visitYear - 65}-06-15`,
                gender: 'male',
                genderManuallySet: false,
                disability: 'none'
            });
        }
        // Add Infants (age 1)
        for (let i = 0; i < quickCounts.inf; i++) {
            tourists.push({
                id: createId(),
                fullName: `Р“РѕСЃС‚СЊ ${tourists.length + 1}`,
                dob: `${visitYear - 1}-06-15`,
                gender: 'male',
                genderManuallySet: false,
                disability: 'none'
            });
        }
    }

    function updateQuickInputsDOM() {
        const adlEl = document.getElementById('quick_adl');
        const chldEl = document.getElementById('quick_chld');
        const pensEl = document.getElementById('quick_pens');
        const infEl = document.getElementById('quick_inf');
        if (adlEl) adlEl.value = quickCounts.adl;
        if (chldEl) chldEl.value = quickCounts.chld;
        if (pensEl) pensEl.value = quickCounts.pens;
        if (infEl) infEl.value = quickCounts.inf;
    }

    function switchCalcMode(mode) {
        currentCalcMode = mode;
        const tabDetailed = document.getElementById('tabDetailed');
        const tabQuick = document.getElementById('tabQuick');
        const detailedModeContainer = document.getElementById('detailedModeContainer');
        const quickModeContainer = document.getElementById('quickModeContainer');
        const detailedActionButtons = document.getElementById('detailedActionButtons');
        const resetQuickBtn = document.getElementById('resetQuickBtn');
        const emptyState = document.getElementById('emptyState');
        
        if (!tabDetailed || !tabQuick) return;

        if (mode === 'detailed') {
            tabDetailed.classList.add('border-blue-500', 'text-blue-600');
            tabDetailed.classList.remove('border-transparent', 'text-slate-400');
            tabQuick.classList.add('border-transparent', 'text-slate-400');
            tabQuick.classList.remove('border-blue-500', 'text-blue-600');
            
            detailedModeContainer.classList.remove('hidden');
            quickModeContainer.classList.add('hidden');
            detailedActionButtons.classList.remove('hidden');
            resetQuickBtn.classList.add('hidden');
            
            if (tourists.length === 0 && (quickCounts.adl > 0 || quickCounts.chld > 0 || quickCounts.pens > 0 || quickCounts.inf > 0)) {
                syncQuickToDetailed();
            }
        } else {
            tabQuick.classList.add('border-blue-500', 'text-blue-600');
            tabQuick.classList.remove('border-transparent', 'text-slate-400');
            tabDetailed.classList.add('border-transparent', 'text-slate-400');
            tabDetailed.classList.remove('border-blue-500', 'text-blue-600');
            
            detailedModeContainer.classList.add('hidden');
            quickModeContainer.classList.remove('hidden');
            detailedActionButtons.classList.add('hidden');
            resetQuickBtn.classList.remove('hidden');
            emptyState.classList.add('hidden');
            
            if (quickCounts.adl === 0 && quickCounts.chld === 0 && quickCounts.pens === 0 && quickCounts.inf === 0) {
                syncDetailedToQuick();
            }
        }
        
        render();
    }

    function changeQuickCount(category, delta) {
        quickCounts[category] = Math.max(0, quickCounts[category] + delta);
        updateQuickInputsDOM();
        syncQuickToDetailed();
        render();
    }

    function updateQuickCount(category, val) {
        quickCounts[category] = Math.max(0, parseInt(val) || 0);
        updateQuickInputsDOM();
        syncQuickToDetailed();
        render();
    }

    function resetQuickCounts() {
        quickCounts = { adl: 0, chld: 0, pens: 0, inf: 0 };
        updateQuickInputsDOM();
        syncQuickToDetailed();
        render();
    }

    window.switchCalcMode = switchCalcMode;
    window.changeQuickCount = changeQuickCount;
    window.updateQuickCount = updateQuickCount;
    window.resetQuickCounts = resetQuickCounts;

    function copyExportData() {
        if (!exportDataEl.value) return;
        
        navigator.clipboard.writeText(exportDataEl.value).then(() => {
            const originalHTML = copyExportBtn.innerHTML;
            copyExportBtn.innerHTML = '<i class="fa-solid fa-check mr-1.5"></i> ' + i18n.translate('copiedToast');
            copyExportBtn.classList.add('bg-emerald-600', 'text-white');
            copyExportBtn.classList.remove('bg-blue-50', 'text-brand-blue');
            
            setTimeout(() => {
                copyExportBtn.innerHTML = originalHTML;
                copyExportBtn.classList.remove('bg-emerald-600', 'text-white');
                copyExportBtn.classList.add('bg-blue-50', 'text-brand-blue');
            }, 2000);
        });
    }

    if (copyExportBtn) {
        copyExportBtn.addEventListener('click', copyExportData);
    }

    // --- Р›РћР“РРљРђ Р”РќРЇ Р РћР–Р”Р•РќРРЇ ---
    // --- Р›РћР“РРљРђ Р“Р•РќР•Р РђР¦РР Р§Р•РљРђ РљРђР РўРРќРљРћР™ ---
    const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', generateReceiptImage);
    }
    
    // --- Р›РћР“РРљРђ РћРўРџР РђР’РљР (SHARE / WHATSAPP) ---
    const whatsappBtn = document.getElementById('whatsappBtn');
    
    // Р­Р»РµРјРµРЅС‚С‹ РјРѕРґР°Р»РєРё С€Р°СЂРёРЅРіР°
    const shareModal = document.getElementById('shareModal');
    const shareModalContent = document.getElementById('shareModalContent');
    const closeShareBtn = document.getElementById('closeShareBtn');
    const sharePreviewImg = document.getElementById('sharePreviewImg');
    const finalShareBtn = document.getElementById('finalShareBtn');
    let currentShareData = null;

    if (closeShareBtn) {
        closeShareBtn.addEventListener('click', closeShareModal);
    }
    
    function closeShareModal() {
        if (!shareModal) return;
        shareModal.classList.add('opacity-0');
        shareModalContent.classList.remove('scale-100');
        shareModalContent.classList.add('scale-95');
        setTimeout(() => shareModal.classList.add('hidden'), 300);
    }

    if (finalShareBtn) {
        finalShareBtn.addEventListener('click', async () => {
            if (!currentShareData) return;
            try {
                if (navigator.canShare && navigator.canShare(currentShareData)) {
                    await navigator.share(currentShareData);
                } else {
                    await navigator.share(currentShareData);
                }
                closeShareModal();
            } catch (err) {
                console.error('РћС€РёР±РєР° РЅР°С‚РёРІРЅРѕРіРѕ С€Р°СЂРёРЅРіР°', err);
                if (err.name !== 'AbortError') sendTextToWhatsApp(true);
            }
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', async () => {
            saveToHistory(); // РЎРѕС…СЂР°РЅСЏРµРј РїРµСЂРµРґ РѕС‚РїСЂР°РІРєРѕР№
            const originalHtml = whatsappBtn.innerHTML;
            whatsappBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> ' + (i18n.currentLang === 'en' ? 'Preparing...' : 'РџРѕРґРіРѕС‚РѕРІРєР°...');
            
            try {
                if (navigator.share) {
                    const result = await generateImageForShare();
                    currentShareData = result.shareData;
                    sharePreviewImg.src = result.dataUrl;
                    
                    // РџРѕРєР°Р·С‹РІР°РµРј РјРѕРґР°Р»РєСѓ РїСЂРµРґРїСЂРѕСЃРјРѕС‚СЂР°
                    if (shareModal) {
                        shareModal.classList.remove('hidden');
                        setTimeout(() => {
                            shareModal.classList.remove('opacity-0');
                            shareModalContent.classList.remove('scale-95');
                            shareModalContent.classList.add('scale-100');
                        }, 10);
                    } else {
                        // Р¤РѕР»Р±СЌРє, РµСЃР»Рё РјРѕРґР°Р»РєР° РїРѕС‡РµРјСѓ-С‚Рѕ РЅРµ РЅР°Р№РґРµРЅР°
                        await navigator.share(currentShareData);
                    }
                } else {
                    sendTextToWhatsApp();
                }
            } catch (err) {
                console.error('РћС€РёР±РєР° РїСЂРё РїРѕРґРіРѕС‚РѕРІРєРµ С‡РµРєР°', err);
                sendTextToWhatsApp(true);
            } finally {
                whatsappBtn.innerHTML = originalHtml;
            }
        });
    }

    function sendTextToWhatsApp(useLocation = false) {
        const text = exportDataEl.value;
        if (!text) return;
        const waText = `*РћС„РёС†РёР°Р»СЊРЅС‹Р№ СЂР°СЃС‡РµС‚ Tetys Blu*\n\n${text}`;
        const url = `https://wa.me/?text=${encodeURIComponent(waText)}`;
        if (useLocation) {
            window.location.href = url;
        } else {
            window.open(url, '_blank');
        }
    }

    async function generateImageForShare() {
        return new Promise((resolve, reject) => {
            const container = document.getElementById('receiptContainer');
            const content = document.getElementById('receiptContent');
            
            fillReceiptData();
            
            // Р’СЂРµРјРµРЅРЅРѕ РґРѕСЃС‚Р°РµРј Р±Р»РѕРє РґР»СЏ СЂРµРЅРґРµСЂР°
            content.classList.remove('opacity-0', 'pointer-events-none');
            document.body.appendChild(content); 
            content.style.position = 'fixed';
            content.style.top = '0';
            content.style.left = '0';
            content.style.zIndex = '-9999';
            
            html2canvas(content, { scale: 2, backgroundColor: '#ffffff', logging: false }).then(canvas => {
                // Р’РѕР·РІСЂР°С‰Р°РµРј СЌР»РµРјРµРЅС‚ РЅР° РјРµСЃС‚Рѕ
                content.style.position = '';
                content.style.top = '';
                content.style.left = '';
                content.style.zIndex = '';
                content.classList.add('opacity-0', 'pointer-events-none');
                container.appendChild(content);
                
                const dataUrl = canvas.toDataURL('image/png');
                
                canvas.toBlob(async (blob) => {
                    if (!blob) return reject(new Error('РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕР·РґР°С‚СЊ blob'));
                    
                    const formattedDate = visitDateInput ? visitDateInput.value : 'date';
                    const file = new File([blob], `TetysBlu_Check_${formattedDate}.png`, { type: 'image/png' });
                    
                    // Р’РђР–РќРћ: Р”Р»СЏ iOS Safari РјС‹ РїРµСЂРµРґР°РµРј РўРћР›Р¬РљРћ С„Р°Р№Р». 
                    const shareData = {
                        files: [file]
                    };
                    
                    resolve({ shareData, dataUrl });
                }, 'image/png');
            }).catch(err => {
                // Р’РѕР·РІСЂР°С‚ СЌР»РµРјРµРЅС‚Р° РЅР° РјРµСЃС‚Рѕ РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё
                content.style.position = '';
                content.style.top = '';
                content.style.left = '';
                content.classList.add('opacity-0', 'pointer-events-none');
                container.appendChild(content);
                reject(err);
            });
        });
    }

    function fillReceiptData() {
        const metaEl = document.getElementById('receiptMeta');
        const touristsEl = document.getElementById('receiptTourists');
        
        const dateParts = visitDateInput ? visitDateInput.value.split('-') : [];
        const visitDateStr = visitDateInput ? visitDateInput.value : '';
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}` : visitDateStr;
        const clientType = clientTypeInput ? clientTypeInput.value : 'tourist';
        const tariffType = tariffTypeInput ? tariffTypeInput.value : 'day';
        
        const clientText = clientType === 'agent' ? i18n.translate('agentClient') : i18n.translate('touristClient');
        const tariffText = tariffType === 'evening' ? i18n.translate('eveningTariff') : i18n.translate('dayTariff');
        
        metaEl.innerHTML = `
            <div class="flex justify-between items-center"><span class="text-[#0076ba]">${i18n.translate('visitDate')}:</span> <span class="font-bold text-[#1e293b]">${formattedDate}</span></div>
            <div class="flex justify-between items-center"><span class="text-[#0076ba]">${i18n.translate('clientTypeText')}:</span> <span class="font-bold text-[#1e293b]">${clientText}</span></div>
            <div class="flex justify-between items-center"><span class="text-[#0076ba]">${i18n.translate('tariffCategory')}:</span> <span class="font-bold text-[#1e293b]">${tariffText}</span></div>
        `;
        
        touristsEl.innerHTML = '';
        if (currentCalcMode === 'quick') {
            let listHtml = '';
            if (quickCounts.adl > 0) {
                listHtml += `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-[#1e293b] text-[15px]">${i18n.translate('statAdl').toUpperCase()}: ${quickCounts.adl}</div></div>`;
            }
            if (quickCounts.chld > 0) {
                listHtml += `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-[#1e293b] text-[15px]">${i18n.translate('statChld').toUpperCase()}: ${quickCounts.chld}</div></div>`;
            }
            if (quickCounts.pens > 0) {
                listHtml += `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-[#1e293b] text-[15px]">${i18n.translate('statPens').toUpperCase()}: ${quickCounts.pens}</div></div>`;
            }
            if (quickCounts.inf > 0) {
                listHtml += `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-[#1e293b] text-[15px]">${i18n.translate('statInf').toUpperCase()}: ${quickCounts.inf}</div></div>`;
            }
            if (!listHtml) {
                listHtml = `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-slate-400 text-[15px]">${i18n.translate('historyEmpty').toUpperCase()}</div></div>`;
            }
            touristsEl.innerHTML = listHtml;
        } else {
            tourists.forEach((t, i) => {
                if (!t.fullName && !t.dob && t.age === undefined && t.year === undefined) return; // РџСЂРѕРїСѓСЃРє РїСѓСЃС‚С‹С… СЃС‚СЂРѕРє
                
                // Р Р°СЃСЃС‡РёС‚С‹РІР°РµРј РІРѕР·СЂР°СЃС‚
                let age = null;
                if (t.age !== undefined) {
                    age = t.age;
                } else if (t.year !== undefined) {
                    const visitYear = visitDateStr ? new Date(visitDateStr).getFullYear() : new Date().getFullYear();
                    age = visitYear - t.year;
                } else {
                    age = calculateAge(t.dob, visitDateStr);
                }

                let category = t.category;
                if (!t.categoryManuallySet || !category) {
                    category = getPassengerCategory(age, t.gender, visitDateStr);
                }

                const basePrice = getBasePrice(visitDateStr, clientType, tariffType, category);
                const discountInfo = calculateDiscount(t.dob, visitDateStr, t.disability, age, t.gender);
                let discountPercent = discountInfo.percent || 0;
                
                const today = new Date();
                const vDate = visitDateStr ? new Date(visitDateStr) : null;
                const earlyBookingEnabled = vDate && ((vDate.getFullYear() > today.getFullYear()) || (vDate.getFullYear() === today.getFullYear() && vDate.getMonth() > today.getMonth()));
                if (earlyBookingEnabled && discountPercent < 100 && age >= 4) {
                    discountPercent = Math.max(discountPercent, CONFIG.discounts.earlyBooking);
                }
                
                let finalPrice = 0;
                if (basePrice > 0) {
                    finalPrice = basePrice * (1 - discountPercent / 100);
                }

                // Р¤РѕСЂРјР°С‚РёСЂСѓРµРј Р”Р /РІРѕР·СЂР°СЃС‚/РіРѕРґ
                let formattedDob = '';
                if (t.dob) {
                    formattedDob = formatDate(t.dob);
                } else if (t.year !== undefined) {
                    formattedDob = i18n.currentLang === 'en' ? `${t.year} y.o.` : `${t.year} Рі.`;
                } else if (t.age !== undefined) {
                    formattedDob = i18n.currentLang === 'en' ? `${t.age} y.o.` : `${t.age} Р»РµС‚`;
                }

                const priceStr = basePrice === -1 ? i18n.translate('noTariff') : `${Math.round(finalPrice).toLocaleString('ru-RU')} в‚ё`;

                touristsEl.innerHTML += `
                    <div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3">
                        <div class="flex-1 pr-4">
                            <div class="font-bold text-[#1e293b] text-[15px] leading-relaxed break-words">
                                ${(t.fullName || i18n.translate('guestNameDefault') + ' ' + (i+1)).toUpperCase()} 
                                ${formattedDob ? '- ' + formattedDob : ''} 
                                <span class="text-xs text-slate-500 font-medium ml-1">(${category})</span>
                            </div>
                        </div>
                        <div class="text-right font-bold text-[#0076ba] text-[15px] shrink-0">
                            ${priceStr}
                        </div>
                    </div>
                `;
            });
        }
        
        const receiptTotalValue = document.getElementById('receiptTotalValue');
        if (receiptTotalValue && totalPriceEl) {
            receiptTotalValue.textContent = totalPriceEl.textContent;
        }
    }                       </div>
                    </div>
                `;
            });
        }
        
        const receiptTotalValue = document.getElementById('receiptTotalValue');
        if (receiptTotalValue && totalPriceEl) {
            receiptTotalValue.textContent = totalPriceEl.textContent;
        }

    function generateReceiptImage() {
        saveToHistory(); // РЎРѕС…СЂР°РЅСЏРµРј РїРµСЂРµРґ РіРµРЅРµСЂР°С†РёРµР№ С‡РµРєР°
        const container = document.getElementById('receiptContainer');
        const content = document.getElementById('receiptContent');
        const formattedDate = visitDateInput ? visitDateInput.value : 'date';
        
        // РЎР±РѕСЂ РґР°РЅРЅС‹С… РІС‹РЅРµСЃРµРЅ РІ РѕС‚РґРµР»СЊРЅСѓСЋ С„СѓРЅРєС†РёСЋ, С‡С‚РѕР±С‹ РїРµСЂРµРёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РІ share
        fillReceiptData();
        
        // Р’СЂРµРјРµРЅРЅРѕ РґРѕСЃС‚Р°РµРј Р±Р»РѕРє РґР»СЏ СЂРµРЅРґРµСЂР°
        content.classList.remove('opacity-0', 'pointer-events-none');
        document.body.appendChild(content); 
        content.style.position = 'fixed';
        content.style.top = '0';
        content.style.left = '0';
        content.style.zIndex = '-9999';
        
        const originalBtnHtml = downloadReceiptBtn.innerHTML;
        downloadReceiptBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> РЎРѕР·РґР°РЅРёРµ...';
        
        html2canvas(content, { 
            scale: 2, 
            backgroundColor: '#ffffff'
        }).then(canvas => {
            content.style.position = '';
            content.style.top = '';
            content.style.left = '';
            content.style.zIndex = '';
            content.classList.add('opacity-0', 'pointer-events-none');
            container.appendChild(content);
            
            const link = document.createElement('a');
            link.download = `TetysBlu_Check_${formattedDate}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            downloadReceiptBtn.innerHTML = originalBtnHtml;
            window.showToast('Р§РµРє СѓСЃРїРµС€РЅРѕ СЃРѕС…СЂР°РЅРµРЅ!', 'fa-circle-check');
        }).catch(err => {
            console.error('РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ С‡РµРєР°', err);
            downloadReceiptBtn.innerHTML = originalBtnHtml;
            window.showToast('РћС€РёР±РєР° РїСЂРё СЃРѕР·РґР°РЅРёРё С‡РµРєР°', 'fa-triangle-exclamation', 'bg-red-500');
            
            // Р’РѕР·РІСЂР°С‚ СЌР»РµРјРµРЅС‚Р° РЅР° РјРµСЃС‚Рѕ РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё
            content.style.position = '';
            content.style.top = '';
            content.style.left = '';
            content.classList.add('opacity-0', 'pointer-events-none');
            container.appendChild(content);
        });
    }

    // --- TOAST NOTIFICATIONS ---
    window.showToast = function(message, icon = 'fa-check', bgClass = 'bg-[#1ebd5a]') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${bgClass} text-white px-5 py-3 rounded-2xl shadow-xl flex items-center font-bold text-sm`;
        toast.innerHTML = `<i class="fa-solid ${icon} mr-2.5 text-lg"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => { 
            if (toast.parentNode) toast.parentNode.removeChild(toast); 
        }, 3000);
    };

    // --- РРЎРўРћР РРЇ Р РђРЎР§Р•РўРћР’ ---
    const historyBtn = document.getElementById('historyBtn');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyModal = document.getElementById('historyModal');
    const historyModalContent = document.getElementById('historyModalContent');
    const historyList = document.getElementById('historyList');

    function saveToHistory() {
        if (tourists.length === 0 || (!tourists[0].fullName && !tourists[0].dob)) return;
        const total = parseInt(totalPriceEl.textContent.replace(/\D/g, '')) || 0;
        
        const record = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            visitDate: visitDateInput ? visitDateInput.value : '',
            clientType: clientTypeInput ? clientTypeInput.value : 'tourist',
            tariffType: tariffTypeInput ? tariffTypeInput.value : 'day',
            totalSum: total,
            tourists: JSON.parse(JSON.stringify(tourists))
        };
        
        let history = JSON.parse(localStorage.getItem('tetysBluHistory') || '[]');
        if (history.length > 0) {
            const last = history[0];
            if (JSON.stringify(last.tourists) === JSON.stringify(record.tourists) && last.visitDate === record.visitDate) {
                return; // РџСЂРѕРїСѓСЃРє РґСѓР±Р»РёРєР°С‚Р°
            }
        }
        
        history.unshift(record);
        if (history.length > 20) history = history.slice(0, 20); // РҐСЂР°РЅРёРј С‚РѕР»СЊРєРѕ 20 РїРѕСЃР»РµРґРЅРёС…
        localStorage.setItem('tetysBluHistory', JSON.stringify(history));
    }

    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            renderHistory();
            historyModal.classList.remove('hidden');
            setTimeout(() => {
                historyModal.classList.remove('opacity-0');
                historyModalContent.classList.remove('translate-x-full');
            }, 10);
        });
    }
    
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => {
            historyModal.classList.add('opacity-0');
            historyModalContent.classList.add('translate-x-full');
            setTimeout(() => {
                historyModal.classList.add('hidden');
            }, 300);
        });
    }

    function renderHistory() {
        if (!historyList) return;
        const history = JSON.parse(localStorage.getItem('tetysBluHistory') || '[]');
        if (history.length === 0) {
            historyList.innerHTML = '<div class="text-center text-slate-400 py-10"><i class="fa-solid fa-folder-open text-3xl mb-3 opacity-50"></i><p class="text-sm font-semibold">РђСЂС…РёРІ РїСѓСЃС‚</p></div>';
            return;
        }
        
        historyList.innerHTML = '';
        history.forEach(item => {
            const date = new Date(item.timestamp);
            const timeStr = `${date.getDate().toString().padStart(2,'0')}.${(date.getMonth()+1).toString().padStart(2,'0')} РІ ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
            
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-2 relative';
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-slate-400 uppercase">${timeStr}</span>
                    <span class="text-xs font-black text-[#1e293b]">${item.totalSum.toLocaleString('ru-RU')} в‚ё</span>
                </div>
                <div class="text-sm font-bold text-slate-800">Р“РѕСЃС‚РµР№: ${item.tourists.length}</div>
                <div class="text-[11px] font-semibold text-slate-500">Р’РёР·РёС‚: ${item.visitDate} вЂў ${item.clientType === 'agent' ? 'РўСѓСЂР°РіРµРЅС‚' : 'РўСѓСЂРёСЃС‚'}</div>
                <button class="mt-2 w-full bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white py-2 rounded-xl text-xs font-bold transition-colors">
                    <i class="fa-solid fa-download mr-1.5"></i>Р—Р°РіСЂСѓР·РёС‚СЊ СЂР°СЃС‡РµС‚
                </button>
            `;
            
            const loadBtn = card.querySelector('button');
            loadBtn.addEventListener('click', () => {
                if (visitDateInput) visitDateInput.value = item.visitDate;
                if (clientTypeInput) clientTypeInput.value = item.clientType;
                if (tariffTypeInput) tariffTypeInput.value = item.tariffType;
                tourists = item.tourists;
                render();
                window.showToast('Р Р°СЃС‡РµС‚ СѓСЃРїРµС€РЅРѕ Р·Р°РіСЂСѓР¶РµРЅ', 'fa-folder-open', 'bg-brand-blue');
                closeHistoryBtn.click();
            });
            
            historyList.appendChild(card);
        });
    }

    // --- FILE IMPORT / EXPORT HANDLERS ---
    function exportGuests(format) {
        if (tourists.length === 0) {
            window.showToast(i18n.translate('emptyListExportError'), 'fa-triangle-exclamation', 'bg-red-500');
            return;
        }
        
        let content = '';
        let filename = `guests_export_${visitDateInput ? visitDateInput.value : 'date'}`;
        let mimeType = 'text/plain';

        if (format === 'csv') {
            filename += '.csv';
            mimeType = 'text/csv;charset=utf-8;';
            // CSV header
            content += 'Full Name,Date of Birth,Category,Gender,Disability\n';
            tourists.forEach(t => {
                let dobVal = t.dob || '';
                if (!dobVal && t.year !== undefined) dobVal = t.year;
                if (!dobVal && t.age !== undefined) dobVal = `${t.age} y.o.`;
                
                let nameEscaped = t.fullName.replace(/"/g, '""');
                content += `"${nameEscaped}","${dobVal}","${t.category || ''}","${t.gender || ''}","${t.disability || 'none'}"\n`;
            });
        } else {
            filename += '.txt';
            tourists.forEach((t, index) => {
                let dobVal = t.dob || '';
                if (!dobVal && t.year !== undefined) dobVal = t.year;
                if (!dobVal && t.age !== undefined) dobVal = `${t.age} y.o.`;
                content += `${t.fullName || 'Guest'} | ${dobVal} | ${t.category || ''} | ${t.gender || ''} | ${t.disability || 'none'}\n`;
            });
        }

        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        window.showToast(i18n.translate('exportSuccess'), 'fa-circle-check');
    }
    window.exportGuests = exportGuests;

    function handleImportFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(evt) {
            const fileContent = evt.target.result;
            const extension = file.name.split('.').pop().toLowerCase();
            
            let importedTourists = [];
            
            if (extension === 'csv') {
                const lines = fileContent.split('\n');
                if (lines.length > 1) {
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;
                        
                        const cells = [];
                        let currentCell = '';
                        let inQuotes = false;
                        for (let j = 0; j < line.length; j++) {
                            const char = line[j];
                            if (char === '"') {
                                inQuotes = !inQuotes;
                            } else if (char === ',' && !inQuotes) {
                                cells.push(currentCell.trim().replace(/^["']|["']$/g, ''));
                                currentCell = '';
                            } else {
                                currentCell += char;
                            }
                        }
                        cells.push(currentCell.trim().replace(/^["']|["']$/g, ''));
                        
                        if (cells.length > 0 && cells[0]) {
                            const name = cells[0] || '';
                            const dobRaw = cells[1] || '';
                            const cat = cells[2] || '';
                            const gen = cells[3] || 'male';
                            const dis = cells[4] || 'none';
                            
                            let dob = '';
                            let age = undefined;
                            let year = undefined;
                            
                            if (dobRaw.includes('y.o.')) {
                                age = parseInt(dobRaw) || undefined;
                            } else if (dobRaw.length === 4 && !isNaN(dobRaw)) {
                                year = parseInt(dobRaw) || undefined;
                            } else {
                                dob = dobRaw;
                            }
                            
                            importedTourists.push({
                                id: createId(),
                                fullName: name,
                                dob: dob,
                                gender: gen,
                                genderManuallySet: true,
                                disability: dis,
                                category: cat,
                                categoryManuallySet: !!cat,
                                age: age,
                                year: year
                            });
                        }
                    }
                }
            } else {
                const lines = fileContent.split('\n');
                lines.forEach(line => {
                    line = line.trim();
                    if (!line) return;
                    
                    if (line.includes('|')) {
                        const parts = line.split('|').map(p => p.trim());
                        const name = parts[0] || '';
                        const dobRaw = parts[1] || '';
                        const cat = parts[2] || '';
                        const gen = parts[3] || 'male';
                        const dis = parts[4] || 'none';
                        
                        let dob = '';
                        let age = undefined;
                        let year = undefined;
                        
                        if (dobRaw.includes('y.o.')) {
                            age = parseInt(dobRaw) || undefined;
                        } else if (dobRaw.length === 4 && !isNaN(dobRaw)) {
                            year = parseInt(dobRaw) || undefined;
                        } else {
                            dob = dobRaw;
                        }
                        
                        importedTourists.push({
                            id: createId(),
                            fullName: name,
                            dob: dob,
                            gender: gen,
                            genderManuallySet: true,
                            disability: dis,
                            category: cat,
                            categoryManuallySet: !!cat,
                            age: age,
                            year: year
                        });
                    } else {
                        const parsed = parseLineForBulk(line);
                        if (parsed) {
                            importedTourists.push(parsed);
                        }
                    }
                });
            }
            
            if (importedTourists.length > 0) {
                if (tourists.length === 1 && !tourists[0].fullName && !tourists[0].dob) {
                    tourists = importedTourists;
                } else {
                    tourists = tourists.concat(importedTourists);
                }
                render();
                window.showToast(i18n.translate('importSuccess').replace('{count}', importedTourists.length), 'fa-circle-check');
            } else {
                window.showToast(i18n.translate('importError'), 'fa-triangle-exclamation', 'bg-red-500');
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    }

    const importBtn = document.getElementById('importBtn');
    const fileInput = document.getElementById('fileInput');
    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleImportFile);
    }

    const exportDropdownBtn = document.getElementById('exportDropdownBtn');
    const exportDropdownMenu = document.getElementById('exportDropdownMenu');
    if (exportDropdownBtn && exportDropdownMenu) {
        exportDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportDropdownMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!exportDropdownBtn.contains(e.target) && !exportDropdownMenu.contains(e.target)) {
                exportDropdownMenu.classList.add('hidden');
            }
        });
    }

    // Expose functions globally for HTML access
    window.exportGuests = exportGuests;

});






