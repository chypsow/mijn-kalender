import { beginrechtVerlof, berekenSaldo, defaultSettings, startDates, shiftPattern } from "./main.js";
import { tabBlad } from "./componentenMaken.js";
import { makeModalInstellingen } from "./makeModalSettings.js";
import { makeModalFeestdagen } from "./makeModalHolidays.js";


export function handleClickBtn(e) {
    const btn = e.currentTarget.id; // Gebruik currentTarget om de juiste id op te halen
    switch(btn) {
        case 'instellingen':
            makeModalInstellingen(startDates, shiftPattern);
            break;
        case 'feestdagen':
            makeModalFeestdagen(tabBlad, defaultSettings);
            break;
        case 'vakanties':
            console.log('vakantieknop is aangeklikt');
            break;
        case 'rapport':
            console.log('Rapportknop is aangeklikt');
            break;
        case 'afdrukken':
            console.log('Afdrukknop is aangeklikt');
            break;
        default:
            console.warn('Onbekende knop-id:', btn);
    }
};

export function handleBlur(e) {
    const verlof = e.target.id;
    const aantal = parseInt(e.target.value);
    behandelenRechtEnSaldoVerlofdagen(verlof, aantal);
};

function behandelenRechtEnSaldoVerlofdagen(verlof, aantal) {
    //if(verlof === "Z") return;
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const totaal1 = document.getElementById('totaalBeginrecht');
    const totaal2 = document.getElementById('totaalSaldo');
    const mySaldoElt = document.getElementById(`saldo-${verlof}`);
    const saldoOud = parseInt(mySaldoElt.textContent.trim());
    
    beginrechtVerlof[verlof] = aantal;
    saveToLocalStorage('beginrechtVerlof', beginrechtVerlof);
    const saldoNieuw = berekenSaldo(selectedPloeg, verlof);

    totaal1.textContent = ` ${calculateTotals(beginrechtVerlof)}`;
    mySaldoElt.textContent = saldoNieuw;
    totaal2.textContent = ` ${parseInt(totaal2.textContent.trim()) - saldoOud + saldoNieuw}`;
    
    //console.log(`oude saldo: ${saldoOud}`);
    //console.log(`nieuwe saldo: ${saldoNieuw}`);
    //console.log(`beginrecht verlofdagen: ${JSON.stringify(beginrechtVerlof, null, 2)}`);
    //console.log(`Totaal beginrecht: ${calculateTotals(beginrechtVerlof)}`);
};
export function behandelenSaldoVerlofdagen(verlof, oud) {
    const verlofdagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP'];
    const totaal2 = document.getElementById('totaalSaldo');
    const totaalSaldo = parseInt(totaal2.textContent.trim());
    if(verlof === "Z") {
        if(verlofdagen.includes(oud)) {
        const saldoElt2 = document.getElementById(`saldo-${oud}`);
        saldoElt2.textContent = parseInt(saldoElt2.textContent) + 1;
        totaal2.textContent = ` ${totaalSaldo + 1}`;
        }
        return;
    }
    const saldoElt1 = document.getElementById(`saldo-${verlof}`);
    //const beginrecht = document.getElementById(verlof);
    const saldoOud = parseInt(saldoElt1.textContent);
    //const saldoNieuw = saldoOud--;
    saldoElt1.textContent = saldoOud - 1;
    if(verlofdagen.includes(oud)) {
        const saldoElt2 = document.getElementById(`saldo-${oud}`);
        saldoElt2.textContent = parseInt(saldoElt2.textContent) + 1;
    } else {
        totaal2.textContent = ` ${totaalSaldo - 1}`;
    }

    //console.log(`opgenomen: ${verlof}, oude saldo: ${saldoOud}, nieuwe saldo: ${saldoElt1.textContent}`);
}
export function behandelenRechtEnSaldoVerlofdagenNaTerugstellen(verlof) {
    if(verlof === "Z") return;
    const totaal2 = document.getElementById('totaalSaldo');
    const saldoElt = document.getElementById(`saldo-${verlof}`);
    saldoElt.textContent = parseInt(saldoElt.textContent) + 1;
    const totaalSaldo = parseInt(totaal2.textContent.trim());
    totaal2.textContent = ` ${totaalSaldo + 1}`;
}
export function behandelenNaAllesTerugstellen(ploeg) {
    const saldoArray = berekenSaldo(ploeg);
    Object.entries(saldoArray).forEach(([verlof,aantal]) => {
        const elt = document.getElementById(`saldo-${verlof}`);
        elt.textContent = aantal;
    });
    const saldoTotaal = calculateTotals(saldoArray);
    document.getElementById('totaalSaldo').textContent = ` ${saldoTotaal}`;
}

export function calculateTotals(obj) {
    return Object.values(obj).reduce((acc, x) => acc + x);
};

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

export function getSettingsFromLocalStorage(blad, setting) {
    let instellingen;
    try {
        instellingen = JSON.parse(localStorage.getItem('standaardInstellingen')) || setting;
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

export function updateLocalStorage(settings, index, key, value, defaultSet) {
    const instellingen = JSON.parse(localStorage.getItem(settings)) || defaultSet;
    instellingen[index][key] = value;
    saveToLocalStorage(settings, instellingen);
};

export function getNaamBijSymbool(obj, mark) {
    const shift = obj.find(item => item.symbool === mark);
    return shift ? shift.naam : 'Symbool-niet-gevonden';
};

export function getDaysSinceStart(date, date0) {
    if (typeof date0 === "string") {
        date0 = new Date(date0);
    }
    const diffTime = date - date0;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};
