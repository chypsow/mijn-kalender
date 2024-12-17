import { DOM, shiftPattern, startDates, defaultSettings } from "./main.js";
import { getDaysSinceStart, getSettingsFromSessionStorage } from "./functies.js";
import { verlofdagenPloegen } from './componentenMaken.js'
import { feestdagenLijstDatums } from "./makeModalHolidays.js";

export function updateYearCalendarTable() {
  const year = getSettingsFromSessionStorage(0, defaultSettings).currentYear;
  DOM.monthYear.textContent = year;
  const selectedPloeg = getSettingsFromSessionStorage(0, defaultSettings).selectedPloeg;
  const hollydays = feestdagenLijstDatums(year).map(date => date.toLocaleDateString());
  const geselecteerd = JSON.parse(sessionStorage.getItem('selectedCell'));
  let selectActief = false;
  if(geselecteerd) selectActief = true;
  const monthElementen = document.querySelectorAll('#calendar .row');
  monthElementen.forEach((month, index) => {
    const dayElementen = month.querySelectorAll('.cell');
    dayElementen.forEach((day, i) => {
      if(i > 0) {
        day.textContent = '';
        day.dataset.shift = '';
        day.dataset.datum = '';
        day.className = '';
        day.classList.add('cell');
        const currentDate = new Date(year, index-1, i);
        if (currentDate.getMonth() === index-1) {
          shiftenInvullen(day, currentDate, hollydays, selectedPloeg);
          if(selectActief) {
            if(currentDate.toLocaleDateString() === geselecteerd.datum && 
              selectedPloeg === geselecteerd.team) {
              selectActief === false;
              day.classList.add('highlight');
            }
          }
        } else {
          day.classList.add('emptyDay');
        }
      }
    });
  });
};

export function generateYearCalendarTable(year) {
  calendar.innerHTML = ""; // Maak de kalender leeg
  DOM.monthYear.textContent = year;
  const selectedPloeg = getSettingsFromSessionStorage(0, defaultSettings).selectedPloeg;
  const hollydays = feestdagenLijstDatums(year).map(date => date.toLocaleDateString());
  const geselecteerd = JSON.parse(sessionStorage.getItem('selectedCell'));
  let selectActief = false;
  if(geselecteerd) selectActief = true;

  // Header rij (1–31 voor de dagen van de maand)
  const headerRow = document.createElement("div");
  headerRow.classList.add("row");
  
  const emptyHeaderCell = document.createElement("div");
  emptyHeaderCell.classList.add("header-cell");
  headerRow.appendChild(emptyHeaderCell); // Lege cel voor de maandnamen
  
  for (let day = 1; day <= 31; day++) {
    const dayHeaderCell = document.createElement("div");
    dayHeaderCell.classList.add("header-cell");
    dayHeaderCell.textContent = day;
    headerRow.appendChild(dayHeaderCell);
  }
  calendar.appendChild(headerRow);
  
  // Genereer rijen voor elke maand
  for (let month = 0; month < 12; month++) {
    const monthRow = document.createElement("div");
    monthRow.classList.add("row");

    // Eerste cel: maandnaam
    const monthCell = document.createElement("div");
    monthCell.classList.add("cell", "month-cell");
    monthCell.textContent = new Date(year, month).toLocaleString("nl", { month: "long" });
    monthRow.appendChild(monthCell);

    // Cellen voor de dagen (1–31)
    for (let day = 1; day <= 31; day++) {
      const dayCell = document.createElement("div");
      dayCell.classList.add("cell");
      
      const currentDate = new Date(year, month, day);
      // Controleer of de datum geldig is (voor maanden met minder dan 31 dagen)
      if (currentDate.getMonth() === month) {
        shiftenInvullen(dayCell, currentDate, hollydays, selectedPloeg);
        if(selectActief) {
          if(currentDate.toLocaleDateString() === geselecteerd.datum && 
            selectedPloeg === geselecteerd.team) {
            selectActief === false;
            dayCell.classList.add('highlight');
          }
        }
      } else {
        dayCell.classList.add("emptyDay");
      }
      monthRow.appendChild(dayCell);
    }
    calendar.appendChild(monthRow);
  }
};

function shiftenInvullen(elt, date, hollydays, ploeg) {
  const startDate = startDates[ploeg];
  const daysSinceStart = getDaysSinceStart(date, startDate);
  if(daysSinceStart >= 0) {
    const myDate = date.toLocaleDateString();
    const shiftIndex = daysSinceStart % shiftPattern.length;
    let shift = shiftPattern[shiftIndex];
    if(shift === 'x') elt.classList.add('shift-thuis');
    if(hollydays.includes(myDate)) {
      shift += '- fd';
    }
    elt.textContent = shift;
    elt.dataset.shift = shift;
    elt.dataset.datum =myDate;
    voegVerlofdagToeVolgensLocalStorage(ploeg, elt);
  }
};

function voegVerlofdagToeVolgensLocalStorage(ploeg, cell) {
  const ploegKey = `verlofdagenPloeg${ploeg}`;
  verlofdagenPloegen[ploegKey].forEach(obj => { 
    if(obj.datum === cell.dataset.datum) {
      cell.textContent = obj.soort;
      cell.classList.add(obj.soort);
    }
  });
};