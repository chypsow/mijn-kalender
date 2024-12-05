import { getDaysSinceStart, getNaamBijSymbool, shiftPattern, startDate ,  monthYear} from "./ploegenRooster.js";

export function generateYearCalendar(year) {
  calendar.innerHTML = ""; // Maak de kalender leeg

  for (let month = 0; month < 12; month++) {
    const monthContainer = document.createElement("div");
    monthContainer.classList.add("month");

    // Voeg de maandnaam toe
    const monthName = document.createElement("div");
    monthName.classList.add("month-name");
    monthName.textContent = new Date(year, month).toLocaleString("nl", { month: "long" });
    monthContainer.appendChild(monthName);

    const monthDays = document.createElement('div');
    monthDays.classList.add('month-days');
    monthContainer.appendChild(monthDays);

    const dagen = ['ma', 'di', 'wo', 'do', 'vr','za', 'zo'];
    dagen.forEach(dag => {
      const header = document.createElement('div');
      header.classList.add('header');
      header.textContent = dag;
      monthDays.appendChild(header);
    });

    // Voeg de dagen van de maand toe
    const calendarGrid = document.createElement("div");
    calendarGrid.classList.add("calendar-grid");

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // Voeg lege cellen toe voor dagen vóór de eerste dag
    for (let i = 0; i < (firstDay + 6) % 7; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("empty");
        calendarGrid.appendChild(emptyCell);
    }

    // Voeg dagen toe
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement("div");
      dayCell.classList.add("day");
      dayCell.textContent = day;

      // Bereken de ploeg
      const currentDate = new Date(year, month, day);
      const daysSinceStart = getDaysSinceStart(currentDate, startDate);
      if(daysSinceStart >= 0) {
        const shiftIndex = daysSinceStart % shiftPattern.length;
        const shift = shiftPattern[shiftIndex];
        const shiftClass = `shift-${getNaamBijSymbool(shift)}`;
        dayCell.classList.add(shiftClass);
      }
      calendarGrid.appendChild(dayCell);
    }

    monthContainer.appendChild(calendarGrid);
    calendar.appendChild(monthContainer);
  }
  monthYear.textContent = year;
}