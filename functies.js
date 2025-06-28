import { DOM, updateCalendar } from "./main.js";
import { activeBlad } from "./componentenMaken.js";
import { makeModalInstellingen, shiftPatroon, startDatums, ploegenGegevens } from "./makeModalSettings.js";
import { makeModalFeestdagen } from "./makeModalHolidays.js";
import { makeModalVakanties } from "./makeModalVakanties.js";
import { makeModalRapport } from "./makeModalRapport.js";

export function updateBeginrechtVerlofLocalStorage(jaar, updates = {}) {
    let alleBeginrechten = {};
    try {
        alleBeginrechten = JSON.parse(localStorage.getItem('beginrechtVerlof')) || {};
    } catch {
        alleBeginrechten = {};
    }
    const beginrechten = getBeginRechtFromLocalStorage(jaar);
    const newBeginrechten = { ...beginrechten, ...updates }; // Merge updates met bestaande rechten
    alleBeginrechten[jaar] = newBeginrechten;
    const allZero = Object.values(newBeginrechten).every(value => value === 0);
    if (allZero) {
        delete alleBeginrechten[jaar];
    }
    if (Object.keys(alleBeginrechten).length === 0) {
        localStorage.removeItem('beginrechtVerlof');
        return;
    }
    saveToLocalStorage('beginrechtVerlof', alleBeginrechten);
};

export function updatePaginaInstLocalStorage(obj, defaultSet = null, index, updates = {}) {
    const getObject = JSON.parse(localStorage.getItem(obj)) || defaultSet();
    Object.entries(updates).forEach(([key, value]) => {
        getObject[index][key] = value;
    });
    saveToLocalStorage(obj, getObject);
};


export function getBeginRechtFromLocalStorage(jaar) {
    const defaultValues = { BV: 0, CS: 0, ADV: 0, BF: 0, AV: 0, HP: 0, Z: 0 };
    let beginrechten = {};

    try {
        beginrechten = JSON.parse(localStorage.getItem('beginrechtVerlof')) || {};
    } catch {
        beginrechten = {};
    }

    if (typeof beginrechten !== 'object' || beginrechten === null) {
        beginrechten = {};
    }

    if (!beginrechten[jaar]) {
        beginrechten[jaar] = { ...defaultValues };
    }

    const beginrecht = { ...defaultValues, ...beginrechten[jaar] };  // Merge with default values
    return beginrecht;
};
  
export function getSettingsFromLocalStorage(blad, setting) {
    let instellingen;
    try {
        instellingen = JSON.parse(localStorage.getItem('paginaInstellingen'));
        if (!Array.isArray(instellingen)) throw new Error();
    } catch {
        instellingen = setting();
        saveToLocalStorage('paginaInstellingen', instellingen);
    }

    const instelling = instellingen.find(item => item.pagina === blad);
    if (!instelling) {
        console.warn("No matching instellingen found for activeBlad:", blad);
        return null;
    }
    return {
        selectedPloeg: instelling.ploeg ?? 1,
        currentYear: instelling.jaar,
        currentMonth: instelling.maand ?? 0
    };
};

export function toggleModal(show = false, positie = '50px', backgroundColor = '#d1d1d1') {
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
            makeModalFeestdagen(activeBlad, defaultSettings);
            toggleModal(true);
            break;
        case 'vakanties':
            makeModalVakanties(activeBlad, defaultSettings);
            toggleModal(true);
            break;
        case 'rapport':
            makeModalRapport(activeBlad, defaultSettings);
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
    const setting = getSettingsFromLocalStorage(activeBlad, defaultSettings);
    const selectedPloeg = setting.selectedPloeg;
    const year = setting.currentYear;
    const month = setting.currentMonth;
    const monthStr = month ? new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month)): null;
    const afdrukken = document.getElementById("printPreview");
    afdrukken.innerHTML = '';

    const setShiften = new Set(getArrayValues(shiftPatroon));
    const mijnData = ploegenGegevens.filter(item => setShiften.has(item.symbool));
    
    if((activeBlad === 1 || activeBlad === 2) && mijnData.length > 1 ) {
        DOM.topSectie3.classList.remove('no-print');
    } else {
        DOM.topSectie3.classList.add('no-print');
    }
    const lijst = document.createElement('ul');
    lijst.classList.add('print-header');
    
    const jaar = document.createElement('li');
    jaar.textContent = `Jaar: ${year}`;
    lijst.appendChild(jaar);
    
    if (activeBlad === 2 || activeBlad === 3) {
        const maand = document.createElement('li');
        maand.textContent = `Maand: ${monthStr}`;
        lijst.appendChild(maand);
    }
    if (activeBlad !== 3 && mijnData.length > 1 && startDatums.length > 1) {
        const ploeg = document.createElement('li');
        ploeg.textContent = `Ploeg ${selectedPloeg}`;
        lijst.appendChild(ploeg);
    }
    afdrukken.appendChild(lijst);
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

export const defaultSettings = () => {
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    return [
        {pagina: 0, ploeg: 1, jaar: currentYear},
        {pagina: 1, ploeg: 1, jaar: currentYear},
        {pagina: 2, ploeg: 1, jaar: currentYear, maand: currentMonth},
        {pagina: 3, jaar: currentYear, maand: currentMonth}
    ];
};

export function calculateTotals(obj) {
    const values = Object.values(obj);
    return values.reduce((acc, x) => acc + x, 0);
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

export function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};

export function saveArrayToSessionStorage(key, arr) {
    if (!Array.isArray(arr)) return;

    // Verwijder duplicaten op basis van combinatie van datum en team
    const unique = Array.from(new Map(arr.map(item => [`${item.datum}-${item.team}`, item])).values());
    sessionStorage.setItem(key, JSON.stringify(unique));
};
