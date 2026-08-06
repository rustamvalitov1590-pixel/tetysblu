window.showToast = function (message, icon = '', bgColor = 'bg-blue-600') {
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

function transliterate(text) {
    if (!text) return '';
    return text.split('').map(char => cyrillicToLatinMap[char] !== undefined ? cyrillicToLatinMap[char] : char.toUpperCase()).join('');
}

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

function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
}

window.showToast = function (message, icon = 'fa-check', bgClass = 'bg-[#1ebd5a]') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${bgClass} text-white px-5 py-3 rounded-2xl shadow-xl flex items-center font-bold text-sm`;
    toast.innerHTML = `<i class="fa-solid ${icon} mr-2.5 text-lg"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
};

