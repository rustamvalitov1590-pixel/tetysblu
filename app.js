// === CONFIG (Тарифная матрица) ===
const CONFIG = {
    // 1. Цены (Базовые по сезонам)
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
    // 2. Скидки (В процентах)
    discounts: {
        earlyBooking: 15, // Акция: Раннее бронирование
        pensioner: 50,    // Пенсионеры
        birthday: 100,    // Именинники
        disabled: 100     // Инвалидность
    },
    // 3. Доступы (Логины и пароли)
    credentials: {
        'admin': 'tetys2026',
        'manager': '0606'
    }
};
// ======================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Регистрация Service Worker для PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.error('SW registration failed', err));
    }

    // Вспомогательная функция для всплывающих уведомлений (Toast)
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
        toast.offsetHeight; // Trigger reflow
        toast.classList.remove('translate-y-5', 'opacity-0');
        
        setTimeout(() => {
            toast.classList.add('-translate-y-5', 'opacity-0');
            setTimeout(() => { toast.remove(); }, 300);
        }, 4000);
    };

    // --- АВТОРИЗАЦИЯ ---
    const authScreen = document.getElementById('authScreen');
    const appContent = document.getElementById('appContent');
    const authLogin = document.getElementById('authLogin');
    const authPin = document.getElementById('authPin');
    const authBtn = document.getElementById('authBtn');
    const authError = document.getElementById('authError');
    const authFormBody = document.getElementById('authFormBody');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- ПОИСК ПО ГОСТЯМ ---
    window.filterGuests = function(query) {
        query = query.toLowerCase().trim();
        const list = document.getElementById('touristList');
        if (!list) return;
        const rows = list.querySelectorAll('.tourist-row');
        rows.forEach(row => {
            const nameInput = row.querySelector('input[placeholder="ФИО туриста"]');
            if (nameInput) {
                const name = nameInput.value.toLowerCase();
                if (name.includes(query) || query === '') {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    };

    if (localStorage.getItem('tetysAuthV2') === 'true') {
        if (authScreen) authScreen.classList.add('hidden');
        if (appContent) appContent.classList.remove('hidden');
    } else {
        if (authLogin) authLogin.focus();
    }

    function checkAuth() {
        const login = authLogin.value.trim().toLowerCase();
        const pass = authPin.value;
        if (CONFIG.credentials[login] && CONFIG.credentials[login] === pass) {
            localStorage.setItem('tetysAuthV2', 'true');
            localStorage.setItem('tetysUser', login);
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
        logoutBtn.addEventListener('click', () => { localStorage.removeItem('tetysAuthV2'); localStorage.removeItem('tetysUser'); location.reload(); });
    }
    if (!document.getElementById('authStyles')) {
        const style = document.createElement('style');
        style.id = 'authStyles';
        style.innerHTML = `@keyframes shake { 0%, 100% {transform: translateX(0);} 20%, 60% {transform: translateX(-10px);} 40%, 80% {transform: translateX(10px);} }`;
        document.head.appendChild(style);
    }

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

    function transliterate(text) {
        if (!text) return '';
        return text.split('').map(char => cyrillicToLatinMap[char] || char.toUpperCase()).join('');
    }

    // Состояние приложения
    let tourists = [];
    let currentCalcMode = 'detailed';
    let quickCounts = { adl: 0, chld: 0, pens: 0, inf: 0, inv: 0, inv2: 0, inv3: 0, chld_inv: 0 };
    
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

    // --- Цензура ---
    function sanitizeProfanity(text) {
        if (!text) return text;
        const badWords = [
            'хуй', 'хуя', 'хуе', 'нахуй', 'похуй', 'дохуя', 'пизда', 'пизде', 'пизду', 'пизды', 'пиздец', 'ебать', 'ебан', 'ебану', 'долбоеб', 'долбоёб', 'уебан', 'бля', 'блять', 'блядь', 'сука', 'суку', 'суки', 'пидор', 'пидарас', 'гандон', 'шлюха', 'шлюхи', 'шалава', 'шалавы', 'шмара', 'курва', 'залупа', 'говно', 'мразь', 'ублюдок', 'чмо', 'хуесос', 'хуйло', 'педик', 'пиздюк',
            'қотақ', 'котак', 'қотағым', 'котагым', 'қотақбас', 'котакбас', 'ам', 'амы', 'сігіс', 'сигис', 'шешең', 'шешен', 'шешеңді', 'шешенди', 'көт', 'көті', 'коти', 'жалеп', 'амшык', 'амшық',
            'fuck', 'fucker', 'fucking', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut'
        ];
        let sanitized = text;
        badWords.forEach(word => {
            const regex = new RegExp('(^|[^\\p{L}])(' + word + ')($|[^\\p{L}])', 'giu');
            sanitized = sanitized.replace(regex, '$1***$3');
        });
        return sanitized;
    }

    const stats = {
        adl: document.getElementById('statAdl'),
        chld: document.getElementById('statChld'),
        inf: document.getElementById('statInf'),
        pens: document.getElementById('statPens'),
        inv: document.getElementById('statInv'),
        bday: document.getElementById('statBday')
    };

    const today = new Date();
    const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    if (visitDateInput) visitDateInput.value = todayStr;
    
    const currentSeasonYearEl = document.getElementById('currentSeasonYear');
    if (currentSeasonYearEl) { currentSeasonYearEl.textContent = `Сезон ${today.getFullYear()}`; }

    if (visitDateInput) visitDateInput.addEventListener('change', render);
    if (clientTypeInput) clientTypeInput.addEventListener('change', render);
    if (tariffTypeInput) tariffTypeInput.addEventListener('change', render);
    if (addTouristBtn) addTouristBtn.addEventListener('click', addTourist);
    
    const earlyBookingToggle = document.getElementById('earlyBookingToggle');
    const earlyBookingContainer = document.getElementById('earlyBookingContainer');
    const earlyBookingBadge = document.getElementById('earlyBookingBadge');
    
    if (earlyBookingToggle) earlyBookingToggle.addEventListener('change', render);

    let lastAttemptedText = '';

    // Parse Bulk Text Input
    if (parseBulkBtn) {
        parseBulkBtn.addEventListener('click', () => {
            const text = bulkText.value.trim();
            if (!text) return;
            
            const isForced = (text === lastAttemptedText);
            lastAttemptedText = text;
            
            const dobRegex = /\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b/;
            
            function parseQuantityDescription(inputText) {
                if (dobRegex.test(inputText)) return null;
                const cleanText = inputText.toLowerCase();
                
                const adlRegex = /(\d+)\s*(?:взросл[ыеяйах]*|взр|adl|adults?|ересектер?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
                const infRegex = /(\d+)\s*(?:ребен[окац]*|реб|младен[ецаы]*|мл[ад]*|inf(?:ants?)?|сәби|бөбек)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
                const chldRegex = /(\d+)\s*(?:дети|дет(?:и|ям|ей|ях)?|chld|child(?:ren)?|бала(?:лар)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
                const snrRegex = /(\d+)\s*(?:пенсионер[ыов]*|пенс|snr|pensioners?|зейнеткер(?:лер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
                const invRegex = /(\d+)\s*(?:инвалид[ыов]*|инв|inv|мүгедек(?:тер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
                
                let adlCount = 0; let chldCount = 0; let infCount = 0; let snrCount = 0; let invCount = 0;
                let matched = false; let match;
                
                while ((match = adlRegex.exec(cleanText)) !== null) { adlCount += parseInt(match[1], 10); matched = true; }
                while ((match = chldRegex.exec(cleanText)) !== null) { chldCount += parseInt(match[1], 10); matched = true; }
                while ((match = infRegex.exec(cleanText)) !== null) { infCount += parseInt(match[1], 10); matched = true; }
                while ((match = snrRegex.exec(cleanText)) !== null) { snrCount += parseInt(match[1], 10); matched = true; }
                while ((match = invRegex.exec(cleanText)) !== null) { invCount += parseInt(match[1], 10); matched = true; }
                
                if (!matched) {
                    const hasAdl = /(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:взросл[ыеяйах]*|взр|adl|adults?|ересектер?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/i.test(cleanText);
                    const hasChld = /(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:дети|дет(?:и|ям|ей|ях)?|chld|child(?:ren)?|бала(?:лар)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/i.test(cleanText);
                    const hasInf = /(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:ребен[окац]*|реб|младен[ецаы]*|мл[ад]*|inf(?:ants?)?|сәби|бөбек)(?=$|\s|[^a-zA-Z4-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/i.test(cleanText);
                    const hasSnr = /(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:пенсионер[ыов]*|пенс|snr|pensioners?|зейнеткер(?:лер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/i.test(cleanText);
                    const hasInv = /(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:инвалид[ыов]*|инв|inv|мүгедек(?:тер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/i.test(cleanText);
                    
                    if (hasAdl || hasChld || hasInf || hasSnr || hasInv) {
                        if (hasAdl) adlCount = 1; if (hasChld) chldCount = 1; if (hasInf) infCount = 1; if (hasSnr) snrCount = 1; if (hasInv) invCount = 1;
                        matched = true;
                    }
                }
                if (!matched) return null;
                return { adl: adlCount, chld: chldCount, inf: infCount, snr: snrCount, inv: invCount };
            }

            const quantityData = parseQuantityDescription(text);
            if (quantityData) {
                const today = new Date();
                const visitDateStr = visitDateInput ? visitDateInput.value : '';
                const visitYear = visitDateStr ? new Date(visitDateStr).getFullYear() : today.getFullYear();
                tourists = [];
                for (let i = 0; i < quantityData.adl; i++) { tourists.push({ id: createId(), fullName: `Гость ${tourists.length + 1}`, dob: `${visitYear - 25}-06-15`, gender: 'male', genderManuallySet: false, disability: 'none' }); }
                for (let i = 0; i < quantityData.chld; i++) { tourists.push({ id: createId(), fullName: `Гость ${tourists.length + 1}`, dob: `${visitYear - 8}-06-15`, gender: 'male', genderManuallySet: false, disability: 'none' }); }
                for (let i = 0; i < quantityData.snr; i++) { tourists.push({ id: createId(), fullName: `Гость ${tourists.length + 1}`, dob: `${visitYear - 65}-06-15`, gender: 'male', genderManuallySet: false, disability: 'none' }); }
                for (let i = 0; i < quantityData.inf; i++) { tourists.push({ id: createId(), fullName: `Гость ${tourists.length + 1}`, dob: `${visitYear - 1}-06-15`, gender: 'male', genderManuallySet: false, disability: 'none' }); }
                for (let i = 0; i < quantityData.inv; i++) { tourists.push({ id: createId(), fullName: `Гость ${tourists.length + 1}`, dob: `${visitYear - 30}-06-15`, gender: 'male', genderManuallySet: false, disability: '1', category: 'INV', categoryManuallySet: true }); }
                render(); bulkText.value = ''; return;
            }

            // Улучшенная склейка перенесенных дат
            let rawLines = text.split('\n').map(l => l.trim()).filter(l => l);
            let mergedLines = [];
            for (let i = 0; i < rawLines.length; i++) {
                let currentLine = rawLines[i];
                if (i + 1 < rawLines.length) {
                    let nextLine = rawLines[i + 1];
                    const pureDobRegex = /^(?:\b(0?[1-9]|[12]\d|3[01])[\.\-\/\s,](0?[1-9]|1[0-2])[\.\-\/\s,](\d{4}|\d{2})\b)/;
                    if (pureDobRegex.test(nextLine) && !/\p{L}/u.test(nextLine)) {
                        currentLine = currentLine + " " + nextLine;
                        i++;
                    }
                }
                mergedLines.push(currentLine);
            }

            const unrecognizedLines = [];
            
            mergedLines.forEach((line, index) => {
                const originalLine = line;
                if (!line) return;

                // Перевод текстовых месяцев СТРОГО внутри дат (чтобы не ломать фамилии вроде Каймир)
                const monthMap = {
                    'января': '01', 'январь': '01', 'янв': '01', 'февраля': '02', 'февраль': '02', 'фев': '02', 'марта': '03', 'март': '03', 'мар': '03', 'апреля': '04', 'апрель': '04', 'апр': '04', 'мая': '05', 'май': '05', 'июня': '06', 'июнь': '06', 'июн': '06', 'июля': '07', 'июль': '07', 'июл': '07', 'августа': '08', 'август': '08', 'авг': '08', 'сентября': '09', 'сентябрь': '09', 'сен': '09', 'октября': '10', 'октябрь': '10', 'окт': '10', 'ноября': '11', 'ноябрь': '11', 'ноя': '11', 'декабря': '12', 'декабрь': '12', 'дек': '12', 'қаңтар': '01', 'кантар': '01', 'қаң': '01', 'ақпан': '02', 'акпан': '02', 'ақп': '02', 'наурыз': '03', 'нау': '03', 'сәуір': '04', 'сэуір': '04', 'сәу': '04', 'мамыр': '05', 'мам': '05', 'маусым': '06', 'мау': '06', 'шілде': '07', 'шилде': '07', 'шіл': '07', 'тамыз': '08', 'там': '08', 'қыркүйек': '09', 'кыркуйек': '09', 'қыр': '09', 'қазан': '10', 'казан': '10', 'қаз': '10', 'қараша': '11', 'караша': '11', 'қар': '11', 'желтоқсан': '12', 'желтоксан': '12', 'жел': '12'
                };
                
                // Ищем конструкцию "цифры + слово месяца" (например, 12 марта)
                for (let key in monthMap) {
                    const inlineMonthRegex = new RegExp(`(\\d{1,2})\\s+${key}\\s*(\\d{2,4})?`, 'gi');
                    if (inlineDobMatch = line.match(inlineMonthMap)) {
                         line = line.replace(inlineForm, (m, g1, g2) => `${g1}.${monthMap[key]}.${g2 || new Date().getFullYear()}`);
                    }
                }

                let tAge = undefined; let tYear = undefined;

                if (index === 0) {
                    const headerDateMatch = line.match(/(?:на\s+|дата\s*посещения\s*)?(\d{1,2})[\.\-\/](\d{1,2})(?:[\.\-\/](\d{2}|\d{4}))?/i);
                    const lowerLine = line.toLowerCase();
                    const isHeader = headerDateMatch && (lowerLine.includes('на ') || lowerLine.includes('дата') || lowerLine.includes('тетис') || lowerLine.includes('tour') || lowerLine.includes('тур') || lowerLine.includes('бронь') || lowerLine.includes('заявка') || lowerLine.includes('групп'));
                    if (isHeader) {
                        const day = headerDateMatch[1].padStart(2, '0'); const month = headerDateMatch[2].padStart(2, '0');
                        let currentYear = new Date().getFullYear();
                        if (headerDateMatch[3]) {
                            let y = headerDateMatch[3];
                            if (y.length === 2) { const yInt = parseInt(y); currentYear = yInt > 50 ? 1900 + yInt : 2000 + yInt; } else { currentYear = parseInt(y); }
                        }
                        if (visitDateInput) visitDateInput.value = `${currentYear}-${month}-${day}`;
                        return;
                    }
                }

                // Извлечение категории СТРОГО до очистки строки
                let parsedCategory = null;
                const lowerLineForCat = line.toLowerCase();
                if (/(?:^|\s)(?:snr|pensioners?|пенсионер[ыов]*|пенс|з[еи]й?неткер(?:лер)?)(?=$|\s)/i.test(lowerLineForCat)) { parsedCategory = 'SNR'; }
                else if (/(?:^|\s)(?:chld|child(?:ren)?|дети|дет[ямнска]*|бала(?:лар)?)(?=$|\s)/i.test(lowerLineForCat)) { parsedCategory = 'CHLD'; }
                else if (/(?:^|\s)(?:inf(?:ants?)?|младен[ецаы]*|мл[ад]*|ребен[окац]*|реб|сәби|бөбек)(?=$|\s)/i.test(lowerLineForCat)) { parsedCategory = 'INF'; }
                else if (/(?:^|\s)(?:inv|инвалид[ыов]*|инв|мүгедек(?:тер)?)(?=$|\s)/i.test(lowerLineForCat)) { parsedCategory = 'INV'; }
                else if (/(?:^|\s)(?:adl|adults?|взросл[ыеяйах]*|взр|үлкен)(?=$|\s)/i.test(lowerLineForCat)) { parsedCategory = 'ADL'; }

                const dobRegexStr = /\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s\,])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b/;
                const dobMatch = line.match(dobRegexStr);
                let dobIso = ''; let matchedStr = '';
                
                if (dobMatch) {
                    matchedStr = dobMatch[0]; const parts = matchedStr.split(/[\.\-\/\s\,]+/);
                    let day = parts[0].padStart(2, '0'); let month = parts[1].padStart(2, '0'); let year = parts[2];
                    if (year.length === 2) { const yInt = parseInt(year); year = (yInt > 50 ? 1900 + yInt : 2000 + yInt).toString(); }
                    dobIso = `${year}-${month}-${day}`;
                } else {
                    const ageRegex = /(?<!\d)(\d{1,2})\s*(?:лет|года|год|жаста|жас|yo|y\.o\.|years?|old)(?!\p{L})/i;
                    const ageMatch = line.match(ageRegex);
                    if (ageMatch) { matchedStr = ageMatch[0]; tAge = parseInt(ageMatch[1], 10); dobIso = ''; }
                    else {
                        const yearRegex = /(?<!\d)(19\d{2}|20[0-2]\d)(?![0-9])/i;
                        const yearMatch = line.match(yearRegex);
                        if (yearMatch) { matchedStr = yearMatch[0]; tYear = parseInt(yearMatch[1], 10); dobIso = ''; }
                    }
                }
                
                // Аккуратная очистка имени БЕЗ удаления текста слева
                let namePart = line;
                if (matchedStr) { namePart = namePart.replace(matchedStr, ' '); }
                
                // Удаляем триггеры категорий строго по границам слов, не ломая ФИО
                namePart = namePart.replace(/\b(?:snr|pensioners?|пенсионер[ыов]*|пенс|з[еи]й?неткер(?:лер)?|chld|child|дети|дет[а-я]*|бала(?:лар)?|inf|младен[а-я]*|реб[а-я]*|inv|инвалид[а-я]*|adl|adults?|взросл[а-я]*|взр)\b/ig, ' ');
                namePart = namePart.replace(/дата\s*рожд[а-я]*/ig, '').replace(/\bд\.?р\.?\b/ig, '');
                namePart = namePart.replace(/\b(?:билет|пассажир|итого|сумма|заявка|бронь|турист|тур|пакс)\b/ig, ' ');
                
                namePart = namePart.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s\-\']/g, ' ').trim();
                namePart = namePart.replace(/\s+/g, ' ');
                namePart = sanitizeProfanity(namePart);

                const wordsCount = namePart.split(' ').length;
                const hasDateOrAge = dobIso || tAge !== undefined || tYear !== undefined || parsedCategory;

                if (namePart.length >= 2 && (hasDateOrAge || wordsCount >= 2 || isForced)) {
                    namePart = namePart.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                    const guessed = guessGender(namePart);
                    const touristObj = { id: createId(), fullName: namePart, dob: dobIso, gender: guessed, genderManuallySet: false, disability: 'none' };
                    if (tAge !== undefined) touristObj.age = tAge;
                    if (tYear !== undefined) touristObj.year = tYear;
                    
                    if (parsedCategory) { touristObj.category = parsedCategory; touristObj.categoryManuallySet = true; }
                    else if (!dobIso && tAge === undefined && tYear === undefined) { touristObj.category = 'ADL'; touristObj.categoryManuallySet = false; }
                    
                    const isDuplicate = tourists.some(t => t.fullName.toLowerCase() === touristObj.fullName.toLowerCase() && t.dob === touristObj.dob);
                    if (!isDuplicate) { tourists.push(touristObj); } else { unrecognizedLines.push(originalLine + " (Дубликат)"); }
                } else { unrecognizedLines.push(originalLine); }
            });
            
            if (tourists.length > 1 && tourists[0].fullName === '' && tourists[0].dob === '') { tourists.shift(); }
            render();
            if (unrecognizedLines.length > 0) {
                bulkText.value = unrecognizedLines.join('\n');
                if (!isForced) { window.showToast(`Часть строк требует проверки. Нажмите еще раз, если все ок.`, 'fa-triangle-exclamation', 'bg-amber-500'); }
            } else { bulkText.value = ''; lastAttemptedText = ''; }
        });
    }

    function createId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

    window.clearAllTourists = function() {
        if (confirm('Вы уверены, что хотите удалить всех гостей?')) {
            tourists = [];
            const today = new Date();
            const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            if (visitDateInput) visitDateInput.value = todayStr;
            render();
        }
    };

    function addTourist() {
        tourists.push({ id: createId(), fullName: '', dob: '', gender: 'male', genderManuallySet: false, disability: 'none' });
        render();
    }

    function removeTourist(id, btnElement) {
        if (btnElement) {
            const row = btnElement.closest('.tourist-row');
            if (row) {
                row.classList.remove('animate-row-in'); row.classList.add('animate-row-out');
                setTimeout(() => { tourists = tourists.filter(t => t.id !== id); render(); }, 250);
                return;
            }
        }
        tourists = tourists.filter(t => t.id !== id);
        render();
    }

    function updateTourist(id, field, value) {
        const tourist = tourists.find(t => t.id === id);
        if (tourist) {
            if (field === 'fullName') value = sanitizeProfanity(value);
            tourist[field] = value;
            if (field === 'fullName') {
                if (!tourist.genderManuallySet) { tourist.gender = guessGender(value); }
                delete tourist.category; delete tourist.categoryManuallySet;
            }
            if (field === 'gender') { tourist.genderManuallySet = true; }
            if (field === 'dob') { delete tourist.age; delete tourist.year; delete tourist.category; delete tourist.categoryManuallySet; }
            render();
        }
    }

    function updateTouristDobDirect(id, value) {
        const tourist = tourists.find(t => t.id === id);
        if (!tourist) return;
        value = value.trim();
        if (!value) {
            tourist.dob = ''; delete tourist.age; delete tourist.year; delete tourist.category; delete tourist.categoryManuallySet;
            render(); return;
        }
        const dobRegex = /\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b/;
        const match = value.match(dobRegex);
        if (match) {
            const parts = match[0].split(/[\.\-\/\s]+/);
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) { year = (parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year)).toString(); }
            tourist.dob = `${year}-${month}-${day}`;
            delete tourist.age; delete tourist.year; delete tourist.category; delete tourist.categoryManuallySet;
            render(); return;
        }
        render();
    }

    function updateTouristCategory(id, value) {
        const tourist = tourists.find(t => t.id === id);
        if (tourist) {
            tourist.category = value;
            tourist.categoryManuallySet = true;
            if (value !== 'INV') { tourist.disability = 'none'; } 
            render();
        }
    }

    function guessGender(name) {
        if (!name) return 'male';
        const cleanName = name.trim().toLowerCase(); const words = cleanName.split(/\s+/);
        for (let word of words) {
            if (word.endsWith('қызы') || word.endsWith('kyzy') || word.endsWith('qyzy')) return 'female';
            if (word.endsWith('ұлы') || word.endsWith('uly') || word.endsWith('улы')) return 'male';
            if (word.endsWith('овна') || word.endsWith('евна') || word.endsWith('ична')) return 'female';
            if (word.endsWith('ович') || word.endsWith('евич') || word.endsWith('ич')) return 'male';
            if (word.endsWith('ова') || word.endsWith('ева') || word.endsWith('ина') || word.endsWith('ая')) return 'female';
            if (word.endsWith('нұр') || word.endsWith('нур') || word.endsWith('nur')) return 'female';
            if (word.endsWith('гүл') || word.endsWith('гул') || word.endsWith('gul')) return 'female';
        }
        return 'male';
    }

    function getRetirementAge(gender, visitDateStr) {
        if (gender === 'female') {
            if (!visitDateStr) return 61;
            const visitYear = new Date(visitDateStr).getFullYear();
            if (visitYear <= 2027) return 61;
            return 63;
        }
        return 63;
    }

    function calculateAge(dobStr, visitDateStr) {
        if (!dobStr || !visitDateStr) return null;
        const dob = new Date(dobStr); const visit = new Date(visitDateStr);
        let age = visit.getFullYear() - dob.getFullYear();
        if (visit.getMonth() < dob.getMonth() || (visit.getMonth() === dob.getMonth() && visit.getDate() < dob.getDate())) { age--; }
        return age;
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
        for (let p of periods) { if (md >= p.start && md <= p.end) { activePeriod = p; break; } }
        if (!activePeriod) return -1;
        if (passengerCategory === 'INF') return 0;
        const priceCategory = (passengerCategory === 'SNR' || passengerCategory === 'INV') ? 'ADL' : passengerCategory;
        return activePeriod[clientType][priceCategory] || 0;
    }

    function calculateDiscount(dobStr, visitDateStr, disability, age, gender) {
        if (age === null || !visitDateStr) return 0;
        let maxDiscount = 0;
        if (age <= 3) maxDiscount = Math.max(maxDiscount, 100);
        if (disability === '1') maxDiscount = Math.max(maxDiscount, 100);
        
        let isBirthday = false;
        if (dobStr) {
            const dob = new Date(dobStr); const visit = new Date(visitDateStr);
            isBirthday = dob.getDate() === visit.getDate() && dob.getMonth() === visit.getMonth();
        }
        if (isBirthday) maxDiscount = Math.max(maxDiscount, 50);
        
        const retirementAge = getRetirementAge(gender, visitDateStr);
        if (age >= retirementAge) maxDiscount = Math.max(maxDiscount, 50);
        
        if (disability === '2') maxDiscount = Math.max(maxDiscount, 15);
        if (disability === '3') maxDiscount = Math.max(maxDiscount, 10);
        
        return { percent: maxDiscount, isBirthday: isBirthday, isPensioner: age >= retirementAge, isInfant: age <= 3 };
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) { return `${parts[2]}.${parts[1]}.${parts[0]}`; }
        return dateStr;
    }

    function render() {
        const visitDate = visitDateInput ? visitDateInput.value : '';
        const clientType = clientTypeInput ? clientTypeInput.value : 'tourist';
        const tariffType = tariffTypeInput ? tariffTypeInput.value : 'day';

        if (touristListEl) touristListEl.innerHTML = '';
        if (emptyState) { if (tourists.length === 0) { emptyState.classList.remove('hidden'); } else { emptyState.classList.add('hidden'); } }

        let totalSum = 0; let isTariffFound = true;
        let counts = { adl: 0, chld: 0, inf: 0, pens: 0, bday: 0 }; let exportDataList = [];

        tourists.forEach((t, i) => {
            let age = null; let displayDob = '';
            if (t.age !== undefined) { age = t.age; const visitYear = visitDate ? new Date(visitDate).getFullYear() : new Date().getFullYear(); displayDob = (visitYear - t.age).toString(); } 
            else if (t.year !== undefined) { age = (visitDate ? new Date(visitDate).getFullYear() : new Date().getFullYear()) - t.year; displayDob = t.year.toString(); } 
            else { age = calculateAge(t.dob, visitDate); if (t.dob) { displayDob = formatDate(t.dob); } }

            let category = getPassengerCategory(age, t.gender, visitDate);
            if (t.categoryManuallySet && t.category) { category = t.category; } 
            t.category = category;
            
            const basePrice = getBasePrice(visitDate, clientType, tariffType, category);
            if (basePrice === -1) isTariffFound = false;

            const earlyBookingEnabled = earlyBookingToggle ? earlyBookingToggle.checked : false;
            const discountInfo = calculateDiscount(t.dob, visitDate, category === 'INV' ? t.disability : 'none', age, t.gender);
            let discountPercent = discountInfo.percent || 0;
            
            if (category === 'SNR') { discountPercent = Math.max(discountPercent, 50); discountInfo.isPensioner = true; }
            if (category === 'INV' && t.disability !== '2' && t.disability !== '3') { discountPercent = 100; }

            let finalPrice = 0;
            if (basePrice > 0) { finalPrice = basePrice * (1 - discountPercent / 100); }

            if (category === 'ADL') counts.adl++; if (category === 'CHLD') counts.chld++; if (category === 'INF') counts.inf++; if (category === 'SNR') counts.pens++;
            totalSum += finalPrice;

            if (t.fullName) {
                exportDataList.push({ translitName: transliterate(t.fullName), category: category, formattedDob: displayDob, tags: [], gender: t.gender === 'female' ? 'F' : 'M', isBirthday: discountInfo.isBirthday });
            }

            let catSelectClass = 'border-slate-200 text-slate-700 bg-white';
            if (category === 'ADL') catSelectClass = 'bg-blue-50 text-blue-600 border-blue-200';
            if (category === 'SNR') catSelectClass = 'bg-purple-50 text-purple-600 border-purple-200';
            if (category === 'CHLD') catSelectClass = 'bg-teal-50 text-teal-600 border-teal-200';
            if (category === 'INF') catSelectClass = 'bg-green-50 text-green-600 border-green-200';

            const row = document.createElement('div');
            row.className = 'tourist-row p-1.5 md:p-1 flex flex-col md:grid md:grid-cols-12 gap-1.5 md:gap-1 items-start md:items-center transition-all relative hover:bg-slate-50 animate-row-in';
            row.innerHTML = `
                <div class="absolute top-1.5 right-1.5 md:static md:col-span-1 md:w-full flex justify-end md:order-last">
                    <button onclick="removeTourist('${t.id}', this)" class="btn-danger p-0.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><i class="fa-solid fa-trash-can text-xs pointer-events-none"></i></button>
                </div>
                <div class="w-full flex gap-2 pr-6 md:pr-0 md:contents">
                    <div class="flex-1 md:col-span-3 w-full relative">
                        <input type="text" placeholder="ФИО туриста" value="${t.fullName}" onblur="updateTourist('${t.id}', 'fullName', this.value)" class="w-full text-left bg-transparent text-slate-800 border ${!t.fullName ? 'border-red-300 bg-red-50/40' : 'border-transparent'} hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-2 py-1 text-xs font-medium transition-colors">
                    </div>
                    <div class="w-[100px] shrink-0 md:w-full md:col-span-2">
                        <input type="text" value="${displayDob}" placeholder="дд.мм.гггг или гггг" onblur="updateTouristDobDirect('${t.id}', this.value)" class="w-full text-left bg-transparent text-slate-800 border ${(!t.dob && t.age === undefined && t.year === undefined) ? 'border-red-300 bg-red-50/40' : 'border-transparent'} hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-0.5 py-1 text-xs font-medium transition-colors">
                    </div>
                </div>
                <div class="col-span-12 w-full flex flex-wrap justify-between items-center mt-1 md:mt-0 md:contents border-t border-slate-100 md:border-0 pt-1.5 md:pt-0">
                    <div class="flex space-x-2 sm:space-x-4 md:space-x-6 md:contents">
                        <div class="md:col-span-1 text-left md:text-center flex flex-col items-start md:items-center"><span class="text-xs font-bold ${age === null ? 'text-slate-400' : 'text-[#0076ba]'}">${age !== null ? age : '-'}</span></div>
                        <div class="md:col-span-1 text-left md:text-center flex flex-col items-start md:items-center w-full md:w-auto">
                            <select onchange="updateTouristCategory('${t.id}', this.value)" class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${catSelectClass} focus:outline-none transition-all duration-300 cursor-pointer text-center w-full md:w-auto">
                                <option value="ADL" ${category === 'ADL' ? 'selected' : ''}>ADL</option>
                                <option value="CHLD" ${category === 'CHLD' ? 'selected' : ''}>CHLD</option>
                                <option value="INF" ${category === 'INF' ? 'selected' : ''}>INF</option>
                                <option value="SNR" ${category === 'SNR' ? 'selected' : ''}>SNR</option>
                            </select>
                        </div>
                        <div class="md:col-span-2"></div>
                    </div>
                    <div class="md:col-span-2 text-right pr-2">
                        ${discountPercent > 0 ? `<span class="badge-discount text-[8px] px-1.5 py-0.5 rounded-full mb-0.5 font-bold">-${discountPercent}%</span>` : ''}
                        <span class="text-xs font-bold text-slate-900">${basePrice === -1 ? 'Нет тарифа' : Math.round(finalPrice).toLocaleString('ru-RU')} ₸</span>
                    </div>
                </div>
            `;
            touristListEl.appendChild(row);
        });

        totalPriceEl.textContent = Math.round(totalSum).toLocaleString('ru-RU');
        stats.adl.textContent = counts.adl; stats.chld.textContent = counts.chld; stats.inf.textContent = counts.inf; stats.pens.textContent = counts.pens;
        saveDraft();
    }

    function saveDraft() {
        const data = { visitDate: visitDateInput ? visitDateInput.value : '', clientType: clientTypeInput ? clientTypeInput.value : 'tourist', tariffType: tariffTypeInput ? tariffTypeInput.value : 'day', tourists: tourists, currentCalcMode: currentCalcMode, quickCounts: quickCounts };
        localStorage.setItem('tetisBluDraft', JSON.stringify(data));
    }

    function switchCalcMode(mode) {
        currentCalcMode = mode; render();
    }

    function initApp() {
        const draft = localStorage.getItem('tetisBluDraft');
        if (draft) {
            try {
                const data = JSON.parse(draft);
                if (data.tourists) tourists = data.tourists;
            } catch (e) { addTourist(); }
        } else { addTourist(); }
        render();
    }

    initApp();
});
