import { DOM, defaultSettings, ploegenGegevens } from "./main.js";
import { tabBlad } from "./componentenMaken.js";
import { 
    toggleModal, getSettingsFromLocalStorage, verwijderVerlofDatum, voegVerlofDatumToe,
    behandelenSaldoVerlofdagen, behandelenRechtEnSaldoVerlofdagenNaTerugstellen, beginSaldoEnRestSaldoInvullen, 
} from "./functies.js";

export function handelVerlofAanvraag(e) {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCells = JSON.parse(sessionStorage.getItem('selectedCells'));
    if (!selectedCells || selectedCells[0].team !== selectedPloeg) return;

    handelAanvraag(e, selectedCells, selectedPloeg);
};

export function handelHerplanning() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCells = JSON.parse(sessionStorage.getItem('selectedCells'));
    if (!selectedCells || selectedCells[0].team !== selectedPloeg) return;

    makeModalHerplanning(selectedCells, selectedPloeg);
};

function makeModalHerplanning(selectedCells, selectedPloeg) {
    DOM.overlay.innerHTML = '';
    
    const container = document.createElement('div');
    container.classList.add('herplanning-container');
    ploegenGegevens.forEach(obj => {
        const herplanning = document.createElement('div');
        herplanning.textContent = obj.symbool;
        herplanning.classList.add('hp');
        herplanning.classList.add('verlofCollection');
        herplanning.addEventListener('click', (e) => {
            handelAanvraag(e, selectedCells, selectedPloeg);
            toggleModal(false);
        });
        container.appendChild(herplanning);
    });
    DOM.overlay.appendChild(container);
    toggleModal(true, '25%');
};

function handelAanvraag(e, selectedCells, selectedPloeg) {
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'hp'];
    const elt = e.target;
    const aanvraag = elt.textContent;
    const className = verlofDagen.includes(aanvraag) ? aanvraag : 'hp';

    const calendarCells = [...DOM.calendar.querySelectorAll('.cell[data-datum]')];

    selectedCells.forEach(selectedCell => {
        calendarCells.some(cel => {
            if (cel.dataset.datum !== selectedCell.datum) return false;

            const inhoud = cel.textContent;

            if (verlofDagen.includes(aanvraag) && cel.dataset.shift.includes('x')) return true;

            if (
                aanvraag.includes('x') &&
                (cel.dataset.shift === 'x' || cel.dataset.shift === 'x- fd')
            ) {
                cel.classList.remove('hp');
                cel.classList.add('x');
                cel.textContent = cel.dataset.shift;
                verwijderVerlofDatum(selectedPloeg, selectedCell.datum);
                return true;
            }

            // Reset cell
            verlofDagen.forEach(verlof => cel.classList.remove(verlof));
            cel.classList.remove('x');

            // Apply new aanvraag
            cel.textContent = cel.dataset.shift.includes('fd')
                ? `${aanvraag}- fd`
                : aanvraag;
            cel.classList.add(className);

            // Opslag en saldo
            voegVerlofDatumToe(selectedPloeg, selectedCell.datum, aanvraag);
            behandelenSaldoVerlofdagen(aanvraag, inhoud);

            return true;
        });
    });
}


export function cancelAanvraag() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCells = JSON.parse(sessionStorage.getItem('selectedCells'));
    if (!selectedCells || selectedCells.length === 0 || selectedCells[0].team !== selectedPloeg) return;

    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'hp'];
    const calendarCells = [...DOM.calendar.querySelectorAll('.cell[data-datum]')];

    selectedCells.forEach(selectedCell => {
        calendarCells.some(cel => {
            if (cel.dataset.datum !== selectedCell.datum) return false;

            // Verwijder oude verlofklassen
            verlofDagen.forEach(className => cel.classList.remove(className));

            const className = cel.textContent;

            // Zet shift terug
            cel.textContent = cel.dataset.shift;
            if (cel.textContent === 'x' || cel.textContent === 'x- fd') {
                cel.classList.add('x');
            }

            verwijderVerlofDatum(selectedPloeg, selectedCell.datum);
            behandelenRechtEnSaldoVerlofdagenNaTerugstellen(className);

            return true;
        });
    });
}


export function cancelAlleAanvragen() {
    const instellingen = getSettingsFromLocalStorage(tabBlad, defaultSettings);
    const currentYear =  instellingen.currentYear;
    const selectedPloeg = instellingen.selectedPloeg;
    const verlofDagen = ['BV','CS','ADV','BF','AV','HP','Z','hp'];
    const cellen = DOM.calendar.querySelectorAll('.cell');

    const bestaandeVerlof = Array.from(cellen).some(cel => {
        return Array.from(cel.classList).some(className => verlofDagen.includes(className));
    });
    if (!bestaandeVerlof) return;
    
    const userResponse = confirm(`
Als u op OK drukt zullen alle verlofdagen alsook herplanningen van het jaar ${currentYear} verwijderd worden.
    `);
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

    beginSaldoEnRestSaldoInvullen(currentYear, selectedPloeg);
}
