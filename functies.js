export function saveToSessionStorage(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
};

export function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};

export function resetDefaultSettings(obj, arr) {
    let counter = 0;
    for(let i = 1; i <= 5; i++) {
        const datum = document.getElementById(`date${i}`);
        datum.value = obj[i];
        for(let j = 1; j <= 7; j++) {
            const dayElement = document.getElementById(`day-${i}${j}`);
            dayElement.value = arr[counter];
            counter++;
        }
    }
};

export function getSettingsFromSessionStorage(blad, setting) {
    let instellingen;
    try {
        instellingen = JSON.parse(sessionStorage.getItem('standaardInstellingen')) || setting;
    } catch (error) {
        console.error("Failed to parse session storage settings:", error);
        instellingen = setting;
    }

    let instelling = instellingen.find(item => item.pagina === blad);
    if (!instelling) {
        console.warn("No matching instellingen found for tabBlad:", blad);
        return null;
    }
    return {
        selectedPloeg: instelling.ploeg,
        currentMonth: instelling.maand,
        currentYear: instelling.jaar,
    };
};

export function updateSessionStorage(settings, index, key, value, defaultSet) {
    const instellingen = JSON.parse(sessionStorage.getItem(settings)) || defaultSet;
    instellingen[index][key] = value;
    saveToSessionStorage(settings, instellingen);
};

export function getNaamBijSymbool(obj, mark) {
    const shift = obj.find(item => item.symbool === mark);
    return shift ? shift.naam : 'Symbool niet gevonden';
};

export function getDaysSinceStart(date, date0) {
    if (typeof date0 === "string") {
        date0 = new Date(date0);
    }
    const diffTime = date - date0;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};