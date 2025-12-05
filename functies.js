import { DOM, generateCalendar, updateCalendar } from "./main.js";
import { activeBlad } from "./componentenMaken.js";
import { makeModalInstellingen, shiftPatroon, startDatums, ploegenGegevens, gegevensLaden } from "./makeModalSettings.js";
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
            exportLocalStorageItemsToFile(true);
            break;
        case 'import':
            importLocalStorageItemsFromFile(null, { overwrite: true })
                .then(result => {
                    console.log('Import resultaat:', result);
                    gegevensLaden(); // herlaad de instellingen na import
                    generateCalendar(); // wordt altijd aan het einde uitgevoerd
                })
                .catch(err => console.error('Import fout:', err));
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

export function exportLocalStorageItemsToFile(pretty = true, filename = null) {
    // haal geselecteerde ploeg uit de instellingen en bepaal de key
    const setting = getSettingsFromLocalStorage(activeBlad, defaultSettings);
    const selectedPloeg = setting?.selectedPloeg ?? 1;
    const keys = ['beginrechtVerlof','shiftPatroon','startDatums','verlofdagenPloeg1','verlofdagenPloeg2','verlofdagenPloeg3','verlofdagenPloeg4','verlofdagenPloeg5'];
    // Check welke items aanwezig zijn
    const availableItems = keys.filter(key => localStorage.getItem(key) !== null);
    
    if (availableItems.length === 0) {
        alert('Geen items beschikbaar om te exporteren.');
        return false;
    }

    // Toon keuze-dialoog aan gebruiker
    DOM.overlay.innerHTML = '';
    const topHeader = document.createElement('div');
    topHeader.classList.add('top-header');
    
    const title = document.createElement('h2');
    title.textContent = `Export instellingen Ploeg${selectedPloeg} naar bestand — kies items`;
    topHeader.appendChild(title);
    DOM.overlay.appendChild(topHeader);

    const info = document.createElement('p');
    info.textContent = 'Selecteer welke items je wilt exporteren:';
    info.style.margin = '0 0 12px 0';
    DOM.overlay.appendChild(info);

    // options row
    const optionsRow = document.createElement('div');
    optionsRow.style.display = 'flex';
    optionsRow.style.gap = '12px';
    optionsRow.style.alignItems = 'center';
    optionsRow.style.marginBottom = '12px';
    DOM.overlay.appendChild(optionsRow);

    const selectAllBtn = document.createElement('button');
    selectAllBtn.type = 'button';
    selectAllBtn.textContent = 'Selecteer alles';
    selectAllBtn.style.cursor = 'pointer';
    optionsRow.appendChild(selectAllBtn);

    const clearAllBtn = document.createElement('button');
    clearAllBtn.type = 'button';
    clearAllBtn.textContent = 'Wis selectie';
    clearAllBtn.style.cursor = 'pointer';
    optionsRow.appendChild(clearAllBtn);
    selectAllBtn.addEventListener('click', () => {
        Object.values(checkboxes).forEach(cb => cb.checked = true);
    });
    clearAllBtn.addEventListener('click', () => {
        Object.values(checkboxes).forEach(cb => cb.checked = false);
    });

    // Checkboxen voor beschikbare items
    const itemsContainer = document.createElement('div');
    itemsContainer.style.display = 'grid';
    itemsContainer.style.gap = '10px';
    itemsContainer.style.marginBottom = '12px';
    DOM.overlay.appendChild(itemsContainer);

    const checkboxes = {};
    availableItems.forEach(key => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '8px';
        label.style.cursor = 'pointer';
        
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = true;
        label.appendChild(cb);
        checkboxes[key] = cb;
        
        const span = document.createElement('span');
        span.textContent = key;
        span.style.fontFamily = 'monospace';
        label.appendChild(span);
        
        itemsContainer.appendChild(label);
    });

    // Knoppen
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '8px';
    DOM.overlay.appendChild(actions);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Annuleer';
    cancelBtn.addEventListener('click', () => toggleModal(false));
    actions.appendChild(cancelBtn);

    const exportBtn = document.createElement('button');
    exportBtn.type = 'button';
    exportBtn.textContent = 'Exporteer';
    exportBtn.style.background = '#0b63d0';
    exportBtn.style.color = '#fff';
    exportBtn.addEventListener('click', () => {
        const selectedKeys = Object.entries(checkboxes)
            .filter(([_, cb]) => cb.checked)
            .map(([key, _]) => key);

        if (selectedKeys.length === 0) {
            alert('Selecteer minstens één item om te exporteren.');
            return;
        }

        const payload = {};
        selectedKeys.forEach(key => {
            const raw = localStorage.getItem(key);
            try {
                payload[key] = JSON.parse(raw);
            } catch {
                payload[key] = raw;
            }
        });

        const content = pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
        const name = filename || `Instellingen-ploeg${selectedPloeg}-${new Date().toISOString().slice(0,10)}.txt`
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toggleModal(false);
    });
    actions.appendChild(exportBtn);

    toggleModal(true);
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
            DOM.overlay.innerHTML = ''; // clear previous content
            const topHeader = document.createElement('div');
            topHeader.classList.add('top-header');
            // title / info + checkbox
            const title = document.createElement('h2');
            title.textContent = 'Import data to localStorage';
            topHeader.appendChild(title);
            const overwriteLabel = document.createElement('label');
            overwriteLabel.style.display = 'flex';
            overwriteLabel.style.alignItems = 'center';
            overwriteLabel.style.gap = '8px';
            const overwriteCheckbox = document.createElement('input');
            overwriteCheckbox.type = 'checkbox';
            overwriteCheckbox.checked = !!initialOverwrite;
            overwriteLabel.appendChild(overwriteCheckbox);
            const overwriteText = document.createElement('span');
            overwriteText.textContent = 'Overschrijf bestaande keys';
            overwriteText.style.fontWeight = 'bold';
            overwriteLabel.appendChild(overwriteText);
            topHeader.appendChild(overwriteLabel);
            DOM.overlay.appendChild(topHeader);

            const info = document.createElement('p');
            info.textContent = 'Kies welke keys je wilt importeren. Klik op een sleutel om de inhoud te tonen/verbergen.';
            info.style.margin = '0 0 12px 0';
            DOM.overlay.appendChild(info);
            
            // options row
            const optionsRow = document.createElement('div');
            optionsRow.style.display = 'flex';
            optionsRow.style.gap = '12px';
            optionsRow.style.alignItems = 'center';
            optionsRow.style.marginBottom = '12px';
            DOM.overlay.appendChild(optionsRow);

            const selectAllBtn = document.createElement('button');
            selectAllBtn.type = 'button';
            selectAllBtn.textContent = 'Selecteer alles';
            selectAllBtn.style.cursor = 'pointer';
            optionsRow.appendChild(selectAllBtn);

            const clearAllBtn = document.createElement('button');
            clearAllBtn.type = 'button';
            clearAllBtn.textContent = 'Wis selectie';
            clearAllBtn.style.cursor = 'pointer';
            optionsRow.appendChild(clearAllBtn);

            // list container (styled like object inspector)
            const listContainer = document.createElement('div');
            listContainer.style.display = 'grid';
            listContainer.style.gap = '10px';
            DOM.overlay.appendChild(listContainer);

            const listItems = [];

            // helper: render value in object-tree style
            const renderNode = (value, container, level = 0) => {
                const indent = 12 * level;
                if (value === null || typeof value !== 'object') {
                    const span = document.createElement('div');
                    span.textContent = String(value);
                    span.style.fontFamily = 'monospace';
                    span.style.fontSize = '13px';
                    span.style.marginLeft = `${indent}px`;
                    container.appendChild(span);
                    return;
                }
                // array or object
                const isArray = Array.isArray(value);
                const summary = document.createElement('div');
                summary.style.display = 'flex';
                summary.style.alignItems = 'center';
                summary.style.gap = '8px';
                summary.style.marginLeft = `${indent}px`;

                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.textContent = isArray ? `[${value.length}] ▸` : `{${Object.keys(value).length}} ▸`;
                toggle.style.border = 'none';
                toggle.style.background = 'transparent';
                toggle.style.cursor = 'pointer';
                toggle.style.fontFamily = 'monospace';
                toggle.style.fontSize = '13px';
                toggle.style.padding = '0';
                toggle.style.color = '#0b63d0';
                summary.appendChild(toggle);

                const label = document.createElement('span');
                label.textContent = isArray ? 'Array' : 'Object';
                label.style.fontFamily = 'monospace';
                label.style.fontSize = '13px';
                summary.appendChild(label);

                container.appendChild(summary);

                const content = document.createElement('div');
                content.style.marginLeft = `${indent + 12}px`;
                content.style.borderLeft = '1px dotted #ddd';
                content.style.paddingLeft = '8px';
                content.style.display = 'none';
                content.style.gap = '6px';
                content.style.marginTop = '6px';
                container.appendChild(content);

                toggle.addEventListener('click', () => {
                    const open = content.style.display === 'block';
                    content.style.display = open ? 'none' : 'block';
                    toggle.textContent = (isArray ? `[${value.length}]` : `{${Object.keys(value).length}}`) + (open ? ' ▸' : ' ▾');
                });

                if (isArray) {
                    value.forEach((v, i) => {
                        const row = document.createElement('div');
                        row.style.display = 'flex';
                        row.style.gap = '8px';
                        const idx = document.createElement('div');
                        idx.textContent = `${i}:`;
                        idx.style.opacity = '0.7';
                        idx.style.minWidth = '28px';
                        idx.style.fontFamily = 'monospace';
                        row.appendChild(idx);
                        const valWrap = document.createElement('div');
                        row.appendChild(valWrap);
                        content.appendChild(row);
                        renderNode(v, valWrap, level + 1);
                    });
                } else {
                    Object.entries(value).forEach(([k, v]) => {
                        const row = document.createElement('div');
                        row.style.display = 'flex';
                        row.style.gap = '8px';
                        row.style.alignItems = 'flex-start';
                        const keyDiv = document.createElement('div');
                        keyDiv.textContent = `${k}:`;
                        keyDiv.style.fontWeight = '600';
                        keyDiv.style.minWidth = '120px';
                        keyDiv.style.opacity = '0.85';
                        keyDiv.style.fontFamily = 'monospace';
                        row.appendChild(keyDiv);
                        const valWrap = document.createElement('div');
                        row.appendChild(valWrap);
                        content.appendChild(row);
                        renderNode(v, valWrap, level + 1);
                    });
                }
            };

            // populate list
            Object.entries(payloadObj).forEach(([key, value]) => {
                const item = document.createElement('div');
                item.style.border = '1px solid #eee';
                item.style.borderRadius = '6px';
                item.style.padding = '8px';
                item.style.background = '#fafafa';

                const topRow = document.createElement('div');
                topRow.style.display = 'flex';
                topRow.style.alignItems = 'center';
                topRow.style.justifyContent = 'space-between';
                topRow.style.gap = '12px';

                const leftGroup = document.createElement('div');
                leftGroup.style.display = 'flex';
                leftGroup.style.alignItems = 'center';
                leftGroup.style.gap = '8px';

                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = true;
                leftGroup.appendChild(cb);

                const keySpan = document.createElement('span');
                keySpan.textContent = key;
                keySpan.style.fontWeight = '700';
                keySpan.style.fontFamily = 'monospace';
                leftGroup.appendChild(keySpan);

                topRow.appendChild(leftGroup);

                const rightGroup = document.createElement('div');
                rightGroup.style.display = 'flex';
                rightGroup.style.alignItems = 'center';
                rightGroup.style.gap = '8px';

                const togglePreviewBtn = document.createElement('button');
                togglePreviewBtn.type = 'button';
                togglePreviewBtn.textContent = 'Toon inhoud';
                togglePreviewBtn.style.cursor = 'pointer';
                rightGroup.appendChild(togglePreviewBtn);

                topRow.appendChild(rightGroup);
                item.appendChild(topRow);

                const previewWrap = document.createElement('div');
                previewWrap.style.marginTop = '8px';
                previewWrap.style.display = 'none';
                item.appendChild(previewWrap);

                togglePreviewBtn.addEventListener('click', () => {
                    const isOpen = previewWrap.style.display === 'block';
                    previewWrap.style.display = isOpen ? 'none' : 'block';
                    togglePreviewBtn.textContent = isOpen ? 'Toon inhoud' : 'Verberg inhoud';
                });

                // render pretty object layout
                renderNode(value, previewWrap, 0);

                listContainer.appendChild(item);
                listItems.push({ key, checkbox: cb, value });
            });

            // controls: cancel / import
            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.justifyContent = 'flex-end';
            actions.style.gap = '8px';
            actions.style.marginTop = '12px';

            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.textContent = 'Annuleer';
            cancelBtn.addEventListener('click', () => {
                toggleModal(false);
                reject(new Error('Import geannuleerd door gebruiker'));
            });
            actions.appendChild(cancelBtn);

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

                toggleModal(false);
                resolve(result);
            });
            actions.appendChild(importBtn);
            DOM.overlay.appendChild(actions);
            
            // select/clear handlers
            selectAllBtn.addEventListener('click', () => listItems.forEach(i => i.checkbox.checked = true));
            clearAllBtn.addEventListener('click', () => listItems.forEach(i => i.checkbox.checked = false));
            toggleModal(true);
        };

        const handleText = async (text) => {
            let payload;
            try {
                payload = JSON.parse(text);
                if (typeof payload !== 'object' || payload === null) throw new Error('Invalid payload');
            } catch (err) {
                alert('Bestand is geen geldige JSON of heeft geen object-structuur');
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
