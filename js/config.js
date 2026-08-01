// === НАСТРОЙКИ (ГЛОБАЛЬНЫЕ) ===
const CONFIG = {
    // Себестоимость билета (для расчета маржинальности и чистой прибыли) берется из 'net'
    tariffs: {
        day: [
            { start: '05-23', end: '05-31', tourist: { ADL: 11100, CHLD: 8860 }, agent: { ADL: 10900, CHLD: 8660 }, net: { ADL: 10200, CHLD: 8160 } },
            { start: '06-01', end: '08-23', tourist: { ADL: 14000, CHLD: 11500 }, agent: { ADL: 13450, CHLD: 10700 }, net: { ADL: 12750, CHLD: 10200 } },
            { start: '08-24', end: '09-06', tourist: { ADL: 11500, CHLD: 9200 }, agent: { ADL: 11200, CHLD: 8860 }, net: { ADL: 10200, CHLD: 8160 } },
            { start: '09-07', end: '09-20', tourist: { ADL: 9500, CHLD: 7500 }, agent: { ADL: 9200, CHLD: 7300 }, net: { ADL: 8500, CHLD: 6800 } },
            { start: '09-21', end: '09-30', tourist: { ADL: 8500, CHLD: 6700 }, agent: { ADL: 8350, CHLD: 6520 }, net: { ADL: 7650, CHLD: 6120 } },
        ],
        evening: [
            { start: '06-01', end: '07-31', tourist: { ADL: 9500, CHLD: 7500 }, agent: { ADL: 9000, CHLD: 7180 }, net: { ADL: 8500, CHLD: 6800 } },
            { start: '08-01', end: '08-23', tourist: { ADL: 10450, CHLD: 8438 }, agent: { ADL: 9900, CHLD: 8000 }, net: { ADL: 8500, CHLD: 6800 } },
            { start: '08-24', end: '08-31', tourist: { ADL: 9500, CHLD: 7500 }, agent: { ADL: 9000, CHLD: 7180 }, net: { ADL: 8500, CHLD: 6800 } }
        ]
    },
    discounts: {
        earlyBooking: 15,
        pensioner: 50,
        birthday: 100,
        disabled: 100
    },
    // Логины/пароли и telegram-токен больше НЕ хранятся здесь.
    // Проверка логина и отправка Telegram-алертов происходит через
    // Supabase Edge Functions (см. supabase/functions/verify-login и
    // supabase/functions/telegram-alert), секреты лежат только на сервере Supabase.
    promocodes: {
        'SUMMER10': { type: 'percent', value: 10 },
        'TETYS2000': { type: 'fixed', value: 2000 }
    },
    telegram: {
        minSumForAlert: 50000 // порог не секретный, можно оставить в клиенте
    }
};

const tariffs = CONFIG.tariffs;

// Транслитерация
const cyrillicToLatinMap = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E', 'Ж': 'ZH', 'З': 'Z', 'И': 'I',
    'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
    'У': 'U', 'Ф': 'F', 'Х': 'KH', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHCH', 'Ъ': '', 'Ы': 'Y', 'Ь': '',
    'Э': 'E', 'Ю': 'YU', 'Я': 'YA', 'Ә': 'A', 'І': 'I', 'Ң': 'NG', 'Ғ': 'GH', 'Ү': 'U', 'Ұ': 'U', 'Қ': 'Q', 'Ө': 'O', 'Һ': 'H',
    'а': 'A', 'б': 'B', 'в': 'V', 'г': 'G', 'д': 'D', 'е': 'E', 'ё': 'E', 'ж': 'ZH', 'з': 'Z', 'и': 'I',
    'й': 'Y', 'к': 'K', 'л': 'L', 'м': 'M', 'н': 'N', 'о': 'O', 'п': 'P', 'р': 'R', 'с': 'S', 'т': 'T',
    'у': 'U', 'ф': 'F', 'х': 'KH', 'ц': 'TS', 'ч': 'CH', 'ш': 'SH', 'щ': 'SHCH', 'ъ': '', 'ы': 'Y', 'ь': '',
    'э': 'E', 'ю': 'YU', 'я': 'YA', 'ә': 'A', 'і': 'I', 'ң': 'NG', 'ғ': 'GH', 'ү': 'U', 'ұ': 'U', 'қ': 'Q', 'ө': 'O', 'һ': 'H'
};
