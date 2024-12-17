import { generateTeamCalendar, updateTeamCalendar } from './teamKalender.js';
import { generateYearCalendar, updateYearCalendarGrid } from './jaarKalenderGrid.js';
import { generateYearCalendarTable, updateYearCalendarTable, } from './jaarKalenderTable.js';
import { generateMonthCalendar, updateMonthCalendar } from './maandKalender.js';
import { saveToSessionStorage, updateSessionStorage, getSettingsFromSessionStorage, saveToLocalStorage } from './functies.js';
import { tabBlad, maakSidebar, maakPloegDropdown, maakLegende, maakDropdowns, maakVerlofContainer } from './componentenMaken.js';
import { makeModalInstellingen, toggleModal } from './makeModalSettings.js';
import { makeModalFeestdagen } from './makeModalHolidays.js';

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
const shiftenData = [
    {symbool:'N12', naam:'nacht-12u', kleur:'#0158bb'},
    {symbool:'N', naam:'nacht', kleur:'#4a91e2'},
    {symbool:'V12', naam:'vroege-12u', kleur:'#fc761cb0'},
    {symbool:'V', naam:'vroege', kleur:'#f39251e1'},
    {symbool:'L', naam:'late', kleur:'#4c9182cb'},
    {symbool:'x', naam:'thuis', kleur:'#cfcfcf'},
    {symbool:'D', naam:'dag', kleur:'#949494'}
];
export let shiftenGegevens = JSON.parse(localStorage.getItem("shiftenGegevens")) || shiftenData;
export let shiftPattern = JSON.parse(localStorage.getItem("shiftPattern")) || ploegSchema;
export let startDates = JSON.parse(localStorage.getItem("startDates")) || startDatums;
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
    instellingen: document.getElementById('instellingen'),
    feestdagen: document.getElementById('feestdagen'),
    rapport: document.getElementById('rapport'),
    legende: document.getElementById('legende'),
    calendar: document.getElementById('calendar'),
    modalOverlay: document.getElementById("modal-overlay"),
    modal: document.getElementById("modal"),
    overlay: document.getElementById('overlay'),
    sluiten: document.getElementById('sluiten')
};
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
export const gegevensOpslaan = (cyclus, datums) => {
    shiftPattern = cyclus;
    startDates = datums;
    //startDate = startDates[selectedPloeg];
    saveToLocalStorage('shiftPattern', cyclus);
    saveToLocalStorage('startDates', datums);
    alert("Wijzigingen succesvol opgeslagen!");
    updateCalendar();
};
const calendarGenerators = {
    0: (year) => {
        DOM.ploeg.hidden = false;
        DOM.rapport.style.display = '';
        DOM.verlofContainer.style.display = 'flex';
        DOM.legende.style.display = 'none';
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container-table';
        DOM.calendar.className = 'year-calendar-table';
        generateYearCalendarTable(year);
    },
    1: (year) => {
        DOM.ploeg.hidden = false;
        DOM.rapport.style.display = '';
        DOM.verlofContainer.style.display = 'none';
        DOM.legende.style.display = '';
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container-grid';
        DOM.calendar.className = 'year-calendar-grid';
        generateYearCalendar(year);
    },
    2: (month, year) => {
        DOM.ploeg.hidden = false;
        DOM.rapport.style.display = 'none';
        DOM.verlofContainer.style.display = 'none';
        DOM.legende.style.display = '';
        DOM.titel.textContent = 'Maandkalender';
        DOM.container.className = 'month-container';
        DOM.calendar.className = 'calendar';
        generateMonthCalendar(month, year);
    },
    3: (month, year) => {
        DOM.ploeg.hidden = true;
        DOM.rapport.style.display = 'none';
        DOM.verlofContainer.style.display = 'none';
        DOM.legende.style.display = 'none';
        DOM.titel.textContent = 'Teamkalender';
        DOM.container.className = 'team-container';
        DOM.calendar.className = 'team-calendar-table';
        generateTeamCalendar(month, year);
    }
};
export function generateCalendar() {
    if (calendarGenerators[tabBlad]) {
        let currentMonth = 0;
        let currentYear = 0;
        let selectedPloeg = 0;
        const settings = getSettingsFromSessionStorage(tabBlad, defaultSettings);
        if (settings) {
            currentMonth = settings.currentMonth;
            currentYear = settings.currentYear;
            selectedPloeg = settings.selectedPloeg;
        }
        DOM.ploeg.value = selectedPloeg;
        (tabBlad === 2 || tabBlad === 3) ? calendarGenerators[tabBlad](currentMonth, currentYear) : calendarGenerators[tabBlad](currentYear);
        refreshCalendar();
    } else {
        console.error(`Geen kalendergenerator gevonden voor blad: ${tabBlad}`);
    }
};
function refreshCalendar() {
    // Reset de animatie door de klasse te verwijderen en opnieuw toe te voegen
    DOM.calendar.classList.remove("fade-animation");
    void DOM.calendar.offsetWidth; // Forceer een reflow (truc om animatie te resetten)
    DOM.calendar.classList.add("fade-animation");
};
function triggerPrev() {
    let currentMonth = 0;
    let currentYear = 0;
    const settings = getSettingsFromSessionStorage(tabBlad, defaultSettings);
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
    updateSessionStorage('standaardInstellingen', tabBlad, 'maand', currentMonth, defaultSettings);
    updateSessionStorage('standaardInstellingen', tabBlad, 'jaar', currentYear, defaultSettings);
    updateCalendar();
};
function triggerNext() {
    let currentMonth = 0;
    let currentYear = 0;
    const settings = getSettingsFromSessionStorage(tabBlad, defaultSettings);
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
    updateSessionStorage('standaardInstellingen', tabBlad, 'maand', currentMonth, defaultSettings);
    updateSessionStorage('standaardInstellingen', tabBlad, 'jaar', currentYear, defaultSettings);
    updateCalendar();
};
DOM.instellingen.addEventListener('click', () => makeModalInstellingen(startDates, shiftPattern));
DOM.feestdagen.addEventListener('click', () => makeModalFeestdagen(tabBlad, defaultSettings));
DOM.sluiten.addEventListener('click', () => toggleModal(false));
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
DOM.monthSelect.addEventListener("change", (event) => {
    const currentMonth = parseInt(event.target.value, 10);
    updateSessionStorage('standaardInstellingen', tabBlad, 'maand', currentMonth, defaultSettings);
    updateCalendar();
});
DOM.yearSelect.addEventListener("change", (event) => {
    const currentYear = parseInt(event.target.value, 10);
    updateSessionStorage('standaardInstellingen', tabBlad, 'jaar', currentYear, defaultSettings);
    updateCalendar();
});
DOM.ploeg.addEventListener('change', (event) => {
    const selectedPloeg = Number(event.target.value); 
    //startDate = startDates[selectedPloeg];
    updateSessionStorage('standaardInstellingen', tabBlad,'ploeg', selectedPloeg, defaultSettings);
    updateCalendar();
});
DOM.prev.addEventListener("click", triggerPrev);
DOM.next.addEventListener("click", triggerNext);
document.addEventListener("click", (event) => {
    // Verberg de dropdowns als er buiten wordt geklikt
    if (!dropdowns.contains(event.target) && event.target !== DOM.monthYear && event.target !== DOM.instellingen) {
        DOM.monthYear.style.color = '';
        DOM.selectOverlay.style.display = 'none';
        DOM.dropdowns.classList.remove("visible");
        DOM.monthSelect.classList.remove("visible");
        DOM.yearSelect.classList.remove("visible");
    }

    if (tabBlad === 0) {
        const cellArray = DOM.calendar.querySelectorAll('.cell');
        const selected = event.target.dataset.shift;
        if(selected) {
            let cellCoordinates = JSON.parse(sessionStorage.getItem("selectedCell")) || {};
            const settings = JSON.parse(sessionStorage.getItem('standaardInstellingen')) || defaultSettings;
            cellCoordinates.datum = event.target.dataset.datum;
            cellCoordinates.team = settings[tabBlad].ploeg;
            saveToSessionStorage("selectedCell", cellCoordinates);
            cellArray.forEach(cel => cel.classList.remove('highlight'));
            event.target.classList.add('highlight');
        }
    }
});
document.addEventListener('DOMContentLoaded', () => {
    saveToSessionStorage('standaardInstellingen', defaultSettings());
    maakSidebar();
    maakPloegDropdown();
    maakLegende();
    maakVerlofContainer();
    maakDropdowns();
    generateCalendar();
});













