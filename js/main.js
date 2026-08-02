document.addEventListener('DOMContentLoaded', async () => {
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

    // --- ПОИСК ПО ГОСТЯМ ---
    window.filterGuests = function (query) {
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

    // Переключает фон <body> с "подводного" (экран логина) на светлый рабочий фон
    function enterApp() {
        if (authScreen) authScreen.classList.add('hidden');
        if (appContent) appContent.classList.remove('hidden');
        document.body.classList.remove('underwater-bg');
        document.body.classList.add('daylight-bg');
    }

    if (localStorage.getItem('tetysAuthV2') === 'true') {
        enterApp();
    } else {
        if (authLogin) authLogin.focus();
    }

    if (authBtn) {
        authBtn.addEventListener('click', checkAuth);
        if (authPin) authPin.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAuth(); });
        if (authLogin) authLogin.addEventListener('keypress', (e) => { if (e.key === 'Enter') authPin.focus(); });
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

    // --- ФУНКЦИЯ ПРОВЕРКИ АВТОРИЗАЦИИ (ИСПРАВЛЕНА) ---
    async function checkAuth() {
        const login = authLogin.value.trim().toLowerCase();
        const pass = authPin.value;

        if (authBtn) authBtn.disabled = true;

        // 1. Локальная проверка (Гарантия входа)
        if (login === 'admin' && pass === 'tetys2026') {
            handleSuccessLogin(login);
            return;
        }

        // 2. Если логин/пароль другие, пробуем проверить через Supabase Edge Function
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient.functions.invoke('verify-login', {
                    body: { login: login, password: pass } // Исправлено: передается password вместо pass
                });

                if (!error && data && (data.ok || data.success)) {
                    handleSuccessLogin(data.user || login);
                    return;
                }
            } catch (e) {
                console.error('Ошибка проверки логина через сервер:', e);
            }
        }

        // Если не прошёл ни один вариант:
        showAuthError('Неверный логин или пароль');
        if (authBtn) authBtn.disabled = false;
    }

    function handleSuccessLogin(userRole) {
        if (authError) authError.classList.add('hidden');
        localStorage.setItem('tetysAuthV2', 'true');
        localStorage.setItem('tetysUser', userRole);

        if (authScreen) authScreen.style.opacity = '0';
        setTimeout(() => {
            enterApp();
            if (appContent) appContent.style.animation = 'popIn 0.5s ease-out forwards';
            if (authBtn) authBtn.disabled = false;
        }, 300);
    }

    function showAuthError(message) {
        if (authError) {
            authError.textContent = message;
            authError.classList.remove('hidden');
        }
        if (authPin) authPin.value = '';
        if (authFormBody) {
            authFormBody.style.animation = 'shake 0.4s ease-in-out';
            setTimeout(() => { authFormBody.style.animation = ''; }, 400);
        }
    }

    // Состояние приложения
    let tourists = [];
    let currentCalcMode = 'detailed';
    let quickCounts = { adl: 0, chld: 0, pens: 0, inf: 0 };
    let quickStatuses = { adl: [], chld: [], pens: [], inf: [] };

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

    if (promoInput) promoInput.addEventListener('input', render);
    if (commentInput) commentInput.addEventListener('input', saveDraft);

    function saveDraft() {
        const data = {
            visitDate: visitDateInput ? visitDateInput.value : '',
            clientType: clientTypeInput ? clientTypeInput.value : 'tourist',
            tariffType: tariffTypeInput ? tariffTypeInput.value : 'day',
            tourists: tourists,
            currentCalcMode: currentCalcMode,
            quickCounts: quickCounts,
            quickStatuses: quickStatuses,
            promo: promoInput ? promoInput.value : '',
            comment: commentInput ? commentInput.value : ''
        };
        localStorage.setItem('tetisBluDraft', JSON.stringify(data));
    }

    const SUPABASE_URL = 'https://zlnxvraopnwyfebfhmdj.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_2q7uufBD_85Esjf-1Mwrvg_hItngDPG';

    const supabaseClient = (typeof supabase !== 'undefined' && SUPABASE_URL !== 'ВАШ_SUPABASE_URL_ЗДЕСЬ')
        ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null;

    const historyDB = typeof localforage !== 'undefined' ? localforage.createInstance({
        name: "TetysBluCalc",
        storeName: "history"
    }) : null;

    async function saveToHistory() {
        if (!supabaseClient) {
            if (window.showToast) window.showToast('Ошибка: Нет подключения к облаку', 'fa-triangle-exclamation', 'bg-red-500');
            return;
        }
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
            comment: commentInput ? commentInput.value.trim() : '',
            status: 'Оплачено'
        };

        try {
            let insertData = {
                created_at: record.timestamp,
                visit_date: record.visitDate,
                client_type: record.clientType,
                tariff_type: record.tariffType,
                total_sum: record.totalSum,
                tourists: record.tourists,
                user_login: currentUser + '_paid',
                promocode: record.promocode,
                comment: record.comment,
                status: record.status
            };

            let { error } = await supabaseClient.from('calculations').insert([insertData]);

            if (error && error.message && (error.message.includes('column') || error.code === 'PGRST204' || error.code === '42703')) {
                delete insertData.promocode;
                delete insertData.comment;
                delete insertData.status;
                const retry = await supabaseClient.from('calculations').insert([insertData]);
                error = retry.error;
            }

            if (error) {
                console.error("Ошибка Supabase:", error);
                if (window.showToast) window.showToast('Ошибка сохранения в базу', 'fa-triangle-exclamation', 'bg-red-500');
                throw error;
            } else {
                if (window.showToast) window.showToast('Сохранено в облако', 'fa-cloud-check', 'bg-emerald-500');
            }

            if (record.totalSum >= CONFIG.telegram.minSumForAlert) {
                sendTelegramNotification(record, currentUser);
            }
            if (typeof updateDashboardTopStats === 'function') updateDashboardTopStats();

        } catch (err) {
            console.error("Ошибка сохранения в базу:", err);
        }
    }

    async function sendTelegramNotification(record, currentUser) {
        if (!supabaseClient) return;
        try {
            await supabaseClient.functions.invoke('telegram-alert', {
                body: {
                    totalSum: record.totalSum,
                    visitDate: record.visitDate,
                    guestsCount: record.tourists.length,
                    isAgent: record.clientType === 'agent',
                    promocode: record.promocode,
                    comment: record.comment,
                    cashier: currentUser
                }
            });
        } catch (error) {
            console.error("Ошибка отправки в Telegram:", error);
        }
    }

    async function getHistoryData(limit = 0) {
        if (!supabaseClient) return [];
        try {
            let query = supabaseClient.from('calculations').select('*').order('created_at', { ascending: false });
            if (limit > 0) query = query.limit(limit);

            const { data, error } = await query;
            if (error) throw error;
            if (data) {
                return data.map(row => ({
                    id: row.id,
                    timestamp: row.created_at,
                    visitDate: row.visit_date,
                    clientType: row.client_type,
                    tariffType: row.tariff_type,
                    totalSum: row.total_sum,
                    tourists: row.tourists,
                    promocode: row.promocode,
                    comment: row.comment,
                    status: row.status || (row.user_login === 'client_form' ? 'Ожидание оплаты' : (row.user_login === 'client_form_declined' || row.user_login === 'declined' ? 'Отказ' : (row.user_login && row.user_login.endsWith('_paid') ? 'Оплачено' : 'Оформлено'))),
                    user_login: row.user_login
                }));
            }
        } catch (e) {
            console.error("Supabase fetch error:", e);
        }
        return [];
    }

    window.deleteHistoryRecord = async function (id) {
        if (!confirm('Вы действительно хотите удалить этот чек? Это действие нельзя отменить.')) return;
        if (!supabaseClient) return;

        try {
            const { error } = await supabaseClient.from('calculations').delete().eq('id', id);
            if (error) throw error;

            if (window.showToast) window.showToast('Чек успешно удален', 'fa-trash', 'bg-emerald-500');
            renderHistory();
            renderDbTable(dbSearchInput ? dbSearchInput.value : '');
        } catch (err) {
            console.error('Ошибка удаления:', err);
            if (window.showToast) window.showToast('Ошибка при удалении', 'fa-triangle-exclamation', 'bg-red-500');
        }
    };

    window.updateHistoryStatus = async function (id, status) {
        if (!supabaseClient) return;
        try {
            let userLoginVal = 'unknown';
            if (status === 'Заявка' || status === 'Ожидание оплаты') userLoginVal = 'client_form';
            else if (status === 'Отказ') userLoginVal = 'client_form_declined';
            else if (status === 'Оплачено') {
                let baseUser = localStorage.getItem('tetysUser') || 'unknown';
                if (baseUser.endsWith('_paid')) baseUser = baseUser.replace('_paid', '');
                userLoginVal = baseUser + '_paid';
            } else if (status === 'Оформлено') {
                let baseUser = localStorage.getItem('tetysUser') || 'unknown';
                if (baseUser.endsWith('_paid')) baseUser = baseUser.replace('_paid', '');
                userLoginVal = baseUser;
            }

            const { error } = await supabaseClient.from('calculations').update({ status: status, user_login: userLoginVal }).eq('id', id);

            if (error) {
                await supabaseClient.from('calculations').update({ user_login: userLoginVal }).eq('id', id);
            }

            if (window.showToast) window.showToast('Статус обновлен в облаке', 'fa-check', 'bg-emerald-500');
            renderHistory();
        } catch (e) {
            console.error("Ошибка при обновлении статуса:", e);
        }
    };

    async function updateDashboardTopStats() {
        const topStatRevenue = document.getElementById('topStatRevenue');
        const topStatGuests = document.getElementById('topStatGuests');
        const topStatRequests = document.getElementById('topStatRequests');
        const topStatAvgCheck = document.getElementById('topStatAvgCheck');

        if (!topStatRevenue || !topStatGuests || !topStatRequests || !topStatAvgCheck) return;

        try {
            const data = await getHistoryData(0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let todayRevenue = 0, todayGuests = 0, activeRequests = 0, paidCount = 0;

            data.forEach(item => {
                const itemDate = new Date(item.timestamp);
                const isToday = itemDate >= today;

                if (item.status === 'Ожидание оплаты') activeRequests++;

                if (isToday && (item.status === 'Оплачено' || item.status === 'ЗАВЕРШЕНО' || !item.status)) {
                    todayRevenue += (item.totalSum || 0);
                    todayGuests += (item.tourists ? item.tourists.length : 0);
                    paidCount++;
                }
            });

            const avgCheck = paidCount > 0 ? Math.round(todayRevenue / paidCount) : 0;

            topStatRevenue.textContent = todayRevenue.toLocaleString('ru-RU') + ' ₸';
            topStatGuests.textContent = todayGuests;
            topStatRequests.textContent = activeRequests;
            topStatAvgCheck.textContent = avgCheck.toLocaleString('ru-RU') + ' ₸';

        } catch (e) {
            console.error("Error updating top stats:", e);
        }
    }

    let knownPendingRequestIds = new Set();
    let isFirstCheck = true;

    async function checkNewRequests() {
        if (!supabaseClient) return;
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { data, error } = await supabaseClient
                .from('calculations')
                .select('id, status, user_login')
                .gt('created_at', sevenDaysAgo.toISOString());

            if (!error && data) {
                const pendingRequests = data.filter(row => {
                    const status = row.status || (row.user_login === 'client_form' ? 'Ожидание оплаты' : 'Другое');
                    return status === 'Ожидание оплаты' && String(row.user_login).startsWith('client_form');
                });

                let hasNew = false;
                pendingRequests.forEach(req => {
                    if (!knownPendingRequestIds.has(req.id)) {
                        hasNew = true;
                        knownPendingRequestIds.add(req.id);
                    }
                });

                if (hasNew && !isFirstCheck && window.showToast) {
                    window.showToast('Поступила новая заявка от клиента!', 'fa-bell', 'bg-amber-500');
                }
                isFirstCheck = false;
            }
        } catch (e) {
            console.error("Error checking new requests:", e);
        }
    }

    let activePromotions = [];

    function getApplicablePromotion(visitDateStr, tariffType) {
        if (!visitDateStr || !activePromotions.length) return null;
        const todayStr = new Date().toISOString().split('T')[0];
        let best = null;
        for (const promo of activePromotions) {
            if (!promo.active) continue;
            if (promo.tariff_type !== 'both' && promo.tariff_type !== tariffType) continue;
            if (todayStr < promo.purchase_start || todayStr > promo.purchase_end) continue;
            if (visitDateStr < promo.visit_start || visitDateStr > promo.visit_end) continue;
            if (!best || promo.discount_percent > best.discount_percent) best = promo;
        }
        return best;
    }

    async function loadRemoteConfig() {
        if (!supabaseClient) return;
        try {
            const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 4000));
            const fetchPromise = Promise.all([
                supabaseClient.from('app_settings').select('value').eq('key', 'tariffs').maybeSingle(),
                supabaseClient.from('promotions').select('*').order('created_at', { ascending: false })
            ]);

            const result = await Promise.race([fetchPromise, timeout]);
            if (!result) return;
            const [settingsRes, promosRes] = result;

            if (settingsRes && settingsRes.data && settingsRes.data.value) {
                const remote = settingsRes.data.value;
                if (remote.day) CONFIG.tariffs.day = remote.day;
                if (remote.evening) CONFIG.tariffs.evening = remote.evening;
                if (typeof remote.earlyBookingFallback === 'number') {
                    CONFIG.discounts.earlyBooking = remote.earlyBookingFallback;
                }
            }

            if (promosRes && promosRes.data) {
                activePromotions = promosRes.data;
            }
        } catch (e) {
            console.error('Не удалось загрузить цены из Supabase:', e);
        }
    }

    function animateValue(el, newValue, { formatMoney = false, pulse = false } = {}) {
        if (!el) return;
        const oldValue = parseInt(el.textContent.replace(/\D/g, '')) || 0;
        newValue = Math.round(newValue);
        if (oldValue === newValue) return;

        if (el._animFrame) cancelAnimationFrame(el._animFrame);

        const duration = 450;
        const startTime = performance.now();
        const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.round(oldValue + (newValue - oldValue) * easeOutExpo(progress));
            el.textContent = formatMoney ? current.toLocaleString('ru-RU') : current;
            if (progress < 1) {
                el._animFrame = requestAnimationFrame(step);
            } else {
                el.textContent = formatMoney ? newValue.toLocaleString('ru-RU') : newValue;
                el._animFrame = null;
            }
        }
        el._animFrame = requestAnimationFrame(step);

        if (pulse) {
            el.classList.remove('value-pulse');
            void el.offsetWidth;
            el.classList.add('value-pulse');
        }
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

    if (visitDateInput) visitDateInput.addEventListener('change', render);
    if (clientTypeInput) clientTypeInput.addEventListener('change', render);
    if (tariffTypeInput) tariffTypeInput.addEventListener('change', render);
    if (addTouristBtn) addTouristBtn.addEventListener('click', addTourist);

    const earlyBookingContainer = document.getElementById('earlyBookingContainer');
    const earlyBookingBadge = document.getElementById('earlyBookingBadge');

    function createId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function addTourist() {
        tourists.push({ id: createId(), fullName: '', dob: '', gender: 'male', genderManuallySet: false, disability: 'none' });
        render();
    }

    function removeTourist(id) {
        tourists = tourists.filter(t => t.id !== id);
        render();
    }

    function render() {
        const visitDate = visitDateInput ? visitDateInput.value : '';
        const clientType = clientTypeInput ? clientTypeInput.value : 'tourist';
        const tariffType = tariffTypeInput ? tariffTypeInput.value : 'day';

        let earlyBookingEnabled = false;
        let currentPromo = null;

        if (visitDate && earlyBookingContainer) {
            currentPromo = getApplicablePromotion(visitDate, tariffType);
            if (currentPromo) {
                earlyBookingEnabled = true;
                earlyBookingContainer.classList.remove('hidden');
            } else {
                earlyBookingContainer.classList.add('hidden');
            }
        }

        if (touristListEl) touristListEl.innerHTML = '';
        if (emptyState) {
            if (tourists.length === 0) emptyState.classList.remove('hidden');
            else emptyState.classList.add('hidden');
        }

        let totalSum = 0;
        let isTariffFound = true;
        let counts = { adl: 0, chld: 0, inf: 0, pens: 0, inv: 0, bday: 0 };
        let exportDataList = [];

        tourists.forEach((t, index) => {
            if (!t.gender) t.gender = 'male';

            let age = null;
            let displayDob = '';
            if (t.age !== undefined) {
                age = t.age;
                displayDob = (new Date().getFullYear() - t.age).toString();
            } else if (t.year !== undefined) {
                age = new Date().getFullYear() - t.year;
                displayDob = t.year.toString();
            } else {
                age = calculateAge(t.dob, visitDate);
                if (t.dob) displayDob = formatDate(t.dob);
            }

            let category = getPassengerCategory(age, t.gender, visitDate);
            if (t.categoryManuallySet && t.category) category = t.category;
            t.category = category;

            const basePrice = getBasePrice(visitDate, clientType, tariffType, category, age);
            if (basePrice === -1) isTariffFound = false;

            const discountInfo = calculateDiscount(t.dob, visitDate, category === 'INV' ? t.disability : 'none', age, t.gender, category);
            let discountPercent = discountInfo.percent || 0;

            if (category === 'INV' && t.disability !== '2' && t.disability !== '3') discountPercent = 100;

            const hasOtherDiscounts = discountInfo.isBirthday || discountInfo.isPensioner || (t.disability && t.disability !== 'none');
            if (currentPromo && !hasOtherDiscounts && discountPercent < 100 && age >= 4) {
                discountPercent = Math.max(discountPercent, currentPromo.discount_percent);
            }

            let finalPrice = basePrice > 0 ? basePrice * (1 - discountPercent / 100) : 0;
            if (t.isManualPrice) finalPrice = t.manualPrice || 0;

            if (category === 'ADL') counts.adl++;
            if (category === 'CHLD') counts.chld++;
            if (category === 'INF') counts.inf++;
            if (category === 'SNR') counts.pens++;
            if (category === 'INV') counts.inv++;
            if (discountInfo.isBirthday) counts.bday++;

            totalSum += finalPrice;

            const row = document.createElement('div');
            row.className = 'tourist-row p-2 border-b border-white/5 flex justify-between items-center';
            row.innerHTML = `
                <span class="text-xs text-white font-medium">${t.fullName || 'Гость ' + (index + 1)} (${category})</span>
                <span class="text-xs text-cyan-400 font-bold">${Math.round(finalPrice).toLocaleString('ru-RU')} ₸</span>
            `;
            if (touristListEl) touristListEl.appendChild(row);
        });

        animateValue(totalPriceEl, totalSum, { formatMoney: true, pulse: true });

        animateValue(stats.adl, counts.adl);
        animateValue(stats.chld, counts.chld);
        animateValue(stats.inf, counts.inf);
        animateValue(stats.pens, counts.pens);
        if (stats.inv) animateValue(stats.inv, counts.inv);
        animateValue(stats.bday, counts.bday);

        saveDraft();
    }

    // --- SPA ROUTING ---
    const navCalcBtn = document.getElementById('navCalcBtn');
    const navDashboardBtn = document.getElementById('navDashboardBtn');
    const navDatabaseBtn = document.getElementById('navDatabaseBtn');

    const viewCalc = document.getElementById('view-calculator');
    const viewDashboard = document.getElementById('view-dashboard');
    const viewDatabase = document.getElementById('view-database');

    async function switchAppView(viewId) {
        [viewCalc, viewDashboard, viewDatabase].forEach(v => { if (v) v.classList.add('hidden'); });

        if (viewId === 'view-calculator' && viewCalc) viewCalc.classList.remove('hidden');
        if (viewId === 'view-dashboard' && viewDashboard) viewDashboard.classList.remove('hidden');
        if (viewId === 'view-database' && viewDatabase) {
            if (viewDatabase) viewDatabase.classList.remove('hidden');
            dbAllRecords = await getHistoryData(0);
            renderDbTable();
        }
    }

    if (navCalcBtn) navCalcBtn.addEventListener('click', () => switchAppView('view-calculator'));
    if (navDashboardBtn) navDashboardBtn.addEventListener('click', () => switchAppView('view-dashboard'));
    if (navDatabaseBtn) navDatabaseBtn.addEventListener('click', () => switchAppView('view-database'));

    let dbAllRecords = [];
    const dbTableBody = document.getElementById('dbTableBody');

    function renderDbTable(query = '') {
        if (!dbTableBody) return;
        const q = query.toLowerCase().trim();
        let filtered = q ? dbAllRecords.filter(r => (r.visitDate || '').toLowerCase().includes(q)) : dbAllRecords;

        if (filtered.length === 0) {
            dbTableBody.innerHTML = `<tr><td colspan="9" class="text-center py-10 text-slate-400">Записей не найдено</td></tr>`;
            return;
        }

        dbTableBody.innerHTML = filtered.map((item, idx) => `
            <tr class="border-b border-white/10 text-xs">
                <td class="px-4 py-3 text-white">${idx + 1}</td>
                <td class="px-4 py-3 text-white">${item.visitDate || '—'}</td>
                <td class="px-4 py-3 text-white">${item.clientType}</td>
                <td class="px-4 py-3 text-white">${item.tariffType}</td>
                <td class="px-4 py-3 text-white">${(item.tourists || []).length}</td>
                <td class="px-4 py-3 text-emerald-400 font-bold">${(item.totalSum || 0).toLocaleString('ru-RU')} ₸</td>
            </tr>
        `).join('');
    }

    // Инициализация при старте
    await loadRemoteConfig();
    if (tourists.length === 0) addTourist();
    render();
});
