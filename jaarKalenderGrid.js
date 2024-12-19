import { DOM, shiftPattern, ploegenGegevens, startDates, defaultSettings } from "./main.js";
import { getDaysSinceStart, getNaamBijSymbool, getSettingsFromLocalStorage } from "./functies.js";
import { tabBlad } from "./componentenMaken.js";

export function updateYearCalendarGrid() {
  const setting = getSettingsFromLocalStorage(tabBlad, defaultSettings);
  const selectedPloeg = setting.selectedPloeg;
  const year = setting.currentYear;
  DOM.monthYear.textContent = year;
  const startDate = startDates[selectedPloeg];
  const totalCells = 42;
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

export function generateYearCalendar(year) {
  calendar.innerHTML = "";
  DOM.monthYear.textContent = year;
  const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
  const startDate = startDates[selectedPloeg];
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