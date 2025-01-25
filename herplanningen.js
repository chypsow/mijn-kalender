import { DOM, defaultSettings, ploegenGegevens } from "./main.js";
import { tabBlad } from "./componentenMaken.js";
import { 
    toggleModal, getSettingsFromLocalStorage, verwijderVerlofDatum, voegVerlofDatumToe,
    behandelenSaldoVerlofdagen, behandelenRechtEnSaldoVerlofdagenNaTerugstellen, behandelenNaAllesTerugstellen 
} from "./functies.js";

export function handelVerlofAanvraag(e) {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if (!selectedCell || selectedCell.team !== selectedPloeg) return;

    handelAanvraag(e, selectedCell, selectedPloeg);
};

export function handelHerplanning() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if (!selectedCell || selectedCell.team !== selectedPloeg) return;

    makeModalHerplanning(selectedCell, selectedPloeg);
};

function makeModalHerplanning(selectedCell, selectedPloeg) {
    DOM.overlay.innerHTML = '';
    
    const container = document.createElement('div');
    container.classList.add('herplanning-container');
    ploegenGegevens.forEach(obj => {
        const herplanning = document.createElement('div');
        herplanning.textContent = obj.symbool;
        herplanning.classList.add('hp');
        herplanning.classList.add('verlofCollection');
        herplanning.addEventListener('click', (e) => {
            handelAanvraag(e, selectedCell, selectedPloeg);
            toggleModal(false);
        });
        container.appendChild(herplanning);
    });
    DOM.overlay.appendChild(container);
    toggleModal(true, '25%');
};

function handelAanvraag(e, selectedCell, selectedPloeg) {
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'hp'];
    const elt = e.target;
    const aanvraag = elt.textContent;
    
    const className = verlofDagen.includes(aanvraag) ? aanvraag : 'hp';
    [...DOM.calendar.querySelectorAll('.cell')].some(cel => {
        if (cel.dataset.datum === selectedCell.datum) {
            const inhoud = cel.textContent;
            if(verlofDagen.includes(aanvraag) && cel.dataset.shift.includes('x')) return;
            if(aanvraag.includes('x') && (cel.dataset.shift === 'x' || cel.dataset.shift === 'x- fd')) {
                cel.classList.remove('hp');
                cel.classList.add('x');
                cel.textContent = cel.dataset.shift;
                verwijderVerlofDatum(selectedPloeg, selectedCell.datum);
                return;
            }
            verlofDagen.forEach(verlof => cel.classList.remove(verlof));
            cel.classList.remove('x');
            cel.textContent = cel.dataset.shift.includes('fd') ? `${aanvraag}- fd` : aanvraag;
            cel.classList.add(className);
            voegVerlofDatumToe(selectedPloeg, selectedCell.datum, aanvraag);
            behandelenSaldoVerlofdagen(aanvraag, inhoud);
    
            return true;
        }
        return false;
    });
};

export function cancelAanvraag() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if (!selectedCell || selectedCell.team !== selectedPloeg) return;

    const verlofDagen = ['BV','CS','ADV','BF','AV','HP','Z','hp'];
    [...DOM.calendar.querySelectorAll('.cell')].some(cel => {
        if (cel.dataset.datum === selectedCell.datum) {
            verlofDagen.forEach(className => cel.classList.remove(className));
            const className = cel.textContent;
            cel.textContent = cel.dataset.shift;
            if(cel.textContent === 'x' || cel.textContent === 'x- fd') cel.classList.add('x');
            const canceledDatum = selectedCell.datum;
            verwijderVerlofDatum(selectedPloeg, canceledDatum);
            behandelenRechtEnSaldoVerlofdagenNaTerugstellen(className);
            return true;
        }
        return false;
    });
};

export function cancelAlleAanvragen() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const verlofDagen = ['BV','CS','ADV','BF','AV','HP','Z','hp'];
    const cellen = DOM.calendar.querySelectorAll('.cell');

    const bestaandeVerlof = Array.from(cellen).some(cel => {
        return Array.from(cel.classList).some(className => verlofDagen.includes(className));
    });
    if (!bestaandeVerlof) return;

    const userResponse = confirm(`Bent u zeker om alle dagen terug te stellen?

Als u op OK drukt zullen alle verlofdagen en herplanningen verwijderd worden.`);
    if (!userResponse) return;

    cellen.forEach(cel => {
        Array.from(cel.classList).forEach(className => {
            if (verlofDagen.includes(className)) {
                cel.classList.remove(className);
                cel.textContent = cel.dataset.shift;
                if(cel.textContent === 'x' || cel.textContent === 'x- fd') cel.classList.add('x');
                const canceledDatum = cel.dataset.datum;
                verwijderVerlofDatum(selectedPloeg, canceledDatum);
            }
        });
    });

    behandelenNaAllesTerugstellen(selectedPloeg);
}
