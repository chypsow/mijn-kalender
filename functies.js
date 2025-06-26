import { DOM, updateCalendar, getAllValidCells } from "./main.js";
import { activeBlad } from "./componentenMaken.js";
import { makeModalInstellingen, shiftPatroon, startDatums, ploegenGegevens } from "./makeModalSettings.js";
import { makeModalFeestdagen } from "./makeModalHolidays.js";
import { makeModalVakanties } from "./makeModalVakanties.js";
import { makeModalRapport } from "./makeModalRapport.js";

export function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
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

export function updateLocalStorage(obj, defaultSet = null, index, updates = {}) {
    const getObject = JSON.parse(localStorage.getItem(obj)) || defaultSet();
    Object.entries(updates).forEach(([key, value]) => {
        getObject[index][key] = value;
    });
    saveToLocalStorage(obj, getObject);
};

export function updateBeginRechtVerlof(jaar, updates = {}) {
    // Haal alle beginrechten op uit localStorage
    let alleBeginrechten = {};
    try {
        alleBeginrechten = JSON.parse(localStorage.getItem('beginrechtVerlof')) || {};
    } catch {
        alleBeginrechten = {};
    }
    // Haal bestaande rechten voor het jaar op, of gebruik defaults
    const beginrechten = getBeginRechtFromLocalStorage(jaar);
    // Merge updates met bestaande rechten
    const newBeginrechten = { ...beginrechten, ...updates };
    // Update alleen het geselecteerde jaar
    alleBeginrechten[jaar] = newBeginrechten;
    // Sla alles terug op
    //check if all key values are 0
    const allZero = Object.values(newBeginrechten).every(value => value === 0);
    if (allZero) {
        delete alleBeginrechten[jaar]; // Verwijder het jaar als alle waarden 0 zijn
    }
    // check if alleBeginrechten is empty
    if (Object.keys(alleBeginrechten).length === 0) {
        localStorage.removeItem('beginrechtVerlof'); // Verwijder de key als er geen rechten zijn
        return;
    }
    localStorage.setItem('beginrechtVerlof', JSON.stringify(alleBeginrechten));
};

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
    }

    // Ensure all keys exist (in case of partial data)
    const beginrecht = { ...defaultValues, ...beginrechten[jaar] };  // Merge with default values
    return beginrecht;
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
        console.warn("No matching instellingen found for activeBlad:", blad);
        return null;
    }
    return {
        selectedPloeg: instelling.ploeg ?? 1,
        currentYear: instelling.jaar,
        currentMonth: instelling.maand ?? 0
    };
};

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

export function toggleModal(show , positie = '50px', backgroundColor = '#d1d1d1') {
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
            toggleModal(true, '10px', '#d1d1d1');  // Zet de achtergrondkleur van de modal
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
    if (activeBlad !== 3 && mijnData.length > 1 && shiftPatroon.length > 1) {
        const ploeg = document.createElement('li');
        ploeg.textContent = `Ploeg ${selectedPloeg}`;
        lijst.appendChild(ploeg);
    }
    if(activeBlad === 0) {
        const today = getAllValidCells().find(cel => cel.classList.contains('today'));
        if(today) today.classList.remove('today');
    }
    afdrukken.appendChild(lijst);
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
