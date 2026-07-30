const text = `Баратын күніміз *22.07.26*
Иргареев Туран Жайконсович
29.11.1994
Иргареева Ару Махамбетовна
10.02.1996
Жаксыгереева Акерке Махамбетовна
10.01.1998
НҰРАЗҒАЛИ АЙЫМ ЖАЙҚОНСҚЫЗЫ
20.08.2012`;

function parseBulkText(text) {
    let normalizedText = text;

    normalizedText = normalizedText.replace(/([a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])(\d)/g, '$1 $2');
    normalizedText = normalizedText.replace(/(\b(?:0?[1-9]|[12]\d|3[01]))[\.\-\/\s\,]+(0?[1-9]|1[0-2])[\.\-\/\s\,]+(\d{4}|\d{2})\b/g, '$1.$2.$3');
    
    const mergeRegex = /([a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])\s*[\r\n]+\s*(?=\b(?:0?[1-9]|[12]\d|3[01])[\.\-\/\s\,](?:0?[1-9]|1[0-2])[\.\-\/\s\,](?:\d{4}|\d{2})\b|\b(?:0?[1-9]|[12]\d|3[01])\.(?:0?[1-9]|1[0-2])\d{4}\b|\b(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])(?:\d{4}|\d{2})\b|\b\d{1,2}\s*(?:лет|года?|жас|yo)\b|\b(?:chld|adl|inf|snr|inv|взр|реб|дет|пенс|инв)\b)/gi;
    normalizedText = normalizedText.replace(mergeRegex, '$1 ');

    const dobSplitRegex = /(?:\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s\,])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b)([\.\s\-\/\,]+)(?=[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ])/g;
    normalizedText = normalizedText.replace(dobSplitRegex, '$&\n');
    normalizedText = normalizedText.replace(/(?:^|\n)\s*\d+[\.\)\s\-]+\s*(?=[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\d])/g, '\n');
    
    const lines = normalizedText.split('\n');
    let visitDate = null;
    let tourists = [];
    
    lines.forEach((line, index) => {
        const originalLine = line;
        line = line.trim();
        if (!line) return;

        let tAge = undefined;
        let tYear = undefined;

        const headerDateMatch = line.match(/(?:на\s+|дата\s*посещения\s*|баратын\s*күніміз\s*)?[^\d]*(\d{1,2})[\.\-\/](\d{1,2})(?:[\.\-\/](\d{4}|\d{2}))?/i);
        const headerKeywords = /(?:^|\s)(на|дата|тетис|tour|тур|бронь|заявка|групп[ауы]?|баратын|күні|куни|күніміз|күніне)(?:\s|$|[^a-zA-Zа-яА-ЯёЁәіңғүұқөһ])/i;
        const hasHeaderKeyword = headerKeywords.test(line);
        const isJustDate = /^[^a-zA-Zа-яА-ЯёЁәіңғүұқөһ]*(\d{1,2})[\.\-\/](\d{1,2})(?:[\.\-\/](\d{4}|\d{2}))?[^a-zA-Zа-яА-ЯёЁәіңғүұқөһ]*$/.test(line);
        
        const isHeader = headerDateMatch && (hasHeaderKeyword || (index === 0 && isJustDate));

        if (isHeader && (index === 0 || index === 1 || hasHeaderKeyword)) {
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
            visitDate = `${currentYear}-${month}-${day}`;
            return;
        }

        const dobRegex = /\b(0?[1-9]|[12]\d|3[01])([\.\-\/\s\,])(0?[1-9]|1[0-2])\2(\d{4}|\d{2})\b|\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(\d{4})\b|\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{4}|\d{2})\b/;
        const dobMatch = line.match(dobRegex);
        
        let dobIso = '';
        let matchedStr = '';
        if (dobMatch) {
            matchedStr = dobMatch[0];
            const parts = matchedStr.split(/[\.\-\/\s\,]+/);
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) {
                const yInt = parseInt(year);
                year = (yInt > 50 ? 1900 + yInt : 2000 + yInt).toString();
            }
            dobIso = `${year}-${month}-${day}`;
        }
        
        let namePart = line;
        if (matchedStr) namePart = line.replace(matchedStr, '');
        
        namePart = namePart.replace(/[^a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s\-\']/g, ' ').trim();
        namePart = namePart.replace(/\s+/g, ' ');

        const wordsCount = namePart.split(' ').length;
        const hasDateOrAge = dobIso;
        const isSuspicious = !hasDateOrAge && wordsCount < 2;

        if (namePart.length >= 2 && (!isSuspicious)) {
            tourists.push({ fullName: namePart, dob: dobIso });
        }
    });
    
    console.log("Visit Date:", visitDate);
    console.log("Tourists:", tourists);
}

parseBulkText(text);
