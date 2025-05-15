import { ploegenGegevens, DOM, generateCalendar, defaultSettings, beginrechtVerlof, berekenSaldo } from './main.js';
import { calculateTotals, getSettingsFromLocalStorage, handleBlur, handleClickBtn } from './functies.js';
import { handelVerlofAanvraag, cancelAanvraag, cancelAlleAanvragen, handelHerplanning } from './herplanningen.js';

export let tabBlad = 0;

export function maakSidebar() {
    const tabArray = ['Jaarkalender : Tabel', 'Jaarkalender : Raster', 'Maandkalender', 'TeamKalender'];
    DOM.topNav.setAttribute('role', 'tablist');
    tabArray.forEach((tab, index) => {
        const hyperlink = document.createElement('a');
        hyperlink.href = '#';
        hyperlink.textContent = tab;
        hyperlink.setAttribute('role', 'tab'); // Add tab role
        hyperlink.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        if(index === 0) hyperlink.classList.add('active');
        hyperlink.addEventListener('click', () => {
            if (index === tabBlad) return; // Prevent reloading the same tab
            const activeLink = DOM.topNav.querySelector('.active');
            activeLink.classList.remove("active");
            activeLink.setAttribute('aria-selected', 'false');
            hyperlink.classList.add("active");
            tabBlad = index;
            generateCalendar();
        });
        DOM.topNav.appendChild(hyperlink);
    });
}

export function maakPloegDropdown(numberOfTeams = 5) {
    Array.from({ length: numberOfTeams }).forEach((_, i) => {
        const option = document.createElement('option');
        option.value = i + 1;
        option.textContent = `Ploeg ${i + 1}`;
        option.style.color = 'black';
        DOM.ploeg.appendChild(option);
    }); 
};

export function maakKnoppen() {
    const knoppen = [
        ['instellingen', 'fa-cog', 'Instellingen'],
        ['feestdagen', 'fa-calendar', 'Feestdagen'],
        ['vakanties', 'fa-plane', 'School vakanties'],
        ['afdrukken', 'fa-print', 'Afdrukken']
        //['rapport', 'fa-calendar-check-o', 'Genereer rapport']
    ];
    
    knoppen.forEach(knop => {
        const btn = document.createElement('div');
        btn.id = knop[0];
        btn.classList.add('btnGreen');
        const icoon = document.createElement('i');
        icoon.classList.add('fa', knop[1]);
        //icoon.classList.add(knop[1]);
        icoon.setAttribute('aria-hidden', 'true');
        icoon.textContent = ` ${knop[2]}`;
        btn.appendChild(icoon);
        btn.addEventListener('click', handleClickBtn);
        DOM.buttonContainer.appendChild(btn);
    });
};

export function maakVerlofContainer() {
    /*const verlofContainer = document.createElement('div');
    verlofContainer.classList.add('verlof-container');
    verlofContainer.classList.add('hidden-on-small');*/

    const container = document.createElement('div');
    container.classList.add('verlof-inhoud');
    const legeCel1 = document.createElement('div');
    legeCel1.classList.add('legeCel');
    container.appendChild(legeCel1);
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    verlofDagen.forEach(verlof => {
        const verlofDag = document.createElement('div');
        verlofDag.textContent = verlof;
        verlofDag.classList.add(verlof);
        verlofDag.classList.add('verlofCollection');
        verlofDag.addEventListener('click', handelVerlofAanvraag);
        container.appendChild(verlofDag);
    });
    
    const beginRecht = document.createElement('div');
    beginRecht.classList.add('titel');
    beginRecht.textContent = 'Beginrecht';
    container.appendChild(beginRecht);

    Object.entries(beginrechtVerlof).forEach(([verlof,aantal]) => {
        const inputVak = document.createElement('input');
        inputVak.classList.add('inputVak');
        inputVak.id = verlof;
        inputVak.value = aantal;
        inputVak.addEventListener('blur', handleBlur);
        inputVak.addEventListener('focus', function () {
            this.select();
        });
        container.appendChild(inputVak);
    });
    
    const totaal1 = document.createElement('div');
    totaal1.classList.add('totaal');
    totaal1.textContent = 'Totaal:';

    const beginrechtTotaal = calculateTotals(beginrechtVerlof);
    //console.log(`totaal beginrecht: ${beginrechtTotaal}`);
    const span = document.createElement('span');
    span.id = 'totaalBeginrecht';
    span.textContent = ` ${beginrechtTotaal}`;
    totaal1.appendChild(span);
    container.appendChild(totaal1);

    const saldo = document.createElement('div');
    saldo.classList.add('titel');
    saldo.textContent = 'Saldo';
    container.appendChild(saldo);

    const selectedPloeg = getSettingsFromLocalStorage(tabBlad, defaultSettings).selectedPloeg;
    const saldoArray = berekenSaldo(selectedPloeg);
    Object.entries(saldoArray).forEach(([verlof,aantal]) => {
        const outputVak = document.createElement('div');
        outputVak.classList.add('outputVak');
        outputVak.id = `saldo-${verlof}`;
        outputVak.textContent = aantal;
        container.appendChild(outputVak);
    });

    const totaal2 = document.createElement('div');
    totaal2.classList.add('totaal');
    totaal2.textContent = 'Rest:';

    const saldoTotaal = calculateTotals(saldoArray);
    const span2 = document.createElement('span');
    span2.id = 'totaalSaldo';
    span2.textContent = ` ${saldoTotaal}`;
    totaal2.appendChild(span2);
    container.appendChild(totaal2);

    DOM.middenSectie2.appendChild(container);

    const btnContainer = document.createElement('div');
    btnContainer.classList.add('btn-container');

    const herplanning = document.createElement('button');
    herplanning.textContent = 'Selectie herplannen';
    herplanning.addEventListener('click', handelHerplanning);
    herplanning.classList.add('hpButton');
    btnContainer.appendChild(herplanning);

    const restore = document.createElement('button');
    restore.textContent = 'Selectie terugstellen';
    restore.addEventListener('click', cancelAanvraag);
    restore.classList.add('restore');
    btnContainer.appendChild(restore);
    
    const restoreAll = document.createElement('button');
    restoreAll.textContent = 'Alles terugstellen';
    restoreAll.addEventListener('click', cancelAlleAanvragen);
    restoreAll.classList.add('restore');
    btnContainer.appendChild(restoreAll);

    DOM.middenSectie2.appendChild(btnContainer);
    //DOM.middenSectie2.appendChild(verlofContainer);
};

export function maakVerlofLegende() {
    //const legende = document.createElement('div');
    //legende.classList.add('verlofLegende-container');
    //legende.classList.add('hidden-on-small');

    const verlofBeschrijving = {'BV': 'Betaald verlof', 'CS':'Compensatieshift', 'ADV':'Arbeidsduurvermindering',
        'BF':'Betaalde feestdag', 'AV':'Ancieniteitsverlof','HP':'Recup-herplanning', 'Z':'Ziek', 'OPL':'Opleiding/herplanning'};
    Object.entries(verlofBeschrijving).forEach(([kort, lang]) => {
    const legendeItem = document.createElement('div');
    legendeItem.classList.add('verlofLegende-item');
    
    const kleurVak = document.createElement('span');
    kleurVak.classList.add('verlofLegende-vak');
    kleurVak.textContent = kort;
    kleurVak.classList.add(kort);
    legendeItem.appendChild(kleurVak);

    const beschrijving = document.createElement('span');
    beschrijving.textContent = lang;
    legendeItem.appendChild(beschrijving);

    DOM.topSectie3.appendChild(legendeItem);
    });
    DOM.topSectie3.classList.add('verlofLegende-container');
    //DOM.topSectie3.classList.add('hidden-on-small');
};

export function maakPloegenLegende() {
    //const ploegenLegende = document.createElement('div');
    //ploegenLegende.classList.add('ploegenLegende-container');
    //ploegenLegende.classList.add('hidden-on-small');
    let mijnData = [...ploegenGegevens];
    //mijnData.splice(2, 1);
    //console.log(mijnData);
    mijnData.pop();
    //mijnData.shift();
    //console.log(mijnData);

    mijnData.forEach(shift => {
    const legendeItem = document.createElement('div');
    legendeItem.classList.add('ploegenLegende-item');
    
    const kleurVak = document.createElement('span');
    kleurVak.classList.add('ploegenLegende-vak');
    kleurVak.style.backgroundColor = shift.kleur;
    legendeItem.appendChild(kleurVak);

    const beschrijving = document.createElement('span');
    beschrijving.textContent = `${shift.naam.charAt(0).toUpperCase()}${shift.naam.slice(1)}`;
    legendeItem.appendChild(beschrijving);


    DOM.topSectie3.appendChild(legendeItem);
    });
    DOM.topSectie3.classList.add('ploegenLegende-container');
    //DOM.topSectie3.classList.add('hidden-on-small');
};

export function maakDropdowns() {
    let currentMonth = getSettingsFromLocalStorage(tabBlad, defaultSettings).currentMonth;
    let currentYear = getSettingsFromLocalStorage(tabBlad, defaultSettings).currentYear
    const months = [
        "januari", "februari", "maart", "april", "mei", "juni",
        "juli", "augustus", "september", "oktober", "november", "december"
    ];

    DOM.monthSelect.innerHTML = "";
    months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = month;
        option.style.color = 'black';
        if (index === currentMonth) option.selected = true;
        DOM.monthSelect.appendChild(option);
    });
    DOM.yearSelect.innerHTML = "";
    //const currentDate = new Date();
    const huidigJaar = new Date().getFullYear();
    const opt = document.createElement("option");
    opt.value = huidigJaar; 
    opt.textContent = huidigJaar; //"dit jaar : " +
    opt.style.color = '#999';
    opt.style.fontWeight = 'bold';
    //opt.selected = true;
    DOM.yearSelect.appendChild(opt);
    for (let year = currentYear - 15; year <= currentYear + 15; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        option.style.color = 'black';
        if (year === currentYear) option.selected = true;
        DOM.yearSelect.appendChild(option);
    }
};

