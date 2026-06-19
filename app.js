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
    }
};
// ======================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Регистрация Service Worker для PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.error('SW registration failed', err));
    }

    // --- АВТОРИЗАЦИЯ ---
    const authScreen = document.getElementById('authScreen');
    const appContent = document.getElementById('appContent');
    const authLogin = document.getElementById('authLogin');
    const authPin = document.getElementById('authPin');
    const authBtn = document.getElementById('authBtn');
    const authError = document.getElementById('authError');
    const authFormBody = document.getElementById('authFormBody');
    const logoutBtn = document.getElementById('logoutBtn');

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
    let quickCounts = { adl: 0, chld: 0, pens: 0, inf: 0 };
    
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

    // Dummy auth logic removed to prevent conflicts with checkAuth

    // Статистика
    const stats = {
        adl: document.getElementById('statAdl'),
        chld: document.getElementById('statChld'),
        inf: document.getElementById('statInf'),
        pens: document.getElementById('statPens'),
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

    // Parse Bulk Text Input
    parseBulkBtn.addEventListener('click', () => {
        const text = bulkText.value.trim();
        if (!text) return;
        
        // 1. Предобработка: разбиваем на строки по датам рождения перед именами
        const dobSplitRegex = /(?:\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b)([\.\s\-\/]+)(?=[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/g;
        let normalizedText = text.replace(dobSplitRegex, '$&\n');
        
        // 2. Убираем нумерацию строк (например, "1. ", "2) ", "3 ") в начале каждой строки
        normalizedText = normalizedText.replace(/(?:^|\n)\s*\d+[\.\)\s\-]+\s*(?=[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/g, '\n');
        
        const lines = normalizedText.split('\n');
        
        lines.forEach((line, index) => {
            line = line.trim();
            if (!line) return;

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

            // Ищем дату рождения по нашему улучшенному regex (день 1-31, месяц 1-12, год 2 или 4 цифры)
            const dobRegex = /\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b/;
            const dobMatch = line.match(dobRegex);
            
            if (dobMatch) {
                const matchedDateStr = dobMatch[0];
                const parts = matchedDateStr.split(/[\.\-\/\s]+/);
                
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
                    // Нет разделителей вовсе, например "16081997" или "160897"
                    day = matchedDateStr.slice(0, 2);
                    month = matchedDateStr.slice(2, 4);
                    year = matchedDateStr.slice(4);
                }
                
                if (year.length === 2) {
                    const yInt = parseInt(year);
                    year = (yInt > 50 ? 1900 + yInt : 2000 + yInt).toString();
                }

                const dobIso = `${year}-${month}-${day}`;
                
                // Вырезаем дату из строки
                let namePart = line.replace(matchedDateStr, '');
                
                // Убираем указание возраста типа "(29 жас)", "29 жас", "(7 лет)", "7 лет"
                namePart = namePart.replace(/\(?\b\d+\s*(?:жас|лет|год[а-я]*|yo|y\.o\.|years?|old)(?![a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ0-9])\)?/ig, '');
                namePart = namePart.replace(/\(\s*\d+\s*\)/g, ''); // числа в круглых скобках
                
                // Убираем категории: adl, chld, inf, взрослый, ребенок, пенсионер
                namePart = namePart.replace(/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(?:adl|chld|inf|взр[а-я]*|реб[а-я]*|дети|млад[а-я]*|пенс[а-я]*)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/ig, ' ');
                
                // Убираем CRM-метки
                namePart = namePart.replace(/дата\s*рожд[а-яА-Я]*/ig, '');
                namePart = namePart.replace(/data\s*rozhd[a-zA-Z]*/ig, '');
                namePart = namePart.replace(/\bд\.?р\.?\b/ig, '');
                namePart = namePart.replace(/\bd\.?r\.?\b/ig, '');
                
                // Очищаем имя от лишних символов (оставляем только буквы трех языков и дефисы)
                namePart = namePart.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s\-]/g, ' ').trim();
                namePart = namePart.replace(/^-+|-+$/g, '').trim();
                namePart = namePart.replace(/\s+/g, ' ');

                // Делаем первые буквы заглавными
                namePart = namePart.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');

                const guessed = guessGender(namePart);
                tourists.push({
                    id: createId(),
                    fullName: namePart,
                    dob: dobIso,
                    gender: guessed,
                    genderManuallySet: false,
                    disability: 'none'
                });
            }
        });
        
        // Удаляем пустую строку по умолчанию
        if (tourists.length > 1 && tourists[0].fullName === '' && tourists[0].dob === '') {
            tourists.shift();
        }

        render();
        bulkText.value = '';
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
            }
            if (field === 'gender') {
                tourist.genderManuallySet = true;
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
        const m = visit.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && visit.getDate() < dob.getDate())) {
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
        
        const priceCategory = passengerCategory === 'SNR' ? 'ADL' : passengerCategory;
        return activePeriod[clientType][priceCategory] || 0;
    }

    function calculateDiscount(dobStr, visitDateStr, disability, age, gender) {
        if (!dobStr || !visitDateStr || age === null) return 0;
        const dob = new Date(dobStr);
        const visit = new Date(visitDateStr);
        
        let maxDiscount = 0;
        
        if (age <= 3) maxDiscount = Math.max(maxDiscount, 100);
        if (disability === '1') maxDiscount = Math.max(maxDiscount, 100);
        
        const isBirthday = dob.getDate() === visit.getDate() && dob.getMonth() === visit.getMonth();
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

        // Для статистики
        let counts = { adl: 0, chld: 0, inf: 0, pens: 0, bday: 0 };
        let exportDataList = [];

        tourists.forEach((t, index) => {
            if (!t.gender) t.gender = 'male';
            if (t.genderManuallySet === undefined) t.genderManuallySet = false;

            const age = calculateAge(t.dob, visitDate);
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

            // Накопление статистики
            if (category === 'ADL') counts.adl++;
            if (category === 'CHLD') counts.chld++;
            if (category === 'INF') counts.inf++;
            if (category === 'SNR') counts.pens++;
            if (discountInfo.isBirthday) counts.bday++;

            totalSum += finalPrice;

            // Строка для экспорта (подготовка данных)
            if (t.fullName && t.dob) {
                let tags = [];
                if (discountInfo.isBirthday) tags.push("ДР");
                if (discountInfo.isPensioner) tags.push("Пенс");
                if (t.disability === '1') tags.push("Инв 100%");
                if (t.disability === '2') tags.push("Инв 15%");
                if (t.disability === '3') tags.push("Инв 10%");

                exportDataList.push({
                    translitName: transliterate(t.fullName),
                    category: category,
                    formattedDob: formatDate(t.dob),
                    tags: tags,
                    isBirthday: discountInfo.isBirthday
                });
            }

            // Динамический бейдж с микро-анимацией (свечение)
            let catBadgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
            if (category === 'ADL') catBadgeClass = 'bg-blue-50 text-blue-600 border-blue-200 shadow-[0_0_8px_rgba(37,99,235,0.4)] animate-[pulse_2s_ease-in-out_infinite]';
            if (category === 'SNR') catBadgeClass = 'bg-purple-50 text-purple-600 border-purple-200 shadow-[0_0_8px_rgba(147,51,234,0.4)] animate-[pulse_2s_ease-in-out_infinite]';
            if (category === 'CHLD') catBadgeClass = 'bg-teal-50 text-teal-600 border-teal-200 shadow-[0_0_8px_rgba(13,148,136,0.4)] animate-[pulse_2s_ease-in-out_infinite]';
            if (category === 'INF') catBadgeClass = 'bg-green-50 text-green-600 border-green-200 shadow-[0_0_8px_rgba(22,163,74,0.4)] animate-[pulse_2s_ease-in-out_infinite]';

            // Создание DOM элемента строки
            const row = document.createElement('div');
            row.className = 'tourist-row p-1.5 md:p-1 flex flex-col md:grid md:grid-cols-12 gap-1.5 md:gap-1 items-start md:items-center transition-all relative hover:bg-slate-50 animate-row-in';
            row.innerHTML = `
                <!-- Mobile Label: Delete Button -->
                <div class="absolute top-1.5 right-1.5 md:static md:col-span-1 md:w-full flex justify-end md:order-last">
                    <button onclick="removeTourist('${t.id}')" class="btn-danger p-0.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Удалить">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
                
                <div class="w-full flex gap-2 pr-6 md:pr-0 md:contents">
                    <!-- Full Name -->
                    <div class="flex-1 md:col-span-4 w-full relative">
                        <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5 block">ФИО (Рус/Каз)</label>
                        <input type="text" placeholder="ФИО туриста" value="${t.fullName}" 
                            onblur="updateTourist('${t.id}', 'fullName', this.value)"
                            class="w-full text-left bg-transparent text-slate-800 border ${!t.fullName ? 'border-red-300 bg-red-50/40' : 'border-transparent'} hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-2 py-1 text-xs font-medium transition-colors ${discountInfo.isBirthday ? 'pr-7' : ''}">
                        ${discountInfo.isBirthday ? '<div class="absolute right-2 top-[calc(50%+4px)] md:top-1/2 -translate-y-1/2 text-amber-500 text-[10px]" title="Именинник"><i class="fa-solid fa-cake-candles"></i></div>' : ''}
                    </div>
                    
                    <!-- DOB -->
                    <div class="w-[100px] shrink-0 md:w-full md:col-span-2">
                        <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5 block">Дата рожд.</label>
                        <input type="date" value="${t.dob}" 
                            onblur="updateTourist('${t.id}', 'dob', this.value)"
                            class="w-full text-left date-left-align bg-transparent text-slate-800 border ${!t.dob ? 'border-red-300 bg-red-50/40' : 'border-transparent'} hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-0.5 py-1 text-xs font-medium transition-colors">
                    </div>

                    <!-- Gender -->
                    <div class="w-[80px] shrink-0 md:w-full md:col-span-2">
                        <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5 block">Пол</label>
                        <select onchange="updateTourist('${t.id}', 'gender', this.value)"
                            class="w-full text-left md:text-center bg-transparent text-slate-800 border border-transparent hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-1 py-1 text-xs font-medium transition-colors cursor-pointer">
                            <option value="male" ${t.gender === 'male' ? 'selected' : ''}>Мужской</option>
                            <option value="female" ${t.gender === 'female' ? 'selected' : ''}>Женский</option>
                        </select>
                    </div>
                </div>
                
                <!-- Stats Row (Age, Category, Price) -->
                <div class="col-span-12 w-full flex justify-between items-center mt-1 md:mt-0 md:contents border-t border-slate-100 md:border-0 pt-1.5 md:pt-0">
                    <div class="flex space-x-6 md:contents">
                        <!-- Age -->
                        <div class="md:col-span-1 text-left md:text-center flex flex-col items-start md:items-center">
                            <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5">Возраст</label>
                            <span class="text-xs font-bold ${age === null ? 'text-slate-400' : 'text-[#0076ba]'}">
                                ${age !== null ? age : '-'}
                            </span>
                        </div>
                        
                        <!-- Category -->
                        <div class="md:col-span-1 text-left md:text-center flex flex-col items-start md:items-center">
                            <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5">Тип</label>
                            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${catBadgeClass} transition-all duration-300">
                                ${category}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Price -->
                    <div class="md:col-span-1 text-right flex flex-col items-end justify-center pr-2">
                        ${discountPercent > 0 ? `<span class="badge-discount text-[8px] px-1.5 py-0.5 rounded-full mb-0.5 leading-none font-bold">-${discountPercent}%</span>` : ''}
                        <span class="text-xs font-bold ${finalPrice > 0 ? 'text-slate-900' : 'text-slate-400'}">
                            ${basePrice === -1 ? 'Нет тарифа' : Math.round(finalPrice).toLocaleString('ru-RU')} ₸
                        </span>
                    </div>
                </div>
            `;
            
            touristListEl.appendChild(row);
        });

        // Обновление итогов
        totalPriceEl.textContent = Math.round(totalSum).toLocaleString('ru-RU');
        
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
        stats.bday.textContent = counts.bday;

        let exportText = `📅 Дата визита: ${visitDate ? formatDate(visitDate) : 'Не указана'}\n`;
        exportText += `🎟 Тариф: ${tariffType === 'evening' ? 'Вечерний' : 'Дневной'}\n\n`;

        if (currentCalcMode === 'quick') {
            exportText += `Состав гостей:\n`;
            let hasQuickGuests = false;
            if (quickCounts.adl > 0) { exportText += `• Взрослые (ADL): ${quickCounts.adl}\n`; hasQuickGuests = true; }
            if (quickCounts.chld > 0) { exportText += `• Дети (CHLD): ${quickCounts.chld}\n`; hasQuickGuests = true; }
            if (quickCounts.pens > 0) { exportText += `• Пенсионеры (SNR): ${quickCounts.pens}\n`; hasQuickGuests = true; }
            if (quickCounts.inf > 0) { exportText += `• Младенцы (INF): ${quickCounts.inf}\n`; hasQuickGuests = true; }
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
                return `${item.translitName.toUpperCase()} (${item.category}) ${item.formattedDob}`;
            });

            exportText += `Список гостей:\n`;
            exportText += exportLines.length > 0 ? exportLines.join('\n') : 'Пусто';
        }

        // Экспорт данных
        exportDataEl.value = exportText;
        exportDataEl.style.height = 'auto';
        exportDataEl.style.height = exportDataEl.scrollHeight + 'px';

        // Авто-сохранение
        saveDraft();

        // Для доступа из HTML
        window.updateTourist = updateTourist;
        window.removeTourist = removeTourist;
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
            const age = calculateAge(t.dob, visitDate);
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
    
    // --- ЛОГИКА ОТПРАВКИ (SHARE / WHATSAPP) ---
    const whatsappBtn = document.getElementById('whatsappBtn');
    
    // Элементы модалки шаринга
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
                console.error('Ошибка нативного шаринга', err);
                if (err.name !== 'AbortError') sendTextToWhatsApp(true);
            }
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', async () => {
            saveToHistory(); // Сохраняем перед отправкой
            const originalHtml = whatsappBtn.innerHTML;
            whatsappBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Подготовка...';
            
            try {
                if (navigator.share) {
                    const result = await generateImageForShare();
                    currentShareData = result.shareData;
                    sharePreviewImg.src = result.dataUrl;
                    
                    // Показываем модалку предпросмотра
                    if (shareModal) {
                        shareModal.classList.remove('hidden');
                        setTimeout(() => {
                            shareModal.classList.remove('opacity-0');
                            shareModalContent.classList.remove('scale-95');
                            shareModalContent.classList.add('scale-100');
                        }, 10);
                    } else {
                        // Фолбэк, если модалка почему-то не найдена
                        await navigator.share(currentShareData);
                    }
                } else {
                    sendTextToWhatsApp();
                }
            } catch (err) {
                console.error('Ошибка при подготовке чека', err);
                sendTextToWhatsApp(true);
            } finally {
                whatsappBtn.innerHTML = originalHtml;
            }
        });
    }

    function sendTextToWhatsApp(useLocation = false) {
        const text = exportDataEl.value;
        if (!text) return;
        const waText = `*Официальный расчет Tetys Blu*\n\n${text}`;
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
            if (!listHtml) {
                listHtml = `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3"><div class="font-bold text-slate-400 text-[15px]">СПИСОК ПУСТ</div></div>`;
            }
            touristsEl.innerHTML = listHtml;
        } else {
            tourists.forEach((t, i) => {
                if (!t.fullName && !t.dob) return; // Пропуск пустых строк
                const age = calculateAge(t.dob, visitDateStr);
                const cat = getPassengerCategory(age, t.gender, visitDateStr);
                const genderLabel = t.gender === 'female' ? 'Ж' : 'М';
                
                touristsEl.innerHTML += `
                    <div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3">
                        <div class="w-full">
                            <div class="font-bold text-[#1e293b] text-[15px] leading-relaxed break-words">${(t.fullName || 'Гость ' + (i+1)).toUpperCase()} (${cat}) ${formatDate(t.dob)} [${genderLabel}]</div>
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
                return; // Пропуск дубликата
            }
        }
        
        history.unshift(record);
        if (history.length > 20) history = history.slice(0, 20); // Храним только 20 последних
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
                <div class="text-[11px] font-semibold text-slate-500">Визит: ${item.visitDate} • ${item.clientType === 'agent' ? 'Турагент' : 'Турист'}</div>
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
                window.showToast('Расчет успешно загружен', 'fa-folder-open', 'bg-brand-blue');
                closeHistoryBtn.click();
            });
            
            historyList.appendChild(card);
        });
    }

});





