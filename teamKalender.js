import { DOM, shiftPattern, startDates, defaultSettings } from "./main.js";
import { getDaysSinceStart, getSettingsFromSessionStorage } from "./functies.js";
import { feestdagenLijstDatums } from "./makeModalHolidays.js";
import { tabBlad } from "./componentenMaken.js";

export function updateTeamCalendar() {
    const settings = getSettingsFromSessionStorage(tabBlad, defaultSettings);
    const month = settings.currentMonth;
    const year = settings.currentYear;
    const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month));
    DOM.monthYear.innerHTML = `${monthName}&nbsp;&nbsp;&nbsp;${year}`;
    const hollydays = feestdagenLijstDatums(year).map(date => date.toLocaleDateString());
    const teamElementen = document.querySelectorAll('#calendar .team-row');
    const legeCellen = new Set();
    teamElementen.forEach((team, index) => {
        const dayElementen = team.querySelectorAll('.table-cell');
        dayElementen.forEach((day, i) => {
            if(i > 0) {
                day.textContent = '';
                day.className = '';
                day.classList.add('table-cell');
                const currentDate = new Date(year, month, i);
                if(currentDate.getMonth() === month) {
                    const daysSinceStart = getDaysSinceStart(currentDate, startDates[index]);
                    if(daysSinceStart >= 0) {
                        const myDate = currentDate.toLocaleDateString();
                        const shiftIndex = daysSinceStart % shiftPattern.length;
                        let shift = shiftPattern[shiftIndex];
                        if(shift === 'x') day.classList.add('shift-thuis');
                        if(hollydays.includes(myDate)) {
                            shift += '- fd';
                        }
                        day.textContent = shift;
                    }
                } else {
                    day.classList.add('emptyDay');
                    legeCellen.add(i);
                }
            }
        });
    });
    for (let i = 31; i >= 28; i--) {
        const headerCell = teamElementen[0].children[i];
        if (legeCellen.has(parseInt(headerCell.textContent), 10)) {
            headerCell.classList.add('emptyDay');
        } else {
            headerCell.classList.remove('emptyDay');
        }
    }
}

export function generateTeamCalendar(month, year) {
    calendar.innerHTML = '';
    const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month));
    DOM.monthYear.innerHTML = `${monthName}&nbsp;&nbsp;&nbsp;${year}`;
    const hollydays = feestdagenLijstDatums(year).map(date => date.toLocaleDateString());
    // Header rij (1–31 voor de dagen van de maand)
    const headerRow = document.createElement("div");
    headerRow.classList.add("team-row");

    const emptyHeaderCell = document.createElement("div");
    emptyHeaderCell.classList.add("team-header-cell");
    headerRow.appendChild(emptyHeaderCell); // Lege cel voor de maandnamen

    for (let day = 1; day <= 31; day++) {
        const dayHeaderCell = document.createElement("div");
        dayHeaderCell.classList.add("team-header-cell");
        dayHeaderCell.textContent = day;
        headerRow.appendChild(dayHeaderCell);
    }
    calendar.appendChild(headerRow);
    // Genereer rijen voor elke ploeg
    const legeCellen = new Set();
    for (let team = 1; team < 6; team++) {
        const teamRow = document.createElement("div");
        teamRow.classList.add("team-row");


        // Eerste cel: ploegnaam
        const teamCell = document.createElement("div");
        teamCell.classList.add("table-cell", "team-cell");
        teamCell.textContent = `PLOEG ${team}`;
        teamRow.appendChild(teamCell);

        // Cellen voor de dagen (1–31)
        
        for (let day = 1; day <= 31; day++) {
            const dayCell = document.createElement("div");
            dayCell.classList.add("table-cell");

            const currentDate = new Date(year, month, day);
            // Controleer of de datum geldig is (voor maanden met minder dan 31 dagen)
            if (currentDate.getMonth() === month) {
                // Bereken de ploeg
                const daysSinceStart = getDaysSinceStart(currentDate, startDates[team]);
                if(daysSinceStart >= 0) {
                    const myDate = currentDate.toLocaleDateString();
                    const shiftIndex = daysSinceStart % shiftPattern.length;
                    let shift = shiftPattern[shiftIndex];
                    if(shift === 'x') dayCell.classList.add('shift-thuis');
                    if(hollydays.includes(myDate)) {
                        shift += '- fd';
                    }
                    dayCell.textContent = shift;
                }
            } else {
                dayCell.classList.add('emptyDay');
                legeCellen.add(day);      //if (!legeCellen.includes(day)) legeCellen.push(day);   
            }
            teamRow.appendChild(dayCell);
        }
        calendar.appendChild(teamRow);
    }

    // Markeer lege dagen in de header
    for (let i = 31; i >= 28; i--) {
        const headerCell = headerRow.children[i];
        if (legeCellen.has(parseInt(headerCell.textContent, 10))) {
            headerCell.classList.add('emptyDay');
        }
    }
};