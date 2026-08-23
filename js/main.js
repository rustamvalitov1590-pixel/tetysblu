// --- ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК ОШИБОК ---
// Показывает на экране понятный баннер при любой непойманной ошибке JS,
// плюс сохраняет последние ошибки в localStorage — чтобы можно было
// сфотографировать телефон или прислать текст без открытия консоли.
(function () {
    function saveError(info) {
        try {
            const list = JSON.parse(localStorage.getItem('tetysErrorLog') || '[]');
            list.unshift({ ...info, time: new Date().toISOString() });
            localStorage.setItem('tetysErrorLog', JSON.stringify(list.slice(0, 10)));
        } catch (e) { /* ignore */ }
    }

    function showBanner(text) {
        let banner = document.getElementById('globalErrorBanner');
        if (banner) banner.remove();

        banner = document.createElement('div');
        banner.id = 'globalErrorBanner';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;' +
            'background:#dc2626;color:#fff;font:12px/1.4 monospace;padding:10px 14px;' +
            'box-shadow:0 2px 8px rgba(0,0,0,.4);white-space:pre-wrap;word-break:break-word;' +
            'max-height:40vh;overflow:auto;pointer-events:auto;';

        const msg = document.createElement('div');
        msg.textContent = '⚠️ Ошибка в приложении: ' + text;
        banner.appendChild(msg);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'margin-top:8px;display:flex;gap:8px;';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Скрыть';
        closeBtn.style.cssText = 'background:#fff;color:#dc2626;border:none;border-radius:6px;padding:4px 10px;font-weight:bold;cursor:pointer;';
        closeBtn.onclick = () => banner.remove();

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Скопировать';
        copyBtn.style.cssText = 'background:#fff;color:#dc2626;border:none;border-radius:6px;padding:4px 10px;font-weight:bold;cursor:pointer;';
        copyBtn.onclick = () => {
            navigator.clipboard?.writeText(text).catch(() => {});
            copyBtn.textContent = 'Скопировано!';
        };

        btnRow.appendChild(closeBtn);
        btnRow.appendChild(copyBtn);
        banner.appendChild(btnRow);

        // Баннер — тонкая полоса сверху, НЕ перекрывает весь экран
        // и не блокирует клики по остальной части страницы.
        document.body.appendChild(banner);
    }

    window.addEventListener('error', (event) => {
        const text = `${event.message} (${event.filename}:${event.lineno}:${event.colno})`;
        saveError({ type: 'error', message: event.message, source: event.filename, line: event.lineno, stack: event.error?.stack });
        showBanner(text);
    });

    window.addEventListener('unhandledrejection', (event) => {
        const text = 'Promise: ' + (event.reason?.message || event.reason);
        saveError({ type: 'unhandledrejection', message: text, stack: event.reason?.stack });
        showBanner(text);
    });
})();

document.addEventListener('DOMContentLoaded', async () => {
    // Транслитерация — объявлена САМОЙ ПЕРВОЙ в этой области видимости,
    // чтобы её точно не вызвали раньше инициализации (была причина
    // случайных зависаний всего приложения: ReferenceError из-за TDZ у const).
    const cyrillicToLatinMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        'ә': 'a', 'ғ': 'g', 'қ': 'q', 'ң': 'n', 'ө': 'o', 'ұ': 'u', 'ү': 'u', 'һ': 'h', 'і': 'i'
    };

    function transliterate(text) {
        if (!text) return '';
        return text.toLowerCase().split('').map(char => cyrillicToLatinMap[char] || char).join('').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    }

    // Регистрация Service Worker для PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then((reg) => {
            // Принудительно проверяем, нет ли новой версии sw.js, при каждом заходе —
            // не полагаемся только на встроенную (иногда отложенную) проверку браузера.
            reg.update().catch(() => {});

            // Если уже есть SW, ожидающий активации, — не ждём, пока пользователь
            // сам перезайдёт, а сразу просим его активироваться.
            if (reg.waiting) {
                reg.waiting.postMessage('SKIP_WAITING');
            }
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        newWorker.postMessage('SKIP_WAITING');
                    }
                });
            });
        }).catch(err => console.error('SW registration failed', err));

        // Как только новый Service Worker реально взял управление страницей —
        // перезагружаем её один раз, чтобы подтянулись новые файлы.
        let swRefreshed = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (swRefreshed) return;
            swRefreshed = true;
            window.location.reload();
        });
    }

    // Вспомогательная функция для всплывающих уведомлений (Toast)
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
        authScreen.classList.add('hidden');
        appContent.classList.remove('hidden');
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

    // --- Цензура ---


    // Логин/пароль больше не хранятся в клиентском коде: проверка идёт
    // на сервере через Supabase Edge Function "verify-login".
    async function checkAuth() {
        const login = authLogin.value.trim().toLowerCase();
        const password = authPin.value;

        if (!supabaseClient) {
            authError.textContent = 'Нет подключения к серверу авторизации';
            authError.classList.remove('hidden');
            return;
        }

        if (authBtn) authBtn.disabled = true;

        try {
            const { data, error } = await supabaseClient.functions.invoke('verify-login', {
                body: {
                    login,
                    password
                }
            });

            if (error || !data || !data.ok) {
                authError.textContent = 'Неверный логин или пароль';
                authError.classList.remove('hidden');
                authPin.value = '';
                if (authFormBody) {
                    authFormBody.style.animation = 'shake 0.4s ease-in-out';
                    setTimeout(() => { authFormBody.style.animation = ''; }, 400);
                }
                return;
            }

            localStorage.setItem('tetysAuthV2', 'true');
            localStorage.setItem('tetysUser', data.user || login); // Запоминаем кто вошел

            authScreen.style.opacity = '0';
            setTimeout(() => {
                enterApp();
                appContent.style.animation = 'popIn 0.5s ease-out forwards';
            }, 300);
        } catch (e) {
            console.error('Ошибка проверки логина:', e);
            authError.textContent = 'Ошибка соединения. Попробуйте ещё раз';
            authError.classList.remove('hidden');
        } finally {
            if (authBtn) authBtn.disabled = false;
        }
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
    // Временно используем legacy JWT anon-ключ вместо sb_publishable_... —
    // проверяем, не в новом ли формате ключей причина CORS-ошибок на /rest/v1.
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsbnh2cmFvcG53eWZlYmZobWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDY0MTgsImV4cCI6MjA5ODg4MjQxOH0.npYssFPPcvk4PDzUjLpH9COKi4tRt_xlLkQUoDJCplU';

    // Инициализируем Supabase, если ключи не являются заглушками
    const supabaseClient = (typeof supabase !== 'undefined' && SUPABASE_URL !== 'ВАШ_SUPABASE_URL_ЗДЕСЬ')
        ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null;

    const historyDB = typeof localforage !== 'undefined' ? localforage.createInstance({
        name: "TetysBluCalc",
        storeName: "history"
    }) : null;

    let lastSavedFingerprint = null;

    async function saveToHistory() {
        if (!supabaseClient) {
            window.showToast('Ошибка: Нет подключения к облаку', 'fa-triangle-exclamation', 'bg-red-500');
            return;
        }
        if (tourists.length === 0 || (!tourists[0].fullName && !tourists[0].dob)) return;
        const total = parseInt(totalPriceEl.textContent.replace(/\D/g, '')) || 0;
        
        const currentFingerprint = JSON.stringify(tourists) + '|' + total;
        if (currentFingerprint === lastSavedFingerprint) {
            if (window.showToast) window.showToast('Дубликат: заявка уже сохранена', 'fa-info-circle', 'bg-slate-500');
            return;
        }

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
            // Отправляем строго в Supabase
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

            const { data, error } = await supabaseClient
                .from('calculations')
                .insert([insertData])
                .select();

            console.log('insertData =', insertData);
            console.log('data =', data);
            console.log('error =', error);

            if (error) {
                console.error(error);
            }

            // Если ошибка связана с отсутствием новых колонок, пробуем без них
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
                lastSavedFingerprint = currentFingerprint;
                if (window.showToast) window.showToast('Сохранено в облако', 'fa-cloud-check', 'bg-emerald-500');
            }

            // Telegram-уведомление при превышении лимита
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
        if (!supabaseClient) {
            window.showToast('Ошибка: Нет подключения к облаку', 'fa-triangle-exclamation', 'bg-red-500');
            return;
        }

        try {
            // Удаляем строго из Supabase
            const { error } = await supabaseClient.from('calculations').delete().eq('id', id);
            if (error) throw error;

            if (window.showToast) window.showToast('Чек успешно удален', 'fa-trash', 'bg-emerald-500');
            renderHistory(); // Перерисовываем список
            // Если мы находимся в Дашборде (БД), обновим и её
            const dbModal = document.getElementById('dashboardModal');
            if (dbModal && !dbModal.classList.contains('hidden')) {
                const dbTab = document.querySelector('[onclick="switchDashboardTab(\'db\')"]');
                if (dbTab && dbTab.classList.contains('bg-slate-100')) {
                    const dbSearchInput = document.getElementById('dbSearchInput');
                    dbAllRecords = await getHistoryData(0);
                    renderDbTable(dbSearchInput ? dbSearchInput.value : '');
                }
            }
        } catch (err) {
            console.error('Ошибка удаления:', err);
            if (window.showToast) window.showToast('Ошибка при удалении', 'fa-triangle-exclamation', 'bg-red-500');
        }
    };

    window.updateHistoryStatus = async function (id, status) {
        if (!supabaseClient) {
            window.showToast('Ошибка: Нет подключения к облаку', 'fa-triangle-exclamation', 'bg-red-500');
            return;
        }
        try {
            // Обновляем строго в Supabase
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
                // Фоллбек, если колонки status нет
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

        const miniStatRevenue = document.getElementById('miniStatRevenue');
        const miniStatGuests = document.getElementById('miniStatGuests');
        const miniStatDateInput = document.getElementById('miniStatDate');

        try {
            const data = await getHistoryData(0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Set default date for mini stats if empty
            if (miniStatDateInput && !miniStatDateInput.value) {
                const tzOffset = today.getTimezoneOffset() * 60000;
                miniStatDateInput.value = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
            }
            
            let miniDateStr = miniStatDateInput ? miniStatDateInput.value : '';
            let miniDateStart = null;
            let miniDateEnd = null;
            if (miniDateStr) {
                miniDateStart = new Date(miniDateStr);
                miniDateStart.setHours(0, 0, 0, 0);
                miniDateEnd = new Date(miniDateStr);
                miniDateEnd.setHours(23, 59, 59, 999);
            }

            let todayRevenue = 0;
            let todayGuests = 0;
            let activeRequests = 0;
            let paidCount = 0;
            
            let miniRevenue = 0;
            let miniGuests = 0;

            data.forEach(item => {
                const itemDate = new Date(item.timestamp);
                const isToday = itemDate >= today;
                
                const isMiniDate = miniDateStart && miniDateEnd && (itemDate >= miniDateStart && itemDate <= miniDateEnd);

                if (item.status === 'Ожидание оплаты') {
                    activeRequests++;
                }

                if (item.status === 'Оплачено' || item.status === 'ЗАВЕРШЕНО' || !item.status) {
                    if (isToday) {
                        todayRevenue += (item.totalSum || 0);
                        todayGuests += (item.tourists ? item.tourists.length : 0);
                        paidCount++;
                    }
                    if (isMiniDate) {
                        miniRevenue += (item.totalSum || 0);
                        miniGuests += (item.tourists ? item.tourists.length : 0);
                    }
                }
            });

            const avgCheck = paidCount > 0 ? Math.round(todayRevenue / paidCount) : 0;

            if (topStatRevenue) topStatRevenue.textContent = todayRevenue.toLocaleString('ru-RU') + ' ₸';
            if (topStatGuests) topStatGuests.textContent = todayGuests;
            if (topStatRequests) topStatRequests.textContent = activeRequests;
            if (topStatAvgCheck) topStatAvgCheck.textContent = avgCheck.toLocaleString('ru-RU') + ' ₸';

            if (miniStatRevenue) miniStatRevenue.textContent = miniRevenue.toLocaleString('ru-RU') + ' ₸';
            if (miniStatGuests) miniStatGuests.textContent = miniGuests;

            // Also update mobile copies
            const miniStatRevenueMob = document.getElementById('miniStatRevenueMob');
            const miniStatGuestsMob = document.getElementById('miniStatGuestsMob');
            const miniStatDateMob = document.getElementById('miniStatDateMob');
            if (miniStatRevenueMob) miniStatRevenueMob.textContent = miniRevenue.toLocaleString('ru-RU') + ' ₸';
            if (miniStatGuestsMob) miniStatGuestsMob.textContent = miniGuests;
            if (miniStatDateMob && miniStatDateInput) miniStatDateMob.value = miniStatDateInput.value;

        } catch (e) {
            console.error("Error updating top stats:", e);
        }
    }

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

                // Очистка старых ID (чтобы не копились)
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

    window.updateRequestStatus = async function (id, status) {
        try {
            if (supabaseClient) {
                try {
                    let userLoginVal = 'client_form';
                    if (status === 'Оплачено') userLoginVal = 'client_form_paid';
                    else if (status === 'Отказ') userLoginVal = 'client_form_declined';

                    const { error } = await supabaseClient
                        .from('calculations')
                        .update({ status: status, user_login: userLoginVal })
                        .eq('id', id);
                    if (error) {
                        const { error: error2 } = await supabaseClient
                            .from('calculations')
                            .update({ user_login: userLoginVal })
                            .eq('id', id);
                        if (error2) {
                            console.error("Supabase fallback status update error:", error2);
                        }
                    }
                } catch (e) {
                    console.warn("Supabase status update exception:", e);
                }
            }

            // Обновляем локально тоже, чтобы UI сразу отреагировал
            if (historyDB) {
                let hist = await historyDB.getItem('tetysBluHistory') || [];
                hist = hist.map(item => {
                    if (String(item.id) === String(id)) {
                        let newUserLogin = item.user_login;
                        if (status === 'Оплачено') newUserLogin = 'client_form_paid';
                        else if (status === 'Отказ') newUserLogin = 'client_form_declined';
                        return { ...item, status: status, user_login: newUserLogin };
                    }
                    return item;
                });
                await historyDB.setItem('tetysBluHistory', hist);
            }

            if (window.showToast) window.showToast('Статус обновлен на: ' + status, 'fa-check', 'bg-emerald-500');
            await renderRequests();
            await checkNewRequests();

            // Если архив открыт, обновим его тоже
            if (!historyModal.classList.contains('hidden')) {
                renderHistory();
            }
        } catch (err) {
            console.error('Ошибка обновления статуса заявки:', err);
            if (window.showToast) window.showToast('Ошибка обновления статуса', 'fa-triangle-exclamation', 'bg-red-500');
        }
    };



    // --- ЦЕНЫ И АКЦИИ (редактируются админом, хранятся в Supabase) ---
    // Список активных акций раннего бронирования, загружается при старте
    // из таблицы `promotions`. Пока не загружен (или Supabase недоступен) —
    // пустой массив, и приложение работает на ценах из js/config.js.
    let activePromotions = [];

    // Возвращает акцию с наибольшей скидкой, применимую сегодня к дате
    // посещения visitDateStr и типу тарифа tariffType, либо null.
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

    // Подтягивает переопределённые цены и список акций из Supabase.
    // При любой ошибке/недоступности сети приложение молча остаётся
    // на значениях по умолчанию из js/config.js — это не должно блокировать работу кассы.
    async function loadRemoteConfig() {
        if (!supabaseClient) return;
        try {
            const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 4000));
            const fetchPromise = Promise.all([
                supabaseClient.from('app_settings').select('key, value').in('key', ['tariffs', 'discounts']),
                supabaseClient.from('promotions').select('*').order('created_at', { ascending: false })
            ]);

            const result = await Promise.race([fetchPromise, timeout]);
            if (!result) {
                console.warn('Supabase не ответил за 4с — используются локальные цены/акции по умолчанию.');
                return;
            }
            const [settingsRes, promosRes] = result;

            if (settingsRes && settingsRes.data) {
                settingsRes.data.forEach(setting => {
                    if (setting.key === 'tariffs' && setting.value) {
                        const remote = setting.value;
                        if (remote.day) CONFIG.tariffs.day = remote.day;
                        if (remote.evening) CONFIG.tariffs.evening = remote.evening;
                        if (typeof remote.earlyBookingFallback === 'number') {
                            CONFIG.discounts.earlyBooking = remote.earlyBookingFallback;
                        }
                    } else if (setting.key === 'discounts' && setting.value) {
                        Object.assign(CONFIG.discounts, setting.value);
                    }
                });
            }

            if (promosRes && promosRes.data) {
                activePromotions = promosRes.data;
            }
        } catch (e) {
            console.error('Не удалось загрузить цены/акции из Supabase, используются значения по умолчанию:', e);
        }
    }

    // Плавная анимация числа (одометр): используется для суммы и статистики,
    // чтобы изменения ощущались живыми, а не мгновенным подменом текста.
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
            void el.offsetWidth; // restart animation
            el.classList.add('value-pulse');
        }
    }

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
    if (visitDateInput) {
        visitDateInput.value = todayStr;
        visitDateInput.min = todayStr;
    }

    // Автоматический год сезона
    const currentSeasonYearEl = document.getElementById('currentSeasonYear');
    if (currentSeasonYearEl) {
        currentSeasonYearEl.textContent = `Сезон ${today.getFullYear()}`;
    }

    if (visitDateInput) visitDateInput.addEventListener('change', render);
    if (clientTypeInput) clientTypeInput.addEventListener('change', render);
    if (tariffTypeInput) tariffTypeInput.addEventListener('change', render);
    if (addTouristBtn) addTouristBtn.addEventListener('click', addTourist);

    const earlyBookingContainer = document.getElementById('earlyBookingContainer');
    const earlyBookingBadge = document.getElementById('earlyBookingBadge'); // Из шапки

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
                let count = parseInt(match[1], 10);
                if (count > 500) return null; // Защита от годов (например, "1966 ADL")
                adlCount += count;
                matched = true;
            }
            while ((match = chldRegex.exec(cleanText)) !== null) {
                let count = parseInt(match[1], 10);
                if (count > 500) return null;
                chldCount += count;
                matched = true;
            }
            while ((match = infRegex.exec(cleanText)) !== null) {
                let count = parseInt(match[1], 10);
                if (count > 500) return null;
                infCount += count;
                matched = true;
            }
            while ((match = snrRegex.exec(cleanText)) !== null) {
                let count = parseInt(match[1], 10);
                if (count > 500) return null;
                snrCount += count;
                matched = true;
            }
            while ((match = invRegex.exec(cleanText)) !== null) {
                let count = parseInt(match[1], 10);
                if (count > 500) return null;
                invCount += count;
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

        let normalizedText = text;

        // 1. Отделяем слипшиеся цифры от букв (например "Джон15.05" -> "Джон 15.05")
        normalizedText = normalizedText.replace(/([a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(\d)/g, '$1 $2');

        // 2. Преобразование текстового возраста в цифры ("пять лет" -> "5 лет")
        const ageWordsMap = {
            'один': '1', 'два': '2', 'три': '3', 'четыре': '4', 'пять': '5', 'шесть': '6', 'семь': '7', 'восемь': '8', 'девять': '9', 'десять': '10', 'одиннадцать': '11', 'двенадцать': '12', 'тринадцать': '13', 'четырнадцать': '14', 'пятнадцать': '15', 'шестнадцать': '16', 'семнадцать': '17', 'восемнадцать': '18',
            'бір': '1', 'екі': '2', 'үш': '3', 'төрт': '4', 'бес': '5', 'алты': '6', 'жеті': '7', 'сегіз': '8', 'тоғыз': '9', 'он': '10', 'он бір': '11', 'он екі': '12',
            'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10', 'eleven': '11', 'twelve': '12'
        };
        const ageWordsRegex = new RegExp(`\\b(${Object.keys(ageWordsMap).join('|')})\\s+(?=лет|года?|жас|yo|years?(?:\\s+old)?|old\\b)`, 'gi');
        normalizedText = normalizedText.replace(ageWordsRegex, (match, p1) => `${ageWordsMap[p1.toLowerCase()]} `);

        // 3. Перевод месяцев на трех языках в числовой формат ГЛОБАЛЬНО
        const monthMapGlobal = {
            'января': '01', 'январь': '01', 'янв': '01', 'февраля': '02', 'февраль': '02', 'фев': '02', 'марта': '03', 'март': '03', 'мар': '03', 'апреля': '04', 'апрель': '04', 'апр': '04', 'мая': '05', 'май': '05', 'июня': '06', 'июнь': '06', 'июн': '06', 'июля': '07', 'июль': '07', 'июл': '07', 'августа': '08', 'август': '08', 'авг': '08', 'сентября': '09', 'сентябрь': '09', 'сен': '09', 'октября': '10', 'октябрь': '10', 'окт': '10', 'ноября': '11', 'ноябрь': '11', 'ноя': '11', 'декабря': '12', 'декабрь': '12', 'дек': '12',
            'қаңтар': '01', 'кантар': '01', 'қаң': '01', 'ақпан': '02', 'акпан': '02', 'ақп': '02', 'наурыз': '03', 'нау': '03', 'сәуір': '04', 'сэуір': '04', 'сәу': '04', 'мамыр': '05', 'мам': '05', 'маусым': '06', 'мау': '06', 'шілде': '07', 'шилде': '07', 'шіл': '07', 'тамыз': '08', 'там': '08', 'қыркүйек': '09', 'кыркуйек': '09', 'қыр': '09', 'қазан': '10', 'казан': '10', 'қаз': '10', 'қараша': '11', 'караша': '11', 'қар': '11', 'желтоқсан': '12', 'желтоксан': '12', 'жел': '12',
            'january': '01', 'jan': '01', 'february': '02', 'feb': '02', 'march': '03', 'mar': '03', 'april': '04', 'apr': '04', 'may': '05', 'june': '06', 'jun': '06', 'july': '07', 'jul': '07', 'august': '08', 'aug': '08', 'september': '09', 'sep': '09', 'october': '10', 'oct': '10', 'november': '11', 'nov': '11', 'december': '12', 'dec': '12'
        };
        const monthKeysGlobal = Object.keys(monthMapGlobal).sort((a, b) => b.length - a.length);
        const monthsRegexGlobal = new RegExp(`(\\b\\d{1,2}[\\.\\-\\s\\/\\,]+)(${monthKeysGlobal.join('|')})(?![a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])`, 'gi');
        normalizedText = normalizedText.replace(monthsRegexGlobal, (match, p1, p2) => `${p1}${monthMapGlobal[p2.toLowerCase()]}`);

        // 4. Нормализация разделителей дат: заменяем "15..05..1990" или "15 май 1990" на "15.05.1990"
        normalizedText = normalizedText.replace(/(\b(?:0?[1-9]|[12]\d|3[01]))[\.\-\/\s\,]+(0?[1-9]|1[0-2])[\.\-\/\s\,]+(\d{4}|\d{2})\b/g, '$1.$2.$3');

        // 5. Склеиваем перенесенные на новую строку даты/возраст/категории с предыдущей строкой (именем)
        const mergeRegex = /([a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])\s*[\r\n]+\s*(?=\b(?:0?[1-9]|[12]\d|3[01])[\.\-\/\s\,](?:0?[1-9]|1[0-2])[\.\-\/\s\,](?:\d{4}|\d{2})\b|\b(?:0?[1-9]|[12]\d|3[01])\.(?:0?[1-9]|1[0-2])\d{4}\b|\b(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])(?:\d{4}|\d{2})\b|\b\d{1,2}\s*(?:лет|года?|жас|yo)\b|\b(?:chld|adl|inf|snr|inv|взр|реб|дет|пенс|инв)\b)/gi;
        normalizedText = normalizedText.replace(mergeRegex, '$1 ');

        // 1. Предобработка: разбиваем на строки по датам рождения перед именами
        const dobSplitRegex = /(?:\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s\,])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b)([\.\s\-\/\,]+)(?=[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/g;
        normalizedText = normalizedText.replace(dobSplitRegex, '$&\n');

        // 2. Убираем нумерацию строк (например, "1. ", "2) ", "3 ") в начале каждой строки
        normalizedText = normalizedText.replace(/(?:^|\n)\s*\d+[\.\)\s\-]+\s*(?=[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\d])/g, '\n');

        const lines = normalizedText.split('\n');
        const unrecognizedLines = [];

        lines.forEach((line, index) => {
            const originalLine = line;
            line = line.trim();
            if (!line) return;

            let tAge = undefined;
            let tYear = undefined;

            // Проверяем, не заголовок ли это (дата визита)
            const headerDateMatch = line.match(/(?:на\s+|дата\s*посещения\s*|баратын\s*күніміз\s*)?[^\d]*(\d{1,2})[\.\-\/](\d{1,2})(?:[\.\-\/](\d{4}|\d{2}))?/i);

            const headerKeywords = /(?:^|\s)(на|дата|тетис|tour|тур|бронь|заявка|групп[ауы]?|баратын|күні|куни|күніміз|күніне)(?:\s|$|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһ])/i;
            const hasHeaderKeyword = headerKeywords.test(line);

            // Если строка - только дата с возможными символами (например, "*22.07.26*")
            const isJustDate = /^[^a-zA-Zа-яА-ЯёЁәіңғүұқөһ]*(\d{1,2})[\.\-\/](\d{1,2})(?:[\.\-\/](\d{4}|\d{2}))?[^a-zA-Zа-яА-ЯёЁәіңғүұқөһ]*$/.test(line);

            const isHeader = headerDateMatch && (hasHeaderKeyword || (index === 0 && isJustDate));

            // Если это явно заголовок (или первая/вторая строка с подозрением на заголовок)
            if (isHeader && (index === 0 || index === 1 || hasHeaderKeyword)) {
                const day = headerDateMatch[1].padStart(2, '0');
                const month = headerDateMatch[2].padStart(2, '0');
                let currentYear = new Date().getFullYear();

                if (headerDateMatch[3]) {
                    let y = headerDateMatch[3];
                    if (y.length === 2) {
                        const yInt = parseInt(y);
                        // Для даты визита год > 50 означает 1900+, иначе 2000+
                        currentYear = yInt > 50 ? 1900 + yInt : 2000 + yInt;
                    } else {
                        currentYear = parseInt(y);
                    }
                }

                if (visitDateInput) {
                    visitDateInput.value = `${currentYear}-${month}-${day}`;
                    // Триггерим событие change чтобы пересчитались тарифы для новой даты
                    visitDateInput.dispatchEvent(new Event('change'));
                }
                return;
            }

            // Детекция категории из исходного текста
            let parsedCategory = null;
            let parsedDisabilityGroup = null; // для казахских групп мүгедектік
            const lowerLineForCat = line.toLowerCase();
            if (/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(?:adl|adults?|взросл[ыеяйах]*|взр|үлкен)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/i.test(lowerLineForCat)) {
                parsedCategory = 'ADL';
            } else if (/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(?:chld|child(?:ren)?|дети|дет[ямнска]*|бала(?:лар)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/i.test(lowerLineForCat)) {
                parsedCategory = 'CHLD';
            } else if (/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(?:inf(?:ants?)?|младен[ецаы]*|мл[ад]*|ребен[окац]*|реб|сәби|бөбек)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/i.test(lowerLineForCat)) {
                parsedCategory = 'INF';
            } else if (/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(?:snr|pensioners?|пенсионер[ыов]*|пенс|зейнеткер(?:лер)?|зийнеткер(?:лер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/i.test(lowerLineForCat)) {
                parsedCategory = 'SNR';
            } else if (/(?:inv|инвалид[ыов]*|инв|мүгедек(?:тік|тілік|тер)?|мугедек(?:тик|тер)?|\bинвалидн[а-я]+)|(?:\d+[-‐–]?(?:ші|ши|нші|нчи|нши|rd|th|st|nd)?\s+(?:топ|тобы|группа(?:сы)?|group)\s*(?:мүгедектік|инвалидн[а-я]+|мүгедек)?)/i.test(lowerLineForCat)) {
                parsedCategory = 'INV';
                // Определяем номер группы инвалидности (1-ші топ, 2-ші топ, 3-ші топ и т.д.)
                // Значения disability в системе: '1' = 100%, '2' = 15%, '3' = 10%
                const grpMatch = lowerLineForCat.match(/(\d+)[-‐–]?(?:ші|ши|нші|нчи|нши|rd|th|st|nd)?\s+(?:топ|тобы|группа(?:сы)?|group)/);
                if (grpMatch) {
                    const grpNum = parseInt(grpMatch[1], 10);
                    if (grpNum >= 1 && grpNum <= 3) {
                        parsedDisabilityGroup = String(grpNum); // '1', '2', или '3'
                    }
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
                        const simpleAgeRegex = /(?<!\d)(\d{1,2})(?=$|\s|,)/;
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
            // Убираем лишнюю точку прямо после даты вида "25.01.2019."
            namePart = namePart.replace(/(\d{4})\.(?=\s|$|[^\d])/g, '$1');
            if (matchedStr) {
                namePart = namePart.replace(matchedStr, '');
            }

            // Убираем текст о группе инвалидности (казахский/русский) из имени
            namePart = namePart.replace(/\d+[-‐–]?(?:ші|ши|нші|нчи|нши|rd|th|st|nd)?\s+(?:топ|тобы|группа(?:сы)?|group)\s*(?:мүгедектік|мүгедектілік|мүгедек|инвалидн[а-яёА-ЯЁ]*)?/ig, '');
            namePart = namePart.replace(/мүгедектік(?:тер)?\s+(?:бар|жоқ)?/ig, '');
            namePart = namePart.replace(/мүгедек(?:тік|тілік|тер)?\s*/ig, '');
            namePart = namePart.replace(/\bбар\b/ig, '');

            // Убираем указание возраста типа "(29 жас)", "29 жас", "(7 лет)", "7 лет"
            namePart = namePart.replace(/\(?\b\d+\s*(?:жас|лет|год[а-я]*|yo|y\.o\.|years?|old)(?![a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ0-9])\)?/ig, '');
            namePart = namePart.replace(/\(\s*\d+\s*\)/g, ''); // числа в круглых скобках

            // Убираем обращения (MR, MRS, MS, CHD, INF, ADL, SNR, INV, PAX и т.д.)
            namePart = namePart.replace(/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:mr|mrs|ms|chd|inf|adl|snr|inv|pax|adults?|pensioners?|children|infants?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/ig, ' ');

            // Убираем категории на трех языках
            namePart = namePart.replace(/(?:^|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])(?:взр(?:осл[а-я]*)?|реб(?:ен[окац]+)?|дети|дет(?:и|ям|ей|ях)?|млад(?:ен[а-я]*)?|пенс(?:ионер[а-я]*)?|инв(?:алид[а-я]*)?|зейнеткер(?:лер)?|зийнеткер(?:лер)?|мүгедек(?:тік|тілік|тер)?|бала(?:лар)?|үлкен(?:дер)?)(?=$|\s|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\'])/ig, ' ');

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
                    // Если определена группа инвалидности — запишем её
                    if (parsedCategory === 'INV' && parsedDisabilityGroup) {
                        touristObj.disability = parsedDisabilityGroup;
                    }
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

    window.clearAllTourists = function () {
        if (confirm('Вы уверены, что хотите удалить всех гостей и начать заново?')) {
            tourists = [];

            // Сбрасываем текстовое поле
            if (bulkText) bulkText.value = '';
            lastAttemptedText = '';

            // Сбрасываем быстрый режим
            quickCounts = { adl: 0, chld: 0, pens: 0, inf: 0 };
            quickStatuses = { adl: [], chld: [], pens: [], inf: [] };
            updateQuickInputsDOM();

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

    function render() {
        const visitDate = visitDateInput ? visitDateInput.value : '';
        const clientType = clientTypeInput ? clientTypeInput.value : 'tourist';
        const tariffType = tariffTypeInput ? tariffTypeInput.value : 'day';

        let earlyBookingEnabled = false;
        let currentPromo = null;

        // Управление видимостью кнопки Раннего Бронирования
        if (visitDate && earlyBookingContainer) {
            currentPromo = getApplicablePromotion(visitDate, tariffType);

            if (currentPromo) {
                earlyBookingEnabled = true;
                earlyBookingContainer.classList.remove('hidden');
                const titleEl = document.getElementById('earlyBookingTitle');
                const subtitleEl = document.getElementById('earlyBookingSubtitle');
                if (titleEl) titleEl.textContent = currentPromo.title || 'Акция';
                if (subtitleEl) subtitleEl.textContent = `Скидка -${currentPromo.discount_percent}%`;
            } else {
                earlyBookingContainer.classList.add('hidden');
            }
        }

        // Управление бейджом "Раннее бронирование" в итоге
        if (earlyBookingBadge) {
            if (earlyBookingEnabled && currentPromo) {
                earlyBookingBadge.classList.remove('hidden');
                const badgeText = document.getElementById('earlyBookingBadgeText');
                if (badgeText) badgeText.textContent = `-${currentPromo.discount_percent}%`;
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

            const basePrice = getBasePrice(visitDate, clientType, tariffType, category, age);

            if (basePrice === -1) isTariffFound = false;

            const today = new Date();
            const vDate = visitDate ? new Date(visitDate) : null;
            // Акция применяется автоматически согласно датам
            const discountInfo = calculateDiscount(t.dob, visitDate, category === 'INV' ? t.disability : 'none', age, t.gender, category);
            let discountPercent = discountInfo.percent || 0;

            if (category === 'INV' && t.disability !== '2' && t.disability !== '3') {
                discountPercent = 100;
            }

            // Акция раннего бронирования не действует на инвалидов, именинников и пенсионеров
            const hasOtherDiscounts = discountInfo.isBirthday || discountInfo.isPensioner || (t.disability && t.disability !== '0' && t.disability !== 'none');
            if (currentPromo && !hasOtherDiscounts && discountPercent < 100 && age >= 4) {
                discountPercent = Math.max(discountPercent, currentPromo.discount_percent);
            }

            let actualBasePrice = basePrice;
            // Для туристов скидка РБ может считаться от отдельной "кассовой" цены,
            // если она задана в самой акции (ref_price_adl / ref_price_chld)
            if (currentPromo && !hasOtherDiscounts && age >= 4 && clientType === 'tourist') {
                if (category === 'ADL' && currentPromo.ref_price_adl) actualBasePrice = currentPromo.ref_price_adl;
                if (category === 'CHLD' && currentPromo.ref_price_chld) actualBasePrice = currentPromo.ref_price_chld;
            }

            let finalPrice = 0;
            if (actualBasePrice > 0) {
                finalPrice = actualBasePrice * (1 - discountPercent / 100);
            }

            if (t.isManualPrice) {
                finalPrice = t.manualPrice !== undefined ? t.manualPrice : 0;
                discountPercent = 0; // Отключаем бейджик процента, если цена ручная
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

            let catBadgeClass = 'bg-slate-500/20 text-slate-400';
            if (category === 'ADL') catBadgeClass = 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
            if (category === 'SNR') catBadgeClass = 'bg-purple-500/20 text-purple-300 border border-purple-400/30';
            if (category === 'CHLD') catBadgeClass = 'bg-teal-500/20 text-teal-300 border border-teal-400/30';
            if (category === 'INF') catBadgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30';
            if (category === 'INV') catBadgeClass = 'bg-rose-500/20 text-rose-300 border border-rose-400/30';

            let catSelectClass = 'border-transparent text-slate-300 bg-white/5';
            if (category === 'ADL') catSelectClass = 'bg-blue-500/20 text-blue-400 border-blue-400/20';
            if (category === 'SNR') catSelectClass = 'bg-purple-500/20 text-purple-400 border-purple-400/20';
            if (category === 'CHLD') catSelectClass = 'bg-teal-500/20 text-teal-400 border-teal-400/20';
            if (category === 'INF') catSelectClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-400/20';
            if (category === 'INV') catSelectClass = 'bg-rose-500/20 text-rose-400 border-rose-400/20';

            // Создание DOM элемента строки
            const row = document.createElement('div');
            row.className = 'tourist-row animate-row-in';
            row.innerHTML = `
                <!-- ===== MOBILE CARD (скрыт на md+) ===== -->
                <div class="md:hidden bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-white/20">

                    <!-- Card Header: Name + DOB + Delete -->
                    <div class="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-white/5">
                        <span class="text-[10px] font-bold text-slate-500 shrink-0">#${index + 1}</span>
                        <input type="text" placeholder="ФИО туриста" value="${t.fullName}" 
                            onblur="updateTourist('${t.id}', 'fullName', this.value)"
                            class="flex-1 min-w-0 bg-transparent text-white border-b ${!t.fullName ? 'border-rose-500' : 'border-transparent'} hover:border-white/30 focus:border-cyan-400 focus:outline-none py-0.5 text-xs font-semibold transition-colors placeholder:text-slate-600">
                        ${discountInfo.isBirthday ? '<span class="text-amber-400 text-xs shrink-0" title="Именинник"><i class="fa-solid fa-cake-candles"></i></span>' : ''}
                        <div class="shrink-0 w-[90px]">
                            <input type="text" value="${displayDob}" 
                                placeholder="дд.мм.гггг"
                                onblur="updateTouristDobDirect('${t.id}', this.value)"
                                class="w-full bg-transparent text-slate-300 border-b ${(!t.dob && t.age === undefined && t.year === undefined) ? 'border-rose-500' : 'border-transparent'} hover:border-white/30 focus:border-cyan-400 focus:outline-none py-0.5 text-xs text-right transition-colors placeholder:text-slate-600">
                        </div>
                        <button onclick="removeTourist('${t.id}', this)" class="btn-danger shrink-0 ml-1 p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition-colors" title="Удалить">
                            <i class="fa-solid fa-trash-can text-[11px] pointer-events-none"></i>
                        </button>
                    </div>

                    <!-- Card Body: Age + Category + Price -->
                    <div class="flex items-center px-3 py-2.5 gap-3">
                        <!-- Age block -->
                        <div class="flex flex-col items-center shrink-0 min-w-[36px]">
                            <span class="text-2xl font-black leading-none ${age === null ? 'text-slate-600' : 'text-cyan-400'}">${age !== null ? age : '—'}</span>
                            <span class="text-[8px] text-slate-500 uppercase font-semibold mt-0.5">лет</span>
                        </div>

                        <!-- Divider -->
                        <div class="w-px h-8 bg-white/10 shrink-0"></div>

                        <!-- Category select -->
                        <div class="flex flex-col gap-1 shrink-0">
                            <span class="text-[8px] text-slate-500 uppercase font-semibold">Тип</span>
                            <select onchange="updateTouristCategory('${t.id}', this.value)"
                                class="text-[10px] font-bold px-2 py-1 rounded-lg border ${catSelectClass} focus:outline-none cursor-pointer">
                                <option value="ADL" class="bg-slate-800" ${category === 'ADL' ? 'selected' : ''}>ADL</option>
                                <option value="CHLD" class="bg-slate-800" ${category === 'CHLD' ? 'selected' : ''}>CHLD</option>
                                <option value="INF" class="bg-slate-800" ${category === 'INF' ? 'selected' : ''}>INF</option>
                                <option value="SNR" class="bg-slate-800" ${category === 'SNR' ? 'selected' : ''}>SNR</option>
                                <option value="INV" class="bg-slate-800" ${category === 'INV' ? 'selected' : ''}>INV</option>
                            </select>
                        </div>

                        <!-- Spacer -->
                        <div class="flex-1"></div>

                        <!-- Price block -->
                        <div class="flex flex-col items-end shrink-0">
                            ${t.isManualPrice ? '<span class="text-[9px] text-amber-400 font-bold mb-0.5">Ручная цена</span>' : (discountPercent > 0 ? `<span class="text-[9px] text-emerald-400 font-bold mb-0.5">-${discountPercent}%</span>` : '')}
                            <div class="flex items-center gap-1.5">
                                <span class="text-lg font-black leading-none ${finalPrice > 0 ? 'text-white' : 'text-slate-500'}">${basePrice === -1 ? '—' : Math.round(finalPrice).toLocaleString('ru-RU')}<span class="text-sm text-slate-400 font-semibold ml-0.5">₸</span></span>
                                <button onclick="openManualPriceModal('${t.id}', ${finalPrice})" class="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer" title="Индивидуальная цена">
                                    <i class="fa-solid fa-pencil text-[10px]"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Disability row (only for INV) -->
                    ${category === 'INV' ? `
                    <div class="flex items-center gap-2 px-3 pb-2.5">
                        <span class="text-[9px] text-slate-500">Льгота:</span>
                        <select onchange="updateTourist('${t.id}', 'disability', this.value)"
                            class="text-[9px] font-bold px-2 py-0.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 focus:outline-none cursor-pointer">
                            <option value="1" class="bg-slate-800" ${t.disability === '1' || t.disability === 'none' ? 'selected' : ''}>1 кат. (100%)</option>
                            <option value="2" class="bg-slate-800" ${t.disability === '2' ? 'selected' : ''}>2 кат. (15%)</option>
                            <option value="3" class="bg-slate-800" ${t.disability === '3' ? 'selected' : ''}>3 кат. (10%)</option>
                        </select>
                    </div>
                    ` : ''}
                </div>

                <!-- ===== DESKTOP ROW (скрыт на мобиле) ===== -->
                <div class="hidden md:grid md:grid-cols-12 gap-1 items-center relative hover:bg-white/5 border-b border-white/5 p-1 transition-all">
                    <!-- Delete -->
                    <div class="col-span-1 flex justify-end order-last">
                        <button onclick="removeTourist('${t.id}', this)" class="btn-danger p-0.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition-colors" title="Удалить">
                            <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
                        </button>
                    </div>
                    <!-- Full Name -->
                    <div class="col-span-3 relative">
                        <input type="text" placeholder="ФИО туриста" value="${t.fullName}" 
                            onblur="updateTourist('${t.id}', 'fullName', this.value)"
                            class="w-full text-left bg-transparent text-white border ${!t.fullName ? 'border-rose-500 bg-rose-500/20' : 'border-transparent'} hover:border-white/20 focus:border-cyan-400 focus:bg-black/20 focus:outline-none rounded-lg px-2 py-1 text-xs font-medium transition-colors ${discountInfo.isBirthday ? 'pr-7' : ''}">
                        ${discountInfo.isBirthday ? '<div class="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 text-[10px]" title="Именинник"><i class="fa-solid fa-cake-candles"></i></div>' : ''}
                    </div>
                    <!-- DOB -->
                    <div class="col-span-2">
                        <input type="text" value="${displayDob}" 
                            placeholder="дд.мм.гггг или гггг"
                            onblur="updateTouristDobDirect('${t.id}', this.value)"
                            class="w-full text-left bg-transparent text-white border ${(!t.dob && t.age === undefined && t.year === undefined) ? 'border-rose-500 bg-rose-500/20' : 'border-transparent'} hover:border-white/20 focus:border-cyan-400 focus:bg-black/20 focus:outline-none rounded-lg px-0.5 py-1 text-xs font-medium transition-colors">
                    </div>
                    <!-- Age -->
                    <div class="col-span-1 text-center">
                        <span class="text-xs font-bold ${age === null ? 'text-slate-500' : 'text-cyan-400'}">${age !== null ? age : '-'}</span>
                    </div>
                    <!-- Category -->
                    <div class="col-span-1 text-center">
                        <select onchange="updateTouristCategory('${t.id}', this.value)"
                            class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${catSelectClass} focus:outline-none transition-all duration-300 cursor-pointer text-center w-full">
                            <option value="ADL" class="bg-slate-800" ${category === 'ADL' ? 'selected' : ''}>ADL</option>
                            <option value="CHLD" class="bg-slate-800" ${category === 'CHLD' ? 'selected' : ''}>CHLD</option>
                            <option value="INF" class="bg-slate-800" ${category === 'INF' ? 'selected' : ''}>INF</option>
                            <option value="SNR" class="bg-slate-800" ${category === 'SNR' ? 'selected' : ''}>SNR</option>
                            <option value="INV" class="bg-slate-800" ${category === 'INV' ? 'selected' : ''}>INV</option>
                        </select>
                    </div>
                    <!-- Disability -->
                    <div class="col-span-2 text-center">
                        ${category === 'INV' ? `
                        <select onchange="updateTourist('${t.id}', 'disability', this.value)"
                            class="text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/5 bg-white/5 text-slate-300 focus:outline-none transition-all duration-300 cursor-pointer text-center w-full">
                            <option value="1" class="bg-slate-800" ${t.disability === '1' || t.disability === 'none' ? 'selected' : ''}>Инв 1 (100%)</option>
                            <option value="2" class="bg-slate-800" ${t.disability === '2' ? 'selected' : ''}>Инв 2 (15%)</option>
                            <option value="3" class="bg-slate-800" ${t.disability === '3' ? 'selected' : ''}>Инв 3 (10%)</option>
                        </select>
                        ` : ''}
                    </div>
                    <!-- Price -->
                    <div class="col-span-2 text-right flex flex-col items-end justify-center pr-2">
                        ${t.isManualPrice ? `<span class="badge-discount bg-amber-500/20 text-amber-400 border border-amber-400/20 text-[8px] px-1.5 py-0.5 rounded-full mb-0.5 leading-none font-bold whitespace-nowrap">Ручная цена</span>` :
                    (discountPercent > 0 ? `<span class="badge-discount bg-emerald-500/20 text-emerald-400 border border-emerald-400/20 text-[8px] px-1.5 py-0.5 rounded-full mb-0.5 leading-none font-bold">-${discountPercent}%</span>` : '')}
                        <div class="flex items-center gap-1">
                            <span class="text-xs font-bold ${finalPrice > 0 ? 'text-white' : 'text-slate-500'}">
                                ${basePrice === -1 ? 'Нет тарифа' : Math.round(finalPrice).toLocaleString('ru-RU')} ₸
                            </span>
                            <button onclick="openManualPriceModal('${t.id}', ${finalPrice})" class="text-slate-500 hover:text-amber-400 transition-colors py-1 pl-1 cursor-pointer" title="Индивидуальная цена">
                                <i class="fa-solid fa-pencil text-[10px]"></i>
                            </button>
                        </div>
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

        animateValue(totalPriceEl, finalTotalSum, { formatMoney: true, pulse: true });
        const totalPriceCard = totalPriceEl.closest('section');
        if (totalPriceCard) {
            totalPriceCard.classList.remove('price-flash');
            void totalPriceCard.offsetWidth;
            totalPriceCard.classList.add('price-flash');
        }

        if (!isTariffFound) {
            dateWarning.classList.remove('hidden');
        } else {
            dateWarning.classList.add('hidden');
        }

        // Обновление статистики
        animateValue(stats.adl, counts.adl);
        animateValue(stats.chld, counts.chld);
        animateValue(stats.inf, counts.inf);
        animateValue(stats.pens, counts.pens);
        if (stats.inv) animateValue(stats.inv, counts.inv || 0);
        animateValue(stats.bday, counts.bday);

        // Обновление общего количества гостей в бейдже
        const totalGuestsEl = document.getElementById('totalGuestsBadge');
        if (totalGuestsEl) {
            const totalGuests = counts.adl + counts.chld + counts.inf + counts.pens;
            totalGuestsEl.textContent = `${totalGuests} гостей`;
        }


        let exportText = `${visitDate ? formatDate(visitDate) : 'Не указана'}\n`;
        exportText += `Тариф: ${tariffType === 'evening' ? 'Вечерний' : 'Дневной'}\n\n`;

        if (currentCalcMode === 'quick') {
            exportText += `Состав гостей:\n`;
            let hasQuickGuests = false;

            function addQuickCategoryToExport(catKey, label) {
                if (quickCounts[catKey] > 0) {
                    hasQuickGuests = true;
                    const statuses = quickStatuses[catKey] || [];
                    const statusLabels = [];
                    let bdCount = 0;
                    let inv1Count = 0;
                    let inv2Count = 0;
                    let inv3Count = 0;

                    statuses.forEach(s => {
                        if (s === 'bd') bdCount++;
                        else if (s === '1') inv1Count++;
                        else if (s === '2') inv2Count++;
                        else if (s === '3') inv3Count++;
                    });

                    if (bdCount > 0) statusLabels.push(`${bdCount} Именинник`);
                    if (inv1Count > 0) statusLabels.push(`${inv1Count} Инвалид 1 кат.`);
                    if (inv2Count > 0) statusLabels.push(`${inv2Count} Инвалид 2 кат.`);
                    if (inv3Count > 0) statusLabels.push(`${inv3Count} Инвалид 3 кат.`);

                    if (statusLabels.length > 0) {
                        exportText += `${label}: ${quickCounts[catKey]} (${statusLabels.join(', ')})\n`;
                    } else {
                        exportText += `${label}: ${quickCounts[catKey]}\n`;
                    }
                }
            }

            addQuickCategoryToExport('adl', 'Взрослые ADL');
            addQuickCategoryToExport('chld', 'Дети CHLD');
            addQuickCategoryToExport('pens', 'Пенсионеры SNR');
            addQuickCategoryToExport('inf', 'Младенцы INF');

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
        window.openManualPriceModal = openManualPriceModal;
    }

    // --- Ручная корректировка цены ---
    let manualPriceTargetId = null;

    function openManualPriceModal(touristId, currentPrice) {
        manualPriceTargetId = touristId;
        const modal = document.getElementById('manualPriceModal');
        const input = document.getElementById('manualPriceInput');

        const tourist = tourists.find(t => t.id === touristId);
        if (tourist && tourist.isManualPrice) {
            input.value = tourist.manualPrice;
        } else {
            input.value = Math.round(currentPrice);
        }

        modal.classList.remove('hidden');
        input.focus();
    }

    window.closeManualPriceModal = function () {
        manualPriceTargetId = null;
        document.getElementById('manualPriceModal').classList.add('hidden');
    }

    window.saveManualPrice = function () {
        if (!manualPriceTargetId) return;
        const input = document.getElementById('manualPriceInput');
        const price = parseFloat(input.value);

        if (!isNaN(price) && price >= 0) {
            const tourist = tourists.find(t => t.id === manualPriceTargetId);
            if (tourist) {
                tourist.isManualPrice = true;
                tourist.manualPrice = price;
                render();
            }
        }
        window.closeManualPriceModal();
    }

    window.resetManualPrice = function () {
        if (!manualPriceTargetId) return;
        const tourist = tourists.find(t => t.id === manualPriceTargetId);
        if (tourist) {
            tourist.isManualPrice = false;
            tourist.manualPrice = 0;
            render();
        }
        window.closeManualPriceModal();
    }
    // --------------------------------

    function syncDetailedToQuick() {
        let counts = { adl: 0, chld: 0, pens: 0, inf: 0 };
        let statuses = { adl: [], chld: [], pens: [], inf: [] };
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

            let isBirthday = false;
            if (t.dob) {
                const parts = t.dob.split('-');
                if (parts.length === 3) {
                    const dobM = parseInt(parts[1], 10);
                    const dobD = parseInt(parts[2], 10);
                    const vDateObj = visitDate ? new Date(visitDate) : new Date();
                    isBirthday = (dobM === vDateObj.getMonth() + 1 && dobD === vDateObj.getDate());
                }
            }

            let status = 'none';
            if (isBirthday) status = 'bd';
            else if (t.disability && t.disability !== 'none') status = t.disability;

            if (category === 'ADL') { counts.adl++; statuses.adl.push(status); }
            else if (category === 'CHLD') { counts.chld++; statuses.chld.push(status); }
            else if (category === 'SNR') { counts.pens++; statuses.pens.push(status); }
            else if (category === 'INF') { counts.inf++; statuses.inf.push(status); }
        });
        quickCounts = counts;
        quickStatuses = statuses;
        updateQuickInputsDOM();
    }

    function syncQuickToDetailed() {
        tourists = [];
        const today = new Date();
        const visitDateStr = visitDateInput ? visitDateInput.value : '';
        const visitYear = visitDateStr ? new Date(visitDateStr).getFullYear() : today.getFullYear();
        const visitDateObj = visitDateStr ? new Date(visitDateStr) : today;
        const vMonth = String(visitDateObj.getMonth() + 1).padStart(2, '0');
        const vDay = String(visitDateObj.getDate()).padStart(2, '0');

        function addQuickTourists(category, count, statuses, baseAge) {
            for (let i = 0; i < count; i++) {
                const status = statuses[i] || 'none';
                const isBd = status === 'bd';
                let disability = 'none';
                if (status === '1' || status === '2' || status === '3') {
                    disability = status;
                }

                tourists.push({
                    id: createId(),
                    fullName: `Гость ${tourists.length + 1}`,
                    dob: isBd ? `${visitYear - baseAge}-${vMonth}-${vDay}` : `${visitYear - baseAge}-06-15`,
                    gender: 'male',
                    genderManuallySet: false,
                    disability: disability,
                    category: disability !== 'none' ? 'INV' : undefined,
                    categoryManuallySet: disability !== 'none'
                });
            }
        }

        addQuickTourists('adl', quickCounts.adl, quickStatuses.adl, 25);
        addQuickTourists('chld', quickCounts.chld, quickStatuses.chld, 8);
        addQuickTourists('pens', quickCounts.pens, quickStatuses.pens, 65);
        addQuickTourists('inf', quickCounts.inf, quickStatuses.inf, 1);
    }

    function changeQuickStatus(category, index, val) {
        quickStatuses[category][index] = val;
        syncQuickToDetailed();
        render();
    }

    function renderQuickStatuses() {
        const categories = ['adl', 'chld', 'pens', 'inf'];
        categories.forEach(cat => {
            const container = document.getElementById(`quick_statuses_${cat}`);
            if (!container) return;

            container.innerHTML = '';
            for (let i = 0; i < quickCounts[cat]; i++) {
                const status = quickStatuses[cat][i] || 'none';

                let options = `<option value="none" ${status === 'none' ? 'selected' : ''}>Без льгот</option>
                               <option value="bd" ${status === 'bd' ? 'selected' : ''}>Именинник</option>
                               <option value="1" ${status === '1' ? 'selected' : ''}>Инвалид 1 кат.</option>
                               <option value="2" ${status === '2' ? 'selected' : ''}>Инвалид 2 кат.</option>
                               <option value="3" ${status === '3' ? 'selected' : ''}>Инвалид 3 кат.</option>`;

                container.innerHTML += `
                    <div class="flex items-center justify-between text-sm py-2 px-3 glass-panel-light border-transparent rounded-xl border border-slate-200/60 shadow-sm mb-2">
                        <span class="text-slate-600 font-semibold">Гость ${i + 1}</span>
                        <div class="relative">
                            <select onchange="changeQuickStatus('${cat}', ${i}, this.value)" class="appearance-none bg-slate-50 text-brand-blue border border-slate-200 rounded-lg pl-3 pr-8 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-semibold cursor-pointer text-sm">
                                ${options}
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-blue">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
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

        renderQuickStatuses();
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
            // Active: glow-btn-cyan (same as "Добавить гостя")
            tabDetailed.classList.remove('text-slate-400', 'hover:text-slate-200', 'border-transparent', 'scale-95', 'opacity-60');
            tabDetailed.classList.add('glow-btn-cyan', 'scale-100');
            // Inactive: dimmed
            tabQuick.classList.remove('glow-btn-cyan', 'scale-100', 'opacity-100');
            tabQuick.classList.add('text-slate-400', 'hover:text-slate-200', 'border-transparent', 'scale-95', 'opacity-60');

            detailedModeContainer.classList.remove('hidden');
            quickModeContainer.classList.add('hidden');
            detailedActionButtons.classList.remove('hidden');
            resetQuickBtn.classList.add('hidden');

            if (tourists.length === 0 && (quickCounts.adl > 0 || quickCounts.chld > 0 || quickCounts.pens > 0 || quickCounts.inf > 0)) {
                syncQuickToDetailed();
            }
        } else {
            // Active: glow-btn-cyan (same as "Добавить гостя")
            tabQuick.classList.remove('text-slate-400', 'border-transparent', 'scale-95', 'opacity-60');
            tabQuick.classList.add('glow-btn-cyan', 'scale-100', 'opacity-100');
            // Inactive: dimmed
            tabDetailed.classList.remove('glow-btn-cyan', 'scale-100', 'opacity-100');
            tabDetailed.classList.add('text-slate-400', 'hover:text-slate-200', 'border-transparent', 'scale-95', 'opacity-60');

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
        // Валидация: Дети и малыши не могут быть без взрослых (adl) или пенсионеров (pens)
        if ((category === 'chld' || category === 'inf') && delta > 0 && quickCounts.adl === 0 && quickCounts.pens === 0) {
            if (window.showToast) {
                window.showToast('Дети могут посещать парк только в сопровождении взрослых', 'fa-triangle-exclamation', 'bg-amber-500');
            }
            return;
        }

        const oldVal = quickCounts[category];
        const newVal = Math.max(0, oldVal + delta);
        quickCounts[category] = newVal;

        if (newVal > oldVal) {
            for (let i = 0; i < (newVal - oldVal); i++) quickStatuses[category].push('none');
        } else if (newVal < oldVal) {
            quickStatuses[category].splice(newVal);
        }

        // Авто-сброс детей, если убрали взрослых
        if ((category === 'adl' || category === 'pens') && quickCounts.adl === 0 && quickCounts.pens === 0) {
            quickCounts.chld = 0;
            quickStatuses.chld = [];
            quickCounts.inf = 0;
            quickStatuses.inf = [];
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

        const oldVal = quickCounts[category];
        quickCounts[category] = newVal;

        if (newVal > oldVal) {
            for (let i = 0; i < (newVal - oldVal); i++) quickStatuses[category].push('none');
        } else if (newVal < oldVal) {
            quickStatuses[category].splice(newVal);
        }

        if ((category === 'adl' || category === 'pens') && quickCounts.adl === 0 && quickCounts.pens === 0) {
            quickCounts.chld = 0;
            quickStatuses.chld = [];
            quickCounts.inf = 0;
            quickStatuses.inf = [];
        }

        updateQuickInputsDOM();
        syncQuickToDetailed();
        render();
    }

    function resetQuickCounts() {
        quickCounts = { adl: 0, chld: 0, pens: 0, inf: 0 };
        quickStatuses = { adl: [], chld: [], pens: [], inf: [] };
        updateQuickInputsDOM();
        syncQuickToDetailed();
        render();
    }

    window.switchCalcMode = switchCalcMode;
    window.changeQuickCount = changeQuickCount;
    window.updateQuickCount = updateQuickCount;
    window.resetQuickCounts = resetQuickCounts;
    window.changeQuickStatus = changeQuickStatus;

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
        nativeShareBtn.addEventListener('click', function () {
            shareReceiptImage(this);
        });
    }

    const whatsappShareBtn = document.getElementById('whatsappShareBtn');
    if (whatsappShareBtn) {
        whatsappShareBtn.addEventListener('click', async function () {
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

    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            downloadReceiptPdf();
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

    function sendToAquapark() {
        if (!validateAccompaniment()) return;
        saveToHistory();
        const text = exportDataEl.value;
        if (!text) return;

        const lines = text.split('\n');
        
        let isGuestList = false;
        let guestLines = [];
        let dateStr = lines[0].trim();
        let tariffStr = '';
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('Тариф:')) {
                tariffStr = lines[i].trim();
            } else if (lines[i].startsWith('Список гостей:') || lines[i].startsWith('Состав гостей:')) {
                isGuestList = true;
                continue;
            }
            if (isGuestList) {
                if (lines[i].trim() === '' || lines[i].startsWith('Промокод:') || lines[i].startsWith('Комментарий:') || lines[i].startsWith('ИТОГО:')) {
                    break;
                }
                guestLines.push(lines[i]);
            }
        }

        let bodyText = `Список гостей:\n${guestLines.join('\n')}\n\nС уважением, Жумасилов Талгат\n+77027477339`;
        const subject = `${dateStr} | ${tariffStr}`;
        const email = "sales.department@tetysblu.com";

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        } else {
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
            window.open(gmailUrl, '_blank');
        }
    }

    const aquaparkEmailBtn = document.getElementById('aquaparkEmailBtn');
    if (aquaparkEmailBtn) {
        aquaparkEmailBtn.addEventListener('click', sendToAquapark);
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
            function addQuickCategoryToReceipt(catKey, title) {
                if (quickCounts[catKey] > 0) {
                    const statuses = quickStatuses[catKey] || [];
                    let bdCount = 0;
                    let inv1Count = 0;
                    let inv2Count = 0;
                    let inv3Count = 0;

                    statuses.forEach(s => {
                        if (s === 'bd') bdCount++;
                        else if (s === '1') inv1Count++;
                        else if (s === '2') inv2Count++;
                        else if (s === '3') inv3Count++;
                    });

                    let statusBadgeHtml = '';
                    if (bdCount > 0) statusBadgeHtml += `<span class="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full ml-2">${bdCount} Именинник</span>`;
                    if (inv1Count > 0) statusBadgeHtml += `<span class="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full ml-2">${inv1Count} ИНВ1</span>`;
                    if (inv2Count > 0) statusBadgeHtml += `<span class="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full ml-2">${inv2Count} ИНВ2</span>`;
                    if (inv3Count > 0) statusBadgeHtml += `<span class="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full ml-2">${inv3Count} ИНВ3</span>`;

                    listHtml += `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3">
                                    <div class="font-bold text-[#1e293b] text-[15px] flex items-center flex-wrap gap-y-1">
                                        ${title}: ${quickCounts[catKey]}
                                        ${statusBadgeHtml}
                                    </div>
                                 </div>`;
                }
            }

            addQuickCategoryToReceipt('adl', 'ВЗРОСЛЫЕ (ADL)');
            addQuickCategoryToReceipt('chld', 'ДЕТИ (CHLD)');
            addQuickCategoryToReceipt('pens', 'ПЕНСИОНЕРЫ (SNR)');
            addQuickCategoryToReceipt('inf', 'МЛАДЕНЦЫ (INF)');
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

                const basePrice = getBasePrice(visitDateStr, clientType, tariffType, category, age);
                const discountInfo = calculateDiscount(t.dob, visitDateStr, t.disability, age, t.gender, category);
                let discountPercent = discountInfo.percent || 0;

                const earlyBookingEnabled = typeof earlyBookingToggle !== 'undefined' && earlyBookingToggle ? earlyBookingToggle.checked : false;

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

                if (t.isManualPrice) {
                    finalPrice = t.manualPrice !== undefined ? t.manualPrice : 0;
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

                let priceStr = basePrice === -1 ? 'Нет тарифа' : `${Math.round(finalPrice).toLocaleString('ru-RU')} ₸`;
                if (t.isManualPrice) {
                    priceStr += `<div class="text-[9px] text-amber-500 mt-1 uppercase font-semibold">Ручная цена</div>`;
                }

                touristsEl.innerHTML += `
                    <div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3 tourist-row">
                        <div class="flex-1 pr-4">
                            <div class="font-bold text-[#1e293b] text-[15px] leading-relaxed break-words">
                                ${(t.fullName || 'Гость ' + (i + 1)).toUpperCase()} 
                                ${formattedDob ? '- ' + formattedDob : ''} 
                                <span class="text-xs text-slate-500 font-medium ml-1">(${category})</span>
                            </div>
                        </div>
                        <div class="text-right font-bold text-[#0076ba] text-[15px] shrink-0 flex flex-col items-end justify-center">
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

            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 1024;
            if (isMobile) {
                const shareModal = document.getElementById('shareModal');
                const shareModalContent = document.getElementById('shareModalContent');
                const sharePreviewImg = document.getElementById('sharePreviewImg');
                const closeShareBtn = document.getElementById('closeShareBtn');

                if (shareModal && sharePreviewImg) {
                    sharePreviewImg.src = canvas.toDataURL('image/png');
                    shareModal.classList.remove('hidden');
                    setTimeout(() => {
                        shareModal.classList.remove('opacity-0');
                        if (shareModalContent) {
                            shareModalContent.classList.remove('scale-95');
                            shareModalContent.classList.add('scale-100');
                        }
                    }, 10);

                    if (closeShareBtn) {
                        closeShareBtn.onclick = () => {
                            shareModal.classList.add('opacity-0');
                            if (shareModalContent) {
                                shareModalContent.classList.remove('scale-100');
                                shareModalContent.classList.add('scale-95');
                            }
                            setTimeout(() => shareModal.classList.add('hidden'), 300);
                        };
                    }
                    window.showToast('Зажмите чек, чтобы сохранить', 'fa-download', 'bg-[#0076ba]');
                } else {
                    const link = document.createElement('a');
                    link.download = `TetysBlu_Check_${formattedDate}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    window.showToast('Чек успешно создан!', 'fa-circle-check');
                }
            } else {
                const link = document.createElement('a');
                link.download = `TetysBlu_Check_${formattedDate}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                window.showToast('Чек успешно сохранен!', 'fa-circle-check');
            }

            downloadReceiptBtn.innerHTML = originalBtnHtml;
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

    async function downloadReceiptPdf() {
        if (!validateAccompaniment()) return;
        saveToHistory();
        const container = document.getElementById('receiptContainer');
        const content = document.getElementById('receiptContent');
        const formattedDate = visitDateInput ? visitDateInput.value : 'date';

        fillReceiptData();

        content.classList.remove('opacity-0', 'pointer-events-none');
        document.body.appendChild(content);
        content.style.position = 'fixed';
        content.style.top = '0';
        content.style.left = '0';
        content.style.zIndex = '-9999';

        const btn = document.getElementById('downloadPdfBtn');
        const originalHtml = btn ? btn.innerHTML : '';
        if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2 text-lg"></i> Создание PDF...';

        const opt = {
            margin: 0.5,
            filename: `TetysBlu_Check_${formattedDate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        try {
            await window.html2pdf().set(opt).from(content).save();
            if (btn) btn.innerHTML = originalHtml;
            window.showToast('PDF успешно сохранен!', 'fa-file-pdf', 'bg-rose-500');
        } catch (e) {
            console.error('PDF generation error', e);
            if (btn) btn.innerHTML = originalHtml;
            window.showToast('Ошибка при создании PDF', 'fa-triangle-exclamation', 'bg-red-500');
        } finally {
            content.style.position = '';
            content.style.top = '';
            content.style.left = '';
            content.style.zIndex = '';
            content.classList.add('opacity-0', 'pointer-events-none');
            container.appendChild(content);
        }
    }

    // --- TOAST NOTIFICATIONS ---
    // --- БД (DATABASE MODAL) ---
    const dbBtn = document.getElementById('dbBtn');
    const closeDbBtn = document.getElementById('closeDbBtn');
    const dbModal = document.getElementById('dbModal');
    const dbModalContent = document.getElementById('dbModalContent');
    const dbTableBody = document.getElementById('dbTableBody');
    const dbRecordCount = document.getElementById('dbRecordCount');
    const dbSearchInput = document.getElementById('dbSearchInput');
    const dbSearchInputMobile = document.getElementById('dbSearchInputMobile');
    const dbExportBtn = document.getElementById('dbExportBtn');

    let dbAllRecords = [];

    const STATUS_BADGES = {
        'Оформлено': 'bg-emerald-100 text-emerald-700',
        'Оплачено': 'bg-cyan-100 text-cyan-700',
        'Отказ': 'bg-slate-200 text-slate-500',
        'Ожидание оплаты': 'bg-amber-100 text-amber-700'
    };

    let dbSortColumn = 'date';
    let dbSortOrder = 'desc';

    window.sortDbTable = function (column) {
        if (dbSortColumn === column) {
            dbSortOrder = dbSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            dbSortColumn = column;
            dbSortOrder = column === 'date' ? 'desc' : 'asc';
        }

        // Reset all icons
        document.querySelectorAll('[id^="sortIcon-"]').forEach(icon => {
            icon.className = 'fa-solid fa-sort ml-1 opacity-50';
        });

        // Update active icon
        const activeIcon = document.getElementById(`sortIcon-${column}`);
        if (activeIcon) {
            activeIcon.className = `fa-solid fa-sort-${dbSortOrder === 'asc' ? 'up' : 'down'} ml-1 text-indigo-600`;
        }

        renderDbTable(dbSearchInput ? dbSearchInput.value : '');
    };

    window.loadDbRecordToCalculator = function (id) {
        const record = dbAllRecords.find(r => r.id === id);
        if (!record) return;

        if (clientTypeInput && record.clientType) clientTypeInput.value = record.clientType;
        if (visitDateInput && record.visitDate) visitDateInput.value = record.visitDate;
        if (tariffTypeInput && record.tariffType) tariffTypeInput.value = record.tariffType;

        // Force detailed mode when loading from DB to show all guest data correctly
        currentCalcMode = 'detailed';

        if (record.tourists && Array.isArray(record.tourists) && record.tourists.length > 0) {
            tourists = JSON.parse(JSON.stringify(record.tourists));
        } else {
            tourists = [];
            addTourist();
        }

        // Reset quick counts
        quickCounts = { adl: 0, chld: 0, pens: 0, inf: 0 };
        quickStatuses = { adl: [], chld: [], pens: [], inf: [] };

        // Re-render and switch view
        switchCalcMode(currentCalcMode);
        render();
        switchAppView('view-calculator');

        if (typeof window.showToast === 'function') {
            window.showToast('Заявка загружена в калькулятор', 'fa-file-import', 'bg-cyan-500');
        }
    };

    function renderDbTable(query = '') {
        if (!dbTableBody) return;
        const dbMobileList = document.getElementById('dbMobileList');
        const q = query.toLowerCase().trim();

        // Read filter values
        const filterVisit   = (document.getElementById('dbFilterVisitDate')?.value  || '').trim();
        const filterTariff  = (document.getElementById('dbFilterTariff')?.value     || '').trim();
        const filterClient  = (document.getElementById('dbFilterClient')?.value     || '').trim();
        const filterGMin    = parseInt(document.getElementById('dbFilterGuestsMin')?.value || '', 10);
        const filterGMax    = parseInt(document.getElementById('dbFilterGuestsMax')?.value || '', 10);
        const filterDateFrom = (document.getElementById('dbFilterDateFrom')?.value || '').trim();
        const filterDateTo   = (document.getElementById('dbFilterDateTo')?.value   || '').trim();
        // Convert date strings to timestamp boundaries
        const tsFrom = filterDateFrom ? new Date(filterDateFrom + 'T00:00:00').getTime() : null;
        const tsTo   = filterDateTo   ? new Date(filterDateTo   + 'T23:59:59').getTime() : null;

        let filtered = dbAllRecords.filter(r => {
            // Text search
            if (q) {
                const names = (r.tourists || []).map(t => t.fullName || '').join(' ').toLowerCase();
                const visit = (r.visitDate || '').toLowerCase();
                const ts = new Date(r.timestamp).toLocaleDateString('ru-RU');
                if (!names.includes(q) && !visit.includes(q) && !ts.includes(q)) return false;
            }
            // Creation date range
            const rTs = new Date(r.timestamp).getTime();
            if (tsFrom !== null && rTs < tsFrom) return false;
            if (tsTo   !== null && rTs > tsTo)   return false;
            // Visit date filter
            if (filterVisit && r.visitDate !== filterVisit) return false;
            // Tariff filter
            if (filterTariff && (r.tariffType || '') !== filterTariff) return false;
            // Client filter
            if (filterClient && (r.clientType || '') !== filterClient) return false;
            // Guests range
            const gCount = (r.tourists || []).length;
            if (!isNaN(filterGMin) && gCount < filterGMin) return false;
            if (!isNaN(filterGMax) && gCount > filterGMax) return false;
            return true;
        });

        // Apply sorting
        filtered.sort((a, b) => {
            let valA, valB;
            switch (dbSortColumn) {
                case 'date':
                    valA = new Date(a.timestamp).getTime();
                    valB = new Date(b.timestamp).getTime();
                    break;
                case 'visit':
                    valA = a.visitDate || '';
                    valB = b.visitDate || '';
                    break;
                case 'client':
                    valA = a.clientType || '';
                    valB = b.clientType || '';
                    break;
                case 'guests':
                    valA = (a.tourists || []).length;
                    valB = (b.tourists || []).length;
                    break;
                case 'sum':
                    valA = a.totalSum || 0;
                    valB = b.totalSum || 0;
                    break;
                default:
                    valA = 0; valB = 0;
            }
            if (valA < valB) return dbSortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return dbSortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        // ── DUPLICATE DETECTION ─────────────────────────────────────────────
        // Fingerprint: visitDate + totalSum + touristCount + first guest name
        const fingerprintMap = {};
        filtered.forEach(item => {
            const firstGuest = (item.tourists && item.tourists[0]) ? (item.tourists[0].fullName || '').trim().toLowerCase() : '';
            const fp = `${item.visitDate || ''}|${item.totalSum || 0}|${(item.tourists || []).length}|${firstGuest}`;
            if (!fingerprintMap[fp]) fingerprintMap[fp] = [];
            fingerprintMap[fp].push(item.id);
        });
        const duplicateIds = new Set();
        Object.values(fingerprintMap).forEach(ids => {
            if (ids.length > 1) ids.forEach(id => duplicateIds.add(id));
        });
        const dupGroupCount = Object.values(fingerprintMap).filter(ids => ids.length > 1).length;
        // ────────────────────────────────────────────────────────────────────

        if (dbRecordCount) {
            dbRecordCount.textContent = `Всего записей: ${dbAllRecords.length}${q ? ` · Найдено: ${filtered.length}` : ''}`;
        }

        if (filtered.length === 0) {
            dbTableBody.innerHTML = `<tr><td colspan="9" class="text-center py-16 text-slate-400"><i class="fa-solid fa-folder-open mr-2 opacity-50"></i>Нет записей</td></tr>`;
            if (dbMobileList) dbMobileList.innerHTML = `<div class="text-center py-16 text-slate-400"><i class="fa-solid fa-folder-open text-2xl mb-2 opacity-50 block"></i>Нет записей</div>`;
            return;
        }

        const CAT_LABELS = { ADL: 'Взр', CHLD: 'Дет', INF: 'Инф', INV: 'Инв', SNR: 'Пенс' };
        const CAT_COLORS = {
            ADL: 'bg-blue-500/20 text-blue-300',
            CHLD: 'bg-emerald-500/20 text-emerald-300',
            INF: 'bg-purple-500/20 text-purple-300',
            INV: 'bg-rose-500/20 text-rose-300',
            SNR: 'bg-amber-500/20 text-amber-300'
        };
        const DIS_LABELS = { '1': '100%', '2': '15%', '3': '10%' };

        const currentUser = localStorage.getItem('tetysUser');

        // Duplicate warning banner (injected as first fake row)
        const dupBanner = dupGroupCount > 0 ? `
            <tr id="dupWarningBanner">
                <td colspan="9" class="px-4 py-3">
                    <div class="flex items-center justify-between gap-3 bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-3">
                        <div class="flex items-center gap-3">
                            <i class="fa-solid fa-triangle-exclamation text-amber-500 text-base animate-pulse"></i>
                            <div>
                                <p class="text-[var(--ink)] font-bold text-xs">Обнаружены возможные дубликаты!</p>
                                <p class="text-[var(--ink-soft)] text-[11px] mt-0.5">Найдено ${dupGroupCount} группы дублирующихся заявок (выделены цветом). Проверьте и удалите лишние.</p>
                            </div>
                        </div>
                        <button onclick="document.getElementById('dupWarningBanner').remove()" 
                            class="text-[var(--ink-faint)] hover:text-amber-500 transition-colors shrink-0" title="Закрыть">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </td>
            </tr>` : '';
            
        let mobileHtml = dupGroupCount > 0 ? `
            <div id="dupWarningBannerMobile" class="flex items-center justify-between gap-3 bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-3 mb-2">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-triangle-exclamation text-amber-500 text-base animate-pulse"></i>
                    <div>
                        <p class="text-[var(--ink)] font-bold text-xs">Возможные дубликаты!</p>
                        <p class="text-[var(--ink-soft)] text-[11px] mt-0.5">Найдено ${dupGroupCount} гр.</p>
                    </div>
                </div>
            </div>` : '';

        const desktopRows = filtered.map((item, idx) => {
            const dt = new Date(item.timestamp);
            const dateStr = `${dt.getDate().toString().padStart(2, '0')}.${(dt.getMonth() + 1).toString().padStart(2, '0')}.${dt.getFullYear()}`;
            const timeStr = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
            const clientLabel = item.clientType === 'agent' ? 'Турагент' : 'Турист';
            const tariffLabel = item.tariffType === 'evening' ? 'Вечерний' : 'Дневной';
            const isDuplicate = duplicateIds.has(item.id);
            const rowBg = isDuplicate
                ? ''
                : (idx % 2 === 0 ? 'bg-white/5' : 'bg-transparent');
            const rowStyle = isDuplicate ? 'style="background-color: var(--canvas-a); border-left: 3px solid var(--brand);"' : '';

            // Список гостей — каждый в отдельной строке внутри ячейки
            const tourists = item.tourists || [];
            const guestsHtml = tourists.length === 0 ? '<span class="text-slate-500">—</span>' :
                tourists.map((t, ti) => {
                    const name = t.fullName || `Гость ${ti + 1}`;
                    const cat = t.category || 'ADL';
                    const catLabel = CAT_LABELS[cat] || cat;
                    const catColor = CAT_COLORS[cat] || 'bg-white/10 text-slate-300';
                    let dob = '';
                    if (t.dob) {
                        const d = t.dob.split('-');
                        dob = d.length === 3 ? `${d[2]}.${d[1]}.${d[0]}` : t.dob;
                    } else if (t.year) {
                        dob = `${t.year} г.р.`;
                    } else if (t.age !== undefined) {
                        dob = `${t.age} лет`;
                    }
                    let disStr = '';
                    if (t.disability && t.disability !== 'none' && DIS_LABELS[t.disability]) {
                        disStr = `<span class="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">Инв ${DIS_LABELS[t.disability]}</span>`;
                    }
                    const divider = ti < tourists.length - 1 ? ' border-b border-white/5 pb-1.5 mb-1.5' : '';
                    return `<div class="flex items-start gap-2 flex-wrap${divider}">
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${catColor}">${catLabel}</span>
                        <span class="font-semibold text-white text-[11px]">${name}</span>
                        ${dob ? `<span class="text-slate-400 text-[10px]">${dob}</span>` : ''}
                        ${disStr}
                    </div>`;
                }).join('');

            const dupBadge = isDuplicate
                ? `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-400/20 text-sky-300 ml-1"><i class="fa-solid fa-copy text-[8px]"></i>Дубль</span>`
                : '';
                
            const isVoucherTrue = (item.voucher_status === true || item.voucher_status === 'true' || item.voucher_status === 1);
            const voucherBadge = isVoucherTrue 
                ? `<div class="mt-1">
                    ${item.voucher_url 
                        ? `<a href="${item.voucher_url}" target="_blank" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors" title="Открыть ваучер"><i class="fa-solid fa-ticket"></i>Ваучер</a>` 
                        : `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300" title="Ваучер выписан аквапарком"><i class="fa-solid fa-ticket"></i>Ваучер</span>`
                    }
                   </div>`
                : `<div class="mt-1"><span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300" title="Ваучер не выписан"><i class="fa-solid fa-ticket"></i>Нет ваучера</span></div>`;

            // Append to mobile HTML
            mobileHtml += `
                <div class="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-3 relative" ${isDuplicate ? 'style="background-color: var(--canvas-a); border-left: 3px solid var(--brand);"' : ''}>
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-bold text-white text-xs flex items-center gap-1">${dateStr} <span class="text-[10px] text-slate-400 font-normal ml-1">${timeStr}</span> ${dupBadge}</div>
                            <div class="text-[10px] text-slate-400 mt-0.5">Визит: <span class="text-white">${item.visitDate || '—'}</span></div>
                        </div>
                        <div class="text-right font-black text-emerald-400 text-sm whitespace-nowrap">${(item.totalSum || 0).toLocaleString('ru-RU')} ₸</div>
                    </div>
                    
                    <div class="flex gap-2 text-[10px]">
                        <span class="px-2 py-0.5 rounded text-[9px] font-bold ${item.clientType === 'agent' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-purple-500/20 text-purple-300'}">${clientLabel}</span>
                        <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-500/20 text-slate-300">${tariffLabel}</span>
                        <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300"><i class="fa-solid fa-users mr-1"></i>${tourists.length}</span>
                    </div>
                    
                    <div class="text-xs text-slate-300 bg-black/20 p-2 rounded-lg border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                        ${guestsHtml}
                    </div>
                    
                    <div class="flex gap-2 mt-1">
                        <button onclick="loadDbRecordToCalculator('${item.id}')" class="flex-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 py-2 rounded-lg hover:bg-cyan-500/20 font-bold transition-colors text-xs flex items-center justify-center"><i class="fa-solid fa-file-import mr-1.5"></i>В калькулятор</button>
                        ${currentUser === 'admin' ? `<button onclick="deleteHistoryRecord('${item.id}')" class="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 rounded-lg hover:bg-rose-500/20 transition-colors flex items-center justify-center"><i class="fa-solid fa-trash"></i></button>` : ''}
                    </div>
                </div>
            `;

            return `<tr class="${rowBg} border-b border-white/10 hover:bg-white/10 transition-colors align-top" ${rowStyle}>
                <td class="px-2 py-1.5 text-slate-500 font-mono text-[10px] whitespace-nowrap">${filtered.length - idx}</td>
                <td class="px-2 py-1.5 whitespace-nowrap">
                    <div class="font-semibold text-white text-xs flex items-center gap-1">${dateStr}${dupBadge}</div>
                    <div class="text-[10px] text-slate-400">${timeStr}</div>
                </td>
                <td class="px-2 py-1.5 font-semibold text-white text-xs whitespace-nowrap">
                    ${item.visitDate || '—'}
                    ${voucherBadge}
                </td>
                <td class="px-2 py-1.5 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${item.clientType === 'agent' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-purple-500/20 text-purple-300'}">${clientLabel}</span>
                </td>
                <td class="px-2 py-1.5 text-slate-300 text-xs whitespace-nowrap">${tariffLabel}</td>
                <td class="px-2 py-1.5 text-center font-bold text-white text-xs whitespace-nowrap">${tourists.length}</td>
                <td class="px-2 py-1.5 min-w-[220px]">${guestsHtml}</td>
                <td class="px-2 py-1.5 text-right font-black text-emerald-400 text-xs whitespace-nowrap">${(item.totalSum || 0).toLocaleString('ru-RU')} ₸</td>
                <td class="px-2 py-1.5 text-center whitespace-nowrap">
                    <button onclick="loadDbRecordToCalculator('${item.id}')" class="text-cyan-400 hover:text-cyan-300 transition-colors mr-3" title="Загрузить в калькулятор"><i class="fa-solid fa-file-import text-sm"></i></button>
                    ${currentUser === 'admin' ? `<button onclick="deleteHistoryRecord('${item.id}')" class="text-slate-400 hover:text-rose-400 transition-colors" title="Удалить"><i class="fa-solid fa-trash text-xs"></i></button>` : ''}
                </td>
            </tr>`;
        });
        
        dbTableBody.innerHTML = dupBanner + desktopRows.join('');
        if (dbMobileList) dbMobileList.innerHTML = mobileHtml;
    }


    // --- SPA ROUTING (VIEWS) ---
    const navCalcBtn = document.getElementById('navCalcBtn');
    const navDashboardBtn = document.getElementById('navDashboardBtn');
    const navDatabaseBtn = document.getElementById('navDatabaseBtn');
    const navArchiveBtn = document.getElementById('navArchiveBtn');

    const mobNavCalcBtn = document.getElementById('mobNavCalcBtn');
    const mobNavDashboardBtn = document.getElementById('mobNavDashboardBtn');
    const mobNavDatabaseBtn = document.getElementById('mobNavDatabaseBtn');
    const mobNavArchiveBtn = document.getElementById('mobNavArchiveBtn');

    const viewCalc = document.getElementById('view-calculator');
    const viewDashboard = document.getElementById('view-dashboard');
    const viewDatabase = document.getElementById('view-database');
    const viewArchive = document.getElementById('view-archive');

    async function switchAppView(viewId) {
        const isV2 = window.location.pathname.includes('2.0');

        // Reset desktop sidebar button styles
        [navCalcBtn, navDashboardBtn, navDatabaseBtn, navArchiveBtn].forEach(btn => {
            if (!btn) return;
            if (isV2) {
                btn.classList.remove('bg-[var(--canvas-a)]', 'text-[var(--brand)]', 'border-[var(--line-soft)]', 'shadow-sm', 'bg-[var(--canvas-b)]', 'text-[var(--ink)]');
                btn.classList.add('hover:bg-[var(--canvas-b)]', 'text-[var(--ink-soft)]', 'hover:text-[var(--ink)]', 'border-transparent');
            } else {
                btn.classList.remove('bg-white/10', 'text-white', 'shadow-lg', 'border', 'border-white/10');
                btn.classList.add('hover:bg-white/5', 'text-slate-300', 'hover:text-white');
            }
        });

        // Reset mobile bottom nav button styles
        [mobNavCalcBtn, mobNavDashboardBtn, mobNavDatabaseBtn, mobNavArchiveBtn].forEach(btn => {
            if (!btn) return;
            btn.classList.remove('text-cyan-400', 'mob-active');
            btn.classList.add('text-slate-400');
            const icon = btn.querySelector('i');
            const text = btn.querySelector('span');
            if (icon) {
                icon.classList.remove('text-cyan-400', 'scale-125', '-translate-y-1', 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]');
            }
            if (text) {
                text.classList.remove('opacity-100', 'translate-y-0');
                text.classList.add('opacity-0', 'translate-y-4');
            }
        });

        // Hide all views
        [viewCalc, viewDashboard, viewDatabase, viewArchive].forEach(view => {
            if (view) {
                view.classList.add('hidden');
                view.classList.remove('flex');
            }
        });

        // Activate selected view and button
        let activeBtn = null;
        let activeMobBtn = null;
        if (viewId === 'view-calculator' && viewCalc) {
            activeBtn = navCalcBtn;
            activeMobBtn = mobNavCalcBtn;
            viewCalc.classList.remove('hidden');
            viewCalc.classList.add('flex');
            // Перезапускаем каскадную анимацию появления карточек при каждом входе на вкладку
            viewCalc.classList.remove('stagger-in');
            void viewCalc.offsetWidth;
            viewCalc.classList.add('stagger-in');
        } else if (viewId === 'view-dashboard' && viewDashboard) {
            activeBtn = navDashboardBtn;
            activeMobBtn = mobNavDashboardBtn;
            viewDashboard.classList.remove('hidden');
            viewDashboard.classList.add('flex');
            if (typeof calculateStatistics === 'function') calculateStatistics();
        } else if (viewId === 'view-database' && viewDatabase) {
            activeBtn = navDatabaseBtn;
            activeMobBtn = mobNavDatabaseBtn;
            viewDatabase.classList.remove('hidden');
            viewDatabase.classList.add('flex');
            try {
                dbAllRecords = await getHistoryData(0);
                renderDbTable();
            } catch (e) {
                const dbTableBody = document.getElementById('dbTableBody');
                if (dbTableBody) dbTableBody.innerHTML = `<tr><td colspan="9" class="text-center py-10 text-red-400">Ошибка загрузки</td></tr>`;
            }
        } else if (viewId === 'view-archive' && viewArchive) {
            activeBtn = navArchiveBtn;
            activeMobBtn = mobNavArchiveBtn;
            viewArchive.classList.remove('hidden');
            viewArchive.classList.add('flex');
            if (typeof renderHistory === 'function') renderHistory();
        }

        if (activeBtn) {
            if (isV2) {
                activeBtn.classList.remove('hover:bg-[var(--canvas-b)]', 'text-[var(--ink-soft)]', 'hover:text-[var(--ink)]', 'border-transparent');
                activeBtn.classList.add('bg-[var(--canvas-a)]', 'text-[var(--brand)]', 'border-[var(--line-soft)]', 'shadow-sm');
            } else {
                activeBtn.classList.remove('hover:bg-white/5', 'text-slate-300', 'hover:text-white');
                activeBtn.classList.add('bg-white/10', 'text-white', 'shadow-lg', 'border', 'border-white/10');
            }
        }

        if (activeMobBtn) {
            activeMobBtn.classList.remove('text-slate-400');
            activeMobBtn.classList.add('text-cyan-400', 'mob-active');
            const icon = activeMobBtn.querySelector('i');
            const text = activeMobBtn.querySelector('span');
            if (icon) {
                icon.classList.add('text-cyan-400', 'scale-125', '-translate-y-1', 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]');
            }
            if (text) {
                text.classList.remove('opacity-0', 'translate-y-4');
                text.classList.add('opacity-100', 'translate-y-0');
            }
        }
    }

    if (navCalcBtn) navCalcBtn.addEventListener('click', () => switchAppView('view-calculator'));
    if (navDashboardBtn) navDashboardBtn.addEventListener('click', () => switchAppView('view-dashboard'));
    if (navDatabaseBtn) navDatabaseBtn.addEventListener('click', () => switchAppView('view-database'));
    if (navArchiveBtn) navArchiveBtn.addEventListener('click', () => switchAppView('view-archive'));

    if (mobNavCalcBtn) mobNavCalcBtn.addEventListener('click', () => switchAppView('view-calculator'));
    if (mobNavDashboardBtn) mobNavDashboardBtn.addEventListener('click', () => switchAppView('view-dashboard'));
    if (mobNavDatabaseBtn) mobNavDatabaseBtn.addEventListener('click', () => switchAppView('view-database'));
    if (mobNavArchiveBtn) mobNavArchiveBtn.addEventListener('click', () => switchAppView('view-archive'));

    // Search
    function onDbSearch(e) { renderDbTable(e.target.value); }
    if (dbSearchInput) dbSearchInput.addEventListener('input', onDbSearch);
    if (dbSearchInputMobile) {
        dbSearchInputMobile.addEventListener('input', (e) => {
            if (dbSearchInput) dbSearchInput.value = e.target.value;
            renderDbTable(e.target.value);
        });
    }

    // Filters
    function onDbFilter() { renderDbTable(dbSearchInput ? dbSearchInput.value : ''); }
    ['dbFilterVisitDate', 'dbFilterTariff', 'dbFilterClient', 'dbFilterGuestsMin', 'dbFilterGuestsMax', 'dbFilterDateFrom', 'dbFilterDateTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', onDbFilter);
        if (el && el.type === 'number') el.addEventListener('input', onDbFilter);
    });

    // Сворачиваемый блок фильтров на мобильных (на десктопе всегда открыт)
    const dbFilterToggleBtn = document.getElementById('dbFilterToggleBtn');
    const dbFilterBar = document.getElementById('dbFilterBar');
    const dbFilterToggleIcon = document.getElementById('dbFilterToggleIcon');
    if (dbFilterToggleBtn && dbFilterBar) {
        dbFilterToggleBtn.addEventListener('click', () => {
            const isHidden = dbFilterBar.classList.contains('hidden');
            if (isHidden) {
                dbFilterBar.classList.remove('hidden');
                dbFilterBar.classList.add('flex');
                if (dbFilterToggleIcon) dbFilterToggleIcon.classList.add('rotate-180');
            } else {
                dbFilterBar.classList.add('hidden');
                dbFilterBar.classList.remove('flex');
                if (dbFilterToggleIcon) dbFilterToggleIcon.classList.remove('rotate-180');
            }
        });
    }

    const dbFilterResetBtn = document.getElementById('dbFilterResetBtn');
    if (dbFilterResetBtn) {
        dbFilterResetBtn.addEventListener('click', () => {
            const ids = ['dbFilterVisitDate', 'dbFilterTariff', 'dbFilterClient', 'dbFilterGuestsMin', 'dbFilterGuestsMax', 'dbFilterDateFrom', 'dbFilterDateTo'];
            ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            if (dbSearchInput) dbSearchInput.value = '';
            renderDbTable('');
        });
    }

    // CSV Export
    if (dbExportBtn) {
        dbExportBtn.addEventListener('click', async () => {
            if (!dbAllRecords.length) return;

            // Найти оригинальный текст кнопки для эффекта загрузки
            const originalBtnHtml = dbExportBtn.innerHTML;
            dbExportBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Экспорт...</span>';
            dbExportBtn.style.pointerEvents = 'none';

            try {
                // Инициализация ExcelJS Workbook
                const workbook = new ExcelJS.Workbook();
                const sheet = workbook.addWorksheet('Заявки');

                // Загрузка логотипа через fetch (надежный способ получить base64)
                let logoBase64 = null;
                try {
                    const response = await fetch('assets/pdf_logo.png');
                    const blob = await response.blob();
                    logoBase64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                } catch (e) {
                    console.warn('Не удалось загрузить логотип для Excel', e);
                }

                // Добавляем логотип, если он загрузился
                if (logoBase64) {
                    const imageId = workbook.addImage({
                        base64: logoBase64,
                        extension: 'png'
                    });
                    // Помещаем логотип в левый верхний угол (A1:B3)
                    sheet.addImage(imageId, {
                        tl: { col: 0, row: 0 },
                        ext: { width: 180, height: 60 }
                    });
                }

                // Настройка заголовка отчета
                sheet.mergeCells('C1:H2');
                const titleCell = sheet.getCell('C1');
                titleCell.value = 'Выгрузка заявок'; // По запросу пользователя в плане
                titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF0B2A43' } };
                titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

                // Оставляем несколько пустых строк сверху под логотип и заголовок
                sheet.addRow([]);
                sheet.addRow([]);

                // Формируем шапку таблицы
                const headers = ['#', 'ДАТА / ВРЕМЯ', 'ВИЗИТ', 'КЛИЕНТ', 'ТАРИФ', 'ГОСТЕЙ', 'СПИСОК ГОСТЕЙ (ФИО - ДАТА РОЖДЕНИЯ - КАТ.)', 'СУММА'];
                const headerRow = sheet.addRow(headers);
                
                // Стилизация шапки
                headerRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF0B2A43' } // Темно-синий
                    };
                    cell.font = {
                        name: 'Arial',
                        size: 11,
                        bold: true,
                        color: { argb: 'FFFFFFFF' } // Белый текст
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
                headerRow.height = 30;

                // Настройка ширины колонок
                sheet.getColumn(1).width = 5;  // #
                sheet.getColumn(2).width = 15; // Дата/Время
                sheet.getColumn(3).width = 12; // Визит
                sheet.getColumn(4).width = 12; // Клиент
                sheet.getColumn(5).width = 12; // Тариф
                sheet.getColumn(6).width = 10; // Гостей
                sheet.getColumn(7).width = 50; // Список гостей (самая широкая)
                sheet.getColumn(8).width = 15; // Сумма

                // Заполнение данных
                dbAllRecords.forEach((item, index) => {
                    const dt = new Date(item.timestamp);
                    const dateStr = `${dt.getDate().toString().padStart(2, '0')}.${(dt.getMonth() + 1).toString().padStart(2, '0')}.${dt.getFullYear()}`;
                    const timeStr = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
                    
                    // Формируем красивый список гостей
                    let guestsStr = '';
                    if (item.tourists && item.tourists.length > 0) {
                        guestsStr = item.tourists.map(t => {
                            let formattedDob = t.formattedDob || '';
                            let cat = t.category ? t.category.toUpperCase() : '';
                            return `${t.fullName} (${formattedDob}) - ${cat}`;
                        }).join('\n');
                    } else {
                        guestsStr = 'Нет данных';
                    }

                    const clientType = item.clientType === 'agent' ? 'Турагент' : 'Турист';
                    const tariffType = item.tariffType === 'evening' ? 'Вечерний' : 'Дневной';

                    const row = sheet.addRow([
                        dbAllRecords.length - index,
                        `${dateStr}\n${timeStr}`,
                        item.visitDate || '',
                        clientType,
                        tariffType,
                        (item.tourists || []).length,
                        guestsStr,
                        item.totalSum || 0
                    ]);

                    // Стилизация строк данных
                    row.eachCell((cell, colNumber) => {
                        cell.font = { name: 'Arial', size: 10 };
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                            left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                            bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                            right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
                        };
                        
                        // Выравнивание по центру для всех колонок, кроме списка гостей
                        if (colNumber === 7) {
                            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                        } else if (colNumber === 8) {
                            cell.alignment = { vertical: 'middle', horizontal: 'right' };
                            cell.numFmt = '#,##0.00 ₸'; // Формат валюты
                        } else {
                            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        }
                    });
                });

                // Генерация файла и скачивание
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Выгрузка_заявок_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
                a.click();
                URL.revokeObjectURL(url);
            } catch (err) {
                console.error("Ошибка генерации Excel:", err);
                if (window.showToast) window.showToast("Ошибка генерации Excel файла", "error");
            } finally {
                dbExportBtn.innerHTML = originalBtnHtml;
                dbExportBtn.style.pointerEvents = 'auto';
            }
        });
    }
    // --- СВЕРКА С АКВАПАРКОМ ---
    /*
    if (reconciliationBtn && reconciliationFileInput) {
        reconciliationBtn.addEventListener('click', () => {
            reconciliationFileInput.click();
        });

        reconciliationFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const originalBtnHtml = reconciliationBtn.innerHTML;
            reconciliationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Сверка...</span>';
            reconciliationBtn.style.pointerEvents = 'none';

            try {
                const workbookIn = new ExcelJS.Workbook();
                await workbookIn.xlsx.load(file);
                const sheetIn = workbookIn.worksheets[0];

                const aquaparkRecords = [];
                let colMap = {};

                sheetIn.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) {
                        // Маппинг колонок по заголовку
                        row.eachCell((cell, colNumber) => {
                            const val = (cell.value || '').toString().trim();
                            if (val === 'Дата') colMap.date = colNumber;
                            if (val === 'Имя резервации') colMap.name = colNumber;
                            if (val === 'Статус резервации') colMap.status = colNumber;
                            if (val === 'Сумма в валюте') colMap.sum = colNumber;
                            if (val === 'Сумма') colMap.desc = colNumber;
                        });
                        
                        // Fallback если колонки не найдены (старый формат)
                        if (!colMap.name) colMap = { date: 1, name: 5, status: 10, sum: 7, desc: 9 };
                        return;
                    }

                    const dateVal = row.getCell(colMap.date).value;
                    let dateStr = '';
                    if (dateVal instanceof Date) {
                        dateStr = `${dateVal.getFullYear()}-${(dateVal.getMonth()+1).toString().padStart(2,'0')}-${dateVal.getDate().toString().padStart(2,'0')}`;
                    } else if (typeof dateVal === 'string') {
                        if (dateVal.match(/^\d{2}\.\d{2}\.\d{4}/)) {
                            const [d, m, y] = dateVal.split(' ')[0].split('.');
                            dateStr = `${y}-${m}-${d}`;
                        } else {
                            dateStr = dateVal.split(' ')[0];
                        }
                    } else if (typeof dateVal === 'number') {
                        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                        const jsDate = new Date(excelEpoch.getTime() + dateVal * 86400000);
                        dateStr = `${jsDate.getUTCFullYear()}-${(jsDate.getUTCMonth()+1).toString().padStart(2,'0')}-${jsDate.getUTCDate().toString().padStart(2,'0')}`;
                    }

                    const name = (row.getCell(colMap.name).value || '').toString().trim();
                    const status = (row.getCell(colMap.status).value || '').toString().trim();
                    const sum = row.getCell(colMap.sum).value || 0;
                    const desc = (row.getCell(colMap.desc).value || '').toString().trim();

                    if (name) {
                        aquaparkRecords.push({
                            name,
                            nameTrans: transliterate(name),
                            status,
                            date: dateStr,
                            sum,
                            desc,
                            matched: false
                        });
                    }
                });

                const reportWorkbook = new ExcelJS.Workbook();
                const reportSheet = reportWorkbook.addWorksheet('Результат Сверки');

                const headers = ['Статус Сверки', 'ФИО (Аквапарк)', 'ФИО (Локально)', 'Дата визита', 'Статус (Аквапарк)', 'Статус (Локально)', 'Сумма (Аквапарк)', 'Сумма (Локально)'];
                const headerRow = reportSheet.addRow(headers);
                
                headerRow.eachCell((cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                });

                reportSheet.getColumn(1).width = 30;
                reportSheet.getColumn(2).width = 30;
                reportSheet.getColumn(3).width = 30;
                reportSheet.getColumn(4).width = 15;
                reportSheet.getColumn(5).width = 15;
                reportSheet.getColumn(6).width = 15;
                reportSheet.getColumn(7).width = 15;
                reportSheet.getColumn(8).width = 15;

                const addReportRow = (statusText, colorHex, aquaName, localName, date, aquaStatus, localStatus, aquaSum, localSum) => {
                    const row = reportSheet.addRow([statusText, aquaName, localName, date, aquaStatus, localStatus, aquaSum, localSum]);
                    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHex } };
                    row.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    row.eachCell((cell, colNum) => {
                        cell.border = { top: {style:'thin', color:{argb:'FFDDDDDD'}}, left: {style:'thin', color:{argb:'FFDDDDDD'}}, bottom: {style:'thin', color:{argb:'FFDDDDDD'}}, right: {style:'thin', color:{argb:'FFDDDDDD'}} };
                        if (colNum >= 7) cell.numFmt = '#,##0.00 ₸';
                    });
                };

                dbAllRecords.forEach(localRecord => {
                    const localTourists = localRecord.tourists || [];
                    if (localTourists.length === 0) return;
                    
                    const firstGuestName = localTourists[0].fullName;
                    const firstGuestTrans = transliterate(firstGuestName);
                    const localStatus = localRecord.status || 'Оформлено';
                    const isLocalPaid = localStatus !== 'Отменена';

                    const aquaMatch = aquaparkRecords.find(ar => !ar.matched && (ar.nameTrans.includes(firstGuestTrans) || firstGuestTrans.includes(ar.nameTrans)) && ar.date === localRecord.visitDate);

                    if (aquaMatch) {
                        aquaMatch.matched = true;
                        const isAquaPaid = aquaMatch.status === 'İşlem' || aquaMatch.status === 'Check-Out';
                        const isAquaCanceled = aquaMatch.status === 'İptal' || aquaMatch.status === 'İade';

                        if (isLocalPaid && isAquaPaid) {
                            addReportRow('ОК (ОПЛАЧЕНО)', 'FF22C55E', aquaMatch.name, firstGuestName, localRecord.visitDate, aquaMatch.status, localStatus, aquaMatch.sum, localRecord.totalSum);
                        } else if (isLocalPaid && isAquaCanceled) {
                            addReportRow('ОТМЕНА В АКВАПАРКЕ', 'FFEF4444', aquaMatch.name, firstGuestName, localRecord.visitDate, aquaMatch.status, localStatus, aquaMatch.sum, localRecord.totalSum);
                        } else if (!isLocalPaid && isAquaPaid) {
                            addReportRow('ОТМЕНА ЛОКАЛЬНО, НО ОПЛАЧЕНО В АКВАПАРКЕ', 'FFF97316', aquaMatch.name, firstGuestName, localRecord.visitDate, aquaMatch.status, localStatus, aquaMatch.sum, localRecord.totalSum);
                        } else {
                            addReportRow('ОТМЕНЕНО ОБЕИМИ СТОРОНАМИ', 'FF64748B', aquaMatch.name, firstGuestName, localRecord.visitDate, aquaMatch.status, localStatus, aquaMatch.sum, localRecord.totalSum);
                        }
                    } else {
                        if (isLocalPaid) {
                            addReportRow('НЕТ В АКВАПАРКЕ', 'FFEAB308', '-', firstGuestName, localRecord.visitDate, '-', localStatus, '-', localRecord.totalSum);
                        }
                    }
                });

                aquaparkRecords.forEach(ar => {
                    if (!ar.matched) {
                        const isAquaPaid = ar.status === 'İşlem' || ar.status === 'Check-Out';
                        if (isAquaPaid) {
                            addReportRow('НЕТ ЛОКАЛЬНО', 'FF8B5CF6', ar.name, '-', ar.date, ar.status, '-', ar.sum, '-');
                        }
                    }
                });

                const buffer = await reportWorkbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Отчет_Сверка_Аквапарк_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
                a.click();
                URL.revokeObjectURL(url);

            } catch (err) {
                console.error("Ошибка сверки:", err);
                if (window.showToast) window.showToast("Ошибка при чтении файла аквапарка", "error");
            } finally {
                reconciliationBtn.innerHTML = originalBtnHtml;
                reconciliationBtn.style.pointerEvents = 'auto';
                e.target.value = '';
            }
        });
    }
    // --- СВЕРКА С БАНКОМ ---
    const bankReconciliationBtn = document.getElementById('bankReconciliationBtn');
    const bankReconciliationFileInput = document.getElementById('bankReconciliationFileInput');

    if (bankReconciliationBtn && bankReconciliationFileInput) {
        bankReconciliationBtn.addEventListener('click', () => {
            bankReconciliationFileInput.click();
        });

        bankReconciliationFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const originalBtnHtml = bankReconciliationBtn.innerHTML;
            bankReconciliationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Сверка...</span>';
            bankReconciliationBtn.style.pointerEvents = 'none';

            try {
                let bankRecords = [];
                const ext = file.name.split('.').pop().toLowerCase();
                
                if (ext === 'xlsx') {
                    const workbookIn = new ExcelJS.Workbook();
                    await workbookIn.xlsx.load(file);
                    const sheetIn = workbookIn.worksheets[0];

                    sheetIn.eachRow((row, rowNumber) => {
                        let dateStr = '';
                        let amount = 0;
                        let desc = '';
                        row.eachCell((cell) => {
                            const val = cell.value;
                            if (val instanceof Date) {
                                dateStr = `${val.getFullYear()}-${(val.getMonth()+1).toString().padStart(2,'0')}-${val.getDate().toString().padStart(2,'0')}`;
                            } else if (typeof val === 'number') {
                                if (val > 500) amount = val;
                            } else if (typeof val === 'string') {
                                if (val.match(/^\d{2}\.\d{2}\.\d{4}/)) {
                                    const [d, m, y] = val.split(' ')[0].split('.');
                                    dateStr = `${y}-${m}-${d}`;
                                } else if (val.length > 5 && !val.match(/^\d+$/)) {
                                    if(desc.length < 50) desc += val + ' ';
                                }
                            }
                        });
                        if (amount > 0) {
                            bankRecords.push({ date: dateStr, amount, desc: desc.trim(), matched: false });
                        }
                    });
                }

                const reportWorkbook = new ExcelJS.Workbook();
                const reportSheet = reportWorkbook.addWorksheet('Сверка Банк');
                const headers = ['Статус Сверки', 'Сумма (Банк)', 'Сумма (База)', 'Описание (Банк)', 'ФИО Клиента (База)'];
                const headerRow = reportSheet.addRow(headers);
                
                headerRow.eachCell((cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                });
                reportSheet.getColumn(1).width = 30;
                reportSheet.getColumn(2).width = 15;
                reportSheet.getColumn(3).width = 15;
                reportSheet.getColumn(4).width = 40;
                reportSheet.getColumn(5).width = 30;

                const addReportRow = (statusText, colorHex, bankSum, localSum, bankDesc, localName) => {
                    const row = reportSheet.addRow([statusText, bankSum, localSum, bankDesc, localName]);
                    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHex } };
                    row.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    row.eachCell((cell, colNum) => {
                        cell.border = { top: {style:'thin', color:{argb:'FFDDDDDD'}}, left: {style:'thin', color:{argb:'FFDDDDDD'}}, bottom: {style:'thin', color:{argb:'FFDDDDDD'}}, right: {style:'thin', color:{argb:'FFDDDDDD'}} };
                        if (colNum === 2 || colNum === 3) {
                            if(typeof cell.value === 'number') cell.numFmt = '#,##0.00 ₸';
                        }
                    });
                };

                const matchedIds = [];
                dbAllRecords.forEach(localRecord => {
                    const localStatus = localRecord.status || 'Оформлено';
                    if (localStatus === 'Отменена') return;
                    const localSum = parseInt(localRecord.totalSum) || 0;
                    const firstGuestName = localRecord.tourists && localRecord.tourists.length > 0 ? localRecord.tourists[0].fullName : 'Неизвестно';

                    const bankMatch = bankRecords.find(br => !br.matched && br.amount === localSum);

                    if (bankMatch) {
                        bankMatch.matched = true;
                        matchedIds.push(localRecord.id);
                        addReportRow('СОВПАДЕНИЕ ПО СУММЕ', 'FF22C55E', bankMatch.amount, localSum, bankMatch.desc, firstGuestName);
                    } else {
                        addReportRow('НЕТ ОПЛАТЫ В БАНКЕ', 'FFEF4444', '-', localSum, '-', firstGuestName);
                    }
                });

                bankRecords.forEach(br => {
                    if (!br.matched) {
                        addReportRow('НЕИЗВЕСТНЫЙ ПЛАТЕЖ', 'FFEAB308', br.amount, '-', br.desc, '-');
                    }
                });

                const buffer = await reportWorkbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Отчет_Сверка_Банк_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
                a.click();
                URL.revokeObjectURL(url);

                // Автоматическое обновление статусов в базе данных Supabase
                if (matchedIds.length > 0 && supabaseClient) {
                    const { error } = await supabaseClient
                        .from('calculations')
                        .update({ status: 'Оплачено' })
                        .in('id', matchedIds);

                    if (error) {
                        console.error("Ошибка при обновлении статусов в Supabase:", error);
                        if (window.showToast) window.showToast("Ошибка при сохранении статусов в БД", "fa-triangle-exclamation", "bg-red-500");
                    } else {
                        if (window.showToast) window.showToast(`Сверка успешна! Обновлено оплат: ${matchedIds.length}`, "fa-check", "bg-emerald-500");
                        // Обновляем локальный кэш записей и перерисовываем таблицу
                        dbAllRecords = await getHistoryData(0);
                        renderDbTable(dbSearchInput ? dbSearchInput.value : '');
                    }
                } else if (matchedIds.length === 0) {
                    if (window.showToast) window.showToast("Совпадений с базой не найдено", "fa-triangle-exclamation", "bg-yellow-500");
                }

            } catch (err) {
                console.error("Ошибка банковской сверки:", err);
                if (window.showToast) window.showToast("Ошибка при чтении банковской выписки", "error");
            } finally {
                bankReconciliationBtn.innerHTML = originalBtnHtml;
                bankReconciliationBtn.style.pointerEvents = 'auto';
                e.target.value = '';
            }
        });
    }
    */
    // --- ИСТОРИЯ РАСЧЕТОВ ---
    const historyList = document.getElementById('historyList');

    // --- ЗАЯВКИ ОТ КЛИЕНТОВ ---
    const requestsBtn = document.getElementById('requestsBtn');
    const closeRequestsBtn = document.getElementById('closeRequestsBtn');
    const requestsModal = document.getElementById('requestsModal');
    const requestsModalContent = document.getElementById('requestsModalContent');
    const requestsList = document.getElementById('requestsList');

    const requestsFilterDateFrom = document.getElementById('requestsFilterDateFrom');
    const requestsFilterDateTo = document.getElementById('requestsFilterDateTo');
    const requestsFilterStatus = document.getElementById('requestsFilterStatus');
    const requestsPingBadge = document.getElementById('requestsPingBadge');

    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const statisticsContent = document.getElementById('statisticsContent');



    // --- ОБРАБОТЧИКИ ЗАЯВОК ---
    if (requestsBtn) {
        requestsBtn.addEventListener('click', () => {
            renderRequests();
            requestsModal.classList.remove('hidden');
            setTimeout(() => {
                requestsModal.classList.remove('opacity-0');
                requestsModalContent.classList.remove('translate-x-full');
            }, 10);
        });
    }

    if (closeRequestsBtn) {
        closeRequestsBtn.addEventListener('click', () => {
            requestsModal.classList.add('opacity-0');
            requestsModalContent.classList.add('translate-x-full');
            setTimeout(() => {
                requestsModal.classList.add('hidden');
            }, 300);
        });
    }

    if (requestsFilterDateFrom) requestsFilterDateFrom.addEventListener('change', renderRequests);
    if (requestsFilterDateTo) requestsFilterDateTo.addEventListener('change', renderRequests);
    if (requestsFilterStatus) requestsFilterStatus.addEventListener('change', renderRequests);

    // Initial check and interval for new client requests notification
    checkNewRequests();
    setInterval(checkNewRequests, 30000);

    async function renderHistory() {
        if (!historyList) return;
        try {
            // Загружаем все записи
            let history = await getHistoryData(0);

            // В архиве не показываем заявки в ожидании оплаты
            history = history.filter(item => item.status !== 'Ожидание оплаты');


            // Берём только последние 10 заявок
            history = history.slice(0, 10);

            if (history.length === 0) {
                historyList.innerHTML = '<div class="text-center text-slate-400 py-10"><i class="fa-solid fa-folder-open text-3xl mb-3 opacity-50"></i><p class="text-sm font-semibold">Заявки не найдены</p></div>';
                return;
            }

            const currentUser = localStorage.getItem('tetysUser');

            historyList.innerHTML = '';
            history.forEach(item => {
                const date = new Date(item.timestamp);
                const timeStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')} в ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

                const card = document.createElement('div');
                let statusBadge = '';

                if (item.status === 'Оплачено') {
                    cardClass = 'dark-glass-panel p-4 flex flex-col space-y-2 relative transition-all';
                    statusBadge = `<span class="px-2 py-1 text-[10px] pill-cyan">ОПЛАЧЕНО</span>`;
                } else if (item.status === 'Отказ') {
                    cardClass = 'dark-glass-panel p-4 flex flex-col space-y-2 relative opacity-50 transition-all';
                    statusBadge = `<span class="px-2 py-1 text-[10px] pill-rose">ОТКАЗ</span>`;
                } else {
                    cardClass = 'dark-glass-panel p-4 flex flex-col space-y-2 relative transition-all';
                    statusBadge = `<span class="px-2 py-1 text-[10px] pill-emerald">ЗАВЕРШЕНО</span>`;
                }
                card.className = cardClass;

                card.innerHTML = `
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">${timeStr}</span>
                        ${statusBadge}
                    </div>
                    <div class="flex justify-between items-center">
                        <div class="text-sm font-bold text-slate-100">Гостей: ${item.tourists.length}</div>
                        <span class="text-sm font-black text-white">${item.totalSum.toLocaleString('ru-RU')} ₸</span>
                    </div>
                    <div class="text-[11px] font-semibold text-slate-400 mb-1">Визит: ${item.visitDate} • ${item.clientType === 'agent' ? 'Турагент' : 'Турист'}</div>
                    ${item.promocode ? `<div class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1"><i class="fa-solid fa-ticket mr-1"></i> ${item.promocode}</div>` : ''}
                    ${item.comment ? `<div class="text-[10px] text-slate-500 italic mb-1"><i class="fa-regular fa-comment-dots mr-1"></i> ${item.comment}</div>` : ''}
                    


                    <button class="mt-2 w-full bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white py-2 rounded-xl text-xs font-bold transition-all hover-lift load-btn">
                        <i class="fa-solid fa-download mr-1.5"></i>Загрузить расчет
                    </button>
                    ${currentUser === 'admin' ? `
                    <button onclick="deleteHistoryRecord('${item.id}')" class="mt-2 w-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white py-1.5 rounded-xl text-[10px] font-bold transition-colors">
                        <i class="fa-solid fa-trash mr-1"></i>Удалить
                    </button>
                    ` : ''}
                `;

                const loadBtn = card.querySelector('.load-btn');
                loadBtn.addEventListener('click', () => {
                    if (visitDateInput) visitDateInput.value = item.visitDate;
                    if (clientTypeInput) clientTypeInput.value = item.clientType;
                    if (tariffTypeInput) tariffTypeInput.value = item.tariffType;
                    tourists = item.tourists;
                    render();
                    if (window.showToast) window.showToast('Расчет успешно загружен', 'fa-folder-open', 'bg-brand-blue');
                    closeHistoryBtn.click();
                });

                historyList.appendChild(card);
            });
        } catch (err) {
            console.error("Ошибка загрузки истории:", err);
            historyList.innerHTML = '<div class="text-center text-red-400 py-10"><p>Ошибка загрузки архива</p></div>';
        }
    }

    let knownPendingRequestIds = new Set();
    let isFirstCheck = true;

    async function renderRequests() {
        if (!requestsList) return;
        try {
            let history = await getHistoryData(0);

            // Фильтруем только заявки, поступившие от клиентов (только ожидающие оплаты)
            // Оплаченные и отказные переходят в архив
            let requests = history.filter(item => {
                return String(item.user_login).startsWith('client_form') && item.status === 'Ожидание оплаты';
            });

            const dateFromVal = requestsFilterDateFrom ? requestsFilterDateFrom.value : '';
            const dateToVal = requestsFilterDateTo ? requestsFilterDateTo.value : '';
            const statusFilterVal = requestsFilterStatus ? requestsFilterStatus.value : 'all';

            if (dateFromVal) {
                const dateFrom = new Date(dateFromVal + 'T00:00:00');
                requests = requests.filter(item => new Date(item.timestamp) >= dateFrom);
            }
            if (dateToVal) {
                const dateTo = new Date(dateToVal + 'T23:59:59');
                requests = requests.filter(item => new Date(item.timestamp) <= dateTo);
            }
            if (statusFilterVal && statusFilterVal !== 'all') {
                requests = requests.filter(item => item.status === statusFilterVal);
            }

            if (requests.length === 0) {
                requestsList.innerHTML = '<div class="text-center text-slate-400 py-10"><i class="fa-solid fa-folder-open text-3xl mb-3 opacity-50"></i><p class="text-sm font-semibold">Заявки не найдены</p></div>';
                return;
            }

            const currentUser = localStorage.getItem('tetysUser');

            requestsList.innerHTML = '';
            requests.forEach(item => {
                const date = new Date(item.timestamp);
                const timeStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')} в ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

                const card = document.createElement('div');
                let cardClass = '';
                let pingBadge = '';

                if (item.status === 'Ожидание оплаты') {
                    cardClass = 'bg-amber-50/50 p-4 rounded-2xl border-l-4 border-l-amber-500 border border-amber-200 shadow-sm flex flex-col space-y-2 relative transition-all';
                    pingBadge = `
                        <span class="relative flex h-2 w-2 mr-1.5 shrink-0">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                    `;
                } else if (item.status === 'Отказ') {
                    cardClass = 'bg-slate-100/60 p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-2 relative opacity-70 transition-all';
                    pingBadge = `
                        <span class="relative flex h-2 w-2 mr-1.5 shrink-0">
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
                        </span>
                    `;
                } else { // Оплачено
                    cardClass = 'bg-emerald-50/40 p-4 rounded-2xl border-l-4 border-l-emerald-500 border border-emerald-200 shadow-sm flex flex-col space-y-2 relative transition-all';
                    pingBadge = `
                        <span class="relative flex h-2 w-2 mr-1.5 shrink-0">
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    `;
                }
                card.className = cardClass;

                card.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">${timeStr}</span>
                        <span class="text-xs font-black text-[#1e293b]">${item.totalSum.toLocaleString('ru-RU')} ₸</span>
                    </div>
                    <div class="text-sm font-bold text-slate-800">Гостей: ${item.tourists.length}</div>
                    <div class="text-[11px] font-semibold text-slate-500 mb-1">Визит: ${item.visitDate} • Клиент</div>
                    ${item.comment ? `<div class="text-[10px] text-slate-500 italic mb-1"><i class="fa-regular fa-comment-dots mr-1"></i> ${item.comment}</div>` : ''}
                    
                    <div class="flex items-center justify-end mt-2 pt-2 border-t border-slate-100 mb-2">
                        <button type="button" class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm flex items-center archive-btn">
                            <i class="fa-solid fa-check mr-1.5"></i>В архив
                        </button>
                    </div>

                    <button class="mt-2 w-full bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white py-2 rounded-xl text-xs font-bold transition-all hover-lift load-btn">
                        <i class="fa-solid fa-download mr-1.5"></i>Загрузить расчет
                    </button>
                    ${currentUser === 'admin' ? `
                    <button onclick="deleteHistoryRecord('${item.id}'); setTimeout(renderRequests, 500);" class="mt-2 w-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white py-1.5 rounded-xl text-[10px] font-bold transition-colors">
                        <i class="fa-solid fa-trash mr-1"></i>Удалить
                    </button>
                    ` : ''}
                `;

                const loadBtn = card.querySelector('.load-btn');
                loadBtn.addEventListener('click', () => {
                    if (visitDateInput) visitDateInput.value = item.visitDate;
                    if (clientTypeInput) clientTypeInput.value = item.clientType;
                    if (tariffTypeInput) tariffTypeInput.value = item.tariffType;
                    tourists = item.tourists;
                    render();
                    if (window.showToast) window.showToast('Расчет успешно загружен', 'fa-folder-open', 'bg-brand-blue');
                    closeRequestsBtn.click();
                });

                const archiveBtn = card.querySelector('.archive-btn');
                if (archiveBtn) {
                    archiveBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateRequestStatus(item.id, 'Оплачено');
                    });
                }

                requestsList.appendChild(card);
            });
        } catch (e) {
            console.error("Error rendering requests:", e);
        }
    }

    function getRecordMetrics(item) {
        let baseSum = 0;
        let totalCost = 0;

        if (item.tourists && Array.isArray(item.tourists)) {
            item.tourists.forEach(t => {
                let age = null;
                if (t.age !== undefined) {
                    age = t.age;
                } else if (t.year !== undefined) {
                    const visitYear = item.visitDate ? new Date(item.visitDate).getFullYear() : new Date().getFullYear();
                    age = visitYear - t.year;
                } else if (t.dob) {
                    age = calculateAge(t.dob, item.visitDate);
                }

                const category = t.category || getPassengerCategory(age, t.gender, item.visitDate);
                const basePrice = getBasePrice(item.visitDate, item.clientType, item.tariffType, category, age) || 0;

                // Получаем себестоимость из тарифов (Net price)
                let costPrice = getBasePrice(item.visitDate, 'net', item.tariffType, category, age) || 0;

                // Если пенсионер или инвалид, то себестоимость 50% от базового тарифа
                if (category === 'SNR' || category === 'INV') {
                    const baseNet = getBasePrice(item.visitDate, 'net', item.tariffType, category, age);
                    if (baseNet > 0) {
                        costPrice = baseNet / 2;
                    } else {
                        costPrice = 0;
                    }
                }

                // Если нетто-цена не найдена (например, старые записи без даты визита), 
                // мы оставляем 0, чтобы не завышать маржу, либо можно взять минимальную себестоимость.
                // В данном случае лучше оставить как есть или попытаться взять дефолтный сезон.
                if (costPrice === -1 || costPrice === 0) {
                    if (category === 'INF') costPrice = 0;
                    else {
                        // Попытка взять первый доступный тариф как дефолт
                        const defaultPeriod = CONFIG.tariffs[item.tariffType]?.[0];
                        if (defaultPeriod && defaultPeriod.net) {
                            costPrice = defaultPeriod.net[category === 'CHLD' ? 'CHLD' : 'ADL'] || 0;
                        }
                    }
                }

                baseSum += basePrice > 0 ? basePrice : 0;
                totalCost += costPrice;
            });
        }

        let discountSum = baseSum - item.totalSum;
        if (discountSum < 0) discountSum = 0;
        const profit = item.totalSum - totalCost;

        return {
            baseSum: baseSum,
            discountSum: discountSum,
            cost: totalCost,
            profit: profit
        };
    }

    const statsDateFrom = document.getElementById('statsDateFrom');
    const statsDateTo = document.getElementById('statsDateTo');

    async function calculateStatistics() {
        if (!statisticsContent) return;
        try {
            statisticsContent.innerHTML = '<div class="text-center text-slate-400 py-10"><i class="fa-solid fa-spinner fa-spin text-3xl mb-3 opacity-50"></i><p class="text-sm font-semibold">Загрузка облачной статистики...</p></div>';

            // Загружаем ВСЕ данные для статистики (limit = 0)
            let history = await getHistoryData(0);

            // Фильтруем историю — статистика строится только по статусу "Оплачено"
            history = history.filter(item => item.status === 'Оплачено');

            // Фильтр по датам
            const fromStr = statsDateFrom ? statsDateFrom.value : '';
            const toStr = statsDateTo ? statsDateTo.value : '';
            if (fromStr || toStr) {
                history = history.filter(item => {
                    // Используем дату визита или дату чека
                    const dStr = item.visitDate || item.timestamp;
                    if (!dStr) return true;
                    // Если это ISO или timestamp
                    let dt;
                    if (dStr.includes('.')) {
                        const parts = dStr.split('.');
                        if (parts.length === 3) dt = new Date(parts[2], parts[1] - 1, parts[0]);
                        else dt = new Date(dStr);
                    } else {
                        dt = new Date(dStr);
                    }
                    if (isNaN(dt.getTime())) return true;
                    dt.setHours(0, 0, 0, 0);

                    if (fromStr) {
                        const fromDt = new Date(fromStr);
                        fromDt.setHours(0, 0, 0, 0);
                        if (dt < fromDt) return false;
                    }
                    if (toStr) {
                        const toDt = new Date(toStr);
                        toDt.setHours(0, 0, 0, 0);
                        if (dt > toDt) return false;
                    }
                    return true;
                });
            }

            // Build a short period label for KPI pills
            const fmtShort = d => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            let periodLabelShort = 'Выбранный период';
            if (fromStr && toStr && fromStr === toStr) {
                const d = new Date(fromStr);
                const today = new Date(); today.setHours(0,0,0,0);
                const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
                d.setHours(0,0,0,0);
                if (d.getTime() === today.getTime()) periodLabelShort = 'Сегодня';
                else if (d.getTime() === yesterday.getTime()) periodLabelShort = 'Вчера';
                else periodLabelShort = fmtShort(d);
            } else if (fromStr && toStr) {
                periodLabelShort = fmtShort(new Date(fromStr)) + ' — ' + fmtShort(new Date(toStr));
            } else if (fromStr) {
                periodLabelShort = 'С ' + fmtShort(new Date(fromStr));
            } else if (toStr) {
                periodLabelShort = 'По ' + fmtShort(new Date(toStr));
            } else {
                periodLabelShort = 'За всё время';
            }


            if (history.length === 0) {
                statisticsContent.innerHTML = '<div class="text-center text-slate-400 py-10"><i class="fa-solid fa-chart-pie text-3xl mb-3 opacity-50"></i><p class="text-sm font-semibold">Нет оплаченных заявок для выбранного периода</p></div>';
                return;
            }

            let totalRevenue = 0;
            let totalProfit = 0;
            let totalDiscounts = 0;
            let totalClients = 0;

            history.forEach(item => {
                totalRevenue += item.totalSum;
                totalClients += item.tourists.length;

                const metrics = getRecordMetrics(item);
                totalProfit += metrics.profit;
                totalDiscounts += metrics.discountSum;
            });

            const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

            statisticsContent.innerHTML = `
                <!-- KPI Cards — clean, editorial style (ref: TISTOLS graphs template) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                    <!-- Revenue Total -->
                    <div class="kpi-card">
                        <div class="flex items-center justify-between mb-4">
                            <span class="kpi-dot" style="background:#f97316"></span>
                            <i class="fa-solid fa-arrow-trend-up kpi-icon"></i>
                        </div>
                        <p class="kpi-label">Выручка за период</p>
                        <p class="kpi-value">${totalRevenue.toLocaleString('ru-RU')} <span class="kpi-unit">₸</span></p>
                        <span class="kpi-pill" style="color:#c2410c;background:#fff3e8">${periodLabelShort}</span>
                    </div>
                    <!-- Revenue Orders -->
                    <div class="kpi-card">
                        <div class="flex items-center justify-between mb-4">
                            <span class="kpi-dot" style="background:#10b981"></span>
                            <i class="fa-solid fa-arrow-trend-up kpi-icon"></i>
                        </div>
                        <p class="kpi-label">Заявок за период</p>
                        <p class="kpi-value">${history.length} <span class="kpi-unit">шт</span></p>
                        <span class="kpi-pill" style="color:#047857;background:#e9fbf3">${periodLabelShort}</span>
                    </div>
                    <!-- Profit -->
                    <div class="kpi-card">
                        <div class="flex items-center justify-between mb-4">
                            <span class="kpi-dot" style="background:#1e1e1e"></span>
                            <i class="fa-solid fa-chart-pie kpi-icon"></i>
                        </div>
                        <p class="kpi-label">Чистая прибыль</p>
                        <p class="kpi-value">${totalProfit.toLocaleString('ru-RU')} <span class="kpi-unit">₸</span></p>
                        <span class="kpi-pill" style="color:#334155;background:#f1f3f5">Маржа ${avgMargin.toFixed(1)}%</span>
                    </div>
                    <!-- Clients -->
                    <div class="kpi-card">
                        <div class="flex items-center justify-between mb-4">
                            <span class="kpi-dot" style="background:#f43f5e"></span>
                            <i class="fa-solid fa-users kpi-icon"></i>
                        </div>
                        <p class="kpi-label">Обслужено клиентов</p>
                        <p class="kpi-value">${totalClients} <span class="kpi-unit">чел</span></p>
                        <span class="kpi-pill" style="color:#be123c;background:#fff0f1">${totalDiscounts.toLocaleString('ru-RU')} ₸ скидок</span>
                    </div>
                    <!-- Average Check -->
                    <div class="kpi-card">
                        <div class="flex items-center justify-between mb-4">
                            <span class="kpi-dot" style="background:#8b5cf6"></span>
                            <i class="fa-solid fa-receipt kpi-icon"></i>
                        </div>
                        <p class="kpi-label">Средний чек</p>
                        <p class="kpi-value">${history.length > 0 ? Math.round(totalRevenue / history.length).toLocaleString('ru-RU') : 0} <span class="kpi-unit">₸</span></p>
                        <span class="kpi-pill" style="color:#6d28d9;background:#f5f0fe">На 1 заявку</span>
                    </div>
                    <!-- ARPU -->
                    <div class="kpi-card">
                        <div class="flex items-center justify-between mb-4">
                            <span class="kpi-dot" style="background:#6366f1"></span>
                            <i class="fa-solid fa-user-tag kpi-icon"></i>
                        </div>
                        <p class="kpi-label">Доход на гостя (ARPU)</p>
                        <p class="kpi-value">${totalClients > 0 ? Math.round(totalRevenue / totalClients).toLocaleString('ru-RU') : 0} <span class="kpi-unit">₸</span></p>
                        <span class="kpi-pill" style="color:#4338ca;background:#eef0fe">Среднее на 1 чел.</span>
                    </div>
                </div>

                <!-- Main Chart (Smooth Line with Gradient) -->
                <div class="chart-card mb-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h3 class="chart-card-title">Обзор активности (Выручка и Прибыль)</h3>
                            <p class="chart-card-subtitle">Показатели по дням визита</p>
                        </div>
                    </div>
                    <div style="height: 250px; position: relative;"><canvas id="revenueProfitChart"></canvas></div>
                </div>

                <!-- Bottom Row: 3 Donut Charts (thick rounded rings, ref style) -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
                    <div class="chart-card flex flex-col items-center">
                        <h3 class="chart-card-title self-start mb-4">Типы клиентов</h3>
                        <div class="w-full flex justify-center h-48 relative"><canvas id="clientTypeChart"></canvas></div>
                    </div>
                    <div class="chart-card flex flex-col items-center">
                        <h3 class="chart-card-title self-start mb-4">Возрастные категории</h3>
                        <div class="w-full flex justify-center h-48 relative"><canvas id="ageCategoryChart"></canvas></div>
                    </div>
                    <div class="chart-card flex flex-col items-center">
                        <h3 class="chart-card-title self-start mb-4">Прибыль по тарифам</h3>
                        <div class="w-full flex justify-center h-48 relative"><canvas id="tariffProfitChart"></canvas></div>
                    </div>
                </div>

                <div class="text-[10px] text-slate-400 text-center mt-6 uppercase font-bold tracking-widest">
                    Данные на основе ${history.length} оформленных расчетов
                </div>
            `;

            // Агрегация данных для графиков

            const metricsByDate = {};
            let agentCount = 0;
            let touristCount = 0;
            let catCounts = { ADL: 0, CHLD: 0, INF: 0, SNR: 0, INV: 0 };
            const profitByTariff = { day: 0, evening: 0 };

            history.forEach(item => {
                const metrics = getRecordMetrics(item);

                // 1. Агрегация по дате визита
                if (item.visitDate) {
                    if (!metricsByDate[item.visitDate]) {
                        metricsByDate[item.visitDate] = { revenue: 0, profit: 0 };
                    }
                    metricsByDate[item.visitDate].revenue += item.totalSum;
                    metricsByDate[item.visitDate].profit += metrics.profit;
                }

                // 2. Агрегация по тарифам
                const tariff = item.tariffType || 'day';
                if (profitByTariff[tariff] !== undefined) {
                    profitByTariff[tariff] += metrics.profit;
                }

                // 3. Агрегация типов клиентов
                if (item.clientType === 'agent') {
                    agentCount += item.tourists.length;
                } else {
                    touristCount += item.tourists.length;
                }

                // 4. Агрегация по категориям гостей
                if (item.tourists && Array.isArray(item.tourists)) {
                    item.tourists.forEach(t => {
                        const cat = t.category || 'ADL';
                        if (catCounts[cat] !== undefined) {
                            catCounts[cat]++;
                        }
                    });
                }
            });

            // Сортировка дат для временного графика
            const sortedDates = Object.keys(metricsByDate).sort((a, b) => new Date(a) - new Date(b));
            const revenueData = sortedDates.map(date => metricsByDate[date].revenue);
            const profitData = sortedDates.map(date => metricsByDate[date].profit);

            // Инициализация графиков с небольшой задержкой
            setTimeout(() => {
                if (typeof Chart !== 'undefined') {
                    const isDark = document.body.classList.contains('dark-mode');
                    const chartTextColor = isDark ? '#cbd5e1' : '#475569';
                    const chartLegendColor = isDark ? '#f8fafc' : '#334155';
                    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                    const ttBgColor = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
                    const ttTitleColor = isDark ? '#f8fafc' : '#0f172a';
                    const ttBodyColor = isDark ? '#cbd5e1' : '#334155';

                    Chart.defaults.color = chartTextColor;
                    Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Inter', 'Manrope', sans-serif";

                    // Плагин: крупное число + подпись по центру кольцевой диаграммы
                    // (референс: TISTOLS graphs template).
                    const centerTextPlugin = {
                        id: 'centerText',
                        afterDraw(chart) {
                            const opts = chart.config.options.plugins && chart.config.options.plugins.centerText;
                            if (!opts) return;
                            const { ctx, chartArea: { top, bottom, left, right } } = chart;
                            const cx = (left + right) / 2;
                            const cy = (top + bottom) / 2;
                            ctx.save();
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = chartLegendColor;
                            ctx.font = "800 20px -apple-system, BlinkMacSystemFont, Manrope, Inter, sans-serif";
                            ctx.fillText(opts.value, cx, cy - 8);
                            ctx.fillStyle = chartTextColor;
                            ctx.font = "600 10px -apple-system, BlinkMacSystemFont, Inter, sans-serif";
                            ctx.fillText(opts.label, cx, cy + 12);
                            ctx.restore();
                        }
                    };
                    if (!Chart.registry.plugins.get('centerText')) {
                        Chart.register(centerTextPlugin);
                    }

                    // 1. Выручка vs Прибыль
                    const revCtx = document.getElementById('revenueProfitChart');
                    if (revCtx) {
                        new Chart(revCtx, {
                            type: 'line',
                            data: {
                                labels: sortedDates.map(d => d.slice(5)), // Только MM-DD
                                datasets: [
                                    {
                                        label: 'Выручка ₸',
                                        data: revenueData,
                                        borderColor: '#3b82f6',
                                        backgroundColor: (context) => {
                                            const chart = context.chart;
                                            const { ctx, chartArea } = chart;
                                            if (!chartArea) return null;
                                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                                            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
                                            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                                            return gradient;
                                        },
                                        borderWidth: 3,
                                        tension: 0.4,
                                        fill: true,
                                        pointBackgroundColor: '#ffffff',
                                        pointBorderColor: '#3b82f6',
                                        pointBorderWidth: 2,
                                        pointRadius: 4,
                                        pointHoverRadius: 6
                                    },
                                    {
                                        label: 'Чистая прибыль ₸',
                                        data: profitData,
                                        borderColor: '#10b981',
                                        backgroundColor: (context) => {
                                            const chart = context.chart;
                                            const { ctx, chartArea } = chart;
                                            if (!chartArea) return null;
                                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                                            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
                                            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
                                            return gradient;
                                        },
                                        borderWidth: 3,
                                        tension: 0.4,
                                        fill: true,
                                        pointBackgroundColor: '#ffffff',
                                        pointBorderColor: '#10b981',
                                        pointBorderWidth: 2,
                                        pointRadius: 4,
                                        pointHoverRadius: 6
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: chartTextColor, font: { weight: 'bold' } }
                                    },
                                    y: {
                                        grid: { color: gridColor },
                                        ticks: { color: chartTextColor, font: { weight: 'bold' } },
                                        beginAtZero: true
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'top',
                                        labels: { boxWidth: 10, font: { size: 12, weight: 'bold' }, color: chartLegendColor, usePointStyle: true }
                                    },
                                    tooltip: {
                                        mode: 'index',
                                        intersect: false,
                                        backgroundColor: ttBgColor,
                                        titleColor: ttTitleColor,
                                        bodyColor: ttBodyColor,
                                        borderColor: gridColor,
                                        borderWidth: 1,
                                        padding: 10,
                                        boxPadding: 4,
                                        usePointStyle: true,
                                        titleFont: { size: 13, weight: 'bold' }
                                    }
                                },
                                interaction: {
                                    mode: 'nearest',
                                    axis: 'x',
                                    intersect: false
                                }
                            }
                        });
                    }

                    // 2. Типы клиентов
                    const typeCtx = document.getElementById('clientTypeChart');
                    if (typeCtx) {
                        new Chart(typeCtx, {
                            type: 'doughnut',
                            data: {
                                labels: ['Агенты', 'Туристы'],
                                datasets: [{
                                    data: [agentCount, touristCount],
                                    backgroundColor: ['#a78bfa', '#34d399'],
                                    borderWidth: 0,
                                    borderRadius: 8,
                                    spacing: 3,
                                    hoverOffset: 4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '72%',
                                plugins: {
                                    centerText: { value: (agentCount + touristCount).toString(), label: 'ГОСТЕЙ' },
                                    legend: {
                                        position: 'top',
                                        labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 10, weight: '600' }, color: chartTextColor, padding: 14 }
                                    }
                                }
                            }
                        });
                    }

                    // 3. Возрастные категории
                    const ageCtx = document.getElementById('ageCategoryChart');
                    if (ageCtx) {
                        const ageTotal = catCounts.ADL + catCounts.CHLD + catCounts.INF + catCounts.SNR + catCounts.INV;
                        new Chart(ageCtx, {
                            type: 'doughnut',
                            data: {
                                labels: ['Взрослые', 'Дети', 'Младенцы', 'Пенсионеры', 'Инвалиды'],
                                datasets: [{
                                    data: [catCounts.ADL, catCounts.CHLD, catCounts.INF, catCounts.SNR, catCounts.INV],
                                    backgroundColor: ['#60a5fa', '#fbbf24', '#f472b6', '#a78bfa', '#f87171'],
                                    borderWidth: 0,
                                    borderRadius: 8,
                                    spacing: 3,
                                    hoverOffset: 4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '72%',
                                plugins: {
                                    centerText: { value: ageTotal.toString(), label: 'ГОСТЕЙ' },
                                    legend: {
                                        position: 'top',
                                        labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 9, weight: '600' }, color: chartTextColor, padding: 10 }
                                    }
                                }
                            }
                        });
                    }

                    // 4. Прибыль по тарифам
                    const tariffCtx = document.getElementById('tariffProfitChart');
                    if (tariffCtx) {
                        const tariffTotal = profitByTariff.day + profitByTariff.evening;
                        new Chart(tariffCtx, {
                            type: 'doughnut',
                            data: {
                                labels: ['Дневной', 'Вечерний'],
                                datasets: [{
                                    data: [profitByTariff.day, profitByTariff.evening],
                                    backgroundColor: ['#38bdf8', '#fb7185'],
                                    borderWidth: 0,
                                    borderRadius: 8,
                                    spacing: 3,
                                    hoverOffset: 4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '72%',
                                plugins: {
                                    centerText: { value: Math.round(tariffTotal).toLocaleString('ru-RU'), label: '₸ ПРИБЫЛИ' },
                                    legend: {
                                        position: 'top',
                                        labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 10, weight: '600' }, color: chartTextColor, padding: 14 }
                                    }
                                }
                            }
                        });
                    }
                }
            }, 100);

        } catch (err) {
            console.error(err);
            statisticsContent.innerHTML = '<div class="text-center text-red-400 py-10"><p>Ошибка загрузки статистики</p></div>';
        }
    }

    async function exportToExcel() {
        if (typeof ExcelJS === 'undefined') {
            if (window.showToast) window.showToast('Библиотека Excel не загружена', 'fa-triangle-exclamation', 'bg-red-500');
            return;
        }

        try {
            let history = await getHistoryData(0);

            if (history.length === 0) {
                if (window.showToast) window.showToast('Архив пуст', 'fa-triangle-exclamation', 'bg-amber-500');
                return;
            }

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Tetys Blu';
            workbook.created = new Date();

            const sheet = workbook.addWorksheet('Отчет по продажам');

            // Настраиваем колонки с шириной
            sheet.columns = [
                { header: 'Дата создания', key: 'createdAt', width: 15 },
                { header: 'Дата визита', key: 'visitDate', width: 15 },
                { header: 'Тип клиента', key: 'clientType', width: 15 },
                { header: 'Тариф', key: 'tariffType', width: 15 },
                { header: 'Взрослые (ADL)', key: 'adl', width: 18 },
                { header: 'Дети (CHLD)', key: 'chld', width: 15 },
                { header: 'Всего гостей', key: 'guests', width: 15 },
                { header: 'Базовая сумма (₸)', key: 'baseSum', width: 18 },
                { header: 'Сумма со скидкой (₸)', key: 'totalSum', width: 22 },
                { header: 'Себестоимость (₸)', key: 'cost', width: 18 },
                { header: 'Валовая прибыль (₸)', key: 'profit', width: 22 }
            ];

            // Красивый заголовок
            const headerRow = sheet.getRow(1);
            headerRow.font = { name: 'Arial', family: 4, size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0EA5E9' } // фирменный голубой
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            headerRow.height = 30;

            // Добавляем данные
            history.forEach(item => {
                const date = new Date(item.timestamp);
                const dStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                const typeStr = item.clientType === 'agent' ? 'Турагент' : 'Турист';

                let adl = 0, chld = 0, inf = 0, snr = 0, inv = 0;
                if (item.tourists && Array.isArray(item.tourists)) {
                    item.tourists.forEach(t => {
                        const cat = t.category || 'ADL';
                        if (cat === 'ADL') adl++;
                        if (cat === 'CHLD') chld++;
                        if (cat === 'INF') inf++;
                        if (cat === 'SNR') snr++;
                        if (cat === 'INV') inv++;
                    });
                }

                const metrics = getRecordMetrics(item);

                const row = sheet.addRow({
                    createdAt: dStr,
                    visitDate: item.visitDate,
                    clientType: typeStr,
                    tariffType: item.tariffType,
                    adl: adl + snr + inv, // Объединяем взрослых с пенсионерами/инвалидами для простоты
                    chld: chld,
                    guests: item.tourists.length,
                    baseSum: metrics.baseSum,
                    totalSum: item.totalSum,
                    cost: metrics.cost,
                    profit: metrics.profit
                });

                // Выравнивание и перенос текста для ячеек
                row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

                // Форматируем финансовые ячейки
                row.getCell('baseSum').numFmt = '#,##0 ₸';
                row.getCell('totalSum').font = { bold: true, color: { argb: 'FF16A34A' } };
                row.getCell('totalSum').numFmt = '#,##0 ₸';
                row.getCell('cost').numFmt = '#,##0 ₸';
                row.getCell('profit').font = { bold: true, color: { argb: 'FF0EA5E9' } };
                row.getCell('profit').numFmt = '#,##0 ₸';
            });

            // Добавляем границы ко всем ячейкам
            sheet.eachRow((row, rowNumber) => {
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
                    };
                });
            });

            // Генерируем и скачиваем файл
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `TetysBlu_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (window.showToast) window.showToast('Отчет Excel успешно создан', 'fa-file-excel', 'bg-emerald-500');
        } catch (err) {
            console.error('Excel Export Error:', err);
            if (window.showToast) window.showToast('Ошибка создания отчета', 'fa-triangle-exclamation', 'bg-red-500');
        }
    }



    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportToExcel);

    // ── STATS PERIOD PRESETS ──────────────────────────────────────────────
    function setStatsPeriod(period) {
        const statsDateFrom = document.getElementById('statsDateFrom');
        const statsDateTo   = document.getElementById('statsDateTo');
        const customRange   = document.getElementById('statsCustomRange');
        const periodText    = document.getElementById('statsPeriodText');

        const today = new Date();
        const fmt = d => d.toISOString().split('T')[0]; // YYYY-MM-DD

        // Update pill styles
        document.querySelectorAll('.stats-preset-btn').forEach(btn => {
            btn.classList.remove('bg-brand-blue', 'text-white', 'shadow-sm', 'active-preset');
            btn.classList.add('text-slate-400');
        });
        const activeBtn = document.getElementById(`preset-${period}`);
        if (activeBtn) {
            activeBtn.classList.add('bg-brand-blue', 'text-white', 'shadow-sm', 'active-preset');
            activeBtn.classList.remove('text-slate-400');
        }

        // Show/hide custom range inputs
        if (customRange) {
            if (period === 'custom') {
                customRange.classList.remove('hidden');
                customRange.classList.add('flex');
            } else {
                customRange.classList.add('hidden');
                customRange.classList.remove('flex');
            }
        }

        // Set date values & label
        let from, to, label;
        if (period === 'today') {
            from = to = fmt(today);
            label = 'Сегодня, ' + today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        } else if (period === 'yesterday') {
            const y = new Date(today); y.setDate(y.getDate() - 1);
            from = to = fmt(y);
            label = 'Вчера, ' + y.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        } else if (period === '7days') {
            const d7 = new Date(today); d7.setDate(d7.getDate() - 6);
            from = fmt(d7); to = fmt(today);
            label = 'Последние 7 дней: ' + d7.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + ' — ' + today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        } else if (period === '30days') {
            const d30 = new Date(today); d30.setDate(d30.getDate() - 29);
            from = fmt(d30); to = fmt(today);
            label = 'Последние 30 дней: ' + d30.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + ' — ' + today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        } else {
            // custom — don't reset, just update label
            label = 'Произвольный диапазон';
            if (periodText) periodText.textContent = label;
            return; // wait for user to pick dates
        }

        if (statsDateFrom) statsDateFrom.value = from;
        if (statsDateTo)   statsDateTo.value   = to;
        if (periodText)    periodText.textContent = label;

        calculateStatistics();
    }
    window.setStatsPeriod = setStatsPeriod;

    if (statsDateFrom) statsDateFrom.addEventListener('change', calculateStatistics);
    if (statsDateTo)   statsDateTo.addEventListener('change', calculateStatistics);

    const statsClearBtn = document.getElementById('statsClearBtn');
    if (statsClearBtn) {
        statsClearBtn.addEventListener('click', () => {
            // Remove active class from presets
            document.querySelectorAll('.stats-preset-btn').forEach(btn => {
                btn.classList.remove('bg-brand-blue', 'text-white', 'shadow-sm', 'active-preset');
                btn.classList.add('text-slate-400');
            });
            
            // Hide custom range inputs
            const customRange = document.getElementById('statsCustomRange');
            if (customRange) {
                customRange.classList.add('hidden');
                customRange.classList.remove('flex');
            }

            // Clear inputs
            if (statsDateFrom) statsDateFrom.value = '';
            if (statsDateTo) statsDateTo.value = '';
            
            const periodText = document.getElementById('statsPeriodText');
            if (periodText) periodText.textContent = 'За всё время';

            calculateStatistics();
        });
    }

    const miniStatDateInput = document.getElementById('miniStatDate');
    const miniStatPrevDay = document.getElementById('miniStatPrevDay');
    const miniStatNextDay = document.getElementById('miniStatNextDay');
    
    if (miniStatDateInput) {
        miniStatDateInput.addEventListener('change', updateDashboardTopStats);
    }
    
    if (miniStatPrevDay && miniStatDateInput) {
        miniStatPrevDay.addEventListener('click', () => {
            if (miniStatDateInput.value) {
                const d = new Date(miniStatDateInput.value);
                d.setDate(d.getDate() - 1);
                miniStatDateInput.value = d.toISOString().split('T')[0];
                updateDashboardTopStats();
            }
        });
    }

    if (miniStatNextDay && miniStatDateInput) {
        miniStatNextDay.addEventListener('click', () => {
            if (miniStatDateInput.value) {
                const d = new Date(miniStatDateInput.value);
                d.setDate(d.getDate() + 1);
                miniStatDateInput.value = d.toISOString().split('T')[0];
                updateDashboardTopStats();
            }
        });
    }

    // Mobile miniStat date navigation
    const miniStatDateMobInput = document.getElementById('miniStatDateMob');
    const miniStatPrevDayMob = document.getElementById('miniStatPrevDayMob');
    const miniStatNextDayMob = document.getElementById('miniStatNextDayMob');

    if (miniStatDateMobInput) {
        miniStatDateMobInput.addEventListener('change', () => {
            // Sync to desktop input and refresh
            if (miniStatDateInput) miniStatDateInput.value = miniStatDateMobInput.value;
            updateDashboardTopStats();
        });
    }
    if (miniStatPrevDayMob && miniStatDateInput) {
        miniStatPrevDayMob.addEventListener('click', () => {
            if (miniStatDateInput.value) {
                const d = new Date(miniStatDateInput.value);
                d.setDate(d.getDate() - 1);
                miniStatDateInput.value = d.toISOString().split('T')[0];
                updateDashboardTopStats();
            }
        });
    }
    if (miniStatNextDayMob && miniStatDateInput) {
        miniStatNextDayMob.addEventListener('click', () => {
            if (miniStatDateInput.value) {
                const d = new Date(miniStatDateInput.value);
                d.setDate(d.getDate() + 1);
                miniStatDateInput.value = d.toISOString().split('T')[0];
                updateDashboardTopStats();
            }
        });
    }

    // Set default period to "today" when analytics view is opened
    const _origSwitchAppView = window.switchAppView;
    window.switchAppView = function(viewId) {
        if (typeof _origSwitchAppView === 'function') _origSwitchAppView(viewId);
        if (viewId === 'view-dashboard') {
            setTimeout(() => setStatsPeriod('today'), 50);
        }
    };

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

    // --- АДМИН-ПАНЕЛЬ: ЦЕНЫ И АКЦИИ ---
    const MONTHS_SHORT = ['', 'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    function formatPeriodLabel(p) {
        const [sm, sd] = p.start.split('-');
        const [em, ed] = p.end.split('-');
        return `${sd} ${MONTHS_SHORT[parseInt(sm, 10)]} – ${ed} ${MONTHS_SHORT[parseInt(em, 10)]}`;
    }

    function renderTariffPriceTable(tariffType, periods) {
        const rows = periods.map((p, idx) => `
            <tr class="border-b border-slate-100 last:border-0">
                <td class="py-1 pr-2 whitespace-nowrap">
                    <div class="flex items-center gap-0.5">
                        <input type="text" class="price-input !px-1 !py-0.5 w-[42px] text-center text-[10px] font-bold text-slate-500" data-tariff="${tariffType}" data-idx="${idx}" data-field="start" value="${p.start}" placeholder="ММ-ДД">
                        <span class="text-slate-300 text-[10px]">-</span>
                        <input type="text" class="price-input !px-1 !py-0.5 w-[42px] text-center text-[10px] font-bold text-slate-500" data-tariff="${tariffType}" data-idx="${idx}" data-field="end" value="${p.end}" placeholder="ММ-ДД">
                    </div>
                </td>
                <td class="py-1 px-1"><input class="price-input" type="number" data-tariff="${tariffType}" data-idx="${idx}" data-group="tourist" data-cat="ADL" value="${p.tourist.ADL}"></td>
                <td class="py-1 px-1"><input class="price-input" type="number" data-tariff="${tariffType}" data-idx="${idx}" data-group="tourist" data-cat="CHLD" value="${p.tourist.CHLD}"></td>
                <td class="py-1 px-1"><input class="price-input" type="number" data-tariff="${tariffType}" data-idx="${idx}" data-group="agent" data-cat="ADL" value="${p.agent.ADL}"></td>
                <td class="py-1 px-1"><input class="price-input" type="number" data-tariff="${tariffType}" data-idx="${idx}" data-group="agent" data-cat="CHLD" value="${p.agent.CHLD}"></td>
                <td class="py-1 px-1"><input class="price-input" type="number" data-tariff="${tariffType}" data-idx="${idx}" data-group="net" data-cat="ADL" value="${p.net.ADL}"></td>
                <td class="py-1 px-1"><input class="price-input" type="number" data-tariff="${tariffType}" data-idx="${idx}" data-group="net" data-cat="CHLD" value="${p.net.CHLD}"></td>
            </tr>`).join('');

        return `
        <div class="mb-4">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">${tariffType === 'day' ? 'Дневной тариф' : 'Вечерний тариф'}</h3>
            <div class="overflow-x-auto -mx-1">
            <table class="w-full text-xs min-w-[560px]">
                <thead>
                    <tr class="text-[9px] uppercase text-slate-400 font-bold">
                        <th class="text-left py-1 pr-2">Период</th>
                        <th class="py-1 px-1" colspan="2">Турист</th>
                        <th class="py-1 px-1" colspan="2">Агент</th>
                        <th class="py-1 px-1" colspan="2">Себестоимость</th>
                    </tr>
                    <tr class="text-[9px] uppercase text-slate-300 font-bold">
                        <th></th>
                        <th>Взр.</th><th>Дет.</th>
                        <th>Взр.</th><th>Дет.</th>
                        <th>Взр.</th><th>Дет.</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            </div>
        </div>`;
    }

    function renderPricingPricesPanel() {
        const panel = document.getElementById('pricingPricesPanel');
        if (!panel) return;
        panel.innerHTML = `
            ${renderTariffPriceTable('day', CONFIG.tariffs.day)}
            ${renderTariffPriceTable('evening', CONFIG.tariffs.evening)}
            <div class="mb-3 pt-2 border-t border-slate-100">
                <label class="block text-[11px] font-bold text-slate-500 mb-1 mt-2">Скидка «раннее бронирование» по умолчанию для ручного режима, %</label>
                <input id="earlyBookingFallbackInput" type="number" class="price-input max-w-[120px] text-left" value="${CONFIG.discounts.earlyBooking}">
            </div>
            <button onclick="window.savePricingPrices()" class="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors text-sm">
                <i class="fa-solid fa-floppy-disk mr-1.5"></i>Сохранить цены
            </button>
            <p id="pricingSaveStatus" class="text-center text-xs mt-2"></p>
        `;
    }

    window.savePricingPrices = async function () {
        const inputs = document.querySelectorAll('#pricingPricesPanel .price-input[data-tariff]');
        inputs.forEach(inp => {
            const { tariff, idx, group, cat, field } = inp.dataset;
            if (field) {
                CONFIG.tariffs[tariff][idx][field] = inp.value.trim();
            } else {
                CONFIG.tariffs[tariff][idx][group][cat] = parseInt(inp.value) || 0;
            }
        });
        const fallbackInput = document.getElementById('earlyBookingFallbackInput');
        if (fallbackInput) CONFIG.discounts.earlyBooking = parseInt(fallbackInput.value) || 0;

        const status = document.getElementById('pricingSaveStatus');
        if (!supabaseClient) {
            if (status) { status.textContent = 'Нет соединения с Supabase'; status.className = 'text-center text-xs mt-2 text-rose-600 font-bold'; }
            return;
        }
        try {
            const { error } = await supabaseClient.from('app_settings').upsert({
                key: 'tariffs',
                value: { day: CONFIG.tariffs.day, evening: CONFIG.tariffs.evening, earlyBookingFallback: CONFIG.discounts.earlyBooking },
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
            if (status) { status.textContent = 'Сохранено ✓'; status.className = 'text-center text-xs mt-2 text-emerald-600 font-bold'; }
            render();
            if (window.showToast) window.showToast('Цены обновлены', 'fa-check', 'bg-emerald-500');
        } catch (e) {
            console.error(e);
            if (status) { status.textContent = 'Ошибка сохранения: ' + (e.message || ''); status.className = 'text-center text-xs mt-2 text-rose-600 font-bold'; }
        }
    };

    function renderPricingPromosPanel() {
        const panel = document.getElementById('pricingPromosPanel');
        if (!panel) return;

        const tariffLabel = (t) => t === 'both' ? 'любой' : (t === 'day' ? 'дневной' : 'вечерний');
        const rows = activePromotions.map(p => `
            <div class="border border-slate-200 rounded-xl p-3 mb-2 flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span class="font-bold text-sm text-slate-900">${p.title}</span>
                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">${p.active ? 'Активна' : 'Выключена'}</span>
                    </div>
                    <div class="text-[11px] text-slate-500 leading-relaxed">
                        Скидка <b class="text-slate-700">${p.discount_percent}%</b> · Тариф: ${tariffLabel(p.tariff_type)}<br>
                        Покупка: ${p.purchase_start} — ${p.purchase_end}<br>
                        Посещение: ${p.visit_start} — ${p.visit_end}
                        ${p.ref_price_adl || p.ref_price_chld ? `<br>Реф. цена: ${p.ref_price_adl || '—'} / ${p.ref_price_chld || '—'}` : ''}
                    </div>
                </div>
                <div class="flex flex-col gap-1.5 shrink-0">
                    <button onclick="window.togglePromoActive('${p.id}', ${!p.active})" class="text-[11px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${p.active ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'}">${p.active ? 'Выключить' : 'Включить'}</button>
                    <button onclick="window.deletePromo('${p.id}')" class="text-[11px] font-bold px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600">Удалить</button>
                </div>
            </div>`).join('') || `<p class="text-sm text-slate-400 text-center py-6">Акций пока нет</p>`;

        panel.innerHTML = `
            <div class="mb-5">${rows}</div>
            <div class="border-t border-slate-100 pt-4">
                <h3 class="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Новая акция</h3>
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <div class="col-span-2">
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Название</label>
                        <input id="promoTitleInput" type="text" class="price-input text-left" placeholder="Например: Раннее бронирование — август">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Скидка, %</label>
                        <input id="promoDiscountInput" type="number" min="1" max="100" class="price-input text-left" value="15">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Тариф</label>
                        <select id="promoTariffInput" class="price-input text-left">
                            <option value="both">Любой</option>
                            <option value="day">Дневной</option>
                            <option value="evening">Вечерний</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Покупка — от</label>
                        <input id="promoPurchaseStartInput" type="date" class="price-input text-left">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Покупка — до</label>
                        <input id="promoPurchaseEndInput" type="date" class="price-input text-left">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Посещение — от</label>
                        <input id="promoVisitStartInput" type="date" class="price-input text-left">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Посещение — до</label>
                        <input id="promoVisitEndInput" type="date" class="price-input text-left">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Старая цена взр. (опц.)</label>
                        <input id="promoRefAdlInput" type="number" class="price-input text-left" placeholder="напр. 15000">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Старая цена дет. (опц.)</label>
                        <input id="promoRefChldInput" type="number" class="price-input text-left" placeholder="напр. 12000">
                    </div>
                </div>
                <p class="text-[10px] text-slate-400 mb-3">Старая цена (зачёркнутая) — если задана, скидка считается от неё вместо обычной сезонной цены (только для туристов). Оставьте пустым для обычной логики.</p>
                <button onclick="window.addPromo()" class="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors text-sm">
                    <i class="fa-solid fa-plus mr-1.5"></i>Добавить акцию
                </button>
                <p id="promoSaveStatus" class="text-center text-xs mt-2"></p>
            </div>
        `;
    }

    window.addPromo = async function () {
        const title = document.getElementById('promoTitleInput').value.trim();
        const discount = parseInt(document.getElementById('promoDiscountInput').value) || 0;
        const tariff = document.getElementById('promoTariffInput').value;
        const pStart = document.getElementById('promoPurchaseStartInput').value;
        const pEnd = document.getElementById('promoPurchaseEndInput').value;
        const vStart = document.getElementById('promoVisitStartInput').value;
        const vEnd = document.getElementById('promoVisitEndInput').value;
        const refAdl = document.getElementById('promoRefAdlInput').value;
        const refChld = document.getElementById('promoRefChldInput').value;
        const status = document.getElementById('promoSaveStatus');

        if (!title || !discount || !pStart || !pEnd || !vStart || !vEnd) {
            if (status) { status.textContent = 'Заполните все обязательные поля'; status.className = 'text-center text-xs mt-2 text-rose-600 font-bold'; }
            return;
        }
        if (!supabaseClient) return;

        try {
            const { error } = await supabaseClient.from('promotions').insert([{
                title, discount_percent: discount, tariff_type: tariff,
                purchase_start: pStart, purchase_end: pEnd,
                visit_start: vStart, visit_end: vEnd,
                ref_price_adl: refAdl ? parseInt(refAdl) : null,
                ref_price_chld: refChld ? parseInt(refChld) : null,
                active: true
            }]);
            if (error) throw error;
            await loadRemoteConfig();
            renderPricingPromosPanel();
            render();
            if (window.showToast) window.showToast('Акция добавлена', 'fa-check', 'bg-emerald-500');
        } catch (e) {
            console.error(e);
            if (status) { status.textContent = 'Ошибка: ' + (e.message || ''); status.className = 'text-center text-xs mt-2 text-rose-600 font-bold'; }
        }
    };

    window.togglePromoActive = async function (id, newActive) {
        if (!supabaseClient) return;
        await supabaseClient.from('promotions').update({ active: newActive }).eq('id', id);
        await loadRemoteConfig();
        renderPricingPromosPanel();
        render();
    };

    window.deletePromo = async function (id) {
        if (!confirm('Удалить эту акцию?')) return;
        if (!supabaseClient) return;
        await supabaseClient.from('promotions').delete().eq('id', id);
        await loadRemoteConfig();
        renderPricingPromosPanel();
        render();
    };

    window.renderPricingDiscountsPanel = function () {
        const panel = document.getElementById('pricingDiscountsPanel');
        if (!panel) return;
        
        const d = CONFIG.discounts;

        panel.innerHTML = `
            <div class="border border-slate-100 rounded-xl p-5 mb-5 bg-slate-50/50">
                <h3 class="text-sm font-black text-slate-800 mb-4">Настройки скидок (%)</h3>
                <p class="text-xs text-slate-500 mb-4">Укажите размер скидки для каждой льготной категории. Эти проценты будут вычитаться из базовой стоимости билета на текущий день.<br/>Например, для именинников укажите <b>50</b> (скидка 50%), для беременных — <b>100</b> (бесплатно).</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-1">Именинники</label>
                        <input id="discountBday" type="number" min="0" max="100" class="price-input text-left" value="${d.bday || 0}">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-1">Пенсионеры</label>
                        <input id="discountPensioner" type="number" min="0" max="100" class="price-input text-left" value="${d.pensioner || 0}">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-1">Многодетные семьи</label>
                        <input id="discountLargeFamily" type="number" min="0" max="100" class="price-input text-left" value="${d.large_family || 0}">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-1">Беременные (справка)</label>
                        <input id="discountPregnant" type="number" min="0" max="100" class="price-input text-left" value="${d.pregnant || 0}">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-1">Инвалиды (1 категория)</label>
                        <input id="discountCat1" type="number" min="0" max="100" class="price-input text-left" value="${d.cat1 || 0}">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-1">Инвалиды (2 категория)</label>
                        <input id="discountCat2" type="number" min="0" max="100" class="price-input text-left" value="${d.cat2 || 0}">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-1">Инвалиды (3 категория)</label>
                        <input id="discountCat3" type="number" min="0" max="100" class="price-input text-left" value="${d.cat3 || 0}">
                    </div>
                </div>
                <button onclick="window.saveDiscountsConfig()" class="w-full mt-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors text-sm">
                    <i class="fa-solid fa-save mr-1.5"></i>Сохранить настройки скидок
                </button>
                <p id="discountsSaveStatus" class="text-center text-xs mt-2"></p>
            </div>
        `;
    };

    window.saveDiscountsConfig = async function () {
        const btn = event.currentTarget;
        const status = document.getElementById('discountsSaveStatus');
        
        const newDiscounts = {
            ...CONFIG.discounts,
            bday: parseInt(document.getElementById('discountBday').value) || 0,
            pensioner: parseInt(document.getElementById('discountPensioner').value) || 0,
            large_family: parseInt(document.getElementById('discountLargeFamily').value) || 0,
            pregnant: parseInt(document.getElementById('discountPregnant').value) || 0,
            cat1: parseInt(document.getElementById('discountCat1').value) || 0,
            cat2: parseInt(document.getElementById('discountCat2').value) || 0,
            cat3: parseInt(document.getElementById('discountCat3').value) || 0
        };

        if (!supabaseClient) {
            status.textContent = 'Ошибка: Supabase не инициализирован';
            status.className = 'text-center text-xs mt-2 text-rose-600 font-bold';
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Сохранение...';

        try {
            const { error } = await supabaseClient.from('app_settings').upsert({
                key: 'discounts',
                value: newDiscounts,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;
            
            CONFIG.discounts = newDiscounts;
            status.textContent = 'Успешно сохранено!';
            status.className = 'text-center text-xs mt-2 text-emerald-600 font-bold';
            setTimeout(() => {
                if (status) status.textContent = '';
            }, 3000);
        } catch (e) {
            console.error('Save discounts error:', e);
            status.textContent = 'Ошибка сохранения';
            status.className = 'text-center text-xs mt-2 text-rose-600 font-bold';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-save mr-1.5"></i>Сохранить настройки скидок';
        }
    };

    window.openPricingAdminModal = function () {
        const modal = document.getElementById('pricingAdminModal');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        renderPricingPricesPanel();
        renderPricingPromosPanel();
        renderPricingDiscountsPanel();
    };

    window.closePricingAdminModal = function () {
        const modal = document.getElementById('pricingAdminModal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    window.switchPricingTab = function (tab) {
        const pricesPanel = document.getElementById('pricingPricesPanel');
        const promosPanel = document.getElementById('pricingPromosPanel');
        const discountsPanel = document.getElementById('pricingDiscountsPanel');
        const pricesBtn = document.getElementById('pricingTabPricesBtn');
        const promosBtn = document.getElementById('pricingTabPromosBtn');
        const discountsBtn = document.getElementById('pricingTabDiscountsBtn');
        
        if (!pricesPanel || !promosPanel || !discountsPanel) return;
        
        // Hide all
        pricesPanel.classList.add('hidden');
        promosPanel.classList.add('hidden');
        discountsPanel.classList.add('hidden');
        pricesBtn.classList.remove('active');
        promosBtn.classList.remove('active');
        discountsBtn.classList.remove('active');

        if (tab === 'prices') {
            pricesPanel.classList.remove('hidden');
            pricesBtn.classList.add('active');
        } else if (tab === 'promos') {
            promosPanel.classList.remove('hidden');
            promosBtn.classList.add('active');
        } else if (tab === 'discounts') {
            discountsPanel.classList.remove('hidden');
            discountsBtn.classList.add('active');
        }
    };

    function initApp() {
        // Кнопка "Цены и акции" видна только администратору
        const pricingAdminBtn = document.getElementById('pricingAdminBtn');
        if (pricingAdminBtn) {
            if (localStorage.getItem('tetysUser') === 'admin') {
                pricingAdminBtn.classList.remove('hidden');
                pricingAdminBtn.classList.add('flex');
                pricingAdminBtn.addEventListener('click', window.openPricingAdminModal);
            } else {
                pricingAdminBtn.classList.add('hidden');
            }
        }

        const draft = localStorage.getItem('tetisBluDraft');
        if (draft) {
            try {
                const data = JSON.parse(draft);
                if (visitDateInput && data.visitDate) visitDateInput.value = data.visitDate;
                if (clientTypeInput && data.clientType) clientTypeInput.value = data.clientType;
                if (tariffTypeInput && data.tariffType) tariffTypeInput.value = data.tariffType;
                if (data.currentCalcMode) currentCalcMode = data.currentCalcMode;
                if (data.quickCounts) {
                    Object.assign(quickCounts, data.quickCounts);
                }
                if (data.quickStatuses) {
                    Object.assign(quickStatuses, data.quickStatuses);
                }
                if (promoInput && data.promo) promoInput.value = data.promo;
                if (commentInput && data.comment) commentInput.value = data.comment;

                if (data.tourists && Array.isArray(data.tourists)) {
                    tourists = data.tourists;
                }
            } catch (e) {
                console.error("Error parsing draft:", e);
            }
        }

        if (tourists.length === 0) {
            addTourist();
        }

        switchCalcMode(currentCalcMode);
        checkNewRequests();
        updateDashboardTopStats();
    }

    function startLiveClock() {
        const clockEl = document.getElementById('liveClockDisplay');
        if (!clockEl) return;

        function update() {
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            clockEl.textContent = `${dateStr} | ${timeStr}`;
        }

        update();
        setInterval(update, 1000);
    }

    // Инициализация при загрузке
    await loadRemoteConfig();
    initApp();
    startLiveClock();

});
