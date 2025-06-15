import { DOM, ploegenGegevens } from "./main.js";
import { getDaysSinceStart, getNaamBijSymbool, getArrayValues } from "./functies.js";
import { shiftPatroon, startDatums } from "./makeModalSettings.js";

export function updateYearCalendarGrid(selectedPloeg, year) {
  DOM.monthYear.textContent = year;
  
  const ploegObj = startDatums.find(obj => obj.ploeg === selectedPloeg);
  if (!ploegObj) return;
  const startDate = ploegObj.startDatum;
  const shiftPattern = getArrayValues(shiftPatroon);
  const totalCells = 42;
  const vandaag = new Date();
  const monthElementen = document.querySelectorAll('#calendar .month');
  monthElementen.forEach((month, index) => {
    const monthDays = month.querySelectorAll('.emptyCellKlein, .day-klein');
    const daysInMonth = new Date(year, index+1, 0).getDate();
    const firstDay = new Date(year, index, 1).getDay();
    let counter = 0;
    for(let i = 0; i < (firstDay + 6) % 7; i++) {
      const myDay = monthDays[counter];
      counter++;
      myDay.textContent = 0;
      myDay.className = '';
      myDay.classList.add('emptyCellKlein');
    }
    for(let day = 1; day <= daysInMonth; day++) {
      const myDay = monthDays[counter];
      counter++;
      
      myDay.className = '';
      myDay.textContent = day;
      myDay.classList.add('day-klein');

      const currentDate = new Date(year, index, day);
      const daysSinceStart = getDaysSinceStart(currentDate, startDate);
      if(daysSinceStart >= 0) {
        const shiftIndex = daysSinceStart % shiftPattern.length;
        const shift = shiftPattern[shiftIndex];
        const shiftClass = `shift-${getNaamBijSymbool(ploegenGegevens, shift)}`;
        myDay.classList.add(shiftClass);
        if(vandaag.toLocaleDateString("nl-BE") === currentDate.toLocaleDateString("nl-BE")) myDay.classList.add("vandaag");
      }
    }
    const remainingCells = totalCells - (firstDay + 6) % 7 - daysInMonth;
    for (let i = 0; i < remainingCells; i++) {
      const myDay = monthDays[counter];
      counter++;
      myDay.textContent = 0;
      myDay.className = '';
      myDay.classList.add('emptyCellKlein');
    }
  });
};

export function generateYearCalendar(selectedPloeg, year) {
  calendar.innerHTML = "";
  DOM.monthYear.textContent = year;
  
  const ploegObj = startDatums.find(obj => obj.ploeg === selectedPloeg);
  if (!ploegObj) return;
  const startDate = ploegObj.startDatum;
  const shiftPattern = getArrayValues(shiftPatroon);
  const vandaag = new Date();
  for (let month = 0; month < 12; month++) {
    const monthContainer = document.createElement("div");
    monthContainer.classList.add("month");

    // Voeg de maandnaam toe
    const monthName = document.createElement("div");
    monthName.classList.add("month-name");
    monthName.textContent = new Date(year, month).toLocaleString("nl", { month: "long" });
    monthContainer.appendChild(monthName);

    // Voeg header toe
    const monthDays = document.createElement('div');
    monthDays.classList.add('month-days');
    const dagen = ['ma', 'di', 'wo', 'do', 'vr','za', 'zo'];
    dagen.forEach(dag => {
      const header = document.createElement('div');
      header.textContent = dag;
      monthDays.appendChild(header);
    });
    monthContainer.appendChild(monthDays);

    // Voeg de dagen van de maand toe
    const calendarGrid = document.createElement("div");
    calendarGrid.classList.add("calendar-grid");

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // Voeg lege cellen toe voor dagen vóór de eerste dag
    for (let i = 0; i < (firstDay + 6) % 7; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.textContent = 0;
        emptyCell.classList.add("emptyCellKlein");
        calendarGrid.appendChild(emptyCell);
    }

    // Voeg dagen toe
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement("div");
      dayCell.classList.add("day-klein");
      dayCell.textContent = day;

      // Bereken de ploeg
      const currentDate = new Date(year, month, day);
      const daysSinceStart = getDaysSinceStart(currentDate, startDate);
      if(daysSinceStart >= 0) {
        const shiftIndex = daysSinceStart % shiftPattern.length;
        const shift = shiftPattern[shiftIndex];
        const shiftClass = `shift-${getNaamBijSymbool(ploegenGegevens, shift)}`;
        dayCell.classList.add(shiftClass);
        if(vandaag.toLocaleDateString("nl-BE") === currentDate.toLocaleDateString("nl-BE")) dayCell.classList.add("vandaag");
      }
      calendarGrid.appendChild(dayCell);
    }

    // Lege cellen om het grid compleet te maken
    const totalCells = 42;
    const remainingCells = totalCells - (firstDay + 6) % 7 - daysInMonth;
    for (let i = 0; i < remainingCells; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.textContent = 0;
        emptyCell.classList.add("emptyCellKlein");
        calendarGrid.appendChild(emptyCell);
    }

    monthContainer.appendChild(calendarGrid);
    calendar.appendChild(monthContainer);
  }
};