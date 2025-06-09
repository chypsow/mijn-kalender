import { DOM, defaultSettings, ploegenGegevens, updateCalendar } from "./main.js";
import { toggleModal, saveToLocalStorage, getArrayValues, updateLocalStorage, getSettingsFromLocalStorage } from "./functies.js";
import { buildTeamDropdown, maakPloegenLegende, tabBlad } from "./componentenMaken.js";

// default settings
const ploegSchema = {
    Week1 : ['N', 'N', 'N', 'x', 'x', 'V', 'V12'],
    Week2 : ['L', 'L', 'x', 'N', 'N', 'N', 'N12'],
    Week3 : ['x', 'x', 'L', 'L', 'L', 'L', 'x'],
    Week4 : ['V', 'V', 'V', 'V', 'V', 'x', 'x'],
    Week5 : ['D', 'D', 'D', 'D', 'D', 'x', 'x']
};
const startDatums = {
    1: "2010-02-01", 
    2: "2010-01-18", 
    3: "2010-01-25", 
    4: "2010-01-04", 
    5: "2010-01-11"
};
export let shiftPatroon = JSON.parse(localStorage.getItem("shiftPatroon")) || ploegSchema;
export let startDates = JSON.parse(localStorage.getItem("startDates")) || startDatums;

export function makeModalInstellingen(obj, shiftPatroon) {
    DOM.overlay.innerHTML = '';
    const aantalWeken = Object.keys(shiftPatroon).length;
    const container = document.createElement('div');
    container.classList.add('overlay-container');
    
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
        <li><h4>Volledige cyclus (${aantalWeken} weken):</h4> 
            Een volledige cyclus bestaat uit ${aantalWeken} weken. 
            Elke ploeg werkt en rust in een specifiek patroon dat zich herhaalt na ${aantalWeken} weken.
        </li>
        <li><h4>Startdatum:</h4>
            Welke ploeg in welke week actief is, hangt af van een startdatum.
            Bijvoorbeeld: als we 1 februari 2010 als startdatum 1 kiezen, 
            begint Ploeg 1 op die datum met week 1 (in ons geval de week van 3 nachten). Als we 25 januari 2010 (7 dagen eerder) 
            als startdatum 2 kiezen, begint Ploeg 2 op 1 februari 2010 met week 2 (in ons geval de week van 4 nachten) en zo verder.
            <br><br> *<b>Opmerking:</b> In ons geval zijn de startdatums zo gekozen dat het ploegnummer en het ploegschema overeenkomen met de realiteit.*
        </li>
    </ul>
    `;
    handleidingContainer.appendChild(handleidingMsg);
    topHeader.appendChild(handleidingContainer);
    const hr = document.createElement('hr');
    hr.classList.add('line');
    topHeader.appendChild(hr);
    container.appendChild(topHeader);

    const btnContainer = document.createElement('div');
    btnContainer.classList.add('weken-container');
    btnContainer.innerHTML = `
        <button id="add">1 week toevoegen</button>
        <button id="delete">1 week verwijderen</button>
    `;
    container.appendChild(btnContainer);
    
    const labelsContainer = document.createElement('div');
    labelsContainer.classList.add('labels-container');
    Object.entries(shiftPatroon).forEach(([key, value], i) => {
        //console.log(`patroon: ${key}: ${value}`);
        const labelContainer = document.createElement('div');
        labelContainer.classList.add('label-container');
        const label1 = document.createElement('label');
        label1.classList.add('label-week');
        const span = document.createElement('span');
        span.textContent = `${key}: `;
        label1.appendChild(span);
        value.forEach((val, j) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `day-${i+1}${j+1}`;
            input.className = 'shift-input';
            input.value = val || '';
            input.addEventListener('focus', function() {
                this.select();
            });
            label1.appendChild(input);
        });
        labelContainer.appendChild(label1);

        const label = document.createElement('label');
        label.classList.add('label-date');
        const span2 = document.createElement('span');
        span2.textContent = `Startdatum ${i+1}: `;
        label.appendChild(span2);
        const input2 = document.createElement('input');
        input2.type = 'date';
        input2.id = `date${i+1}`;
        input2.className = 'date-input';
        input2.value = obj[i+1] || '';
        label.appendChild(input2);
        labelContainer.appendChild(label);
        labelsContainer.appendChild(labelContainer);
    });
    container.appendChild(labelsContainer);
    const div = document.createElement('div');
    div.classList.add('button-container');
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
    container.appendChild(div);
    DOM.overlay.appendChild(container);

    const cBoxContainer = document.createElement('div');
    cBoxContainer.classList.add('checkbox-container');
    let html = `
        <label><input type="checkbox" id="cbVerlofRustdag" checked>Enable verlof aanvraag tijdens een rustdag.</label>
        <label><input type="checkbox" id="cbAutoBF">Enable automatisch BF invullen op een D shift die op een feestdag valt.</label>
    `;
    cBoxContainer.innerHTML = html;
    DOM.overlay.appendChild(cBoxContainer);
    
    document.getElementById('add').addEventListener('click', () => addOneWeek(obj, shiftPatroon));
    document.getElementById('delete').addEventListener('click', deleteOneWeek);
};

function addOneWeek(obj, shiftPatroon) {
    const labelsContainer = document.querySelector('.labels-container');
    const lengte = labelsContainer.children.length;
    if(lengte === 7) return;
    const labelContainer = document.createElement('div');
    labelContainer.classList.add('label-container');
    const label1 = document.createElement('label');
    label1.classList.add('label-week');
    const span = document.createElement('span');
    span.textContent = `Week${lengte + 1}: `;
    label1.appendChild(span);
    
    Array.from({length : 7}).forEach( (_,i) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `day-${lengte+1}${i+1}`;
        input.className = 'shift-input';
        input.value = shiftPatroon[`Week${lengte + 1}`] ? shiftPatroon[`Week${lengte + 1}`][i] : '';
        input.addEventListener('focus', function() {
            this.select();
        });
        label1.appendChild(input);
    });
    labelContainer.appendChild(label1);

    const label = document.createElement('label');
    label.classList.add('label-date');
    const span2 = document.createElement('span');
    span2.textContent = `Startdatum ${lengte+1}: `;
    label.appendChild(span2);
    const input2 = document.createElement('input');
    input2.type = 'date';
    input2.id = `date${lengte+1}`;
    input2.className = 'date-input';
    input2.value = obj[lengte+1] || '';
    label.appendChild(input2);
    labelContainer.appendChild(label);
    labelsContainer.appendChild(labelContainer);
};

function deleteOneWeek() {
    const labelsContainer = document.querySelector('.labels-container');
    // Alleen verwijderen als er meer dan 1 week overblijft
    if (labelsContainer.children.length > 1) {
        labelsContainer.removeChild(labelsContainer.lastElementChild);
    }
};

function resetDefaultSettings() {
    // Reset the input fields to default values
    const userResponse = confirm(`Weet je zeker dat je de standaardinstellingen wilt terugzetten? Dit kan niet ongedaan worden gemaakt!`);
    // If the user cancels, exit the function
    if (!userResponse) return;
    
    gegevensOpslaan(ploegSchema, startDatums, 5, false);
    toggleModal(false);
};

const gegevensOpslaan = (weken, datums, aantalPloegen, bevestiging = true) => {
    shiftPatroon = weken;
    startDates = datums;
    saveToLocalStorage('shiftPatroon', shiftPatroon);
    saveToLocalStorage('startDates', startDates);
    const aantalPloegenSelect = DOM.ploeg.options.length;
    if(bevestiging) alert("Wijzigingen succesvol opgeslagen!");
    if(aantalPloegenSelect > aantalPloegen) {
        const instellingen = getSettingsFromLocalStorage(tabBlad, defaultSettings);
        if(instellingen.selectedPloeg > aantalPloegen) updateLocalStorage('standaardInstellingen', defaultSettings, tabBlad, {ploeg:1});
        updatePloegDropdown(aantalPloegen, instellingen.selectedPloeg);
    } else if (aantalPloegenSelect < aantalPloegen) {
        const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
        updatePloegDropdown(aantalPloegen, selectedPloeg);
    }
    if(tabBlad === 1 || tabBlad === 2) updatePloegenLegende();
    updateCalendar();
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
    let shiftObj = {};
    let datums = {};
    const labelsContainer = document.querySelector('.labels-container');
    const lengte = labelsContainer.children.length;
    for(let i = 1; i <= lengte; i++) {
        const datum = document.getElementById(`date${i}`).value;
        datums[i] = datum;
        for(let j = 1; j <= 7; j++) {
            const dayElement = document.getElementById(`day-${i}${j}`);
            if (dayElement.value === '') {
                shiften.push('x');
            } else {
                shiften.push(dayElement.value === 'x' ? dayElement.value.toLowerCase() : dayElement.value.toUpperCase());
            }
        }
        shiftObj[`Week${i}`] = [...shiften];
        shiften.length = 0;
    }
    const cyclus = getArrayValues(shiftObj);
    //console.log(`cyclus: ${cyclus}`);
    const isValid = checkIngevoerdeWaarden(cyclus) && checkIngevoerdeDatums(datums);
    if (isValid) {
        gegevensOpslaan(shiftObj, datums, lengte);
        toggleModal(false);
    } else {
        alert('Sommige velden zijn niet correct ingevuld !');
    }
};
function checkIngevoerdeWaarden(cyclus) {
    const filteredData = ploegenGegevens.filter(item => item.symbool !== 'OPL');
    return cyclus.every(cyc => {
        return filteredData.some(item => item.symbool === cyc) || cyc === '';
    });
};
function checkIngevoerdeDatums(datums) {
    return Object.values(datums).every(val => val !== '');
}
