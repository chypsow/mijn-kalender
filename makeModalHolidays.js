import { DOM } from "./main.js";
import { getSettingsFromLocalStorage, modalAfdrukken } from "./functies.js";

export function makeModalFeestdagen(tab, setting) {
    DOM.overlay.innerHTML = '';
    let jaar = getSettingsFromLocalStorage(tab, setting).currentYear;
    //const container = document.createElement('div');
    //container.classList.add('overlay-container');
    let html = `
        <div class="calendar-nav">
            <button class="vorig no-print"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>
            <span id="jaar" class="month-year year-holiday">${jaar}</span>
            <button class="volgend no-print"><i class="fa fa-chevron-right" aria-hidden="true"></i></button>
        </div>
        <ul class="feestdagen"></ul>
        <button class="print-modal-button">Afdrukken</button>
    `;
    //container.innerHTML = html;
    DOM.overlay.innerHTML = html;
    const printButton = document.querySelector(".print-modal-button");
    printButton.addEventListener("click", modalAfdrukken);
    printButton.classList.add('no-print');

    const lijst = DOM.overlay.querySelector('.feestdagen');
    const updateFeestdagen = (newYear) => {
        jaar = newYear;
        document.getElementById('jaar').textContent = jaar;
        voegFeestdagenToe(lijst, jaar);
    };

    // Navigatieknoppen
    DOM.overlay.querySelector('.vorig').onclick = () => updateFeestdagen(jaar - 1);
    DOM.overlay.querySelector('.volgend').onclick = () => updateFeestdagen(jaar + 1);

    // Initiële lijst
    voegFeestdagenToe(lijst, jaar);
    
};
export const berekenPaasdatum = (year) => {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const maand = Math.floor((h + l - 7 * m + 114) / 31);
    const dag = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, maand - 1, dag);
};

export const feestdagenLijstDatums = (year) => {
    const paasdatum = berekenPaasdatum(year);
    
    return [
        new Date(year, 0, 1),
        new Date(paasdatum.setDate(paasdatum.getDate() + 1)),
        new Date(year, 4, 1),
        new Date(paasdatum.setDate(paasdatum.getDate() + 38)),
        new Date(paasdatum.setDate(paasdatum.getDate() + 11)),
        new Date(year, 6, 21),
        new Date(year, 7, 15),
        new Date(year, 10, 1),
        new Date(year, 10, 11),
        new Date(year, 11, 25)
    ]
};

export const formatter = new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long', // Volledige dagnaam
    day: 'numeric',  // Dag van de maand
    month: 'long',   // Volledige maandnaam
    year: 'numeric'  // Volledig jaar
});
const voegFeestdagToe = (lijst, naam, datum) => {
    lijst.innerHTML += `
        <li class="feestdag">
            <span class="spanLinks">${naam}</span>
            <span class="spanRechts">${datum}</span>
        </li>`;
};
const voegFeestdagenToe = (lijst, year) => {
    const feestdagen = [
        'Nieuwjaarsdag',
        'Paasmaandag',
        'Feest van de Arbeid',
        'O.L.V. Hemelvaart',
        'Pinkstermaandag',
        'Nationale Feestdag',
        'O.L.V. Tenhemelopneming',
        'Allerheiligen',
        'Wapenstilstand',
        'Kerstmis',
    ];
    lijst.innerHTML = ''; // Leegmaken voor updates
    feestdagen.forEach((naam,index) => {
        const datum = feestdagenLijstDatums(year)[index];
        voegFeestdagToe(lijst, naam, formatter.format(datum));
    });
};