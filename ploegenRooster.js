import { generateTeamCalendar } from './teamKalender.js';
import { generateYearCalendar } from './jaarKalender1.js';
import { generateYearCalendarTable } from './jaarKalender2.js';
import { generateMonthCalendar } from './maandKalender.js';

const week1 = ['N', 'N', 'N', 'x', 'x', 'V', 'V-12'];
const week2 = ['L', 'L', 'x', 'N', 'N', 'N', 'N-12'];
const week3 = ['x', 'x', 'L', 'L', 'L', 'L', 'x'];
const week4 = ['V', 'V', 'V', 'V', 'V', 'x', 'x'];
const week5 = ['D', 'D', 'D', 'D', 'D', 'x', 'x'];
const ploegSchema = [...week1, ...week2, ...week3, ...week4, ...week5];

const startDatums = {
    1: "2023-01-09", 
    2: "2023-01-30", 
    3: "2023-01-02", 
    4: "2023-01-16", 
    5: "2023-01-23"
};

export const patternClass = {
    'N':'night', 'N-12':'night-12', 'V':'early', 'V-12':'early-12',
    'x':'home', 'L':'late', 'D':'day', 'DT':'deeltijds'
    };
export const monthYear = document.getElementById('month-year');
export let shiftPattern = JSON.parse(localStorage.getItem("shiftPattern")) || ploegSchema;
export let startDates = JSON.parse(localStorage.getItem("startDates")) || startDatums;
export let startDate = startDates[1];

export function getDaysSinceStart(date, date0) {
    if (typeof date0 === "string") {
        date0 = new Date(date0);
    }
    const diffTime = date - date0;
    return Math.round(diffTime / (1000 * 60 * 60 * 24)); // Dagen verschil
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Elementen in de DOM
const DOM = {
    prev: document.getElementById('prev'),
    next: document.getElementById('next'),
    topNav: document.getElementById("top-nav"),
    container: document.getElementById('container'),
    ploeg: document.getElementById('ploeg'),
    titel: document.getElementById('titel'),
    ploegSysteem: document.getElementById('ploegenSysteem'),
    legende: document.getElementById('legende'),
    calendar: document.getElementById('calendar')
};

for(const btn of DOM.topNav.children) {
    btn.onclick = function() {
      for(const child of DOM.topNav.children) {
        child.classList.remove("active");
      }
      this.classList.add("active");
    }
  }

DOM.ploeg.onchange = function () {
    const selectedPloeg = this.value; 
    startDate = startDates[selectedPloeg];
    generateCalendar();
};

let blad = 0;
const bladeren = document.querySelectorAll(".side-bar a");
bladeren.forEach((elt, index) => {
    elt.addEventListener('click', () => {
        DOM.ploegSysteem.hidden = index === 0 ? false : true;
        blad = index;
        generateCalendar();
    })
});

const modalOverlay = document.getElementById("modal-overlay");
const modal = document.getElementById("modal");

function toggleModal(show) {
    modalOverlay.style.display = show ? "block" : "none";
    modal.style.display = show ? "block" : "none";
}

function closeModal() {
    toggleModal(false);
}

let count = 0;
DOM.ploegSysteem.onclick = function() {
    Object.keys(startDates).forEach(i => {
        document.getElementById(`date${i}`).value = startDates[i];
        Array.from({ length: 7 }).forEach((_, j) => {
            const dayElement = document.getElementById(`day-${i}${j + 1}`);
            if (dayElement) {
                dayElement.value = shiftPattern[count] || '';
                count++;
            }
        });
    });
    count = 0;
    toggleModal(true);
};

document.getElementById('sluiten').addEventListener('click', closeModal);
document.getElementById('opslaan').onclick = function () {
    let cyclus = [];
    let datums = {};
    for(let i = 1; i <= 5; i++) {
        const datum = document.getElementById(`date${i}`).value;
        datums[i] = datum;
        for(let j = 1; j <= 7; j++) {
            const dayElement = document.getElementById(`day-${i}${j}`);
            if (dayElement) {
                cyclus.push(dayElement.value === 'x' ? dayElement.value.toLowerCase() : dayElement.value.toUpperCase());
            } else {
                console.warn(`Element day-${i}${j} bestaat niet in de DOM.`);
            }
        }
    }
    shiftPattern = cyclus;
    startDates = datums;
    startDate = startDates[DOM.ploeg.value];
    saveToLocalStorage('shiftPattern', cyclus);
    saveToLocalStorage('startDates', datums);
    closeModal();
    generateCalendar();
}

function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

const calendarGenerators = {
    0: () => {
        DOM.ploeg.hidden = false;
        DOM.legende.style.display = '';
        DOM.titel.textContent = 'Maandkalender';
        DOM.container.className = 'month-container';
        DOM.calendar.className = 'calendar';
        generateMonthCalendar(currentMonth, currentYear);
    },
    1: () => {
        DOM.ploeg.hidden = false;
        DOM.legende.style.display = '';
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container1';
        DOM.calendar.className = 'year-calendar-grid';
        generateYearCalendar(currentYear);
    },
    2: () => {
        DOM.ploeg.hidden = false;
        DOM.legende.style.display = 'none';
        DOM.titel.textContent = 'Jaarkalender';
        DOM.container.className = 'year-container2';
        DOM.calendar.className = 'year-calendar-table';
        generateYearCalendarTable(currentYear);
    },
    3: () => {
        DOM.ploeg.hidden = true;
        DOM.legende.style.display = 'none';
        DOM.titel.textContent = 'Teamkalender';
        DOM.container.className = 'team-container';
        DOM.calendar.className = 'team-calendar-table';
        generateTeamCalendar(currentMonth, currentYear);
    }
};

function generateCalendar() {
    if (calendarGenerators[blad]) {
        calendarGenerators[blad]();
    } else {
        console.error(`Geen kalendergenerator gevonden voor blad: ${blad}`);
    }
}

function triggerPrev() {
    if(blad === 0 || blad === 3) {
        currentMonth = (currentMonth - 1 + 12) % 12;
        if (currentMonth === 11) currentYear -= 1;
        generateCalendar();
    } else {
        currentYear -= 1;
        generateCalendar();
    }
}

function triggerNext() {
    if(blad === 0 || blad === 3) {
        currentMonth = (currentMonth + 1) % 12;
        if (currentMonth === 0) currentYear += 1;
        generateCalendar();
    } else {
        currentYear += 1;
        generateCalendar();
    }
}

DOM.prev.addEventListener("click", triggerPrev);
DOM.next.addEventListener("click", triggerNext);

// Initialiseer de kalender bij het laden
generateCalendar();












