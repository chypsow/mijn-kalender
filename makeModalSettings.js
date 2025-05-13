import { DOM, ploegenGegevens, gegevensOpslaan, standaardTerugstellen } from "./main.js";
import { toggleModal } from "./functies.js";

export function makeModalInstellingen(obj, arr) {
    DOM.overlay.innerHTML = '';
    const topHeader = document.createElement('div');
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
        <li><h4 style="color:#00abb1; margin-bottom:5px">Volledige cyclus (5 weken):</h4>
            Een volledige cyclus bestaat uit 5 weken. 
            Elke ploeg werkt en rust in een specifiek patroon dat zich herhaalt na 5 weken.
        </li>
        <li><h4 style="color:#00abb1; margin-bottom:5px">Startdatum:</h4>
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
    
    DOM.overlay.appendChild(topHeader);

    let count = 0;
    Array.from({ length: 5}).forEach((_, i) => {
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.textContent = `Week ${i+1}: `;
        label.appendChild(span);
        Array.from({ length: 7 }).forEach((_, j) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `day-${i+1}${j+1}`;
            input.className = 'shift-input';
            input.value = arr[count] || '';
            input.addEventListener('focus', function() {
                this.select();
            });
            count++;
            label.appendChild(input);
        });
        DOM.overlay.appendChild(label);
    });

    DOM.overlay.appendChild(document.createElement('br'));
    //DOM.overlay.appendChild(document.createElement('br'));

    Object.keys(obj).forEach(i => {
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.textContent = `Startdatum ${i}: `;
        label.appendChild(span);
        const input = document.createElement('input');
        input.type = 'date';
        input.id = `date${i}`;
        input.className = 'date-input';
        input.value = obj[i] || '';
        label.appendChild(input);
        DOM.overlay.appendChild(label);
    });

    DOM.overlay.appendChild(document.createElement('br'));
    DOM.overlay.appendChild(document.createElement('br'));

    const div = document.createElement('div');
    div.classList.add('button-container');
    const button = document.createElement('button');
    button.className = "btnOverlay";
    button.textContent = "Opslaan";
    button.addEventListener('click', ploegSysteemOpslaan);
    div.appendChild(button);
    const reset = document.createElement('button');
    reset.className = "reset";
    reset.textContent = "Standaardinstellingen terugzetten";
    reset.addEventListener('click', standaardTerugstellen);
    div.appendChild(reset);
    DOM.overlay.appendChild(div);

    toggleModal(true, '50%');
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
