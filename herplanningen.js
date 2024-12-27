import { DOM, defaultSettings, opgenomenVerlofPerPloeg, localStoragePloegen } from "./main.js";
import { toggleModal, getSettingsFromLocalStorage, saveToLocalStorage, behandelenSaldoVerlofdagen, behandelenRechtEnSaldoVerlofdagenNaTerugstellen, behandelenNaAllesTerugstellen } from "./functies.js";
import { tabBlad } from "./componentenMaken.js";


export function behandelHerplanning() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if(!selectedCell) return;
    if(selectedCell.team !== selectedPloeg) return;
    makeModalHerplanning(selectedCell);
}
function makeModalHerplanning(selectedCell) {
    DOM.overlay.innerHTML = '';
    const herplanningen = ['N12','N','V12','V','L','D','x','OPL'];

    const container = document.createElement('div');
    container.classList.add('herplanning-container');
    herplanningen.forEach(hp => {
        const herplanning = document.createElement('div');
        herplanning.textContent = hp;
        herplanning.classList.add('hp');
        herplanning.classList.add('verlofCollection');
        herplanning.addEventListener('click', (e) => {
            herplanningAanvraag(e, selectedCell);
        });
        container.appendChild(herplanning);
    });
    DOM.overlay.appendChild(container);
    toggleModal(true, '25%');
}
function herplanningAanvraag(e, selectedCell) {
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'shift-thuis'];
    const aanvraag = e.target.textContent;
    Array.from(DOM.calendar.querySelectorAll('.cell')).forEach(cel => {
        if(cel.dataset.datum === selectedCell.datum) {
            cel.classList.forEach(className => {
                if(verlofDagen.includes(className)) cel.classList.remove(className);
            });
            const inhoud = cel.textContent;
            cel.textContent = aanvraag;
            cel.classList.add('hp');
            //voegVerlofDatumToe(selectedPloeg, selectedCell.datum, aanvraag);
            behandelenSaldoVerlofdagen(aanvraag, inhoud);
        }
    });
}
export function verlofAanvraag(event) {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if(!selectedCell) return;
    if(selectedCell.team !== selectedPloeg) return;
    
    const aanvraag = event.target.textContent;
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'hp'];
    Array.from(DOM.calendar.querySelectorAll('.cell')).forEach(cel => {
        if(!cel.textContent.includes('x')) {
            if(cel.dataset.datum === selectedCell.datum) {
                cel.classList.forEach(className => {
                    if(verlofDagen.includes(className)) cel.classList.remove(className);
                });
                const inhoud = cel.textContent;
                cel.textContent = aanvraag;
                cel.classList.add(aanvraag);
                voegVerlofDatumToe(selectedPloeg, selectedCell.datum, aanvraag);
                behandelenSaldoVerlofdagen(aanvraag, inhoud);
            }
        }
    });
};
export function voegVerlofDatumToe(ploeg, datum, soort) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const array = opgenomenVerlofPerPloeg[ploegKey];
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
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'hp'];
    Array.from(DOM.calendar.querySelectorAll('.cell')).forEach(cel => {
        //if(cel.textContent !== 'x') {
            if(cel.dataset.datum === selectedCell.datum) {
                cel.classList.forEach(className => {
                    if(verlofDagen.includes(className)) {
                        cel.classList.remove(className);
                        cel.textContent = cel.dataset.shift;
                        if(['x','x- fd'].includes(cel.textContent)) cel.classList.add('shift-thuis');
                        const canceledDatum = selectedCell.datum;
                        verwijderVerlofDatum(selectedPloeg, canceledDatum);
                        behandelenRechtEnSaldoVerlofdagenNaTerugstellen(className);
                    }
                });
            }
        //}
    });
};
function verwijderVerlofDatum(ploeg, datum) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const index = opgenomenVerlofPerPloeg[ploegKey].findIndex(obj => obj.datum === datum);

    if (index !== -1) {
        opgenomenVerlofPerPloeg[ploegKey].splice(index, 1);
        saveToLocalStorage(localStoragePloegen[ploeg], opgenomenVerlofPerPloeg[ploegKey]);
    }
};
export function cancelAlleAanvragen() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
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
                behandelenNaAllesTerugstellen(selectedPloeg);
            }
        });
    });
};