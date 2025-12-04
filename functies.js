import { DOM, generateCalendar, updateCalendar } from "./main.js";
import { activeBlad } from "./componentenMaken.js";
import { makeModalInstellingen, shiftPatroon, startDatums, ploegenGegevens } from "./makeModalSettings.js";
import { makeModalFeestdagen } from "./makeModalHolidays.js";
import { makeModalVakanties } from "./makeModalVakanties.js";
import { makeModalRapport } from "./makeModalRapport.js";

export function updateBeginrechtVerlofLocalStorage(jaar, updates = {}) {
    let alleBeginrechten = {};
    try {
        alleBeginrechten = JSON.parse(localStorage.getItem('beginrechtVerlof')) || {};
    } catch {
        alleBeginrechten = {};
    }
    const beginrechten = getBeginRechtFromLocalStorage(jaar);
    const newBeginrechten = { ...beginrechten, ...updates }; // Merge updates met bestaande rechten
    alleBeginrechten[jaar] = newBeginrechten;
    const allZero = Object.values(newBeginrechten).every(value => value === 0);
    if (allZero) {
        delete alleBeginrechten[jaar];
    }
    if (Object.keys(alleBeginrechten).length === 0) {
        localStorage.removeItem('beginrechtVerlof');
        return;
    }
    saveToLocalStorage('beginrechtVerlof', alleBeginrechten);
};

export function updatePaginaInstLocalStorage(obj, defaultSet = null, index, updates = {}) {
    const getObject = JSON.parse(localStorage.getItem(obj)) || defaultSet();
    Object.entries(updates).forEach(([key, value]) => {
        getObject[index][key] = value;
    });
    saveToLocalStorage(obj, getObject);
};

export function getBeginRechtFromLocalStorage(jaar) {
    const defaultValues = { BV: 0, CS: 0, ADV: 0, BF: 0, AV: 0, HP: 0, Z: 0 };
    let beginrechten = {};

    try {
        beginrechten = JSON.parse(localStorage.getItem('beginrechtVerlof')) || {};
    } catch {
        beginrechten = {};
    }

    if (typeof beginrechten !== 'object' || beginrechten === null) {
        beginrechten = {};
    }

    if (!beginrechten[jaar]) {
        beginrechten[jaar] = { ...defaultValues };
    }

    const beginrecht = { ...defaultValues, ...beginrechten[jaar] };  // Merge with default values
    return beginrecht;
};
  
export function getSettingsFromLocalStorage(blad, setting) {
    let instellingen;
    try {
        instellingen = JSON.parse(localStorage.getItem('paginaInstellingen'));
        if (!Array.isArray(instellingen)) throw new Error();
    } catch {
        instellingen = setting();
        saveToLocalStorage('paginaInstellingen', instellingen);
    }

    const instelling = instellingen.find(item => item.pagina === blad);
    if (!instelling) {
        console.warn("No matching instellingen found for activeBlad:", blad);
        return null;
    }
    return {
        selectedPloeg: instelling.ploeg ?? 1,
        currentYear: instelling.jaar,
        currentMonth: instelling.maand ?? 0
    };
};

export function toggleModal(show = false, positie = '50px', bg = '#d1d1d1') {
    if (!DOM.modal) return;

    if (!show) {
        DOM.modalOverlay.classList.remove('open');
        setTimeout(() => {
            DOM.modalOverlay.style.display = 'none';
            DOM.modal.style.display = 'none';
            DOM.modal.style.animation = ''; // Reset animatie
            if (bg !== null) {
                DOM.overlay.style.backgroundColor = ''; // Reset achtergrondkleur
            }
        }, 300);
    } else {
        // 1. Toon overlay direct (maar zonder animatie)
        DOM.modalOverlay.style.display = 'block';

        // 2. Voorbereiding modal: tijdelijk zichtbaar maken voor meting
        DOM.modal.style.visibility = 'hidden';
        DOM.modal.style.display = 'block';
        DOM.modal.style.transform = 'scale(1)'; // Zet animatie uit tijdelijk

        // 3. Bereken en zet positie
        const modalWidth = DOM.modal.offsetWidth;
        const centerX = (window.innerWidth - modalWidth) / 2;
        DOM.modal.style.left = `${centerX}px`;
        DOM.modal.style.top = positie;

        // 4. Modal weer echt tonen met animatie
        //DOM.modal.style.width = modalWidth;
        DOM.modal.style.visibility = 'visible';
        DOM.modal.style.transform = 'scale(0)'; // Start zoom-animatie
        DOM.modal.style.animation = 'zoom 0.3s forwards';

        // 5. Start overlay fade-in
        setTimeout(() => {
            DOM.modalOverlay.classList.add('open');
        }, 10);

        if (bg !== null) {
            DOM.overlay.style.backgroundColor = bg;
        }
    }
};

export function handleClickBtn(e) {
    const btn = e.currentTarget.id; // Gebruik currentTarget om de juiste id op te halen
    switch(btn) {
        case 'instellingen':
            makeModalInstellingen(shiftPatroon, startDatums);
            toggleModal(true);
            break;
        case 'feestdagen':
            makeModalFeestdagen(activeBlad, defaultSettings);
            toggleModal(true);
            break;
        case 'vakanties':
            makeModalVakanties(activeBlad, defaultSettings);
            toggleModal(true);
            break;
        case 'rapport':
            makeModalRapport(activeBlad, defaultSettings);
            toggleModal(true);
            break;
        case 'export':
            // haal geselecteerde ploeg uit de instellingen en bepaal de key
            const setting = getSettingsFromLocalStorage(activeBlad, defaultSettings);
            const selectedPloeg = setting?.selectedPloeg ?? 1;
            const verlofdagenKey = `verlofdagenPloeg${selectedPloeg}`;

            // exporteer de gewenste items, inclusief het dynamische verlofdagen-item
            exportLocalStorageItemsToFile(
                ['beginrechtVerlof', 'shiftPatroon', 'startDatums', verlofdagenKey],
                true,
                `Instellingen ploeg${selectedPloeg}-${new Date().toISOString().slice(0,10)}.txt`
            );
            break;
        case 'import':
            importLocalStorageItemsFromFile(null, { overwrite: true })
                .then(result => console.log('Import resultaat:', result))
                .catch(err => console.error('Import fout:', err))
                .finally(() => {
                    generateCalendar(); // wordt altijd aan het einde uitgevoerd
                });
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
    const setting = getSettingsFromLocalStorage(activeBlad, defaultSettings);
    const selectedPloeg = setting.selectedPloeg;
    const year = setting.currentYear;
    const month = setting.currentMonth;
    const monthStr = month ? new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(new Date(year, month)): null;
    const afdrukken = document.getElementById("printPreview");
    afdrukken.innerHTML = '';

    const setShiften = new Set(getArrayValues(shiftPatroon));
    const mijnData = ploegenGegevens.filter(item => setShiften.has(item.symbool));
    
    if((activeBlad === 1 || activeBlad === 2) && mijnData.length > 1 ) {
        DOM.topSectie3.classList.remove('no-print');
    } else {
        DOM.topSectie3.classList.add('no-print');
    }
    const lijst = document.createElement('ul');
    lijst.classList.add('print-header');
    
    const jaar = document.createElement('li');
    jaar.textContent = `Jaar: ${year}`;
    lijst.appendChild(jaar);
    
    if (activeBlad === 2 || activeBlad === 3) {
        const maand = document.createElement('li');
        maand.textContent = `Maand: ${monthStr}`;
        lijst.appendChild(maand);
    }
    if (activeBlad !== 3 && mijnData.length > 1 && startDatums.length > 1) {
        const ploeg = document.createElement('li');
        ploeg.textContent = `Ploeg ${selectedPloeg}`;
        lijst.appendChild(ploeg);
    }
    afdrukken.appendChild(lijst);
};

export function modalAfdrukken() {
    document.getElementById("printPreview").classList.add("no-print");
    document.querySelector(".top-secties").classList.add("no-print");
    DOM.calendar.classList.add("no-print");
    window.print();
    // Reset na printen
    setTimeout(() => {
    document.getElementById("printPreview").classList.remove("no-print");
    document.querySelector(".top-secties").classList.remove("no-print");
    DOM.calendar.classList.remove("no-print");
    }, 1000); // wacht even tot printdialoog klaar is
};

export const defaultSettings = () => {
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    return [
        {pagina: 0, ploeg: 1, jaar: currentYear},
        {pagina: 1, ploeg: 1, jaar: currentYear},
        {pagina: 2, ploeg: 1, jaar: currentYear, maand: currentMonth},
        {pagina: 3, jaar: currentYear, maand: currentMonth}
    ];
};

export function calculateTotals(obj) {
    const values = Object.values(obj);
    return values.reduce((acc, x) => acc + x, 0);
};

export const getArrayValues = (obj) => {
    let output = [];
    obj.forEach( week => {
        const shiftsArray = [...week.schema];
        output.push(shiftsArray);
    });
    return output.flat();
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

export function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};

export function saveArrayToSessionStorage(key, arr) {
    if (!Array.isArray(arr)) return;

    // Verwijder duplicaten op basis van combinatie van datum en team
    const unique = Array.from(new Map(arr.map(item => [`${item.datum}-${item.team}`, item])).values());
    sessionStorage.setItem(key, JSON.stringify(unique));
};

export function exportLocalStorageItemsToFile(
    keys = ['beginrechtVerlof','shiftPatroon','startDatums','verlofdagenPloeg1'],
    pretty = true,
    filename = null
) {
    const payload = {};
    keys.forEach(key => {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            payload[key] = null;
            return;
        }
        try {
            payload[key] = JSON.parse(raw);
        } catch {
            // als het geen JSON is, bewaar ruwe string
            payload[key] = raw;
        }
    });

    const content = pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
    const name = filename || `localstorage-export-${new Date().toISOString().slice(0,10)}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
}

export function importLocalStorageItemsFromFile(file = null, { overwrite = true } = {}) {
    return new Promise((resolve, reject) => {
        const readTextFromFile = (f) => {
            return new Promise((res, rej) => {
                const reader = new FileReader();
                reader.onload = () => res(String(reader.result));
                reader.onerror = () => rej(new Error('Fout bij lezen van bestand'));
                reader.readAsText(f);
            });
        };

        const showChooser = (payloadObj, initialOverwrite) => {
            // create overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.inset = '0';
            overlay.style.background = 'rgba(0,0,0,0.5)';
            overlay.style.zIndex = 9999;
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';

            const panel = document.createElement('div');
            panel.style.width = '90%';
            panel.style.maxWidth = '720px';
            panel.style.maxHeight = '80%';
            panel.style.overflow = 'auto';
            panel.style.background = '#fff';
            panel.style.borderRadius = '6px';
            panel.style.padding = '16px';
            panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
            overlay.appendChild(panel);

            const title = document.createElement('h3');
            title.textContent = 'Import localStorage - kies items';
            title.style.marginTop = '0';
            panel.appendChild(title);

            const info = document.createElement('p');
            info.textContent = 'Selecteer de items die je wilt importeren en klik op "Importeer geselecteerd".';
            panel.appendChild(info);

            // overwrite checkbox
            const overwriteLabel = document.createElement('label');
            overwriteLabel.style.display = 'block';
            overwriteLabel.style.margin = '8px 0 12px 0';
            const overwriteCheckbox = document.createElement('input');
            overwriteCheckbox.type = 'checkbox';
            overwriteCheckbox.checked = !!initialOverwrite;
            overwriteCheckbox.style.marginRight = '8px';
            overwriteLabel.appendChild(overwriteCheckbox);
            overwriteLabel.appendChild(document.createTextNode('Overschrijf bestaande keys (overwrite)'));
            panel.appendChild(overwriteLabel);

            // select all button
            const controlsDiv = document.createElement('div');
            controlsDiv.style.display = 'flex';
            controlsDiv.style.gap = '8px';
            controlsDiv.style.marginBottom = '8px';
            panel.appendChild(controlsDiv);

            const selectAllBtn = document.createElement('button');
            selectAllBtn.type = 'button';
            selectAllBtn.textContent = 'Selecteer alles';
            selectAllBtn.addEventListener('click', () => {
                listItems.forEach(i => i.checkbox.checked = true);
            });
            controlsDiv.appendChild(selectAllBtn);

            const clearAllBtn = document.createElement('button');
            clearAllBtn.type = 'button';
            clearAllBtn.textContent = 'Wis selectie';
            clearAllBtn.addEventListener('click', () => {
                listItems.forEach(i => i.checkbox.checked = false);
            });
            controlsDiv.appendChild(clearAllBtn);

            // list keys
            const listContainer = document.createElement('div');
            listContainer.style.display = 'grid';
            listContainer.style.gap = '6px';
            listContainer.style.marginBottom = '12px';
            panel.appendChild(listContainer);

            const listItems = [];
            Object.entries(payloadObj).forEach(([key, value]) => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.alignItems = 'flex-start';
                row.style.gap = '8px';
                row.style.borderBottom = '1px solid #eee';
                row.style.paddingBottom = '8px';
                row.style.marginBottom = '8px';

                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = true;
                row.appendChild(cb);

                const keyLabel = document.createElement('div');
                keyLabel.style.flex = '1';
                const kTitle = document.createElement('strong');
                kTitle.textContent = key;
                keyLabel.appendChild(kTitle);

                // small preview
                const preview = document.createElement('pre');
                preview.style.whiteSpace = 'pre-wrap';
                preview.style.wordBreak = 'break-word';
                preview.style.margin = '6px 0 0 0';
                preview.style.fontSize = '12px';
                preview.style.maxHeight = '120px';
                preview.style.overflow = 'auto';
                try {
                    preview.textContent = JSON.stringify(value, null, 2);
                } catch {
                    preview.textContent = String(value);
                }
                keyLabel.appendChild(preview);

                row.appendChild(keyLabel);
                listContainer.appendChild(row);

                listItems.push({ key, checkbox: cb, value });
            });

            // buttons
            const btns = document.createElement('div');
            btns.style.display = 'flex';
            btns.style.justifyContent = 'flex-end';
            btns.style.gap = '8px';
            panel.appendChild(btns);

            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.textContent = 'Annuleer';
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                reject(new Error('Import geannuleerd door gebruiker'));
            });
            btns.appendChild(cancelBtn);

            const importBtn = document.createElement('button');
            importBtn.type = 'button';
            importBtn.textContent = 'Importeer geselecteerd';
            importBtn.style.background = '#0b63d0';
            importBtn.style.color = '#fff';
            importBtn.addEventListener('click', () => {
                const selected = listItems.filter(i => i.checkbox.checked);
                if (selected.length === 0) {
                    alert('Selecteer minstens één item om te importeren.');
                    return;
                }
                const result = { written: [], removed: [], skipped: [] };
                const doOverwrite = overwriteCheckbox.checked;

                selected.forEach(({ key, value }) => {
                    if (value === null) {
                        localStorage.removeItem(key);
                        result.removed.push(key);
                        return;
                    }
                    if (!doOverwrite && localStorage.getItem(key) !== null) {
                        result.skipped.push(key);
                        return;
                    }
                    if (typeof value === 'object') {
                        localStorage.setItem(key, JSON.stringify(value));
                    } else if (typeof value === 'string') {
                        localStorage.setItem(key, value);
                    } else {
                        localStorage.setItem(key, JSON.stringify(value));
                    }
                    result.written.push(key);
                });

                document.body.removeChild(overlay);
                resolve(result);
            });
            btns.appendChild(importBtn);

            document.body.appendChild(overlay);
        };

        const handleText = async (text) => {
            let payload;
            try {
                payload = JSON.parse(text);
                if (typeof payload !== 'object' || payload === null) throw new Error('Invalid payload');
            } catch (err) {
                return reject(new Error('Bestand is geen geldige JSON of heeft geen object-structuur'));
            }
            // Toon chooser UI en laat gebruiker kiezen
            showChooser(payload, overwrite);
        };

        if (file instanceof File) {
            readTextFromFile(file).then(handleText).catch(err => reject(err));
            return;
        }

        // geen file => laat gebruiker kiezen
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.txt,application/json,text/plain';
        input.style.display = 'none';
        document.body.appendChild(input);
        input.addEventListener('change', () => {
            const f = input.files && input.files[0];
            if (!f) {
                document.body.removeChild(input);
                return reject(new Error('Geen bestand geselecteerd'));
            }
            readTextFromFile(f).then(text => {
                document.body.removeChild(input);
                handleText(text);
            }).catch(err => {
                document.body.removeChild(input);
                reject(err);
            });
        });
        input.click();
    });
}
