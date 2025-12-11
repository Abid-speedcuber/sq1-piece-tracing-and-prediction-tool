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
    ${!STATE.settings.personalization.hideInstructions ? `<button class="icon-btn" onclick="openCardInstructionModal()" title="Help" style="width:24px;height:24px;background:#555;">
        <img src="res/white-instruction.svg" style="width:12px;height:12px;">
    </button>` : ''}
</div>
<div style="display:flex;gap:10px;">
    <button class="icon-btn" onclick="openSettingsModal('card')" title="Settings" style="width:32px;height:32px;background:#555;">
        <img src="res/settings.svg" style="width:16px;height:16px;">
    </button>
    <button class="close-btn" onclick="this.closest('.modal').remove()" style="color:#fff;">×</button>
</div>
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

function updateCardView(cardIdx, field, value) {
    STATE.cards[cardIdx].viewState[field] = value;
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

        const isMobileView = STATE.settings.personalization.enableMobileView;
        const swapAlgs = STATE.settings.personalization.swapAlgorithmDisplay;
        const hideActualState = STATE.settings.personalization.hideActualStateButton;
        const hideChangePieces = STATE.settings.personalization.hideChangeTrackedPiecesButton;
        const hideRefScheme = STATE.settings.personalization.hideReferenceSchemeButton;

        const primaryAlg = swapAlgs ? highlightVariablesInNormalized(caseItem.solution || '') : (caseItem.solution || '<span style="color:#999;">No solution</span>');
        const secondaryAlg = swapAlgs ? (caseItem.solution || '<span style="color:#999;">No solution</span>') : highlightVariablesInNormalized(caseItem.solution || '');
        const primaryAlgSize = swapAlgs ? '14px' : '14px';
        const secondaryAlgSize = swapAlgs ? '10px' : '10px';
        const primaryAlgColor = swapAlgs ? '#000' : 'inherit';
        const secondaryAlgColor = swapAlgs ? '#999' : '#999';

        const buttonsHtml = `
            ${!hideActualState ? `<button class="btn ${caseItem.showActualState ? 'btn-primary' : ''}" onclick="toggleShowActualState(${cardIdx}, ${actualIdx})" style="padding:6px 12px;font-size:13px;">Show Actual State</button>` : ''}
            ${!hideChangePieces ? `<button class="btn" onclick="openTrackPiecesPopup(event, ${cardIdx}, ${actualIdx})" style="padding:6px 12px;font-size:13px;">Change Tracked Pieces</button>` : ''}
            ${!hideRefScheme ? `<button class="btn" onclick="openReferenceSchemePopup(event, ${cardIdx}, ${actualIdx})" style="padding:6px 12px;font-size:13px;">Show Reference Scheme</button>` : ''}
        `;

        if (isMobileView) {
            // Check screen width for multi-column layout
            const screenWidth = window.innerWidth;
            let columns = 1;
            if (screenWidth >= 2400) columns = 3;
            else if (screenWidth >= 1200) columns = 2;
            
            if (columns > 1 && container.style.display !== 'grid') {
                container.style.display = 'grid';
                container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                container.style.gap = '15px';
            } else if (columns === 1) {
                container.style.display = 'block';
            }
            
            caseCard.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <strong style="font-size:16px;">${caseItem.customName || (card.title || 'Case') + (caseIdx + 1)}</strong>
        <button class="icon-btn" style="width:32px;height:32px;margin-right:8px;" onclick="openEditCaseNameModal(${cardIdx}, ${actualIdx}, event)" title="Edit Name">
                    <img src="res/edit.svg" style="width:16px;height:16px;">
                </button>
                <button class="icon-btn" style="width:32px;height:32px;" onclick="toggleCaseEditMode(${cardIdx}, ${actualIdx})" title="Edit Case">
            <img src="res/edit.svg" style="width:16px;height:16px;">
        </button>
    </div>
    <div style="display:flex;flex-direction:column;gap:15px;">
        <div style="display:flex;justify-content:center;">
            <div id="case-image-${cardIdx}-${actualIdx}" style="display:flex;align-items:center;justify-content:center;">
                ${caseItem.imageHtml || '<span style="color:#999;font-size:12px;">Generating...</span>'}
            </div>
        </div>
        <div>
            <div style="margin-bottom:4px;">
                <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Algorithm:</div>
                <div style="font-family:monospace;font-size:${primaryAlgSize};color:${primaryAlgColor};background:transparent;word-break:break-all;">
                    ${primaryAlg}
                </div>
            </div>
            <div style="margin-bottom:12px;">
                <div style="font-family:monospace;font-size:${secondaryAlgSize};color:${secondaryAlgColor};word-break:break-all;">
                    ${secondaryAlg}
                </div>
            </div>
            <div style="margin-bottom:12px;padding-top:8px;border-top:1px solid #eee;">
                <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Setup Moves:</div>
                <div style="font-family:monospace;font-size:12px;color:#666;word-break:break-all;">
                    ${setupMoves || '<span style="color:#999;">No setup moves</span>'}
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
                ${buttonsHtml}
            </div>
        </div>
    </div>
`;
        } else {
            caseCard.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <strong style="font-size:16px;">${caseItem.customName || (card.title || 'Case') + (caseIdx + 1)}</strong>
        <button class="icon-btn" style="width:32px;height:32px;margin-right:8px;" onclick="openEditCaseNameModal(${cardIdx}, ${actualIdx}, event)" title="Edit Name">
                    <img src="res/edit.svg" style="width:16px;height:16px;">
                </button>
                <button class="icon-btn" style="width:32px;height:32px;" onclick="toggleCaseEditMode(${cardIdx}, ${actualIdx})" title="Edit Case">
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
                <div style="font-family:monospace;font-size:${primaryAlgSize};color:${primaryAlgColor};background:transparent;word-break:break-all;">
                    ${primaryAlg}
                </div>
            </div>
            <div style="margin-bottom:12px;">
                <div style="font-family:monospace;font-size:${secondaryAlgSize};color:${secondaryAlgColor};word-break:break-all;">
                    ${secondaryAlg}
                </div>
            </div>
            <div style="margin-bottom:12px;padding-top:8px;border-top:1px solid #eee;">
                <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Setup Moves:</div>
                <div style="font-family:monospace;font-size:12px;color:#666;word-break:break-all;">
                    ${setupMoves || '<span style="color:#999;">No setup moves</span>'}
                </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                ${buttonsHtml}
            </div>
        </div>
    </div>
`;
        }
        container.appendChild(caseCard);

        setTimeout(() => generateCaseImage(cardIdx, actualIdx), 100);
    });
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
        customTrackedPieces: [],
        customName: ''
    };
    card.cases.push(newCase);
    saveState();
    renderCases(cardIdx);
    
    // Update the card preview count in the main grid
    const searchInput = document.getElementById('cardSearchInput');
    const searchQuery = searchInput ? searchInput.value : '';
    renderCards(searchQuery);

    // Open edit modal for the newly created case
    const newCaseIdx = card.cases.length - 1;
    setTimeout(() => openCaseEditModal(cardIdx, newCaseIdx), 100);
}

function updateCase(cardIdx, caseIdx, field, value) {
    STATE.cards[cardIdx].cases[caseIdx][field] = value;
    saveState();
}

function deleteCase(cardIdx, caseIdx) {
    STATE.cards[cardIdx].cases.splice(caseIdx, 1);
    saveState();
    renderCases(cardIdx);
    // Update the card preview count in the main grid
    const searchInput = document.getElementById('cardSearchInput');
    const searchQuery = searchInput ? searchInput.value : '';
    renderCards(searchQuery);
}

function generateCaseImage(cardIdx, caseIdx) {
    const caseItem = STATE.cards[cardIdx].cases[caseIdx];
    // Solution is always stored as solution (already inverted if it was a scramble)
    const expandedSolution = window.ScrambleNormalizer.normalizeScramble(caseItem.solution || '');
    // Check for session override first, then permanent override, then default
    const effectiveTrackedPieces = caseItem.sessionOverrideTracking ? caseItem.sessionTrackedPieces :
        (caseItem.overrideTracking ? caseItem.customTrackedPieces : STATE.settings.defaultTrackedPieces);

    // If showing actual state, show the full colored cube with labels
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

            // Build piece labels map from settings
            const pieceLabels = {};
            if (STATE.settings.enableLabels) {
                STATE.settings.colorMappings.forEach(mapping => {
                    if (mapping.label) {
                        pieceLabels[mapping.hex] = mapping.label;
                    }
                });
            }

            // Apply scramble to get hex code
            const cubeState = applyScrambleToCubePlease(scramble);
            const hexCode = pleaseEncodeMyCubeStateToHexNotation(cubeState);
            
            const html = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
                hexCode, STATE.settings.imageSize, colorScheme, 5, STATE.settings.enableLabels, pieceLabels
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

function toggleShowActualState(cardIdx, caseIdx) {
    const caseItem = STATE.cards[cardIdx].cases[caseIdx];
    caseItem.showActualState = !caseItem.showActualState;
    saveState();
    generateCaseImage(cardIdx, caseIdx);
    renderCases(cardIdx);
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

function openEditCaseNameModal(cardIdx, caseIdx, event) {
    if (event) event.stopPropagation();
    
    const card = STATE.cards[cardIdx];
    const caseItem = card.cases[caseIdx];
    const currentName = caseItem.customName || '';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width:400px;">
            <div class="modal-header">
                <h3>Edit Case Name</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <label class="settings-label">Case Name</label>
                <input type="text" id="editCaseNameInput" class="settings-input" value="${currentName}" placeholder="${(card.title || 'Case') + (caseIdx + 1)}" style="width:100%;padding:8px;margin-top:5px;">
                <p style="font-size:12px;color:#666;margin-top:8px;">Leave empty to use default name: ${(card.title || 'Case') + (caseIdx + 1)}</p>
            </div>
            <div style="padding:15px;text-align:right;border-top:1px solid #ddd;display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="saveCaseName(${cardIdx}, ${caseIdx})">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus input and select text
    setTimeout(() => {
        const input = document.getElementById('editCaseNameInput');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
    
    // Handle Enter key
    document.getElementById('editCaseNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveCaseName(cardIdx, caseIdx);
        }
    });
    
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function saveCaseName(cardIdx, caseIdx) {
    const input = document.getElementById('editCaseNameInput');
    const newName = input.value.trim();
    
    // Store custom name (empty string if user cleared it)
    STATE.cards[cardIdx].cases[caseIdx].customName = newName;
    saveState();
    renderCases(cardIdx);
    
    const modal = input.closest('.modal');
    if (modal) modal.remove();
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
    ${!STATE.settings.personalization.hideInstructions ? `<button class="icon-btn" onclick="openEditInstructionModal()" title="Help" style="width:24px;height:24px;background:#555;">
        <img src="res/white-instruction.svg" style="width:12px;height:12px;">
    </button>` : ''}
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
                                       oninput="window.updateEditSolution(this.value)"
                                       style="width:100%;padding:8px;border:1px solid #ccc;font-size:13px;margin-bottom:6px;">
                                <div id="edit-normalized-preview" style="font-family:monospace;font-size:10px;color:#999;word-break:break-all;">
                                    ${highlightVariablesInNormalized(currentSolution)}
                                </div>
                            </div>
                            
                            ${!STATE.settings.personalization.hideOverrideTrackedPieces ? `
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
                            ` : ''}
                            
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
        // Update the card preview in the main grid
        const searchInput = document.getElementById('cardSearchInput');
        const searchQuery = searchInput ? searchInput.value : '';
        renderCards(searchQuery);
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
            // Update the card preview count in the main grid
            const searchInput = document.getElementById('cardSearchInput');
            const searchQuery = searchInput ? searchInput.value : '';
            renderCards(searchQuery);
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