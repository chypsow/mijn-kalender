import { DOM, defaultSettings, ploegenGegevens, getAllValidCells } from "./main.js";
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
    toggleModal(true, '25%', '#9a9a4a');
};

export function handelVerlofAanvraag(e) {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCells = JSON.parse(sessionStorage.getItem('selectedCells'));
    if (!Array.isArray(selectedCells) || selectedCells.length === 0 || selectedCells[0].team !== selectedPloeg) return;

    handelAanvraag(e, selectedCells, selectedPloeg);
};

function handelAanvraag(e, selectedCells, selectedPloeg) {
    const vrijeDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'hp'];
    const aanvraag = e.target.textContent;
    const className = vrijeDagen.includes(aanvraag) ? aanvraag : 'hp';
    const calendarCells = getAllValidCells();

    selectedCells.forEach(({ datum }) => {
        const cel = calendarCells.find(c => c.dataset.datum === datum);
        if (!cel) return;

        const vorigeInhoud = cel.textContent.replace(/- fd$/, '');
        if (vorigeInhoud === aanvraag) return;

        // Reset classes
        [...vrijeDagen, 'x'].forEach(cls => cel.classList.remove(cls));

        const shift = cel.dataset.shift || '';
        const heeftFd = cel.textContent.includes('fd');
        cel.textContent = heeftFd ? `${aanvraag}- fd` : aanvraag;

        if (shift === aanvraag || shift === `${aanvraag}- fd`) {
            if (shift === 'x' || shift === 'x- fd') cel.classList.add('x');
            verwijderVerlofDatum(selectedPloeg, datum);
        } else {
            cel.classList.add(className);
            voegVerlofDatumToe(selectedPloeg, datum, aanvraag);
        }

        behandelenSaldoVerlofdagen(aanvraag, vorigeInhoud);
    });
};

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
