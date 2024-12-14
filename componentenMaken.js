import { shiftenGegevens, DOM, currentMonth, currentYear, selectedPloeg, verlofdagenPloegen, localStoragePloegen } from './ploegenRooster.js';
import { saveToLocalStorage } from './functies.js';

export function maakPloegDropdown() {
    Array.from({ length:5 }).forEach((_, i) => {
        const option = document.createElement('option');
        option.value = i+1;
        option.textContent = `Ploeg ${i+1}`;
        DOM.ploeg.appendChild(option);
    });
};

export function maakLegende() {
    shiftenGegevens.forEach(shift => {
    const legendeItem = document.createElement('div');
    legendeItem.classList.add('legende-item');
    
    const kleurVak = document.createElement('span');
    kleurVak.classList.add('legende-vak');
    kleurVak.style.backgroundColor = shift.kleur;
    legendeItem.appendChild(kleurVak);

    const beschrijving = document.createElement('span');
    beschrijving.textContent = `${shift.symbool} : ${shift.naam.charAt(0).toUpperCase()}${shift.naam.slice(1)}`;
    legendeItem.appendChild(beschrijving);

    DOM.legende.appendChild(legendeItem);
    });
};

export function maakDropdowns() {
    const months = [
        "januari", "februari", "maart", "april", "mei", "juni",
        "juli", "augustus", "september", "oktober", "november", "december"
    ];
    DOM.monthSelect.innerHTML = "";
    months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = month;
        option.style.color = 'black';
        if (index === currentMonth) option.selected = true;
        DOM.monthSelect.appendChild(option);
    });
    DOM.yearSelect.innerHTML = "";
    for (let year = 2010; year <= 2040; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        option.style.color = 'black';
        if (year === currentYear) option.selected = true;
        DOM.yearSelect.appendChild(option);
    }
};

export function maakVerlofContainer() {
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    verlofDagen.forEach(verlof => {
        const verlofDag = document.createElement('div');
        verlofDag.textContent = verlof;
        verlofDag.classList.add(verlof);
        verlofDag.classList.add('verlofCollection');
        verlofDag.addEventListener('click', verlofAanvraag);
        DOM.verlofContainer.appendChild(verlofDag);
    });
    const restore = document.createElement('div');
    restore.textContent = 'Annuleren';
    restore.addEventListener('click', cancelAanvraag);
    restore.classList.add('restore');
    DOM.verlofContainer.appendChild(restore);
};
function verlofAanvraag(e) {
    const aanvraag = e.target.textContent;
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if(!selectedCell) return;
    if(selectedCell.team !== selectedPloeg) return;
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    Array.from(DOM.calendar.querySelectorAll('.cell')).forEach(cel => {
        if(!cel.textContent.includes('x')) {
            if(cel.dataset.datum === selectedCell.datum) {
                cel.classList.forEach(className => {
                    if(verlofDagen.includes(className)) cel.classList.remove(className);
                });
                cel.textContent = aanvraag;
                cel.classList.add(aanvraag);
                voegVerlofDatumToe(selectedPloeg, selectedCell.datum, aanvraag);
            }
        }
    });
};
function cancelAanvraag() {
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if(!selectedCell) return;
    if(selectedCell.team !== selectedPloeg) return;
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    Array.from(DOM.calendar.querySelectorAll('.cell')).forEach(cel => {
        if(cel.textContent !== 'x') {
            if(cel.dataset.datum === selectedCell.datum) {
                cel.classList.forEach(className => {
                    if(verlofDagen.includes(className)) {
                        cel.classList.remove(className);
                        cel.textContent = cel.dataset.shift;
                        const canceledDatum = selectedCell.datum;
                        verwijderVerlofDatum(selectedPloeg, canceledDatum);
                    }
                });
            }
        }
    });
};
function verwijderVerlofDatum(ploeg, datum) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const index = verlofdagenPloegen[ploegKey].findIndex(obj => obj.datum === datum);

    if (index !== -1) {
        verlofdagenPloegen[ploegKey].splice(index, 1);
        saveToLocalStorage(localStoragePloegen[ploeg], verlofdagenPloegen[ploegKey]);
    }
};
function voegVerlofDatumToe(ploeg, datum, soort) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const array = verlofdagenPloegen[ploegKey];
    const index = array.findIndex(obj => obj.datum === datum);
    if (index === -1) {
        array.push({ datum, soort });
    } else if (array[index].soort !== soort) {
        array[index].soort = soort;
    }
    saveToLocalStorage(localStoragePloegen[ploeg], array);
};