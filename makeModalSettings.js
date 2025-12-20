import { DOM, updateCalendar } from "./main.js";
import { defaultSettings, toggleModal, saveToLocalStorage, updatePaginaInstLocalStorage, getSettingsFromLocalStorage, getArrayValues } from "./functies.js";
import { maakPloegenLegende, activeBlad } from "./componentenMaken.js";
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

export let shiftPatroon = JSON.parse(localStorage.getItem("shiftPatroon")) || ploegSchema;
export let startDatums = JSON.parse(localStorage.getItem("startDatums")) || startDates;

export function gegevensLaden() {
    shiftPatroon = JSON.parse(localStorage.getItem("shiftPatroon")) || ploegSchema;
    startDatums = JSON.parse(localStorage.getItem("startDatums")) || startDates;
};

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
    //const customize = document.createElement('button');
    //customize.id = "customize";
    //customize.textContent = "Eigen voorkeuren ophalen";
    //customize.addEventListener('click', makeModalCustomize);
    //topHeader.appendChild(customize);
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

    const divSpacer = document.createElement('div');
    //divSpacer.classList.add('spacer-div');
    divSpacer.style.display = 'flex';
    divSpacer.style.justifyContent = 'space-between';
    divSpacer.style.alignItems = 'center';
    divSpacer.style.marginTop = '20px';
    const reset = document.createElement('button');
    reset.id = "reset";
    reset.textContent = "Standaardinstellingen terugzetten";
    //reset.style.background = '#0b63d0';
    //reset.style.color = '#fff';
    reset.addEventListener('click', resetDefaultSettings);
    divSpacer.appendChild(reset);
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '10px';
    //div.classList.add('modal-button-container');
    const button1 = document.createElement('button');
    button1.id = "btnCancel";
    button1.textContent = "Annuleer";
    button1.addEventListener('click', () => toggleModal());
    div.appendChild(button1);
    const button2 = document.createElement('button');
    button2.classList.add('print-modal-button');
    //button2.style.background = '#0b63d0';
    //button2.style.color = '#fff';
    button2.id = "btnOverlay";
    button2.textContent = "Opslaan";
    button2.addEventListener('click', ploegSysteemOpslaan);
    div.appendChild(button2);
    divSpacer.appendChild(div);
    overlayContainer.appendChild(divSpacer);
    DOM.overlay.appendChild(overlayContainer);
};

export const makeModalCustomize = () => {
    DOM.overlay.innerHTML = '';
    let html = `
        <div class="customize-container">
            <div class="checkbox-container">
                <label><input type="checkbox" id="checkbox0">Alles ophalen</label>
                <label><input type="checkbox" id="checkbox1">Eigen ploegschema ophalen</label>
                <label><input type="checkbox" id="checkbox2">Eigen beginrechten ophalen</label>
                <label><input type="checkbox" id="checkbox3">Eigen ingeplande verlofdagen</label>
            </div>
        </div>
        <div class="customize-button-container">
            <button id="apply-customize">Toepassen</button>
            <button id="cancel-customize">Annuleren</button>
        </div>
    `;
    DOM.overlay.innerHTML = html;

    const checkboxes = DOM.overlay.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const allCheckbox = checkboxes[0]; // eerste checkbox is "All"
            const otherCheckboxes = Array.from(checkboxes).slice(1);

            if (checkbox === allCheckbox) {
            // Als "All" wordt gewijzigd
                otherCheckboxes.forEach(cb => cb.checked = allCheckbox.checked);
            } else {
            // Als een andere checkbox wordt gewijzigd
                if (!checkbox.checked) {
                    allCheckbox.checked = false;
                } else if (otherCheckboxes.every(cb => cb.checked)) {
                    allCheckbox.checked = true;
                }
            }
        });
    });

    document.getElementById('cancel-customize').addEventListener('click', () => {
        //makeModalInstellingen(shiftPatroon, startDatums);
        toggleModal();
    });
    document.getElementById('apply-customize').addEventListener('click', () => {
        const isChecked1 = document.getElementById('checkbox1').checked;
        const isChecked2 = document.getElementById('checkbox2').checked;
        const isChecked3 = document.getElementById('checkbox3').checked;
        if (!isChecked1 && !isChecked2 && !isChecked3) return;
        // vervolgens de import functie aanroepen met de juiste parameters
    });
};

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
    
    if(aantalShiften === 1) return;
    if((aantalShiften - 1) % 7 === 0) {
        wekenContainer.removeChild(wekenContainer.lastElementChild);
    } else {
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
    const userResponse = confirm(`Weet je zeker dat je de standaardinstellingen wilt terugzetten? Dit kan niet ongedaan worden gemaakt!`);
    if (!userResponse) return;
    
    gegevensOpslaan(ploegSchema, startDates, false);
    toggleModal();
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
            if(instellingen.selectedPloeg > aantalPloegen) updatePaginaInstLocalStorage('paginaInstellingen', defaultSettings, i, {ploeg:1});
        });
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

    updateCalendar(true);
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
        toggleModal();
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