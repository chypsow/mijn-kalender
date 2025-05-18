import { DOM, beginrechtVerlof, berekenSaldo, defaultSettings, startDates, shiftPattern, opgenomenVerlofPerPloeg, localStoragePloegen, updateCalendar } from "./main.js";
import { tabBlad } from "./componentenMaken.js";
import { makeModalInstellingen } from "./makeModalSettings.js";
import { makeModalFeestdagen } from "./makeModalHolidays.js";
import { makeModalVakanties } from "./makeModalVakanties.js";
import { dataVerlofdagen, dataBeginRecht, dataShift } from "./config.js";

export function localStorageAanpassenVolgensConfigJS(cond1, cond2, cond3) {
    if(cond1) saveToLocalStorage('verlofdagenPloeg1', dataVerlofdagen);
    if(cond2) saveToLocalStorage('beginrechtVerlof', dataBeginRecht);
    if(cond3) saveToLocalStorage('shiftPattern', dataShift);
    location.reload(true); // of location.href = location.href;
};

export function verwijderVerlofDatum(ploeg, date) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    /*const index = opgenomenVerlofPerPloeg[ploegKey].findIndex(obj => obj.datum === datum);
    if (index !== -1) {
        opgenomenVerlofPerPloeg[ploegKey].splice(index, 1);
        saveToLocalStorage(localStoragePloegen[ploeg], opgenomenVerlofPerPloeg[ploegKey]);
    }*/
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
    DOM.container.classList.add("no-print");
    window.print();
    // Reset na printen
    setTimeout(() => {
    document.getElementById("printPreview").classList.remove("no-print");
    document.querySelector(".top-sectie").classList.remove("no-print");
    DOM.container.classList.remove("no-print");
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
            genereerRapport();
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
function genereerRapport() {
    DOM.overlay.innerHTML = '';
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const currentYear = getSettingsFromLocalStorage(tabBlad, defaultSettings).currentYear;
    const rapportHeader = document.createElement('h2');
    rapportHeader.classList.add('rapport-header');
    /*rapportHeader.style.textAlign = 'center';*/
    rapportHeader.textContent = `Rapport voor ploeg ${selectedPloeg} in ${currentYear}`;
    DOM.overlay.appendChild(rapportHeader);
    const hearderLine = document.createElement('hr');
    hearderLine.classList.add('line');
    DOM.overlay.appendChild(hearderLine);
    const rapport = document.createElement('div');
    rapport.classList.add('rapport');

    const kolom1 = document.createElement('div');
    kolom1.classList.add('kolom-rapport');

    const rapportHeader1 = document.createElement('h3');
    rapportHeader1.textContent = `# Prestaties`;	
    kolom1.appendChild(rapportHeader1);

    const rapportList1 = document.createElement('ul');
    const dayElementen = document.querySelectorAll('.cell');
    const filteredDayElementen = Array.from(dayElementen).filter(day => day.dataset.datum !== '0');
    const prestaties = ['N', 'N12', 'N- fd', 'N12- fd', 'V', 'V12', 'V- fd', 'V12- fd', 'L', 'L- fd', 'D', 'OPL'];
    prestaties.forEach(prestatie => {
        const filteredSoort = filteredDayElementen.filter(day => day.textContent === prestatie);
        if(filteredSoort.length === 0) return;
        const listItem = document.createElement('li');
        listItem.textContent = `${prestatie}:`;
        rapportList1.appendChild(listItem);
        const listItemAantal = document.createElement('span');
        listItemAantal.classList.add('aantal-rapport');
        listItemAantal.textContent = `${filteredSoort.length}`;
        listItem.appendChild(listItemAantal);
    });
    kolom1.appendChild(rapportList1);
    /*const line1 = document.createElement('hr');
    line1.classList.add('line');
    kolom1.appendChild(line1);*/
    const totaal = document.createElement('div');
    totaal.classList.add('totaal-kolom-rapport');
    //totaal.style.marginLeft = '20px';
    const totaalAantal = prestaties.reduce((acc, prestatie) => {
        const filteredSoort = filteredDayElementen.filter(day => day.textContent === prestatie);
        return acc + filteredSoort.length;
    }, 0);
    totaal.innerHTML = `Totaal: <span class="totaal-rapport">${totaalAantal}</span>`;
    kolom1.appendChild(totaal);
    rapport.appendChild(kolom1);

    const kolom2 = document.createElement('div');
    kolom2.classList.add('kolom-rapport');
    const rapportHeader2 = document.createElement('h3');
    rapportHeader2.textContent = '# Afwezigheden';
    kolom2.appendChild(rapportHeader2);
    const rapportList2 = document.createElement('ul');
    const afwezigheden = ['BV', 'BV- fd', 'CS', 'CS- fd', 'ADV','ADV- fd', 'BF','BF- fd', 'AV', 'AV- fd', 'HP', 'HP- fd', 'x', 'x- fd', 'Z', 'Z- fd'];
    afwezigheden.forEach(afwezigheid => {
        const filteredSoort = filteredDayElementen.filter(day => day.textContent === afwezigheid);
        if(filteredSoort.length === 0) return;
        const listItem = document.createElement('li');
        listItem.textContent = `${afwezigheid}:`;
        rapportList2.appendChild(listItem);
        const listItemAantal = document.createElement('span');
        listItemAantal.classList.add('aantal-rapport');
        listItemAantal.textContent = `${filteredSoort.length}`;
        listItem.appendChild(listItemAantal);
    });
    kolom2.appendChild(rapportList2);
    /*const line2 = document.createElement('hr');
    line2.classList.add('line');
    kolom2.appendChild(line2);*/
    const totaalAfwezig = document.createElement('div');
    totaalAfwezig.classList.add('totaal-kolom-rapport');
    //totaalAfwezig.style.marginLeft = '20px';
    const totaalAfwezigAantal = afwezigheden.reduce((acc, afwezig) => {
        const filteredSoort = filteredDayElementen.filter(day => day.textContent === afwezig);
        return acc + filteredSoort.length;
    }, 0);
    totaalAfwezig.innerHTML = `Totaal: <span class="totaal-rapport">${totaalAfwezigAantal}</span>`;
    kolom2.appendChild(totaalAfwezig);
    rapport.appendChild(kolom2);
    DOM.overlay.appendChild(rapport);
    DOM.overlay.innerHTML += `
        <button class="print-modal-button">Afdrukken</button>
    `;
    const printButton = document.querySelector(".print-modal-button");
    printButton.addEventListener("click", modalAfdrukken);
    printButton.classList.add('no-print');
};


function afdrukVoorbereiding() {
    const setting = getSettingsFromLocalStorage(tabBlad, defaultSettings);
    const selectedPloeg = setting.selectedPloeg;
    const year = setting.currentYear;
    const month = setting.currentMonth;
    const monthStr = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month));
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
    behandelBeginrechtEnSaldoVerlofdagen(verlof, aantal);
};

function behandelBeginrechtEnSaldoVerlofdagen(verlof, aantal) {
    //if(verlof === "Z") return;
    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const totaal1 = document.getElementById('totaalBeginrecht');
    const totaal2 = document.getElementById('totaalSaldo');
    const mySaldoElt = document.getElementById(`saldo-${verlof}`);
    const saldoOud = parseInt(mySaldoElt.textContent.trim());
    
    beginrechtVerlof[verlof] = aantal;
    saveToLocalStorage('beginrechtVerlof', beginrechtVerlof);
    const saldoNieuw = berekenSaldo(selectedPloeg, verlof);

    totaal1.textContent = ` ${calculateTotals(beginrechtVerlof)}`;
    mySaldoElt.textContent = saldoNieuw;
    totaal2.textContent = ` ${parseInt(totaal2.textContent.trim()) - saldoOud + saldoNieuw}`;
    
    //console.log(`oude saldo: ${saldoOud}`);
    //console.log(`nieuwe saldo: ${saldoNieuw}`);
    //console.log(`beginrecht verlofdagen: ${JSON.stringify(beginrechtVerlof, null, 2)}`);
    //console.log(`Totaal beginrecht: ${calculateTotals(beginrechtVerlof)}`);
};
export function behandelenSaldoVerlofdagen(verlof, oud) {
    const verlofdagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP'];
    const totaal2 = document.getElementById('totaalSaldo');
    const totaalSaldo = parseInt(totaal2.textContent.trim());
    if(!verlofdagen.includes(verlof)) {
        if(verlofdagen.includes(oud)) {
        const saldoElt2 = document.getElementById(`saldo-${oud}`);
        saldoElt2.textContent = parseInt(saldoElt2.textContent) + 1;
        totaal2.textContent = ` ${totaalSaldo + 1}`;
        }
        return;
    }
    const saldoElt1 = document.getElementById(`saldo-${verlof}`);
    //const beginrecht = document.getElementById(verlof);
    const saldoOud = parseInt(saldoElt1.textContent);
    //const saldoNieuw = saldoOud--;
    saldoElt1.textContent = saldoOud - 1;
    if(verlofdagen.includes(oud)) {
        const saldoElt2 = document.getElementById(`saldo-${oud}`);
        saldoElt2.textContent = parseInt(saldoElt2.textContent) + 1;
    } else {
        totaal2.textContent = ` ${totaalSaldo - 1}`;
    }

    //console.log(`opgenomen: ${verlof}, oude saldo: ${saldoOud}, nieuwe saldo: ${saldoElt1.textContent}`);
}
export function behandelenRechtEnSaldoVerlofdagenNaTerugstellen(verlof) {
    const verlofdagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP'];
    if(!verlofdagen.includes(verlof)) return;
    const totaal2 = document.getElementById('totaalSaldo');
    const saldoElt = document.getElementById(`saldo-${verlof}`);
    saldoElt.textContent = parseInt(saldoElt.textContent) + 1;
    const totaalSaldo = parseInt(totaal2.textContent.trim());
    totaal2.textContent = ` ${totaalSaldo + 1}`;
}
export function behandelenNaAllesTerugstellen(ploeg) {
    const saldoArray = berekenSaldo(ploeg);
    Object.entries(saldoArray).forEach(([verlof,aantal]) => {
        const elt = document.getElementById(`saldo-${verlof}`);
        elt.textContent = aantal;
    });
    const saldoTotaal = calculateTotals(saldoArray);
    document.getElementById('totaalSaldo').textContent = ` ${saldoTotaal}`;
}

export function calculateTotals(obj) {
    return Object.values(obj).reduce((acc, x) => acc + x);
};

export function saveToSessionStorage(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
};

export function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};

export function initializeSettingsToLocalStorage(key, defaultValue) {
    if(localStorage.getItem(key) === null) {
        localStorage.setItem(key, JSON.stringify(defaultValue()));
    } else {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        let instellingen = JSON.parse(localStorage.getItem(key));
        instellingen.forEach(instelling => {
            instelling.maand = currentMonth;
            instelling.jaar = currentYear;
        });
        localStorage.setItem(key, JSON.stringify(instellingen));
    }
};

export function resetDefaultSettings(obj, arr) {
    let counter = 0;
    for(let i = 1; i <= 5; i++) {
        const datum = document.getElementById(`date${i}`);
        datum.value = obj[i];
        for(let j = 1; j <= 7; j++) {
            const dayElement = document.getElementById(`day-${i}${j}`);
            dayElement.value = arr[counter];
            counter++;
        }
    }
};

export function getSettingsFromLocalStorage(blad, setting) {
    let instellingen;
    try {
        instellingen = JSON.parse(localStorage.getItem('standaardInstellingen')) || setting();
    } catch (error) {
        console.error("Failed to parse session storage settings:", error);
        instellingen = setting;
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

export function updateLocalStorage(settings, index, key, value, defaultSet) {
    const instellingen = JSON.parse(localStorage.getItem(settings)) || defaultSet();
    instellingen[index][key] = value;
    saveToLocalStorage(settings, instellingen);
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
