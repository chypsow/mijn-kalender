import { DOM, shiftPattern, ploegenGegevens, startDates } from "./main.js";
import { getDaysSinceStart, getNaamBijSymbool } from "./functies.js";

export function updateMonthCalendar(selectedPloeg, year, month) {
    //const settings = getSettingsFromLocalStorage(tabBlad, defaultSettings);
    //const month = settings.currentMonth;
    //const year = settings.currentYear;
    const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month));
    DOM.monthYear.innerHTML = `${monthName}&nbsp;&nbsp;&nbsp;${year}`;
    //const selectedPloeg = settings.selectedPloeg;
    const startDate = startDates[selectedPloeg];
    const totalCells = 42;
    const firstDay = new Date(year, month, 1).getDay();
    const firstDayMondayBased = (firstDay + 6) % 7; // Pas aan voor maandag als startdag
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayElementen = document.querySelectorAll('#calendar .day-groot, #calendar .emptyCellGroot');
    let counter = 0;
    const vandaag = new Date();
    for(let i = 0; i < firstDayMondayBased; i++) {
        const myDay = dayElementen[counter];
        counter++;
        myDay.textContent = 0;
        myDay.className = '';
        myDay.classList.add('emptyCellGroot');
    }
    for(let day = 1; day <= daysInMonth; day++) {
        const myDay = dayElementen[counter];
        counter++;
        
        myDay.className = '';
        myDay.textContent = day;
        myDay.classList.add('day-groot');
        
        const currentDate = new Date(year, month, day);
        const daysSinceStart = getDaysSinceStart(currentDate, startDate);
        if(daysSinceStart >= 0) {
          const shiftIndex = daysSinceStart % shiftPattern.length;
          const shift = shiftPattern[shiftIndex];
          const shiftClass = `shift-${getNaamBijSymbool(ploegenGegevens, shift)}`;
          myDay.classList.add(shiftClass);
          if(vandaag.toLocaleDateString("nl-BE") === currentDate.toLocaleDateString("nl-BE")) myDay.classList.add("vandaag");
        }
    }
    const remainingCells = totalCells - firstDayMondayBased - daysInMonth;
    for (let i = 0; i < remainingCells; i++) {
      const myDay = dayElementen[counter];
      counter++;
      myDay.textContent = 0;
      myDay.className = '';
      myDay.classList.add('emptyCellGroot');
    }
}


export function generateMonthCalendar(selectedPloeg, year, month) {
    calendar.innerHTML = '';
    const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month));
    DOM.monthYear.innerHTML = `${monthName}&nbsp;&nbsp;&nbsp;${year}`;
    //const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const startDate = startDates[selectedPloeg];
    // Eerste dag van de maand en aantal dagen in de maand
    const firstDay = new Date(year, month, 1).getDay();
    const firstDayMondayBased = (firstDay + 6) % 7; // Pas aan voor maandag als startdag
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Headers voor de dagen van de week
    const daysOfWeek = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.classList.add('header');
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Lege vakjes vóór de eerste dag van de maand
    for (let i = 0; i < firstDayMondayBased; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.textContent = 0;
        emptyCell.classList.add("emptyCellGroot");
        calendar.appendChild(emptyCell);
    }

    // Dagen van de maand
    const vandaag = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.textContent = day; // Toon de dag
        cell.classList.add('day-groot');
        // Bereken de ploeg
        const currentDate = new Date(year, month, day);
        const daysSinceStart = getDaysSinceStart(currentDate, startDate);
        if(daysSinceStart >= 0) {
            const shiftIndex = daysSinceStart % shiftPattern.length;
            const shift = shiftPattern[shiftIndex];
            const shiftClass = `shift-${getNaamBijSymbool(ploegenGegevens, shift)}`;
            // Voeg de dag en shift toe aan de cel
            cell.classList.add(shiftClass); // Voeg de juiste kleur toe
            if(vandaag.toLocaleDateString("nl-BE") === currentDate.toLocaleDateString("nl-BE")) cell.classList.add("vandaag");
        }
        calendar.appendChild(cell);
    }

    //Lege cellen om het grid compleet te maken
    const totalCells = 42
    const remainingCells = totalCells - (firstDay + 6) % 7 - daysInMonth; // Alleen vullen als er resterende cellen zijn
    for (let i = 0; i < remainingCells; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.textContent = 0;
        emptyCell.classList.add("emptyCellGroot");
        calendar.appendChild(emptyCell);
    }

    // Toon de maand en het jaar
    
    //monthYear.textContent = `${monthSelect.options[monthSelect.selectedIndex].text} ${year}`;
}
