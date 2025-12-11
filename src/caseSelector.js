// ========================================
// Universal Case Selector for All Training Modes
// ========================================

const CaseSelector = {
    // Storage keys for different training modes
    storageKeys: {
        solves: 'sq1TrainingSelectedCases',
        memo: 'sq1MemoSelectedCases'
    },
    
    // Load selected cases for a specific mode
    load(mode) {
        const key = this.storageKeys[mode];
        if (!key) return [];
        
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error(`Error loading ${mode} selected cases:`, e);
                return [];
            }
        }
        return [];
    },
    
    // Save selected cases for a specific mode
    save(mode, selectedCases) {
        const key = this.storageKeys[mode];
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(selectedCases));
    },
    
    // Get all valid cases from STATE
    getAllCases() {
        const allCases = [];
        STATE.cards.forEach((card, cardIdx) => {
            if (!card.cases) return;
            card.cases.forEach((caseItem, caseIdx) => {
                // Skip cases with no algorithm
                if (!caseItem.solution || 
                    caseItem.solution.trim() === '' || 
                    caseItem.solution.toLowerCase() === 'no algorithm') {
                    return;
                }
                const angleName = `angle${caseIdx + 1}`;
                const displayName = caseItem.customName ? `${angleName} - ${caseItem.customName}` : angleName;
                allCases.push({
                    cardIdx,
                    caseIdx,
                    cardTitle: card.title || 'Untitled',
                    parity: caseItem.type === 'parity' ? 'Odd' : 'Even',
                    orientation: caseItem.variant === 'original' ? 'Original' : 'Mirror',
                    algorithm: caseItem.solution || 'No algorithm',
                    caseName: displayName
                });
            });
        });
        return allCases;
    },
    
    // Get random case from selected cases
    getRandomCase(mode) {
        const selectedCases = this.load(mode);
        if (selectedCases.length === 0) return null;
        
        const randomKey = selectedCases[Math.floor(Math.random() * selectedCases.length)];
        const [cardIdx, caseIdx] = randomKey.split('-').map(Number);
        
        return {
            cardIdx,
            caseIdx,
            card: STATE.cards[cardIdx],
            caseItem: STATE.cards[cardIdx].cases[caseIdx]
        };
    },
    
    // Open case selection modal
    openModal(mode, onSave) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';

        const selectedCases = this.load(mode);
        const allCases = this.getAllCases();
        
        // Mark selected cases
        allCases.forEach(c => {
            c.selected = selectedCases.includes(`${c.cardIdx}-${c.caseIdx}`);
        });

        function renderTable(searchQuery = '') {
            const filtered = searchQuery 
                ? allCases.filter(c => c.cardTitle.toLowerCase().includes(searchQuery.toLowerCase()))
                : allCases;
                
            const parityEnabled = STATE.settings.divisionSettings?.byParity !== false;
            const orientationEnabled = STATE.settings.divisionSettings?.byOrientation !== false;
            const colspan = 4 + (parityEnabled ? 1 : 0) + (orientationEnabled ? 1 : 0);
                
            let html = '';
            filtered.forEach((caseData) => {
                html += `
                    <tr>
                        <td style="text-align:center;">
                            <input type="checkbox" ${caseData.selected ? 'checked' : ''} 
                                   onchange="window._caseSelectorToggle(${caseData.cardIdx}, ${caseData.caseIdx}, this.checked)">
                        </td>
                        <td>${caseData.cardTitle}</td>
                        ${parityEnabled ? `<td>${caseData.parity}</td>` : ''}
                        ${orientationEnabled ? `<td>${caseData.orientation}</td>` : ''}
                        <td>${caseData.caseName}</td>
                        <td style="font-family:monospace;font-size:11px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${caseData.algorithm}</td>
                    </tr>
                `;
            });
            return html || `<tr><td colspan="${colspan}" style="text-align:center;color:#999;padding:20px;">No cases found</td></tr>`;
        }

        modal.innerHTML = `
            <div class="modal-content" style="max-width:90vw;max-height:90vh;">
                <div class="modal-header">
                    <h3>Select Cases for Training</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body" style="overflow:auto;">
                    <div style="margin-bottom:15px;">
                        <input type="text" id="caseSelectorSearchInput" class="settings-input" 
                               placeholder="Search by card name..." style="width:100%;padding:8px;margin-bottom:10px;">
                    </div>
                    <div style="margin-bottom:15px;display:flex;gap:10px;">
                        <button class="btn" onclick="window._caseSelectorSelectAll()">Select All</button>
                        <button class="btn" onclick="window._caseSelectorDeselectAll()">Deselect All</button>
                    </div>
                    <div style="overflow-x:auto;">
                        <table class="variable-table" style="min-width:800px;">
                            <thead>
                                <tr>
                                    <th style="width:60px;text-align:center;">Select</th>
                                    <th style="width:150px;">Card Name</th>
                                    ${STATE.settings.divisionSettings?.byParity !== false ? '<th style="width:80px;">Parity</th>' : ''}
                                    ${STATE.settings.divisionSettings?.byOrientation !== false ? '<th style="width:100px;">Orientation</th>' : ''}
                                    <th style="width:80px;">Angle</th>
                                    <th>Algorithm</th>
                                </tr>
                            </thead>
                            <tbody id="caseSelectorTableBody">
                                ${renderTable()}
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top:15px;">
                        <button class="btn btn-primary" onclick="window._caseSelectorSave()">Done</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup event handlers
        document.getElementById('caseSelectorSearchInput').addEventListener('input', (e) => {
            document.getElementById('caseSelectorTableBody').innerHTML = renderTable(e.target.value.toLowerCase());
        });

        window._caseSelectorToggle = function(cardIdx, caseIdx, selected) {
            const key = `${cardIdx}-${caseIdx}`;
            const caseData = allCases.find(c => c.cardIdx === cardIdx && c.caseIdx === caseIdx);
            if (caseData) caseData.selected = selected;
            
            const idx = selectedCases.indexOf(key);
            if (selected && idx === -1) {
                selectedCases.push(key);
            } else if (!selected && idx > -1) {
                selectedCases.splice(idx, 1);
            }
        };

        window._caseSelectorSelectAll = function() {
            selectedCases.length = 0;
            allCases.forEach(c => {
                c.selected = true;
                selectedCases.push(`${c.cardIdx}-${c.caseIdx}`);
            });
            const search = document.getElementById('caseSelectorSearchInput').value.toLowerCase();
            document.getElementById('caseSelectorTableBody').innerHTML = renderTable(search);
        };

        window._caseSelectorDeselectAll = function() {
            selectedCases.length = 0;
            allCases.forEach(c => c.selected = false);
            const search = document.getElementById('caseSelectorSearchInput').value.toLowerCase();
            document.getElementById('caseSelectorTableBody').innerHTML = renderTable(search);
        };

        window._caseSelectorSave = function() {
            CaseSelector.save(mode, selectedCases);
            modal.remove();
            if (onSave) onSave(selectedCases);
            
            delete window._caseSelectorToggle;
            delete window._caseSelectorSelectAll;
            delete window._caseSelectorDeselectAll;
            delete window._caseSelectorSave;
        };

        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
};

// Export
if (typeof window !== 'undefined') {
    window.CaseSelector = CaseSelector;
}