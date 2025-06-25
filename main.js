import { generateTeamCalendar, updateTeamCalendar } from './teamKalender.js';
import { generateYearCalendar, updateYearCalendarGrid } from './jaarKalenderGrid.js';
import { generateYearCalendarTable, updateYearCalendarTable, } from './jaarKalenderTable.js';
import { generateMonthCalendar, updateMonthCalendar } from './maandKalender.js';
import { toggleModal, defaultSettings, getSettingsFromLocalStorage, saveToLocalStorage, updateLocalStorage } from './functies.js';
import { activeBlad, buildSideBar, buildTeamDropdown, buildButtons, maakPloegenLegende, maakDropdowns, maakVerlofContainer, maakVerlofLegende } from './componentenMaken.js';
import { shiftData, dateData, dataVerlofdagen, dataBeginRecht} from "./config.js"
import { startDatums } from './makeModalSettings.js';
  
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
    if (calendarGenerators[activeBlad]) {
        emptyContainers();

        const settings = getSettingsFromLocalStorage(activeBlad, defaultSettings);
        const selectedPloeg = settings.selectedPloeg;
        const currentMonth = settings.currentMonth;
        const currentYear = settings.currentYear;
        
        DOM.ploeg.value = selectedPloeg;
        if(activeBlad === 0 || activeBlad === 1) calendarGenerators[activeBlad](selectedPloeg, currentYear);
        if(activeBlad === 2) calendarGenerators[activeBlad](selectedPloeg, currentYear, currentMonth);
        if(activeBlad ===  3) calendarGenerators[activeBlad](currentYear, currentMonth);
        refreshCalendar();
        //adjustLayout();
    } else {
        console.error(`Geen kalendergenerator gevonden voor blad: ${activeBlad}`);

    }
};
const calendarGenerators = {
    0: (team, year) => {
        DOM.ploeg.hidden = false;
        maakVerlofContainer();
        maakVerlofLegende();
        document.getElementById('rapport').hidden = false;
        DOM.titel.textContent = 'Jaarkalender';
        DOM.calendar.className = 'year-calendar-table';
        generateYearCalendarTable(team, year);
    },
    1: (team, year) => {
        DOM.ploeg.hidden = false;
        maakPloegenLegende();
        document.getElementById('rapport').hidden = true;
        DOM.titel.textContent = 'Jaarkalender';
        DOM.calendar.className = 'year-calendar-grid';
        generateYearCalendar(team, year);
    },
    2: (team, year, month) => {
        DOM.ploeg.hidden = false;
        maakPloegenLegende();
        document.getElementById('rapport').hidden = true;
        DOM.titel.textContent = 'Maandkalender';
        DOM.calendar.className = 'month-calendar';
        generateMonthCalendar(team, year, month);
    },
    3: (year, month) => {
        DOM.ploeg.hidden = true;
        maakPloegenLegende();
        DOM.topSectie3.className = 'verborgen-sectie';
        document.getElementById('rapport').hidden = true;
        DOM.titel.textContent = 'Teamkalender';
        DOM.calendar.className = 'team-calendar-table';
        generateTeamCalendar(year, month);
    }
};

function emptyContainers() {
    DOM.middenSectie2.innerHTML = '';
    DOM.topSectie3.innerHTML = '';
    DOM.topSectie3.className = '';
    DOM.topSectie3.classList.add('hidden-on-too-small');
    DOM.titel.textContent = '';
    DOM.calendar.className = '';
};

function refreshCalendar() {
    // Reset de animatie door de klasse te verwijderen en opnieuw toe te voegen
    DOM.calendar.classList.remove("fade-animation");
    void DOM.calendar.offsetWidth; // Forceer een reflow (truc om animatie te resetten)
    DOM.calendar.classList.add("fade-animation");
};
export const updateCalendar = () => {
    const setting = getSettingsFromLocalStorage(activeBlad, defaultSettings);
    const team = setting.selectedPloeg;
    const year = setting.currentYear;
    const month = setting.currentMonth;
    switch (activeBlad) {
        case 0:
            updateYearCalendarTable(team, year);
            break;
        case 1:
            updateYearCalendarGrid(team, year);
            break;
        case 2:
            updateMonthCalendar(team, year, month);
            break;
        case 3:
            updateTeamCalendar(year, month);
    }
};

function triggerPrev() {
    let currentMonth = 0;
    let currentYear = 0;
    const settings = getSettingsFromLocalStorage(activeBlad, defaultSettings);
    if (settings) {
        currentMonth = settings.currentMonth;
        currentYear = settings.currentYear;
    }
    if(activeBlad === 2 || activeBlad === 3) {
        currentMonth = (currentMonth - 1 + 12) % 12;
        if (currentMonth === 11) currentYear -= 1;
    } else {
        currentYear -= 1;
    }
    updateLocalStorage('standaardInstellingen', defaultSettings, activeBlad, {maand:currentMonth, jaar:currentYear});
    updateCalendar();
};
function triggerNext() {
    let currentMonth = 0;
    let currentYear = 0;
    const settings = getSettingsFromLocalStorage(activeBlad, defaultSettings);
    if (settings) {
        currentMonth = settings.currentMonth;
        currentYear = settings.currentYear;
    }
    if(activeBlad === 2 || activeBlad === 3) {
        currentMonth = (currentMonth + 1) % 12;
        if (currentMonth === 0) currentYear += 1;
    } else {
        currentYear += 1;
    }
    updateLocalStorage('standaardInstellingen', defaultSettings, activeBlad, {maand:currentMonth, jaar:currentYear});
    updateCalendar();
};
DOM.sluiten.addEventListener('click', () => toggleModal(false));

DOM.ploeg.addEventListener('change', (event) => {
    const selectedPloeg = Number(event.target.value); 
    updateLocalStorage('standaardInstellingen', defaultSettings, activeBlad, {ploeg:selectedPloeg});
    updateCalendar();
});

DOM.prev.addEventListener("click", triggerPrev);
DOM.next.addEventListener("click", triggerNext);
DOM.monthSelect.addEventListener("change", (event) => {
    const currentMonth = parseInt(event.target.value, 10);
    updateLocalStorage('standaardInstellingen', defaultSettings, activeBlad, {maand:currentMonth});
    updateCalendar();
});
DOM.yearSelect.addEventListener("change", (event) => {
    const currentYear = parseInt(event.target.value, 10);
    updateLocalStorage('standaardInstellingen', defaultSettings, activeBlad, {jaar:currentYear});
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
    if(activeBlad === 2 || activeBlad === 3) {
        DOM.monthSelect.classList.toggle("visible");
    }
    DOM.yearSelect.classList.toggle('visible');
});

// Event listeners voor het selecteren van cellen
let isSelecting = false;
let selectionStart = null; // zoals ActiveCell in excel
let lastSelectedCells = [];
let selectedCells = JSON.parse(sessionStorage.getItem("selectedCells")) || [];

document.addEventListener("mousedown", (event) => {
    if (activeBlad !== 0 || !event.target.classList.contains("cell")) return;
    const datum = event.target.dataset.datum;
    if (!datum) return;

    const cell = event.target;
    const team = getCurrentTeam();

    isSelecting = true;
    selectionStart = datum;
    lastSelectedCells = [...selectedCells]; // Bewaar de laatst geselecteerde cel
    if (selectedCells.length > 0) {
        if (event.ctrlKey) {
            const existingCell = selectedCells.find(c => c.datum === datum && c.team === team);
            if (existingCell) {
                // Deselect cell
                selectedCells = selectedCells.filter(c => !(c.datum === datum && c.team === team));
                cell.classList.remove("highlight");
            } else if (selectedCells[0].team !== team || selectedCells[0].datum.split('/')[2] !== datum.split('/')[2]) {
                clearAllHighlights();
                selectedCells = [{ datum, team }];
                cell.classList.add("highlight");
            } else {
                if (!cell.classList.contains("highlight")) cell.classList.add("highlight");
                selectedCells.push({ datum, team });
            }
        } else {
            clearAllHighlights();
            selectedCells = [{ datum, team }];
            cell.classList.add("highlight");
        }
    } else {
        selectedCells = [{ datum, team }];
        cell.classList.add("highlight");
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
            if (!cel.classList.contains("highlight")) cel.classList.add("highlight");
            if (!selectedCells.some(c => c.datum === cel.dataset.datum && c.team === team)) selectedCells.push({ datum: cel.dataset.datum, team });
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
            if (!selectedCells.some(c => c.datum === datum && c.team === team)) selectedCells.push({ datum, team });
        }
    }
});

document.addEventListener("mouseup", (event) => {
    isSelecting = false;

    const target = event.target;
    if(!target.classList.contains("cell")) return;
    if (lastSelectedCells.length === 1 && target.classList.contains("highlight")) {
        const clickedDatum = target.dataset.datum;
        const clickedTeam = getCurrentTeam();

        const selected = lastSelectedCells[0];
        if (selected.datum === clickedDatum && selected.team === clickedTeam) {
            //console.log("same Selectedcell mouseup: ", previousSelectedCells[0].datum);
            selectedCells.length = 0; // Leegmaken
            target.classList.remove("highlight");
        }
    }
   
    syncSelectedCellsWithHighlights();
    sessionStorage.setItem("lastSelectedCells", JSON.stringify(lastSelectedCells));
});

function syncSelectedCellsWithHighlights() {
    const highlightedCells = Array.from(document.querySelectorAll('.cell.highlight'));
    if (highlightedCells.length === 0) {
        sessionStorage.setItem('selectedCells', JSON.stringify([]));
        return;
    }
    const currentTeam = getCurrentTeam();
    const selectedCells = highlightedCells.map(cell => ({
        datum: cell.dataset.datum,
        team: currentTeam
    }));
    sessionStorage.setItem('selectedCells', JSON.stringify(selectedCells));
};

export function getAllValidCells() {
    return Array.from(DOM.calendar.querySelectorAll(".cell[data-datum]"))
        .filter(cell => cell.dataset.datum);
};

function clearAllHighlights() {
    const allCells = getAllValidCells();
    allCells.forEach(cell => cell.classList.remove("highlight"));
};

function getCurrentTeam() {
    const settings = JSON.parse(localStorage.getItem('standaardInstellingen')) || defaultSettings();
    return settings[activeBlad].ploeg;
};

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

//local storage aanpassen volgens het bestand config.js
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.altKey) {
        let cond1 = false, cond2 = false, cond3 = false;
        let message = "";

        if (event.key === "1") {
            cond1 = true;
            message = `Alleen verlofdagen van ploeg 1 worden aangepast volgens config.js. Weet je zeker dat je dit wilt doen?`;
        } else if (event.key === "2") {
            cond2 = true;
            message = `Alleen beginrecht verlof wordt aangepast volgens config.js. Weet je zeker dat je dit wilt doen?`;
        } else if (event.key === "3") {
            cond3 = true;
            message = "Alleen shiftPatroon en datums worden aangepast volgens configCommon.js. Weet je zeker dat je dit wilt doen?";
        } else if (event.key === "0") {
            cond1 = cond2 = cond3 = true;
            message = `Alle instellingen worden aangepast volgens config.js. Weet je zeker dat je dit wilt doen?`;
        } else {
            return;
        }

        event.preventDefault();
        const userResponse = confirm(message);
        if (!userResponse) return;
        localStorageAanpassenVolgensConfigJS(cond1, cond2, cond3);
    }
});
function localStorageAanpassenVolgensConfigJS(cond1 = true, cond2 = true, cond3 = true) {
    if(cond1) saveToLocalStorage('verlofdagenPloeg1', dataVerlofdagen);
    if(cond2) saveToLocalStorage('beginrechtVerlof', dataBeginRecht);
    if(cond3) {
        saveToLocalStorage('shiftPatroon', shiftData);
        saveToLocalStorage('startDatums', dateData);
        const lengte = startDatums.length;
        Array.from({length:4}).forEach((_, i) => {
            const instellingen = getSettingsFromLocalStorage(i, defaultSettings);
            if(instellingen.selectedPloeg > lengte) updateLocalStorage('standaardInstellingen', defaultSettings, i, {ploeg:1});
        }); 
    }
    location.reload(true); // of location.href = location.href;
};

document.addEventListener('DOMContentLoaded', () => {
    buildSideBar();
    buildTeamDropdown(startDatums.length);
    buildButtons();
    generateCalendar();
});













