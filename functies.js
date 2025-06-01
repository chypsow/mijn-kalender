import { DOM, berekenSaldo, defaultSettings, startDates, shiftPattern, opgenomenVerlofPerPloeg, localStoragePloegen, updateCalendar, updateLocalStorage } from "./main.js";
import { tabBlad } from "./componentenMaken.js";
import { makeModalInstellingen } from "./makeModalSettings.js";
import { makeModalFeestdagen } from "./makeModalHolidays.js";
import { makeModalVakanties } from "./makeModalVakanties.js";
import { makeModalRapport } from "./makeModalRapport.js";

export function getSettingsFromLocalStorage(blad, setting) {
    let instellingen;
    try {
        instellingen = JSON.parse(localStorage.getItem('standaardInstellingen'));
        if (!Array.isArray(instellingen)) {
            instellingen = setting();
            saveToLocalStorage('standaardInstellingen', instellingen);
        }
    } catch (error) {
        console.error("Failed to parse local storage settings:", error);
        instellingen = setting();
        saveToLocalStorage('standaardInstellingen', instellingen);
    }

    let instelling = instellingen.find(item => item.pagina === blad);
    if (!instelling) {
        console.warn("No matching instellingen found for tabBlad:", blad);
        return null;
    }
    return {
        selectedPloeg: instelling.ploeg,
        currentMonth: instelling.maand,
        currentYear: instelling.jaar,
    }; 
};

export function getBeginRechtFromLocalStorage(jaar) {
    let beginrechten;
    try {
        beginrechten = JSON.parse(localStorage.getItem('beginrechtVerlof'));
        if (!Array.isArray(beginrechten)) {
            beginrechten = [];
        }
    } catch (error) {
        console.error("Failed to parse localStorage settings:", error);
        beginrechten = [];
    }

    let beginrecht = beginrechten.find(item => item.year === jaar);

    if (!beginrecht) {
        beginrecht = { year: jaar, BV: 0, CS: 0, ADV: 0, BF: 0, AV: 0, HP: 0, Z: 0 };
        beginrechten.push(beginrecht);
        saveToLocalStorage('beginrechtVerlof', beginrechten);
    }

    return {
        BV: beginrecht.BV,
        CS: beginrecht.CS,
        ADV: beginrecht.ADV,
        BF: beginrecht.BF,
        AV: beginrecht.AV,
        HP: beginrecht.HP,
        Z: beginrecht.Z
    };
};

/*export function calculateTotals(obj) {
    return Object.values(obj).reduce((acc, x) => acc + x);
};*/
export function calculateTotals(obj) {
    const values = Object.values(obj);
    // Exclude the last item
    //return values.slice(0, -1).reduce((acc, x) => acc + x, 0);
    return values.reduce((acc, x) => acc + x, 0);
};
export function saveArrayToSessionStorage(key, arr) {
    if (!Array.isArray(arr)) return;

    // Verwijder duplicaten op basis van combinatie van datum en team
    const unique = Array.from(
        new Map(arr.map(item => [`${item.datum}-${item.team}`, item])).values()
    );

    sessionStorage.setItem(key, JSON.stringify(unique));
};

export function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};

export function verwijderVerlofDatum(ploeg, date) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const array = opgenomenVerlofPerPloeg[ploegKey];
    const filteredArray = array.filter(obj => !(obj.datum === date));
    opgenomenVerlofPerPloeg[ploegKey] = filteredArray;
    saveToLocalStorage(localStoragePloegen[ploeg], filteredArray);
};

export function voegVerlofDatumToe(ploeg, datum, soort) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const array = opgenomenVerlofPerPloeg[ploegKey];
    const index = array.findIndex(obj => obj.datum === datum);
    if (index === -1) {
        array.push({ datum, soort });
    } else if (array[index].soort !== soort) {
        array[index].soort = soort;
    }
    saveToLocalStorage(localStoragePloegen[ploeg], array);

};
export function adjustLayout() {
    const schermGrootte = 1900;
    if (window.innerWidth < schermGrootte) {
    document.body.style.fontSize = '10px'; // Pas de fontgrootte aan naar wens
    document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.visibility = 'hidden'; // Verberg elementen met inline style
    });
    //DOM.topNav.classList.add('close');
    //document.querySelector('.hoofd-container').style.width = '100%';
    document.getElementById('bars').classList.remove('hidden');
        //console.log(`schermgrootte is minder dan ${schermGrootte}px geweest : ${window.innerWidth}px`);
    } else {
    document.body.style.fontSize = ''; // Reset de fontgrootte
    document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.visibility = ''; // Zet display terug naar 'flex'
    });
    DOM.topNav.classList.remove('close');
    //document.querySelector('.hoofd-container').style.width = '87%';
    //console.log(`schermgrootte: ${window.innerWidth}px`);
    document.getElementById('bars').classList.add('hidden');
    }
};

export function modalAfdrukken() {
    document.getElementById("printPreview").classList.add("no-print");
    document.querySelector(".top-sectie").classList.add("no-print");
    DOM.calendar.classList.add("no-print");
    window.print();
    // Reset na printen
    setTimeout(() => {
    document.getElementById("printPreview").classList.remove("no-print");
    document.querySelector(".top-sectie").classList.remove("no-print");
    DOM.calendar.classList.remove("no-print");
    }, 1000); // wacht even tot printdialoog klaar is
};

export function toggleModal(show, positie = '50%') {
    if(!show)  {
        DOM.modalOverlay.classList.remove('open');
        setTimeout(() => {
            DOM.modalOverlay.style.display = 'none';
        }, 300);
    } else {
        DOM.modalOverlay.style.display = 'block';
        setTimeout(() => {
            DOM.modalOverlay.classList.add('open');
        }, 10)
    }
    //DOM.modalOverlay.style.display = show ? "block" : "none";
    DOM.modal.style.top = positie;
    DOM.modal.style.display = show ? "block" : "none";
};

export function handleClickBtn(e) {
    const btn = e.currentTarget.id; // Gebruik currentTarget om de juiste id op te halen
    switch(btn) {
        case 'instellingen':
            makeModalInstellingen(startDates, shiftPattern);
            toggleModal(true);
            break;
        case 'feestdagen':
            makeModalFeestdagen(tabBlad, defaultSettings);
            toggleModal(true);
            break;
        case 'vakanties':
            makeModalVakanties(tabBlad, defaultSettings);
            toggleModal(true);
            break;
        case 'rapport':
            makeModalRapport(tabBlad, defaultSettings);
            //console.log('Rapportknop is aangeklikt');
            toggleModal(true);
            break;
        case 'afdrukken':
            afdrukVoorbereiding();
            window.print();
            updateCalendar();
            break;
        default:
            console.warn('Onbekende knop-id:', btn);
    }
};

function afdrukVoorbereiding() {
    const setting = getSettingsFromLocalStorage(tabBlad, defaultSettings);
    const selectedPloeg = setting.selectedPloeg;
    const year = setting.currentYear;
    const month = setting.currentMonth;
    const monthStr = month ? new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month)): null;
    const afdrukken = document.getElementById("printPreview");
    afdrukken.innerHTML='';

    if(tabBlad === 1 || tabBlad === 2) {
        DOM.topSectie3.classList.remove('no-print');
    } else {
        DOM.topSectie3.classList.add('no-print');
    }
    const lijst = document.createElement('ul');
    lijst.classList.add('print-header');
    
    const jaar = document.createElement('li');
    jaar.textContent = `Jaar: ${year}`;
    lijst.appendChild(jaar);
    
    if (tabBlad === 2 || tabBlad === 3) {
        const maand = document.createElement('li');
        maand.textContent = `Maand: ${monthStr}`;
        lijst.appendChild(maand);
    }
    if (tabBlad !== 3) {
        const ploeg = document.createElement('li');
        ploeg.textContent = `Ploeg ${selectedPloeg}`;
        lijst.appendChild(ploeg);
    }
    if(tabBlad === 0) {
        document.querySelectorAll('.cell').forEach(cel => {
            if(cel.classList.contains('today')) {
                cel.classList.remove('today');
            }
        });
    }
    afdrukken.appendChild(lijst);
}

export function handleBlur(e) {
    const verlof = e.target.id;
    const aantal = parseInt(e.target.value);
    if (isNaN(aantal) || aantal < 0) {
        e.target.value = 0; // Reset naar 0 als de invoer ongeldig is
    }
    behandelBeginrechtEnSaldoVerlofdagen(verlof, aantal);
};

function behandelBeginrechtEnSaldoVerlofdagen(verlof, aantal) {
    
    const instellingen = getSettingsFromLocalStorage(tabBlad, defaultSettings);
    const currentYear =  instellingen.currentYear;
    const selectedPloeg = instellingen.selectedPloeg;
    
    const totaal1 = document.getElementById('totaalBeginrecht');
    const totaal2 = document.getElementById('totaalSaldo');
    const mySaldoElt = document.getElementById(`saldo-${verlof}`);
    const saldoOud = parseInt(mySaldoElt.textContent.trim());
    
    const beginrechtVerlof = getBeginRechtFromLocalStorage(currentYear);
    beginrechtVerlof[verlof] = aantal;
    const beginrechtArray = JSON.parse(localStorage.getItem('beginrechtVerlof'));
    const index = beginrechtArray.findIndex(item => item.year === currentYear);
    const update = {};
    update[verlof] = aantal;
    updateLocalStorage('beginrechtVerlof', null, index, update);

    const saldoNieuw = berekenSaldo(currentYear, selectedPloeg, verlof);
    mySaldoElt.textContent = saldoNieuw;
    if(verlof === "Z") return;
    // Update de totale beginrechten en saldo
    totaal1.textContent = ` ${calculateTotals(beginrechtVerlof)}`;
    totaal2.textContent = ` ${parseInt(totaal2.textContent.trim()) - saldoOud + saldoNieuw}`;
    
    //console.log(`oude saldo: ${saldoOud}`);
    //console.log(`nieuwe saldo: ${saldoNieuw}`);
    //console.log(`beginrecht verlofdagen: ${JSON.stringify(beginrechtVerlof, null, 2)}`);
    //console.log(`Totaal beginrecht: ${calculateTotals(beginrechtVerlof)}`);
};

export function behandelenSaldoVerlofdagen(verlof, oud) {
    const verlofdagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    const totaal2 = document.getElementById('totaalSaldo');
    let totaalSaldo = parseInt(totaal2.textContent.trim());

    // If new type is not a verlof, but old is: restore old saldo and total
    if (!verlofdagen.includes(verlof)) {
        if (verlofdagen.includes(oud)) {
            const saldoElt2 = document.getElementById(`saldo-${oud}`);
            saldoElt2.textContent = parseInt(saldoElt2.textContent) + 1;
            if (oud === "Z") return;
            totaal2.textContent = ` ${totaalSaldo + 1}`;
        }
        return;
    }

    // Decrement new saldo
    const saldoElt1 = document.getElementById(`saldo-${verlof}`);
    saldoElt1.textContent = parseInt(saldoElt1.textContent) - 1;

    // If old type was not a verlof, decrement total (unless verlof is Z)
    if (!verlofdagen.includes(oud)) {
        if (verlof !== "Z") {
            totaal2.textContent = ` ${totaalSaldo - 1}`;
        }
        return;
    }

    // Both new and old are verlof types
    const saldoElt2 = document.getElementById(`saldo-${oud}`);
    saldoElt2.textContent = parseInt(saldoElt2.textContent) + 1;

    if (verlof === "Z") {
        totaal2.textContent = ` ${totaalSaldo + 1}`;
    } else if (oud === "Z") {
        totaal2.textContent = ` ${totaalSaldo - 1}`;
    }
}

export function behandelenRechtEnSaldoVerlofdagenNaTerugstellen(verlof) {
    const verlofdagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    if(!verlofdagen.includes(verlof)) return;
    const totaal2 = document.getElementById('totaalSaldo');
    const saldoElt = document.getElementById(`saldo-${verlof}`);
    saldoElt.textContent = parseInt(saldoElt.textContent) + 1;
    if(verlof === "Z") return;
    const totaalSaldo = parseInt(totaal2.textContent.trim());
    totaal2.textContent = ` ${totaalSaldo + 1}`;
};

export function beginSaldoEnRestSaldoInvullen(year, ploeg) {
    const beginrechtVerlof = getBeginRechtFromLocalStorage(year);
    const saldoArray = berekenSaldo(year,ploeg);
    Object.entries(beginrechtVerlof).forEach(([verlof,aantal]) => {
        const elt = document.getElementById(verlof);
        if(elt) {
            elt.value = aantal;
            //elt.textContent = aantal;
        }
    });
    const beginrechtTotaal = calculateTotals(beginrechtVerlof);
    const beginrechtElt = document.getElementById('totaalBeginrecht');
    beginrechtElt.textContent = ` ${beginrechtTotaal}`;
    //beginrechtElt.style.color = beginrechtTotaal > 0 ? 'green' : 'red';
    //beginrechtElt.style.fontWeight = beginrechtTotaal > 0 ? 'bold' : 'normal';
    Object.entries(saldoArray).forEach(([verlof,aantal]) => {
        const elt = document.getElementById(`saldo-${verlof}`);
        elt.textContent = aantal;
    });
    const saldoTotaal = calculateTotals(saldoArray);
    document.getElementById('totaalSaldo').textContent = ` ${saldoTotaal}`;
    //document.getElementById('totaalSaldo').style.color = saldoTotaal > 0 ? 'green' : 'red';
    //document.getElementById('totaalSaldo').style.fontWeight = saldoTotaal > 0 ? 'bold' : 'normal';
};

export function getNaamBijSymbool(obj, mark) {
    const shift = obj.find(item => item.symbool === mark);
    return shift ? shift.naam : 'Symbool-niet-gevonden';
};

export function getDaysSinceStart(date, date0) {
    if (typeof date0 === "string") {
        date0 = new Date(date0);
    }
    const diffTime = date - date0;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};
