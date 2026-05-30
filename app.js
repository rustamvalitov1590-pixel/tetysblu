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
    const openBulkBtn = document.getElementById('openBulkBtn');
    const bulkModal = document.getElementById('bulkModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBulkBtn = document.getElementById('cancelBulkBtn');
    const parseBulkBtn = document.getElementById('parseBulkBtn');
    const bulkText = document.getElementById('bulkText');
    const emptyState = document.getElementById('emptyState');
    const totalPriceEl = document.getElementById('totalPrice');
    const exportDataEl = document.getElementById('exportData');
    const copyBtn = document.getElementById('copyBtn');

    // Статистика
    const stats = {
        adl: document.getElementById('statAdl'),
        chld: document.getElementById('statChld'),
        inf: document.getElementById('statInf'),
        pens: document.getElementById('statPens'),
        bday: document.getElementById('statBday'),
        dis: document.getElementById('statDis')
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

    // Слушатели событий
    visitDateInput.addEventListener('change', render);
    clientTypeInput.addEventListener('change', render);
    tariffTypeInput.addEventListener('change', render);
    addTouristBtn.addEventListener('click', addTourist);
    copyBtn.addEventListener('click', copyExportData);

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

    // Modal Events
    openBulkBtn.addEventListener('click', () => {
        bulkModal.classList.remove('hidden');
        bulkText.value = '';
        bulkText.focus();
    });

    const closeBulkModal = () => bulkModal.classList.add('hidden');
    closeModalBtn.addEventListener('click', closeBulkModal);
    cancelBulkBtn.addEventListener('click', closeBulkModal);

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
                    
                    visitDateInput.value = `${currentYear}-${month}-${day}`;
                    
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
                
                // Clean up name (remove extra spaces and non-alphabet chars except dash)
                namePart = namePart.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s\-]/g, ' ').trim();
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
        closeBulkModal();
    });

    function createId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

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
        const visitDate = visitDateInput.value;
        const clientType = clientTypeInput.value;
        const tariffType = tariffTypeInput.value;

        touristListEl.innerHTML = '';
        
        if (tourists.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }

        let totalSum = 0;
        let isTariffFound = true;

        // Для статистики
        let counts = { adl: 0, chld: 0, inf: 0, pens: 0, bday: 0, dis: 0 };
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
            if (t.disability !== 'none') counts.dis++;

            totalSum += finalPrice;

            // Строка для экспорта
            if (t.fullName && t.dob) {
                const translitName = transliterate(t.fullName);
                const formattedDob = formatDate(t.dob);
                exportLines.push(`${index + 1}. ${translitName} (${category}) - DOB: ${formattedDob}`);
            }

            // Создание DOM элемента строки

            
            const row = document.createElement('div');
            row.className = 'tourist-row p-4 md:p-3 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 items-start md:items-center transition-all relative';
            row.innerHTML = `
                <!-- Mobile Label: Delete Button -->
                <div class="absolute top-2 right-2 md:static md:col-span-1 md:w-full flex justify-end md:order-last">
                    <button onclick="removeTourist('${t.id}')" class="btn-danger p-2 rounded-lg" title="Удалить">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
                
                <!-- Full Name -->
                <div class="col-span-12 md:col-span-3 w-full pr-8 md:pr-0">
                    <label class="md:hidden text-[10px] text-slate-400 uppercase font-semibold mb-1 block">ФИО (Рус/Каз)</label>
                    <input type="text" placeholder="ФИО туриста" value="${t.fullName}" 
                        onchange="updateTourist('${t.id}', 'fullName', this.value)"
                        class="w-full input-field rounded-lg p-3 md:p-2 text-base md:text-sm">
                </div>
                
                <!-- DOB & Disability Container (Mobile) -->
                <div class="col-span-12 grid grid-cols-2 gap-3 md:contents w-full">
                    <!-- DOB -->
                    <div class="col-span-1 w-full md:col-span-2">
                        <label class="md:hidden text-[10px] text-slate-400 uppercase font-semibold mb-1 block">Дата рождения</label>
                        <input type="date" value="${t.dob}" 
                            onchange="updateTourist('${t.id}', 'dob', this.value)"
                            class="w-full input-field rounded-lg p-3 md:p-2 text-base md:text-sm">
                    </div>
                    
                    <!-- Disability -->
                    <div class="col-span-1 w-full md:col-span-2">
                        <label class="md:hidden text-[10px] text-slate-400 uppercase font-semibold mb-1 block">Инвалидность</label>
                        <select onchange="updateTourist('${t.id}', 'disability', this.value)"
                            class="w-full input-field rounded-lg p-3 md:p-2 text-base md:text-sm appearance-none">
                            <option value="none" ${t.disability === 'none' ? 'selected' : ''}>Нет инвал.</option>
                            <option value="1" ${t.disability === '1' ? 'selected' : ''}>1 категория</option>
                            <option value="2" ${t.disability === '2' ? 'selected' : ''}>2 категория</option>
                            <option value="3" ${t.disability === '3' ? 'selected' : ''}>3 категория</option>
                        </select>
                    </div>
                </div>
                
                <!-- Stats Row (Age, Category, Price) -->
                <div class="col-span-12 w-full flex justify-between items-center mt-1 md:mt-0 md:contents border-t border-slate-200 md:border-0 pt-3 md:pt-0">
                    <div class="flex space-x-6 md:contents">
                        <!-- Age -->
                        <div class="md:col-span-1 text-left md:text-center flex flex-col items-start md:items-center">
                            <label class="md:hidden text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Возраст</label>
                            <span class="text-base md:text-sm font-bold ${age === null ? 'text-slate-500' : 'text-[#0076ba]'}">
                                ${age !== null ? age : '-'}
                            </span>
                        </div>
                        
                        <!-- Category -->
                        <div class="md:col-span-1 text-left md:text-center flex flex-col items-start md:items-center">
                            <label class="md:hidden text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Тип</label>
                            <span class="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-brand-accent border border-brand-accent/30 shadow-inner">
                                ${category}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Price -->
                    <div class="md:col-span-2 text-right flex flex-col items-end justify-center">
                        ${discountPercent > 0 ? `<span class="badge-discount text-[10px] px-2 py-0.5 rounded-full mb-1 leading-none shadow-sm font-semibold">-${discountPercent}%</span>` : ''}
                        <span class="text-lg md:text-base font-bold ${finalPrice > 0 ? 'text-slate-900' : 'text-slate-500'}">
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
        stats.dis.textContent = counts.dis;

        // Экспорт данных
        exportDataEl.value = exportLines.join('\n');

        // Авто-сохранение
        saveDraft();

        // Для доступа из HTML
        window.updateTourist = updateTourist;
        window.removeTourist = removeTourist;
    }

    function saveDraft() {
        const data = {
            visitDate: visitDateInput.value,
            clientType: clientTypeInput.value,
            tariffType: tariffTypeInput.value,
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

    function generateReceiptImage() {
        const container = document.getElementById('receiptContainer');
        const content = document.getElementById('receiptContent');
        const metaEl = document.getElementById('receiptMeta');
        const touristsEl = document.getElementById('receiptTourists');
        const totalEl = document.getElementById('receiptTotal');
        
        // Сбор данных
        const dateParts = visitDateInput.value.split('-');
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}` : visitDateInput.value;
        const clientText = clientTypeInput.options[clientTypeInput.selectedIndex].text;
        const tariffText = tariffTypeInput.options[tariffTypeInput.selectedIndex].text;
        
        metaEl.innerHTML = `
            <div class="flex justify-between items-center"><span class="text-brand-blue">Дата:</span> <span class="font-bold text-slate-900">${formattedDate}</span></div>
            <div class="flex justify-between items-center"><span class="text-brand-blue">Клиент:</span> <span class="font-bold text-slate-900">${clientText}</span></div>
            <div class="flex justify-between items-center"><span class="text-brand-blue">Тариф:</span> <span class="font-bold text-slate-900">${tariffText}</span></div>
        `;
        
        touristsEl.innerHTML = '';
        tourists.forEach((t, i) => {
            if (!t.fullName && !t.dob) return; // Пропуск пустых строк
            const age = calculateAge(t.dob, visitDateInput.value);
            const cat = getPassengerCategory(age);
            const basePrice = getBasePrice(visitDateInput.value, clientTypeInput.value, tariffTypeInput.value, cat);
            
            const today = new Date();
            const visitD = new Date(visitDateInput.value);
            const earlyBookingEnabled = visitDateInput.value && ((visitD.getFullYear() > today.getFullYear()) || (visitD.getFullYear() === today.getFullYear() && visitD.getMonth() > today.getMonth()));
            let discInfo = calculateDiscount(t.dob, visitDateInput.value, t.disability, age);
            if (typeof discInfo === 'number') discInfo = { percent: 0, isBirthday: false };
            
            let disc = discInfo.percent || 0;
            if (earlyBookingEnabled && disc < 100 && age >= 4) {
                disc = Math.max(disc, CONFIG.discounts.earlyBooking);
            }
            const finalP = basePrice > 0 ? basePrice * (1 - disc / 100) : 0;
            
            touristsEl.innerHTML += `
                <div class="flex justify-between items-center text-sm bg-slate-100 p-3 rounded-xl border border-slate-200 mb-2">
                    <div class="pr-2 w-2/3">
                        <div class="font-semibold text-slate-900 truncate">${t.fullName || 'Гость ' + (i+1)} ${discInfo.isBirthday ? '🎂' : ''}</div>
                        <div class="text-[11px] text-slate-400 mt-0.5">${cat} ${age !== null ? `(${age} лет)` : ''} ${disc > 0 ? `<span class="bg-brand-accent/20 text-brand-accent px-1.5 py-0.5 rounded ml-1">-${disc}%</span>` : ''}</div>
                    </div>
                    <div class="font-bold text-slate-900 whitespace-nowrap text-right">
                        ${basePrice === -1 ? 'Нет тарифа' : Math.round(finalP).toLocaleString('ru-RU')} ₸
                    </div>
                </div>
            `;
        });
        
        totalEl.textContent = totalPriceEl.textContent;
        
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
            
            downloadReceiptBtn.innerHTML = '<i class="fa-solid fa-check mr-1.5"></i> Сохранено';
            setTimeout(() => { downloadReceiptBtn.innerHTML = originalBtnHtml; }, 2000);
        }).catch(err => {
            console.error('Ошибка создания чека', err);
            downloadReceiptBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1.5"></i> Ошибка';
            setTimeout(() => { downloadReceiptBtn.innerHTML = originalBtnHtml; }, 2000);
            
            // Возврат элемента на место в случае ошибки
            content.style.position = '';
            content.style.top = '';
            content.style.left = '';
            content.classList.add('opacity-0', 'pointer-events-none');
            container.appendChild(content);
        });
    }
});





