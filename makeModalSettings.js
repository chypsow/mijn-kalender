import { DOM, updateCalendar } from "./main.js";
import { defaultSettings, toggleModal, saveToLocalStorage, updateLocalStorage, getSettingsFromLocalStorage, getArrayValues } from "./functies.js";
import { buildTeamDropdown, maakPloegenLegende, activeBlad } from "./componentenMaken.js";
import { generateTeamCalendar } from "./teamKalender.js";

// default settings
export const ploegenGegevens = [
    {symbool:'x', naam:'thuis', kleur:'#cfcfcf', flex: false},
    {symbool:'R', naam:'reserve', kleur:'#a10b0b', flex: false},
    {symbool:'OPL', naam:'opleiding', kleur:'#e9ca3f', flex: false},
    {symbool:'D', naam:'dag', kleur:'#949494', flex: true},
    {symbool:'N12', naam:'nacht-12u', kleur:'#0158bb', flex: true},
    {symbool:'N', naam:'nacht', kleur:'#4a91e2', flex: true},
    {symbool:'V12', naam:'vroege-12u', kleur:'#bb4b00', flex: true},
    {symbool:'V', naam:'vroege', kleur:'#ff8331', flex: true},
    {symbool:'L', naam:'late', kleur:'#4c9182', flex: true}
];
const ploegSchema = [
    {week:1, schema:['N', 'N', 'N', 'x', 'x', 'V', 'V12']},
    {week:2, schema:['L', 'L', 'x', 'N', 'N', 'N', 'N12']},
    {week:3, schema:['x', 'x', 'L', 'L', 'L', 'L', 'x']},
    {week:4, schema:['V', 'V', 'V', 'V', 'V', 'x', 'x']},
    {week:5, schema:['D', 'D', 'D', 'D', 'D', 'x', 'x']}
];
const startDates = [
    {ploeg:1, startDatum:"2010-02-01"},
    {ploeg:2, startDatum:"2010-01-18"},
    {ploeg:3, startDatum:"2010-01-25"},
    {ploeg:4, startDatum:"2010-01-04"},
    {ploeg:5, startDatum:"2010-01-11"}
];
//export let teamData = JSON.parse(localStorage.getItem("teamData")) || ploegenGegevens;
export let shiftPatroon = JSON.parse(localStorage.getItem("shiftPatroon")) || ploegSchema;
export let startDatums = JSON.parse(localStorage.getItem("startDatums")) || startDates;

export function makeModalInstellingen(shiftPatroon, startDatums) {
    DOM.overlay.innerHTML = '';
    
    const overlayContainer = document.createElement('div');
    overlayContainer.classList.add('overlay-container-partial');
    const topHeader = document.createElement('div');
    topHeader.classList.add('top-header');
    const heading = document.createElement('h2');
    heading.classList.add('heading-modal');
    heading.textContent = 'Ploegschema aanpassen:';
    topHeader.appendChild(heading);
    /*const handleidingContainer = document.createElement('div');
    handleidingContainer.classList.add('handleiding-container');
    const icoon = document.createElement('i');
    icoon.classList.add('fa');
    icoon.classList.add('fa-question-circle');
    icoon.setAttribute('aria-hidden', 'true');
    handleidingContainer.appendChild(icoon);

    const handleidingMsg = document.createElement('div');
    handleidingMsg.classList.add('handleiding-msg');
    handleidingMsg.innerHTML = `
    <ul style='list-style-type: none;'>
        <li><h4>Volledige cyclus (<span id="hl1"></span> weken):</h4> 
            Een volledige cyclus bestaat uit <span id="hl2"></span> weken. 
            Elke ploeg werkt en rust in een specifiek patroon dat zich herhaalt na <span id="hl3"></span> weken.
        </li>
        <li><h4>Startdatum:</h4>
            Welke ploeg in welke week actief is, wordt bepaald door de gekozen startdatum.
            Bijvoorbeeld: als we 1 februari 2010 als ploeg-1 startdatum kiezen,
            begint Ploeg-1 op die datum met het ploegschema (week-1, week-2 ...). Als we ploeg-2 startdatum ingeven met een verschil
            van 7 dagen, begint Ploeg-2 7 dagen eerder met het ploegschema (week1, week2 ...) en zo voort.
            <br><br><span style="color:rgb(172, 186, 189); font-weight:bold;">Opmerking:</span> In ons geval zijn de startdatums 
            zo gekozen dat het ploegschema overeenkomt met de werkelijkheid.
        </li>
    </ul>
    `;
    handleidingContainer.appendChild(handleidingMsg);
    topHeader.appendChild(handleidingContainer);*/
    overlayContainer.appendChild(topHeader);

    const shiftPatroonContainer = document.createElement('div');
    shiftPatroonContainer.classList.add('patroon-container');

    const shiftenContainer = document.createElement('div');
    shiftenContainer.classList.add('shiften-container');

    const shiftBtnContainer = document.createElement('div');
    shiftBtnContainer.classList.add('knop-container');
    const shiftVerwijderen = document.createElement('button');
    shiftVerwijderen.setAttribute('id', 'delete-day');
    shiftVerwijderen.innerHTML = `<i class="fa fa-minus"></i><span> dag</span>`;
    shiftVerwijderen.addEventListener('click', deleteOneDay);
    shiftBtnContainer.appendChild(shiftVerwijderen);
    const shiftToevoegen = document.createElement('button');
    shiftToevoegen.setAttribute('id', 'add-day');
    shiftToevoegen.innerHTML = `<i class="fa fa-plus"></i><span> dag</span>`;
    shiftToevoegen.addEventListener('click', addOneDay);
    shiftBtnContainer.appendChild(shiftToevoegen);
    shiftenContainer.appendChild(shiftBtnContainer);

    const wekenContainer = document.createElement('div');
    wekenContainer.classList.add('weken-container');
    shiftPatroon.forEach((week, i) => {
        const weekContainer = document.createElement('div');
        weekContainer.classList.add('week-container');
        const shiftsLabel = document.createElement('label');
        shiftsLabel.classList.add('label-week');
        const span = document.createElement('span');
        span.textContent = `Week-${i+1}: `;
        shiftsLabel.appendChild(span);
        week.schema.forEach((dag, j) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `day-${i+1}${j+1}`;
            input.className = 'shift-input';
            input.value = dag || '';
            input.addEventListener('focus', function() {
                this.select();
            });
            shiftsLabel.appendChild(input);
        });
        weekContainer.appendChild(shiftsLabel);
        wekenContainer.appendChild(weekContainer);
    });
    shiftenContainer.appendChild(wekenContainer);
    shiftPatroonContainer.appendChild(shiftenContainer);

    const ploegenContainer = document.createElement('div');
    ploegenContainer.classList.add('ploegen-container');

    const ploegBtnContainer = document.createElement('div');
    ploegBtnContainer.classList.add('knop-container');
    const ploegVerwijderen = document.createElement('button');
    ploegVerwijderen.setAttribute('id', 'delete-ploeg');
    ploegVerwijderen.innerHTML = `<i class="fa fa-minus"></i><span> ploeg</span>`;
    ploegVerwijderen.addEventListener('click', deleteOneTeam);
    ploegBtnContainer.appendChild(ploegVerwijderen);
    const ploegToevoegen = document.createElement('button');
    ploegToevoegen.setAttribute('id', 'add-ploeg');
    ploegToevoegen.innerHTML = `<i class="fa fa-plus"></i><span> ploeg</span>`;
    ploegToevoegen.addEventListener('click', addOneTeam);
    ploegBtnContainer.appendChild(ploegToevoegen);
    ploegenContainer.appendChild(ploegBtnContainer);

    const datumsContainer = document.createElement('div');
    datumsContainer.classList.add('datums-container');
    startDatums.forEach((ploeg, i) => {
        const dateLabel = document.createElement('label');
        dateLabel.classList.add('label-date');
        const span = document.createElement('span');
        span.textContent = `Ploeg-${i+1} [startdatum]: `;
        dateLabel.appendChild(span);
        const input = document.createElement('input');
        input.type = 'date';
        input.id = `date${i+1}`;
        input.className = 'date-input';
        input.value = ploeg.startDatum || '';
        dateLabel.appendChild(input);
        datumsContainer.appendChild(dateLabel);
    });
    ploegenContainer.appendChild(datumsContainer);
    shiftPatroonContainer.appendChild(ploegenContainer);
    overlayContainer.appendChild(shiftPatroonContainer);

    const div = document.createElement('div');
    div.classList.add('modal-button-container');
    const button = document.createElement('button');
    button.id = "btnOverlay";
    button.textContent = "Opslaan";
    button.addEventListener('click', ploegSysteemOpslaan);
    div.appendChild(button);
    const reset = document.createElement('button');
    reset.id = "reset";
    reset.textContent = "Standaardinstellingen terugzetten";
    reset.addEventListener('click', resetDefaultSettings);
    div.appendChild(reset);
    overlayContainer.appendChild(div);
    DOM.overlay.appendChild(overlayContainer);
    /*const cBoxContainer = document.createElement('div');
    cBoxContainer.classList.add('checkbox-container');
    let html = `
        <label><input type="checkbox" id="cbVerlofRustdag" checked>Enable verlof aanvraag tijdens een rustdag.</label>
        <label><input type="checkbox" id="cbAutoBF">Enable automatisch BF invullen op een D shift die op een feestdag valt.</label>
    `;
    cBoxContainer.innerHTML = html;
    DOM.overlay.appendChild(cBoxContainer);*/

    /*handleidingContainer.addEventListener('mouseover', () => {
        Array.from({length:3}).forEach( (_,i) => {
            document.getElementById(`hl${i+1}`).textContent = datumsContainer.children.length;
        });
    });*/

    /*if(activeBlad === 1 || activeBlad === 2) {
        
        const overlayContainer = document.createElement('div');
        overlayContainer.classList.add('overlay-container-partial');
        const topHeader = document.createElement('div');
        topHeader.classList.add('top-header');
        const heading = document.createElement('h2');
        heading.classList.add('heading-modal');
        heading.textContent = 'Ploeggegevens aanpassen:';
        topHeader.appendChild(heading);
        overlayContainer.appendChild(topHeader);
        const ploegDataContainer = document.createElement('div');
        ploegDataContainer.classList.add('ploeg-data-container');
        const ploegDataBtnContainer = document.createElement('div');
        ploegDataBtnContainer.classList.add('knop-container2');
        const ploegDataVerwijderen = document.createElement('button');
        ploegDataVerwijderen.setAttribute('id', 'delete-ploeg-data');
        ploegDataVerwijderen.innerHTML = `<i class="fa fa-minus"></i><span> symbool</span>`;
        ploegDataVerwijderen.addEventListener('click', deleteOneSymbol);
        ploegDataBtnContainer.appendChild(ploegDataVerwijderen);
        const ploegDataToevoegen = document.createElement('button');
        ploegDataToevoegen.setAttribute('id', 'add-ploeg-data');
        ploegDataToevoegen.innerHTML = `<i class="fa fa-plus"></i><span> symbool</span>`;
        ploegDataToevoegen.addEventListener('click', addOneSymbol);
        ploegDataBtnContainer.appendChild(ploegDataToevoegen);
        ploegDataContainer.appendChild(ploegDataBtnContainer);
        // Create input fields for each team
        const ploegDataElts = document.createElement('div');
        ploegDataElts.classList.add('ploeg-data-elts');
        teamData.forEach((team, i) => {
            const ploegData = document.createElement('div');
            ploegData.classList.add('ploeg-data');
            const ploegDataLabel = document.createElement('label');
            ploegDataLabel.classList.add('ploeg-data-label');
            ploegDataLabel.textContent = `symbool: `;
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `symbool-${i+1}`;
            input.className = 'symbool-input';
            input.value = team.symbool || '';
            input.disabled = team.flex === false; // Disable input for non-flex teams
            input.addEventListener('focus', function() {
                this.select();
            });
            ploegDataLabel.appendChild(input);
            ploegData.appendChild(ploegDataLabel);
            
            
            const ploegNaamLabel = document.createElement('label');
            ploegNaamLabel.classList.add('ploeg-data-label');
            ploegNaamLabel.textContent = `naam: `;
            const inputNaam = document.createElement('input');
            inputNaam.type = 'text';
            inputNaam.id = `naam-${i+1}`;
            inputNaam.className = 'symbool-input';
            inputNaam.value = team.naam || '';
            inputNaam.disabled = team.flex === false; // Disable input for non-flex teams
            inputNaam.addEventListener('focus', function() {
                this.select();
            });
            ploegNaamLabel.appendChild(inputNaam);
            ploegData.appendChild(ploegNaamLabel);
            
            const ploegKleurLabel = document.createElement('label');
            ploegKleurLabel.classList.add('ploeg-data-label');
            ploegKleurLabel.textContent = `kleur: `;
            const inputKleur = document.createElement('input');
            inputKleur.type = 'color';
            inputKleur.id = `kleur-${i+1}`;
            inputKleur.className = 'kleur-input';
            inputKleur.value = team.kleur || '#000000';
            inputKleur.disabled = team.flex === false; // Disable input for non-flex teams
            inputKleur.addEventListener('focus', function() {
                this.select();
            });
            ploegKleurLabel.appendChild(inputKleur);
            ploegData.appendChild(ploegKleurLabel);
            ploegDataElts.appendChild(ploegData);
        });
        ploegDataContainer.appendChild(ploegDataElts);
        overlayContainer.appendChild(ploegDataContainer);


        const div = document.createElement('div');
        div.classList.add('modal-button-container');
        const button = document.createElement('button');
        button.id = "savePloegData";
        button.textContent = "Opslaan";
        button.addEventListener('click', savePloegData);
        div.appendChild(button);
        const reset = document.createElement('button');
        reset.id = "resetPloegData";
        reset.textContent = "Standaardinstellingen terugzetten";
        reset.addEventListener('click', resetDefaultPloegData);
        div.appendChild(reset);
        overlayContainer.appendChild(div);
        DOM.overlay.appendChild(overlayContainer);
    }*/
};

/*function deleteOneSymbol() {
    const ploegDataElts = document.querySelectorAll('.ploeg-data');
    if (ploegDataElts.length <= 3) {
        //alert('Er moet minstens 3 symbolen overblijven!');
        return;
    }
    const lastPloegData = ploegDataElts[ploegDataElts.length - 1];
    lastPloegData.parentNode.removeChild(lastPloegData);
}*/

function addOneSymbol() {
    const ploegDataElts = document.querySelectorAll('.ploeg-data');
    if (ploegDataElts.length >= 20) {
        alert('Maximaal 20 symbolen zijn toegestaan!');
        return;
    }
    const ploegDataContainer = document.querySelector('.ploeg-data-elts');
    const ploegData = document.createElement('div');
    ploegData.classList.add('ploeg-data');
    
    const ploegDataLabel = document.createElement('label');
    ploegDataLabel.classList.add('ploeg-data-label');
    ploegDataLabel.textContent = `symbool: `;
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `symbool-${ploegDataElts.length + 1}`;
    input.className = 'symbool-input';
    input.value = '';
    input.addEventListener('focus', function() {
        this.select();
    });
    ploegDataLabel.appendChild(input);
    ploegData.appendChild(ploegDataLabel);
    
    const ploegNaamLabel = document.createElement('label');
    ploegNaamLabel.classList.add('ploeg-data-label');
    ploegNaamLabel.textContent = `naam: `;
    const inputNaam = document.createElement('input');
    inputNaam.type = 'text';
    inputNaam.id = `naam-${ploegDataElts.length + 1}`;
    inputNaam.className = 'symbool-input';
    inputNaam.value = '';
    inputNaam.addEventListener('focus', function() {
        this.select();
    });
    ploegNaamLabel.appendChild(inputNaam);
    ploegData.appendChild(ploegNaamLabel);
    
    const ploegKleurLabel = document.createElement('label');
    ploegKleurLabel.classList.add('ploeg-data-label');
    ploegKleurLabel.textContent = `kleur: `;
    const inputKleur = document.createElement('input');
    inputKleur.type = 'color';
    inputKleur.id = `kleur-${ploegDataElts.length + 1}`;
    inputKleur.className = 'kleur-input';
    inputKleur.value = '#000000';
    inputKleur.addEventListener('focus', function() {
        this.select();
    });
    ploegKleurLabel.appendChild(inputKleur);
    
    ploegData.appendChild(ploegKleurLabel);
    
    ploegDataContainer.appendChild(ploegData);
    
};

/*function savePloegData() {
    const ploegData = [];
    const ploegDataElts = document.querySelectorAll('.ploeg-data');
    ploegDataElts.forEach(ploeg => {
        const symboolInput = ploeg.querySelector('.symbool-input');
        const naamInput = ploeg.querySelector('.naam-input');
        const kleurInput = ploeg.querySelector('.kleur-input');
        const symbool = symboolInput.value.trim().toUpperCase();
        const naam = naamInput.value.trim();
        const kleur = kleurInput.value.trim();
        if (symbool && naam && kleur) {
            ploegData.push({ symbool, naam, kleur });
        }
    });
    if (ploegData.length === 0) {
        alert('Geen geldige ploeggegevens ingevoerd!');
        return;
    }
    // Save to localStorage
    teamData = ploegData;
    saveToLocalStorage('teamData', teamData);
    // Update dropdown and legend
    const instellingen = getSettingsFromLocalStorage(activeBlad, defaultSettings);
    const selectedPloeg = instellingen.selectedPloeg;
    buildTeamDropdown(ploegData.length, selectedPloeg);
    if(activeBlad === 1 || activeBlad === 2) {
        maakPloegenLegende();
    } else if (activeBlad === 3) {
        const month = instellingen.currentMonth;
        const year = instellingen.currentYear;
        generateTeamCalendar(year, month);
    }
    alert("Ploeggegevens succesvol opgeslagen!");
    toggleModal(false);
};*/
/*function resetDefaultPloegData() {
    // Reset the ploegData to default values
    const userResponse = confirm(`Weet je zeker dat je de standaard ploeggegevens wilt terugzetten? Dit kan niet ongedaan worden gemaakt!`);
    // If the user cancels, exit the function
    if (!userResponse) return;
    teamData = JSON.parse(JSON.stringify(ploegenGegevens));
    saveToLocalStorage('teamData', teamData);
    // Update dropdown and legend
    const instellingen = getSettingsFromLocalStorage(activeBlad, defaultSettings);
    const selectedPloeg = instellingen.selectedPloeg;
    buildTeamDropdown(teamData.length, selectedPloeg);
    if(activeBlad === 1 || activeBlad === 2) {
        maakPloegenLegende();
    } else if (activeBlad === 3) {
        const month = instellingen.currentMonth;
        const year = instellingen.currentYear;
        generateTeamCalendar(year, month);
    }
    alert("Ploeggegevens succesvol teruggezet naar standaardinstellingen!");
    toggleModal(false);
};*/

function addOneDay() {
    const wekenContainer = document.querySelector('.weken-container');
    const shiftInputs = document.querySelectorAll('.shift-input');
    const aantalShiften = shiftInputs.length;
    const shiftPattern = getArrayValues(shiftPatroon);

    if (aantalShiften >= 49) return; // Max 7 weken * 7 dagen

    const isNewWeek = aantalShiften % 7 === 0;
    const weekIndex = Math.floor(aantalShiften / 7) + 1;
    const dayIndex = (aantalShiften % 7) + 1;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `day-${weekIndex}${dayIndex}`;
    input.className = 'shift-input';
    input.value = shiftPattern[aantalShiften] || '';
    input.addEventListener('focus', function () {
        this.select();
    });

    if (isNewWeek) {
        const weekContainer = document.createElement('div');
        weekContainer.classList.add('week-container');
        const shiftsLabel = document.createElement('label');
        shiftsLabel.classList.add('label-week');
        const span = document.createElement('span');
        span.textContent = `Week-${weekIndex}: `;
        shiftsLabel.appendChild(span);
        shiftsLabel.appendChild(input);
        weekContainer.appendChild(shiftsLabel);
        wekenContainer.appendChild(weekContainer);
    } else {
        const lastWeekContainer = wekenContainer.lastElementChild;
        const lastLabelContainer = lastWeekContainer.querySelector('.label-week');
        lastLabelContainer.appendChild(input);
    }
};

function deleteOneDay() {
    const wekenContainer = document.querySelector('.weken-container');
    const aantalShiften = document.querySelectorAll('.shift-input').length;
    //console.log(`alle shiften: ${aantalShiften}`);
    
    if(aantalShiften === 1) return;
    if((aantalShiften - 1) % 7 === 0) {
        wekenContainer.removeChild(wekenContainer.lastElementChild);
    } else {
        //console.log(`kolom index: ${(aantalShiften - 1) % 7}`);
        const lastWeekContainer = wekenContainer.lastElementChild;
        const lastLabelContainer = lastWeekContainer.lastElementChild;
        lastLabelContainer.removeChild(lastLabelContainer.lastElementChild);
    }
};
function addOneTeam() {
    const datumsContainer = document.querySelector('.datums-container');
    const lengte = datumsContainer.children.length;
    if(lengte === 7) return;
    const dateLabel = document.createElement('label');
    dateLabel.classList.add('label-date');
    const spanDate = document.createElement('span');
    spanDate.textContent = `Ploeg-${lengte+1} [startdatum]: `;
    dateLabel.appendChild(spanDate);
    const input = document.createElement('input');
    input.type = 'date';
    input.id = `date${lengte+1}`;
    input.className = 'date-input';
    input.value = startDatums[lengte] ? startDatums[lengte].startDatum : '';
    dateLabel.appendChild(input);
    datumsContainer.appendChild(dateLabel);
};
function deleteOneTeam() {
    const datumsContainer = document.querySelector('.datums-container');
    const lengte = datumsContainer.children.length;
    if (lengte > 1) {
        datumsContainer.removeChild(datumsContainer.lastElementChild);
    }
};

function resetDefaultSettings() {
    // Reset the input fields to default values
    const userResponse = confirm(`Weet je zeker dat je de standaardinstellingen wilt terugzetten? Dit kan niet ongedaan worden gemaakt!`);
    // If the user cancels, exit the function
    if (!userResponse) return;
    
    gegevensOpslaan(ploegSchema, startDates, false);
    toggleModal(false);
};

const gegevensOpslaan = (shiftObj, dateObj, bevestiging = true) => {
    shiftPatroon = shiftObj;
    startDatums = dateObj;
    saveToLocalStorage('shiftPatroon', shiftPatroon);
    saveToLocalStorage('startDatums', startDatums);
    
    const aantalPloegen = startDatums.length;
    const aantalPloegenSelect = DOM.ploeg.options.length;
    if(aantalPloegenSelect > aantalPloegen) {
        Array.from({length:4}).forEach((_, i) => {
            const instellingen = getSettingsFromLocalStorage(i, defaultSettings);
            if(instellingen.selectedPloeg > aantalPloegen) updateLocalStorage('standaardInstellingen', defaultSettings, i, {ploeg:1});
        });
        buildTeamDropdown(aantalPloegen, instellingen.selectedPloeg);
    } else if (aantalPloegenSelect < aantalPloegen) {
        const selectedPloeg = getSettingsFromLocalStorage(activeBlad, defaultSettings).selectedPloeg;
        buildTeamDropdown(aantalPloegen, selectedPloeg);
    }
    if(activeBlad === 1 || activeBlad === 2) {
        maakPloegenLegende();
    } else if (activeBlad === 3) {
        const instellingen = getSettingsFromLocalStorage(activeBlad, defaultSettings);
        const month = instellingen.currentMonth;
        const year = instellingen.currentYear;
        generateTeamCalendar(year, month);
        if(bevestiging) alert("Wijzigingen succesvol opgeslagen!");
        return;
    }
    updateCalendar();

    if(bevestiging) alert("Wijzigingen succesvol opgeslagen!");
};

function ploegSysteemOpslaan() {
    let shiften = [];
    let datums = [];
    
    const dateElts = document.querySelectorAll('.date-input');
    const dateIsValid = Array.from(dateElts).every(date => date.value !== '');
    if(!dateIsValid) {
        alert('Sommige startdatums waren niet ingevuld !');
        return;
    }
    dateElts.forEach(date => datums.push(date.value));

    const shiftElts = document.querySelectorAll('.shift-input');
    shiftElts.forEach(shift => {
        if(shift.value === '') {
            shiften.push('x');
        } else {
            shiften.push(shift.value === 'x' ? shift.value.toLowerCase() : shift.value.toUpperCase());
        }
    });
    const shiftIsValid = checkIngevoerdeWaarden(shiften);
    if (shiftIsValid) {
        const shiftObj = shiftenOmzettenNaarObject(shiften);
        const dateObj = datumsOmzettenNaarObject(datums);
        gegevensOpslaan(shiftObj, dateObj);
        toggleModal(false);
    } else {
        alert('Sommige shift-inputs waren niet correct ingevuld !');
    }
};
function checkIngevoerdeWaarden(cyclus) {
    const filteredData = ploegenGegevens.filter(item => item.symbool !== 'OPL');
    return cyclus.every(cyc => {
        return filteredData.some(item => item.symbool === cyc);
    });
};
function shiftenOmzettenNaarObject(arr) {
    return Array.from({ length: Math.ceil(arr.length / 7) }, (_, i) => ({
        week: i + 1,
        schema: arr.slice(i * 7, i * 7 + 7)
    }));
};
function datumsOmzettenNaarObject(arr) {
    return Array.from({ length: arr.length}, (_,i) => ({
        ploeg: i + 1,
        startDatum: arr[i]
    }));
};