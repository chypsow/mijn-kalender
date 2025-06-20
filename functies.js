import { DOM, berekenSaldo, defaultSettings, opgenomenVerlofPerPloeg, localStoragePloegen, updateCalendar, getAllValidCells, ploegenGegevens } from "./main.js";
import { tabBlad } from "./componentenMaken.js";
import { makeModalInstellingen, shiftPatroon, startDatums } from "./makeModalSettings.js";
import { makeModalFeestdagen } from "./makeModalHolidays.js";
import { makeModalVakanties } from "./makeModalVakanties.js";
import { makeModalRapport } from "./makeModalRapport.js";

export function updateLocalStorage(obj, defaultSet = null, index, updates = {}) {
    const getObject = JSON.parse(localStorage.getItem(obj)) || defaultSet();
    Object.entries(updates).forEach(([key, value]) => {
        getObject[index][key] = value;
    });
    saveToLocalStorage(obj, getObject);
};

export function getSettingsFromLocalStorage(blad, setting) {
    let instellingen;
    try {
        instellingen = JSON.parse(localStorage.getItem('standaardInstellingen'));
        if (!Array.isArray(instellingen)) throw new Error();
    } catch {
        instellingen = setting();
        saveToLocalStorage('standaardInstellingen', instellingen);
    }

    const instelling = instellingen.find(item => item.pagina === blad);
    if (!instelling) {
        console.warn("No matching instellingen found for tabBlad:", blad);
        return null;
    }
    return {
        selectedPloeg: instelling.ploeg ?? 1,
        currentYear: instelling.jaar,
        currentMonth: instelling.maand ?? 0
    };
}

export function getBeginRechtFromLocalStorage(jaar) {
    const defaultValues = { BV: 0, CS: 0, ADV: 0, BF: 0, AV: 0, HP: 0, Z: 0 };
    let beginrechten = {};

    try {
        beginrechten = JSON.parse(localStorage.getItem('beginrechtVerlof')) || {};
    } catch {
        // If parsing fails, start with empty object
        beginrechten = {};
    }

    if (typeof beginrechten !== 'object' || beginrechten === null) {
        beginrechten = {};
    }

    if (!beginrechten[jaar]) {
        beginrechten[jaar] = { ...defaultValues };
        saveToLocalStorage('beginrechtVerlof', beginrechten);
    }

    // Ensure all keys exist (in case of partial data)
    const beginrecht = { ...defaultValues, ...beginrechten[jaar] };

    return beginrecht;
}

/*export function calculateTotals(obj) {
    return Object.values(obj).reduce((acc, x) => acc + x);
};*/
export function calculateTotals(obj) {
    const values = Object.values(obj);
    // Exclude the last item
    //return values.slice(0, -1).reduce((acc, x) => acc + x, 0);
    return values.reduce((acc, x) => acc + x, 0);
};
export function saveArrayToSessionStorage(key, arr) {
    if (!Array.isArray(arr)) return;

    // Verwijder duplicaten op basis van combinatie van datum en team
    const unique = Array.from(
        new Map(arr.map(item => [`${item.datum}-${item.team}`, item])).values()
    );

    sessionStorage.setItem(key, JSON.stringify(unique));
};

export function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};

export function verwijderVerlofDatum(ploeg, date) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const ploegObj = opgenomenVerlofPerPloeg[ploegKey];
    const yearKey = date.split('/')[2];
    const array = ploegObj[yearKey];
    const filteredArray = array.filter(obj => !(obj.datum === date));
    ploegObj[yearKey] = filteredArray;
    saveToLocalStorage(localStoragePloegen[ploeg], ploegObj);
};

export function voegVerlofDatumToe(ploeg, date, soort) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const ploegObj = opgenomenVerlofPerPloeg[ploegKey];
    const yearKey = date.split('/')[2];
    const array = ploegObj[yearKey];
    if(!array) {
        ploegObj[yearKey] = [];
        return voegVerlofDatumToe(ploeg, date, soort); // Probeer opnieuw met de nieuwe array
    }
    const index = array.findIndex(obj => obj.datum === date);
    if (index === -1) {
        array.push({ datum:date, soort });
    } else if (array[index].soort !== soort) {
        array[index].soort = soort;
    }
    saveToLocalStorage(localStoragePloegen[ploeg], ploegObj);
};

export function modalAfdrukken() {
    document.getElementById("printPreview").classList.add("no-print");
    document.querySelector(".top-secties").classList.add("no-print");
    DOM.calendar.classList.add("no-print");
    window.print();
    // Reset na printen
    setTimeout(() => {
    document.getElementById("printPreview").classList.remove("no-print");
    document.querySelector(".top-secties").classList.remove("no-print");
    DOM.calendar.classList.remove("no-print");
    }, 1000); // wacht even tot printdialoog klaar is
};

export function toggleModal(show, positie = '150px', backgroundColor = '#d1d1d1') {
    if (!show) {
        DOM.modalOverlay.classList.remove('open');
        setTimeout(() => {
            DOM.modalOverlay.style.display = 'none';
            if (backgroundColor !== null) {
                DOM.overlay.style.backgroundColor = ''; // Reset modal background to default
            }
        }, 300);
    } else {
        DOM.modalOverlay.style.display = 'block';
        setTimeout(() => {
            DOM.modalOverlay.classList.add('open');
        }, 10);
        if (backgroundColor !== null) {
            DOM.overlay.style.backgroundColor = backgroundColor; // Set modal background color
        }
    }
    if (DOM.modal) {
        DOM.modal.style.top = positie;
        DOM.modal.style.display = show ? "block" : "none";
    }
};

export function handleClickBtn(e) {
    const btn = e.currentTarget.id; // Gebruik currentTarget om de juiste id op te halen
    switch(btn) {
        case 'instellingen':
            makeModalInstellingen(shiftPatroon, startDatums);
            toggleModal(true);
            break;
        case 'feestdagen':
            makeModalFeestdagen(tabBlad, defaultSettings);
            toggleModal(true);
            break;
        case 'vakanties':
            makeModalVakanties(tabBlad, defaultSettings);
            toggleModal(true);
            break;
        case 'rapport':
            makeModalRapport(tabBlad, defaultSettings);
            //console.log('Rapportknop is aangeklikt');
            toggleModal(true);
            break;
        case 'afdrukken':
            afdrukVoorbereiding();
            window.print();
            updateCalendar();
            break;
        default:
            console.warn('Onbekende knop-id:', btn);
    }
};

function afdrukVoorbereiding() {
    const setting = getSettingsFromLocalStorage(tabBlad, defaultSettings);
    const selectedPloeg = setting.selectedPloeg;
    const year = setting.currentYear;
    const month = setting.currentMonth;
    const monthStr = month ? new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month)): null;
    const afdrukken = document.getElementById("printPreview");
    afdrukken.innerHTML = '';

    const setShiften = new Set(getArrayValues(shiftPatroon));
    const mijnData = ploegenGegevens.filter(item => setShiften.has(item.symbool));
    
    if((tabBlad === 1 || tabBlad === 2) && mijnData.length > 1 ) {
        DOM.topSectie3.classList.remove('no-print');
    } else {
        DOM.topSectie3.classList.add('no-print');
    }
    const lijst = document.createElement('ul');
    lijst.classList.add('print-header');
    
    const jaar = document.createElement('li');
    jaar.textContent = `Jaar: ${year}`;
    lijst.appendChild(jaar);
    
    if (tabBlad === 2 || tabBlad === 3) {
        const maand = document.createElement('li');
        maand.textContent = `Maand: ${monthStr}`;
        lijst.appendChild(maand);
    }
    if (tabBlad !== 3 && mijnData.length > 1 && shiftPatroon.length > 1) {
        const ploeg = document.createElement('li');
        ploeg.textContent = `Ploeg ${selectedPloeg}`;
        lijst.appendChild(ploeg);
    }
    if(tabBlad === 0) {
        const today = getAllValidCells().find(cel => cel.classList.contains('today'));
        if(today) today.classList.remove('today');
    }
    afdrukken.appendChild(lijst);
}

export function beginSaldoEnRestSaldoInvullen(year, ploeg) {
    const beginrechtVerlof = getBeginRechtFromLocalStorage(year);
    const aantalZ = beginrechtVerlof.Z || 0;
    delete beginrechtVerlof.Z; // Verwijder Z uit beginrechtVerlof, want die wordt apart behandeld
    const saldoArray = berekenSaldo(year,ploeg);
    const saldoZ = saldoArray.Z || 0;
    delete saldoArray.Z; // Verwijder Z uit saldoArray, want die wordt apart behandeld
    Object.entries(beginrechtVerlof).forEach(([verlof,aantal]) => {
        const elt = document.getElementById(verlof);
        if(elt) {
            elt.value = aantal;
            //elt.textContent = aantal;
        }
    });
    const beginrechtZElt = document.getElementById('Z');
    if(beginrechtZElt) {
        beginrechtZElt.value = aantalZ;
        //beginrechtZElt.textContent = aantalZ;
    }
    const beginrechtTotaal = calculateTotals(beginrechtVerlof);
    const beginrechtElt = document.getElementById('totaalBeginrecht');
    beginrechtElt.textContent = ` ${beginrechtTotaal}`;
    //beginrechtElt.style.color = beginrechtTotaal > 0 ? 'green' : 'red';
    //beginrechtElt.style.fontWeight = beginrechtTotaal > 0 ? 'bold' : 'normal';
    Object.entries(saldoArray).forEach(([verlof,aantal]) => {
        const elt = document.getElementById(`saldo-${verlof}`);
        elt.textContent = aantal;
    });
    const saldoTotaal = calculateTotals(saldoArray);
    document.getElementById('totaalSaldo').textContent = ` ${saldoTotaal}`;
    //document.getElementById('totaalSaldo').style.color = saldoTotaal > 0 ? 'green' : 'red';
    //document.getElementById('totaalSaldo').style.fontWeight = saldoTotaal > 0 ? 'bold' : 'normal';
    const saldoZElt = document.getElementById('saldo-Z');
    if(saldoZElt) {
        saldoZElt.textContent = saldoZ;
    }
};

export const getArrayValues = (obj) => {
    let output = [];
    obj.forEach( week => {
        const shiftsArray = [...week.schema];
        output.push(shiftsArray);
    });
    return output.flat();
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
