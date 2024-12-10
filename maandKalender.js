import { getDaysSinceStart, getNaamBijSymbool, shiftPattern, startDate ,  monthYear } from "./ploegenRooster.js";

export function updatePloegMonthCalendar(month, year) {
    const dayElementen = document.querySelectorAll('#calendar .day-groot');
    dayElementen.forEach(day => {
        const myDay = parseInt(day.textContent);
        const currentDate = new Date(year, month, myDay);
        const daysSinceStart = getDaysSinceStart(currentDate, startDate);
        if(daysSinceStart >= 0) {
            const shiftIndex = daysSinceStart % shiftPattern.length;
            const shift = shiftPattern[shiftIndex];
            const shiftClass = `shift-${getNaamBijSymbool(shift)}`;
            day.className = '';
            day.classList.add('day-groot');
            day.classList.add(shiftClass);
        }
    });
}


export function generateMonthCalendar(month, year) {
    calendar.innerHTML = '';

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
        //emptyCell.classList.add("emptyCell");
        calendar.appendChild(emptyCell);
    }

    // Dagen van de maand
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
            const shiftClass = `shift-${getNaamBijSymbool(shift)}`;
            // Voeg de dag en shift toe aan de cel
            cell.classList.add(shiftClass); // Voeg de juiste kleur toe
        }
        calendar.appendChild(cell);
    }

    // Lege cellen om het grid compleet te maken
    /*const totalCells = firstDayMondayBased + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7; // Alleen vullen als er resterende cellen zijn
    for (let i = 0; i < remainingCells; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add("emptyCell");
        calendar.appendChild(emptyCell);
    }*/

    // Toon de maand en het jaar
    const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month));
    monthYear.innerHTML = `${monthName}&nbsp;&nbsp;&nbsp;${year}`;
    //monthYear.textContent = `${monthSelect.options[monthSelect.selectedIndex].text} ${year}`;
}
