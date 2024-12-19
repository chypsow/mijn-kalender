import { DOM, defaultSettings } from "./main.js";
import { getSettingsFromLocalStorage, saveToLocalStorage } from "./functies.js";
import { tabBlad } from "./componentenMaken.js";

export const verlofdagenPloegen = {
    verlofdagenPloeg1: JSON.parse(localStorage.getItem('verlofdagenPloeg1')) || [],
    verlofdagenPloeg2: JSON.parse(localStorage.getItem('verlofdagenPloeg2')) || [],
    verlofdagenPloeg3: JSON.parse(localStorage.getItem('verlofdagenPloeg3')) || [],
    verlofdagenPloeg4: JSON.parse(localStorage.getItem('verlofdagenPloeg4')) || [],
    verlofdagenPloeg5: JSON.parse(localStorage.getItem('verlofdagenPloeg5')) || []
};
const localStoragePloegen = {
    1: 'verlofdagenPloeg1',
    2: 'verlofdagenPloeg2',
    3: 'verlofdagenPloeg3',
    4: 'verlofdagenPloeg4',
    5: 'verlofdagenPloeg5'
};
export function savePloegenToLocalStorage() {
    Object.values(localStoragePloegen).forEach((ploeg, index) => {
        const ploegKey = ploeg;
        saveToLocalStorage(`verlofdagenPloeg${index+1}`, verlofdagenPloegen[ploegKey]);
    });
};

export function verlofAanvraag(event) {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const aanvraag = event.target.textContent;
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
export function cancelAanvraag() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
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
export function cancelAlleAanvragen() {
    let selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    const cellen = DOM.calendar.querySelectorAll('.cell');
    const bestaandeVerlof = Array.from(cellen).some(cel => verlofDagen.includes(cel.textContent));
    if(!bestaandeVerlof) return;
    const userResponse = confirm("Bent u zeker om alle verlof dagen te verwijderen ?");
    if(!userResponse) return;
    cellen.forEach(cel => {
        cel.classList.forEach(className => {
            if(verlofDagen.includes(className)) {
                cel.classList.remove(className);
                cel.textContent = cel.dataset.shift;
                const canceledDatum = cel.dataset.datum;
                verwijderVerlofDatum(selectedPloeg, canceledDatum);
            }
        });

    });
};