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
        <table class="andereInfo"></table>
    `;
    const lijst1 = DOM.overlay.querySelector('.vakanties');
    const lijst2 = DOM.overlay.querySelector('.andereInfo');
    const updateVakanties = (newYear) => {
        jaar = newYear;
        document.getElementById('jaar').textContent = jaar;
        voegVakantiedagenToe(lijst1, jaar);
        voegAndereInfoToe(lijst2, jaar);
    };

    // Navigatieknoppen
    DOM.overlay.querySelector('.vorig').onclick = () => updateVakanties(jaar - 1);
    DOM.overlay.querySelector('.volgend').onclick = () => updateVakanties(jaar + 1);

    //test
    //const beginVakantieLijstDatums = (year) => beginVakantieLijst(year).map(datum => formatter.format(datum));
    //const eindeVakantieLijstDatums = (year) => eindeVakantieLijst(year).map(datum => formatter.format(datum));
    //console.log(beginVakantieLijstDatums(jaar));
    //console.log(eindeVakantieLijstDatums(jaar));

    // Initiële lijst
    voegVakantiedagenToe(lijst1, jaar);
    voegAndereInfoToe(lijst2, jaar);
    toggleModal(true, '50%');
};

const berekenStartPaasvakantie = (year) => {
    const paasdatum = new Date(berekenPaasdatum(year));
    if (paasdatum.getMonth() === 2) {
        paasdatum.setDate(paasdatum.getDate() + 1);
        return paasdatum;
    } else if (paasdatum.getMonth() === 3) {
        if (paasdatum.getDate() > 15) {
            paasdatum.setDate(paasdatum.getDate() - 13);
        } else {
            // Bepaal de eerste maandag in april
            const eersteApril = new Date(year, 3, 1);
            const weekdag = eersteApril.getDay(); // Weekdag (0 = zondag, 1 = maandag, ...)
            const offset = (weekdag === 0 ? 1 : 8 - weekdag); // Offset om de eerste maandag te vinden
            paasdatum.setDate(eersteApril.getDate() + offset);
        }
    }
    return paasdatum;
};

const beginVakantieLijst = (year) => {
    const paasdatum = berekenPaasdatum(year);
    const beginHerfst = new Date(year, 10, 1);
    beginHerfst.setDate(beginHerfst.getDate() - beginHerfst.getDay() + 1);
    const beginKerst = new Date(year, 11, 25);
    beginKerst.setDate(beginKerst.getDay() === 6 ? beginKerst.getDate() + 2 : beginKerst.getDate() - beginKerst.getDay() + 1);

    return [
        new Date(paasdatum.setDate(paasdatum.getDate() - 48)),
        new Date(berekenStartPaasvakantie(year)),
        new Date(paasdatum.setDate(paasdatum.getDate() + 87)),
        new Date(year, 6, 1),
        beginHerfst,
        beginKerst
    ];
};

const eindeVakantieLijst = (year) => {
    const paasdatum = berekenPaasdatum(year);
    const eindPaas = new Date(beginVakantieLijst(year)[1]);
    eindPaas.setDate(eindPaas.getDate() + 13);
    const eindHemel = new Date(beginVakantieLijst(year)[2]);
    eindHemel.setDate(eindHemel.getDate() + 1);
    const eindHerfst = new Date(beginVakantieLijst(year)[4]);
    eindHerfst.setDate(eindHerfst.getDate() + 6);
    const eindkerst = new Date(beginVakantieLijst(year)[5]);
    eindkerst.setDate(eindkerst.getDate() + 13);

    return [
        new Date(paasdatum.setDate(paasdatum.getDate() - 42)),
        eindPaas,
        eindHemel,
        new Date(year, 7, 31),
        eindHerfst,
        eindkerst
    ];
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

    lijst.innerHTML = '';
    lijst.innerHTML = `
        <tr>
            <th>Schoolvakanties:</th>
            <th>Begin:</th>
            <th>Einde:</th>
        </tr>
    `;
    const beginVakantieLijstDatums = (year) => beginVakantieLijst(year).map(datum => formatter.format(datum));
    const eindeVakantieLijstDatums = (year) => eindeVakantieLijst(year).map(datum => formatter.format(datum));
    vakanties.forEach((naam,index) => {
        const startDatum = beginVakantieLijstDatums(year)[index];
        const eindDatum = eindeVakantieLijstDatums(year)[index];
        voegVakantieToe(lijst, naam, startDatum, eindDatum);
    });
};

const beginRamadan = (year) => {
    const date0 = new Date(1900,0,1);
    const offset = (year) => {
        switch(true) {
            case year < 1970:
                return -366;
            case year > 2030:
                return 365;
            default:
                return 0;
        } 
    }
    const aantalDagen = Math.trunc((year - 1900) * ((19 * 354 + 11 * 355) / 360) * 12 + 1421,44);
    console.log('aantal dagen: ' + aantalDagen);
    const ramadan = new Date(date0);
    //console.log(ramadan);
    ramadan.setDate(ramadan.getDate() + aantalDagen + offset(year) - 2);
    //console.log(ramadan);
    return ramadan;
};
/*const beginRamadan = (year) => {
    // Basisdatum om te starten (1 januari 1900)
    const baseDate = new Date(1900, 0, 1);

    // Aantal dagen tussen 1900 en het jaar in de maankalender
    const lunarDaysPerYear = 354.367; // Gemiddeld aantal dagen in een islamitisch jaar
    const daysSinceBase = (year - 1900) * lunarDaysPerYear;

    // Bereken de startdatum van Ramadan
    const ramadanStart = new Date(baseDate.getTime());
    ramadanStart.setDate(ramadanStart.getDate() + Math.round(daysSinceBase));
    return ramadanStart;
    // Formatter voor een leesbare datum
    //const formatter = new Intl.DateTimeFormat("nl-NL", { year: 'numeric', month: 'long', day: 'numeric' });

    //return formatter.format(ramadanStart);
};*/


const eindRamadan = (year) => {
    const datum = new Date(beginRamadan(year));
    return datum.setDate(datum.getDate() + 29);
    //return formatter.format(datum);
};

const beginAndereLijst = (year) => {
    return [
        'Tussen 02:00 & 03:00',
        'Tussen 02:00 & 03:00',
        formatter.format(beginRamadan(year))
    ];
};

const beginZomerTijd = (year) => {
    const zomerTijd = new Date(year, 2, 31);
    zomerTijd.setDate(zomerTijd.getDate() - zomerTijd.getDay());
    return formatter.format(zomerTijd);
};

const beginWinterTijd = (year) => {
    const winterTijd = new Date(year, 9, 31);
    winterTijd.setDate(winterTijd.getDate() - winterTijd.getDay());
    return formatter.format(winterTijd);
};



const eindeAndereLijst = (year) => {
    return [
        beginZomerTijd(year),
        beginWinterTijd(year),
        formatter.format(eindRamadan(year))
    ];
};

const voegAndereInfoToe = (lijst, year) => {
    const andere = [
        'Begin zomertijd',
        'Begin wintertijd',
        'Ramadan'
    ];

    lijst.innerHTML = '';
    andere.forEach((naam,index) => {
        const startDatum = beginAndereLijst(year)[index];
        const eindDatum = eindeAndereLijst(year)[index];
        voegVakantieToe(lijst, naam, startDatum, eindDatum);
    });
};