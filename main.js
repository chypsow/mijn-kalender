import { generateTeamCalendar, updateTeamCalendar } from './teamKalender.js';
import { generateYearCalendar, updateYearCalendarGrid } from './jaarKalenderGrid.js';
import { generateYearCalendarTable, updateYearCalendarTable, } from './jaarKalenderTable.js';
import { generateMonthCalendar, updateMonthCalendar } from './maandKalender.js';
import { toggleModal, getSettingsFromLocalStorage, saveToLocalStorage, saveArrayToSessionStorage, adjustLayout, getBeginRechtFromLocalStorage} from './functies.js';
import { tabBlad, buildSideBar, buildTeamDropdown, buildButtons, maakPloegenLegende, maakDropdowns, maakVerlofContainer, maakVerlofLegende } from './componentenMaken.js';
import { dataVerlofdagen, dataBeginRecht, dataShift } from "./config.js";

// default settings
const week1 = ['N', 'N', 'N', 'x', 'x', 'V', 'V12'];
const week2 = ['L', 'L', 'x', 'N', 'N', 'N', 'N12'];
const week3 = ['x', 'x', 'L', 'L', 'L', 'L', 'x'];
const week4 = ['V', 'V', 'V', 'V', 'V', 'x', 'x'];
const week5 = ['D', 'D', 'D', 'D', 'D', 'x', 'x'];
export const ploegSchema = [...week1, ...week2, ...week3, ...week4, ...week5];
export const startDatums = {
    1: "2010-02-01", 
    2: "2010-01-18", 
    3: "2010-01-25", 
    4: "2010-01-04", 
    5: "2010-01-11"
};
export let shiftPattern = JSON.parse(localStorage.getItem("shiftPattern")) || ploegSchema;
export let startDates = JSON.parse(localStorage.getItem("startDates")) || startDatums;
export const ploegenGegevens = [
    {symbool:'N12', naam:'nacht-12u', kleur:'#0158bb'},
    {symbool:'N', naam:'nacht', kleur:'#4a91e2'},
    {symbool:'V12', naam:'vroege-12u', kleur:'#bb4b00'},
    {symbool:'V', naam:'vroege', kleur:'#ff8331d3'},
    {symbool:'L', naam:'late', kleur:'#4c9182cb'},
    {symbool:'D', naam:'dag', kleur:'#949494'},
    {symbool:'x', naam:'thuis', kleur:'#cfcfcf'},
    {symbool:'OPL', naam:'opleiding', kleur:'red'}
];
//export const shiftData = JSON.parse(localStorage.getItem("shiftData")) || shiftData; 

export const defaultSettings = () => {
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    return [
        {pagina: 0, ploeg: 1, jaar: currentYear},
        {pagina: 1, ploeg: 1, jaar: currentYear},
        {pagina: 2, ploeg: 1, maand: currentMonth, jaar: currentYear},
        {pagina: 3, ploeg: 1, maand: currentMonth, jaar: currentYear}
    ];
};
  
export const opgenomenVerlofPerPloeg = {
    verlofdagenPloeg1: JSON.parse(localStorage.getItem('verlofdagenPloeg1')) || [],
    verlofdagenPloeg2: JSON.parse(localStorage.getItem('verlofdagenPloeg2')) || [],
    verlofdagenPloeg3: JSON.parse(localStorage.getItem('verlofdagenPloeg3')) || [],
    verlofdagenPloeg4: JSON.parse(localStorage.getItem('verlofdagenPloeg4')) || [],
    verlofdagenPloeg5: JSON.parse(localStorage.getItem('verlofdagenPloeg5')) || []
};
export const localStoragePloegen = {
    1: 'verlofdagenPloeg1',
    2: 'verlofdagenPloeg2',
    3: 'verlofdagenPloeg3',
    4: 'verlofdagenPloeg4',
    5: 'verlofdagenPloeg5'
};

export const gegevensOpslaan = (cyclus, datums, bevestiging = true) => {
    shiftPattern = cyclus;
    startDates = datums;
    saveToLocalStorage('shiftPattern', cyclus);
    saveToLocalStorage('startDates', datums);
    if(bevestiging) alert("Wijzigingen succesvol opgeslagen!");
    updateCalendar();
};

function savePloegenToLocalStorage() {
    Object.values(localStoragePloegen).forEach((ploeg, index) => {
        const ploegKey = ploeg;
        saveToLocalStorage(`verlofdagenPloeg${index+1}`, opgenomenVerlofPerPloeg[ploegKey]);
    });
};

export const berekenSaldo = (ploeg, key = null) => {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const vacations = opgenomenVerlofPerPloeg[ploegKey];
    const currentYear = getSettingsFromLocalStorage(tabBlad, defaultSettings).currentYear;
    const beginrechtVerlof = getBeginRechtFromLocalStorage(currentYear);
    const vacationsCurrentYear = vacations.filter(obj => {
        const year = parseInt(obj.datum.split('/')[2]);
        return year === currentYear;
    });
    if (vacationsCurrentYear.length === 0) {
        return key ? beginrechtVerlof[key] : beginrechtVerlof;
    }

    const calculateSaldo = (verlofKey) => {
        const opgenomen = vacationsCurrentYear.filter(obj => obj.soort === verlofKey).length;
        return beginrechtVerlof[verlofKey] - opgenomen;
    };
    if (key) {
        return calculateSaldo(key);
    }
    const saldo = {};
    Object.keys(beginrechtVerlof).forEach(verlofKey => {
        saldo[verlofKey] = calculateSaldo(verlofKey);
    });
    return saldo;
};

export const DOM = {
    monthYear: document.getElementById('month-year'),
    monthSelect: document.getElementById("month-select"),
    yearSelect: document.getElementById("year-select"),
    prev: document.getElementById('prev'),
    next: document.getElementById('next'),
    selectOverlay: document.getElementById('select-overlay'),
    dropdowns: document.getElementById("dropdowns"),
    topNav: document.getElementById("top-nav"),
    container: document.getElementById('calendar-container'),
    buttonContainer: document.getElementById('buttons-container'),
    middenSectie2: document.getElementById('midden-sectie2'),
    topSectie3: document.getElementById('top-sectie3'),
    ploeg: document.getElementById('ploeg'),
    titel: document.getElementById('titel'),
    calendar: document.getElementById('calendar'),
    modalOverlay: document.getElementById("modal-overlay"),
    modal: document.getElementById("modal"),
    overlay: document.getElementById('overlay'),
    sluiten: document.getElementById('sluiten')
};

export function generateCalendar() {
    if (calendarGenerators[tabBlad]) {
        const settings = getSettingsFromLocalStorage(tabBlad, defaultSettings);
        const currentMonth = settings.currentMonth ? settings.currentMonth : null;
        const currentYear = settings.currentYear;
        const selectedPloeg = settings.selectedPloeg;
        DOM.ploeg.value = selectedPloeg;
        if(tabBlad === 0 || tabBlad === 1) calendarGenerators[tabBlad](selectedPloeg, currentYear);
        if(tabBlad === 2) calendarGenerators[tabBlad](selectedPloeg, currentYear, currentMonth);
        if(tabBlad ===  3) calendarGenerators[tabBlad](currentYear, currentMonth);
        refreshCalendar();
        adjustLayout();
    } else {
        console.error(`Geen kalendergenerator gevonden voor blad: ${tabBlad}`);
    }
};
const calendarGenerators = {
    0: (team, year) => {
        emptyMiddenSecties();
        DOM.ploeg.hidden = false;
        maakVerlofContainer();
        maakVerlofLegende();
        document.getElementById('rapport').hidden = false;
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container-table';
        DOM.calendar.className = 'year-calendar-table';
        generateYearCalendarTable(team, year);
    },
    1: (team, year) => {
        emptyMiddenSecties();
        DOM.ploeg.hidden = false;
        maakPloegenLegende();
        document.getElementById('rapport').hidden = true;
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container-grid';
        DOM.calendar.className = 'year-calendar-grid';
        generateYearCalendar(team, year);
    },
    2: (team, year, month) => {
        emptyMiddenSecties();
        DOM.ploeg.hidden = false;
        maakPloegenLegende();
        document.getElementById('rapport').hidden = true;
        DOM.titel.textContent = 'Maandkalender';
        DOM.container.className = 'month-container';
        DOM.calendar.className = 'month-calendar';
        generateMonthCalendar(team, year, month);
    },
    3: (year, month) => {
        emptyMiddenSecties();
        document.getElementById('rapport').hidden = true;
        DOM.titel.textContent = 'Teamkalender';
        DOM.container.className = 'team-container';
        DOM.calendar.className = 'team-calendar-table';
        generateTeamCalendar(year, month);
    }
};

function emptyMiddenSecties() {
    DOM.middenSectie2.innerHTML = '';
    DOM.topSectie3.innerHTML = '';
    DOM.topSectie3.className = '';
    DOM.topSectie3.classList.add('hidden-on-small');
    DOM.titel.textContent = '';
    DOM.container.className = '';
    DOM.calendar.className = '';
    DOM.ploeg.hidden = true;
};
function refreshCalendar() {
    // Reset de animatie door de klasse te verwijderen en opnieuw toe te voegen
    DOM.calendar.classList.remove("fade-animation");
    void DOM.calendar.offsetWidth; // Forceer een reflow (truc om animatie te resetten)
    DOM.calendar.classList.add("fade-animation");
};
export const updateCalendar = () => {
    const setting = getSettingsFromLocalStorage(tabBlad, defaultSettings);
    const team = setting.selectedPloeg;
    const year = setting.currentYear;
    const month = setting.currentMonth;
    switch (tabBlad) {
        case 0:
            updateYearCalendarTable(team, year);
            break;
        case 1:
            updateYearCalendarGrid(team, year);
            break;
        case 2:
            updateMonthCalendar(team, year,month);
            break;
        case 3:
            updateTeamCalendar(year, month);
    }
};

function updateLocalStorage(settings, defaultSet = null, index, updates = {}) {
    const instellingen = JSON.parse(localStorage.getItem(settings)) || defaultSet();
    Object.entries(updates).forEach(([key, value]) => {
        instellingen[index][key] = value;
    });
    saveToLocalStorage(settings, instellingen);
}
function triggerPrev() {
    let currentMonth = 0;
    let currentYear = 0;
    const settings = getSettingsFromLocalStorage(tabBlad, defaultSettings);
    if (settings) {
        currentMonth = settings.currentMonth;
        currentYear = settings.currentYear;
    }
    if(tabBlad === 2 || tabBlad === 3) {
        currentMonth = (currentMonth - 1 + 12) % 12;
        if (currentMonth === 11) currentYear -= 1;
    } else {
        currentYear -= 1;
    }
    updateLocalStorage('standaardInstellingen', defaultSettings, tabBlad, {maand:currentMonth, jaar:currentYear});
    updateCalendar();
};
function triggerNext() {
    let currentMonth = 0;
    let currentYear = 0;
    const settings = getSettingsFromLocalStorage(tabBlad, defaultSettings);
    if (settings) {
        currentMonth = settings.currentMonth;
        currentYear = settings.currentYear;
    }
    if(tabBlad === 2 || tabBlad === 3) {
        currentMonth = (currentMonth + 1) % 12;
        if (currentMonth === 0) currentYear += 1;
    } else {
        currentYear += 1;
    }
    updateLocalStorage('standaardInstellingen', defaultSettings, tabBlad, {maand:currentMonth, jaar:currentYear});
    updateCalendar();
};
DOM.sluiten.addEventListener('click', () => toggleModal(false));

DOM.ploeg.addEventListener('change', (event) => {
    const selectedPloeg = Number(event.target.value); 
    updateLocalStorage('standaardInstellingen', defaultSettings, tabBlad, {ploeg:selectedPloeg});
    updateCalendar();
});

DOM.prev.addEventListener("click", triggerPrev);
DOM.next.addEventListener("click", triggerNext);
DOM.monthSelect.addEventListener("change", (event) => {
    const currentMonth = parseInt(event.target.value, 10);
    updateLocalStorage('standaardInstellingen', defaultSettings, tabBlad, {maand:currentMonth});
    updateCalendar();
});
DOM.yearSelect.addEventListener("change", (event) => {
    const currentYear = parseInt(event.target.value, 10);
    updateLocalStorage('standaardInstellingen', defaultSettings, tabBlad, {jaar:currentYear});
    updateCalendar();
});
DOM.monthYear.addEventListener("click", () => {
    DOM.monthYear.style.color = 'transparent';
    const rect = DOM.monthYear.getBoundingClientRect();
    DOM.dropdowns.style.top = `${rect.top + window.scrollY - 10}px`;
    DOM.dropdowns.style.left = `${rect.left + window.scrollX + Math.round(rect.width/2 - DOM.dropdowns.style.width/2)}px`;
    DOM.selectOverlay.style.display = 'block';
    maakDropdowns();
    DOM.dropdowns.classList.toggle("visible");
    if(tabBlad === 2 || tabBlad === 3) {
        DOM.monthSelect.classList.toggle("visible");
    }
    DOM.yearSelect.classList.toggle('visible');
});

// Event listeners voor het selecteren van cellen
let isSelecting = false;
let selectionStart = null; // zoals ActiveCell in excel
let previousSelectedCells = [];
let selectedCells = JSON.parse(sessionStorage.getItem("selectedCells")) || [];

document.addEventListener("mousedown", (event) => {
    if (tabBlad !== 0) return;
    if (!event.target.classList.contains("cell")) return;
    const datum = event.target.dataset.datum;
    if (!datum) return;

    const cell = event.target;
    const team = getCurrentTeam();

    isSelecting = true;
    selectionStart = datum;
    previousSelectedCells = [...selectedCells]; // Bewaar de laatst geselecteerde cel

    if (!event.ctrlKey) {
        clearAllHighlights();
        selectedCells = [{datum, team}];
        cell.classList.add("highlight");
        //console.log("mousedown- selectedCells length: ", selectedCells.length);
        //console.log("mousedown- selectedCells : ", selectedCells[0].datum);
    } else {
        const existingCell = previousSelectedCells.find(c => c.datum === datum && c.team === team);
        if (existingCell) {
            // Als de cel al geselecteerd is, deselecteer deze
            selectedCells = selectedCells.filter(c => !(c.datum === datum && c.team === team));
            cell.classList.remove("highlight");
            //console.log("mousedown+ctrl- deselected cell: ", datum);
        } else {
            // Als de cel nog niet geselecteerd is, selecteer deze
            if (!cell.classList.contains("highlight")) {
                cell.classList.add("highlight");
            }
            selectedCells.push({ datum, team });
        }
        
        //event.target.classList.add('highlight');
        //console.log("mousedown+ctrl- selectedCells length: ", selectedCells.length);
    }
    
});

document.addEventListener("mouseover", (event) => {
    if (!isSelecting) return;
    if (!event.target.classList.contains("cell")) return;

    const endCell = event.target;
    const datum = endCell.dataset.datum;
    const team = getCurrentTeam();

    const endRij = parseInt(endCell.dataset.rij);
    const endKolom = parseInt(endCell.dataset.kolom);

    const startCell = document.querySelector(`.cell[data-datum='${selectionStart}']`);
    if (!startCell) return;

    const startRij = parseInt(startCell.dataset.rij);
    const startKolom = parseInt(startCell.dataset.kolom);

    const [minRij, maxRij] = [startRij, endRij].sort((a, b) => a - b);
    const [minKolom, maxKolom] = [startKolom, endKolom].sort((a, b) => a - b);
    const allCells = getAllValidCells();

    if(event.shiftKey) {
        //console.log("Shift ingedrukt, selectie uitbreiden");
        const startIndex = allCells.findIndex(c => c.dataset.datum === selectionStart);
        const endIndex = allCells.findIndex(c => c.dataset.datum === datum);
        if (startIndex === -1 || endIndex === -1) return;
        const [from, to] = [startIndex, endIndex].sort((a, b) => a - b);

        clearAllHighlights();
        selectedCells = [];

        for (let i = from; i <= to; i++) {
            const cel = allCells[i];
            if (!cel.classList.contains("highlight")) {
                cel.classList.add("highlight");
            }

            if (!selectedCells.some(c => c.datum === cel.dataset.datum && c.team === team)) {
                selectedCells.push({ datum: cel.dataset.datum, team });
            }
        }
        return;
    }

    if (!event.ctrlKey) {
        clearAllHighlights();
        selectedCells = [];
    }

    for (const cell of allCells) {
        const rij = parseInt(cell.dataset.rij);
        const kolom = parseInt(cell.dataset.kolom);

        if (rij >= minRij && rij <= maxRij && kolom >= minKolom && kolom <= maxKolom) {
            const datum = cell.dataset.datum;

            cell.classList.add("highlight");

            if (!selectedCells.some(c => c.datum === datum && c.team === team)) {
                selectedCells.push({ datum, team });
            }
        }
    }
});

document.addEventListener("mouseup", (event) => {
    isSelecting = false;

    const target = event.target;
    
    if (previousSelectedCells.length === 1 && target.classList.contains("highlight")) {
        const clickedDatum = target.dataset.datum;
        const clickedTeam = getCurrentTeam();

        const selected = previousSelectedCells[0];
        if (selected.datum === clickedDatum && selected.team === clickedTeam) {
            //console.log("same Selectedcell mouseup: ", previousSelectedCells[0].datum);
            selectedCells.length = 0; // Leegmaken
            target.classList.remove("highlight");
        }
    }
   
    saveArrayToSessionStorage("selectedCells", selectedCells);

    if (selectedCells.length > 0) {
        sessionStorage.setItem("lastSelectedCell", JSON.stringify(selectedCells[selectedCells.length - 1]));
    }
});

export function getAllValidCells() {
    return Array.from(DOM.calendar.querySelectorAll(".cell[data-datum]"))
        .filter(cell => cell.dataset.datum);
}

function clearAllHighlights() {
    const allCells = getAllValidCells();
    allCells.forEach(cell => cell.classList.remove("highlight"));
}

function getCurrentTeam() {
    const settings = JSON.parse(localStorage.getItem('standaardInstellingen')) || defaultSettings();
    return settings[tabBlad].ploeg;
}

document.addEventListener("click", (event) => {
    //console.log("Klik gedetecteerd:", event.target);
   if (DOM.selectOverlay.contains(event.target) && event.target !== DOM.yearSelect && event.target !== DOM.monthSelect) {
        DOM.monthYear.style.color = '';
        DOM.selectOverlay.style.display = 'none';
        DOM.dropdowns.classList.remove("visible");
        DOM.monthSelect.classList.remove("visible");
        DOM.yearSelect.classList.remove("visible");
    }
    if(DOM.modalOverlay.contains(event.target) && !DOM.modal.contains(event.target)) {
        toggleModal(false);
    }
});

function localStorageAanpassenVolgensConfigJS(cond1 = true, cond2 = true, cond3 = true) {
    if(cond1) saveToLocalStorage('verlofdagenPloeg1', dataVerlofdagen);
    if(cond2) saveToLocalStorage('beginrechtVerlof', dataBeginRecht);
    if(cond3) saveToLocalStorage('shiftPattern', dataShift);
    location.reload(true); // of location.href = location.href;
};
//local storage aanpassen volgens het bestand config.js
document.addEventListener('keydown', (event) => {
    //console.log("Toets ingedrukt:", event.key, "Ctrl:", event.ctrlKey, "Shift:", event.shiftKey);
    //console.log("keydown event is geladen!");
    if (event.ctrlKey && event.altKey && event.key === "1") {
        event.preventDefault(); // Voorkomt standaard browsergedrag
        const userResponse = confirm(`Local storage van ploeg 1 wordt nu aangepast volgens config.js. Weet je zeker dat je dit wilt doen?`);
        if (!userResponse) return;
        localStorageAanpassenVolgensConfigJS();
    }
});

window.addEventListener('resize', adjustLayout);
window.addEventListener('load', adjustLayout);
document.getElementById('bars').addEventListener('click', () => {
    const isClosed = document.querySelector('.side-bar').classList.contains('close');
    if (isClosed) {
        document.querySelector('.side-bar').classList.remove('close');
        //document.getElementById('chevron').classList.remove('fa-chevron-right');
        //document.getElementById('chevron').classList.add('fa-chevron-left');
    } else {
        document.querySelector('.side-bar').classList.add('close');
        //document.getElementById('chevron').classList.remove('fa-chevron-left');
        //document.getElementById('chevron').classList.add('fa-chevron-right');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    savePloegenToLocalStorage();
    buildSideBar();
    buildTeamDropdown();
    buildButtons();
    generateCalendar();
});













