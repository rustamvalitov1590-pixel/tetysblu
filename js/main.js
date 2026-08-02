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

    // Переключает фон <body> с "подводного" (экран логина) на светлый
    // рабочий фон дашборда — один раз, при входе в приложение.
    function enterApp() {
        if (authScreen) authScreen.classList.add('hidden');
        if (appContent) appContent.classList.remove('hidden');
        document.body.classList.remove('underwater-bg');
        document.body.classList.add('daylight-bg');
    }

    // Изменили ключ, чтобы сбросить старую сессию без пароля
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
    // -------------------

    // --- ФУНКЦИЯ ПРОВЕРКИ АВТОРИЗАЦИИ (ИСПРАВЛЕНА: ЛОКАЛЬНЫЙ ВХОД + ИСПРАВЛЕННЫЙ ЗАПРОС) ---
    async function checkAuth() {
        const login = authLogin ? authLogin.value.trim().toLowerCase() : '';
        const pass = authPin ? authPin.value : '';

        if (authBtn) authBtn.disabled = true;

        // 1. Локальная проверка (Гарантированный моментальный вход)
        if (login === 'admin' && pass === 'tetys2026') {
            if (authError) authError.classList.add('hidden');
            localStorage.setItem('tetysAuthV2', 'true');
            localStorage.setItem('tetysUser', 'admin');

            if (authScreen) authScreen.style.opacity = '0';
            setTimeout(() => {
                enterApp();
                if (appContent) appContent.style.animation = 'popIn 0.5s ease-out forwards';
                if (authBtn) authBtn.disabled = false;
            }, 300);
            return;
        }

        // 2. Если логин/пароль другие — проверяем через Edge Function
        if (!supabaseClient) {
            if (authError) {
                authError.textContent = 'Нет подключения к серверу авторизации';
                authError.classList.remove('hidden');
            }
            if (authBtn) authBtn.disabled = false;
            return;
        }

        try {
            const { data, error } = await supabaseClient.functions.invoke('verify-login', {
                body: { login: login, password: pass } // Передается password вместо pass
            });

            if (error || !data || (!data.ok && !data.success)) {
                if (authError) {
                    authError.textContent = 'Неверный логин или пароль';
                    authError.classList.remove('hidden');
                }
                if (authPin) authPin.value = '';
                if (authFormBody) {
                    authFormBody.style.animation = 'shake 0.4s ease-in-out';
                    setTimeout(() => { authFormBody.style.animation = ''; }, 400);
                }
                return;
            }

            if (authError) authError.classList.add('hidden');
            localStorage.setItem('tetysAuthV2', 'true');
            localStorage.setItem('tetysUser', data.user || login);

            if (authScreen) authScreen.style.opacity = '0';
            setTimeout(() => {
                enterApp();
                if (appContent) appContent.style.animation = 'popIn 0.5s ease-out forwards';
            }, 300);
        } catch (e) {
            console.error('Ошибка проверки логина:', e);
            if (authError) {
                authError.textContent = 'Ошибка соединения. Попробуйте ещё раз';
                authError.classList.remove('hidden');
            }
        } finally {
            if (authBtn) authBtn.disabled = false;
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

            let { error } = await supabaseClient
                .from('calculations')
                .insert([insertData]);

            if (error && error.message && (error.message.includes('column') || error.code === 'PGRST204' || error.code === '42703')) {
                console.warn('Supabase: отсутствуют колонки, сохраняем базовые данные без promocode, comment и status.');
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
        if (!supabaseClient) {
            console.warn("Нет подключения к Supabase");
            return [];
        }
        try {
            let query = supabaseClient.from('calculations').select('*').order('created_at', { ascending: false });
            if (limit > 0) query = query.limit(limit);

            const { data, error } = await query;
            if (error) {
                throw error;
            }
            if (data) {
                return data.map(row => ({
                    id: row.id,
                    timestamp: row.created_at || new Date().toISOString(),
                    visitDate: row.visit_date,
                    clientType: row.client_type,
                    tariffType: row.tariff_type,
                    totalSum: row.total_sum,
                    tourists: row.tourists || [],
                    promocode: row.promocode || '',
                    comment: row.comment || '',
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
        if (!supabaseClient) {
            if (window.showToast) window.showToast('Ошибка: Нет подключения к облаку', 'fa-triangle-exclamation', 'bg-red-500');
            return;
        }

        try {
            const { error } = await supabaseClient.from('calculations').delete().eq('id', id);
            if (error) throw error;

            if (window.showToast) window.showToast('Чек успешно удален', 'fa-trash', 'bg-emerald-500');
            renderHistory();
            const dbSearchInput = document.getElementById('dbSearchInput');
            dbAllRecords = await getHistoryData(0);
            renderDbTable(dbSearchInput ? dbSearchInput.value : '');
        } catch (err) {
            console.error('Ошибка удаления:', err);
            if (window.showToast) window.showToast('Ошибка при удалении', 'fa-triangle-exclamation', 'bg-red-500');
        }
    };

    window.updateHistoryStatus = async function (id, status) {
        if (!supabaseClient) {
            if (window.showToast) window.showToast('Ошибка: Нет подключения к облаку', 'fa-triangle-exclamation', 'bg-red-500');
            return;
        }
        try {
            let userLoginVal = 'unknown';
            if (status === 'Заявка' || status === 'Ожидание оплаты') {
                userLoginVal = 'client_form';
            } else if (status === 'Отказ') {
                userLoginVal = 'client_form_declined';
            } else if (status === 'Оплачено') {
                let baseUser = localStorage.getItem('tetysUser') || 'unknown';
                if (baseUser.endsWith('_paid')) baseUser = baseUser.replace('_paid', '');
                userLoginVal = baseUser + '_paid';
            } else if (status === 'Оформлено') {
                let baseUser = localStorage.getItem('tetysUser') || 'unknown';
                if (baseUser.endsWith('_paid')) baseUser = baseUser.replace('_paid', '');
                userLoginVal = baseUser;
            }

            const { error } = await supabaseClient
                .from('calculations')
                .update({ status: status, user_login: userLoginVal })
                .eq('id', id);

            if (error) {
                const { error: error2 } = await supabaseClient
                    .from('calculations')
                    .update({ user_login: userLoginVal })
                    .eq('id', id);
                if (error2) throw error2;
            }

            if (window.showToast) window.showToast('Статус обновлен в облаке', 'fa-check', 'bg-emerald-500');
            renderHistory();
        } catch (e) {
            console.error("Ошибка при обновлении статуса:", e);
            if (window.showToast) window.showToast('Ошибка при обновлении статуса', 'fa-triangle-exclamation', 'bg-red-500');
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

            let todayRevenue = 0;
            let todayGuests = 0;
            let activeRequests = 0;
            let paidCount = 0;

            data.forEach(item => {
                const itemDate = new Date(item.timestamp);
                const isToday = itemDate >= today;

                if (item.status === 'Ожидание оплаты') {
                    activeRequests++;
                }

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

                const currentPendingIds = new Set(pendingRequests.map(r => r.id));
                for (let id of knownPendingRequestIds) {
                    if (!currentPendingIds.has(id)) {
                        knownPendingRequestIds.delete(id);
                    }
                }

                if (hasNew && !isFirstCheck) {
                    if (window.showToast) window.showToast('Поступила новая заявка от клиента!', 'fa-bell', 'bg-amber-500');
                    if (requestsModal && !requestsModal.classList.contains('hidden')) {
                        renderRequests();
                    }
                }
                isFirstCheck = false;

                if (pendingRequests.length > 0) {
                    if (requestsPingBadge) requestsPingBadge.classList.remove('hidden');
                } else {
                    if (requestsPingBadge) requestsPingBadge.classList.add('hidden');
                }
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
            if (!result) {
                console.warn('Supabase не ответил за 4с — используются локальные цены/акции по умолчанию.');
                return;
            }
            const [settingsRes, promosRes] = result;

            if (settingsRes && settingsRes.data && settingsRes.data.value) {
                const remote = settingsRes.data.value;
                if (remote.day && typeof CONFIG !== 'undefined') CONFIG.tariffs.day = remote.day;
                if (remote.evening && typeof CONFIG !== 'undefined') CONFIG.tariffs.evening = remote.evening;
                if (typeof remote.earlyBookingFallback === 'number' && typeof CONFIG !== 'undefined') {
                    CONFIG.discounts.earlyBooking = remote.earlyBookingFallback;
                }
            }

            if (promosRes && promosRes.data) {
                activePromotions = promosRes.data;
            }
        } catch (e) {
            console.error('Не удалось загрузить цены/акции из Supabase:', e);
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
            const eased = easeOutExpo(progress);
            const current = Math.round(oldValue + (newValue - oldValue) * eased);
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

    const currentSeasonYearEl = document.getElementById('currentSeasonYear');
    if (currentSeasonYearEl) {
        currentSeasonYearEl.textContent = `Сезон ${today.getFullYear()}`;
    }

    if (visitDateInput) visitDateInput.addEventListener('change', render);
    if (clientTypeInput) clientTypeInput.addEventListener('change', render);
    if (tariffTypeInput) tariffTypeInput.addEventListener('change', render);
    if (addTouristBtn) addTouristBtn.addEventListener('click', addTourist);

    const earlyBookingContainer = document.getElementById('earlyBookingContainer');
    const earlyBookingBadge = document.getElementById('earlyBookingBadge');

    const draft = localStorage.getItem('tetisBluDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            if (data.clientType && clientTypeInput) clientTypeInput.value = data.clientType;
            if (data.tariffType && tariffTypeInput) tariffTypeInput.value = data.tariffType;
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

    if (tourists.length > 0) render();

    let lastAttemptedText = '';

    // --- ПАРСИНГ ТЕКСТА ИЗ МЕССЕНДЖЕРОВ (УМНЫЙ ВВОД) ---
    if (parseBulkBtn && bulkText) {
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
                const snrRegex = /(\d+)\s*(?:пенсионер[ыов]*|пенс|snr|pensioners?|зейнеткер(?:лер)?|зийнеткер(?:лер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;
                const invRegex = /(\d+)\s*(?:инвалид[ыов]*|инв|inv|мүгедек(?:тер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/g;

                let adlCount = 0, chldCount = 0, infCount = 0, snrCount = 0, invCount = 0;
                let matched = false, match;

                while ((match = adlRegex.exec(cleanText)) !== null) {
                    let count = parseInt(match[1], 10);
                    if (count > 500) return null;
                    adlCount += count; matched = true;
                }
                while ((match = chldRegex.exec(cleanText)) !== null) {
                    let count = parseInt(match[1], 10);
                    if (count > 500) return null;
                    chldCount += count; matched = true;
                }
                while ((match = infRegex.exec(cleanText)) !== null) {
                    let count = parseInt(match[1], 10);
                    if (count > 500) return null;
                    infCount += count; matched = true;
                }
                while ((match = snrRegex.exec(cleanText)) !== null) {
                    let count = parseInt(match[1], 10);
                    if (count > 500) return null;
                    snrCount += count; matched = true;
                }
                while ((match = invRegex.exec(cleanText)) !== null) {
                    let count = parseInt(match[1], 10);
                    if (count > 500) return null;
                    invCount += count; matched = true;
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
                for (let i = 0; i < quantityData.adl; i++) {
                    tourists.push({ id: createId(), fullName: `Гость ${tourists.length + 1}`, dob: `${visitYear - 25}-06-15`, gender: 'male', genderManuallySet: false, disability: 'none' });
                }
                for (let i = 0; i < quantityData.chld; i++) {
                    tourists.push({ id: createId(), fullName: `Гость ${tourists.length + 1}`, dob: `${visitYear - 8}-06-15`, gender: 'male', genderManuallySet: false, disability: 'none' });
                }
                for (let i = 0; i < quantityData.snr; i++) {
                    tourists.push({ id: createId(), fullName: `Гость ${tourists.length + 1}`, dob: `${visitYear - 65}-06-15`, gender: 'male', genderManuallySet: false, disability: 'none' });
                }
                for (let i = 0; i < quantityData.inf; i++) {
                    tourists.push({ id: createId(), fullName: `Гость ${tourists.length + 1}`, dob: `${visitYear - 1}-06-15`, gender: 'male', genderManuallySet: false, disability: 'none' });
                }
                for (let i = 0; i < quantityData.inv; i++) {
                    tourists.push({ id: createId(), fullName: `Гость ${tourists.length + 1}`, dob: `${visitYear - 30}-06-15`, gender: 'male', genderManuallySet: false, disability: '1', category: 'INV', categoryManuallySet: true });
                }

                render();
                bulkText.value = '';
                return;
            }

            let normalizedText = text;
            normalizedText = normalizedText.replace(/([a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(\d)/g, '$1 $2');
            normalizedText = normalizedText.replace(/(\b(?:0?[1-9]|[12]\d|3[01]))[\.\-\/\s\,]+(0?[1-9]|1[0-2])[\.\-\/\s\,]+(\d{4}|\d{2})\b/g, '$1.$2.$3');

            const lines = normalizedText.split('\n');
            const unrecognizedLines = [];

            lines.forEach((line, index) => {
                line = line.trim();
                if (!line) return;

                let tAge = undefined, tYear = undefined;
                let parsedCategory = null, parsedDisabilityGroup = null;

                const dobMatch = line.match(dobRegex);
                let dobIso = '', matchedStr = '';

                if (dobMatch) {
                    matchedStr = dobMatch[0];
                    const parts = matchedStr.split(/[\.\-\/\s\,]+/);
                    if (parts.length >= 3) {
                        let day = parts[0].padStart(2, '0');
                        let month = parts[1].padStart(2, '0');
                        let year = parts[2];
                        if (year.length === 2) year = (parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year)).toString();
                        dobIso = `${year}-${month}-${day}`;
                    }
                }

                let namePart = line;
                if (matchedStr) namePart = namePart.replace(matchedStr, '');
                namePart = namePart.replace(/^[\d\.\)\s\-]+/, '').replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s\-\']/g, ' ').trim();

                if (namePart.length >= 2 || dobIso) {
                    namePart = namePart.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

                    tourists.push({
                        id: createId(),
                        fullName: namePart || 'Гость',
                        dob: dobIso,
                        gender: 'male',
                        genderManuallySet: false,
                        disability: 'none'
                    });
                } else {
                    unrecognizedLines.push(line);
                }
            });

            if (tourists.length > 1 && tourists[0].fullName === '' && tourists[0].dob === '') {
                tourists.shift();
            }

            render();
            if (unrecognizedLines.length > 0) {
                bulkText.value = unrecognizedLines.join('\n');
            } else {
                bulkText.value = '';
            }
        });
    }

    function createId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    window.clearAllTourists = function () {
        if (confirm('Вы уверены, что хотите удалить всех гостей и начать заново?')) {
            tourists = [];
            addTourist();
        }
    };

    function addTourist() {
        tourists.push({ id: createId(), fullName: '', dob: '', gender: 'male', genderManuallySet: false, disability: 'none' });
        render();
    }

    window.removeTourist = function (id) {
        tourists = tourists.filter(t => t.id !== id);
        render();
    };

    window.updateTouristField = function (id, field, value) {
        const tourist = tourists.find(t => t.id === id);
        if (tourist) {
            tourist[field] = value;
            render();
        }
    };

    // --- РЕНДЕР И ВЕРСТКА СТРОК С УДАЛЕНИЕМ И РЕДАКТИРОВАНИЕМ ---
    function render() {
        const visitDate = visitDateInput ? visitDateInput.value : '';
        const clientType = clientTypeInput ? clientTypeInput.value : 'tourist';
        const tariffType = tariffTypeInput ? tariffTypeInput.value : 'day';

        let currentPromo = getApplicablePromotion(visitDate, tariffType);
        if (currentPromo && earlyBookingContainer) {
            earlyBookingContainer.classList.remove('hidden');
        } else if (earlyBookingContainer) {
            earlyBookingContainer.classList.add('hidden');
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
                if (typeof calculateAge === 'function') age = calculateAge(t.dob, visitDate);
                if (t.dob) {
                    if (typeof formatDate === 'function') displayDob = formatDate(t.dob);
                    else displayDob = t.dob;
                }
            }

            let category = 'ADL';
            if (typeof getPassengerCategory === 'function') {
                category = getPassengerCategory(age, t.gender, visitDate);
            }
            if (t.categoryManuallySet && t.category) category = t.category;
            t.category = category;

            let basePrice = 0;
            if (typeof getBasePrice === 'function') {
                basePrice = getBasePrice(visitDate, clientType, tariffType, category, age);
            }
            if (basePrice === -1) isTariffFound = false;

            let discountPercent = 0;
            let isBirthday = false;
            if (typeof calculateDiscount === 'function') {
                const discountInfo = calculateDiscount(t.dob, visitDate, category === 'INV' ? t.disability : 'none', age, t.gender, category);
                discountPercent = discountInfo.percent || 0;
                isBirthday = discountInfo.isBirthday || false;
            }

            if (category === 'INV' && t.disability !== '2' && t.disability !== '3') discountPercent = 100;

            let finalPrice = basePrice > 0 ? basePrice * (1 - discountPercent / 100) : 0;
            if (t.isManualPrice) finalPrice = t.manualPrice || 0;

            if (category === 'ADL') counts.adl++;
            if (category === 'CHLD') counts.chld++;
            if (category === 'INF') counts.inf++;
            if (category === 'SNR') counts.pens++;
            if (category === 'INV' || t.disability === '1' || t.disability === '2' || t.disability === '3') counts.inv++;
            if (isBirthday) counts.bday++;

            totalSum += finalPrice;

            let dobFormatted = displayDob;

            // Верстка каждой строки туриста с полями ввода и кнопкой корзины
            const row = document.createElement('div');
            row.className = 'tourist-row p-2 sm:p-2.5 border-b border-white/10 grid grid-cols-12 gap-2 items-center hover:bg-white/5 transition-colors';
            row.innerHTML = `
                <div class="col-span-4 sm:col-span-4">
                    <input type="text" placeholder="ФИО туриста" value="${t.fullName}" 
                        onchange="updateTouristField('${t.id}', 'fullName', this.value)"
                        class="w-full bg-transparent text-white border-b border-white/20 focus:border-cyan-400 focus:outline-none text-xs font-semibold py-1">
                </div>
                <div class="col-span-3 sm:col-span-3">
                    <input type="text" placeholder="ДД.ММ.ГГГГ" value="${dobFormatted || ''}" 
                        onchange="updateTouristField('${t.id}', 'dob', this.value)"
                        class="w-full bg-transparent text-slate-300 border-b border-white/20 focus:border-cyan-400 focus:outline-none text-xs py-1">
                </div>
                <div class="col-span-1 text-center text-xs font-bold text-cyan-400">
                    ${age !== null ? age : '-'}
                </div>
                <div class="col-span-1 text-center text-[10px] font-extrabold uppercase px-1 py-0.5 rounded bg-white/10 text-slate-200">
                    ${category}
                </div>
                <div class="col-span-2 text-right text-xs font-bold text-emerald-400">
                    ${Math.round(finalPrice).toLocaleString('ru-RU')} ₸
                </div>
                <div class="col-span-1 text-right">
                    <button onclick="removeTourist('${t.id}')" class="text-slate-400 hover:text-rose-400 p-1 transition-colors" title="Удалить гостя">
                        <i class="fa-solid fa-trash-can text-sm"></i>
                    </button>
                </div>
            `;
            if (touristListEl) touristListEl.appendChild(row);
        });

        animateValue(totalPriceEl, totalSum, { formatMoney: true, pulse: true });

        if (dateWarning) {
            if (!isTariffFound) dateWarning.classList.remove('hidden');
            else dateWarning.classList.add('hidden');
        }

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

        if (viewId === 'view-calculator' && viewCalc) {
            viewCalc.classList.remove('hidden');
        }
        if (viewId === 'view-dashboard' && viewDashboard) {
            viewDashboard.classList.remove('hidden');
            calculateStatistics();
        }
        if (viewId === 'view-database' && viewDatabase) {
            viewDatabase.classList.remove('hidden');
            dbAllRecords = await getHistoryData(0);
            renderDbTable();
        }
    }

    if (navCalcBtn) navCalcBtn.addEventListener('click', () => switchAppView('view-calculator'));
    if (navDashboardBtn) navDashboardBtn.addEventListener('click', () => switchAppView('view-dashboard'));
    if (navDatabaseBtn) navDatabaseBtn.addEventListener('click', () => switchAppView('view-database'));

    let dbAllRecords = [];
    const dbTableBody = document.getElementById('dbTableBody');
    const dbRecordCount = document.getElementById('dbRecordCount');

    function renderDbTable(query = '') {
        if (!dbTableBody) return;
        const q = query.toLowerCase().trim();
        let filtered = q ? dbAllRecords.filter(r => (r.visitDate || '').toLowerCase().includes(q) || JSON.stringify(r.tourists).toLowerCase().includes(q)) : dbAllRecords;

        if (dbRecordCount) {
            dbRecordCount.textContent = `Всего записей: ${dbAllRecords.length}`;
        }

        if (filtered.length === 0) {
            dbTableBody.innerHTML = `<tr><td colspan="9" class="text-center py-10 text-slate-400">Записи не найдены</td></tr>`;
            return;
        }

        dbTableBody.innerHTML = filtered.map((item, idx) => {
            const touristsList = (item.tourists || []).map(t => `${t.fullName || 'Гость'} (${t.dob || t.age || ''})`).join(', ');
            return `
            <tr class="border-b border-white/10 text-xs">
                <td class="px-4 py-3 text-white">${idx + 1}</td>
                <td class="px-4 py-3 text-white">${new Date(item.timestamp).toLocaleDateString('ru-RU')}</td>
                <td class="px-4 py-3 text-white">${item.visitDate || '—'}</td>
                <td class="px-4 py-3 text-white">${item.clientType === 'agent' ? 'Турагент' : 'Турист'}</td>
                <td class="px-4 py-3 text-white">${item.tariffType === 'evening' ? 'Вечерний' : 'Дневной'}</td>
                <td class="px-4 py-3 text-white">${(item.tourists || []).length}</td>
                <td class="px-4 py-3 text-white max-w-xs truncate">${touristsList || '—'}</td>
                <td class="px-4 py-3 text-emerald-400 font-bold">${(item.totalSum || 0).toLocaleString('ru-RU')} ₸</td>
                <td class="px-4 py-3 text-white text-center">${item.status}</td>
            </tr>`;
        }).join('');
    }

    const statisticsContent = document.getElementById('statisticsContent');

    async function calculateStatistics() {
        if (!statisticsContent) return;
        try {
            statisticsContent.innerHTML = '<div class="text-center text-slate-400 py-10"><i class="fa-solid fa-spinner fa-spin text-3xl mb-3 opacity-50"></i><p class="text-sm font-semibold">Загрузка аналитики...</p></div>';

            let history = await getHistoryData(0);

            if (history.length === 0) {
                statisticsContent.innerHTML = '<div class="text-center text-slate-400 py-10"><p class="text-sm font-semibold">Записи не найдены для аналитики</p></div>';
                return;
            }

            let totalRevenue = 0;
            let totalGuests = 0;

            history.forEach(item => {
                totalRevenue += (item.totalSum || 0);
                totalGuests += (item.tourists ? item.tourists.length : 0);
            });

            statisticsContent.innerHTML = `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                    <div class="kpi-card p-5 bg-white/5 border border-white/10 rounded-2xl">
                        <p class="text-xs text-slate-400 mb-1">Общая выручка</p>
                        <p class="text-2xl font-bold text-emerald-400">${totalRevenue.toLocaleString('ru-RU')} ₸</p>
                    </div>
                    <div class="kpi-card p-5 bg-white/5 border border-white/10 rounded-2xl">
                        <p class="text-xs text-slate-400 mb-1">Всего гостей</p>
                        <p class="text-2xl font-bold text-cyan-400">${totalGuests} чел</p>
                    </div>
                    <div class="kpi-card p-5 bg-white/5 border border-white/10 rounded-2xl">
                        <p class="text-xs text-slate-400 mb-1">Всего чеков/заявок</p>
                        <p class="text-2xl font-bold text-purple-400">${history.length}</p>
                    </div>
                </div>
            `;
        } catch (e) {
            console.error('Stats Error:', e);
            statisticsContent.innerHTML = '<div class="text-center text-red-400 py-10"><p>Ошибка расчёта аналитики</p></div>';
        }
    }

    // Инициализация при старте
    await loadRemoteConfig();
    if (tourists.length === 0) addTourist();
    render();
});
