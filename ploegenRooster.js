import { generateTeamCalendar } from './teamKalender.js';
import { generateYearCalendar, updateYearCalendar } from './jaarKalender1.js';
import { generateYearCalendarTable, updateYearCalendarTable } from './jaarKalender2.js';
import { generateMonthCalendar, updateMonthCalendar } from './maandKalender.js';

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

const shiftenData = [
    {symbool:'N12', naam:'nacht-12u', kleur:'#0158bb'},
    {symbool:'N', naam:'nacht', kleur:'#4a91e2'},
    {symbool:'V12', naam:'vroege-12u', kleur:'#fc761cb0'},
    {symbool:'V', naam:'vroege', kleur:'#f39251e1'},
    {symbool:'L', naam:'late', kleur:'#4c9182cb'},
    {symbool:'x', naam:'thuis', kleur:'#cfcfcf'},
    {symbool:'D', naam:'dag', kleur:'#949494'}
];

let shiftenGegevens = JSON.parse(localStorage.getItem("shiftenGegevens")) || shiftenData;

export function getNaamBijSymbool(symbool) {
    const shift = shiftenGegevens.find(item => item.symbool === symbool);
    return shift ? shift.naam : 'Symbool niet gevonden';
};

export const monthSelect = document.getElementById("month-select");
export const yearSelect = document.getElementById("year-select");
export const monthYear = document.getElementById('month-year');
export let shiftPattern = JSON.parse(localStorage.getItem("shiftPattern")) || ploegSchema;
export let startDates = JSON.parse(localStorage.getItem("startDates")) || startDatums;
export let startDate = startDates[1];

export function getDaysSinceStart(date, date0) {
    if (typeof date0 === "string") {
        date0 = new Date(date0);
    }
    const diffTime = date - date0;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// Elementen in de DOM
const DOM = {
    prev: document.getElementById('prev'),
    next: document.getElementById('next'),
    selectOverlay: document.getElementById('select-overlay'),
    dropdowns: document.getElementById("dropdowns"),
    topNav: document.getElementById("top-nav"),
    container: document.getElementById('container'),
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

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let count = 0;
let tabBlad = 0;
let selectedPloeg = 1;

const defaultSettings = [
    {pagina: 0, ploeg: 1, maand: currentMonth, jaar: currentYear},
    {pagina: 1, ploeg: 1, maand: currentMonth, jaar: currentYear},
    {pagina: 2, ploeg: 1, maand: currentMonth, jaar: currentYear},
    {pagina: 3, ploeg: 1, maand: currentMonth, jaar: currentYear}
]
saveToSessionStorage('standaardInstellingen', defaultSettings)

function saveToSessionStorage(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
};
function maakLegende() {
        shiftenGegevens.forEach(shift => {
        const legendeItem = document.createElement('div');
        legendeItem.classList.add('legende-item');
        
        const kleurVak = document.createElement('span');
        kleurVak.classList.add('legende-vak');
        kleurVak.style.backgroundColor = shift.kleur;
        legendeItem.appendChild(kleurVak);

        const beschrijving = document.createElement('span');
        beschrijving.textContent = `${shift.symbool} : ${shift.naam.charAt(0).toUpperCase()}${shift.naam.slice(1)}`;
        legendeItem.appendChild(beschrijving);

        DOM.legende.appendChild(legendeItem);
    });

};

Array.from(DOM.topNav.children).forEach((elt, index) => {
    elt.addEventListener('click', () => {
        DOM.topNav.querySelector('.active').classList.remove("active");
        elt.classList.add("active");
        tabBlad = index;
        generateCalendar();
    });
});

DOM.ploeg.onchange = function () {
    selectedPloeg = Number(this.value); 
    startDate = startDates[selectedPloeg];
    updateSessionStorage();
    updateCalendar();
};
Array.from(DOM.ploeg.options).forEach(option => {
    option.style.color = 'black';
});
function updateCalendar() {
    if (tabBlad === 0) {
        updateMonthCalendar(currentMonth, currentYear);
    } else if (tabBlad === 1) {
        updateYearCalendar(currentYear);
    } else if (tabBlad === 2) {
        updateYearCalendarTable(currentYear);
        
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
    count = 0;
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
        overlay.appendChild(label);
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
        overlay.appendChild(label);
    });

    DOM.overlay.appendChild(document.createElement('br'));
    DOM.overlay.appendChild(document.createElement('br'));

    const reset = document.createElement('button');
    reset.className = "reset";
    reset.textContent = "Reset to default settings";
    reset.addEventListener('click', resetDefaultSettings);
    DOM.overlay.appendChild(reset);

    const button = document.createElement('button');
    button.className = "btnOverlay";
    button.textContent = "Opslaan";
    button.addEventListener('click', ploegSysteemOpslaan);
    DOM.overlay.appendChild(button);

    toggleModal(true);
};
function checkIngevoerdeWaarden(cyclus) {
    return cyclus.every(cyc => {
        return shiftenGegevens.some(item => item.symbool === cyc);
    });
}

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
        startDate = startDates[DOM.ploeg.value];
        saveToLocalStorage('shiftPattern', cyclus);
        saveToLocalStorage('startDates', datums);
        alert("Wijzigingen succesvol opgeslagen!");
        closeModal();
        generateCalendar();
    } else {
        alert('Sommige velden zijn niet correct ingevuld !');
    }
};

document.getElementById('sluiten').addEventListener('click', closeModal);

function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};

const feestdagenLijst = {
    1: (year) => {
        return new Date(year, 0, 1);
    },
    2: (year) => {
        const Y = year;
        const a = Y % 19;
        const b = Math.floor(Y / 100);
        const c = Y % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const maand = Math.floor((h + l - 7 * m + 114) / 31);
        const dag = ((h + l - 7 * m + 114) % 31) + 1;
        const paasdatum = new Date(Y, maand - 1, dag);
        const paasmaandag = new Date(paasdatum);
        paasmaandag.setDate(paasdatum.getDate() + 1);
        return paasmaandag;
    },
    3: (year) => {
        return new Date(year, 4, 1);
    },
    4: (year) => {
        const paasdatum = feestdagenLijst[2](year);
        const hemelvaart = paasdatum.setDate(paasdatum.getDate() + 38);
        return hemelvaart;
    },
    5: (year) => {
        const paasdatum = feestdagenLijst[2](year);
        const pinkster = paasdatum.setDate(paasdatum.getDate() + 49);
        return pinkster;
    },
    6: (year) => {
        return new Date(year, 6, 21);
    },
    7: (year) => {
        return new Date(year, 7, 15);
    },
    8: (year) => {
        return new Date(year, 10, 1);
    },
    9: (year) => {
        return new Date(year, 10, 11);
    },
    10: (year) => {
        return new Date(year, 11, 25);
    }
};
const formatter = new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long', // Volledige dagnaam
    day: 'numeric',  // Dag van de maand
    month: 'long',   // Volledige maandnaam
    year: 'numeric'  // Volledig jaar
});
function voegFeestdagToe(lijst, naam, datum) {
    const feestdag = document.createElement('li');
    feestdag.classList.add('feestdag');
    const naamSpan = document.createElement('span');
    naamSpan.textContent = naam;
    naamSpan.classList.add('spanLinks');
    const datumSpan = document.createElement('span');
    datumSpan.textContent = datum;
    datumSpan.classList.add('spanRechts');
    feestdag.appendChild(naamSpan);
    feestdag.appendChild(datumSpan);
    lijst.appendChild(feestdag);
};
function voegFeestdagenToe(lijst, year) {
    const oldList = DOM.overlay.querySelector('.feestdagen');
    if(oldList) DOM.overlay.removeChild(oldList);
    voegFeestdagToe(lijst, 'Nieuwjaarsdag', formatter.format(feestdagenLijst[1](year)));
    voegFeestdagToe(lijst, 'Paasmaandag', formatter.format(feestdagenLijst[2](year)));
    voegFeestdagToe(lijst, 'Feest van de Arbeid', formatter.format(feestdagenLijst[3](year)));
    voegFeestdagToe(lijst, 'O.L.V. Hemelvaart', formatter.format(feestdagenLijst[4](year)));
    voegFeestdagToe(lijst, 'Pinkstermaandag', formatter.format(feestdagenLijst[5](year)));
    voegFeestdagToe(lijst, 'Nationale Feestdag', formatter.format(feestdagenLijst[6](year)));
    voegFeestdagToe(lijst, 'O.L.V. Tenhemelopneming', formatter.format(feestdagenLijst[7](year)));
    voegFeestdagToe(lijst, 'Allerheiligen', formatter.format(feestdagenLijst[8](year)));
    voegFeestdagToe(lijst, 'Wapenstilstand', formatter.format(feestdagenLijst[9](year)));
    voegFeestdagToe(lijst, 'Kerstmis', formatter.format(feestdagenLijst[10](year)));
    DOM.overlay.appendChild(lijst);
}
DOM.feestdagen.onclick = function () {
    let jaar = currentYear;
    DOM.overlay.innerHTML = '';
    DOM.overlay.innerHTML += `
        <div class="calendar-nav">
            <button class="vorig"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>
            <span id="jaar" class="month-year">${jaar}</span>
            <button class="volgend" ><i class="fa fa-chevron-right" aria-hidden="true"></i></button>
        </div>
    `;
    DOM.overlay.querySelector('button.vorig').onclick = function() {
        jaar -= 1;
        document.getElementById('jaar').textContent = jaar;
        const lijst = document.createElement('ul');
        lijst.classList.add('feestdagen');
        voegFeestdagenToe(lijst, jaar);
    }
    DOM.overlay.querySelector('button.volgend').onclick = function() {
        jaar += 1;
        document.getElementById('jaar').textContent = jaar;
        const lijst = document.createElement('ul');
        lijst.classList.add('feestdagen');
        voegFeestdagenToe(lijst, jaar);
    }

    const lijst = document.createElement('ul');
    lijst.classList.add('feestdagen');
    voegFeestdagenToe(lijst, jaar);

    toggleModal(true);
};

const calendarGenerators = {
    0: () => {
        DOM.addShift.hidden = false;
        DOM.instellingen.hidden = false;
        DOM.ploeg.hidden = false;
        DOM.legende.style.display = '';
        DOM.titel.textContent = 'Maandkalender';
        DOM.container.className = 'month-container';
        DOM.calendar.className = 'calendar';
        getSettingsFromSessionStorage();
        generateMonthCalendar(currentMonth, currentYear);
    },
    1: () => {
        DOM.addShift.hidden = true;
        DOM.instellingen.hidden = true;
        DOM.ploeg.hidden = false;
        DOM.legende.style.display = '';
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container1';
        DOM.calendar.className = 'year-calendar-grid';
        getSettingsFromSessionStorage();
        generateYearCalendar(currentYear);
    },
    2: () => {
        DOM.addShift.hidden = true;
        DOM.instellingen.hidden = true;
        DOM.ploeg.hidden = false;
        DOM.legende.style.display = 'none';
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container2';
        DOM.calendar.className = 'year-calendar-table';
        getSettingsFromSessionStorage();
        generateYearCalendarTable(currentYear);
    },
    3: () => {
        DOM.addShift.hidden = true;
        DOM.instellingen.hidden = true;
        DOM.ploeg.hidden = true;
        DOM.legende.style.display = 'none';
        DOM.titel.textContent = 'Teamkalender';
        DOM.container.className = 'team-container';
        DOM.calendar.className = 'team-calendar-table';
        getSettingsFromSessionStorage();
        generateTeamCalendar(currentMonth, currentYear);
    }
};

function generateCalendar() {
    if (calendarGenerators[tabBlad]) {
        calendarGenerators[tabBlad]();
    } else {
        console.error(`Geen kalendergenerator gevonden voor blad: ${tabBlad}`);
    }
};

function getSettingsFromSessionStorage() {
    const instellingen = JSON.parse(sessionStorage.getItem('standaardInstellingen')) || defaultSettings;
    let instelling = instellingen.find(item => item.pagina === tabBlad);
    selectedPloeg = instelling.ploeg;
    DOM.ploeg.value = selectedPloeg;
    startDate = startDates[selectedPloeg];
    currentMonth = instelling.maand;
    currentYear = instelling.jaar;
}

function updateSessionStorage() {
    let instellingen = JSON.parse(sessionStorage.getItem('standaardInstellingen')) || defaultSettings;
    let instelling = instellingen.find(item => item.pagina === tabBlad);
    instelling.ploeg = selectedPloeg;
    instelling.maand = currentMonth;
    instelling.jaar = currentYear;

    saveToSessionStorage('standaardInstellingen', instellingen);
}



function populateDropdowns() {
    // Maanden toevoegen
    const months = [
        "januari", "februari", "maart", "april", "mei", "juni",
        "juli", "augustus", "september", "oktober", "november", "december"
    ];
    monthSelect.innerHTML = "";
    months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = month;
        option.style.color = 'black';
        if (index === currentMonth) option.selected = true;
        monthSelect.appendChild(option);
    });

    // Jaren toevoegen (bijv. van 2000 tot 2030)
    yearSelect.innerHTML = "";
    for (let year = 2010; year <= 2040; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        option.style.color = 'black';
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

monthYear.addEventListener("click", () => {
    monthYear.style.color = 'transparent';
    const rect = monthYear.getBoundingClientRect();
    DOM.dropdowns.style.top = `${rect.top + window.scrollY - 10}px`;
    DOM.dropdowns.style.left = `${rect.left + window.scrollX + Math.round(rect.width/2 - DOM.dropdowns.style.width/2)}px`;
    DOM.selectOverlay.style.display = 'block';
    populateDropdowns();
    DOM.dropdowns.classList.toggle("visible");
    if(tabBlad === 0 || tabBlad === 3) {
        monthSelect.classList.toggle("visible");
    }
    yearSelect.classList.toggle('visible');
});

// Verberg de dropdowns als er buiten wordt geklikt
document.addEventListener("click", (event) => {
    if (!dropdowns.contains(event.target) && event.target !== monthYear && event.target !== DOM.instellingen) {
        monthYear.style.color = '';
        DOM.selectOverlay.style.display = 'none';
        DOM.dropdowns.classList.remove("visible");
        monthSelect.classList.remove("visible");
        yearSelect.classList.remove("visible");
    }
});

monthSelect.addEventListener("change", (event) => {
    currentMonth = parseInt(event.target.value, 10);
    updateSessionStorage();
    generateCalendar();
});

yearSelect.addEventListener("change", (event) => {
    currentYear = parseInt(event.target.value, 10);
    updateSessionStorage();
    generateCalendar();
});


function triggerPrev() {
    if(tabBlad === 0 || tabBlad === 3) {
        currentMonth = (currentMonth - 1 + 12) % 12;
        if (currentMonth === 11) currentYear -= 1;
    } else {
        currentYear -= 1;
    }
    updateSessionStorage();
    generateCalendar();
};

function triggerNext() {
    if(tabBlad === 0 || tabBlad === 3) {
        currentMonth = (currentMonth + 1) % 12;
        if (currentMonth === 0) currentYear += 1;
    } else {
        currentYear += 1;
    }
    updateSessionStorage();
    generateCalendar();
};
DOM.prev.addEventListener("click", triggerPrev);
DOM.next.addEventListener("click", triggerNext);

maakLegende();
populateDropdowns();
generateCalendar();












