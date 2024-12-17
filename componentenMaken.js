import { shiftenGegevens, DOM, generateCalendar, defaultSettings } from './main.js';
import { saveToLocalStorage, getSettingsFromSessionStorage } from './functies.js';

export const verlofdagenPloegen = {
    verlofdagenPloeg1: JSON.parse(localStorage.getItem('verlofdagenPloeg1')) || [],
    verlofdagenPloeg2: JSON.parse(localStorage.getItem('verlofdagenPloeg2')) || [],
    verlofdagenPloeg3: JSON.parse(localStorage.getItem('verlofdagenPloeg3')) || [],
    verlofdagenPloeg4: JSON.parse(localStorage.getItem('verlofdagenPloeg4')) || [],
    verlofdagenPloeg5: JSON.parse(localStorage.getItem('verlofdagenPloeg5')) || []
};
const localStoragePloegen = {
    1: 'verlofdagenPloeg1',
    2: 'verlofdagenPloeg2',
    3: 'verlofdagenPloeg3',
    4: 'verlofdagenPloeg4',
    5: 'verlofdagenPloeg5'
};

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

export function maakLegende() {
    shiftenGegevens.forEach(shift => {
    const legendeItem = document.createElement('div');
    legendeItem.classList.add('legende-item');
    
    const kleurVak = document.createElement('span');
    kleurVak.classList.add('legende-vak');
    kleurVak.style.backgroundColor = shift.kleur;
    legendeItem.appendChild(kleurVak);

    const beschrijving = document.createElement('span');
    beschrijving.textContent = `${shift.symbool} : ${shift.naam.charAt(0).toUpperCase()}${shift.naam.slice(1)}`;
    legendeItem.appendChild(beschrijving);

    DOM.legende.appendChild(legendeItem);
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
function verlofAanvraag(e) {
    const selectedPloeg = getSettingsFromSessionStorage(tabBlad, defaultSettings).selectedPloeg;
    const aanvraag = e.target.textContent;
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if(!selectedCell) return;
    if(selectedCell.team !== selectedPloeg) return;
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    Array.from(DOM.calendar.querySelectorAll('.cell')).forEach(cel => {
        if(!cel.textContent.includes('x')) {
            if(cel.dataset.datum === selectedCell.datum) {
                cel.classList.forEach(className => {
                    if(verlofDagen.includes(className)) cel.classList.remove(className);
                });
                cel.textContent = aanvraag;
                cel.classList.add(aanvraag);
                voegVerlofDatumToe(selectedPloeg, selectedCell.datum, aanvraag);
            }
        }
    });
};
function voegVerlofDatumToe(ploeg, datum, soort) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const array = verlofdagenPloegen[ploegKey];
    const index = array.findIndex(obj => obj.datum === datum);
    if (index === -1) {
        array.push({ datum, soort });
    } else if (array[index].soort !== soort) {
        array[index].soort = soort;
    }
    saveToLocalStorage(localStoragePloegen[ploeg], array);
};
function cancelAanvraag() {
    const selectedPloeg = getSettingsFromSessionStorage(tabBlad, defaultSettings).selectedPloeg;
    const selectedCell = JSON.parse(sessionStorage.getItem('selectedCell'));
    if(!selectedCell) return;
    if(selectedCell.team !== selectedPloeg) return;
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    Array.from(DOM.calendar.querySelectorAll('.cell')).forEach(cel => {
        if(cel.textContent !== 'x') {
            if(cel.dataset.datum === selectedCell.datum) {
                cel.classList.forEach(className => {
                    if(verlofDagen.includes(className)) {
                        cel.classList.remove(className);
                        cel.textContent = cel.dataset.shift;
                        const canceledDatum = selectedCell.datum;
                        verwijderVerlofDatum(selectedPloeg, canceledDatum);
                    }
                });
            }
        }
    });
};
function verwijderVerlofDatum(ploeg, datum) {
    const ploegKey = `verlofdagenPloeg${ploeg}`;
    const index = verlofdagenPloegen[ploegKey].findIndex(obj => obj.datum === datum);

    if (index !== -1) {
        verlofdagenPloegen[ploegKey].splice(index, 1);
        saveToLocalStorage(localStoragePloegen[ploeg], verlofdagenPloegen[ploegKey]);
    }
};
function cancelAlleAanvragen() {
    let selectedPloeg = getSettingsFromSessionStorage(tabBlad, defaultSettings).selectedPloeg;
    const verlofDagen = ['BV', 'CS', 'ADV', 'BF', 'AV', 'HP', 'Z'];
    const cellen = DOM.calendar.querySelectorAll('.cell');
    const bestaandeVerlof = Array.from(cellen).some(cel => verlofDagen.includes(cel.textContent));
    if(!bestaandeVerlof) return;
    const userResponse = confirm("Bent u zeker om alle verlof dagen te verwijderen ?");
    if(!userResponse) return;
    cellen.forEach(cel => {
        cel.classList.forEach(className => {
            if(verlofDagen.includes(className)) {
                cel.classList.remove(className);
                cel.textContent = cel.dataset.shift;
                const canceledDatum = cel.dataset.datum;
                verwijderVerlofDatum(selectedPloeg, canceledDatum);
            }
        });

    });
};