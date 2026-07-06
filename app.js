// === ?? ��������� ������� (���� ��� �������� ��������� ��� � �����) ===
const CONFIG = {
    // 1. ���� (������ �� ��������)
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
    // 2. ������ (� ���������)
    discounts: {
        earlyBooking: 15, // �����: ������ ������������
        pensioner: 50,    // ����������
        birthday: 100,    // ����������
        disabled: 100     // ������������
    },
    // 3. ������� (������ � ������)
    credentials: {
        'admin': 'tetys2026',
        'manager': '0606'
    },
    // 4. Промокоды
    promocodes: {
        'SUMMER10': { type: 'percent', value: 10 },
        'TETYS2000': { type: 'fixed', value: 2000 }
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

    // Изменили ключ, чтобы сбросить старую сессию без пароля
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
            localStorage.setItem('tetysUser', login); // Запоминаем кто вошел
            
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

    // Тарифы
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
    
    // Элементы DOM
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
    const promoInput = document.getElementById('promoInput');
    const commentInput = document.getElementById('commentInput');

    // Слушатели для промокода
    if (promoInput) {
        promoInput.addEventListener('input', () => {
            render(); // Пересчет при изменении промокода
        });
    }
    if (commentInput) {
        commentInput.addEventListener('input', () => {
            saveDraft();
        });
    }

    // --- Цензура ---
    function sanitizeProfanity(text) {
        if (!text) return text;
        const badWords = [
            'хуй', 'хуя', 'хуе', 'нахуй', 'похуй', 'дохуя', 'пизда', 'пизде', 'пизду', 'пизды', 'пиздец', 'ебать', 'ебан', 'ебану', 'долбоеб', 'долбоёб', 'уебан', 'бля', 'блять', 'блядь', 'сука', 'суку', 'суки', 'пидор', 'пидарас', 'пидорас', 'гандон', 'шлюха', 'шлюхи', 'шалава', 'шалавы', 'шмара', 'курва', 'залупа', 'говно', 'мразь', 'ублюдок', 'чмо', 'хуесос', 'хуйло', 'педик', 'пиздюк',
            'қотақ', 'котак', 'қотағым', 'котагым', 'қотақбас', 'котакбас', 'ам', 'амы', 'сігіс', 'сигис', 'шешең', 'шешен', 'шешеңді', 'шешенди', 'көт', 'көті', 'коти', 'жалеп', 'амшык', 'амшық',
            'fuck', 'fucker', 'fucking', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut'
        ];
        let sanitized = text;
        badWords.forEach(word => {
            const regex = new RegExp('(^|[^\\p{L}])(' + word + ')($|[^\\p{L}])', 'giu');
            sanitized = sanitized.replace(regex, '$1***$3');
            sanitized = sanitized.replace(regex, '$1***$3'); // second pass for overlaps
        });
        return sanitized;
    }
    // ---------------


    // Dummy auth logic removed to prevent conflicts with checkAuth

    // Статистика
    const stats = {
        adl: document.getElementById('statAdl'),
        chld: document.getElementById('statChld'),
        inf: document.getElementById('statInf'),
        pens: document.getElementById('statPens'),
        inv: document.getElementById('statInv'),
        bday: document.getElementById('statBday')
    };

    // Устанавливаем сегодняшнюю дату по умолчанию
    const today = new Date();
    // Форматируем с учетом локальной зоны (для корректного отображения YYYY-MM-DD)
    const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    visitDateInput.value = todayStr;
    
    // Автоматический год сезона
    const currentSeasonYearEl = document.getElementById('currentSeasonYear');
    if (currentSeasonYearEl) {
        currentSeasonYearEl.textContent = `Сезон ${today.getFullYear()}`;
    }

    if (visitDateInput) visitDateInput.addEventListener('change', render);
    if (clientTypeInput) clientTypeInput.addEventListener('change', render);
    if (tariffTypeInput) tariffTypeInput.addEventListener('change', render);
    if (addTouristBtn) addTouristBtn.addEventListener('click', addTourist);
    
    const earlyBookingToggle = document.getElementById('earlyBookingToggle');
    const earlyBookingContainer = document.getElementById('earlyBookingContainer');
    const earlyBookingBadge = document.getElementById('earlyBookingBadge'); // Из шапки
    
    if (earlyBookingToggle) earlyBookingToggle.addEventListener('change', render);

    // Загрузка черновика (Авто-сохранение)
    const draft = localStorage.getItem('tetisBluDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            // Мы больше не загружаем сохраненную дату визита из черновика, 
            // чтобы она ВСЕГДА по умолчанию была сегодняшним днем.
            // if (data.visitDate) visitDateInput.value = data.visitDate;
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
            if (data.promo && promoInput) {
                promoInput.value = data.promo;
            }
            if (data.comment && commentInput) {
                commentInput.value = data.comment;
            }
            setTimeout(() => {
                switchCalcMode(currentCalcMode);
            }, 50);
        } catch (e) {
            console.error('Ошибка загрузки черновика', e);
            addTourist();
        }
    } else {
        addTourist();
    }
    
    // Первичный рендер если данные загружены
    if (tourists.length > 0) render();

    let lastAttemptedText = '';

    // Parse Bulk Text Input
    parseBulkBtn.addEventListener('click', () => {
        const text = bulkText.value.trim();
        if (!text) return;
        
        const isForced = (text === lastAttemptedText);
        lastAttemptedText = text;
        
        // Check if the input represents quantities instead of names with dates of birth
        const dobRegex = /\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b/;
        
        // Function to parse quantity descriptions like "2 взрослых и 1 ребенок"
        function parseQuantityDescription(inputText) {
            if (dobRegex.test(inputText)) {
                return null; // Contains DOBs, so it's a detailed list, not just counts
            }

            const cleanText = inputText.toLowerCase();
            
            // Regex patterns to detect counts of different guest categories.
            const adlRegex = /(\d+)\s*(?:взросл[ыеяйах]*|взр|adl|adults?|ересектер?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
            const infRegex = /(\d+)\s*(?:ребен[окац]*|реб|младен[ецаы]*|мл[ад]*|inf(?:ants?)?|сәби|бөбек)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
            const chldRegex = /(\d+)\s*(?:дети|дет(?:и|ям|ей|ях)?|chld|child(?:ren)?|бала(?:лар)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
            const snrRegex = /(\d+)\s*(?:пенсионер[ыов]*|пенс|snr|pensioners?|зейнеткер(?:лер)?|зийнеткер(?:лер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
            const invRegex = /(\d+)\s*(?:инвалид[ыов]*|инв|inv|мүгедек(?:тер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
            
            let adlCount = 0;
            let chldCount = 0;
            let infCount = 0;
            let snrCount = 0;
            let invCount = 0;
            
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
            while ((match = invRegex.exec(cleanText)) !== null) {
                invCount += parseInt(match[1], 10);
                matched = true;
            }
            
            if (!matched) {
                // If no numbers were matched, check if there are keywords present (meaning singular, like "взрослый и ребенок" -> 1 adult, 1 child)
                const hasAdl = /(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:взросл[ыеяйах]*|взр|adl|adults?|ересектер?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/i.test(cleanText);
                const hasChld = /(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:дети|дет(?:и|ям|ей|ях)?|chld|child(?:ren)?|бала(?:лар)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/i.test(cleanText);
                const hasInf = /(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:ребен[окац]*|реб|младен[ецаы]*|мл[ад]*|inf(?:ants?)?|сәби|бөбек)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/i.test(cleanText);
                const hasSnr = /(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:пенсионер[ыов]*|пенс|snr|pensioners?|зейнеткер(?:лер)?|зийнеткер(?:лер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/i.test(cleanText);
                const hasInv = /(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:инвалид[ыов]*|инв|inv|мүгедек(?:тер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/i.test(cleanText);
                
                if (hasAdl || hasChld || hasInf || hasSnr || hasInv) {
                    if (hasAdl) adlCount = 1;
                    if (hasChld) chldCount = 1;
                    if (hasInf) infCount = 1;
                    if (hasSnr) snrCount = 1;
                    if (hasInv) invCount = 1;
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
            
            tourists = []; // Clear existing list
            
            // Add Adults (ADL)
            for (let i = 0; i < quantityData.adl; i++) {
                tourists.push({
                    id: createId(),
                    fullName: `Гость ${tourists.length + 1}`,
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
                    fullName: `Гость ${tourists.length + 1}`,
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
                    fullName: `Гость ${tourists.length + 1}`,
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
                    fullName: `Гость ${tourists.length + 1}`,
                    dob: `${visitYear - 1}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: 'none'
                });
            }
            // Add Disabled (INV)
            for (let i = 0; i < quantityData.inv; i++) {
                tourists.push({
                    id: createId(),
                    fullName: `Гость ${tourists.length + 1}`,
                    dob: `${visitYear - 30}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: '1',
                    category: 'INV',
                    categoryManuallySet: true
                });
            }
            
            render();
            bulkText.value = '';
            return;
        }

        // 1. Предобработка: разбиваем на строки по датам рождения перед именами
        const dobSplitRegex = /(?:\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s\,])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b)([\.\s\-\/\,]+)(?=[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/g;
        let normalizedText = text.replace(dobSplitRegex, '$&\n');
        
        // 2. Убираем нумерацию строк (например, "1. ", "2) ", "3 ") в начале каждой строки
        normalizedText = normalizedText.replace(/(?:^|\n)\s*\d+[\.\)\s\-]+\s*(?=[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/g, '\n');
        
        const lines = normalizedText.split('\n');
        const unrecognizedLines = [];
        
        lines.forEach((line, index) => {
            const originalLine = line;
            line = line.trim();
            if (!line) return;

            let tAge = undefined;
            let tYear = undefined;

            // Проверяем, не заголовок ли это
            if (index === 0) {
                const headerDateMatch = line.match(/(?:на\s+|дата\s*посещения\s*)?(\d{1,2})[\.\-\/](\d{1,2})(?:[\.\-\/](\d{2}|\d{4}))?/i);
                const lowerLine = line.toLowerCase();
                const isHeader = headerDateMatch && (
                    lowerLine.includes('на ') || 
                    lowerLine.includes('дата') || 
                    lowerLine.includes('тетис') ||
                    lowerLine.includes('tour') ||
                    lowerLine.includes('тур') ||
                    lowerLine.includes('бронь') ||
                    lowerLine.includes('заявка') ||
                    lowerLine.includes('групп')
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
                    return;
                }
            }

            // Детекция категории из исходного текста
            let parsedCategory = null;
            const lowerLineForCat = line.toLowerCase();
            if (/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(?:adl|adults?|взросл[ыеяйах]*|взр|үлкен)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/i.test(lowerLineForCat)) {
                parsedCategory = 'ADL';
            } else if (/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(?:chld|child(?:ren)?|дети|дет[ямнска]*|бала(?:лар)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/i.test(lowerLineForCat)) {
                parsedCategory = 'CHLD';
            } else if (/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(?:inf(?:ants?)?|младен[ецаы]*|мл[ад]*|ребен[окац]*|реб|сәби|бөбек)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/i.test(lowerLineForCat)) {
                parsedCategory = 'INF';
            } else if (/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(?:snr|pensioners?|пенсионер[ыов]*|пенс|зейнеткер(?:лер)?|зийнеткер(?:лер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/i.test(lowerLineForCat)) {
                parsedCategory = 'SNR';
            } else if (/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(?:inv|инвалид[ыов]*|инв|мүгедек(?:тер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/i.test(lowerLineForCat)) {
                parsedCategory = 'INV';
            }

            // Перевод месяцев на трех языках в числовой формат перед распознаванием дат
            const monthMap = {
                'января': '01', 'январь': '01', 'янв': '01',
                'февраля': '02', 'февраль': '02', 'фев': '02',
                'марта': '03', 'март': '03', 'мар': '03',
                'апреля': '04', 'апрель': '04', 'апр': '04',
                'мая': '05', 'май': '05',
                'июня': '06', 'июнь': '06', 'июн': '06',
                'июля': '07', 'июль': '07', 'июл': '07',
                'августа': '08', 'август': '08', 'авг': '08',
                'сентября': '09', 'сентябрь': '09', 'сен': '09',
                'октября': '10', 'октябрь': '10', 'окт': '10',
                'ноября': '11', 'ноябрь': '11', 'ноя': '11',
                'декабря': '12', 'декабрь': '12', 'дек': '12',
                'қаңтар': '01', 'кантар': '01', 'қаң': '01',
                'ақпан': '02', 'акпан': '02', 'ақп': '02',
                'наурыз': '03', 'нау': '03',
                'сәуір': '04', 'сэуір': '04', 'сәу': '04',
                'мамыр': '05', 'мам': '05',
                'маусым': '06', 'мау': '06',
                'шілде': '07', 'шилде': '07', 'шіл': '07',
                'тамыз': '08', 'там': '08',
                'қыркүйек': '09', 'кыркуйек': '09', 'қыр': '09',
                'қазан': '10', 'казан': '10', 'қаз': '10',
                'қараша': '11', 'караша': '11', 'қар': '11',
                'желтоқсан': '12', 'желтоксан': '12', 'жел': '12',
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
                const regex = new RegExp(`(?<![a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])${key}(?![a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])`, 'gi');
                if (regex.test(line)) {
                    line = line.replace(regex, monthMap[key]);
                }
            }

            // Ищем дату рождения по нашему улучшенному regex (день 1-31, месяц 1-12, год 2 или 4 цифры)
            const dobRegex = /\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s\,])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b/;
            const dobMatch = line.match(dobRegex);
            
            let dobIso = '';
            let matchedStr = '';
            
            if (dobMatch) {
                matchedStr = dobMatch[0];
                const parts = matchedStr.split(/[\.\-\/\s\,]+/);
                
                let day = '';
                let month = '';
                let year = '';
                
                if (parts.length >= 3) {
                    day = parts[0].padStart(2, '0');
                    month = parts[1].padStart(2, '0');
                    year = parts[2];
                } else if (parts.length === 2) {
                    day = parts[0].padStart(2, '0');
                    // Например: "081997"
                    month = parts[1].slice(0, 2).padStart(2, '0');
                    year = parts[1].slice(2);
                } else {
                    // Нет разделителей вовсе, например "16081997" or "160897"
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
                // Ищем указание возраста, например "35 лет", "5 жас", "12 years", "2 года"
                const ageRegex = /(?<!\d)(\d{1,2})\s*(?:лет|года|год|жаста|жас|yo|y\.o\.|years?(?:\s+old)?|old)(?![a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ0-9_])/i;
                const ageMatch = line.match(ageRegex);
                if (ageMatch) {
                    matchedStr = ageMatch[0];
                    const age = parseInt(ageMatch[1], 10);
                    dobIso = '';
                    tAge = age;
                } else {
                    // Ищем только четырехзначный год рождения, например "1995", "2018 г.", "2015 г.р."
                    const yearRegex = /(?<!\d)(19\d{2}|20[0-2]\d)(?![0-9])(?:\s*(?:г\.|г|года|г\.р\.|гр))?/i;
                    const yearMatch = line.match(yearRegex);
                    if (yearMatch) {
                        matchedStr = yearMatch[0];
                        const birthYear = parseInt(yearMatch[1], 10);
                        dobIso = '';
                        tYear = birthYear;
                    } else {
                        // Ищем просто цифру от 1 до 99 (скорее всего это возраст), даже если она слитно с именем
                        const simpleAgeRegex = /(?<!\\d)(\\d{1,2})(?=$|\\s|,)/;
                        const simpleAgeMatch = line.match(simpleAgeRegex);
                        if (simpleAgeMatch) {
                            matchedStr = simpleAgeMatch[1]; // берем саму группу цифр
                            const age = parseInt(simpleAgeMatch[1], 10);
                            dobIso = '';
                            tAge = age;
                        }
                    }
                }
            }
            
            // Вырезаем дату/возраст/год из строки если найдено
            let namePart = line;
            if (matchedStr) {
                namePart = line.replace(matchedStr, '');
            }
            
            // Убираем указание возраста типа "(29 жас)", "29 жас", "(7 лет)", "7 лет"
            namePart = namePart.replace(/\(?\b\d+\s*(?:жас|лет|год[а-я]*|yo|y\.o\.|years?|old)(?![a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ0-9])\)?/ig, '');
            namePart = namePart.replace(/\(\s*\d+\s*\)/g, ''); // числа в круглых скобках
            
            // Убираем обращения (MR, MRS, MS, CHD, INF, ADL, SNR, INV, PAX и т.д.)
            namePart = namePart.replace(/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:mr|mrs|ms|chd|inf|adl|snr|inv|pax|adults?|pensioners?|children|infants?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/ig, ' ');
            
            // Убираем категории на трех языках
            namePart = namePart.replace(/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:взр(?:осл[а-я]*)?|реб(?:ен[окац]+)?|дети|дет(?:и|ям|ей|ях)?|млад(?:ен[а-я]*)?|пенс(?:ионер[а-я]*)?|инв(?:алид[а-я]*)?|зейнеткер(?:лер)?|зийнеткер(?:лер)?|мүгедек(?:тер)?|бала(?:лар)?|үлкен(?:дер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/ig, ' ');
            
            // Убираем CRM-метки и мусорные слова
            namePart = namePart.replace(/дата\s*рожд[а-яА-Я]*/ig, '');
            namePart = namePart.replace(/data\s*rozhd[a-zA-Z]*/ig, '');
            namePart = namePart.replace(/\bд\.?р\.?\b/ig, '');
            namePart = namePart.replace(/\bd\.?r\.?\b/ig, '');
            namePart = namePart.replace(/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:билет|пассажир|итого|сумма|заявка|бронь|турист|тур|пакс)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/ig, ' ');
            
            // ПРОВЕРКА НА СТРАННЫЕ ДАННЫЕ (непонятные цифры)
            // Исключаем слово "Гость N", которое генерируется самим приложением
            let checkName = namePart.replace(/гость\s*\d+/ig, '');
            const hasStrayNumbers = /\d/.test(checkName);

            // Очищаем имя от лишних символов (оставляем только буквы трех языков, дефисы и апострофы)
            namePart = namePart.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s\-\']/g, ' ').trim();
            namePart = namePart.replace(/^-+|-+$|^\'+|\'+$/g, '').trim();
            namePart = namePart.replace(/\s+/g, ' ');
            namePart = sanitizeProfanity(namePart);

            const wordsCount = namePart.split(' ').length;
            const hasDateOrAge = dobIso || tAge !== undefined || tYear !== undefined || parsedCategory;
            const isSuspicious = !hasDateOrAge && wordsCount < 2;

            if (namePart.length >= 2 && !hasStrayNumbers && (!isSuspicious || isForced)) {
                // Делаем первые буквы заглавными
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
                
                // Если категория определена из текста
                if (parsedCategory) {
                    touristObj.category = parsedCategory;
                    touristObj.categoryManuallySet = true;
                } else if (!dobIso && tAge === undefined && tYear === undefined) {
                    // Дефолтная категория, если нет дат
                    touristObj.category = 'ADL';
                    touristObj.categoryManuallySet = false;
                }
                
                // Проверка на дубликат (полное совпадение имени и даты/возраста)
                const isCleanState = Object.values(quickCounts).every(v => v === 0);
                const isDuplicate = tourists.some(t => 
                    t.fullName.toLowerCase() === touristObj.fullName.toLowerCase() && 
                    t.dob === touristObj.dob && 
                    t.age === touristObj.age && 
                    t.year === touristObj.year
                );

                if (!isDuplicate) {
                    tourists.push(touristObj);
                } else {
                    unrecognizedLines.push(originalLine + " (Дубликат)");
                }
            } else {
                unrecognizedLines.push(originalLine);
            }
        });
        
        // Удаляем пустую строку по умолчанию
        if (tourists.length > 1 && tourists[0].fullName === '' && tourists[0].dob === '') {
            tourists.shift();
        }

        render();
        
        if (unrecognizedLines.length > 0) {
            bulkText.value = unrecognizedLines.join('\n');
            if (!isForced) {
                window.showToast(`Часть строк подозрительна (нет дат или одно слово). Если всё верно, нажмите еще раз.`, 'fa-triangle-exclamation', 'bg-amber-500');
            } else {
                window.showToast(`Часть гостей не распознана (${unrecognizedLines.length} строк)`, 'fa-triangle-exclamation', 'bg-amber-500');
                lastAttemptedText = '';
            }
        } else {
            bulkText.value = '';
            lastAttemptedText = '';
        }
    });

    function createId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    window.clearAllTourists = function() {
        if (confirm('Вы уверены, что хотите удалить всех гостей и начать заново?')) {
            tourists = [];
            
            // Сбрасываем дату визита на сегодня
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

    function removeTourist(id, btnElement) {
        if (btnElement) {
            const row = btnElement.closest('.tourist-row');
            if (row) {
                row.classList.remove('animate-row-in');
                row.classList.add('animate-row-out');
                setTimeout(() => {
                    tourists = tourists.filter(t => t.id !== id);
                    render();
                }, 250);
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
        
        // 1. Проверяем, полная ли это дата (например, 15.06.1990)
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
        
        // 2. Проверяем, только ли это год (например, 4 цифры типа 2018)
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
        
        // 3. Проверяем, только ли это возраст (например, 1 или 2 цифры типа 35)
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
        
        // Если не распознали, записываем как dob
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
            if (value !== 'INV') {
                tourist.disability = 'none';
            } else if (tourist.disability === 'none' || !tourist.disability) {
                const visitDate = visitDateInput ? visitDateInput.value : '';
                const age = tourist.age !== undefined ? tourist.age : calculateAge(tourist.dob, visitDate);
                if (age !== null && age >= 4 && age <= 11) {
                    tourist.disability = '3';
                } else {
                    tourist.disability = '1';
                }
            }
            render();
        }
    }

    function guessGender(name) {
        if (!name) return 'male';
        const cleanName = name.trim().toLowerCase();
        const words = cleanName.split(/\s+/);
        
        for (let word of words) {
            // 1. Женские окончания (казахские отчества и фамилии)
            if (word.endsWith('қызы') || word.endsWith('kyzy') || word.endsWith('qyzy')) return 'female';
            // 2. Мужские окончания (казахские отчества)
            if (word.endsWith('ұлы') || word.endsWith('uly') || word.endsWith('улы')) return 'male';
            
            // 3. Русские отчества
            if (word.endsWith('овна') || word.endsWith('евна') || word.endsWith('ична')) return 'female';
            if (word.endsWith('ович') || word.endsWith('евич') || word.endsWith('ич')) return 'male';
            if (word.endsWith('ovna') || word.endsWith('evna') || word.endsWith('ichna')) return 'female';
            if (word.endsWith('ovich') || word.endsWith('evich') || word.endsWith('ich')) return 'male';
            
            // 4. Русские/казахские фамилии на ova/eva/ina/aya/ова/ева/ина/ая
            if (word.endsWith('ова') || word.endsWith('ева') || word.endsWith('ина') || word.endsWith('ая')) return 'female';
            if (word.endsWith('ova') || word.endsWith('eva') || word.endsWith('ina') || word.endsWith('aya')) return 'female';
            
            // 5. Окончания казахских женских имен (нұр/нур/nur, гүл/гул/gul, ым/ім/ym/im)
            if (word.endsWith('нұр') || word.endsWith('нур') || word.endsWith('nur')) return 'female';
            if (word.endsWith('гүл') || word.endsWith('гул') || word.endsWith('gul')) return 'female';
            if (word.endsWith('ным') || word.endsWith('лым') || word.endsWith('рым') || word.endsWith('ным')) return 'female';
            
            // Известные женские имена без четких окончаний
            if (word.endsWith('айым') || word.endsWith('ару') || word.endsWith('аружан') || word.endsWith('улжан') || 
                word.endsWith('ұлжан') || word.endsWith('асем') || word.endsWith('әсем') || word.endsWith('асель') || 
                word.endsWith('әсел') || word.endsWith('айгерім') || word.endsWith('айгерим') || word.endsWith('арайлым')) {
                return 'female';
            }
            
            // 6. Окончания мужских имен/фамилий на ов/ев/ин/ий
            if (word.endsWith('ов') || word.endsWith('ев') || word.endsWith('ин') || word.endsWith('ий')) return 'male';
            if (word.endsWith('ov') || word.endsWith('ev') || word.endsWith('in') || word.endsWith('iy') || word.endsWith('y')) {
                // Если это Seidaly - это фамилия, может быть и мужской и женской. Но по дефолту оставим male.
            }
        }
        
        // Вторая итерация по отдельным словам для поиска женских окончаний на -а / -я в именах
        for (let word of words) {
            if (word.length > 2 && (word.endsWith('а') || word.endsWith('я') || word.endsWith('a') || word.endsWith('ya'))) {
                // Исключаем мужские имена/отчества
                if (!word.endsWith('овича') && !word.endsWith('евича') && !word.endsWith('ича') && 
                    !word.endsWith('илья') && !word.endsWith('никита') && !word.endsWith('данила') && !word.endsWith('баха')) {
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

    function calculateAge(dobStr, visitDateStr) {
        if (!dobStr || !visitDateStr) return null;
        const dob = new Date(dobStr);
        const visit = new Date(visitDateStr);
        let age = visit.getFullYear() - dob.getFullYear();
        
        if (visit.getMonth() < dob.getMonth() || (visit.getMonth() === dob.getMonth() && visit.getDate() < dob.getDate())) {
            age--;
        }
        
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
        for (let p of periods) {
            if (md >= p.start && md <= p.end) {
                activePeriod = p;
                break;
            }
        }
        
        if (!activePeriod) return -1; // -1 означает что нет тарифа
        
        if (passengerCategory === 'INF') return 0; // Младенцы всегда бесплатно по базе
        
        const priceCategory = (passengerCategory === 'SNR' || passengerCategory === 'INV') ? 'ADL' : passengerCategory;
        return activePeriod[clientType][priceCategory] || 0;
    }

    function calculateDiscount(dobStr, visitDateStr, disability, age, gender, category) {
        if (!visitDateStr) return { percent: 0, isBirthday: false, isPensioner: false, isInfant: false };
        
        let maxDiscount = 0;
        
        if (age !== null && age <= 3) maxDiscount = Math.max(maxDiscount, 100);
        if (disability === '1') maxDiscount = Math.max(maxDiscount, 100);
        
        let isBirthday = false;
        if (dobStr) {
            const dob = new Date(dobStr);
            const visit = new Date(visitDateStr);
            isBirthday = dob.getDate() === visit.getDate() && dob.getMonth() === visit.getMonth();
        }
        if (isBirthday) maxDiscount = Math.max(maxDiscount, 50);
        
        const retirementAge = getRetirementAge(gender, visitDateStr);
        const isPensioner = (age !== null && age >= retirementAge) || category === 'SNR';
        if (isPensioner) maxDiscount = Math.max(maxDiscount, 50);
        
        if (disability === '2') maxDiscount = Math.max(maxDiscount, 15);
        if (disability === '3') maxDiscount = Math.max(maxDiscount, 10);
        
        return { percent: maxDiscount, isBirthday: isBirthday, isPensioner: isPensioner, isInfant: age !== null && age <= 3 };
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

        // Управление видимостью кнопки Раннего Бронирования
        if (visitDate && earlyBookingContainer) {
            const vDate = new Date(visitDate);
            const today = new Date();
            // Акция действует СТРОГО 28, 29, 30 июня
            const isPromoDays = today.getMonth() === 5 && (today.getDate() >= 28 && today.getDate() <= 30);
            
            // Месяц июль (0-индексация, значит 6)
            if (vDate.getMonth() === 6 && isPromoDays) {
                earlyBookingContainer.classList.remove('hidden');
            } else {
                earlyBookingContainer.classList.add('hidden');
                if (earlyBookingToggle) earlyBookingToggle.checked = false;
            }
        }

        // Управление бейджом "Раннее бронирование" в итоге
        if (earlyBookingBadge && earlyBookingToggle) {
            if (earlyBookingToggle.checked) {
                earlyBookingBadge.classList.remove('hidden');
            } else {
                earlyBookingBadge.classList.add('hidden');
            }
        }

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

        // Для статистики
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

            let category = getPassengerCategory(age, t.gender, visitDate);
            if (t.categoryManuallySet && t.category) {
                category = t.category;
            } else if (age === null && t.category) {
                category = t.category;
            }
            t.category = category;
            
            const basePrice = getBasePrice(visitDate, clientType, tariffType, category);
            
            if (basePrice === -1) isTariffFound = false;

            const today = new Date();
            const vDate = visitDate ? new Date(visitDate) : null;
            // Акция применяется, если галочка включена (а галочка доступна только для июля)
            const earlyBookingEnabled = earlyBookingToggle ? earlyBookingToggle.checked : false;
            const discountInfo = calculateDiscount(t.dob, visitDate, category === 'INV' ? t.disability : 'none', age, t.gender, category);
            let discountPercent = discountInfo.percent || 0;
            
            if (category === 'INV' && t.disability !== '2' && t.disability !== '3') {
                discountPercent = 100;
            }
            
            // Акция Раннего Бронирования (15%) не действует на инвалидов, именинников и пенсионеров
            const hasOtherDiscounts = discountInfo.isBirthday || discountInfo.isPensioner || (t.disability && t.disability !== '0' && t.disability !== 'none');
            if (earlyBookingEnabled && !hasOtherDiscounts && discountPercent < 100 && age >= 4) {
                discountPercent = Math.max(discountPercent, CONFIG.discounts.earlyBooking);
            }
            
            let finalPrice = 0;
            if (basePrice > 0) {
                finalPrice = basePrice * (1 - discountPercent / 100);
            }

            // Накопление статистики
            if (category === 'ADL') counts.adl++;
            if (category === 'CHLD') counts.chld++;
            if (category === 'INF') counts.inf++;
            if (category === 'SNR') counts.pens++;
            if (category === 'INV' || t.disability === '1' || t.disability === '2' || t.disability === '3') counts.inv = (counts.inv || 0) + 1;
            if (discountInfo.isBirthday) counts.bday++;

            totalSum += finalPrice;

            // Строка для экспорта (подготовка данных)
            if (t.fullName && (t.dob || t.age !== undefined || t.year !== undefined)) {
                let tags = [];
                if (discountInfo.isBirthday) tags.push("ДР");
                if (t.disability === '1') tags.push("Инв 100%");
                if (t.disability === '2') tags.push("Инв 15%");
                if (t.disability === '3') tags.push("Инв 10%");

                let formattedDob = '';
                if (t.dob) {
                    formattedDob = formatDate(t.dob);
                } else if (t.year !== undefined) {
                    formattedDob = `${t.year} г.`;
                } else if (t.age !== undefined) {
                    formattedDob = `${t.age} лет`;
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

            // Динамический бейдж с микро-анимацией (свечение)
            // Динамический стиль для выпадающего списка типа (бейдж)
            let catSelectClass = 'border-slate-200 text-slate-700 bg-white';
            if (category === 'ADL') catSelectClass = 'bg-blue-50 text-blue-600 border-blue-200';
            if (category === 'SNR') catSelectClass = 'bg-purple-50 text-purple-600 border-purple-200';
            if (category === 'CHLD') catSelectClass = 'bg-teal-50 text-teal-600 border-teal-200';
            if (category === 'INF') catSelectClass = 'bg-green-50 text-green-600 border-green-200';
            if (category === 'INV') catSelectClass = 'bg-rose-50 text-rose-600 border-rose-200';

            // Создание DOM элемента строки
            const row = document.createElement('div');
            row.className = 'tourist-row p-1.5 md:p-1 flex flex-col md:grid md:grid-cols-12 gap-1.5 md:gap-1 items-start md:items-center transition-all relative hover:bg-slate-50 animate-row-in';
            row.innerHTML = `
                <!-- Mobile Label: Delete Button -->
                <div class="absolute top-1.5 right-1.5 md:static md:col-span-1 md:w-full flex justify-end md:order-last">
                    <button onclick="removeTourist('${t.id}', this)" class="btn-danger p-0.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Удалить">
                        <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
                    </button>
                </div>
                
                <div class="w-full flex gap-2 pr-6 md:pr-0 md:contents">
                    <!-- Full Name -->
                    <div class="flex-1 md:col-span-3 w-full relative">
                        <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5 block">ФИО (Рус/Каз)</label>
                        <input type="text" placeholder="ФИО туриста" value="${t.fullName}" 
                            onblur="updateTourist('${t.id}', 'fullName', this.value)"
                            class="w-full text-left bg-transparent text-slate-800 border ${!t.fullName ? 'border-red-300 bg-red-50/40' : 'border-transparent'} hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-2 py-1 text-xs font-medium transition-colors ${discountInfo.isBirthday ? 'pr-7' : ''}">
                        ${discountInfo.isBirthday ? '<div class="absolute right-2 top-[calc(50%+4px)] md:top-1/2 -translate-y-1/2 text-amber-500 text-[10px]" title="Именинник"><i class="fa-solid fa-cake-candles"></i></div>' : ''}
                    </div>
                    
                    <!-- DOB -->
                    <div class="w-[100px] shrink-0 md:w-full md:col-span-2">
                        <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5 block">Дата рожд.</label>
                        <input type="text" value="${displayDob}" 
                            placeholder="дд.мм.гггг или гггг"
                            onblur="updateTouristDobDirect('${t.id}', this.value)"
                            class="w-full text-left bg-transparent text-slate-800 border ${(!t.dob && t.age === undefined && t.year === undefined) ? 'border-red-300 bg-red-50/40' : 'border-transparent'} hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-0.5 py-1 text-xs font-medium transition-colors">
                    </div>
                </div>
                
                <!-- Stats Row (Age, Category, Price) -->
                <div class="col-span-12 w-full flex flex-wrap justify-between items-center mt-1 md:mt-0 md:contents border-t border-slate-100 md:border-0 pt-1.5 md:pt-0">
                    <div class="flex space-x-2 sm:space-x-4 md:space-x-6 md:contents">
                        <!-- Age -->
                        <div class="md:col-span-1 text-left md:text-center flex flex-col items-start md:items-center">
                            <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5">Возраст</label>
                            <span class="text-xs font-bold ${age === null ? 'text-slate-400' : 'text-[#0076ba]'}">
                                ${age !== null ? age : '-'}
                            </span>
                        </div>
                        
                        <!-- Category -->
                        <div class="md:col-span-1 text-left md:text-center flex flex-col items-start md:items-center w-full md:w-auto">
                            <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5">Тип</label>
                            <select onchange="updateTouristCategory('${t.id}', this.value)"
                                class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${catSelectClass} focus:outline-none transition-all duration-300 cursor-pointer text-center w-full md:w-auto">
                                <option value="ADL" ${category === 'ADL' ? 'selected' : ''}>ADL</option>
                                <option value="CHLD" ${category === 'CHLD' ? 'selected' : ''}>CHLD</option>
                                <option value="INF" ${category === 'INF' ? 'selected' : ''}>INF</option>
                                <option value="SNR" ${category === 'SNR' ? 'selected' : ''}>SNR</option>
                                <option value="INV" ${category === 'INV' ? 'selected' : ''}>INV</option>
                            </select>
                        </div>

                        <!-- Disability -->
                        <div class="md:col-span-2 text-left md:text-center flex flex-col items-start md:items-center w-full md:w-auto">
                            ${category === 'INV' ? `
                            <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5">Льгота</label>
                            <select onchange="updateTourist('${t.id}', 'disability', this.value)"
                                class="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 bg-white focus:outline-none transition-all duration-300 cursor-pointer text-center w-full md:w-auto">
                                <option value="1" ${t.disability === '1' || t.disability === 'none' ? 'selected' : ''}>Инв 1 кат. (100%)</option>
                                <option value="2" ${t.disability === '2' ? 'selected' : ''}>Инв 2 кат. (15%)</option>
                                <option value="3" ${t.disability === '3' ? 'selected' : ''}>Инв 3 кат. (10%)</option>
                            </select>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Price -->
                    <div class="md:col-span-2 text-right flex flex-col items-end justify-center pr-2">
                        ${discountPercent > 0 ? `<span class="badge-discount text-[8px] px-1.5 py-0.5 rounded-full mb-0.5 leading-none font-bold">-${discountPercent}%</span>` : ''}
                        <span class="text-xs font-bold ${finalPrice > 0 ? 'text-slate-900' : 'text-slate-400'}">
                            ${basePrice === -1 ? 'Нет тарифа' : Math.round(finalPrice).toLocaleString('ru-RU')} ₸
                        </span>
                    </div>
                </div>
            `;
            
            touristListEl.appendChild(row);
        });

        // Обновление итогов с учетом промокода
        let finalTotalSum = totalSum;
        let appliedPromo = null;
        
        if (promoInput && promoInput.value.trim().toUpperCase() in CONFIG.promocodes) {
            appliedPromo = CONFIG.promocodes[promoInput.value.trim().toUpperCase()];
            if (appliedPromo.type === 'percent') {
                finalTotalSum = totalSum * (1 - appliedPromo.value / 100);
            } else if (appliedPromo.type === 'fixed') {
                finalTotalSum = Math.max(0, totalSum - appliedPromo.value);
            }
        }
        
        totalPriceEl.textContent = Math.round(finalTotalSum).toLocaleString('ru-RU');
        
        if (!isTariffFound) {
            dateWarning.classList.remove('hidden');
        } else {
            dateWarning.classList.add('hidden');
        }

        // Обновление статистики
        stats.adl.textContent = counts.adl;
        stats.chld.textContent = counts.chld;
        stats.inf.textContent = counts.inf;
        stats.pens.textContent = counts.pens;
        if (stats.inv) stats.inv.textContent = counts.inv || 0;
        stats.bday.textContent = counts.bday;

        let exportText = `${visitDate ? formatDate(visitDate) : 'Не указана'}\n`;
        exportText += `Тариф: ${tariffType === 'evening' ? 'Вечерний' : 'Дневной'}\n\n`;

        if (currentCalcMode === 'quick') {
            exportText += `Состав гостей:\n`;
            let hasQuickGuests = false;
            if (quickCounts.adl > 0) { exportText += `Взрослые ADL: ${quickCounts.adl}\n`; hasQuickGuests = true; }
            if (quickCounts.chld > 0) { exportText += `Дети CHLD: ${quickCounts.chld}\n`; hasQuickGuests = true; }
            if (quickCounts.pens > 0) { exportText += `Пенсионеры SNR: ${quickCounts.pens}\n`; hasQuickGuests = true; }
            if (quickCounts.inf > 0) { exportText += `Младенцы INF: ${quickCounts.inf}\n`; hasQuickGuests = true; }
            if (quickCounts.inv > 0) { exportText += `Инвалиды 1 кат. INV: ${quickCounts.inv}\n`; hasQuickGuests = true; }
            if (quickCounts.inv2 > 0) { exportText += `Инвалиды 2 кат. INV2: ${quickCounts.inv2}\n`; hasQuickGuests = true; }
            if (quickCounts.inv3 > 0) { exportText += `Инвалиды 3 кат. INV3: ${quickCounts.inv3}\n`; hasQuickGuests = true; }
            if (!hasQuickGuests) {
                exportText += 'Пусто\n';
            }
        } else {
            // Сортируем: у кого ДР - в самый конец списка
            exportDataList.sort((a, b) => {
                if (a.isBirthday && !b.isBirthday) return 1;
                if (!a.isBirthday && b.isBirthday) return -1;
                return 0;
            });

            // Формируем финальные строки
            let exportLines = exportDataList.map((item) => {
                const tagsStr = item.tags.length > 0 ? ` (${item.tags.join(', ')})` : '';
                return `${item.translitName.toUpperCase()} ${item.formattedDob}${tagsStr} ${item.category}`;
            });

            exportText += `Список гостей:\n`;
            exportText += exportLines.length > 0 ? exportLines.join('\n') : 'Пусто';
        }

        if (appliedPromo) {
            exportText += `\nПромокод: ${promoInput.value.trim().toUpperCase()} (-${appliedPromo.value}${appliedPromo.type === 'percent' ? '%' : ' ₸'})`;
        }
        if (commentInput && commentInput.value.trim()) {
            exportText += `\nКомментарий: ${commentInput.value.trim()}`;
        }
        exportText += `\n\nИТОГО: ${Math.round(finalTotalSum).toLocaleString('ru-RU')} тенге`;

        // Экспорт данных
        exportDataEl.value = exportText;
        exportDataEl.style.height = 'auto';
        exportDataEl.style.height = exportDataEl.scrollHeight + 'px';

        // Применяем поиск, если он активен
        const searchInput = document.getElementById('guestSearchInput');
        if (searchInput && searchInput.value) {
            if (window.filterGuests) {
                window.filterGuests(searchInput.value);
            }
        }

        // Авто-сохранение
        saveDraft();

        // Для доступа из HTML
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
            quickCounts: quickCounts,
            promo: promoInput ? promoInput.value : '',
            comment: commentInput ? commentInput.value : ''
        };
        localStorage.setItem('tetisBluDraft', JSON.stringify(data));
    }

    function syncDetailedToQuick() {
        let counts = { adl: 0, chld: 0, pens: 0, inf: 0, inv: 0, inv2: 0, inv3: 0 };
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
            let category = getPassengerCategory(age, t.gender, visitDate);
            if (t.categoryManuallySet && t.category) {
                category = t.category;
            } else if (age === null && t.category) {
                category = t.category;
            }

            if (t.disability === '1' || category === 'INV') {
                counts.inv++;
            } else if (t.disability === '2') {
                counts.inv2++;
            } else if (t.disability === '3') {
                counts.inv3++;
            } else if (category === 'ADL') counts.adl++;
            else if (category === 'CHLD') counts.chld++;
            else if (category === 'SNR') counts.pens++;
            else if (category === 'INF') counts.inf++;
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
                fullName: `Гость ${tourists.length + 1}`,
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
                fullName: `Гость ${tourists.length + 1}`,
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
                fullName: `Гость ${tourists.length + 1}`,
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
                fullName: `Гость ${tourists.length + 1}`,
                dob: `${visitYear - 1}-06-15`,
                gender: 'male',
                genderManuallySet: false,
                disability: 'none'
            });
        }
        // Add Disabled (INV)
        for (let i = 0; i < quickCounts.inv; i++) {
            tourists.push({
                id: createId(),
                fullName: `Гость ${tourists.length + 1}`,
                dob: `${visitYear - 30}-06-15`,
                gender: 'male',
                genderManuallySet: false,
                disability: '1',
                category: 'INV',
                categoryManuallySet: true
            });
        }
        // Add Disabled 2nd Category (INV2)
        for (let i = 0; i < quickCounts.inv2; i++) {
            tourists.push({
                id: createId(),
                fullName: `Гость ${tourists.length + 1}`,
                dob: `${visitYear - 30}-06-15`,
                gender: 'male',
                genderManuallySet: false,
                disability: '2',
                category: 'INV',
                categoryManuallySet: true
            });
        }
        // Add Disabled 3rd Category (INV3) - Adults
        for (let i = 0; i < quickCounts.inv3; i++) {
            tourists.push({
                id: createId(),
                fullName: `Гость ${tourists.length + 1}`,
                dob: `${visitYear - 30}-06-15`,
                gender: 'male',
                genderManuallySet: false,
                disability: '3',
                category: 'INV',
                categoryManuallySet: true
            });
        }
        // Add Disabled Children (CHLD_INV)
        for (let i = 0; i < quickCounts.chld_inv; i++) {
            tourists.push({
                id: createId(),
                fullName: `Гость ${tourists.length + 1}`,
                dob: `${visitYear - 8}-06-15`,
                gender: 'male',
                genderManuallySet: false,
                disability: '3',
                category: 'INV',
                categoryManuallySet: true
            });
        }
    }

    function updateQuickInputsDOM() {
        const adlEl = document.getElementById('quick_adl');
        const chldEl = document.getElementById('quick_chld');
        const pensEl = document.getElementById('quick_pens');
        const infEl = document.getElementById('quick_inf');
        const invEl = document.getElementById('quick_inv');
        const inv2El = document.getElementById('quick_inv2');
        const inv3El = document.getElementById('quick_inv3');
        const chldInvEl = document.getElementById('quick_chld_inv');
        if (adlEl) adlEl.value = quickCounts.adl;
        if (chldEl) chldEl.value = quickCounts.chld;
        if (pensEl) pensEl.value = quickCounts.pens;
        if (infEl) infEl.value = quickCounts.inf;
        if (invEl) invEl.value = quickCounts.inv;
        if (inv2El) inv2El.value = quickCounts.inv2;
        if (inv3El) inv3El.value = quickCounts.inv3;
        if (chldInvEl) chldInvEl.value = quickCounts.chld_inv;
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
            
            if (tourists.length === 0 && (quickCounts.adl > 0 || quickCounts.chld > 0 || quickCounts.pens > 0 || quickCounts.inf > 0 || quickCounts.inv > 0)) {
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
            
            if (quickCounts.adl === 0 && quickCounts.chld === 0 && quickCounts.pens === 0 && quickCounts.inf === 0 && quickCounts.inv === 0 && quickCounts.inv2 === 0 && quickCounts.inv3 === 0) {
                syncDetailedToQuick();
            }
        }
        
        render();
    }

    function changeQuickCount(category, delta) {
        // Валидация: Дети и малыши не могут быть без взрослых (adl) или пенсионеров (pens)
        if ((category === 'chld' || category === 'inf') && delta > 0 && quickCounts.adl === 0 && quickCounts.pens === 0) {
            if (window.showToast) {
                window.showToast('Дети могут посещать парк только в сопровождении взрослых', 'fa-triangle-exclamation', 'bg-amber-500');
            }
            return;
        }

        quickCounts[category] = Math.max(0, quickCounts[category] + delta);
        
        // Авто-сброс детей, если убрали взрослых
        if ((category === 'adl' || category === 'pens') && quickCounts.adl === 0 && quickCounts.pens === 0) {
            quickCounts.chld = 0;
            quickCounts.inf = 0;
        }

        updateQuickInputsDOM();
        syncQuickToDetailed();
        render();
    }

    function updateQuickCount(category, val) {
        const newVal = Math.max(0, parseInt(val) || 0);
        
        if ((category === 'chld' || category === 'inf') && newVal > quickCounts[category] && quickCounts.adl === 0 && quickCounts.pens === 0) {
            if (window.showToast) {
                window.showToast('Дети могут посещать парк только в сопровождении взрослых', 'fa-triangle-exclamation', 'bg-amber-500');
            }
            updateQuickInputsDOM(); // вернуть старое значение в инпут
            return;
        }

        quickCounts[category] = newVal;
        
        if ((category === 'adl' || category === 'pens') && quickCounts.adl === 0 && quickCounts.pens === 0) {
            quickCounts.chld = 0;
            quickCounts.inf = 0;
        }

        updateQuickInputsDOM();
        syncQuickToDetailed();
        render();
    }

    function resetQuickCounts() {
        quickCounts = { adl: 0, chld: 0, pens: 0, inf: 0, inv: 0, inv2: 0, inv3: 0 };
        updateQuickInputsDOM();
        syncQuickToDetailed();
        render();
    }

    window.switchCalcMode = switchCalcMode;
    window.changeQuickCount = changeQuickCount;
    window.updateQuickCount = updateQuickCount;
    window.resetQuickCounts = resetQuickCounts;

    function validateAccompaniment() {
        const adlStat = parseInt(document.getElementById('statAdl').textContent) || 0;
        const pensStat = parseInt(document.getElementById('statPens').textContent) || 0;
        const chldStat = parseInt(document.getElementById('statChld').textContent) || 0;
        const infStat = parseInt(document.getElementById('statInf').textContent) || 0;
        
        if ((chldStat > 0 || infStat > 0) && adlStat === 0 && pensStat === 0) {
            if (window.showToast) {
                window.showToast('Внимание! Дети не могут быть в чеке без взрослых.', 'fa-triangle-exclamation', 'bg-red-500');
            }
            return false;
        }
        return true;
    }

    function copyExportData() {
        if (!validateAccompaniment()) return;
        if (!exportDataEl.value) return;
        
        navigator.clipboard.writeText(exportDataEl.value).then(() => {
            const originalHTML = copyExportBtn.innerHTML;
            copyExportBtn.innerHTML = '<i class="fa-solid fa-check mr-1.5"></i> Скопировано';
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

    // --- ЛОГИКА ДНЯ РОЖДЕНИЯ ---
    // --- ЛОГИКА ГЕНЕРАЦИИ ЧЕКА КАРТИНКОЙ ---
    const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', generateReceiptImage);
    }
    
    // --- ЛОГИКА ОТПРАВКИ (SHARE TEXT / IMAGE) ---
    const nativeShareBtn = document.getElementById('nativeShareBtn');

    function getShareText() {
        if (!validateAccompaniment()) return '';
        saveToHistory();
        const text = exportDataEl.value;
        return `*Официальный расчет Tetys Blu*\n\n${text}`;
    }

    // Общая функция для шаринга картинки чека
    async function shareReceiptImage(btn) {
        if (!validateAccompaniment()) return;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin sm:mr-1.5"></i> <span class="hidden sm:inline">Подождите...</span>';
        try {
            const { shareData, dataUrl } = await generateImageForShare();
            
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                throw new Error('ShareNotSupported');
            }
        } catch (e) {
            if (e.name !== 'AbortError') {
                console.error('Share Error:', e);
                // Из-за ограничений безопасности Safari (iOS) и некоторых Android, 
                // если генерация картинки заняла время, браузер блокирует окно "Поделиться".
                // В качестве запасного плана - просто скачиваем картинку!
                window.showToast('Браузер заблокировал окно. Чек автоматически скачан!', 'fa-download', 'bg-[#0076ba]');
                
                // Эмулируем нажатие "Скачать"
                const downloadBtn = document.getElementById('downloadReceiptBtn');
                if (downloadBtn) {
                    downloadBtn.click();
                }
            }
        } finally {
            btn.innerHTML = originalHtml;
        }
    }

    if (nativeShareBtn) {
        nativeShareBtn.addEventListener('click', function() {
            shareReceiptImage(this);
        });
    }

    const whatsappShareBtn = document.getElementById('whatsappShareBtn');
    if (whatsappShareBtn) {
        whatsappShareBtn.addEventListener('click', async function() {
            if (!validateAccompaniment()) return;
            const originalHtml = this.innerHTML;
            this.innerHTML = '<i class="fa-solid fa-spinner fa-spin sm:mr-1.5 text-white"></i> <span class="hidden sm:inline">Отправка...</span>';
            try {
                saveToHistory();
                const { shareData } = await generateImageForShare();
                const file = shareData.files[0];
                let copied = false;
                
                // Пробуем скопировать картинку в буфер
                if (navigator.clipboard && navigator.clipboard.write) {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [file.type]: file
                        })
                    ]);
                    copied = true;
                }
                
                // Открываем WhatsApp без приветственного текста
                window.open('https://wa.me/', '_blank');
                
                if (copied) {
                    window.showToast('Картинка скопирована! В WhatsApp нажмите "Вставить" (Paste)', 'fa-check', 'bg-green-600');
                }
            } catch (err) {
                console.error('Ошибка копирования:', err);
                // Если не удалось скопировать картинку (ограничения браузера), просто отправляем текстовую версию
                const text = getShareText();
                if (text) {
                    const encodedText = encodeURIComponent(text);
                    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
                    window.showToast('Браузер запретил копировать картинку. Отправлен текстовый чек.', 'fa-info-circle', 'bg-amber-500');
                }
            } finally {
                this.innerHTML = originalHtml;
            }
        });
    }

    function sendToEmail() {
        if (!validateAccompaniment()) return;
        saveToHistory();
        const text = exportDataEl.value;
        if (!text) return;
        
        // Парсим текст для темы и тела
        const lines = text.split('\n');
        let dateStr = lines[0].trim(); // Первая строка теперь дата
        let tariffStr = '';
        let bodyText = '';
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('Тариф:')) {
                tariffStr = lines[i].trim();
            } else if (lines[i].startsWith('Список гостей:') || lines[i].startsWith('Состав гостей:')) {
                // Все оставшиеся строки — это тело
                bodyText = lines.slice(i).join('\n').trim();
                break;
            }
        }
        
        const subject = `${dateStr} | ${tariffStr}`;
        
        // Проверяем, мобильное ли это устройство
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // На смартфоне открываем нативное приложение почты (Mail, Gmail app и т.д.)
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        } else {
            // На ПК открываем Gmail в браузере в новой вкладке
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
            window.open(gmailUrl, '_blank');
        }
    }
    
    const emailExportBtn = document.getElementById('emailExportBtn');
    if (emailExportBtn) {
        emailExportBtn.addEventListener('click', sendToEmail);
    }

    async function generateImageForShare() {
        return new Promise((resolve, reject) => {
            const container = document.getElementById('receiptContainer');
            const content = document.getElementById('receiptContent');
            
            fillReceiptData();
            
            // Временно достаем блок для рендера
            content.classList.remove('opacity-0', 'pointer-events-none');
            document.body.appendChild(content); 
            content.style.position = 'fixed';
            content.style.top = '0';
            content.style.left = '0';
            content.style.zIndex = '-9999';
            
            html2canvas(content, { scale: 2, backgroundColor: '#ffffff', logging: false }).then(canvas => {
                // Возвращаем элемент на место
                content.style.position = '';
                content.style.top = '';
                content.style.left = '';
                content.style.zIndex = '';
                content.classList.add('opacity-0', 'pointer-events-none');
                container.appendChild(content);
                
                const dataUrl = canvas.toDataURL('image/png');
                
                canvas.toBlob(async (blob) => {
                    if (!blob) return reject(new Error('Не удалось создать blob'));
                    
                    const formattedDate = visitDateInput ? visitDateInput.value : 'date';
                    const file = new File([blob], `TetysBlu_Check_${formattedDate}.png`, { type: 'image/png' });
                    
                    // ВАЖНО: Для iOS Safari мы передаем ТОЛЬКО файл. 
                    const shareData = {
                        files: [file]
                    };
                    
                    resolve({ shareData, dataUrl });
                }, 'image/png');
            }).catch(err => {
                // Возврат элемента на место в случае ошибки
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
        
        const clientText = clientType === 'agent' ? 'Турагент' : 'Турист';
        const tariffText = tariffTypeInput ? tariffTypeInput.options[tariffTypeInput.selectedIndex].text : 'Дневной тариф';
        
        metaEl.innerHTML = `
            <div class="flex justify-between items-center"><span class="text-[#0076ba]">Дата:</span> <span class="font-bold text-[#1e293b]">${formattedDate}</span></div>
            <div class="flex justify-between items-center"><span class="text-[#0076ba]">Клиент:</span> <span class="font-bold text-[#1e293b]">${clientText}</span></div>
            <div class="flex justify-between items-center"><span class="text-[#0076ba]">Тариф:</span> <span class="font-bold text-[#1e293b]">${tariffText}</span></div>
        `;
        
        touristsEl.innerHTML = '';
        if (currentCalcMode === 'quick') {
            let listHtml = '';
            if (quickCounts.adl > 0) {
                listHtml += `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-[#1e293b] text-[15px]">ВЗРОСЛЫЕ (ADL): ${quickCounts.adl}</div></div>`;
            }
            if (quickCounts.chld > 0) {
                listHtml += `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-[#1e293b] text-[15px]">ДЕТИ (CHLD): ${quickCounts.chld}</div></div>`;
            }
            if (quickCounts.pens > 0) {
                listHtml += `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-[#1e293b] text-[15px]">ПЕНСИОНЕРЫ (SNR): ${quickCounts.pens}</div></div>`;
            }
            if (quickCounts.inf > 0) {
                listHtml += `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-[#1e293b] text-[15px]">МЛАДЕНЦЫ (INF): ${quickCounts.inf}</div></div>`;
            }
            if (quickCounts.inv > 0) {
                listHtml += `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-[#1e293b] text-[15px]">ИНВАЛИДЫ (INV): ${quickCounts.inv}</div></div>`;
            }
            if (!listHtml) {
                listHtml = `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-slate-400 text-[15px]">СПИСОК ПУСТ</div></div>`;
            }
            touristsEl.innerHTML = listHtml;
        } else {
            tourists.forEach((t, i) => {
                if (!t.fullName && !t.dob && t.age === undefined && t.year === undefined) return; // Пропуск пустых строк
                
                // Рассчитываем возраст
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
                const discountInfo = calculateDiscount(t.dob, visitDateStr, t.disability, age, t.gender, category);
                let discountPercent = discountInfo.percent || 0;
                
                const earlyBookingEnabled = earlyBookingToggle ? earlyBookingToggle.checked : false;
                
                if (category === 'INV') {
                    discountPercent = 100;
                }
                
                // Акция Раннего Бронирования (15%) не действует на инвалидов, именинников и пенсионеров
                const hasOtherDiscounts = discountInfo.isBirthday || discountInfo.isPensioner || (t.disability && t.disability !== '0' && t.disability !== 'none');
                if (earlyBookingEnabled && !hasOtherDiscounts && discountPercent < 100 && age >= 4) {
                    discountPercent = Math.max(discountPercent, CONFIG.discounts.earlyBooking);
                }
                
                let finalPrice = 0;
                if (basePrice > 0) {
                    finalPrice = basePrice * (1 - discountPercent / 100);
                }

                // Форматируем ДР/возраст/год
                let formattedDob = '';
                if (t.dob) {
                    formattedDob = formatDate(t.dob);
                } else if (t.year !== undefined) {
                    formattedDob = `${t.year} г.`;
                } else if (t.age !== undefined) {
                    formattedDob = `${t.age} лет`;
                }

                const priceStr = basePrice === -1 ? 'Нет тарифа' : `${Math.round(finalPrice).toLocaleString('ru-RU')} ₸`;

                touristsEl.innerHTML += `
                    <div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3 tourist-row">
                        <div class="flex-1 pr-4">
                            <div class="font-bold text-[#1e293b] text-[15px] leading-relaxed break-words">
                                ${(t.fullName || 'Гость ' + (i+1)).toUpperCase()} 
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
    }

    function generateReceiptImage() {
        if (!validateAccompaniment()) return;
        saveToHistory(); // Сохраняем перед генерацией чека
        const container = document.getElementById('receiptContainer');
        const content = document.getElementById('receiptContent');
        const formattedDate = visitDateInput ? visitDateInput.value : 'date';
        
        // Сбор данных вынесен в отдельную функцию, чтобы переиспользовать в share
        fillReceiptData();
        
        // Временно достаем блок для рендера
        content.classList.remove('opacity-0', 'pointer-events-none');
        document.body.appendChild(content); 
        content.style.position = 'fixed';
        content.style.top = '0';
        content.style.left = '0';
        content.style.zIndex = '-9999';
        
        const originalBtnHtml = downloadReceiptBtn.innerHTML;
        downloadReceiptBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Создание...';
        
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
            window.showToast('Чек успешно сохранен!', 'fa-circle-check');
        }).catch(err => {
            console.error('Ошибка создания чека', err);
            downloadReceiptBtn.innerHTML = originalBtnHtml;
            window.showToast('Ошибка при создании чека', 'fa-triangle-exclamation', 'bg-red-500');
            
            // Возврат элемента на место в случае ошибки
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

    // --- ИСТОРИЯ РАСЧЕТОВ ---
    const historyBtn = document.getElementById('historyBtn');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyModal = document.getElementById('historyModal');
    const historyModalContent = document.getElementById('historyModalContent');
    const historyList = document.getElementById('historyList');

    const statisticsBtn = document.getElementById('statisticsBtn');
    const closeStatisticsBtn = document.getElementById('closeStatisticsBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const statisticsModal = document.getElementById('statisticsModal');
    const statisticsModalContent = document.getElementById('statisticsModalContent');
    const statisticsContent = document.getElementById('statisticsContent');

    const SUPABASE_URL = 'https://zlnxvraopnwyfebfhmdj.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_2q7uufBD_85Esjf-1Mwrvg_hItngDPG';
    
    // Инициализируем Supabase, если ключи не являются заглушками
    const supabaseClient = (typeof supabase !== 'undefined' && SUPABASE_URL !== 'ВАШ_SUPABASE_URL_ЗДЕСЬ') 
        ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
        : null;

    const historyDB = typeof localforage !== 'undefined' ? localforage.createInstance({
        name: "TetysBluCalc",
        storeName: "history"
    }) : null;

    async function saveToHistory() {
        if (!historyDB) return;
        if (tourists.length === 0 || (!tourists[0].fullName && !tourists[0].dob)) return;
        const total = parseInt(totalPriceEl.textContent.replace(/\D/g, '')) || 0;
        const currentUser = localStorage.getItem('tetysUser') || 'unknown';
        
        const record = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            visitDate: visitDateInput ? visitDateInput.value : '',
            clientType: clientTypeInput ? clientTypeInput.value : 'tourist',
            tariffType: tariffTypeInput ? tariffTypeInput.value : 'day',
            totalSum: total,
            tourists: JSON.parse(JSON.stringify(tourists)),
            promocode: promoInput ? promoInput.value.trim().toUpperCase() : '',
            comment: commentInput ? commentInput.value.trim() : ''
        };
        
        try {
            // Сохраняем локально (как бэкап)
            let history = await historyDB.getItem('tetysBluHistory') || [];
            if (history.length > 0) {
                const last = history[0];
                if (JSON.stringify(last.tourists) === JSON.stringify(record.tourists) && last.visitDate === record.visitDate) {
                    return; // Пропуск дубликата
                }
            }
            history.unshift(record);
            await historyDB.setItem('tetysBluHistory', history);
            
            // Отправляем в Supabase
            if (supabaseClient) {
                const { error } = await supabaseClient
                    .from('calculations')
                    .insert([{
                        created_at: record.timestamp,
                        visit_date: record.visitDate,
                        client_type: record.clientType,
                        tariff_type: record.tariffType,
                        total_sum: record.totalSum,
                        tourists: record.tourists,
                        user_login: currentUser,
                        promocode: record.promocode,
                        comment: record.comment
                    }]);
                if (error) {
                    console.error("Ошибка Supabase:", error);
                    if(window.showToast) window.showToast('Сохранено локально (ошибка облака)', 'fa-cloud-arrow-down', 'bg-amber-500');
                } else {
                    if(window.showToast) window.showToast('Сохранено в облако', 'fa-cloud-check', 'bg-emerald-500');
                }
            } else {
                if(window.showToast) window.showToast('Сохранено локально (нет облака)', 'fa-check', 'bg-emerald-500');
            }
        } catch (err) {
            console.error("Ошибка сохранения в базу:", err);
        }
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

    async function getHistoryData(limit = 0) {
        if (supabaseClient) {
            try {
                let query = supabaseClient.from('calculations').select('*').order('created_at', { ascending: false });
                if (limit > 0) query = query.limit(limit);
                
                const { data, error } = await query;
                if (!error && data) {
                    return data.map(row => ({
                        id: row.id,
                        timestamp: row.created_at,
                        visitDate: row.visit_date,
                        clientType: row.client_type,
                        tariffType: row.tariff_type,
                        totalSum: row.total_sum,
                        tourists: row.tourists,
                        promocode: row.promocode,
                        comment: row.comment
                    }));
                }
            } catch(e) {
                console.error("Supabase fetch error:", e);
            }
        }
        // Fallback к локальной базе
        if (historyDB) {
            let hist = await historyDB.getItem('tetysBluHistory') || [];
            if (limit > 0) hist = hist.slice(0, limit);
            return hist;
        }
        return [];
    }

    async function renderHistory() {
        if (!historyList) return;
        try {
            // Для UI истории загружаем только 50 последних записей
            let history = await getHistoryData(50);
            
            if (history.length === 0) {
                historyList.innerHTML = '<div class="text-center text-slate-400 py-10"><i class="fa-solid fa-folder-open text-3xl mb-3 opacity-50"></i><p class="text-sm font-semibold">Архив пуст</p></div>';
                return;
            }
            
            historyList.innerHTML = '';
            history.forEach(item => {
                const date = new Date(item.timestamp);
                const timeStr = `${date.getDate().toString().padStart(2,'0')}.${(date.getMonth()+1).toString().padStart(2,'0')} в ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
                
                const card = document.createElement('div');
                card.className = 'bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-2 relative';
                card.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">${timeStr}</span>
                        <span class="text-xs font-black text-[#1e293b]">${item.totalSum.toLocaleString('ru-RU')} ₸</span>
                    </div>
                    <div class="text-sm font-bold text-slate-800">Гостей: ${item.tourists.length}</div>
                    <div class="text-[11px] font-semibold text-slate-500 mb-1">Визит: ${item.visitDate} • ${item.clientType === 'agent' ? 'Турагент' : 'Турист'}</div>
                    ${item.promocode ? `<div class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1"><i class="fa-solid fa-ticket mr-1"></i> ${item.promocode}</div>` : ''}
                    ${item.comment ? `<div class="text-[10px] text-slate-500 italic mb-1"><i class="fa-regular fa-comment-dots mr-1"></i> ${item.comment}</div>` : ''}
                    <button class="mt-2 w-full bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white py-2 rounded-xl text-xs font-bold transition-colors">
                        <i class="fa-solid fa-download mr-1.5"></i>Загрузить расчет
                    </button>
                `;
                
                const loadBtn = card.querySelector('button');
                loadBtn.addEventListener('click', () => {
                    if (visitDateInput) visitDateInput.value = item.visitDate;
                    if (clientTypeInput) clientTypeInput.value = item.clientType;
                    if (tariffTypeInput) tariffTypeInput.value = item.tariffType;
                    tourists = item.tourists;
                    render();
                    if(window.showToast) window.showToast('Расчет успешно загружен', 'fa-folder-open', 'bg-brand-blue');
                    closeHistoryBtn.click();
                });
                
                historyList.appendChild(card);
            });
        } catch(err) {
            console.error("Ошибка загрузки истории:", err);
            historyList.innerHTML = '<div class="text-center text-red-400 py-10"><p>Ошибка загрузки архива</p></div>';
        }
    }

    // --- СТАТИСТИКА ---
    async function calculateStatistics() {
        if (!statisticsContent) return;
        try {
            statisticsContent.innerHTML = '<div class="text-center text-slate-400 py-10"><i class="fa-solid fa-spinner fa-spin text-3xl mb-3 opacity-50"></i><p class="text-sm font-semibold">Загрузка облачной статистики...</p></div>';
            
            // Загружаем ВСЕ данные для статистики (limit = 0)
            let history = await getHistoryData(0);
            
            if (history.length === 0) {
                statisticsContent.innerHTML = '<div class="text-center text-slate-400 py-10"><i class="fa-solid fa-chart-pie text-3xl mb-3 opacity-50"></i><p class="text-sm font-semibold">Нет данных для статистики</p></div>';
                return;
            }

            let totalRevenue = 0;
            let totalClients = 0;
            let currentMonthRevenue = 0;
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            history.forEach(item => {
                totalRevenue += item.totalSum;
                totalClients += item.tourists.length;
                const d = new Date(item.timestamp);
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    currentMonthRevenue += item.totalSum;
                }
            });

            statisticsContent.innerHTML = `
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex flex-col justify-center">
                        <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Выручка (Всё время)</span>
                        <span class="text-lg sm:text-xl font-black text-indigo-900">${totalRevenue.toLocaleString('ru-RU')} ₸</span>
                    </div>
                    <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col justify-center">
                        <span class="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">За текущий месяц</span>
                        <span class="text-lg sm:text-xl font-black text-emerald-900">${currentMonthRevenue.toLocaleString('ru-RU')} ₸</span>
                    </div>
                    <div class="col-span-2 bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <span class="text-xs font-bold text-blue-500 uppercase tracking-wider">Всего обслужено гостей</span>
                        <span class="text-2xl font-black text-blue-900">${totalClients}</span>
                    </div>
                </div>

                <!-- Блоки для графиков Chart.js -->
                <div class="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
                    <h3 class="text-xs font-bold text-slate-700 uppercase mb-3">Выручка по дням визита</h3>
                    <canvas id="revenueChart" width="400" height="200"></canvas>
                </div>
                <div class="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
                    <h3 class="text-xs font-bold text-slate-700 uppercase mb-3">Соотношение Клиентов</h3>
                    <div class="w-full flex justify-center"><canvas id="clientTypeChart" width="200" height="200" style="max-width:200px"></canvas></div>
                </div>

                <div class="text-[10px] text-slate-400 text-center mt-4 uppercase font-bold tracking-widest">
                    Данные на основе ${history.length} расчетов
                </div>
            `;

            // Подготовка данных для графиков
            const revenueByDate = {};
            let agentCount = 0;
            let touristCount = 0;

            history.forEach(item => {
                // Агрегация выручки по дате визита
                if (item.visitDate) {
                    if (!revenueByDate[item.visitDate]) revenueByDate[item.visitDate] = 0;
                    revenueByDate[item.visitDate] += item.totalSum;
                }
                // Агрегация типов клиентов
                if (item.clientType === 'agent') {
                    agentCount += item.tourists.length;
                } else {
                    touristCount += item.tourists.length;
                }
            });

            // Сортировка дат
            const sortedDates = Object.keys(revenueByDate).sort((a,b) => new Date(a) - new Date(b));
            const revenueData = sortedDates.map(date => revenueByDate[date]);

            // Рендер графиков с задержкой (чтобы DOM успел обновиться)
            setTimeout(() => {
                if (typeof Chart !== 'undefined') {
                    const revCtx = document.getElementById('revenueChart');
                    if (revCtx) {
                        new Chart(revCtx, {
                            type: 'bar',
                            data: {
                                labels: sortedDates.map(d => d.slice(5)), // Оставляем только MM-DD
                                datasets: [{
                                    label: 'Выручка ₸',
                                    data: revenueData,
                                    backgroundColor: '#0ea5e9',
                                    borderRadius: 4
                                }]
                            },
                            options: { responsive: true, plugins: { legend: { display: false } } }
                        });
                    }

                    const typeCtx = document.getElementById('clientTypeChart');
                    if (typeCtx) {
                        new Chart(typeCtx, {
                            type: 'pie',
                            data: {
                                labels: ['Турагенты', 'Обычные туристы'],
                                datasets: [{
                                    data: [agentCount, touristCount],
                                    backgroundColor: ['#8b5cf6', '#10b981'],
                                    borderWidth: 0
                                }]
                            },
                            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                        });
                    }
                }
            }, 100);

        } catch(err) {
            console.error(err);
            statisticsContent.innerHTML = '<div class="text-center text-red-400 py-10"><p>Ошибка загрузки статистики</p></div>';
        }
    }

    async function exportToCSV() {
        try {
            // Скачиваем все данные (limit = 0)
            let history = await getHistoryData(0);
            
            if (history.length === 0) {
                if(window.showToast) window.showToast('Архив пуст', 'fa-triangle-exclamation', 'bg-amber-500');
                return;
            }
            
            let csvContent = "Дата,Время,Дата визита,Тип клиента,Тариф,Сумма,Гостей,Промокод,Комментарий\n";
            history.forEach(item => {
                const date = new Date(item.timestamp);
                const dStr = `${date.getDate().toString().padStart(2,'0')}.${(date.getMonth()+1).toString().padStart(2,'0')}.${date.getFullYear()}`;
                const tStr = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
                const typeStr = item.clientType === 'agent' ? 'Турагент' : 'Турист';
                const tariffStr = item.tariffType;
                
                const promo = item.promocode || '';
                // Экранируем запятые в комментарии для CSV
                const comment = item.comment ? `"${item.comment.replace(/"/g, '""')}"` : '';
                
                csvContent += `${dStr},${tStr},${item.visitDate},${typeStr},${tariffStr},${item.totalSum},${item.tourists.length},${promo},${comment}\n`;
            });
            
            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `TetysBlu_Statistics_${new Date().toISOString().slice(0,10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if(window.showToast) window.showToast('Экспорт завершен', 'fa-file-csv', 'bg-emerald-500');
        } catch(err) {
            console.error(err);
            if(window.showToast) window.showToast('Ошибка при экспорте', 'fa-triangle-exclamation', 'bg-red-500');
        }
    }

    if (statisticsBtn) {
        statisticsBtn.addEventListener('click', () => {
            calculateStatistics();
            statisticsModal.classList.remove('hidden');
            setTimeout(() => {
                statisticsModal.classList.remove('opacity-0');
                statisticsModalContent.classList.remove('scale-95');
            }, 10);
        });
    }

    if (closeStatisticsBtn) {
        closeStatisticsBtn.addEventListener('click', () => {
            statisticsModal.classList.add('opacity-0');
            statisticsModalContent.classList.add('scale-95');
            setTimeout(() => {
                statisticsModal.classList.add('hidden');
            }, 300);
        });
    }

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportToCSV);
    }

    // --- PWA INSTALLATION LOGIC ---
    let deferredPrompt;
    const installPwaBtn = document.getElementById('installPwaBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installPwaBtn) installPwaBtn.classList.remove('hidden');
    });

    if (installPwaBtn) {
        installPwaBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installPwaBtn.classList.add('hidden');
                }
                deferredPrompt = null;
            }
        });
    }

    window.addEventListener('appinstalled', () => {
        if (installPwaBtn) installPwaBtn.classList.add('hidden');
        if (window.showToast) window.showToast('Приложение установлено!', 'fa-check', 'bg-emerald-500');
    });

    // Инициализация при загрузке
    initApp();

});





