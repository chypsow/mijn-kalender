import { getDaysSinceStart, getNaamBijSymbool, shiftPattern, startDate, monthYear, feestdagenLijstDatums } from "./ploegenRooster.js";

export function updateCalendarWithoutHolidays(year) {
  const hollydays = feestdagenLijstDatums(year).map(date => date.toDateString());
  const monthElementen = document.querySelectorAll('#calendar .row');
  monthElementen.forEach((month, index) => {
    const dayElementen = month.querySelectorAll('.cell');
    dayElementen.forEach((day, i) => {
      const myDate = new Date(year, index-1, i);
      if(i > 0) {
        if(hollydays.includes(myDate.toDateString())) {
          day.classList.remove('hollyday');
          if(day.textContent.includes('fd')) day.textContent = day.textContent.slice(0, -5);
        }
      }
    });
  });
}

export function updateCalendarWithHolidays(year) {
  const hollydays = feestdagenLijstDatums(year).map(date => date.toDateString());
  const monthElementen = document.querySelectorAll('#calendar .row');
  monthElementen.forEach((month, index) => {
    const dayElementen = month.querySelectorAll('.cell');
    dayElementen.forEach((day, i) => {
      const myDate = new Date(year, index-1, i);
      if(i > 0) {
        if(hollydays.includes(myDate.toDateString())) {
          if(day.textContent !== 'x' && day.textContent !== 'DT') {
            day.classList.add('hollyday');
          }
          day.textContent += ' - fd';
        }
      }
    });
  });
}

export function updatePloegYearCalendarTable(year) {
  const monthElementen = document.querySelectorAll('#calendar .row');
  monthElementen.forEach((month, index) => {
    const dayElementen = month.querySelectorAll('.cell');
    dayElementen.forEach((day, i) => {
      if(i > 0) {
        day.textContent = '';
        day.className = '';
        day.classList.add('cell');
        const currentDate = new Date(year, index-1, i);
        const daysSinceStart = getDaysSinceStart(currentDate, startDate);
        if(daysSinceStart >= 0) {
          const shiftIndex = daysSinceStart % shiftPattern.length;
          const shift = shiftPattern[shiftIndex];
          day.textContent = shift; // Voeg de shiftletter toe
          //day.dataset.team = selectedPloeg;
          if(shift === 'x' || shift === 'DT') {
            const shiftClass = `shift-${getNaamBijSymbool(shift)}`;
            day.classList.add(shiftClass);
          }
        }
      }
    });
  });
};

export function generateYearCalendarTable(year) {
  calendar.innerHTML = ""; // Maak de kalender leeg
  
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
      dayCell.dataset.datum =`${year},${month},${day}`;
      //dayCell.dataset.team = selectedPloeg;
      const currentDate = new Date(year, month, day);
      // Controleer of de datum geldig is (voor maanden met minder dan 31 dagen)
      if (currentDate.getMonth() === month) {
        // Bereken de ploeg
        const daysSinceStart = getDaysSinceStart(currentDate, startDate);
        if(daysSinceStart >= 0) {
          const shiftIndex = daysSinceStart % shiftPattern.length;
          const shift = shiftPattern[shiftIndex];
          const shiftClass = `shift-${getNaamBijSymbool(shift)}`;
          dayCell.textContent = shift; // Voeg de shiftletter toe
          if(shift === 'x' || shift === 'DT') dayCell.classList.add(shiftClass);
          //dayCell.classList.add(shiftClass); // Voeg de kleurklasse toe
        }
      } else {
        dayCell.classList.remove("cell");
        dayCell.classList.add("emptyDay");
      }
      monthRow.appendChild(dayCell);
    }
    calendar.appendChild(monthRow);
  }
  monthYear.textContent = year;
}