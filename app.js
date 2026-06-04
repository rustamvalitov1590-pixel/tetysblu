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
    const copyBtn = document.getElementById('copyBtn');

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
            if (data.visitDate) visitDateInput.value = data.visitDate;
            if (data.clientType) clientTypeInput.value = data.clientType;
            if (data.tariffType) tariffTypeInput.value = data.tariffType;
            if (data.tourists && Array.isArray(data.tourists) && data.tourists.length > 0) {
                tourists = data.tourists;
            } else {
                addTourist();
            }
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
        
        const lines = text.split('\n');
        
        lines.forEach((line, index) => {
            line = line.trim();
            if (!line) return;

            // Check if this is a header line like "Тетис на 06.06" or "Дата посещения 03.06.26"
            if (index === 0) {
                const headerDateMatch = line.match(/(?:на\s+|дата\s*посещения\s*)?(\d{1,2})[\.\-\/](\d{1,2})(?:[\.\-\/](\d{2}|\d{4}))?/i);
                if (headerDateMatch && (line.toLowerCase().includes('на ') || line.toLowerCase().includes('дата') || line.toLowerCase().includes('тетис'))) {
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
                    
                    // Skip if the line only contains the header
                    if (line.replace(headerDateMatch[0], '').replace(/тетис|дата\s*посещения/ig, '').trim().length < 5) return;
                }
            }

            // Find Date of Birth (DD.MM.YYYY or DD.MM.YY)
            const dobMatch = line.match(/(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{2}|\d{4})(?!\d)/);
            if (dobMatch) {
                const day = dobMatch[1].padStart(2, '0');
                const month = dobMatch[2].padStart(2, '0');
                let year = dobMatch[3];
                
                if (year.length === 2) {
                    const yInt = parseInt(year);
                    // 50 как порог: если год > 50, считаем 19XX, иначе 20XX
                    year = (yInt > 50 ? 1900 + yInt : 2000 + yInt).toString();
                }

                const dobIso = `${year}-${month}-${day}`;
                
                // Remove the DOB from the line to get the name
                let namePart = line.replace(dobMatch[0], '');
                
                // Remove categories like adl, chld, inf
                namePart = namePart.replace(/\b(?:adl|chld|inf|взр|реб)\b/ig, '');
                
                // Remove CRM labels like "Дата Рожд" or "д.р."
                namePart = namePart.replace(/дата\s*рожд[а-яА-Я]*/ig, '');
                namePart = namePart.replace(/\bд\.?р\.?\b/ig, '');
                
                // Clean up name (remove extra spaces and non-alphabet chars except dash)
                namePart = namePart.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s\-]/g, ' ').trim();
                
                // Remove trailing or leading dashes that might have been left over
                namePart = namePart.replace(/^-+|-+$/g, '').trim();
                
                namePart = namePart.replace(/\s+/g, ' ');

                // Capitalize first letters of name
                namePart = namePart.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');

                tourists.push({
                    id: createId(),
                    fullName: namePart,
                    dob: dobIso,
                    disability: 'none'
                });
            }
        });
        
        // Remove empty default row if we added parsed data and it was empty
        if (tourists.length > 1 && tourists[0].fullName === '' && tourists[0].dob === '') {
            tourists.shift();
        }

        render();
        bulkText.value = ''; // Clear textarea after parsing successfully
    });

    function createId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    window.clearAllTourists = function() {
        if (confirm('Вы уверены, что хотите удалить всех гостей?')) {
            tourists = [];
            render();
        }
    };

    function addTourist() {
        tourists.push({
            id: createId(),
            fullName: '',
            dob: '',
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
            render();
        }
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

    function getPassengerCategory(age) {
        if (age === null) return '-';
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
        
        return activePeriod[clientType][passengerCategory] || 0;
    }

    function calculateDiscount(dobStr, visitDateStr, disability, age) {
        if (!dobStr || !visitDateStr || age === null) return 0;
        const dob = new Date(dobStr);
        const visit = new Date(visitDateStr);
        
        let maxDiscount = 0;
        
        if (age <= 3) maxDiscount = Math.max(maxDiscount, 100);
        if (disability === '1') maxDiscount = Math.max(maxDiscount, 100);
        
        const isBirthday = dob.getDate() === visit.getDate() && dob.getMonth() === visit.getMonth();
        if (isBirthday) maxDiscount = Math.max(maxDiscount, 50);
        
        if (age >= 60) maxDiscount = Math.max(maxDiscount, 50);
        
        if (disability === '2') maxDiscount = Math.max(maxDiscount, 15);
        if (disability === '3') maxDiscount = Math.max(maxDiscount, 10);
        
        return { percent: maxDiscount, isBirthday: isBirthday, isPensioner: age >= 60, isInfant: age <= 3 };
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
        let exportLines = [];

        tourists.forEach((t, index) => {
            const age = calculateAge(t.dob, visitDate);
            const category = getPassengerCategory(age);
            const basePrice = getBasePrice(visitDate, clientType, tariffType, category);
            
            if (basePrice === -1) isTariffFound = false;

            const today = new Date();
            const vDate = visitDate ? new Date(visitDate) : null;
            const earlyBookingEnabled = vDate && ((vDate.getFullYear() > today.getFullYear()) || (vDate.getFullYear() === today.getFullYear() && vDate.getMonth() > today.getMonth()));
            const discountInfo = calculateDiscount(t.dob, visitDate, t.disability, age);
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
            if (discountInfo.isPensioner) counts.pens++;
            if (discountInfo.isBirthday) counts.bday++;

            totalSum += finalPrice;

            // Строка для экспорта
            if (t.fullName && t.dob) {
                const translitName = transliterate(t.fullName);
                const formattedDob = formatDate(t.dob);
                exportLines.push(`${index + 1}. ${translitName} (${category}) - дата рожд: ${formattedDob}`);
            }

            // Динамический бейдж с микро-анимацией (свечение)
            let catBadgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
            if (category === 'ADL') catBadgeClass = 'bg-blue-50 text-blue-600 border-blue-200 shadow-[0_0_8px_rgba(37,99,235,0.4)] animate-[pulse_2s_ease-in-out_infinite]';
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
                    <div class="flex-1 md:col-span-5 w-full">
                        <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5 block">ФИО (Рус/Каз)</label>
                        <input type="text" placeholder="ФИО туриста" value="${t.fullName}" 
                            onchange="updateTourist('${t.id}', 'fullName', this.value)"
                            class="w-full text-left bg-transparent text-slate-800 border ${!t.fullName ? 'border-red-300 bg-red-50/40' : 'border-transparent'} hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-2 py-1 text-xs font-medium transition-colors">
                    </div>
                    
                    <!-- DOB -->
                    <div class="w-[110px] shrink-0 md:w-full md:col-span-2">
                        <label class="md:hidden text-[8px] text-slate-400 uppercase font-semibold mb-0.5 block">Дата рожд.</label>
                        <input type="date" value="${t.dob}" 
                            onchange="updateTourist('${t.id}', 'dob', this.value)"
                            class="w-full text-left date-left-align bg-transparent text-slate-800 border ${!t.dob ? 'border-red-300 bg-red-50/40' : 'border-transparent'} hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none rounded-lg px-0.5 py-1 text-xs font-medium transition-colors">
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
        exportText += `👤 Клиент: ${clientType === 'agent' ? 'Турагент' : 'Турист'}\n`;
        exportText += `🎟 Тариф: ${tariffType === 'evening' ? 'Вечерний' : 'Дневной'}\n\n`;
        exportText += `Список гостей:\n`;
        exportText += exportLines.length > 0 ? exportLines.join('\n') : 'Пусто';
        exportText += `\n\n💳 ИТОГО К ОПЛАТЕ: ${Math.round(totalSum).toLocaleString('ru-RU')} ₸`;

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
            tourists: tourists
        };
        localStorage.setItem('tetisBluDraft', JSON.stringify(data));
    }

    function copyExportData() {
        if (!exportDataEl.value) return;
        
        navigator.clipboard.writeText(exportDataEl.value).then(() => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check mr-1.5"></i> Скопировано';
            copyBtn.classList.add('bg-emerald-600');
            copyBtn.classList.remove('bg-slate-200');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('bg-emerald-600');
                copyBtn.classList.add('bg-slate-200');
            }, 2000);
        });
    }

    // --- ЛОГИКА ДНЯ РОЖДЕНИЯ ---
    // --- ЛОГИКА ГЕНЕРАЦИИ ЧЕКА КАРТИНКОЙ ---
    const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', generateReceiptImage);
    }
    
    // --- ЛОГИКА ОТПРАВКИ (SHARE / WHATSAPP) ---
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', async () => {
            saveToHistory(); // Сохраняем перед отправкой
            const originalHtml = whatsappBtn.innerHTML;
            whatsappBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Подготовка...';
            
            try {
                // Если браузер поддерживает шаринг файлов (мобилки Safari/Chrome)
                if (navigator.share && navigator.canShare) {
                    await prepareAndShareImage();
                } else {
                    // Фолбэк на старый текстовый способ
                    sendTextToWhatsApp();
                }
            } catch (err) {
                console.error('Ошибка при шаринге', err);
                // Если шаринг отменили или произошла ошибка, отправляем хотя бы текст
                if (err.name !== 'AbortError') {
                    sendTextToWhatsApp();
                }
            } finally {
                whatsappBtn.innerHTML = originalHtml;
            }
        });
    }

    function sendTextToWhatsApp() {
        const text = exportDataEl.value;
        if (!text) return;
        const waText = `*Официальный расчет Tetys Blu*\n\n${text}`;
        const url = `https://wa.me/?text=${encodeURIComponent(waText)}`;
        window.open(url, '_blank');
    }

    async function prepareAndShareImage() {
        return new Promise((resolve, reject) => {
            const container = document.getElementById('receiptContainer');
            const content = document.getElementById('receiptContent');
            
            // Заполняем данные перед рендером
            fillReceiptData();
            
            // Временно достаем блок для рендера
            content.classList.remove('opacity-0', 'pointer-events-none');
            document.body.appendChild(content); 
            content.style.position = 'fixed';
            content.style.top = '0';
            content.style.left = '0';
            content.style.zIndex = '-9999';
            
            html2canvas(content, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
                // Возвращаем элемент на место
                content.style.position = '';
                content.style.top = '';
                content.style.left = '';
                content.style.zIndex = '';
                content.classList.add('opacity-0', 'pointer-events-none');
                container.appendChild(content);
                
                canvas.toBlob(async (blob) => {
                    if (!blob) return reject(new Error('Не удалось создать blob'));
                    
                    const formattedDate = visitDateInput ? visitDateInput.value : 'date';
                    const file = new File([blob], `TetysBlu_Check_${formattedDate}.png`, { type: 'image/png' });
                    
                    const shareData = {
                        files: [file],
                        title: 'Чек Tetys Blu',
                        text: exportDataEl.value // Прикладываем текст к картинке (некоторые мессенджеры подхватят как подпись)
                    };
                    
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share(shareData);
                        resolve();
                    } else {
                        reject(new Error('Файлы не поддерживаются для шаринга'));
                    }
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
        const totalEl = document.getElementById('receiptTotal');
        
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
        tourists.forEach((t, i) => {
            if (!t.fullName && !t.dob) return; // Пропуск пустых строк
            const age = calculateAge(t.dob, visitDateStr);
            const cat = getPassengerCategory(age);
            const basePrice = getBasePrice(visitDateStr, clientType, tariffType, cat);
            
            const today = new Date();
            const visitD = new Date(visitDateStr);
            const earlyBookingEnabled = visitDateStr && ((visitD.getFullYear() > today.getFullYear()) || (visitD.getFullYear() === today.getFullYear() && visitD.getMonth() > today.getMonth()));
            let discInfo = calculateDiscount(t.dob, visitDateStr, t.disability, age);
            if (typeof discInfo === 'number') discInfo = { percent: 0, isBirthday: false };
            
            let disc = discInfo.percent || 0;
            if (earlyBookingEnabled && disc < 100 && age >= 4) {
                disc = Math.max(disc, CONFIG.discounts.earlyBooking);
            }
            const finalP = basePrice > 0 ? basePrice * (1 - disc / 100) : 0;
            
            touristsEl.innerHTML += `
                <div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3">
                    <div class="pr-2 w-2/3">
                        <div class="font-bold text-[#1e293b] text-[15px] leading-relaxed break-words">${t.fullName || 'Гость ' + (i+1)} ${discInfo.isBirthday ? '🎂' : ''}</div>
                        <div class="text-[12px] text-slate-400 mt-0.5 leading-normal">${cat} ${age !== null ? `(${age} лет)` : ''} ${disc > 0 ? `<span class="ml-1 font-bold">-${disc}%</span>` : ''}</div>
                    </div>
                    <div class="font-bold text-[#1e293b] text-[16px] whitespace-nowrap text-right">
                        ${basePrice === -1 ? 'Нет тарифа' : Math.round(finalP).toLocaleString('ru-RU')} ₸
                    </div>
                </div>
            `;
        });
        
        totalEl.textContent = totalPriceEl.textContent;
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





