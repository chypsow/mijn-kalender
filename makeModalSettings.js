import { DOM, defaultSettings, ploegenGegevens, updateCalendar } from "./main.js";
import { toggleModal, saveToLocalStorage, updateLocalStorage, getSettingsFromLocalStorage } from "./functies.js";
import { buildTeamDropdown, maakPloegenLegende, tabBlad } from "./componentenMaken.js";
import { generateTeamCalendar } from "./teamKalender.js";

// default settings
const ploegSchema = [
    {ploeg:1, schema:['N', 'N', 'N', 'x', 'x', 'V', 'V12'], startDatum:"2010-02-01"},
    {ploeg:2, schema:['L', 'L', 'x', 'N', 'N', 'N', 'N12'], startDatum:"2010-01-18"},
    {ploeg:3, schema:['x', 'x', 'L', 'L', 'L', 'L', 'x'], startDatum:"2010-01-25"},
    {ploeg:4, schema:['V', 'V', 'V', 'V', 'V', 'x', 'x'], startDatum:"2010-01-04"},
    {ploeg:5, schema:['D', 'D', 'D', 'D', 'D', 'x', 'x'], startDatum:"2010-01-11"}
];

export let shiftPatroon = JSON.parse(localStorage.getItem("shiftPatroon")) || ploegSchema;

export function makeModalInstellingen(shiftPatroon) {
    DOM.overlay.innerHTML = '';
    const aantalWeken = shiftPatroon.length;
    //const container = document.createElement('div');
    //container.classList.add('overlay-container');
    
    const topHeader = document.createElement('div');
    topHeader.classList.add('top-header');
    const heading = document.createElement('h2');
    heading.classList.add('heading-modal');
    heading.textContent = 'Ploegschema aanpassen:';
    topHeader.appendChild(heading);
    const handleidingContainer = document.createElement('div');
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
        <li><h4>Volledige cyclus (<span id="hl1">${aantalWeken}</span> weken):</h4> 
            Een volledige cyclus bestaat uit <span id="hl2">${aantalWeken}</span> weken. 
            Elke ploeg werkt en rust in een specifiek patroon dat zich herhaalt na <span id="hl3">${aantalWeken}</span> weken.
        </li>
        <li><h4>Startdatum:</h4>
            Welke ploeg in welke week actief is, wordt bepaald door de gekozen startdatum.
            Bijvoorbeeld: als we 1 februari 2010 als startdatum P1 (P1=ploeg 1) kiezen,
            begint P1 op die datum met het ploegschema (week1, week2 ...). Als we 7 dagen eerder 
            (dagen interval moet een veelvoud van 7 zijn) als startdatum P2 kiezen, begint Ploeg 2 op 25 januari 2010 met het 
            ploegschema (week1, week2 ...) en zo voort.
            <br><br><span style="color:rgb(172, 186, 189); font-weight:bold;">Opmerking:</span> In ons geval zijn de startdatums 
            zo gekozen dat het ploegschema overeenkomt met de werkelijkheid.
        </li>
    </ul>
    `;
    handleidingContainer.appendChild(handleidingMsg);
    topHeader.appendChild(handleidingContainer);
    const hr = document.createElement('hr');
    hr.classList.add('line');
    topHeader.appendChild(hr);
    DOM.overlay.appendChild(topHeader);

    const btnContainer = document.createElement('div');
    btnContainer.classList.add('knop-container');
    const toevoegen = document.createElement('button');
    toevoegen.setAttribute('id', 'add');
    toevoegen.textContent = "Een ploeg toevoegen";
    toevoegen.addEventListener('click', () => addOneWeek(shiftPatroon));
    btnContainer.appendChild(toevoegen);
    const verwijderen = document.createElement('button');
    verwijderen.setAttribute('id', 'delete');
    verwijderen.textContent = "Een ploeg verwijderen";
    verwijderen.addEventListener('click', deleteOneWeek);
    btnContainer.appendChild(verwijderen);
    DOM.overlay.appendChild(btnContainer);
    
    const shiftPatroonContainer = document.createElement('div');
    shiftPatroonContainer.classList.add('patroon-container');
    const wekenContainer = document.createElement('div');
    wekenContainer.classList.add('weken-container');

    shiftPatroon.forEach((week, i) => {
        const weekContainer = document.createElement('div');
        weekContainer.classList.add('week-container');
        const shiftsLabel = document.createElement('label');
        shiftsLabel.classList.add('label-week');
        const span = document.createElement('span');
        span.textContent = `Week ${i+1}: `;
        shiftsLabel.appendChild(span);
        week.schema.forEach((shift, j) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `day-${i+1}${j+1}`;
            input.className = 'shift-input';
            input.value = shift || '';
            input.addEventListener('focus', function() {
                this.select();
            });
            shiftsLabel.appendChild(input);
        });
        weekContainer.appendChild(shiftsLabel);
        wekenContainer.appendChild(weekContainer);
    });
    shiftPatroonContainer.appendChild(wekenContainer);

    const datumsContainer = document.createElement('div');
    datumsContainer.classList.add('datums-container');
    shiftPatroon.forEach((week, i) => {
        const dateLabel = document.createElement('label');
        dateLabel.classList.add('label-date');
        const span = document.createElement('span');
        span.textContent = `Startdatum P${i+1}: `;
        dateLabel.appendChild(span);
        const input = document.createElement('input');
        input.type = 'date';
        input.id = `date${i+1}`;
        input.className = 'date-input';
        input.value = week.startDatum || '';
        dateLabel.appendChild(input);
        datumsContainer.appendChild(dateLabel);
    });
    shiftPatroonContainer.appendChild(datumsContainer);
    DOM.overlay.appendChild(shiftPatroonContainer);

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
    DOM.overlay.appendChild(div);
    //DOM.overlay.appendChild(container);

    const cBoxContainer = document.createElement('div');
    cBoxContainer.classList.add('checkbox-container');
    let html = `
        <label><input type="checkbox" id="cbVerlofRustdag" checked>Enable verlof aanvraag tijdens een rustdag.</label>
        <label><input type="checkbox" id="cbAutoBF">Enable automatisch BF invullen op een D shift die op een feestdag valt.</label>
    `;
    cBoxContainer.innerHTML = html;
    DOM.overlay.appendChild(cBoxContainer);
};

function addOneWeek(shiftPatroon) {
    const wekenContainer = document.querySelector('.weken-container');
    const lengte = wekenContainer.children.length;
    if(lengte === 7) return;
    const weekContainer = document.createElement('div');
    weekContainer.classList.add('week-container');
    const shiftsLabel = document.createElement('label');
    shiftsLabel.classList.add('label-week');
    const span = document.createElement('span');
    span.textContent = `Week ${lengte+1}: `;
    shiftsLabel.appendChild(span);
    Array.from({length : 7}).forEach( (_,i) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `day-${lengte+1}${i+1}`;
        input.className = 'shift-input';
        input.value = shiftPatroon[lengte] ? shiftPatroon[lengte].schema[i] : '';
        input.addEventListener('focus', function() {
            this.select();
        });
        shiftsLabel.appendChild(input);
    });
    weekContainer.appendChild(shiftsLabel);
    wekenContainer.appendChild(weekContainer);

    const datumsContainer = document.querySelector('.datums-container');
    const dateLabel = document.createElement('label');
    dateLabel.classList.add('label-date');
    const spanDate = document.createElement('span');
    spanDate.textContent = `Startdatum P${lengte+1}: `;
    dateLabel.appendChild(spanDate);
    const input = document.createElement('input');
    input.type = 'date';
    input.id = `date${lengte+1}`;
    input.className = 'date-input';
    input.value = shiftPatroon[lengte] ? shiftPatroon[lengte].startDatum : '';
    dateLabel.appendChild(input);
    datumsContainer.appendChild(dateLabel);

    Array.from({length:3}).forEach( (_,i) => {
        document.getElementById(`hl${i+1}`).textContent = lengte + 1;
    });
};

function deleteOneWeek() {
    const wekenContainer = document.querySelector('.weken-container');
    const datumsContainer = document.querySelector('.datums-container');
    const lengte = wekenContainer.children.length;
    if (lengte > 1) {
        wekenContainer.removeChild(wekenContainer.lastElementChild);
        datumsContainer.removeChild(datumsContainer.lastElementChild);
    }
    Array.from({length:3}).forEach( (_,i) => {
        document.getElementById(`hl${i+1}`).textContent = lengte - 1;
    });
};

function resetDefaultSettings() {
    // Reset the input fields to default values
    const userResponse = confirm(`Weet je zeker dat je de standaardinstellingen wilt terugzetten? Dit kan niet ongedaan worden gemaakt!`);
    // If the user cancels, exit the function
    if (!userResponse) return;
    
    gegevensOpslaan(ploegSchema, 5, false);
    toggleModal(false);
};

const gegevensOpslaan = (obj, aantalPloegen, bevestiging = true) => {
    shiftPatroon = obj;
    saveToLocalStorage('shiftPatroon', shiftPatroon);
    
    const aantalPloegenSelect = DOM.ploeg.options.length;
    if(aantalPloegenSelect > aantalPloegen) {
        Array.from({length:4}).forEach((_, i) => {
            const instellingen = getSettingsFromLocalStorage(i, defaultSettings);
            if(instellingen.selectedPloeg > aantalPloegen) updateLocalStorage('standaardInstellingen', defaultSettings, i, {ploeg:1});
        });
        updatePloegDropdown(aantalPloegen, instellingen.selectedPloeg);
    } else if (aantalPloegenSelect < aantalPloegen) {
        const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
        updatePloegDropdown(aantalPloegen, selectedPloeg);
    }
    if(tabBlad === 1 || tabBlad === 2) {
        updatePloegenLegende();
    } else if (tabBlad === 3) {
        const instellingen = getSettingsFromLocalStorage(tabBlad, defaultSettings);
        const month = instellingen.currentMonth;
        const year = instellingen.currentYear;
        generateTeamCalendar(year, month);
        if(bevestiging) alert("Wijzigingen succesvol opgeslagen!");
        return;
    }
    updateCalendar();

    if(bevestiging) alert("Wijzigingen succesvol opgeslagen!");
};

function updatePloegenLegende() {
    DOM.topSectie3.innerHTML = '';
    maakPloegenLegende();
};

function updatePloegDropdown(aantal, ploeg = 1) {
    DOM.ploeg.innerHTML = '';
    buildTeamDropdown(aantal);
    if (DOM.ploeg.options[ploeg]) {
        DOM.ploeg.selectedIndex = ploeg-1;
    } else {
        DOM.ploeg.selectedIndex = 0;
    }
};

function ploegSysteemOpslaan() {
    let shiften = [];
    let datums = [];
    const wekenContainer = document.querySelector('.weken-container');
    const lengte = wekenContainer.children.length;
    for(let i = 1; i <= lengte; i++) {
        for(let j = 1; j <= 7; j++) {
            const dayElement = document.getElementById(`day-${i}${j}`);
            if (dayElement.value === '') {
                shiften.push('x');
            } else {
                shiften.push(dayElement.value === 'x' ? dayElement.value.toLowerCase() : dayElement.value.toUpperCase());
            }
        }
        const datum = document.getElementById(`date${i}`).value;
        datums.push(datum);
    }

    const isValid = checkIngevoerdeWaarden(shiften) && checkIngevoerdeDatums(datums);
    if (isValid) {
        const shiftObj = arraysOmzettenNaarObject(shiften, datums);
        gegevensOpslaan(shiftObj, lengte);
        toggleModal(false);
    } else {
        alert('Sommige velden zijn niet correct ingevuld !');
    }
};
function checkIngevoerdeWaarden(cyclus) {
    const filteredData = ploegenGegevens.filter(item => item.symbool !== 'OPL');
    return cyclus.every(cyc => {
        return filteredData.some(item => item.symbool === cyc);
    });
};
function checkIngevoerdeDatums(datums) {
    return Object.values(datums).every(val => val !== '');
};
/*function arraysOmzettenNaarObeject(arr1, arr2) {
    let obj = [];
    const shiftArrays = [];
    for (let i = 0; i < arr1.length; i += 7) {
        shiftArrays.push(arr1.slice(i, i + 7));
    }
    shiftArrays.forEach((serie, i) => {
        obj.push({
            ploeg: i + 1,
            schema: serie,
            startDatum: arr2[i]
        });
    });
    return obj;
};*/
function arraysOmzettenNaarObject(arr1, arr2) {
    return Array.from({ length: Math.ceil(arr1.length / 7) }, (_, i) => ({           // or {length : arr2.length}
        ploeg: i + 1,
        schema: arr1.slice(i * 7, i * 7 + 7),
        startDatum: arr2[i]
    }));
};