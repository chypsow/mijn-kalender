import { DOM } from "./main.js";
import { getDaysSinceStart, getArrayValues } from "./functies.js";
import { feestdagenLijstDatums } from "./makeModalHolidays.js";
import { shiftPatroon, startDatums } from "./makeModalSettings.js";

export function updateTeamCalendar(year, month) {
    const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month));
    DOM.monthYear.innerHTML = `${monthName}&nbsp;&nbsp;&nbsp;${year}`;
    const shiftPattern = getArrayValues(shiftPatroon);
    const hollydays = feestdagenLijstDatums(year).map(date => date.toLocaleDateString("nl-BE"));
    const teamElementen = document.querySelectorAll('#calendar .team-row');
    const checkRow = document.querySelector('#calendar .check-row');
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
                    const ploegObj = startDatums.find(obj => obj.ploeg === index);
                    if (!ploegObj) return;
                    const startDate = ploegObj.startDatum;
                    const daysSinceStart = getDaysSinceStart(currentDate, startDate);
                    if(daysSinceStart >= 0) {
                        const myDate = currentDate.toLocaleDateString("nl-BE");
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
        const checkCell = checkRow.children[i];
        if (legeCellen.has(parseInt(headerCell.textContent), 10)) {
            headerCell.classList.add('emptyDay');
            checkCell.classList.add('emptyDay');
            //checkCell.classList.remove('check-cell');
        } else {
            headerCell.classList.remove('emptyDay');
            checkCell.classList.remove('emptyDay');
            //checkCell.classList.add('check-cell');
        }
    }
    checkAllTeamsPresent();
};

export function generateTeamCalendar(year, month) {
    DOM.calendar.innerHTML = '';
    const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month));
    DOM.monthYear.innerHTML = `${monthName}&nbsp;&nbsp;&nbsp;${year}`;
    const shiftPattern = getArrayValues(shiftPatroon);
    const hollydays = feestdagenLijstDatums(year).map(date => date.toLocaleDateString("nl-BE"));
    // Header rij (1–31 voor de dagen van de maand)
    const headerRow = document.createElement("div");
    headerRow.classList.add("team-row");

    const emptyHeaderCell = document.createElement("div");
    emptyHeaderCell.classList.add("team-header-cell");
    headerRow.appendChild(emptyHeaderCell); // Lege cel voor de ploeg namen

    for (let day = 1; day <= 31; day++) {
        const dayHeaderCell = document.createElement("div");
        dayHeaderCell.classList.add("team-header-cell");
        dayHeaderCell.textContent = day;
        headerRow.appendChild(dayHeaderCell);
    }
    DOM.calendar.appendChild(headerRow);
    // Genereer rijen voor elke ploeg
    const legeCellen = new Set();
    const aantalPloegen = startDatums.length;
    for (let team = 1; team <= aantalPloegen; team++) {
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
                const ploegObj = startDatums.find(obj => obj.ploeg === team);
                if (!ploegObj) return;
                const startDate = ploegObj.startDatum;
                const daysSinceStart = getDaysSinceStart(currentDate, startDate);
                if(daysSinceStart >= 0) {
                    const myDate = currentDate.toLocaleDateString("nl-BE");
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
        DOM.calendar.appendChild(teamRow);
    }

    const checkRow = document.createElement("div");
    checkRow.classList.add("check-row");
    const teamCell = document.createElement("div");
    teamCell.classList.add("table-cell", "title-cell-check");
    teamCell.innerHTML = `<i class="fa fa-info-circle"></i>`;
    teamCell.title = "Nagaan of op elke dag alle 3 ploegen N, L en V aanwezig zijn";
    checkRow.appendChild(teamCell);
    for (let day = 1; day <= 31; day++) {
            const dayCell = document.createElement("div");
            dayCell.classList.add("table-cell", "check-cell");
            checkRow.appendChild(dayCell);
    }
    DOM.calendar.appendChild(checkRow);

    for (let i = 31; i >= 28; i--) {
        const headerCell = headerRow.children[i];
        const checkCell = checkRow.children[i];
        if (legeCellen.has(parseInt(headerCell.textContent, 10))) {
            headerCell.classList.add('emptyDay');
            checkCell.classList.add('emptyDay');
        }
    }
    checkAllTeamsPresent();
};

function checkAllTeamsPresent() {
    const teamElementen = document.querySelectorAll('#calendar .team-row');
    const checkRow = document.querySelector('#calendar .check-row');
    let kolommen = [];
    teamElementen.forEach(team => {
        const dayElementen = team.querySelectorAll('.table-cell');
        dayElementen.forEach((day, i) => {
            if (i > 0 && !day.classList.contains('emptyDay')) {
                const shift = day.textContent.trim();
                if (!kolommen[i-1]) {
                    kolommen[i-1] = { N: false, L: false, V: false, N12: false, V12: false };
                }
                if (shift.includes('N')) kolommen[i-1].N = true;
                if (shift.includes('L')) kolommen[i-1].L = true;
                if (shift.includes('V')) kolommen[i-1].V = true;
                if (shift.includes('N12')) kolommen[i-1].N12 = true;
                if (shift.includes('V12')) kolommen[i-1].V12 = true;
            }
        });
    });
    
    const analyseResult = analyseerKolommen(kolommen);
    const checkCellen = checkRow.querySelectorAll('.check-cell');
    checkCellen.forEach((cell, i) => {
        cell.classList.remove('present', 'non-present');
        if (cell.classList.contains('emptyDay')) return;
        
        if (analyseResult[i]) {
            cell.classList.add('present');
        } else {
            cell.classList.add('non-present');
        }
    });
};

function analyseerKolommen(array) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
        if( array[i]['N'] && array[i]['L'] && array[i]['V'] || array[i]['N12'] && array[i]['V12']) {
            result.push(true);
        } else {
            result.push(false);
        }
    }
    return result;
};