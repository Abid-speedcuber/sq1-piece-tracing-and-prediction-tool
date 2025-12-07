function showInputModal(title, message, defaultValue, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    const tempId = 'temp-input-' + Date.now();

    modal.innerHTML = `
                <div class="modal-content" style="max-width:400px;height:auto;">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="close-btn" id="${tempId}-cancel">×</button>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom:10px;">${message}</p>
                        <input type="text" id="${tempId}-input" class="settings-input" value="${defaultValue}" style="margin-bottom:15px;">
                        <button class="btn btn-primary" id="${tempId}-ok">OK</button>
                        <button class="btn" id="${tempId}-cancel2">Cancel</button>
                    </div>
                </div>
            `;

    document.body.appendChild(modal);
    const input = document.getElementById(tempId + '-input');
    const okBtn = document.getElementById(tempId + '-ok');
    const cancelBtn = document.getElementById(tempId + '-cancel');
    const cancelBtn2 = document.getElementById(tempId + '-cancel2');

    input.focus();
    input.select();

    const handleOk = () => {
        const value = input.value;
        modal.remove();
        onConfirm(value);
    };

    const handleCancel = () => {
        modal.remove();
    };

    okBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleOk();
    };

    cancelBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
    };

    cancelBtn2.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal) handleCancel();
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleOk();
        }
    });
}

function showTwoInputModal(title, label1, label2, default1, default2, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;max-height:80vh;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <label style="display:block;margin-bottom:5px;font-weight:600;">${label1}</label>
                <input type="text" id="modalInput1" class="settings-input" value="${default1}" style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;font-weight:600;">${label2}</label>
                <input type="text" id="modalInput2" class="settings-input" value="${default2}" style="margin-bottom:15px;font-family:monospace;">
                <button class="btn btn-primary" id="twoInputOkBtn">OK</button>
                <button class="btn" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const input1 = document.getElementById('modalInput1');
    const input2 = document.getElementById('modalInput2');
    const okBtn = document.getElementById('twoInputOkBtn');

    input1.focus();
    input1.select();

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    const handleConfirm = () => {
        onConfirm(input1.value, input2.value);
        modal.remove();
    };

    okBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleConfirm();
    };

    input2.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        }
    });
}

function showThreeButtonModal(title, message, btn1Text, btn1Action, btn2Text, btn2Action, btn3Text, btn3Action) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    const tempId = 'temp-three-btn-' + Date.now();

    modal.innerHTML = `
                <div class="modal-content" style="max-width:400px;height:auto;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
                    <div class="modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom:15px;">${message}</p>
                        <div style="display:flex;gap:8px;justify-content:center;">
                            <button class="btn btn-primary" id="${tempId}-btn1">${btn1Text}</button>
                            <button class="btn" id="${tempId}-btn2">${btn2Text}</button>
                            <button class="btn" id="${tempId}-btn3">${btn3Text}</button>
                        </div>
                    </div>
                </div>
            `;

    document.body.appendChild(modal);

    const btn1 = document.getElementById(tempId + '-btn1');
    const btn2 = document.getElementById(tempId + '-btn2');
    const btn3 = document.getElementById(tempId + '-btn3');

    btn1.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.remove();
        btn1Action();
    };

    btn2.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.remove();
        btn2Action();
    };

    btn3.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.remove();
        btn3Action();
    };
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:400px;height:auto;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom:15px;">${message}</p>
                <button class="btn btn-primary" id="confirmOkBtn">Confirm</button>
                <button class="btn" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const confirmBtn = document.getElementById('confirmOkBtn');

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    const handleConfirm = () => {
        onConfirm();
        modal.remove();
    };

    confirmBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleConfirm();
    };
}

const STATE = {
    cards: [],
    variables: {},
    settings: {
        imageSize: 200,
        defaultTrackedPieces: ['UB', 'UBL', 'UL', 'ULF', 'UF', 'UFR', 'UR', 'URB', 'DR', 'DRB', 'DF', 'DFR', 'DL', 'DLF', 'DB', 'DLB'],
        colorMappings: [
            { hex: '0', pieceCode: 'UB', color: '#8FB6FF', label: '2' },
            { hex: '1', pieceCode: 'UBL', color: '#8FCFFF', label: '1' },
            { hex: '2', pieceCode: 'UL', color: '#8FE8FF', label: '8' },
            { hex: '3', pieceCode: 'ULF', color: '#8FFFF4', label: '7' },
            { hex: '4', pieceCode: 'UF', color: '#8FFFBD', label: '6' },
            { hex: '5', pieceCode: 'UFR', color: '#A6FF8F', label: '5' },
            { hex: '6', pieceCode: 'UR', color: '#D4FF8F', label: '4' },
            { hex: '7', pieceCode: 'URB', color: '#F7FF8F', label: '3' },
            { hex: '8', pieceCode: 'DR', color: '#FFDE8F', label: '4' },
            { hex: '9', pieceCode: 'DRB', color: '#FFF78F', label: '5' },
            { hex: 'a', pieceCode: 'DF', color: '#FFAE8F', label: '2' },
            { hex: 'b', pieceCode: 'DFR', color: '#FFC68F', label: '3' },
            { hex: 'c', pieceCode: 'DL', color: '#FF808F', label: '8' },
            { hex: 'd', pieceCode: 'DLF', color: '#FF978F', label: '1' },
            { hex: 'e', pieceCode: 'DB', color: '#FF4747', label: '7' },
            { hex: 'f', pieceCode: 'DLB', color: '#FF6969', label: '6' }
        ],
        enableLabels: true
    },
    editMode: false,
    history: [],
    historyIndex: -1
};

function saveToHistory() {
    const snapshot = JSON.stringify({ cards: STATE.cards });
    STATE.history = STATE.history.slice(0, STATE.historyIndex + 1);
    STATE.history.push(snapshot);
    STATE.historyIndex++;
    if (STATE.history.length > 50) {
        STATE.history.shift();
        STATE.historyIndex--;
    }
}

function undo() {
    if (STATE.historyIndex > 0) {
        STATE.historyIndex--;
        const snapshot = JSON.parse(STATE.history[STATE.historyIndex]);
        STATE.cards = snapshot.cards;
        saveState();
        renderCards();
    }
}

function redo() {
    if (STATE.historyIndex < STATE.history.length - 1) {
        STATE.historyIndex++;
        const snapshot = JSON.parse(STATE.history[STATE.historyIndex]);
        STATE.cards = snapshot.cards;
        saveState();
        renderCards();
    }
}

function saveState() {
    const stateToSave = { ...STATE };
    // Don't persist edit mode or history
    delete stateToSave.editMode;
    delete stateToSave.history;
    delete stateToSave.historyIndex;
    localStorage.setItem('sq1CoTrackerState', JSON.stringify(stateToSave));
}

function loadState() {
    const saved = localStorage.getItem('sq1CoTrackerState');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(STATE, parsed);

        // Clean up old inputType fields from cases (no longer used)
        if (STATE.cards) {
            STATE.cards.forEach(card => {
                if (card.cases) {
                    card.cases.forEach(caseItem => {
                        delete caseItem.inputType;
                    });
                }
            });
        }

        // Ensure colorMappings have pieceCode field and all 16 mappings exist
        if (STATE.settings && STATE.settings.colorMappings) {
            const defaultMappings = [
                { hex: '0', pieceCode: 'UB', color: '#90EE90', label: '1' },
                { hex: '1', pieceCode: 'UBL', color: '#90EE90', label: 'A' },
                { hex: '2', pieceCode: 'UL', color: '#FFB6C1', label: '2' },
                { hex: '3', pieceCode: 'ULF', color: '#FFB6C1', label: 'B' },
                { hex: '4', pieceCode: 'UF', color: '#ADD8E6', label: '3' },
                { hex: '5', pieceCode: 'UFR', color: '#ADD8E6', label: 'C' },
                { hex: '6', pieceCode: 'UR', color: '#FFD8A8', label: '4' },
                { hex: '7', pieceCode: 'URB', color: '#FFD8A8', label: 'D' },
                { hex: '8', pieceCode: 'DR', color: '#FFB3BA', label: '5' },
                { hex: '9', pieceCode: 'DRB', color: '#FFB3BA', label: 'E' },
                { hex: 'a', pieceCode: 'DF', color: '#F5DEB3', label: '6' },
                { hex: 'b', pieceCode: 'DFR', color: '#F5DEB3', label: 'F' },
                { hex: 'c', pieceCode: 'DL', color: '#E8D4A0', label: '7' },
                { hex: 'd', pieceCode: 'DLF', color: '#E8D4A0', label: 'G' },
                { hex: 'e', pieceCode: 'DB', color: '#FFFFE0', label: '8' },
                { hex: 'f', pieceCode: 'DLB', color: '#FFFFE0', label: 'H' }
            ];

            // If we have fewer than 16 mappings, reset to defaults
            if (STATE.settings.colorMappings.length < 16) {
                STATE.settings.colorMappings = defaultMappings;
            } else {
                STATE.settings.colorMappings.forEach((mapping, i) => {
                    if (!mapping.pieceCode && defaultMappings[i]) {
                        mapping.pieceCode = defaultMappings[i].pieceCode;
                    }
                });
            }
        }

        // Ensure defaultTrackedPieces exists
        if (!STATE.settings.defaultTrackedPieces) {
            STATE.settings.defaultTrackedPieces = [];
        }
    }
}

function renderCards() {
    const grid = document.getElementById('cardsGrid');
    const empty = document.getElementById('emptyState');

    if (STATE.cards.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';
    grid.innerHTML = '';

    STATE.cards.forEach((card, idx) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.style.position = 'relative';
        cardEl.draggable = STATE.editMode;

        cardEl.innerHTML = `
    ${STATE.editMode ? `<button class="card-delete-btn" onclick="deleteCard(${idx}, event)"><img src="res/delete.svg" style="width:14px;height:14px;"></button>` : ''}
    <div class="card-title">${card.title || 'Anonymous Case'}</div>
    <div class="card-preview">${card.cases?.length || 0} entries</div>
`;

        if (!STATE.editMode) {
            cardEl.onclick = () => openCardModal(idx);
        } else {
            cardEl.style.cursor = 'move';

            cardEl.ondragstart = (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', idx);
                cardEl.style.opacity = '0.5';
            };

            cardEl.ondragend = (e) => {
                cardEl.style.opacity = '1';
            };

            cardEl.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            };

            cardEl.ondrop = (e) => {
                e.preventDefault();
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                const toIdx = idx;
                if (fromIdx !== toIdx) {
                    saveToHistory();
                    const [moved] = STATE.cards.splice(fromIdx, 1);
                    STATE.cards.splice(toIdx, 0, moved);
                    saveState();
                    renderCards();
                }
            };

            // Touch support
            let touchStartY = 0;
            let touchStartIdx = -1;

            cardEl.ontouchstart = (e) => {
                touchStartY = e.touches[0].clientY;
                touchStartIdx = idx;
                cardEl.style.opacity = '0.5';
            };

            cardEl.ontouchmove = (e) => {
                e.preventDefault();
            };

            cardEl.ontouchend = (e) => {
                cardEl.style.opacity = '1';
                const touchEndY = e.changedTouches[0].clientY;
                const deltaY = touchEndY - touchStartY;

                if (Math.abs(deltaY) > 50) {
                    const moveBy = Math.round(deltaY / 100);
                    const newIdx = Math.max(0, Math.min(STATE.cards.length - 1, touchStartIdx + moveBy));
                    if (newIdx !== touchStartIdx) {
                        saveToHistory();
                        const [moved] = STATE.cards.splice(touchStartIdx, 1);
                        STATE.cards.splice(newIdx, 0, moved);
                        saveState();
                        renderCards();
                    }
                }
            };
        }

        grid.appendChild(cardEl);
    });
}
function openCardModal(cardIdx) {
    const card = STATE.cards[cardIdx];
    if (!card.viewState) card.viewState = { parity: 'odd', orientation: 'original' };

    // Reset session overrides for all cases when modal opens
    if (card.cases) {
        card.cases.forEach(caseItem => {
            delete caseItem.sessionOverrideTracking;
            delete caseItem.sessionTrackedPieces;
        });
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="width:100vw;height:100vh;max-width:100vw;margin:0;border:none;border-radius:0;">
            <div class="modal-header" style="background:#333;color:#fff;display:flex;justify-content:space-between;align-items:center;">
<div style="display:flex;align-items:center;gap:10px;">
    <h3 style="color:#fff;margin:0;">${card.title || 'Untitled Case'}</h3>
    <button class="icon-btn" onclick="openCardInstructionModal()" title="Help" style="width:24px;height:24px;background:#555;">
        <img src="res/white-instruction.svg" style="width:12px;height:12px;">
    </button>
</div>
<button class="close-btn" onclick="this.closest('.modal').remove()" style="color:#fff;">×</button>
            </div>
            <div class="modal-body" style="padding:20px;width:100%;box-sizing:border-box;overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none;">
                <div style="display:flex;gap:40px;margin-bottom:20px;padding:10px 0;align-items:center;">
                    <div style="display:flex;align-items:center;gap:15px;">
                        <label style="font-weight:600;">Parity:</label>
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <input type="radio" name="parity-${cardIdx}" value="odd" ${card.viewState.parity === 'odd' ? 'checked' : ''} onchange="updateCardView(${cardIdx}, 'parity', 'odd')">
                            <span>Odd</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <input type="radio" name="parity-${cardIdx}" value="even" ${card.viewState.parity === 'even' ? 'checked' : ''} onchange="updateCardView(${cardIdx}, 'parity', 'even')">
                            <span>Even</span>
                        </label>
                    </div>
                    <div style="display:flex;align-items:center;gap:15px;">
                        <label style="font-weight:600;">Orientation:</label>
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <input type="radio" name="orientation-${cardIdx}" value="original" ${card.viewState.orientation === 'original' ? 'checked' : ''} onchange="updateCardView(${cardIdx}, 'orientation', 'original')">
                            <span>Original</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <input type="radio" name="orientation-${cardIdx}" value="mirror" ${card.viewState.orientation === 'mirror' ? 'checked' : ''} onchange="updateCardView(${cardIdx}, 'orientation', 'mirror')">
                            <span>Mirror</span>
                        </label>
                    </div>
                    <button class="btn btn-primary" onclick="addCase(${cardIdx})" style="margin-left:auto;padding:8px 16px;">
                        + Add Case
                    </button>
                </div>
                <div id="cases-container-${cardIdx}"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    renderCases(cardIdx);

    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

function openCardInstructionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;max-height:80vh;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <div class="modal-header">
                <h3>Case View Instructions</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="line-height:1.8;overflow-y:auto;flex:1;">
                <ul style="padding-left:20px;">
                    <li style="margin-bottom:15px;"><strong>Show Actual State</strong> shows the algorithm on a real colored Square-1.</li>
                    <li style="margin-bottom:15px;"><strong>Change Tracked Pieces</strong> lets you see the angle from other perspectives.</li>
                    <li style="margin-bottom:15px;"><strong>Show Reference Scheme</strong> will show your letters on a square/square scramble.</li>
                    <li style="margin-bottom:15px;"><strong>Train This Angle</strong> will let you train that angle in exact parity and orientation.</li>
                </ul>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function updateCardView(cardIdx, field, value) {
    STATE.cards[cardIdx].viewState[field] = value;
    renderCases(cardIdx);
}

function switchCaseTab(btn, targetId) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const container = parent.parentElement;
    container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
}

function updateCaseInputType(cardIdx, caseIdx, type) {
    const caseItem = STATE.cards[cardIdx].cases[caseIdx];
    caseItem.inputType = type;
    saveState();
    renderCases(cardIdx);
}

function toggleShowActualState(cardIdx, caseIdx) {
    const caseItem = STATE.cards[cardIdx].cases[caseIdx];
    caseItem.showActualState = !caseItem.showActualState;
    saveState();
    generateCaseImage(cardIdx, caseIdx);
    renderCases(cardIdx);
}

function renderCases(cardIdx) {
    const card = STATE.cards[cardIdx];
    if (!card.cases) card.cases = [];
    if (!card.viewState) card.viewState = { parity: 'odd', orientation: 'original' };

    const type = card.viewState.parity === 'odd' ? 'parity' : 'nonparity';
    const variant = card.viewState.orientation;

    const container = document.getElementById(`cases-container-${cardIdx}`);
    if (!container) return;

    container.innerHTML = '';
    const cases = card.cases.filter(c => c.type === type && c.variant === variant);

    if (cases.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#999;font-size:14px;">No cases available. Click the + button to add a case.</div>';
        return;
    }

    cases.forEach((caseItem, caseIdx) => {
        const actualIdx = card.cases.indexOf(caseItem);
        if (!caseItem.overrideTracking) caseItem.overrideTracking = false;
        if (!caseItem.customTrackedPieces) caseItem.customTrackedPieces = [];
        if (!caseItem.editMode) caseItem.editMode = false;

        const effectiveTrackedPieces = caseItem.overrideTracking ? caseItem.customTrackedPieces : STATE.settings.defaultTrackedPieces;

        const caseCard = document.createElement('div');
        caseCard.style.cssText = 'border:1px solid #ddd;padding:15px;margin-bottom:15px;background:#fafafa;';

        // Solution is always stored as solution (already inverted if it was a scramble)
        const normalizedSolution = window.ScrambleNormalizer.normalizeScramble(caseItem.solution || '');
        const setupMoves = pleaseInvertThisScrambleForSolutionVisualization(normalizedSolution);

        caseCard.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <strong style="font-size:16px;">Angle ${caseIdx + 1}</strong>
        <button class="icon-btn" style="width:32px;height:32px;" onclick="toggleCaseEditMode(${cardIdx}, ${actualIdx})" title="Edit">
            <img src="res/edit.svg" style="width:16px;height:16px;">
        </button>
    </div>
    <div class="case-layout" style="display:grid;grid-template-columns:auto 1fr;gap:15px;align-items:start;">
        <div style="display:flex;flex-direction:column;gap:10px;">
            <div id="case-image-${cardIdx}-${actualIdx}" style="display:flex;align-items:center;justify-content:center;">
                ${caseItem.imageHtml || '<span style="color:#999;font-size:12px;">Generating...</span>'}
            </div>
        </div>
        <div>
            <div style="margin-bottom:4px;">
                <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Algorithm:</div>
                <div style="font-family:monospace;font-size:14px;background:transparent;word-break:break-all;">
                    ${caseItem.solution || '<span style="color:#999;">No solution</span>'}
                </div>
            </div>
            <div style="margin-bottom:12px;">
                <div style="font-family:monospace;font-size:10px;color:#999;word-break:break-all;">
                    ${highlightVariablesInNormalized(caseItem.solution || '')}
                </div>
            </div>
            <div style="margin-bottom:12px;padding-top:8px;border-top:1px solid #eee;">
                <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Setup Moves:</div>
                <div style="font-family:monospace;font-size:12px;color:#666;word-break:break-all;">
                    ${setupMoves || '<span style="color:#999;">No setup moves</span>'}
                </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px;">
                <button class="btn ${caseItem.showActualState ? 'btn-primary' : ''}" onclick="toggleShowActualState(${cardIdx}, ${actualIdx})" style="padding:6px 12px;font-size:13px;">Show Actual State</button>
                <button class="btn" onclick="openTrackPiecesPopup(event, ${cardIdx}, ${actualIdx})" style="padding:6px 12px;font-size:13px;">Change Tracked Pieces</button>
                <button class="btn" onclick="openReferenceSchemePopup(event, ${cardIdx}, ${actualIdx})" style="padding:6px 12px;font-size:13px;">Show Reference Scheme</button>
                <button class="btn" onclick="openCOTrackerTrainingModal(${cardIdx}, ${actualIdx})" style="padding:6px 12px;font-size:13px;">Train This Case</button>
            </div>
        </div>
    </div>
`;
        container.appendChild(caseCard);

        setTimeout(() => generateCaseImage(cardIdx, actualIdx), 100);
    });
}

function highlightVariablesInNormalized(solution) {
    if (!solution) return '';

    // Normalize using the new module
    let normalized = window.ScrambleNormalizer.normalizeScramble(solution);

    // Remove all whitespace for display
    return normalized.replace(/\s+/g, '');
}

function renderPieceGrid(cardIdx, caseIdx, trackedPieces) {
    const pieces = ['UB', 'UBL', 'UL', 'ULF', 'UF', 'UFR', 'UR', 'URB', 'DR', 'DRB', 'DF', 'DFR', 'DL', 'DLF', 'DB', 'DLB'];
    let html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">';
    pieces.forEach(piece => {
        const isTracked = trackedPieces.includes(piece);
        const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === piece);
        const bgColor = isTracked && mapping ? mapping.color : '#fff';
        const borderColor = isTracked ? '#333' : '#ccc';
        const fontWeight = isTracked ? '600' : '400';

        html += `
                    <button onclick="toggleCustomPieceTracking(${cardIdx}, ${caseIdx}, '${piece}')" 
                            style="padding:8px 12px;border:2px solid ${borderColor};background:${bgColor};cursor:pointer;font-size:12px;font-weight:${fontWeight};transition:all 0.2s;">
                        ${piece}
                    </button>
                `;
    });
    html += '</div>';
    return html;
}

function toggleCaseEditMode(cardIdx, caseIdx) {
    openCaseEditModal(cardIdx, caseIdx);
}

function openCaseEditModal(cardIdx, caseIdx) {
    const caseItem = STATE.cards[cardIdx].cases[caseIdx];

    // Create backup
    const editBackup = JSON.parse(JSON.stringify({
        solution: caseItem.solution || '',
        inputType: caseItem.inputType || 'algorithm',
        overrideTracking: caseItem.overrideTracking || false,
        customTrackedPieces: caseItem.customTrackedPieces || []
    }));

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    function renderEditContent() {
        const currentSolution = caseItem.solution || '';
        const currentInputType = 'algorithm'; // Always default to algorithm - inputType is not persisted
        const currentOverride = caseItem.overrideTracking || false;
        const currentCustomPieces = caseItem.customTrackedPieces || [];

        return `
                    <div class="modal-content" style="max-width:800px;">
                        <div class="modal-header" style="background:#333;color:#fff;">
<div style="display:flex;align-items:center;gap:10px;">
    <h3 style="color:#fff;margin:0;">Edit Angle ${caseIdx + 1}</h3>
    <button class="icon-btn" onclick="openEditInstructionModal()" title="Help" style="width:24px;height:24px;background:#555;">
        <img src="res/instruction.svg" style="width:12px;height:12px;">
    </button>
</div>
<button class="close-btn" onclick="window.cancelCaseEditModal()" style="color:#fff;">×</button>
                        </div>
                        <div class="modal-body" style="padding:20px;">
                            <div style="display:grid;grid-template-columns:auto 1fr;gap:20px;margin-bottom:15px;">
                                <div>
                                    <div id="edit-case-image-${cardIdx}-${caseIdx}" style="display:flex;align-items:center;justify-content:center;">
                                        ${caseItem.imageHtml || '<span style="color:#999;font-size:12px;">Generating...</span>'}
                                    </div>
                                </div>
                                <div>
                                    <div style="margin-bottom:15px;">
                                <div style="display:flex;gap:15px;margin-bottom:8px;">
                                    <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                        <input type="radio" name="edit-input-type" value="algorithm" ${currentInputType === 'algorithm' ? 'checked' : ''} onchange="window.updateEditInputType('algorithm')">
                                        <span style="font-size:13px;font-weight:600;">Insert Algorithm</span>
                                    </label>
                                    <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                        <input type="radio" name="edit-input-type" value="scramble" ${currentInputType === 'scramble' ? 'checked' : ''} onchange="window.updateEditInputType('scramble')">
                                        <span style="font-size:13px;font-weight:600;">Insert Scramble</span>
                                    </label>
                                </div>
                                <input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="edit-solution-input" class="algo-input" 
                                       placeholder="${currentInputType === 'scramble' ? 'Enter scramble (will be inverted)' : 'Enter solution (use *varName* or <varName>)'}" 
                                       value="${currentSolution}"
                                       oninput="console.log('RAW INPUT:', this.value); console.log('CHAR CODES:', [...this.value].map((c,i) => '['+i+'] '+c+' ('+c.charCodeAt(0)+')').join(' | ')); window.updateEditSolution(this.value)"
                                       style="width:100%;padding:8px;border:1px solid #ccc;font-size:13px;margin-bottom:6px;">
                                <div id="edit-normalized-preview" style="font-family:monospace;font-size:10px;color:#999;word-break:break-all;">
                                    ${highlightVariablesInNormalized(currentSolution)}
                                </div>
                            </div>
                            
                            <div style="margin-bottom:15px;">
                                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                    <input type="checkbox" id="edit-override-checkbox" ${currentOverride ? 'checked' : ''} 
                                           onchange="window.updateEditOverride(this.checked)">
                                    <span style="font-size:13px;font-weight:600;">Override Default Tracked Pieces</span>
                                </label>
                            </div>
                            
                            <div id="edit-piece-grid-container" style="${currentOverride ? '' : 'opacity:0.4;pointer-events:none;'}">
                                ${renderEditPieceGrid(currentCustomPieces)}
                            </div>
                            
                            <div style="margin-top:20px;display:flex;gap:10px;padding-top:15px;border-top:1px solid #ddd;">
                                <button class="btn btn-primary" onclick="window.saveCaseEditModal()" style="flex:1;">Save</button>
                                <button class="btn" onclick="window.deleteCaseFromEdit()" style="background:#f44336;color:#fff;border-color:#f44336;">Delete Case</button>
                                <button class="btn" onclick="window.cancelCaseEditModal()">Cancel</button>
                            </div>
                        </div>
                    </div>
                `;
    }

    function renderEditPieceGrid(trackedPieces) {
        const pieces = ['UB', 'UBL', 'UL', 'ULF', 'UF', 'UFR', 'UR', 'URB', 'DR', 'DRB', 'DF', 'DFR', 'DL', 'DLF', 'DB', 'DLB'];
        let html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">';
        pieces.forEach(piece => {
            const isTracked = trackedPieces.includes(piece);
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === piece);
            const bgColor = isTracked && mapping ? mapping.color : '#fff';
            const borderColor = isTracked ? '#333' : '#ccc';
            const fontWeight = isTracked ? '600' : '400';

            html += `
                        <button onclick="window.toggleEditPiece('${piece}')" 
                                style="padding:8px 12px;border:2px solid ${borderColor};background:${bgColor};cursor:pointer;font-size:12px;font-weight:${fontWeight};transition:all 0.2s;">
                            ${piece}
                        </button>
                    `;
        });
        html += '</div>';
        return html;
    }

    modal.innerHTML = renderEditContent();
    document.body.appendChild(modal);

    // Setup window functions for this edit session
    let tempInputMode = 'algorithm'; // Temporary state, not persisted

    window.updateEditInputType = function (type) {
        tempInputMode = type;
        const input = document.getElementById('edit-solution-input');
        if (input) {
            input.placeholder = type === 'scramble' ? 'Enter scramble (will be inverted)' : 'Enter solution (use *varName* or <varName>)';
        }
    };

    window.updateEditSolution = function (value) {
        // If input type is scramble, normalize first, then invert and store as solution
        if (tempInputMode === 'scramble' && value) {
            const normalized = window.ScrambleNormalizer.normalizeScramble(value);
            const inverted = pleaseInvertThisScrambleForSolutionVisualization(normalized);
            caseItem.solution = inverted;
        } else {
            caseItem.solution = value;
        }
        const preview = document.getElementById('edit-normalized-preview');
        if (preview) {
            preview.innerHTML = highlightVariablesInNormalized(caseItem.solution);
        }
        // Regenerate image with current solution
        window.regenerateEditImage();
    };

    window.regenerateEditImage = function () {
        const expandedSolution = window.ScrambleNormalizer.normalizeScramble(caseItem.solution || '');
        const effectiveTrackedPieces = caseItem.overrideTracking ? caseItem.customTrackedPieces : STATE.settings.defaultTrackedPieces;
        const scramble = pleaseInvertThisScrambleForSolutionVisualization(expandedSolution);

        const imageContainer = document.getElementById(`edit-case-image-${cardIdx}-${caseIdx}`);
        if (!imageContainer) return;

        if (!effectiveTrackedPieces || effectiveTrackedPieces.length === 0) {
            try {
                const html = window.Square1VisualizerLibraryWithSillyNames.visualizeCubeShapeOutlinesPlease(
                    scramble, STATE.settings.imageSize, 'transparent', 'transparent', 2, 5
                );
                imageContainer.innerHTML = html;
            } catch (e) {
                imageContainer.innerHTML = `<div style="color:#e53e3e;padding:10px;font-size:11px;">Error: ${e.message}</div>`;
            }
        } else {
            const pieces = effectiveTrackedPieces.map(code => {
                const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
                return mapping ? mapping.hex : code;
            });
            const colors = effectiveTrackedPieces.map(code => {
                const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
                return mapping ? mapping.color : '#ffb3d9';
            });
            const labels = STATE.settings.enableLabels ? effectiveTrackedPieces.map(code => {
                const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
                return mapping && mapping.label ? mapping.label : '';
            }) : null;

            try {
                const html = window.Square1VisualizerLibraryWithSillyNames.helpMeTrackAPiecePlease(
                    'scramble', scramble, pieces, STATE.settings.imageSize, '#ffffff', colors, 2, 5, labels
                );
                imageContainer.innerHTML = html;
            } catch (e) {
                imageContainer.innerHTML = `<div style="color:#e53e3e;padding:10px;font-size:11px;">Error: ${e.message}</div>`;
            }
        }
    };

    window.updateEditOverride = function (enabled) {
        caseItem.overrideTracking = enabled;
        const container = document.getElementById('edit-piece-grid-container');
        if (container) {
            container.style.opacity = enabled ? '1' : '0.4';
            container.style.pointerEvents = enabled ? 'auto' : 'none';
        }
        window.regenerateEditImage();
    };

    window.toggleEditPiece = function (piece) {
        if (!caseItem.customTrackedPieces) caseItem.customTrackedPieces = [];
        const index = caseItem.customTrackedPieces.indexOf(piece);
        if (index > -1) {
            caseItem.customTrackedPieces.splice(index, 1);
        } else {
            caseItem.customTrackedPieces.push(piece);
        }
        const container = document.getElementById('edit-piece-grid-container');
        if (container) {
            container.innerHTML = renderEditPieceGrid(caseItem.customTrackedPieces);
        }
        window.regenerateEditImage();
    };

    window.saveCaseEditModal = function () {
        saveState();
        modal.remove();
        renderCases(cardIdx);
        // Cleanup
        delete window.updateEditInputType;
        delete window.updateEditSolution;
        delete window.updateEditOverride;
        delete window.toggleEditPiece;
        delete window.regenerateEditImage;
        delete window.saveCaseEditModal;
        delete window.cancelCaseEditModal;
        delete window.deleteCaseFromEdit;
    };

    window.cancelCaseEditModal = function () {
        // Restore backup
        caseItem.solution = editBackup.solution;
        caseItem.inputType = editBackup.inputType;
        caseItem.overrideTracking = editBackup.overrideTracking;
        caseItem.customTrackedPieces = editBackup.customTrackedPieces;
        modal.remove();
        renderCases(cardIdx);
        // Cleanup
        delete window.updateEditInputType;
        delete window.updateEditSolution;
        delete window.updateEditOverride;
        delete window.toggleEditPiece;
        delete window.regenerateEditImage;
        delete window.saveCaseEditModal;
        delete window.cancelCaseEditModal;
        delete window.deleteCaseFromEdit;
    };

    window.deleteCaseFromEdit = function () {
        showConfirmModal('Delete Case', 'Are you sure you want to delete this case?', () => {
            STATE.cards[cardIdx].cases.splice(caseIdx, 1);
            saveState();
            modal.remove();
            renderCases(cardIdx);
            // Cleanup
            delete window.updateEditInputType;
            delete window.updateEditSolution;
            delete window.updateEditOverride;
            delete window.toggleEditPiece;
            delete window.regenerateEditImage;
            delete window.saveCaseEditModal;
            delete window.cancelCaseEditModal;
            delete window.deleteCaseFromEdit;
        });
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            window.cancelCaseEditModal();
        }
    };
}

function openEditInstructionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;max-height:80vh;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <div class="modal-header">
                <h3>Edit Mode Instructions</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="line-height:1.8;overflow-y:auto;flex:1;">
                <ol style="padding-left:20px;">
                    <li style="margin-bottom:15px;">You can use some weird notations for easier input: <span style="font-style:italic;color:#666;">(Instructions to be added by user)</span></li>
                    <li style="margin-bottom:15px;">If you insert scramble, it will automatically turn into the reversed algorithm the moment you save it.</li>
                    <li style="margin-bottom:15px;">Override default tracked pieces will let you use non-default tracing for this exact angle.</li>
                </ol>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function saveCaseEdit(cardIdx, caseIdx) {
    // This function is no longer used but kept for compatibility
}

function cancelCaseEdit(cardIdx, caseIdx) {
    // This function is no longer used but kept for compatibility
}

function confirmDeleteCase(cardIdx, caseIdx) {
    // This function is no longer used but kept for compatibility
}

function toggleOverrideTracking(cardIdx, caseIdx, enabled) {
    const caseItem = STATE.cards[cardIdx].cases[caseIdx];
    caseItem.overrideTracking = enabled;
    if (enabled && !caseItem.customTrackedPieces) {
        caseItem.customTrackedPieces = [];
    }
    saveState();

    // Just update the grid appearance without re-rendering
    const grid = document.getElementById(`override-pieces-${cardIdx}-${caseIdx}`);
    if (grid) {
        grid.style.opacity = enabled ? '1' : '0.4';
        grid.style.pointerEvents = enabled ? 'auto' : 'none';
    }

    generateCaseImage(cardIdx, caseIdx);
}

function toggleCustomPieceTracking(cardIdx, caseIdx, piece) {
    const caseItem = STATE.cards[cardIdx].cases[caseIdx];
    if (!caseItem.customTrackedPieces) caseItem.customTrackedPieces = [];

    const index = caseItem.customTrackedPieces.indexOf(piece);
    if (index > -1) {
        caseItem.customTrackedPieces.splice(index, 1);
    } else {
        caseItem.customTrackedPieces.push(piece);
    }

    saveState();

    const container = document.getElementById(`override-pieces-${cardIdx}-${caseIdx}`);
    if (container) {
        container.innerHTML = renderPieceGrid(cardIdx, caseIdx, caseItem.customTrackedPieces);
    }

    generateCaseImage(cardIdx, caseIdx);
}

function openTrackPiecesPopup(event, cardIdx, caseIdx) {
    event.stopPropagation();

    // Remove any existing popups
    document.querySelectorAll('.track-pieces-popup').forEach(p => p.remove());
    document.querySelectorAll('.reference-scheme-popup').forEach(p => p.remove());

    const caseItem = STATE.cards[cardIdx].cases[caseIdx];

    // Enable session override if not already enabled
    if (!caseItem.sessionOverrideTracking) {
        caseItem.sessionOverrideTracking = true;
        const defaultPieces = caseItem.overrideTracking ? caseItem.customTrackedPieces : STATE.settings.defaultTrackedPieces;
        caseItem.sessionTrackedPieces = [...defaultPieces];
    }

    const effectiveTrackedPieces = caseItem.sessionTrackedPieces;

    // Use session state
    let tempTrackedPieces = caseItem.sessionTrackedPieces;

    const popup = document.createElement('div');
    popup.className = 'track-pieces-popup';
    popup.style.cssText = 'position:fixed;background:#fff;border:1px solid #333;padding:15px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.15);max-width:320px;opacity:0;';
    popup.dataset.buttonSelector = `#case-image-${cardIdx}-${caseIdx}`;

    const pieces = ['UB', 'UBL', 'UL', 'ULF', 'UF', 'UFR', 'UR', 'URB', 'DR', 'DRB', 'DF', 'DFR', 'DL', 'DLF', 'DB', 'DLB'];

    function renderPieceButtons() {
        let piecesHtml = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">';
        pieces.forEach(piece => {
            const isTracked = tempTrackedPieces.includes(piece);
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === piece);
            const bgColor = isTracked && mapping ? mapping.color : '#fff';
            const borderColor = isTracked ? '#333' : '#ccc';
            const fontWeight = isTracked ? '600' : '400';

            piecesHtml += `
                        <button onclick="event.stopPropagation(); window.toggleTempTrackedPiece('${piece}')" 
                                style="padding:8px;border:2px solid ${borderColor};background:${bgColor};text-align:center;font-size:11px;font-weight:${fontWeight};cursor:pointer;transition:all 0.2s;">
                            ${piece}
                        </button>
                    `;
        });
        piecesHtml += '</div>';
        return piecesHtml;
    }

    popup.innerHTML = `
                <div style="font-weight:600;margin-bottom:10px;font-size:14px;">Tracked Pieces ${caseItem.overrideTracking ? '(Override)' : '(Default)'}</div>
                <div id="temp-piece-grid-${cardIdx}-${caseIdx}">
                    ${renderPieceButtons()}
                </div>
            `;

    document.body.appendChild(popup);

    // Function to toggle tracked pieces and update visualization
    window.toggleTempTrackedPiece = function (piece) {
        const index = caseItem.sessionTrackedPieces.indexOf(piece);
        if (index > -1) {
            caseItem.sessionTrackedPieces.splice(index, 1);
        } else {
            caseItem.sessionTrackedPieces.push(piece);
        }

        // Update button grid
        const grid = document.getElementById(`temp-piece-grid-${cardIdx}-${caseIdx}`);
        if (grid) {
            grid.innerHTML = renderPieceButtons();
        }

        // Update the case image with session tracked pieces
        generateCaseImageWithPieces(cardIdx, caseIdx, caseItem.sessionTrackedPieces);
    };

    const button = event.target.closest('button');

    function positionPopup() {
        const rect = button.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();

        // Check if button is visible
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            popup.remove();
            document.removeEventListener('scroll', positionPopup, true);
            document.removeEventListener('click', closePopup);
            generateCaseImage(cardIdx, caseIdx);
            return;
        }

        let top, left;

        // Calculate left position (prevent overflow)
        left = rect.left;
        if (left + popupRect.width > window.innerWidth) {
            left = window.innerWidth - popupRect.width - 10;
        }
        if (left < 10) left = 10;

        // Calculate top position
        const spaceBelow = window.innerHeight - rect.bottom;

        if (spaceBelow >= popupRect.height) {
            // Enough space below - stick to button bottom
            top = rect.bottom;
        } else {
            // Not enough space below - stick to window bottom
            top = window.innerHeight - popupRect.height - 10;
            if (top < 10) top = 10;
        }

        popup.style.top = top + 'px';
        popup.style.left = left + 'px';
        popup.style.opacity = '1';
    }

    // Initial position
    setTimeout(positionPopup, 0);

    // Update position on scroll
    document.addEventListener('scroll', positionPopup, true);

    const closePopup = (e) => {
        if (!popup.contains(e.target) && !button.contains(e.target)) {
            popup.remove();
            document.removeEventListener('click', closePopup);
            document.removeEventListener('scroll', positionPopup, true);
            // No need to regenerate - changes are already saved and displayed
        }
    };
    setTimeout(() => document.addEventListener('click', closePopup), 100);
}

function openReferenceSchemePopup(event, cardIdx, caseIdx) {
    event.stopPropagation();

    // Remove any existing popups
    document.querySelectorAll('.reference-scheme-popup').forEach(p => p.remove());
    document.querySelectorAll('.track-pieces-popup').forEach(p => p.remove());

    const caseItem = STATE.cards[cardIdx].cases[caseIdx];
    const effectiveTrackedPieces = caseItem.overrideTracking ? caseItem.customTrackedPieces : STATE.settings.defaultTrackedPieces;

    const popup = document.createElement('div');
    popup.className = 'reference-scheme-popup';
    popup.style.cssText = 'position:fixed;background:#fff;border:1px solid #333;padding:15px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.15);opacity:0;';

    popup.innerHTML = `
                <div style="font-weight:600;margin-bottom:10px;font-size:14px;">Reference Scheme (0,0)</div>
                <div id="reference-scheme-image"></div>
            `;

    document.body.appendChild(popup);

    // Generate reference image
    if (effectiveTrackedPieces && effectiveTrackedPieces.length > 0) {
        const pieceCodes = effectiveTrackedPieces;
        const pieces = pieceCodes.map(code => {
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
            return mapping ? mapping.hex : code;
        });
        const colors = pieceCodes.map(code => {
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
            return mapping ? mapping.color : '#ffb3d9';
        });
        const labels = STATE.settings.enableLabels ? pieceCodes.map(code => {
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
            return mapping && mapping.label ? mapping.label : '';
        }) : null;

        try {
            const html = window.Square1VisualizerLibraryWithSillyNames.helpMeTrackAPiecePlease(
                'scramble', '(0,0)', pieces, STATE.settings.imageSize, '#ffffff', colors, 2, 5, labels
            );
            document.getElementById('reference-scheme-image').innerHTML = html;
        } catch (e) {
            document.getElementById('reference-scheme-image').innerHTML = `<div style="color:#e53e3e;">Error: ${e.message}</div>`;
        }
    } else {
        try {
            const html = window.Square1VisualizerLibraryWithSillyNames.visualizeCubeShapeOutlinesPlease(
                '(0,0)', STATE.settings.imageSize, 'transparent', 'transparent', 2, 5
            );
            document.getElementById('reference-scheme-image').innerHTML = html;
        } catch (e) {
            document.getElementById('reference-scheme-image').innerHTML = `<div style="color:#e53e3e;">Error: ${e.message}</div>`;
        }
    }

    const button = event.target.closest('button');

    function positionPopup() {
        const rect = button.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();

        // Check if button is visible
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            popup.remove();
            document.removeEventListener('scroll', positionPopup, true);
            document.removeEventListener('click', closePopup);
            return;
        }

        let top, left;

        // Calculate left position (prevent overflow)
        left = rect.left;
        if (left + popupRect.width > window.innerWidth) {
            left = window.innerWidth - popupRect.width - 10;
        }
        if (left < 10) left = 10;

        // Calculate top position
        const spaceBelow = window.innerHeight - rect.bottom;

        if (spaceBelow >= popupRect.height) {
            // Enough space below - stick to button bottom
            top = rect.bottom;
        } else {
            // Not enough space below - stick to window bottom
            top = window.innerHeight - popupRect.height - 10;
            if (top < 10) top = 10;
        }

        popup.style.top = top + 'px';
        popup.style.left = left + 'px';
        popup.style.opacity = '1';
    }

    // Initial position
    setTimeout(positionPopup, 0);

    // Update position on scroll
    document.addEventListener('scroll', positionPopup, true);

    const closePopup = (e) => {
        if (!popup.contains(e.target) && !button.contains(e.target)) {
            popup.remove();
            document.removeEventListener('click', closePopup);
            document.removeEventListener('scroll', positionPopup, true);
        }
    };
    setTimeout(() => document.addEventListener('click', closePopup), 100);
}

function addCase(cardIdx) {
    const card = STATE.cards[cardIdx];
    if (!card.cases) card.cases = [];
    if (!card.viewState) card.viewState = { parity: 'odd', orientation: 'original' };

    const type = card.viewState.parity === 'odd' ? 'parity' : 'nonparity';
    const variant = card.viewState.orientation;

    const newCase = {
        type,
        variant,
        solution: '',
        imageHtml: '',
        overrideTracking: false,
        customTrackedPieces: []
    };
    card.cases.push(newCase);
    saveState();
    renderCases(cardIdx);

    // Open edit modal for the newly created case
    const newCaseIdx = card.cases.length - 1;
    setTimeout(() => openCaseEditModal(cardIdx, newCaseIdx), 100);
}

function updateCase(cardIdx, caseIdx, field, value) {
    STATE.cards[cardIdx].cases[caseIdx][field] = value;
    saveState();
}

function updateNormalizedPreview(cardIdx, caseIdx) {
    const caseItem = STATE.cards[cardIdx].cases[caseIdx];
    const previewEl = document.getElementById(`normalized-preview-${cardIdx}-${caseIdx}`);
    if (previewEl) {
        previewEl.innerHTML = highlightVariablesInNormalized(caseItem.solution || '');
    }
}

function deleteCase(cardIdx, caseIdx) {
    STATE.cards[cardIdx].cases.splice(caseIdx, 1);
    saveState();
    renderCases(cardIdx);
    // Update the card preview count in the main grid
    renderCards();
}

function generateCaseImageWithPieces(cardIdx, caseIdx, trackedPieces) {
    const caseItem = STATE.cards[cardIdx].cases[caseIdx];
    // Solution is always stored as solution (already inverted if it was a scramble)
    const expandedSolution = window.ScrambleNormalizer.normalizeScramble(caseItem.solution || '');

    // Invert solution to get scramble
    const scramble = window.Square1VisualizerLibraryWithSillyNames ?
        pleaseInvertThisScrambleForSolutionVisualization(expandedSolution) : expandedSolution;

    if (!trackedPieces || trackedPieces.length === 0) {
        try {
            const html = window.Square1VisualizerLibraryWithSillyNames.visualizeCubeShapeOutlinesPlease(
                scramble, STATE.settings.imageSize, 'transparent', 'transparent', 2, 5
            );
            const imageContainer = document.getElementById(`case-image-${cardIdx}-${caseIdx}`);
            if (imageContainer) {
                imageContainer.innerHTML = html;
            }
        } catch (e) {
            const imageContainer = document.getElementById(`case-image-${cardIdx}-${caseIdx}`);
            if (imageContainer) {
                imageContainer.innerHTML = `<div style="color:#e53e3e;padding:10px;font-size:11px;">Error: ${e.message}</div>`;
            }
        }
    } else {
        const pieceCodes = trackedPieces;

        const pieces = pieceCodes.map(code => {
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
            return mapping ? mapping.hex : code;
        });

        const colors = pieceCodes.map(code => {
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
            return mapping ? mapping.color : '#ffb3d9';
        });

        const labels = STATE.settings.enableLabels ? pieceCodes.map(code => {
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
            return mapping && mapping.label ? mapping.label : '';
        }) : null;

        try {
            const html = window.Square1VisualizerLibraryWithSillyNames.helpMeTrackAPiecePlease(
                'scramble', scramble, pieces, STATE.settings.imageSize, '#ffffff', colors, 2, 5, labels
            );
            const imageContainer = document.getElementById(`case-image-${cardIdx}-${caseIdx}`);
            if (imageContainer) {
                imageContainer.innerHTML = html;
            }
        } catch (e) {
            const imageContainer = document.getElementById(`case-image-${cardIdx}-${caseIdx}`);
            if (imageContainer) {
                imageContainer.innerHTML = `<div style="color:#e53e3e;padding:10px;font-size:11px;">Error: ${e.message}</div>`;
            }
        }
    }
}

function generateCaseImage(cardIdx, caseIdx) {
    const caseItem = STATE.cards[cardIdx].cases[caseIdx];
    // Solution is always stored as solution (already inverted if it was a scramble)
    const expandedSolution = window.ScrambleNormalizer.normalizeScramble(caseItem.solution || '');
    // Check for session override first, then permanent override, then default
    const effectiveTrackedPieces = caseItem.sessionOverrideTracking ? caseItem.sessionTrackedPieces :
        (caseItem.overrideTracking ? caseItem.customTrackedPieces : STATE.settings.defaultTrackedPieces);

    // If showing actual state, show the full colored cube
    if (caseItem.showActualState) {
        const scramble = window.Square1VisualizerLibraryWithSillyNames ?
            pleaseInvertThisScrambleForSolutionVisualization(expandedSolution) : expandedSolution;

        try {
            const colorScheme = {
                topColor: '#000000',
                bottomColor: '#FFFFFF',
                frontColor: '#CC0000',
                rightColor: '#00AA00',
                backColor: '#FF8C00',
                leftColor: '#0066CC',
                dividerColor: '#7a0000',
                circleColor: 'transparent'
            };

            const html = window.Square1VisualizerLibraryWithSillyNames.visualizeFromScrambleNotationPlease(
                scramble, STATE.settings.imageSize, colorScheme, 5
            );
            caseItem.imageHtml = html;
            saveState();
            const imageContainer = document.getElementById(`case-image-${cardIdx}-${caseIdx}`);
            if (imageContainer) {
                imageContainer.innerHTML = html;
            }
        } catch (e) {
            const imageContainer = document.getElementById(`case-image-${cardIdx}-${caseIdx}`);
            if (imageContainer) {
                imageContainer.innerHTML = `<div style="color:#e53e3e;padding:10px;font-size:11px;">Error: ${e.message}</div>`;
            }
        }
        return;
    }

    // Invert solution to get scramble
    const scramble = window.Square1VisualizerLibraryWithSillyNames ?
        pleaseInvertThisScrambleForSolutionVisualization(expandedSolution) : expandedSolution;
    if (!effectiveTrackedPieces || effectiveTrackedPieces.length === 0) {
        try {
            const html = window.Square1VisualizerLibraryWithSillyNames.visualizeCubeShapeOutlinesPlease(
                scramble, STATE.settings.imageSize, 'transparent', 'transparent', 2, 5
            );
            caseItem.imageHtml = html;
            saveState();
            const imageContainer = document.getElementById(`case-image-${cardIdx}-${caseIdx}`);
            if (imageContainer) {
                imageContainer.innerHTML = html;
            }
        } catch (e) {
            document.getElementById(`case-image-${cardIdx}-${caseIdx}`).innerHTML =
                `<div style="color:#e53e3e;padding:10px;font-size:11px;">Error: ${e.message}</div>`;
        }
    } else {
        const pieceCodes = effectiveTrackedPieces;
        const pieces = pieceCodes.map(code => {
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
            return mapping ? mapping.hex : code;
        });

        const colors = pieceCodes.map(code => {
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
            return mapping ? mapping.color : '#ffb3d9';
        });

        const labels = STATE.settings.enableLabels ? pieceCodes.map(code => {
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
            return mapping && mapping.label ? mapping.label : '';
        }) : null;

        try {
            const html = window.Square1VisualizerLibraryWithSillyNames.helpMeTrackAPiecePlease(
                'scramble', scramble, pieces, STATE.settings.imageSize, '#ffffff', colors, 2, 5, labels
            );
            caseItem.imageHtml = html;
            saveState();
            const imageContainer = document.getElementById(`case-image-${cardIdx}-${caseIdx}`);
            if (imageContainer) {
                imageContainer.innerHTML = html;
            }
        } catch (e) {
            document.getElementById(`case-image-${cardIdx}-${caseIdx}`).innerHTML =
                `<div style="color:#e53e3e;padding:10px;font-size:11px;">Error: ${e.message}</div>`;
        }
    }
}

// Add the invert function if not already present
function pleaseInvertThisScrambleForSolutionVisualization(scrambleString) {
    if (!scrambleString) return scrambleString;
    let str = String(scrambleString).trim();

    const parts = str.split('/');
    const reversed = parts.slice().reverse();

    const inverted = reversed.map(part => {
        part = part.trim();

        const turnMatch = part.match(/\(([^)]+)\)/);
        if (turnMatch) {
            const values = turnMatch[1].split(',').map(v => v.trim());
            const invertedValues = values.map(v => {
                const num = parseInt(v);
                if (isNaN(num)) return v;
                return String(-num);
            });
            return '(' + invertedValues.join(',') + ')';
        }

        if (part.includes(',')) {
            const values = part.split(',').map(v => v.trim());
            const invertedValues = values.map(v => {
                const num = parseInt(v);
                if (isNaN(num)) return v;
                return String(-num);
            });
            return invertedValues.join(',');
        }

        return part;
    });

    return inverted.join('/');
}

function switchTab(btn, targetId) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const container = parent.parentElement;
    container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
}

function renderAlgorithms(cardIdx) {
    const card = STATE.cards[cardIdx];
    if (!card.algorithms) card.algorithms = [];

    ['parity', 'nonparity'].forEach(type => {
        ['original', 'mirror'].forEach(variant => {
            const containerId = `${type}-${variant === 'original' ? 'orig' : 'mirror'}-algos-${cardIdx}`;
            const container = document.getElementById(containerId);
            if (!container) return;

            container.innerHTML = '';
            const algos = card.algorithms.filter(a => a.type === type && a.variant === variant);

            algos.forEach((algo, algoIdx) => {
                const actualIdx = card.algorithms.indexOf(algo);
                const algoCard = document.createElement('div');
                algoCard.className = 'algo-card';
                algoCard.innerHTML = `
                            <input type="text" class="algo-input" placeholder="Algorithm (use variables with *varName* or <varName>)" 
                                   value="${algo.notation || ''}" 
                                   onchange="updateAlgorithm(${cardIdx}, ${actualIdx}, 'notation', this.value)">
                            <button class="btn" onclick="generateImage(${cardIdx}, ${actualIdx})">Generate Image</button>
                            <button class="btn" onclick="deleteAlgorithm(${cardIdx}, ${actualIdx})">Delete</button>
                            <div class="algo-image" id="algo-image-${cardIdx}-${actualIdx}">
                                ${algo.imageHtml || '<div style="color:#999;padding:20px;text-align:center;">No image generated</div>'}
                            </div>
                            <div class="tracking-controls">
                                <input type="text" class="tracking-input" placeholder="Special pieces (comma-separated, e.g., UB,DR,UFR)" 
                                       value="${algo.trackPieces || ''}" 
                                       onchange="updateAlgorithm(${cardIdx}, ${actualIdx}, 'trackPieces', this.value)">
                                <button class="btn btn-primary" onclick="generateTrackedImage(${cardIdx}, ${actualIdx})">Show Tracked Pieces</button>
                            </div>
                        `;
                container.appendChild(algoCard);
            });
        });
    });
}

function addAlgorithm(cardIdx, type, variant) {
    const card = STATE.cards[cardIdx];
    if (!card.algorithms) card.algorithms = [];
    card.algorithms.push({ type, variant, notation: '', imageHtml: '', trackPieces: '' });
    saveState();
    renderAlgorithms(cardIdx);
}

function updateAlgorithm(cardIdx, algoIdx, field, value) {
    STATE.cards[cardIdx].algorithms[algoIdx][field] = value;
    saveState();
}

function updateCardTitle(cardIdx, title) {
    STATE.cards[cardIdx].title = title;
    saveState();
    renderCards();
}

function deleteAlgorithm(cardIdx, algoIdx) {
    STATE.cards[cardIdx].algorithms.splice(algoIdx, 1);
    saveState();
    renderAlgorithms(cardIdx);
}

function expandVariables(notation) {
    // Use the new normalizer module
    return window.ScrambleNormalizer.normalizeScramble(notation);
}

function generateImage(cardIdx, algoIdx) {
    const algo = STATE.cards[cardIdx].algorithms[algoIdx];
    const expanded = expandVariables(algo.notation);

    try {
        const html = window.Square1VisualizerLibraryWithSillyNames.visualizeCubeShapeOutlinesPlease(
            expanded, STATE.settings.imageSize, 'transparent', 'transparent', 2, 5
        );
        algo.imageHtml = html;
        saveState();
        document.getElementById(`algo-image-${cardIdx}-${algoIdx}`).innerHTML = html;
    } catch (e) {
        document.getElementById(`algo-image-${cardIdx}-${algoIdx}`).innerHTML =
            `<div style="color:#e53e3e;padding:10px;">Error: ${e.message}</div>`;
    }
}

function generateTrackedImage(cardIdx, algoIdx) {
    const algo = STATE.cards[cardIdx].algorithms[algoIdx];
    const expanded = expandVariables(algo.notation);

    if (!algo.trackPieces) {
        showConfirmModal('No Pieces Selected', 'Please enter pieces to track in the input field above.', () => { });
        return;
    }

    const pieceCodes = algo.trackPieces.split(',').map(p => p.trim());
    const pieces = pieceCodes.map(code => {
        const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
        return mapping ? mapping.hex : code;
    });
    const colors = pieceCodes.map(code => {
        const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
        return mapping ? mapping.color : '#ffb3d9';
    });
    const labels = STATE.settings.enableLabels ? pieceCodes.map(code => {
        const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === code);
        return mapping && mapping.label ? mapping.label : '';
    }) : null;

    try {
        const html = window.Square1VisualizerLibraryWithSillyNames.helpMeTrackAPiecePlease(
            'solution', expanded, pieces, STATE.settings.imageSize, '#ffffff', colors, 2, 5, labels
        );
        algo.imageHtml = html;
        saveState();
        document.getElementById(`algo-image-${cardIdx}-${algoIdx}`).innerHTML = html;
    } catch (e) {
        document.getElementById(`algo-image-${cardIdx}-${algoIdx}`).innerHTML =
            `<div style="color:#e53e3e;padding:10px;">Error: ${e.message}</div>`;
    }
}

function deleteCard(idx, event) {
    if (event) event.stopPropagation();
    showConfirmModal('Delete Card', 'Are you sure you want to delete this card?', () => {
        saveToHistory();
        STATE.cards.splice(idx, 1);
        saveState();
        renderCards();
    });
}

document.getElementById('addCardBtn').onclick = () => {
    showInputModal('Case name', 'Enter Case name:', '', (title) => {
        if (title) {
            saveToHistory();
            STATE.cards.push({ title, cases: [], algorithms: [] });
            saveState();
            renderCards();
        }
    });
};

function updateTopbar() {
    const topbarRight = document.querySelector('.topbar-right');

    if (STATE.editMode) {
        topbarRight.innerHTML = `
                    <button class="icon-btn" id="undoBtn" title="Undo">
                        <img src="res/undo.svg" alt="Undo" style="width:16px;height:16px;">
                    </button>
                    <button class="icon-btn" id="redoBtn" title="Redo">
                        <img src="res/redo.svg" alt="Redo" style="width:16px;height:16px;">
                    </button>
                    <button class="icon-btn" id="exitEditBtn" title="Exit Edit Mode">
                        <img src="res/close.svg" alt="Exit" style="width:16px;height:16px;">
                    </button>
                `;

        document.getElementById('undoBtn').onclick = undo;
        document.getElementById('redoBtn').onclick = redo;

        document.getElementById('exitEditBtn').onclick = () => {
            STATE.editMode = false;
            // Clear history when exiting edit mode
            STATE.history = [];
            STATE.historyIndex = -1;
            updateTopbar();
            renderCards();
        };
    } else {
        topbarRight.innerHTML = `
                    <button class="icon-btn" id="addCardBtn" title="Add Card">
                        <img src="res/plus.svg" alt="Add" style="width:16px;height:16px;">
                    </button>
                    <button class="icon-btn" id="editBtn" title="Edit Entries">
                        <img src="res/edit.svg" alt="Edit" style="width:16px;height:16px;">
                    </button>
                    <button class="icon-btn" id="variableBtn" title="Variable Table">
                        <img src="res/table.svg" alt="Variables" style="width:16px;height:16px;">
                    </button>
                    <button class="icon-btn" id="settingsBtn" title="Settings">
                        <img src="res/settings.svg" alt="Settings" style="width:16px;height:16px;">
                    </button>
                    <button class="icon-btn" id="instructionBtn" title="Instructions">
                        <img src="res/instruction.svg" alt="Instructions" style="width:16px;height:16px;">
                    </button>
                `;

        const addCardBtn = document.getElementById('addCardBtn');
        if (addCardBtn) {
            addCardBtn.onclick = () => {
                showInputModal('Card Title', 'Enter card title:', '', (title) => {
                    if (title) {
                        saveToHistory();
                        STATE.cards.push({ title, cases: [], algorithms: [] });
                        saveState();
                        renderCards();
                    }
                });
            };
        }

        document.getElementById('editBtn').onclick = () => {
            STATE.editMode = true;
            // Initialize fresh history for this edit session
            STATE.history = [JSON.stringify({ cards: STATE.cards })];
            STATE.historyIndex = 0;
            updateTopbar();
            renderCards();
        };

        document.getElementById('variableBtn').onclick = openVariableModal;
        document.getElementById('settingsBtn').onclick = openSettingsModal;
        document.getElementById('instructionBtn').onclick = openHomeInstructionModal;
    }
}

function cleanupVariableModalFunctions() {
    delete window.renderVariableTable;
    delete window.closeVariableModal;
    delete window.addVariableModal;
    delete window.editVariable;
    delete window.deleteVariableTemp;
    delete window.moveVariableUp;
    delete window.moveVariableDown;
    delete window.saveVariables;
}

function openVariableModal() {
    if (!STATE.variableChanges) STATE.variableChanges = JSON.parse(JSON.stringify(STATE.variables));

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.dataset.hasChanges = 'false';

    function renderVariableTable() {
        let varsHtml = '';
        const varEntries = Object.entries(STATE.variableChanges);

        varEntries.forEach(([name, value], idx) => {
            const normalized = highlightVariablesInNormalized(value);
            varsHtml += `
                <tr>
                    <td>${name}</td>
                    <td style="font-family:monospace;font-size:12px;">${value}</td>
                    <td style="font-family:monospace;font-size:10px;color:#999;">${normalized}</td>
                    <td>
                        <div style="display:flex;gap:4px;">
                            <button class="icon-btn" style="width:28px;height:28px;" onclick="window.editVariable('${name}')" title="Edit">
                                <img src="res/edit.svg" style="width:14px;height:14px;">
                            </button>
                            <button class="icon-btn" style="width:28px;height:28px;" onclick="window.moveVariableUp(${idx})" title="Move Up" ${idx === 0 ? 'disabled' : ''}>
                                <img src="res/upVar.svg" style="width:14px;height:14px;">
                            </button>
                            <button class="icon-btn" style="width:28px;height:28px;" onclick="window.moveVariableDown(${idx})" title="Move Down" ${idx === varEntries.length - 1 ? 'disabled' : ''}>
                                <img src="res/downVar.svg" style="width:14px;height:14px;">
                            </button>
                            <button class="icon-btn" style="width:28px;height:28px;" onclick="window.deleteVariableTemp('${name}')" title="Delete">
                                <img src="res/delete.svg" style="width:14px;height:14px;">
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        document.getElementById('variableTableBody').innerHTML = varsHtml || '<tr><td colspan="4" style="text-align:center;color:#999;padding:20px;">No variables yet</td></tr>';
    }

    window.renderVariableTable = renderVariableTable;

    window.closeVariableModal = function (element) {
        const modalElement = element ? element.closest('.modal') : document.querySelector('.modal[data-has-changes]');
        if (!modalElement) {
            return;
        }

        if (modalElement.dataset.hasChanges === 'true') {
            showThreeButtonModal(
                'Unsaved Changes',
                'You have unsaved changes. What would you like to do?',
                'Save & Exit',
                () => {
                    STATE.variables = JSON.parse(JSON.stringify(STATE.variableChanges));
                    delete STATE.variableChanges;
                    saveState();
                    cleanupVariableModalFunctions();
                    modalElement.remove();
                },
                "Don't Save",
                () => {
                    delete STATE.variableChanges;
                    cleanupVariableModalFunctions();
                    modalElement.remove();
                },
                'Cancel',
                () => {
                }
            );
        } else {
            delete STATE.variableChanges;
            cleanupVariableModalFunctions();
            modalElement.remove();
        }
    };

    window.addVariableModal = function () {
        showTwoInputModal('Add Variable', 'Variable Name:', 'Variable Value:', '', '', (name, value) => {
            if (name && !STATE.variableChanges[name]) {
                STATE.variableChanges[name] = value;
                const varModal = document.querySelector('.modal[data-has-changes]');
                if (varModal) varModal.dataset.hasChanges = 'true';
                // Force re-render after a small delay to ensure expansion happens
                setTimeout(() => window.renderVariableTable(), 10);
            } else if (STATE.variableChanges[name]) {
                console.warn('[Variable Modal] Variable already exists:', name);
            }
        });
    };

    window.editVariable = function (oldName) {
        showTwoInputModal('Edit Variable', 'Variable Name:', 'Variable Value:', oldName, STATE.variableChanges[oldName], (name, value) => {
            if (name) {
                if (name !== oldName) {
                    delete STATE.variableChanges[oldName];
                }
                STATE.variableChanges[name] = value;
                const varModal = document.querySelector('.modal[data-has-changes]');
                if (varModal) varModal.dataset.hasChanges = 'true';
                // Force re-render after a small delay to ensure expansion happens
                setTimeout(() => window.renderVariableTable(), 10);
            }
        });
    };

    window.deleteVariableTemp = function (name) {
        showConfirmModal('Delete Variable', `Are you sure you want to delete variable "${name}"?`, () => {
            delete STATE.variableChanges[name];
            const varModal = document.querySelector('.modal[data-has-changes]');
            if (varModal) varModal.dataset.hasChanges = 'true';
            window.renderVariableTable();
        });
    };

    window.moveVariableUp = function (idx) {
        const entries = Object.entries(STATE.variableChanges);
        if (idx > 0) {
            [entries[idx - 1], entries[idx]] = [entries[idx], entries[idx - 1]];
            STATE.variableChanges = Object.fromEntries(entries);
            const varModal = document.querySelector('.modal[data-has-changes]');
            if (varModal) varModal.dataset.hasChanges = 'true';
            window.renderVariableTable();
        }
    };

    window.moveVariableDown = function (idx) {
        const entries = Object.entries(STATE.variableChanges);
        if (idx < entries.length - 1) {
            [entries[idx], entries[idx + 1]] = [entries[idx + 1], entries[idx]];
            STATE.variableChanges = Object.fromEntries(entries);
            const varModal = document.querySelector('.modal[data-has-changes]');
            if (varModal) varModal.dataset.hasChanges = 'true';
            window.renderVariableTable();
        }
    };

    window.saveVariables = function () {
        STATE.variables = JSON.parse(JSON.stringify(STATE.variableChanges));
        delete STATE.variableChanges;
        saveState();
        const varModal = document.querySelector('.modal[data-has-changes]');
        if (varModal) {
            varModal.dataset.hasChanges = 'false';
            cleanupVariableModalFunctions();
            varModal.remove();
        }
    };

    modal.setAttribute('data-has-changes', 'false');

    modal.innerHTML = `
        <div class="modal-content" style="margin:auto;">
            <div class="modal-header">
                <h3>Variable Table</h3>
                <div style="display:flex;gap:8px;align-items:center;">
                    <button class="icon-btn" onclick="window.addVariableModal()" title="Add Variable">
                        <img src="res/plus.svg" style="width:16px;height:16px;">
                    </button>
                    <button class="icon-btn" onclick="window.saveVariables()" title="Save Changes">
                        <img src="res/save.svg" style="width:16px;height:16px;">
                    </button>
                    <button class="close-btn" onclick="event.stopPropagation(); window.closeVariableModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body">
                <table class="variable-table">
                    <thead>
                        <tr>
                            <th style="width:20%;">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <span id="varTableNameHeader">Name</span>
                                    <button class="icon-btn" id="searchVarBtn" style="width:24px;height:24px;" title="Search">
                                        <img src="res/search.svg" style="width:12px;height:12px;">
                                    </button>
                                    <input type="text" id="varSearchInput" placeholder="Search..." style="display:none;padding:4px;border:1px solid #ccc;flex:1;font-size:12px;">
                                </div>
                            </th>
                            <th style="width:35%;">Value</th>
                            <th style="width:25%;">Normalized</th>
                            <th style="width:20%;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="variableTableBody"></tbody>
                </table>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    renderVariableTable();

    document.getElementById('searchVarBtn').onclick = () => {
        const nameHeader = document.getElementById('varTableNameHeader');
        const searchInput = document.getElementById('varSearchInput');
        const searchBtn = document.getElementById('searchVarBtn');

        if (searchInput.style.display === 'none') {
            nameHeader.style.display = 'none';
            searchBtn.style.display = 'none';
            searchInput.style.display = 'block';
            searchInput.focus();
        } else {
            nameHeader.style.display = 'inline';
            searchBtn.style.display = 'inline';
            searchInput.style.display = 'none';
            searchInput.value = '';
            renderVariableTable();
        }
    };

    document.getElementById('varSearchInput').oninput = (e) => {
        const search = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#variableTableBody tr');
        rows.forEach(row => {
            const name = row.cells[0]?.textContent.toLowerCase() || '';
            row.style.display = name.includes(search) ? '' : 'none';
        });
    };

    document.getElementById('varSearchInput').onblur = (e) => {
        if (e.target.value.trim() === '') {
            const nameHeader = document.getElementById('varTableNameHeader');
            const searchBtn = document.getElementById('searchVarBtn');
            nameHeader.style.display = 'inline';
            searchBtn.style.display = 'inline';
            e.target.style.display = 'none';
            renderVariableTable();
        }
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            window.closeVariableModal(modal);
        }
    };
}

function openHomeInstructionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:600px;height:auto;">
            <div class="modal-header">
                <h3>Welcome to SQ1 Piece Tracing Tool</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="line-height:1.8;overflow-y:auto;flex:1;">
                <ol style="padding-left:20px;">
                    <li style="margin-bottom:15px;">You will find various instructions scattered around the app that will help you navigate the app better.</li>
                    <li style="margin-bottom:15px;">I am not a programmer, all these codes are written using Claude AI, so you might find bugs. Report them to me at <a href="mailto:abidashrafkhulna@gmail.com">abidashrafkhulna@gmail.com</a>. Meanwhile, to save your precious data, kindly keep constant backups by going to settings and exporting data.</li>
                    <li style="margin-bottom:15px;">If anything freezes, kindly do a refresh and the app should work properly after that.</li>
                    <li style="margin-bottom:15px;">The code is open source. Find it at <a href="https://github.com/Abid-speedcuber/sq1-piece-tracing-and-prediction-tool" target="_blank">github.com/Abid-speedcuber/sq1-piece-tracing-and-prediction-tool</a>. The code is written with AI, so it'll feel pretty sloppy. Feel free to have fun!</li>
                </ol>
                <h4 style="margin-top:25px;margin-bottom:10px;">Variables:</h4>
                <p>To access the variables table, press the var button on the topbar. It will let you store frequently used triggers into smaller macros for easier use. You can use one variable in another variable. To use a variable in an angle, write *yourVariableName* or &lt;yourVariableName&gt;.</p>
                
                <h4 style="margin-top:20px;margin-bottom:10px;">The Case Organization System:</h4>
                <p>Each case on the home screen has 4 sections: normal orientation even parity, normal orientation odd parity, mirror orientation even parity, mirror orientation odd parity. So you can easily organize your angles pretty neatly.</p>
                
                <p style="margin-top:15px;">You can delete a case from the edit menu (pen icon above). You can also rearrange them from there.</p>
                <p>You can change some settings and have some personalized features from the settings.</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function openVariableInstructionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;max-height:80vh;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <div class="modal-header">
                <h3>Variable Instructions</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="line-height:1.8;overflow-y:auto;flex:1;">
                <p style="margin-bottom:15px;">You can use some weird notations for easier input:</p>
                <p style="font-style:italic;color:#666;">(Instructions to be added by user)</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

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
                                       onchange="STATE.settings.enableLabels = this.checked; saveState();" 
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

function openSettingsInstructionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;max-height:80vh;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <div class="modal-header">
                <h3>Settings Instructions</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="line-height:1.8;overflow-y:auto;flex:1;">
                <ol style="padding-left:20px;">
                    <li style="margin-bottom:15px;">Image size defines the traced image, not the image inside the training modal. Change it from settings inside the modal.</li>
                    <li style="margin-bottom:15px;">You can turn off some default tracked pieces for training purposes.</li>
                    <li style="margin-bottom:15px;">Export data regularly to be safe from data loss.</li>
                </ol>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
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

            html += `
                        <button onclick="toggleDefaultTrackedPiece('${piece}')" 
                                style="padding:12px;border:2px solid ${borderColor};background:${bgColor};cursor:pointer;font-size:13px;font-weight:${fontWeight};transition:all 0.2s;">
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
    <div style="display:flex;align-items:center;gap:10px;">
        <h3 style="margin:0;">Variable Table</h3>
        <button class="icon-btn" onclick="openVariableInstructionModal()" title="Variable Help" style="width:24px;height:24px;">
            <img src="res/instruction.svg" style="width:12px;height:12px;">
        </button>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
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

function openColorMappingModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    // Backup original state
    const originalColorMappings = JSON.parse(JSON.stringify(STATE.settings.colorMappings));

    let mappingsHtml = '';
    STATE.settings.colorMappings.forEach((m, i) => {
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

function updateColorMapping(idx, field, value) {
    STATE.settings.colorMappings[idx][field] = value;
    saveState();
}

function exportData() {
    const dataStr = JSON.stringify(STATE, null, 2);
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

loadState();
updateTopbar();
renderCards();