import { DOM, ploegenGegevens, gegevensOpslaan, startDatums, ploegSchema } from "./main.js";
import { toggleModal } from "./functies.js";

export function makeModalInstellingen(obj, arr) {
    DOM.overlay.innerHTML = '';
    const topHeader = document.createElement('div');
    topHeader.classList.add('top-header');
    const heading = document.createElement('h2');
    heading.classList.add('heading-modal');
    heading.textContent = 'Ploegschema personnalizeren:';
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
        <li><h4>Volledige cyclus (5 weken):</h4> 
            Een volledige cyclus bestaat uit 5 weken. 
            Elke ploeg werkt en rust in een specifiek patroon dat zich herhaalt na 5 weken.
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
    DOM.overlay.appendChild(topHeader);

    let count = 0;
    Array.from({ length: 5}).forEach((_, i) => {
        const labelsContainer = document.createElement('div');
        labelsContainer.classList.add('labels-container');
        const label1 = document.createElement('label');
        label1.classList.add('label-week');
        const span = document.createElement('span');
        span.textContent = `Week ${i+1}: `;
        label1.appendChild(span);
        Array.from({ length: 7 }).forEach((_, j) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `day-${i+1}${j+1}`;
            input.className = 'shift-input';
            input.value = arr[count] || '';
            input.addEventListener('focus', function() {
                this.select();
                document.getElementById('btnOverlay').disabled = false;
                document.getElementById('reset').disabled = false;
            });
            count++;
            label1.appendChild(input);
        });
        labelsContainer.appendChild(label1);

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
        //label.appendChild(document.createElement('br'));
        //label.appendChild(document.createElement('br'));
        //label.appendChild(document.createElement('br'));
        labelsContainer.appendChild(label);
        DOM.overlay.appendChild(labelsContainer);
        
    });

    DOM.overlay.appendChild(document.createElement('br'));
    DOM.overlay.appendChild(document.createElement('br'));

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
    reset.addEventListener('click', () => {
        resetDefaultSettings(startDatums, ploegSchema);
    });
    div.appendChild(reset);
    DOM.overlay.appendChild(div);
};

function resetDefaultSettings(obj, arr) {
    // Reset the input fields to default values
    const userResponse = confirm(`Weet je zeker dat je de standaardinstellingen wilt terugzetten? Dit kan niet ongedaan worden gemaakt!`);
    // If the user cancels, exit the function
    if (!userResponse) return;
    let counter = 0;
    for(let i = 1; i <= 5; i++) {
        const datum = document.getElementById(`date${i}`);
        datum.value = obj[i];
        for(let j = 1; j <= 7; j++) {
            const dayElement = document.getElementById(`day-${i}${j}`);
            dayElement.value = arr[counter];
            counter++;
        }
    }
    gegevensOpslaan(arr, obj, false);
    document.getElementById('btnOverlay').disabled = true;
    document.getElementById('reset').disabled = true;
    //toggleModal(false);
};


function ploegSysteemOpslaan() {
    let cyclus = [];
    let datums = {};
    for(let i = 1; i <= 5; i++) {
        const datum = document.getElementById(`date${i}`).value;
        datums[i] = datum;
        for(let j = 1; j <= 7; j++) {
            const dayElement = document.getElementById(`day-${i}${j}`);
            cyclus.push(dayElement.value === 'x' ? dayElement.value.toLowerCase() : dayElement.value.toUpperCase());
        }
    }
    const isValid = checkIngevoerdeWaarden(cyclus);
    if (isValid) {
        gegevensOpslaan(cyclus, datums);
        toggleModal(false);
    } else {
        alert('Sommige velden zijn niet correct ingevuld !');
    }
};
function checkIngevoerdeWaarden(cyclus) {
    return cyclus.every(cyc => {
        return ploegenGegevens.some(item => item.symbool === cyc);
    });
};
