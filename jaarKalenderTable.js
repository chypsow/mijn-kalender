import { DOM, shiftPattern, startDates, defaultSettings, opgenomenVerlofPerPloeg } from "./main.js";
import { getDaysSinceStart, getSettingsFromLocalStorage, verwijderVerlofDatum, voegVerlofDatumToe, behandelenNaAllesTerugstellen } from "./functies.js";
import { feestdagenLijstDatums } from "./makeModalHolidays.js";
import { tabBlad } from "./componentenMaken.js";

export function updateYearCalendarTable() {
  const setting = getSettingsFromLocalStorage(tabBlad, defaultSettings);
  const selectedPloeg = setting.selectedPloeg;
  const year = setting.currentYear;
  DOM.monthYear.textContent = year;
  const holidays = feestdagenLijstDatums(year).map(date => date.toLocaleDateString());
  const geselecteerd = JSON.parse(sessionStorage.getItem('selectedCell'));
  let selectActief = false;
  if(geselecteerd) selectActief = true;
  const cyclus = shiftPattern.length;
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
          shiftenInvullen(day, currentDate, holidays, selectedPloeg, cyclus);
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
  behandelenNaAllesTerugstellen(selectedPloeg);
};

export function generateYearCalendarTable(year) {
  calendar.innerHTML = "";
  DOM.monthYear.textContent = year;
  const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
  const holidays = feestdagenLijstDatums(year).map(date => date.toLocaleDateString());
  const geselecteerd = JSON.parse(sessionStorage.getItem('selectedCell'));
  let selectActief = false;
  if(geselecteerd) selectActief = true;
  const cyclus = shiftPattern.length;
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
        shiftenInvullen(dayCell, currentDate, holidays, selectedPloeg, cyclus);
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

function shiftenInvullen(elt, date, holidays, ploeg, cyclus) {
  const startDate = startDates[ploeg];
  const daysSinceStart = getDaysSinceStart(date, startDate);
  if (daysSinceStart < 0) return;

  const myDate = date.toLocaleDateString();
  const shiftIndex = daysSinceStart % cyclus;
  let shift = shiftPattern[shiftIndex];
  const isHoliday = holidays.includes(myDate);
  const isReedsOpgenomen = () => {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const array = opgenomenVerlofPerPloeg[ploegKey];
    return array.some(obj => obj.datum === myDate);
  };

  if (isHoliday) {
    if (shift === 'x' && !isReedsOpgenomen()) {
        setShiftProperties(elt, 'x- fd', myDate, true);
        verwijderVerlofDatum(ploeg, myDate);
        return;
    }
    if (shift === 'D') {
        setShiftProperties(elt, 'D- fd', myDate, false);
        if(!isReedsOpgenomen()) voegVerlofDatumToe(ploeg, myDate, 'BF');
        voegVerlofdagToeVolgensLocalStorage(ploeg, elt, isHoliday);
        return; // Geen verdere acties nodig
    }
    setShiftProperties(elt, `${shift}- fd`, myDate, false);
    voegVerlofdagToeVolgensLocalStorage(ploeg, elt, isHoliday);
    return;
  }

  // Thuiswerkdagen (geen feestdag, maar shift is 'x')
  if (shift === 'x') {
      setShiftProperties(elt, 'x', myDate, true);
  } else {
  // Standaard gedrag
    setShiftProperties(elt, shift, myDate, false);
  }
  
  voegVerlofdagToeVolgensLocalStorage(ploeg, elt, isHoliday);
};

// Hulpfunctie om eigenschappen van een element in te stellen
function setShiftProperties(elt, shift, date, isHome) {
  elt.classList.toggle('x', isHome); // Voeg class toe of verwijder deze
  elt.textContent = shift;
  elt.dataset.shift = shift;
  elt.dataset.datum = date;
};

function voegVerlofdagToeVolgensLocalStorage(ploeg, cell, isHoliday) {
  const herplanningen = ['N12','N','V12','V','L','D','x','OPL']
  const ploegKey = `verlofdagenPloeg${ploeg}`;
  opgenomenVerlofPerPloeg[ploegKey].forEach(obj => { 
    if(obj.datum === cell.dataset.datum) {
      cell.textContent = isHoliday ? `${obj.soort}- fd` : obj.soort;
      const txt = cell.textContent;
      const len = txt.length;
      herplanningen.includes(txt) || herplanningen.includes(txt.slice(0, len - 4)) ? 
      cell.classList.add('hp') : cell.classList.add(obj.soort);
    }
  });
};