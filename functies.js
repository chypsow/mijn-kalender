import { DOM, beginrechtVerlof, berekenSaldo, defaultSettings, startDates, shiftPattern, opgenomenVerlofPerPloeg, localStoragePloegen } from "./main.js";
import { tabBlad } from "./componentenMaken.js";
import { makeModalInstellingen } from "./makeModalSettings.js";
import { makeModalFeestdagen } from "./makeModalHolidays.js";
import { makeModalVakanties } from "./makeModalVakanties.js";
import { dataVerlofdagen, dataBeginRecht, dataShift } from "./config.js";

export function opgenomenVerlofAanpassenVolgensImportedData(ploeg) {
    saveToLocalStorage(localStoragePloegen[ploeg], dataVerlofdagen);
    saveToLocalStorage('beginrechtVerlof', dataBeginRecht);
    saveToLocalStorage('shiftPattern', dataShift);
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
    /*document.body.style.fontSize = '10px'; // Pas de fontgrootte aan naar wens
    document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.display = 'none'; // Verberg elementen met inline style
    });
    document.querySelectorAll('.cell').forEach(element => {
        element.style.padding = 0; 
        
    });*/
        console.log(`schermgrootte is minder dan ${schermGrootte}px geweest : ${window.innerWidth}px`);
    } else {
    /*document.body.style.fontSize = ''; // Reset de fontgrootte
    document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.display = ''; // Zet display terug naar 'flex'
    });
    document.querySelectorAll('.cell').forEach(element => {
        element.style.padding = ''; 
        
    });*/
    console.log(`schermgrootte: ${window.innerWidth}px`);
    }
}
export function toggleModal(show, positie) {
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
            break;
        case 'feestdagen':
            makeModalFeestdagen(tabBlad, defaultSettings);
            break;
        case 'vakanties':
            makeModalVakanties(tabBlad, defaultSettings);
            break;
        case 'rapport':
            console.log('Rapportknop is aangeklikt');
            break;
        case 'afdrukken':
            afdrukVoorbereiding();
            window.print();
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
    const monthStr = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month));
    const afdrukken = document.getElementById("printPreview");
    afdrukken.innerHTML='';
    if(tabBlad === 1 || tabBlad === 2) {
        DOM.ploegenLegende.classList.remove('no-print');
    } else {
        DOM.ploegenLegende.classList.add('no-print');
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
