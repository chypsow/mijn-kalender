import { DOM } from "./main.js";
import { toggleModal, getSettingsFromLocalStorage } from "./functies.js";
import { berekenPaasdatum, formatter } from "./makeModalHolidays.js";

export function makeModalVakanties(tab, setting) {
    DOM.overlay.innerHTML = '';
    let jaar = getSettingsFromLocalStorage(tab, setting).currentYear;
    DOM.overlay.innerHTML = `
        <div class="calendar-nav">
            <button class="vorig"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>
            <span id="jaar" class="month-year">${jaar}</span>
            <button class="volgend"><i class="fa fa-chevron-right" aria-hidden="true"></i></button>
        </div>
        <table class="vakanties"></table>
    `;
    const lijst = DOM.overlay.querySelector('.vakanties');
    const updateVakanties = (newYear) => {
        jaar = newYear;
        document.getElementById('jaar').textContent = jaar;
        voegVakantiedagenToe(lijst, jaar);
    };

    // Navigatieknoppen
    DOM.overlay.querySelector('.vorig').onclick = () => updateVakanties(jaar - 1);
    DOM.overlay.querySelector('.volgend').onclick = () => updateVakanties(jaar + 1);

    // Initiële lijst
    voegVakantiedagenToe(lijst, jaar);
    toggleModal(true, '50%');
};

const berekenStartPaasvakantie = (year) => {
    const paasdatum = new Date(berekenPaasdatum(year));
    //dagVoorPasen.setDate(dagVoorPasen.getDate() - 1);

    if (paasdatum.getMonth() === 2) { // Maart (maanden tellen vanaf 0)
        return new Date(paasdatum.getDate() + 1); // Als de dag in maart valt
    } else if (paasdatum.getMonth() === 3) { // April
        if (paasdatum.getDate() > 15) {
            paasdatum.setDate(paasdatum.getDate() - 14); // Verminderen met 15 dagen
        } else {
            // Bepaal de eerste maandag in april
            const eersteApril = new Date(year, 3, 1); // 1 april
            const weekdag = eersteApril.getDay(); // Weekdag (0 = zondag, 1 = maandag, ...)
            const offset = (weekdag === 0 ? 1 : 8 - weekdag); // Offset om de eerste maandag te vinden
            paasdatum.setTime(eersteApril.getTime() + (offset * 24 * 60 * 60 * 1000)); // Voeg de offset toe
        }
    }

    return paasdatum;
};

const berekenEindPaasvakantie = (year) => {
    const paasdatum = new Date(berekenPaasdatum(year));

    if (paasdatum.getMonth() === 2) {
        return new Date(paasdatum.getDate() + 14);
    } else if (paasdatum.getMonth() === 3) {
        if (paasdatum.getDate() > 15) {
            return new Date(paasdatum.getDate() + 14);
        } else {
            return new Date(paasdatum.getDate() + 15);
        }
    };
};

const beginVakantieLijst = (year) => {
    const paasdatum = berekenPaasdatum(year);
    const kerstDag = new Date(year, 11, 25);
    kerstDag.setDate(kerstDag.getDay() === 6 ? kerstDag.getDate() + 2 : kerstDag.getDate() + 2 - kerstDag.getDay() + 1);
    return [
        new Date(paasdatum.setDate(paasdatum.getDate() - 48)),
        new Date(berekenStartPaasvakantie(year)),
        new Date(paasdatum.setDate(paasdatum.getDate() + 39)),
        new Date(year, 6, 1),
        new Date(year, 9, 31 - (new Date(year, 9, 31).getDay() || 7)),
        kerstDag
    ]
    
};
const eindeVakantieLijst = (year) => {
    const paasdatum = berekenPaasdatum(year);
    const herfst = new Date(beginVakantieLijst(year)[4]);
    herfst.setDate(herfst.getDate() + 6);
    const kerst = new Date(beginVakantieLijst(year)[5]);
    kerst.setDate(kerst.getDate() + 13);
    return [
        new Date(paasdatum.setDate(paasdatum.getDate() - 42)),
        new Date(berekenEindPaasvakantie(year)),
        new Date(paasdatum.setDate(paasdatum.getDate() + 42)),
        new Date(year, 7, 31),
        herfst,
        kerst
    ]
};

const voegVakantieToe = (lijst, naam, startDatum, eindDatum) => {
    lijst.innerHTML += `
        <tr class="vakantie">
            <td class="spanLinks">${naam}</td>
            <td>${startDatum}</td>
            <td class="spanRechts">${eindDatum}</td>
        </tr>`;
};
const voegVakantiedagenToe = (lijst, year) => {
    const vakanties = [
        'Krokus',
        'Paas',
        'Hemelvaart',
        'Zomer',
        'Herfst',
        'Kerst'
    ];
    lijst.innerHTML = ''; // Leegmaken voor updates
    lijst.innerHTML = `
        <tr>
            <th>Schoolvakanties:</th>
            <th>Begin:</th>
            <th>Einde:</th>
        </tr>
    `;
    vakanties.forEach((naam,index) => {
        const startDatum = beginVakantieLijst(year)[index];
        const eindDatum = eindeVakantieLijst(year)[index];
        voegVakantieToe(lijst, naam, formatter.format(startDatum), formatter.format(eindDatum));
    });
};