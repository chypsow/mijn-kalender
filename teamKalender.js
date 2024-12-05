import { getDaysSinceStart, getNaamBijSymbool, shiftPattern, startDates ,  monthYear} from "./ploegenRooster.js";

export function generateTeamCalendar(month, year) {
    calendar.innerHTML = '';
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
    for (let team = 1; team < 6; team++) {
        const teamRow = document.createElement("div");
        teamRow.classList.add("team-row");


        // Eerste cel: ploegnaam
        const teamCell = document.createElement("div");
        teamCell.classList.add("table-cell", "team-cell");
        teamCell.textContent = `Ploeg ${team}`;
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
                    const shiftIndex = daysSinceStart % shiftPattern.length;
                    const shift = shiftPattern[shiftIndex];
                    const shiftClass = `shift-${getNaamBijSymbool(shift)}`;
                    dayCell.textContent = shift; // Voeg de shiftletter toe
                    if(shift === 'x' || shift === 'DT') dayCell.classList.add(shiftClass);
                    //dayCell.classList.add(shiftClass); // Voeg de kleurklasse toe
                }
            
            }
            teamRow.appendChild(dayCell);
        }
        calendar.appendChild(teamRow);
    }
    const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month));
    monthYear.textContent = `${monthName} ${year}`;
}