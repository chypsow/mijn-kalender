import { DOM, defaultSettings, ploegenGegevens, getAllValidCells} from "./main.js";
import { tabBlad } from "./componentenMaken.js";
import { 
    toggleModal, getSettingsFromLocalStorage, verwijderVerlofDatum, voegVerlofDatumToe,
    behandelenSaldoVerlofdagen, behandelenRechtEnSaldoVerlofdagenNaTerugstellen, beginSaldoEnRestSaldoInvullen, 
} from "./functies.js";

export function handelHerplanning() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCells = JSON.parse(sessionStorage.getItem('selectedCells'));
    if (!Array.isArray(selectedCells) || selectedCells.length === 0 || selectedCells[0].team !== selectedPloeg) return;

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

export function handelVerlofAanvraag(e) {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCells = JSON.parse(sessionStorage.getItem('selectedCells'));
    if (!Array.isArray(selectedCells) || selectedCells.length === 0 || selectedCells[0].team !== selectedPloeg) return;

    handelAanvraag(e, selectedCells, selectedPloeg);
};

function handelAanvraag(e, selectedCells, selectedPloeg) {
    const vrijeDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'hp'];
    const elt = e.target;
    const aanvraag = elt.textContent;
    const className = vrijeDagen.includes(aanvraag) ? aanvraag : 'hp';

    const calendarCells = getAllValidCells();

    selectedCells.forEach(selectedCell => {
        calendarCells.some(cel => {
            if (cel.dataset.datum !== selectedCell.datum) return false;

            const oud = cel.textContent.replace(/- fd$/, '');
            if (oud === aanvraag) return false;

            //console.log(`Aanvraag: ${aanvraag}, Oud: ${oud}`);
            if (vrijeDagen.includes(aanvraag) && cel.dataset.shift.includes('x')) return true;

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
            vrijeDagen.forEach(verlof => cel.classList.remove(verlof));
            cel.classList.remove('x');

            // Apply new aanvraag
            cel.textContent = cel.dataset.shift.includes('fd')
                ? `${aanvraag}- fd`
                : aanvraag;
            cel.classList.add(className);

            // Opslag en saldo
            voegVerlofDatumToe(selectedPloeg, selectedCell.datum, aanvraag);
            behandelenSaldoVerlofdagen(aanvraag, oud);

            return true;
        });
    });
}

export function cancelAanvraag() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCells = JSON.parse(sessionStorage.getItem('selectedCells'));
    if (!selectedCells || selectedCells.length === 0 || selectedCells[0].team !== selectedPloeg) return;

    const vrijeDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'hp'];
    const calendarCells = getAllValidCells();

    selectedCells.forEach(selectedCell => {
        calendarCells.some(cel => {
            if (cel.dataset.datum !== selectedCell.datum) return false;

            // Verwijder oude verlofklassen
            vrijeDagen.forEach(className => cel.classList.remove(className));

            //const vrijedagText = cel.textContent;
            const className = cel.textContent.replace(/- fd$/, '');

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
    const vrijeDagen = ['BV','CS','ADV','BF','AV','HP','Z','hp'];
    const cellen = getAllValidCells();

    const bestaandeVerlof = cellen.some(cel => {
        return Array.from(cel.classList).some(className => vrijeDagen.includes(className));
    });
    if (!bestaandeVerlof) return;
    
    const userResponse = confirm(`
Als u op OK drukt zullen alle verlofdagen alsook herplanningen van het jaar ${currentYear} verwijderd worden.
    `);
    if (!userResponse) return;
   
    cellen.forEach(cel => {
        Array.from(cel.classList).forEach(className => {
            if (vrijeDagen.includes(className)) {
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
