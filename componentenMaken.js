import { shiftenGegevens, DOM, generateCalendar, defaultSettings } from './main.js';
import { getSettingsFromSessionStorage } from './functies.js';
import { verlofAanvraag, cancelAanvraag, cancelAlleAanvragen } from './herplanningen.js';

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

export function maakPloegenLegende() {
    shiftenGegevens.forEach(shift => {
    const legendeItem = document.createElement('div');
    legendeItem.classList.add('ploegenLegende-item');
    
    const kleurVak = document.createElement('span');
    kleurVak.classList.add('ploegenLegende-vak');
    kleurVak.style.backgroundColor = shift.kleur;
    legendeItem.appendChild(kleurVak);

    const beschrijving = document.createElement('span');
    beschrijving.textContent = `${shift.symbool} : ${shift.naam.charAt(0).toUpperCase()}${shift.naam.slice(1)}`;
    legendeItem.appendChild(beschrijving);

    DOM.ploegenLegende.appendChild(legendeItem);
    });
};

export function maakVerlofLegende() {
    const verlofBeschrijving = {'BV': 'Betaald verlof', 'CS':'Compensatie shift', 'ADV':'Arbeidsvermindering',
        'BF':'Betaalde feestdag', 'AV':'Ancieniteitsverlof','HP':'Herplanning', 'Z':'Ziek'};
    Object.entries(verlofBeschrijving).forEach(([kort, lang]) => {
    const legendeItem = document.createElement('div');
    legendeItem.classList.add('verlofLegende-item');
    
    const kleurVak = document.createElement('span');
    kleurVak.classList.add('verlofLegende-vak');
    kleurVak.classList.add(kort);
    legendeItem.appendChild(kleurVak);

    const beschrijving = document.createElement('span');
    beschrijving.textContent = lang;
    legendeItem.appendChild(beschrijving);

    DOM.verlofLegende.appendChild(legendeItem);
    });
};

export function maakDropdowns() {
    let currentMonth = new Date();
    let currentYear = new Date();
    const settings = getSettingsFromSessionStorage(tabBlad, defaultSettings);
    if (settings) {
        currentMonth = settings.currentMonth;
        currentYear = settings.currentYear;
    }
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
    for (let year = 2010; year <= 2040; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        option.style.color = 'black';
        if (year === currentYear) option.selected = true;
        DOM.yearSelect.appendChild(option);
    }
};

export function maakVerlofContainer() {
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    verlofDagen.forEach(verlof => {
        const verlofDag = document.createElement('div');
        verlofDag.textContent = verlof;
        verlofDag.classList.add(verlof);
        verlofDag.classList.add('verlofCollection');
        verlofDag.addEventListener('click', verlofAanvraag);
        DOM.verlofContainer.appendChild(verlofDag);
    });
    const restore = document.createElement('div');
    restore.textContent = 'Geselecteerd verlof annuleren';
    restore.addEventListener('click', cancelAanvraag);
    restore.classList.add('restore');
    DOM.verlofContainer.appendChild(restore);

    const restoreAll = document.createElement('div');
    restoreAll.textContent = 'Alles annuleren';
    restoreAll.addEventListener('click', cancelAlleAanvragen);
    restoreAll.classList.add('restore');
    DOM.verlofContainer.appendChild(restoreAll);
};
