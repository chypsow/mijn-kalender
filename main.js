import { generateTeamCalendar, updateTeamCalendar } from './teamKalender.js';
import { generateYearCalendar, updateYearCalendarGrid } from './jaarKalenderGrid.js';
import { generateYearCalendarTable, updateYearCalendarTable, } from './jaarKalenderTable.js';
import { generateMonthCalendar, updateMonthCalendar } from './maandKalender.js';
import { toggleModal, saveSettingsToLocalStorage, updateLocalStorage, getSettingsFromLocalStorage, saveToLocalStorage, saveToSessionStorage, resetDefaultSettings, adjustLayout } from './functies.js';
import { tabBlad, maakSidebar, maakPloegDropdown, maakKnoppen, maakPloegenLegende, maakDropdowns, maakVerlofContainer, maakVerlofLegende } from './componentenMaken.js';

// default settings
const week1 = ['N', 'N', 'N', 'x', 'x', 'V', 'V12'];
const week2 = ['L', 'L', 'x', 'N', 'N', 'N', 'N12'];
const week3 = ['x', 'x', 'L', 'L', 'L', 'L', 'x'];
const week4 = ['V', 'V', 'V', 'V', 'V', 'x', 'x'];
const week5 = ['D', 'D', 'D', 'D', 'D', 'x', 'x'];
const ploegSchema = [...week1, ...week2, ...week3, ...week4, ...week5];
const startDatums = {
    1: "2010-02-01", 
    2: "2010-01-18", 
    3: "2010-01-25", 
    4: "2010-01-04", 
    5: "2010-01-11"
};
export let shiftPattern = JSON.parse(localStorage.getItem("shiftPattern")) || ploegSchema;
export let startDates = JSON.parse(localStorage.getItem("startDates")) || startDatums;
export const defaultSettings = () => {
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    return Array.from({ length: 4 }, (_, index) => ({
        pagina: index,
        ploeg: 1,
        maand: currentMonth,
        jaar: currentYear
    }));
};   
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
const defaultVacations = {
    'BV': 0,
    'CS': 0,
    'ADV': 0,
    'BF': 0,
    'AV': 0,
    'HP': 0
};
export const beginrechtVerlof = JSON.parse(localStorage.getItem("beginrechtVerlof")) || defaultVacations;
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

//make new variables in local storage if they don't exist yet
function savePloegenToLocalStorage() {
    Object.values(localStoragePloegen).forEach((ploeg, index) => {
        const ploegKey = ploeg;
        saveToLocalStorage(`verlofdagenPloeg${index+1}`, opgenomenVerlofPerPloeg[ploegKey]);
    });
};

export const berekenSaldo = (ploeg, key = null) => {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const array = opgenomenVerlofPerPloeg[ploegKey];
    const currentYear = getSettingsFromLocalStorage(tabBlad, defaultSettings).currentYear;
    const newArray = array.filter(obj => {
        const year = parseInt(obj.datum.split('/')[2]);
        return year === currentYear;
    });
    if (newArray.length === 0) {
        return key ? beginrechtVerlof[key] : beginrechtVerlof;
    }
    // Functie om het saldo te berekenen
    const calculateSaldo = (verlofKey) => {
        const opgenomen = newArray.filter(obj => obj.soort === verlofKey).length;
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
    container: document.getElementById('container'),
    verlofContainer: document.getElementById('verlof-container'),
    ploeg: document.getElementById('ploeg'),
    titel: document.getElementById('titel'),
    buttonContainer: document.getElementById('buttonContainer'),
    ploegenLegende: document.getElementById('ploegenLegende'),
    verlofLegende: document.getElementById('verlofLegende'),
    calendar: document.getElementById('calendar'),
    modalOverlay: document.getElementById("modal-overlay"),
    modal: document.getElementById("modal"),
    overlay: document.getElementById('overlay'),
    sluiten: document.getElementById('sluiten')
};

export const standaardTerugstellen = () => {
    resetDefaultSettings(startDatums, ploegSchema);
};
export const gegevensOpslaan = (cyclus, datums) => {
    shiftPattern = cyclus;
    startDates = datums;
    saveToLocalStorage('shiftPattern', cyclus);
    saveToLocalStorage('startDates', datums);
    alert("Wijzigingen succesvol opgeslagen!");
    updateCalendar();
};
export function generateCalendar() {
    if (calendarGenerators[tabBlad]) {
        const settings = getSettingsFromLocalStorage(tabBlad, defaultSettings);
        let currentMonth = settings.currentMonth;
        let currentYear = settings.currentYear;
        let selectedPloeg = settings.selectedPloeg;
        DOM.ploeg.value = selectedPloeg;
        (tabBlad === 2 || tabBlad === 3) ? calendarGenerators[tabBlad](currentMonth, currentYear) : calendarGenerators[tabBlad](currentYear);
        refreshCalendar();
    } else {
        console.error(`Geen kalendergenerator gevonden voor blad: ${tabBlad}`);
    }
};
const calendarGenerators = {
    0: (year) => {
        DOM.ploeg.hidden = false;
        //DOM.buttonContainer.children[4].style.display = '';
        DOM.verlofContainer.style.display = '';
        DOM.ploegenLegende.style.display = 'none';
        DOM.verlofLegende.style.display = '';
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container-table';
        DOM.calendar.className = 'year-calendar-table';
        generateYearCalendarTable(year);
    },
    1: (year) => {
        DOM.ploeg.hidden = false;
        //DOM.buttonContainer.children[4].style.display = 'none';
        DOM.verlofContainer.style.display = 'none';
        DOM.ploegenLegende.style.display = '';
        DOM.verlofLegende.style.display = 'none';
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container-grid';
        DOM.calendar.className = 'year-calendar-grid';
        generateYearCalendar(year);
    },
    2: (month, year) => {
        DOM.ploeg.hidden = false;
        //DOM.buttonContainer.children[4].style.display = 'none';
        DOM.verlofContainer.style.display = 'none';
        DOM.ploegenLegende.style.display = '';
        DOM.verlofLegende.style.display = 'none';
        DOM.titel.textContent = 'Maandkalender';
        DOM.container.className = 'month-container';
        DOM.calendar.className = 'calendar';
        generateMonthCalendar(month, year);
    },
    3: (month, year) => {
        DOM.ploeg.hidden = true;
        //DOM.buttonContainer.children[4].style.display = 'none';
        DOM.verlofContainer.style.display = 'none';
        DOM.ploegenLegende.style.display = 'none';
        DOM.verlofLegende.style.display = 'none';
        DOM.titel.textContent = 'Teamkalender';
        DOM.container.className = 'team-container';
        DOM.calendar.className = 'team-calendar-table';
        generateTeamCalendar(month, year);
    }
};
function refreshCalendar() {
    // Reset de animatie door de klasse te verwijderen en opnieuw toe te voegen
    DOM.calendar.classList.remove("fade-animation");
    void DOM.calendar.offsetWidth; // Forceer een reflow (truc om animatie te resetten)
    DOM.calendar.classList.add("fade-animation");
};
const updateCalendar = () => {
    switch (tabBlad) {
        case 0:
            updateYearCalendarTable();
            break;
        case 1:
            updateYearCalendarGrid();
            break;
        case 2:
            updateMonthCalendar();
            break;
        case 3:
            updateTeamCalendar();
    }
};
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
    updateLocalStorage('standaardInstellingen', tabBlad, 'maand', currentMonth, defaultSettings);
    updateLocalStorage('standaardInstellingen', tabBlad, 'jaar', currentYear, defaultSettings);
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
    updateLocalStorage('standaardInstellingen', tabBlad, 'maand', currentMonth, defaultSettings);
    updateLocalStorage('standaardInstellingen', tabBlad, 'jaar', currentYear, defaultSettings);
    updateCalendar();
};
DOM.sluiten.addEventListener('click', () => toggleModal(false));

/*DOM.monthYear.addEventListener("click", () => {
    DOM.monthYear.style.color = 'transparent';
    //const rect = DOM.monthYear.getBoundingClientRect();
    //DOM.dropdowns.style.top = `${rect.top + window.scrollY - 10}px`;
    //DOM.dropdowns.style.left = `${rect.left + window.scrollX + Math.round(rect.width/2 - DOM.dropdowns.style.width/2)}px`;
    //DOM.dropdowns.style.top = DOM.monthYear.style.top;
    //DOM.dropdowns.style.left = DOM.monthYear.style.left;
    DOM.selectOverlay.style.display = 'block';
    maakDropdowns();
    DOM.dropdowns.classList.toggle("visible");
    if(tabBlad === 2 || tabBlad === 3) {
        DOM.monthSelect.classList.toggle("visible");
        //DOM.monthSelect.click();
    }
    DOM.yearSelect.classList.toggle('visible');
    //DOM.yearSelect.click();
});*/
DOM.monthSelect.addEventListener("change", (event) => {
    const currentMonth = parseInt(event.target.value, 10);
    updateLocalStorage('standaardInstellingen', tabBlad, 'maand', currentMonth, defaultSettings);
    updateCalendar();
});
DOM.yearSelect.addEventListener("change", (event) => {
    const currentYear = parseInt(event.target.value, 10);
    updateLocalStorage('standaardInstellingen', tabBlad, 'jaar', currentYear, defaultSettings);
    updateCalendar();
});
DOM.ploeg.addEventListener('change', (event) => {
    const selectedPloeg = Number(event.target.value); 
    //startDate = startDates[selectedPloeg];
    updateLocalStorage('standaardInstellingen', tabBlad,'ploeg', selectedPloeg, defaultSettings);
    updateCalendar();
});
DOM.prev.addEventListener("click", triggerPrev);
DOM.next.addEventListener("click", triggerNext);
document.addEventListener("click", (event) => {
    /*if (!DOM.dropdowns.contains(event.target) && event.target !== DOM.monthYear && event.target !== DOM.instellingen) {
        DOM.monthYear.style.color = '';
        DOM.selectOverlay.style.display = 'none';
        DOM.dropdowns.classList.remove("visible");
        DOM.monthSelect.classList.remove("visible");
        DOM.yearSelect.classList.remove("visible");
    }*/
    if (tabBlad !== 0) return;
    const selected = event.target.dataset.shift;
    if(!selected) return;

    const cellArray = DOM.calendar.querySelectorAll('.cell');
    let cellCoordinates = JSON.parse(sessionStorage.getItem("selectedCell")) || {};
    const settings = JSON.parse(localStorage.getItem('standaardInstellingen')) || defaultSettings;
    cellCoordinates.datum = event.target.dataset.datum;
    cellCoordinates.team = settings[tabBlad].ploeg;
    
    const highlightedCell = Array.from(cellArray).find(cel => cel.classList.contains('highlight'));
    if (highlightedCell) highlightedCell.classList.remove('highlight');
    event.target.classList.add('highlight');
    saveToSessionStorage("selectedCell", cellCoordinates);
});

//window.addEventListener('resize', adjustLayout);
//window.addEventListener('load', adjustLayout);
document.addEventListener('DOMContentLoaded', () => {
    saveSettingsToLocalStorage('standaardInstellingen', defaultSettings());
    savePloegenToLocalStorage();
    maakSidebar();
    maakPloegDropdown();
    maakKnoppen();
    maakPloegenLegende();
    maakVerlofLegende();
    maakVerlofContainer();
    generateCalendar();
});













