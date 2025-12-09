function openSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
                <div class="modal-content" style="max-width:500px;max-height:80vh;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
                    <div class="modal-header">
    <div style="display:flex;align-items:center;gap:10px;">
        <h3 style="margin:0;">Settings</h3>
        <button class="icon-btn" onclick="openSettingsInstructionModal()" title="Settings Help" style="width:24px;height:24px;">
            <img src="res/instruction.svg" style="width:12px;height:12px;">
        </button>
    </div>
    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
</div>
                    <div class="modal-body">
                        <div class="settings-group">
                            <label class="settings-label">Image Size</label>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <input type="range" min="100" max="400" value="${STATE.settings.imageSize}" 
                                       oninput="this.nextElementSibling.textContent = this.value + 'px'; STATE.settings.imageSize = parseInt(this.value); saveState();"
                                       style="flex:1;">
                                <span style="min-width:60px;text-align:right;">${STATE.settings.imageSize}px</span>
                            </div>
                        </div>
                        <div class="settings-group">
                            <label class="settings-label">
                                <input type="checkbox" ${STATE.settings.enableLabels ? 'checked' : ''} 
                                       onchange="STATE.settings.enableLabels = this.checked; saveState(); if (typeof updatePeekButtonVisibility === 'function') updatePeekButtonVisibility();" 
                                       style="margin-right:5px;">
                                Enable Letter/Number Labels
                            </label>
                        </div>
                        <div class="settings-group">
                            <button class="btn btn-primary" style="width:100%;margin-bottom:8px;" onclick="this.closest('.modal').remove(); openColorMappingModal();">Configure Color Mappings</button>
                            <button class="btn btn-primary" style="width:100%;margin-bottom:8px;" onclick="this.closest('.modal').remove(); openDefaultTrackedPiecesModal();">Default Tracked Pieces</button>
                        </div>
                        <div class="settings-group" style="border-top:1px solid #ddd;padding-top:15px;">
                            <button class="btn" style="width:100%;margin-bottom:8px;" onclick="exportData()">Export Data</button>
                            <button class="btn" style="width:100%;" onclick="document.getElementById('importFile').click()">Import Data</button>
                            <input type="file" id="importFile" style="display:none;" onchange="importData(this)">
                        </div>
                    </div>
                </div>
            `;
    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}


function openColorMappingModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    // Backup original state
    const originalColorMappings = JSON.parse(JSON.stringify(STATE.settings.colorMappings));

    let mappingsHtml = '';
    const displayOrder = ['UBL', 'UB', 'URB', 'UR', 'UFR', 'UF', 'ULF', 'UL', 'DLF', 'DF', 'DFR', 'DR', 'DRB', 'DB', 'DLB', 'DL'];
    displayOrder.forEach(pieceCode => {
        const i = STATE.settings.colorMappings.findIndex(m => m.pieceCode === pieceCode);
        if (i === -1) return;
        const m = STATE.settings.colorMappings[i];
        mappingsHtml += `
                    <div class="color-mapping-row" style="display:grid;grid-template-columns:60px 1fr 80px;gap:8px;align-items:center;padding:8px;border-bottom:1px solid #eee;">
                        <div style="font-weight:600;font-size:13px;">${m.pieceCode || 'N/A'}</div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <label style="font-size:12px;min-width:40px;">Label:</label>
                            <input type="text" value="${m.label || ''}" placeholder="Label" 
                                   onchange="updateColorMapping(${i}, 'label', this.value)"
                                   style="width:60px;padding:4px;border:1px solid #ccc;font-size:12px;">
                        </div>
                        <input type="color" value="${m.color}" 
                               onchange="updateColorMapping(${i}, 'color', this.value)"
                               style="width:100%;height:32px;border:1px solid #ccc;cursor:pointer;">
                    </div>
                `;
    });

    modal.innerHTML = `
                <div class="modal-content" style="max-width:450px;">
                    <div class="modal-header">
                        <h3>Color Mappings</h3>
                        <button class="close-btn" onclick="window.discardColorMappings()">×</button>
                    </div>
                    <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
                        <p style="margin-bottom:15px;font-size:13px;color:#666;">Configure colors and labels for each piece position</p>
                        <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:4px;">
                            ${mappingsHtml}
                        </div>
                        <div style="margin-top:15px;display:flex;gap:10px;">
                            <button class="btn btn-primary" onclick="window.saveColorMappings()">Save</button>
                            <button class="btn" onclick="window.discardColorMappings()">Discard</button>
                        </div>
                    </div>
                </div>
            `;
    document.body.appendChild(modal);

    window.saveColorMappings = function () {
        saveState();
        modal.remove();
        // Update all card previews
        const searchInput = document.getElementById('cardSearchInput');
        const searchQuery = searchInput ? searchInput.value : '';
        renderCards(searchQuery);
    };

    window.discardColorMappings = function () {
        STATE.settings.colorMappings = originalColorMappings;
        modal.remove();
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            window.discardColorMappings();
        }
    };
}

function updateColorMapping(idx, field, value) {
    STATE.settings.colorMappings[idx][field] = value;
    saveState();
}

function openDefaultTrackedPiecesModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    const pieces = ['UB', 'UBL', 'UL', 'ULF', 'UF', 'UFR', 'UR', 'URB', 'DR', 'DRB', 'DF', 'DFR', 'DL', 'DLF', 'DB', 'DLB'];
    
    // Backup original state
    const originalTrackedPieces = [...STATE.settings.defaultTrackedPieces];

    function renderDefaultPieceGrid() {
        let html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
        pieces.forEach(piece => {
            const isTracked = STATE.settings.defaultTrackedPieces.includes(piece);
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === piece);
            const bgColor = isTracked && mapping ? mapping.color : '#fff';
            const borderColor = isTracked ? '#333' : '#ccc';
            const fontWeight = isTracked ? '600' : '400';

            // Calculate text color based on background brightness
            let textColor = '#000';
            if (isTracked && mapping) {
                const rgb = mapping.color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
                if (rgb) {
                    const r = parseInt(rgb[1], 16) / 255;
                    const g = parseInt(rgb[2], 16) / 255;
                    const b = parseInt(rgb[3], 16) / 255;
                    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    textColor = luminance > 0.5 ? '#000' : '#fff';
                }
            }
            
            html += `
                        <button onclick="toggleDefaultTrackedPiece('${piece}')" 
                                style="padding:12px;border:2px solid ${borderColor};background:${bgColor};color:${textColor};cursor:pointer;font-size:13px;font-weight:${fontWeight};transition:all 0.2s;">
                            ${piece}
                        </button>
                    `;
        });
        html += '</div>';
        return html;
    }

    modal.innerHTML = `
                <div class="modal-content" style="max-width:450px;">
                    <div class="modal-header">
                        <h3>Default Tracked Pieces</h3>
                        <button class="close-btn" onclick="window.discardDefaultTrackedPieces()">×</button>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom:15px;font-size:13px;color:#666;">Select pieces to track by default. Individual cases can override this.</p>
                        <div id="default-piece-grid">
                            ${renderDefaultPieceGrid()}
                        </div>
                        <div style="margin-top:15px;display:flex;gap:10px;">
                            <button class="btn btn-primary" onclick="window.saveDefaultTrackedPieces()">Save</button>
                            <button class="btn" onclick="window.discardDefaultTrackedPieces()">Discard</button>
                        </div>
                    </div>
                </div>
            `;

    document.body.appendChild(modal);

    window.saveDefaultTrackedPieces = function () {
        saveState();
        modal.remove();
        // Update all card previews
        const searchInput = document.getElementById('cardSearchInput');
        const searchQuery = searchInput ? searchInput.value : '';
        renderCards(searchQuery);
    };

    window.discardDefaultTrackedPieces = function () {
        STATE.settings.defaultTrackedPieces = originalTrackedPieces;
        modal.remove();
    };

    window.toggleDefaultTrackedPiece = function (piece) {
        const index = STATE.settings.defaultTrackedPieces.indexOf(piece);
        if (index > -1) {
            STATE.settings.defaultTrackedPieces.splice(index, 1);
        } else {
            STATE.settings.defaultTrackedPieces.push(piece);
        }
        saveState();
        document.getElementById('default-piece-grid').innerHTML = renderDefaultPieceGrid();
    };

    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}


function exportData() {
    // Include training settings from localStorage
    const exportData = {
        ...STATE,
        trainingSettings: loadTrainingSettings(),
        memoTrainingSettings: JSON.parse(localStorage.getItem('sq1MemoTrainingSettings') || '{}'),
        memoSelectedCases: JSON.parse(localStorage.getItem('sq1MemoSelectedCases') || '[]')
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sq1-co-tracker-data.json';
    a.click();
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            
            // Import training settings if present
            if (imported.trainingSettings) {
                localStorage.setItem('sq1TrainingSettings', JSON.stringify(imported.trainingSettings));
                delete imported.trainingSettings;
            }
            
            if (imported.memoTrainingSettings) {
                localStorage.setItem('sq1MemoTrainingSettings', JSON.stringify(imported.memoTrainingSettings));
                delete imported.memoTrainingSettings;
            }
            
            if (imported.memoSelectedCases) {
                localStorage.setItem('sq1MemoSelectedCases', JSON.stringify(imported.memoSelectedCases));
                delete imported.memoSelectedCases;
            }
            
            // Import main state
            Object.assign(STATE, imported);
            saveState();
            renderCards();
            showConfirmModal('Import Success', 'Data imported successfully!', () => { });
        } catch (err) {
            showConfirmModal('Import Error', 'Error importing data: ' + err.message, () => { });
        }
    };
    reader.readAsText(file);
}