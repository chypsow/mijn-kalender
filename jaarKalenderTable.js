import { DOM, opgenomenVerlofPerPloeg } from "./main.js";
import { getDaysSinceStart, verwijderVerlofDatum, voegVerlofDatumToe, beginSaldoEnRestSaldoInvullen, getArrayValues } from "./functies.js";
import { feestdagenLijstDatums } from "./makeModalHolidays.js";
import { shiftPatroon } from "./makeModalSettings.js";

export function updateYearCalendarTable(selectedPloeg, year) {
  DOM.monthYear.textContent = year;
  const shiftPattern = getArrayValues(shiftPatroon);
  const holidays = feestdagenLijstDatums(year).map(date => date.toLocaleDateString("nl-BE"));
  const vandaag = new Date();
  const today = vandaag.toLocaleDateString("nl-BE");
  const monthElementen = document.querySelectorAll('#calendar .row');
  const weekObj = shiftPatroon.find(week => week.ploeg === selectedPloeg);
  if (!weekObj) return;
  const startDate = weekObj.startDatum;
  monthElementen.forEach((month, index) => {
    const dayElementen = month.querySelectorAll('.cell');
    dayElementen.forEach((day, i) => {
        day.textContent = '';
        day.dataset.shift = '';
        day.dataset.datum = '';
        day.className = '';
        day.classList.add('cell');
        const currentDate = new Date(year, index-1, i+1);
        if (currentDate.getMonth() === index-1) {
          shiftenInvullen(day, startDate, currentDate, holidays, selectedPloeg, shiftPattern);
          if (today === currentDate.toLocaleDateString("nl-BE")) {
            day.classList.add("today");
          }
        } else {
          day.classList.add('emptyDay');
        }
    });
  });

  const geselecteerd = JSON.parse(sessionStorage.getItem('selectedCells') || 'null');
  const selectActief = Array.isArray(geselecteerd) && geselecteerd.length > 0;
  if(selectActief) {
    const activeTeam = geselecteerd[0].team;
    if(activeTeam !== selectedPloeg) {
        beginSaldoEnRestSaldoInvullen(year, selectedPloeg);
        return;
    }
    geselecteerd.forEach(selectedCell => {
      const dayElement = document.querySelector(`.cell[data-datum="${selectedCell.datum}"]`);
      if(dayElement) {
        dayElement.classList.add('highlight');
      }
    }
    );
  }
  beginSaldoEnRestSaldoInvullen(year, selectedPloeg);
};

export function generateYearCalendarTable(selectedPloeg, year) {
  calendar.innerHTML = "";
  DOM.monthYear.textContent = year;
  const shiftPattern = getArrayValues(shiftPatroon);
  const holidays = feestdagenLijstDatums(year).map(date => date.toLocaleDateString("nl-BE"));
  const vandaag = new Date();
  const today = vandaag.toLocaleDateString("nl-BE");
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
  
  const weekObj = shiftPatroon.find(week => week.ploeg === selectedPloeg);
  if (!weekObj) return;
  const startDate = weekObj.startDatum;

  // Genereer rijen voor elke maand
  for (let month = 0; month < 12; month++) {
    const monthRow = document.createElement("div");
    monthRow.classList.add("row");

    // Eerste cel: maandnaam
    const monthCell = document.createElement("div");
    monthCell.classList.add("month-cell");
    monthCell.textContent = new Date(year, month).toLocaleString("nl", { month: "long" });
    monthRow.appendChild(monthCell);

    // Cellen voor de dagen (1–31)
    for (let day = 1; day <= 31; day++) {
      const dayCell = document.createElement("div");
      dayCell.classList.add("cell");
      dayCell.dataset.rij = month
      dayCell.dataset.kolom = day-1;
      const currentDate = new Date(year, month, day);
      // Controleer of de datum geldig is (voor maanden met minder dan 31 dagen)
      if (currentDate.getMonth() === month) {
        shiftenInvullen(dayCell, startDate, currentDate, holidays, selectedPloeg, shiftPattern);
        if (today === currentDate.toLocaleDateString("nl-BE")) {
          dayCell.classList.add("today");
        }
      } else {
        dayCell.classList.add("emptyDay");
      }
      monthRow.appendChild(dayCell);
    }
    calendar.appendChild(monthRow);
  }

  const geselecteerd = JSON.parse(sessionStorage.getItem('selectedCells') || 'null');
  const selectActief = Array.isArray(geselecteerd) && geselecteerd.length > 0;
  if(selectActief) {
    const activeTeam = geselecteerd[0].team;
    if(activeTeam !== selectedPloeg) return;
    geselecteerd.forEach(selectedCell => {
      const dayElement = document.querySelector(`.cell[data-datum="${selectedCell.datum}"]`);
      if(dayElement) {
        dayElement.classList.add('highlight');
      }
    }
    );
  }
};

function shiftenInvullen(elt, startDate, date, holidays, ploeg, shiftPattern) {
  const cyclus = shiftPattern.length;
  const daysSinceStart = getDaysSinceStart(date, startDate);
  if (daysSinceStart < 0) return;

  const myDate = date.toLocaleDateString("nl-BE");
  const shiftIndex = daysSinceStart % cyclus;
  let shift = shiftPattern[shiftIndex];
  const isHoliday = holidays.includes(myDate);
  const isReedsOpgenomen = () => {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const array = opgenomenVerlofPerPloeg[ploegKey];
    return array.some(obj => obj.datum === myDate);
  };

  if (isHoliday) {
     //disable verlof tijdens een inactiviteitsdag & enable Automatisch BF invullen als 
     // een feestdag op een D shift valt (2 keuzes moeten samen verwerkt worden)
    /*if (shift === 'x') {
        setShiftProperties(elt, 'x- fd', myDate, true);
        verwijderVerlofDatum(ploeg, myDate);
        return;
    }
    if (shift === 'D') {
        setShiftProperties(elt, 'D- fd', myDate, false);
        if(!isReedsOpgenomen()) voegVerlofDatumToe(ploeg, myDate, 'BF');
        voegVerlofdagToeVolgensLocalStorage(ploeg, elt, isHoliday);
        return; // Geen verdere acties nodig
    }*/
    setShiftProperties(elt, `${shift}- fd`, myDate, shift === 'x' ? true : false);
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
  const vrijeDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'hp'];
  const herplanningen = ['N12','N','V12','V','L','D','x', 'R', 'OPL']
  const ploegKey = `verlofdagenPloeg${ploeg}`;
  opgenomenVerlofPerPloeg[ploegKey].forEach(obj => { 
    if(obj.datum === cell.dataset.datum) {
      cell.textContent = isHoliday ? `${obj.soort}- fd` : obj.soort;
      const txt = cell.textContent;
      const len = txt.length;
      herplanningen.includes(txt) || herplanningen.includes(txt.slice(0, len - 4)) ? cell.classList.add('hp') : cell.classList.add(obj.soort);
      if(cell.classList.contains('x') && (vrijeDagen.includes(obj.soort) || herplanningen.includes(obj.soort))) {
        cell.classList.remove('x');
      }
    }
    
  });
};