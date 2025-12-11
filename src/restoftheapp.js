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
            { hex: 'e', pieceCode: 'DB', color: '#FF4747', label: '6' },
            { hex: 'f', pieceCode: 'DLB', color: '#FF6969', label: '7' }
        ],
        enableLabels: true,
        personalization: {
            hideActualStateButton: false,
            hideChangeTrackedPiecesButton: false,
            hideReferenceSchemeButton: false,
            swapAlgorithmDisplay: true,
            enableMobileView: false,
            hideSearchBar: false,
            hideOverrideTrackedPieces: true,
            cardScale: 1
        }
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
                { hex: 'e', pieceCode: 'DB', color: '#FFFFE0', label: '6' },
                { hex: 'f', pieceCode: 'DLB', color: '#FFFFE0', label: '7' }
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

        // Ensure personalization settings exist
        if (!STATE.settings.personalization) {
            STATE.settings.personalization = {
                hideActualStateButton: false,
                hideChangeTrackedPiecesButton: false,
                hideReferenceSchemeButton: false,
                swapAlgorithmDisplay: true,
                enableMobileView: false,
                hideSearchBar: false,
                hideOverrideTrackedPieces: true,
                cardScale: 1,
                hideInstructions: false
            };
        }
        // Ensure hideInstructions exists for existing users
        if (STATE.settings.personalization.hideInstructions === undefined) {
            STATE.settings.personalization.hideInstructions = false;
        }
    }
}

function renderCards(searchQuery = '') {
    const grid = document.getElementById('cardsGrid');
    const empty = document.getElementById('emptyState');
    const searchContainer = document.getElementById('searchContainer');

    if (STATE.cards.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        searchContainer.style.display = 'none';
        return;
    }

    searchContainer.style.display = STATE.settings.personalization.hideSearchBar ? 'none' : 'flex';
    grid.style.display = 'grid';
    empty.style.display = 'none';
    
    // Apply card scale
    const scale = STATE.settings.personalization.cardScale || 1;
    const baseCardWidth = 250;
    const scaledCardWidth = baseCardWidth * scale;
    grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${scaledCardWidth}px, 1fr))`;
    
    grid.innerHTML = '';

    const filteredCards = STATE.cards.filter(card => {
        if (!searchQuery) return true;
        return (card.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (filteredCards.length === 0 && searchQuery) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#999;">No cases found matching your search.</div>';
        return;
    }

    filteredCards.forEach(card => {
        const idx = STATE.cards.indexOf(card);
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.style.position = 'relative';
        cardEl.draggable = STATE.editMode;

        // Generate thumbnail for first case if exists, otherwise show (0,0)
        const scale = STATE.settings.personalization.cardScale || 1;
        const thumbnailSize = 90 * scale;
        
        let thumbnailHtml = '';
        if (card.cases && card.cases.length > 0) {
            const firstCase = card.cases[0];
            const expandedSolution = window.ScrambleNormalizer.normalizeScramble(firstCase.solution || '');
            const effectiveTrackedPieces = firstCase.overrideTracking ? firstCase.customTrackedPieces : STATE.settings.defaultTrackedPieces;
            const scramble = pleaseInvertThisScrambleForSolutionVisualization(expandedSolution);

            if (!effectiveTrackedPieces || effectiveTrackedPieces.length === 0) {
                try {
                    thumbnailHtml = window.Square1VisualizerLibraryWithSillyNames.visualizeCubeShapeOutlinesPlease(
                        scramble, thumbnailSize, 'transparent', 'transparent', 2, 5
                    );
                } catch (e) {
                    thumbnailHtml = '<div style="color:#999;font-size:10px;">No preview</div>';
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
                    thumbnailHtml = window.Square1VisualizerLibraryWithSillyNames.helpMeTrackAPiecePlease(
                        'scramble', scramble, pieces, thumbnailSize, '#ffffff', colors, 2, 5, labels
                    );
                } catch (e) {
                    thumbnailHtml = '<div style="color:#999;font-size:10px;">No preview</div>';
                }
            }
        } else {
            // Show (0,0) state for cards without cases
            try {
                thumbnailHtml = window.Square1VisualizerLibraryWithSillyNames.visualizeCubeShapeOutlinesPlease(
                    '(0,0)', thumbnailSize, 'transparent', 'transparent', 2, 5
                );
            } catch (e) {
                thumbnailHtml = '<div style="color:#999;font-size:10px;">No cases</div>';
            }
        }

        const imageHeight = 100 * scale;
        const fontSize = 16 * scale;
        const previewFontSize = 12 * scale;
        
        cardEl.innerHTML = `
    ${STATE.editMode ? `
        <button class="card-delete-btn" onclick="deleteCard(${idx}, event)"><img src="res/delete.svg" style="width:${14 * scale}px;height:${14 * scale}px;"></button>
        <button class="card-edit-btn" onclick="openEditCardNameModal(${idx}, event)" style="position:absolute;top:8px;right:40px;width:28px;height:28px;border:none;background:#007bff;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);z-index:2;"><img src="res/edit.svg" style="width:${14 * scale}px;height:${14 * scale}px;"></button>
    ` : ''}
    <div style="display:flex;flex-direction:column;gap:${8 * scale}px;">
        <div style="position:relative;width:100%;height:${imageHeight}px;overflow:hidden;display:flex;justify-content:center;align-items:center;background:#f9f9f9;border:1px solid #e0e0e0;">
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(1.3);transform-origin:center center;">
                ${thumbnailHtml}
            </div>
        </div>
        <div class="card-title" style="font-size:${fontSize}px;">${card.title || 'Anonymous Case'}</div>
        <div class="card-preview" style="font-size:${previewFontSize}px;">${card.cases?.length || 0} entries</div>
    </div>
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

    // Update search clear button visibility
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
        clearBtn.style.display = searchQuery ? 'flex' : 'none';
    }
}

// Setup search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('cardSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderCards(e.target.value);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            renderCards('');
            searchInput.focus();
        });
    }
});

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

function openEditCardNameModal(idx, event) {
    if (event) event.stopPropagation();
    const card = STATE.cards[idx];
    const currentName = card.title || '';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width:400px;">
            <div class="modal-header">
                <h3>Edit Card Name</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <label class="settings-label">Card Name</label>
                <input type="text" id="editCardNameInput" class="settings-input" value="${currentName}" style="width:100%;padding:8px;margin-top:5px;">
            </div>
            <div style="padding:15px;text-align:right;border-top:1px solid #ddd;display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="saveCardName(${idx})">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus input and select text
    setTimeout(() => {
        const input = document.getElementById('editCardNameInput');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
    
    // Handle Enter key
    document.getElementById('editCardNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveCardName(idx);
        }
    });
    
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function saveCardName(idx) {
    const input = document.getElementById('editCardNameInput');
    const newName = input.value.trim();
    
    if (newName) {
        STATE.cards[idx].title = newName;
        saveState();
        renderCards();
    }
    
    const modal = input.closest('.modal');
    if (modal) modal.remove();
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
                    <button class="btn" id="addCardBtn" title="Add Case" style="padding:8px 16px;display:flex;align-items:center;gap:6px;">
                        <img src="res/plus.svg" alt="Add" style="width:16px;height:16px;">
                        <span>Add CS</span>
                    </button>
                    <button class="icon-btn" id="instructionBtn" title="Instructions">
                        <img src="res/instruction.svg" alt="Instructions" style="width:16px;height:16px;">
                    </button>
                `;
        
        // Setup sidebar after creating buttons
        setTimeout(() => setupSidebar(), 0);

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

        const instructionBtn = document.getElementById('instructionBtn');
        if (instructionBtn) {
            instructionBtn.onclick = openHomeInstructionModal;
            if (STATE.settings.personalization && STATE.settings.personalization.hideInstructions) {
                instructionBtn.style.display = 'none';
            }
        }
    }
    
    // Always setup sidebar at the end
    setTimeout(() => setupSidebar(), 0);
}

function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggleBtn') || document.getElementById('sidebarToggleBtnLeft');
    const closeBtn = document.getElementById('sidebarCloseBtn');
    const trainingToggle = document.getElementById('trainingDropdownToggle');
    const trainingDropdown = document.getElementById('trainingDropdown');
    const trainingArrow = document.getElementById('trainingDropdownArrow');
    
    if (!sidebar || !toggleBtn) return;
    
    toggleBtn.onclick = () => {
        sidebar.classList.add('open');
    };
    
    if (closeBtn) {
        closeBtn.onclick = () => {
            sidebar.classList.remove('open');
            trainingDropdown.classList.remove('open');
            trainingArrow.style.transform = 'rotate(0deg)';
        };
    }
    
    if (trainingToggle && trainingDropdown) {
        trainingToggle.onclick = (e) => {
            e.stopPropagation();
            const isOpen = trainingDropdown.classList.contains('open');
            if (isOpen) {
                trainingDropdown.classList.remove('open');
                trainingArrow.style.transform = 'rotate(0deg)';
            } else {
                trainingDropdown.classList.add('open');
                trainingArrow.style.transform = 'rotate(180deg)';
            }
        };
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        const toggleBtnLeft = document.getElementById('sidebarToggleBtnLeft');
        const toggleBtnRight = document.getElementById('sidebarToggleBtn');
        const clickedToggle = (toggleBtnLeft && toggleBtnLeft.contains(e.target)) || (toggleBtnRight && toggleBtnRight.contains(e.target));
        
        if (!sidebar.contains(e.target) && !clickedToggle) {
            sidebar.classList.remove('open');
            if (trainingDropdown) trainingDropdown.classList.remove('open');
            if (trainingArrow) trainingArrow.style.transform = 'rotate(0deg)';
        }
    });
}

// Add a hidden edit button for sidebar to trigger
const hiddenEditBtn = document.createElement('button');
hiddenEditBtn.id = 'editBtn';
hiddenEditBtn.style.display = 'none';
hiddenEditBtn.onclick = () => {
    STATE.editMode = true;
    STATE.history = [JSON.stringify({ cards: STATE.cards })];
    STATE.historyIndex = 0;
    updateTopbar();
    renderCards();
};
document.body.appendChild(hiddenEditBtn);

loadState();
updateTopbar();
renderCards();