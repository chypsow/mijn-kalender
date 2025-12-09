import { DOM, getAllValidCells } from "./main.js";
import { getSettingsFromLocalStorage, modalAfdrukken, toggleModal } from "./functies.js";

export function makeModalRapport(activePage, defaultSet) {
    const instellingen = getSettingsFromLocalStorage(activePage, defaultSet);
    const selectedPloeg = instellingen.selectedPloeg;
    const currentYear = instellingen.currentYear;
    const dayElementen = getAllValidCells();

    const prestaties = ['N', 'N12', 'N- fd', 'N12- fd', 'V', 'V12', 'V- fd', 'V12- fd', 'L', 'L- fd', 'D', 'D- fd', 'OPL'];
    const afwezigheden = ['BV', 'BV- fd', 'CS', 'CS- fd', 'ADV','ADV- fd', 'BF','BF- fd', 'AV', 'AV- fd', 'HP', 'HP- fd', 'x', 'x- fd', 'Z', 'Z- fd'];

    let html = `
        <div class="rapport">
        <h2 class="header-rapport">Rapport-${currentYear} voor ploeg ${selectedPloeg}</h2>
        <hr>
        <div class="rapport-grid">
            <div class="kolom-rapport">
            <h3># Prestaties</h3>
            <table class="rapport-tabel">
    `;

    let totaalPrestaties = 0;

    prestaties.forEach(prestatie => {
        const aantal = dayElementen.filter(day => day.textContent === prestatie).length;
        if (aantal > 0) {
        html += `<tr><td>${prestatie}:</td><td>${aantal}</td></tr>`;
        totaalPrestaties += aantal;
        }
    });

    html += `<tr class="totaal-rij"><td><strong>Totaal:</strong></td><td><strong>${totaalPrestaties}</strong></td></tr>`;

    html += `
            </table>
            </div>
            <div class="kolom-rapport">
            <h3># Afwezigheden</h3>
            <table class="rapport-tabel">
    `;

    let totaalAfwezigheden = 0;

    afwezigheden.forEach(afw => {
        const aantal = dayElementen.filter(day => day.textContent === afw).length;
        if (aantal > 0) {
        html += `<tr><td>${afw}:</td><td>${aantal}</td></tr>`;
        totaalAfwezigheden += aantal;
        }
    });

    html += `<tr class="totaal-rij"><td><strong>Totaal:</strong></td><td><strong>${totaalAfwezigheden}</strong></td></tr>
        </table>
        </div>
    `;

    html += `
                <div class="kolom-rapport">
                    <div class="ratio-rapport">
                        <h3>Prestatie-ratio:</h3>
                        <p>${totaalPrestaties} / ${totaalAfwezigheden + totaalPrestaties} = <strong>${Math.round((totaalPrestaties/(totaalAfwezigheden + totaalPrestaties))*100)}%</strong></p>
                    </div>
                    <div class="ratio-rapport">    
                        <h3>Afwezigheid-ratio:</h3>
                        <p>${totaalAfwezigheden} / ${totaalAfwezigheden + totaalPrestaties} = <strong>${Math.round((totaalAfwezigheden/(totaalAfwezigheden + totaalPrestaties))*100)}%</strong></p>
                    </div>
                </div>
            </div>
            <div class="rapport-footer">
                <p><em>Dit rapport is gegenereerd op ${new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}.</em></p>
            </div>
        <div class="modal-footer">
            <button class="close-modal-button no-print">Sluiten</button>     
            <button class="print-modal-button no-print">Afdrukken</button>
        </div>
    `;
    DOM.overlay.innerHTML = html;
    setTimeout(() => {
        const closeButton = DOM.overlay.querySelector(".close-modal-button");
        const printButton = DOM.overlay.querySelector(".print-modal-button");
        if (closeButton) {
        closeButton.addEventListener("click", () => toggleModal(false));
        }
        if (printButton) {
        printButton.addEventListener("click", modalAfdrukken);
        }
    }, 0);
};