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

    function getPassengerCategory(age, gender, visitDateStr) {
        if (age === null) return '-';
        const retirementAge = getRetirementAge(gender, visitDateStr);
        if (age >= retirementAge) return 'SNR';
        if (age >= 12) return 'ADL';
        if (age >= 4) return 'CHLD';
        return 'INF';
    }

    function getBasePrice(visitDateStr, clientType, tariffType, passengerCategory, age = null) {
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
        
        let priceCategory = passengerCategory;
        if (passengerCategory === 'SNR') {
            priceCategory = 'ADL';
        } else if (passengerCategory === 'INV') {
            priceCategory = (age !== null && age >= 4 && age < 12) ? 'CHLD' : 'ADL';
        }
        if (!activePeriod[clientType]) return 0;
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

