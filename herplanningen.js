import { DOM, defaultSettings } from "./main.js";
import { 
    toggleModal, getSettingsFromLocalStorage, verwijderVerlofDatum, voegVerlofDatumToe,
    behandelenSaldoVerlofdagen, behandelenRechtEnSaldoVerlofdagenNaTerugstellen, behandelenNaAllesTerugstellen 
} from "./functies.js";
import { tabBlad } from "./componentenMaken.js";

export function handelHerplanning() {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if (!selectedCell || selectedCell.team !== selectedPloeg) return;

    makeModalHerplanning(selectedCell, selectedPloeg);
}
function makeModalHerplanning(selectedCell, selectedPloeg) {
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
            handelAanvraag(e, selectedCell, selectedPloeg);
            toggleModal(false);
        });
        container.appendChild(herplanning);
    });
    DOM.overlay.appendChild(container);
    toggleModal(true, '25%');
}
function handelAanvraag(e, selectedCell, selectedPloeg) {
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z', 'hp'];
    const elt = e.target;
    const aanvraag = elt.textContent;
    //if(verlofDagen.includes(aanvraag) && aanvraag.includes('x')) return;
    const className = verlofDagen.includes(aanvraag) ? aanvraag : 'hp';
    [...DOM.calendar.querySelectorAll('.cell')].some(cel => {
        if (cel.dataset.datum === selectedCell.datum) {
            const inhoud = cel.textContent;
            if(verlofDagen.includes(aanvraag) && cel.dataset.shift.includes('x')) return;
            if(aanvraag.includes('x') && cel.dataset.shift.includes('x')) {
                cel.classList.remove('hp');
                cel.textContent = 'x';
                verwijderVerlofDatum(selectedPloeg, selectedCell.datum);
                return;
            }
            verlofDagen.forEach(verlof => cel.classList.remove(verlof));
            cel.textContent = aanvraag;
            
            cel.classList.add(className);       // Voeg nieuwe klasse toe
            voegVerlofDatumToe(selectedPloeg, selectedCell.datum, aanvraag);
            behandelenSaldoVerlofdagen(aanvraag, inhoud);
    
            // Optioneel: voeg verlofdatum toe
            // voegVerlofDatumToe(selectedPloeg, selectedCell.datum, aanvraag);
            return true; // Stop iteratie, match gevonden
        }
        return false; // Geen match, verder zoeken
    });
    
}
export function handelVerlofAanvraag(e) {
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if (!selectedCell || selectedCell.team !== selectedPloeg) return;

    handelAanvraag(e, selectedCell, selectedPloeg);
} 

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
            if(cel.textContent.includes('x')) cel.classList.add('x');
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

    // Controleer of er überhaupt verlofdagen zijn
    const bestaandeVerlof = Array.from(cellen).some(cel => {
        return Array.from(cel.classList).some(className => verlofDagen.includes(className));
    });
    if (!bestaandeVerlof) return;

    // Bevestiging vragen aan de gebruiker
    const userResponse = confirm("Bent u zeker om alle verlof dagen te verwijderen?");
    if (!userResponse) return;

    // Verlof annuleren
    cellen.forEach(cel => {
        Array.from(cel.classList).forEach(className => {
            if (verlofDagen.includes(className)) {
                cel.classList.remove(className);
                cel.textContent = cel.dataset.shift; // Reset tekst naar oorspronkelijke waarde
                const canceledDatum = cel.dataset.datum;

                // Verlofdatum verwijderen uit de opslag
                verwijderVerlofDatum(selectedPloeg, canceledDatum);
            }
        });
    });

    // Alles resetten na annuleren
    behandelenNaAllesTerugstellen(selectedPloeg);
}
