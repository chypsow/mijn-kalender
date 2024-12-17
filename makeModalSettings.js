import { DOM, startDatums, ploegSchema, shiftenGegevens, gegevensOpslaan } from "./main.js";
import { resetDefaultSettings } from "./functies.js";

export function makeModalInstellingen(obj, arr) {
    DOM.overlay.innerHTML = '';
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
            count++;
            label.appendChild(input);
        });
        DOM.overlay.appendChild(label);
    });

    DOM.overlay.appendChild(document.createElement('br'));
    DOM.overlay.appendChild(document.createElement('br'));

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
    reset.addEventListener('click', () => {
        resetDefaultSettings(startDatums, ploegSchema);
    });
    div.appendChild(reset);
    DOM.overlay.appendChild(div);

    toggleModal(true);
};
export function toggleModal(show) {
    DOM.modalOverlay.style.display = show ? "block" : "none";
    DOM.modal.style.display = show ? "block" : "none";
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
        return shiftenGegevens.some(item => item.symbool === cyc);
    });
};
