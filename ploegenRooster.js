import { generateTeamCalendar, updateTeamCalendar } from './teamKalender.js';
import { generateYearCalendar, updateYearCalendar } from './jaarKalenderGrid.js';
import { generateYearCalendarTable, updateYearCalendarTable, } from './jaarKalenderTable.js';
import { generateMonthCalendar, updateMonthCalendar } from './maandKalender.js';
import { saveToSessionStorage, updateSessionStorage, getSettingsFromSessionStorage, saveToLocalStorage } from './functies.js';
import { maakPloegDropdown, maakLegende, maakDropdowns, maakVerlofContainer } from './componentenMaken.js';

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
function resetDefaultSettings() {
    let counter = 0;
    for(let i = 1; i <= 5; i++) {
        const datum = document.getElementById(`date${i}`);
        datum.value = startDatums[i];
        for(let j = 1; j <= 7; j++) {
            const dayElement = document.getElementById(`day-${i}${j}`);
            dayElement.value = ploegSchema[counter];
            counter++;
        }
    }
};

//
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
export let startDate = startDates[1];


export const verlofdagenPloegen = {
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
}

// Elementen in de DOM
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
    checkBox: document.getElementById('checkBox'),
    ploeg: document.getElementById('ploeg'),
    titel: document.getElementById('titel'),
    addShift: document.getElementById('add-shift'),
    feestdagen: document.getElementById('feestdagen'),
    instellingen: document.getElementById('instellingen'),
    legende: document.getElementById('legende'),
    calendar: document.getElementById('calendar'),
    modalOverlay: document.getElementById("modal-overlay"),
    modal: document.getElementById("modal"),
    overlay: document.getElementById('overlay')
};

export let currentMonth = new Date().getMonth();
export let currentYear = new Date().getFullYear();
export let tabBlad = 0;
export let selectedPloeg = 1;
let cellCoordinates = JSON.parse(sessionStorage.getItem("selectedCell")) || {};

export const defaultSettings = [
    {pagina: 0, ploeg: 1, maand: currentMonth, jaar: currentYear},
    {pagina: 1, ploeg: 1, maand: currentMonth, jaar: currentYear},
    {pagina: 2, ploeg: 1, maand: currentMonth, jaar: currentYear},
    {pagina: 3, ploeg: 1, maand: currentMonth, jaar: currentYear}
]

Array.from(DOM.topNav.children).forEach((elt, index) => {
    elt.addEventListener('click', () => {
        DOM.topNav.querySelector('.active').classList.remove("active");
        elt.classList.add("active");
        tabBlad = index;
        generateCalendar();
    });
});

maakPloegDropdown();
DOM.ploeg.onchange = function () {
    selectedPloeg = Number(this.value); 
    startDate = startDates[selectedPloeg];
    updateSessionStorage('standaardInstellingen', tabBlad,'ploeg', selectedPloeg, defaultSettings);
    updateCalendar();
};
Array.from(DOM.ploeg.options).forEach(option => {
    option.style.color = 'black';
});

function updateCalendar() {
    switch (tabBlad) {
        case 0:
            updateYearCalendarTable(currentYear);
            break;
        case 1:
            updateYearCalendar(currentYear);
            break;
        case 2:
            updateMonthCalendar(currentMonth, currentYear);
            break;
        case 3:
            updateTeamCalendar(currentMonth, currentYear);
    }
};

function toggleModal(show) {
    DOM.modalOverlay.style.display = show ? "block" : "none";
    DOM.modal.style.display = show ? "block" : "none";
};

function closeModal() {
    toggleModal(false);
};

DOM.instellingen.onclick = function() {
    DOM.overlay.innerHTML = '';
    let count = 0;
    Array.from({ length: 5}).forEach((_, i) => {
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.textContent = `Week ${i+1}: `;
        label.appendChild(span);
        Array.from({ length: 7 }).forEach((_, j) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `day-${i+1}${j+1}`;
            input.className = 'shift-input';
            input.value = shiftPattern[count] || '';
            count++;
            label.appendChild(input);
        });
        DOM.overlay.appendChild(label);
    });

    DOM.overlay.appendChild(document.createElement('br'));
    DOM.overlay.appendChild(document.createElement('br'));

    Object.keys(startDates).forEach(i => {
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.textContent = `Startdatum ${i}: `;
        label.appendChild(span);
        const input = document.createElement('input');
        input.type = 'date';
        input.id = `date${i}`;
        input.className = 'date-input';
        input.value = startDates[i] || '';
        label.appendChild(input);
        DOM.overlay.appendChild(label);
    });

    DOM.overlay.appendChild(document.createElement('br'));
    DOM.overlay.appendChild(document.createElement('br'));

    const div = document.createElement('div');
    div.classList.add('button-container');
    const button = document.createElement('button');
    button.className = "btnOverlay";
    button.textContent = "Opslaan";
    button.addEventListener('click', ploegSysteemOpslaan);
    div.appendChild(button);
    const reset = document.createElement('button');
    reset.className = "reset";
    reset.textContent = "Standaardinstellingen terugzetten";
    reset.addEventListener('click', resetDefaultSettings);
    div.appendChild(reset);
    DOM.overlay.appendChild(div);

    toggleModal(true);
};
function checkIngevoerdeWaarden(cyclus) {
    return cyclus.every(cyc => {
        return shiftenGegevens.some(item => item.symbool === cyc);
    });
};

function ploegSysteemOpslaan() {
    let cyclus = [];
    let datums = {};
    for(let i = 1; i <= 5; i++) {
        const datum = document.getElementById(`date${i}`).value;
        datums[i] = datum;
        for(let j = 1; j <= 7; j++) {
            const dayElement = document.getElementById(`day-${i}${j}`);
            cyclus.push(dayElement.value === 'x' ? dayElement.value.toLowerCase() : dayElement.value.toUpperCase());
        }
    }
    const isValid = checkIngevoerdeWaarden(cyclus);
    if (isValid) {
        shiftPattern = cyclus;
        startDates = datums;
        startDate = startDates[selectedPloeg];
        saveToLocalStorage('shiftPattern', cyclus);
        saveToLocalStorage('startDates', datums);
        alert("Wijzigingen succesvol opgeslagen!");
        closeModal();
        updateCalendar();
    } else {
        alert('Sommige velden zijn niet correct ingevuld !');
    }
};
document.getElementById('sluiten').addEventListener('click', closeModal);

const berekenPaasdatum = (year) => {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const maand = Math.floor((h + l - 7 * m + 114) / 31);
    const dag = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, maand - 1, dag);
};

const feestdagenLijst = {
    1: (year) => new Date(year, 0, 1),
    2: (year) => new Date(berekenPaasdatum(year).setDate(berekenPaasdatum(year).getDate() + 1)),
    3: (year) => new Date(year, 4, 1),
    4: (year) => new Date(berekenPaasdatum(year).setDate(berekenPaasdatum(year).getDate() + 39)),
    5: (year) => new Date(berekenPaasdatum(year).setDate(berekenPaasdatum(year).getDate() + 50)),
    6: (year) => new Date(year, 6, 21),
    7: (year) => new Date(year, 7, 15),
    8: (year) => new Date(year, 10, 1),
    9: (year) => new Date(year, 10, 11),
    10: (year) => new Date(year, 11, 25)
};
export const feestdagenLijstDatums = (year) => Object.values(feestdagenLijst).map(datums => datums(year));
//console.log(feestdagenLijstDatums(currentYear));

const formatter = new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long', // Volledige dagnaam
    day: 'numeric',  // Dag van de maand
    month: 'long',   // Volledige maandnaam
    year: 'numeric'  // Volledig jaar
});
const voegFeestdagToe = (lijst, naam, datum) => {
    lijst.innerHTML += `
        <li class="feestdag">
            <span class="spanLinks">${naam}</span>
            <span class="spanRechts">${datum}</span>
        </li>`;
};
const voegFeestdagenToe = (lijst, year) => {
    const feestdagen = [
        ['Nieuwjaarsdag', feestdagenLijst[1](year)],
        ['Paasmaandag', feestdagenLijst[2](year)],
        ['Feest van de Arbeid', feestdagenLijst[3](year)],
        ['O.L.V. Hemelvaart', feestdagenLijst[4](year)],
        ['Pinkstermaandag', feestdagenLijst[5](year)],
        ['Nationale Feestdag', feestdagenLijst[6](year)],
        ['O.L.V. Tenhemelopneming', feestdagenLijst[7](year)],
        ['Allerheiligen', feestdagenLijst[8](year)],
        ['Wapenstilstand', feestdagenLijst[9](year)],
        ['Kerstmis', feestdagenLijst[10](year)]
    ];
    lijst.innerHTML = ''; // Leegmaken voor updates
    feestdagen.forEach(([naam, datum]) => voegFeestdagToe(lijst, naam, formatter.format(datum)));
};
DOM.feestdagen.onclick = () => {
    let jaar = currentYear;
    DOM.overlay.innerHTML = `
        <div class="calendar-nav">
            <button class="vorig"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>
            <span id="jaar" class="month-year">${jaar}</span>
            <button class="volgend"><i class="fa fa-chevron-right" aria-hidden="true"></i></button>
        </div>
        <ul class="feestdagen"></ul>
    `;

    const lijst = DOM.overlay.querySelector('.feestdagen');
    const updateFeestdagen = (newYear) => {
        jaar = newYear;
        document.getElementById('jaar').textContent = jaar;
        voegFeestdagenToe(lijst, jaar);
    };

    // Navigatieknoppen
    DOM.overlay.querySelector('.vorig').onclick = () => updateFeestdagen(jaar - 1);
    DOM.overlay.querySelector('.volgend').onclick = () => updateFeestdagen(jaar + 1);

    // Initiële lijst
    voegFeestdagenToe(lijst, jaar);
    toggleModal(true);
};

const calendarGenerators = {
    0: () => {
        DOM.ploeg.hidden = false;
        DOM.checkBox.hidden = true;
        DOM.verlofContainer.style.display = 'flex';
        DOM.legende.style.display = 'none';
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container2';
        DOM.calendar.className = 'year-calendar-table';
        generateYearCalendarTable(currentYear);
    },
    1: () => {
        DOM.ploeg.hidden = false;
        DOM.checkBox.hidden = true;
        DOM.verlofContainer.style.display = 'none';
        DOM.legende.style.display = '';
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container1';
        DOM.calendar.className = 'year-calendar-grid';
        generateYearCalendar(currentYear);
    },
    2: () => {
        DOM.ploeg.hidden = false;
        DOM.checkBox.hidden = true;
        DOM.verlofContainer.style.display = 'none';
        DOM.legende.style.display = '';
        DOM.titel.textContent = 'Maandkalender';
        DOM.container.className = 'month-container';
        DOM.calendar.className = 'calendar';
        generateMonthCalendar(currentMonth, currentYear);
    },
    3: () => {
        DOM.ploeg.hidden = true;
        DOM.checkBox.hidden = true;
        DOM.verlofContainer.style.display = 'none';
        DOM.legende.style.display = 'none';
        DOM.titel.textContent = 'Teamkalender';
        DOM.container.className = 'team-container';
        DOM.calendar.className = 'team-calendar-table';
        generateTeamCalendar(currentMonth, currentYear);
    }
};

function generateCalendar() {
    if (calendarGenerators[tabBlad]) {
        const settings = getSettingsFromSessionStorage(tabBlad, defaultSettings);
        if (settings) {
            DOM.ploeg.value = settings.selectedPloeg;
            startDate = startDates[settings.selectedPloeg];
            currentMonth = settings.currentMonth;
            currentYear = settings.currentYear;
        }
        calendarGenerators[tabBlad]();
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
            const settings = JSON.parse(sessionStorage.getItem('standaardInstellingen')) || defaultSettings;
            cellCoordinates.datum = event.target.dataset.datum;
            cellCoordinates.team = settings[tabBlad].ploeg;
            
            saveToSessionStorage("selectedCell", cellCoordinates);
            cellArray.forEach(cel => cel.classList.remove('highlight'));
            event.target.classList.add('highlight');
        }
    }
});

DOM.monthSelect.addEventListener("change", (event) => {
    currentMonth = parseInt(event.target.value, 10);
    updateSessionStorage('standaardInstellingen', tabBlad, 'maand', currentMonth, defaultSettings);
    updateCalendar();
});

DOM.yearSelect.addEventListener("change", (event) => {
    currentYear = parseInt(event.target.value, 10);
    updateSessionStorage('standaardInstellingen', tabBlad, 'jaar', currentYear, defaultSettings);
    updateCalendar();
});

function triggerPrev() {
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
DOM.prev.addEventListener("click", triggerPrev);
DOM.next.addEventListener("click", triggerNext);

saveToSessionStorage('standaardInstellingen', defaultSettings);
maakLegende();
maakVerlofContainer();
maakDropdowns();
generateCalendar();












