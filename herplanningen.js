import { DOM, defaultSettings, getAllValidCells, berekenSaldo } from "./main.js";
import { activeBlad } from "./componentenMaken.js";
import { 
    toggleModal, getSettingsFromLocalStorage, updateLocalStorage, verwijderVerlofDatum, voegVerlofDatumToe, 
    beginSaldoEnRestSaldoInvullen, getBeginRechtFromLocalStorage, calculateTotals 
} from "./functies.js";
import { ploegenGegevens } from "./makeModalSettings.js";

export function handleBlur(e) {
    const verlof = e.target.id;
    const aantal = parseInt(e.target.value);
    if (isNaN(aantal) || aantal < 0) {
        const instellingen = getSettingsFromLocalStorage(activeBlad, defaultSettings);
        const currentYear =  instellingen.currentYear;
        const beginrechtObj = JSON.parse(localStorage.getItem('beginrechtVerlof'));
        //const index = beginrechtArray.findIndex(item => item.year === currentYear);
        e.target.value = beginrechtObj[currentYear][verlof];
        return;
    }
    behandelBeginrechtEnSaldoVerlofdagen(verlof, aantal);
};

function behandelBeginrechtEnSaldoVerlofdagen(verlof, aantal) {
    
    const instellingen = getSettingsFromLocalStorage(activeBlad, defaultSettings);
    const currentYear =  instellingen.currentYear;
    const selectedPloeg = instellingen.selectedPloeg;
    
    const totaal1 = document.getElementById('totaalBeginrecht');
    const totaal2 = document.getElementById('totaalSaldo');
    const mySaldoElt = document.getElementById(`saldo-${verlof}`);
    const saldoOud = parseInt(mySaldoElt.textContent.trim());

    const update = {};
    update[verlof] = aantal;
    updateLocalStorage('beginrechtVerlof', null, currentYear, update);
    
    const saldoNieuw = berekenSaldo(currentYear, selectedPloeg, verlof);
    mySaldoElt.textContent = saldoNieuw;
    if(verlof === "Z") return;
    // Update de totale beginrechten en saldo
    const beginrechtVerlof = getBeginRechtFromLocalStorage(currentYear);
    delete beginrechtVerlof.Z; // Verwijder Z uit beginrechtVerlof, want die wordt apart behandeld
    totaal1.textContent = ` ${calculateTotals(beginrechtVerlof)}`;
    totaal2.textContent = ` ${parseInt(totaal2.textContent.trim()) - saldoOud + saldoNieuw}`;
};

function behandelenSaldoVerlofdagen(nieuw, oud) {
    const verlofdagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    const totaal2 = document.getElementById('totaalSaldo');
    let totaalSaldo = parseInt(totaal2.textContent.trim());

    // If new type is not a verlof, but old is: restore old saldo and total
    if (!verlofdagen.includes(nieuw)) {
        if (verlofdagen.includes(oud)) {
            const saldoElt2 = document.getElementById(`saldo-${oud}`);
            saldoElt2.textContent = parseInt(saldoElt2.textContent) + 1;
            if (oud === "Z") return;
            totaal2.textContent = ` ${totaalSaldo + 1}`;
        }
        return;
    }

    // Decrement new saldo
    const saldoElt1 = document.getElementById(`saldo-${nieuw}`);
    saldoElt1.textContent = parseInt(saldoElt1.textContent) - 1;

    // If old type was not a verlof, decrement total (unless verlof is Z)
    if (!verlofdagen.includes(oud)) {
        if (nieuw !== "Z") {
            totaal2.textContent = ` ${totaalSaldo - 1}`;
        }
        return;
    }

    // Both new and old are verlof types
    const saldoElt2 = document.getElementById(`saldo-${oud}`);
    saldoElt2.textContent = parseInt(saldoElt2.textContent) + 1;

    if (nieuw === "Z") {
        totaal2.textContent = ` ${totaalSaldo + 1}`;
    } else if (oud === "Z") {
        totaal2.textContent = ` ${totaalSaldo - 1}`;
    }
};

function behandelenRechtEnSaldoVerlofdagenNaTerugstellen(verlof) {
    const verlofdagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    if(!verlofdagen.includes(verlof)) return;
    const totaal2 = document.getElementById('totaalSaldo');
    const saldoElt = document.getElementById(`saldo-${verlof}`);
    saldoElt.textContent = parseInt(saldoElt.textContent) + 1;
    if(verlof === "Z") return;
    const totaalSaldo = parseInt(totaal2.textContent.trim());
    totaal2.textContent = ` ${totaalSaldo + 1}`;
};

export function handelHerplanning() {
    const selectedPloeg = getSettingsFromLocalStorage(activeBlad, defaultSettings).selectedPloeg;
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
    toggleModal(true, '30%', 'rgb(170, 170, 170)');
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

export function handelVerlofAanvraag(e) {
    const selectedPloeg = getSettingsFromLocalStorage(activeBlad, defaultSettings).selectedPloeg;
    const selectedCells = JSON.parse(sessionStorage.getItem('selectedCells'));
    if (!Array.isArray(selectedCells) || selectedCells.length === 0 || selectedCells[0].team !== selectedPloeg) return;

    handelAanvraag(e, selectedCells, selectedPloeg);
};

export function cancelAanvraag() {
    const selectedPloeg = getSettingsFromLocalStorage(activeBlad, defaultSettings).selectedPloeg;
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
};

export function cancelAlleAanvragen() {
    const instellingen = getSettingsFromLocalStorage(activeBlad, defaultSettings);
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
};
