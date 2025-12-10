// ========================================
// Memo Marathon Training
// ========================================

let memoTrainingSettings = {
    imageSize: 200,
    lockOrientation: true,
    allowMirror: false,
    pieceOrder: ['UBL', 'UB', 'URB', 'UR', 'UFR', 'UF', 'ULF', 'UL', 'DLF', 'DF', 'DFR', 'DR', 'DRB', 'DB', 'DLB', 'DL'],
    errorMode: 'friendly', // 'friendly' or 'punish'
    trainingMode: 'time-attack', // 'time-attack', 'survival', 'marathon'
    timeAttackDuration: 120, // seconds (1, 2, 3, 5, 8, or 10 minutes)
    marathonTarget: 25 // 25, 50, 75, or 100 cases
};

let memoCurrentScramble = '';
let memoCurrentHex = '';
let memoTrueHex = ''; // For hitboxes
let memoClickedPieces = [];
let memoExpectedOrder = [];
let memoRBLInfo = { rul: 0, rdl: 0 };
let memoMirrorApplied = false;
let memoOrderClickSequence = [];

let memoTrainingState = {
    isActive: false,
    mode: null,
    startTime: null,
    timerInterval: null,
    correctCount: 0,
    errorCount: 0,
    incompleteCases: 0,
    totalCases: 0,
    currentCaseIndex: 0,
    mistakesInSurvival: 0,
    caseCompleted: false,
    inputLocked: false
};

function loadMemoTrainingSettings() {
    const saved = localStorage.getItem('sq1MemoTrainingSettings');
    if (saved) {
        try {
            memoTrainingSettings = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading memo training settings:', e);
        }
    }
    loadMemoSelectedCases();
}

function saveMemoTrainingSettings() {
    localStorage.setItem('sq1MemoTrainingSettings', JSON.stringify(memoTrainingSettings));
}

function openMemoTrainingModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="width:100vw;height:100vh;max-width:100vw;margin:0;border:none;border-radius:0;display:flex;flex-direction:column;">
            <div class="modal-header" style="background:#333;color:#fff;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                <div style="display:flex;align-items:center;gap:15px;flex:1;">
                    <h3 style="color:#fff;margin:0;">Memo Marathon Training</h3>
                    ${!STATE.settings.personalization.hideInstructions ? `<button onclick="openMemoInstructionModal()" title="Instructions" style="background:none;border:1px solid #666;border-radius:50%;cursor:pointer;color:#ddd;font-size:12px;font-weight:bold;font-family:serif;width:20px;height:20px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;" onmouseover="this.style.borderColor='#aaa';this.style.color='#fff'" onmouseout="this.style.borderColor='#666';this.style.color='#ddd'">i</button>` : ''}
                </div>
                <div style="display:flex;gap:10px;">
                    <button class="icon-btn" id="memoSettingsBtn" title="Settings" style="background:#555;">
                        <img src="res/trainingSettings.svg" style="width:16px;height:16px;">
                    </button>
                    <button class="close-btn" id="memoCloseBtn" style="color:#fff;">×</button>
                </div>
            </div>
            <div class="modal-body" style="flex:1;padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:20px;">
                <div id="selectedCasesInfo" style="font-size:13px;">
                    No cases selected
                </div>
                
                <div id="memoTrainingArea" style="display:none;flex-direction:column;align-items:center;gap:15px;flex:1;">
                    <div id="caseBiodata" style="width:100%;max-width:800px;text-align:center;">
                        <div style="font-size:13px;color:#666;margin-bottom:5px;" id="biodataPath"></div>
                        <div style="font-size:16px;font-family:monospace;font-weight:500;margin-bottom:5px;" id="biodataAlgorithm"></div>
                        <div style="font-size:12px;color:#888;" id="biodataTransform"></div>
                    </div>
                    
                    <div style="position:relative;display:inline-block;">
                        <div id="memoImageContainer" style="position:relative;display:inline-block;"></div>
                        <div id="memoStatsBox" style="position:absolute;top:-80px;right:-20px;background:rgba(255,255,255,0.95);padding:10px 15px;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.1);font-size:14px;cursor:move;user-select:none;">
                            <div style="margin-bottom:5px;"><span style="font-weight:600;" id="memoProgressDisplay">Cases: 0 / 0</span></div>
                            <div style="margin-bottom:5px;"><span style="font-weight:600;" id="memoTimerDisplay">Time: 0:00</span></div>
                            <div style="display:flex;gap:15px;font-size:13px;">
                                <div id="memoCorrectContainer">✓ <span id="memoCorrectCount" style="color:#22c55e;font-weight:600;">0</span></div>
                                <div id="memoErrorContainer">✗ <span id="memoErrorCount" style="color:#ef4444;font-weight:600;">0</span></div>
                                <div id="memoIncompleteContainer" style="display:none;">⊘ <span id="memoIncompleteCount" style="color:#f59e0b;font-weight:600;">0</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display:flex;gap:10px;">
                        <button class="btn" id="memoNextBtn" style="display:none;">Skip Case</button>
                        <button class="btn" id="memoStopBtn" style="display:none;">Stop Training</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    loadMemoTrainingSettings();

    document.getElementById('memoNextBtn').addEventListener('click', () => {
        // Don't allow skipping if training is already ended
        if (!memoTrainingState.isActive) {
            return;
        }
        
        // If case is not completed, count as incomplete
        if (!memoTrainingState.caseCompleted) {
            memoTrainingState.incompleteCases++;
            memoTrainingState.totalCases++;
            
            // For survival mode, skipped cases count as mistakes
            if (memoTrainingSettings.trainingMode === 'survival') {
                memoTrainingState.mistakesInSurvival++;
                if (memoTrainingState.mistakesInSurvival >= 5) {
                    endTrainingSession();
                    return;
                }
            }
            
            // Check if training should end (marathon mode)
            if (memoTrainingSettings.trainingMode === 'marathon') {
                // Friendly mode: only count solved + skipped
                // Punish mode: count solved + skipped + mistakes
                const encounteredCases = memoTrainingSettings.errorMode === 'friendly'
                    ? memoTrainingState.correctCount + memoTrainingState.incompleteCases
                    : memoTrainingState.correctCount + memoTrainingState.incompleteCases + memoTrainingState.errorCount;
                if (encounteredCases >= memoTrainingSettings.marathonTarget) {
                    endTrainingSession();
                    return;
                }
            }
            
            updateMemoProgressDisplay();
        }
        loadNextMemoCase();
    });
    document.getElementById('memoStopBtn').addEventListener('click', () => {
        showMemoConfirm('Are you sure you want to stop training?', () => {
            endTrainingSession();
        });
    });
    document.getElementById('memoSettingsBtn').addEventListener('click', () => openSettingsModal('memo'));
    document.getElementById('memoCloseBtn').addEventListener('click', () => modal.remove());

    updateSelectedCasesInfo();
    
    // Make stats box draggable
    setupDraggableStatsBox();

    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

function setupDraggableStatsBox() {
    const statsBox = document.getElementById('memoStatsBox');
    if (!statsBox) return;
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    
    statsBox.addEventListener('mousedown', (e) => {
        isDragging = true;
        initialX = e.clientX - (statsBox.offsetLeft || 0);
        initialY = e.clientY - (statsBox.offsetTop || 0);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        statsBox.style.left = currentX + 'px';
        statsBox.style.top = currentY + 'px';
        statsBox.style.right = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

let memoSelectedCases = [];

function showMemoAlert(message, title = 'Alert') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width:400px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <p style="margin:0;">${message}</p>
            </div>
            <div style="padding:15px;text-align:right;border-top:1px solid #ddd;">
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">OK</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function showTemporaryMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #666;
        color: white;
        padding: 15px 30px;
        border-radius: 4px;
        font-weight: 500;
        z-index: 10000;
        animation: fadeInOut 0.3s ease-out;
    `;
    messageDiv.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.3s';
        setTimeout(() => messageDiv.remove(), 300);
    }, 2000);
}

function showMemoConfirm(message, onConfirm, title = 'Confirm') {
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
                <p style="margin:0;">${message}</p>
            </div>
            <div style="padding:15px;text-align:right;border-top:1px solid #ddd;display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" id="memoConfirmBtn">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('memoConfirmBtn').addEventListener('click', () => {
        modal.remove();
        onConfirm();
    });
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function openCaseSelectionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    // Collect all cases
    const allCases = [];
    STATE.cards.forEach((card, cardIdx) => {
        if (!card.cases) return;
        card.cases.forEach((caseItem, caseIdx) => {
            // Skip cases with no algorithm
            if (!caseItem.solution || caseItem.solution.trim() === '' || caseItem.solution.toLowerCase() === 'no algorithm') {
                return;
            }
            allCases.push({
                cardIdx,
                caseIdx,
                cardTitle: card.title || 'Untitled',
                parity: caseItem.type === 'parity' ? 'Odd' : 'Even',
                orientation: caseItem.variant === 'original' ? 'Original' : 'Mirror',
                algorithm: caseItem.solution || 'No algorithm',
                selected: isCaseSelected(cardIdx, caseIdx)
            });
        });
    });

    function renderCaseTable(searchQuery = '') {
        const filteredCases = searchQuery 
            ? allCases.filter(c => c.cardTitle.toLowerCase().includes(searchQuery.toLowerCase()))
            : allCases;
            
        let tableHtml = '';
        filteredCases.forEach((caseData, idx) => {
            tableHtml += `
                <tr>
                    <td style="text-align:center;">
                        <input type="checkbox" ${caseData.selected ? 'checked' : ''} 
                               onchange="toggleCaseSelection(${caseData.cardIdx}, ${caseData.caseIdx}, this.checked)">
                    </td>
                    <td>${caseData.cardTitle}</td>
                    <td>${caseData.parity}</td>
                    <td>${caseData.orientation}</td>
                    <td>Angle ${caseData.caseIdx + 1}</td>
                    <td style="font-family:monospace;font-size:11px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${caseData.algorithm}</td>
                </tr>
            `;
        });
        return tableHtml || '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">No cases found</td></tr>';
    }

    modal.innerHTML = `
        <div class="modal-content" style="max-width:90vw;max-height:90vh;">
            <div class="modal-header">
                <h3>Select Cases for Training</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="overflow:auto;">
                <div style="margin-bottom:15px;">
                    <input type="text" id="memoCaseSearchInput" class="settings-input" placeholder="Search by card name..." 
                           style="width:100%;padding:8px;margin-bottom:10px;">
                </div>
                <div style="margin-bottom:15px;display:flex;gap:10px;">
                    <button class="btn" onclick="selectAllCases()">Select All</button>
                    <button class="btn" onclick="deselectAllCases()">Deselect All</button>
                </div>
                <div style="overflow-x:auto;">
                    <table class="variable-table" style="min-width:800px;">
                        <thead>
                            <tr>
                                <th style="width:60px;text-align:center;">Select</th>
                                <th style="width:150px;">Card Name</th>
                                <th style="width:80px;">Parity</th>
                                <th style="width:100px;">Orientation</th>
                                <th style="width:80px;">Angle</th>
                                <th>Algorithm</th>
                            </tr>
                        </thead>
                        <tbody id="caseSelectionTableBody">
                            ${renderCaseTable()}
                        </tbody>
                    </table>
                </div>
                <div style="margin-top:15px;">
                    <button class="btn btn-primary" onclick="saveCaseSelection()">Done</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add search functionality
    document.getElementById('memoCaseSearchInput').addEventListener('input', (e) => {
        const searchQuery = e.target.value.toLowerCase();
        document.getElementById('caseSelectionTableBody').innerHTML = renderCaseTable(searchQuery);
    });

    window.toggleCaseSelection = function(cardIdx, caseIdx, selected) {
        const key = `${cardIdx}-${caseIdx}`;
        if (selected) {
            if (!memoSelectedCases.includes(key)) {
                memoSelectedCases.push(key);
            }
        } else {
            const idx = memoSelectedCases.indexOf(key);
            if (idx > -1) {
                memoSelectedCases.splice(idx, 1);
            }
        }
        saveMemoSelectedCases();
    };

    window.selectAllCases = function() {
        memoSelectedCases = [];
        allCases.forEach(caseData => {
            const key = `${caseData.cardIdx}-${caseData.caseIdx}`;
            if (!memoSelectedCases.includes(key)) {
                memoSelectedCases.push(key);
            }
            caseData.selected = true;
        });
        saveMemoSelectedCases();
        const searchQuery = document.getElementById('memoCaseSearchInput').value.toLowerCase();
        document.getElementById('caseSelectionTableBody').innerHTML = renderCaseTable(searchQuery);
    };

    window.deselectAllCases = function() {
        memoSelectedCases = [];
        allCases.forEach(caseData => {
            caseData.selected = false;
        });
        saveMemoSelectedCases();
        const searchQuery = document.getElementById('memoCaseSearchInput').value.toLowerCase();
        document.getElementById('caseSelectionTableBody').innerHTML = renderCaseTable(searchQuery);
    };

    window.saveCaseSelection = function() {
        modal.remove();
        updateSelectedCasesInfo();
        delete window.toggleCaseSelection;
        delete window.selectAllCases;
        delete window.deselectAllCases;
        delete window.saveCaseSelection;
    };

    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

function isCaseSelected(cardIdx, caseIdx) {
    return memoSelectedCases.includes(`${cardIdx}-${caseIdx}`);
}

function saveMemoSelectedCases() {
    localStorage.setItem('sq1MemoSelectedCases', JSON.stringify(memoSelectedCases));
}

function loadMemoSelectedCases() {
    const saved = localStorage.getItem('sq1MemoSelectedCases');
    if (saved) {
        try {
            memoSelectedCases = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading memo selected cases:', e);
            memoSelectedCases = [];
        }
    }
}

function updateSelectedCasesInfo() {
    const infoEl = document.getElementById('selectedCasesInfo');
    if (!infoEl) return;
    
    if (memoSelectedCases.length === 0) {
        infoEl.innerHTML = `
            <div style="text-align:center;padding:40px;color:#999;">
                <p style="margin-bottom:15px;">No cases selected</p>
                <button class="btn" onclick="openCaseSelectionModal()">Select Cases</button>
            </div>
        `;
    } else {
        infoEl.innerHTML = `
            <div style="display:flex;gap:10px;align-items:center;justify-content:center;max-width:600px;margin:0 auto;">
                <button class="btn" onclick="openCaseSelectionModal()">${memoSelectedCases.length} case(s) selected</button>
                <button class="btn" onclick="openModeSelectionModal()">Select Mode</button>
                <button class="btn btn-primary" onclick="startMemoTrainingDirectly()">Start Training</button>
            </div>
        `;
    }
}

function openModeSelectionModal() {
    if (memoSelectedCases.length === 0) {
        showMemoAlert('Please select at least one case');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;height:auto;">
            <div class="modal-header">
                <h3>Select Training Mode</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="padding:20px;">
                <div class="settings-group">
                    <label class="settings-label">Mode</label>
                    <select id="modeSelect" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
                        <option value="time-attack" ${memoTrainingSettings.trainingMode === 'time-attack' ? 'selected' : ''}>Time Attack</option>
                        <option value="survival" ${memoTrainingSettings.trainingMode === 'survival' ? 'selected' : ''}>Survival (5 mistakes)</option>
                        <option value="marathon" ${memoTrainingSettings.trainingMode === 'marathon' ? 'selected' : ''}>Marathon</option>
                    </select>
                </div>
                
                <div class="settings-group" id="timeAttackSettings" style="display:${memoTrainingSettings.trainingMode === 'time-attack' ? 'block' : 'none'};">
                    <label class="settings-label">Duration</label>
                    <select id="timeAttackDuration" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
                        <option value="60" ${memoTrainingSettings.timeAttackDuration === 60 ? 'selected' : ''}>1 minute</option>
                        <option value="120" ${memoTrainingSettings.timeAttackDuration === 120 ? 'selected' : ''}>2 minutes</option>
                        <option value="180" ${memoTrainingSettings.timeAttackDuration === 180 ? 'selected' : ''}>3 minutes</option>
                        <option value="300" ${memoTrainingSettings.timeAttackDuration === 300 ? 'selected' : ''}>5 minutes</option>
                        <option value="480" ${memoTrainingSettings.timeAttackDuration === 480 ? 'selected' : ''}>8 minutes</option>
                        <option value="600" ${memoTrainingSettings.timeAttackDuration === 600 ? 'selected' : ''}>10 minutes</option>
                    </select>
                </div>
                
                <div class="settings-group" id="marathonSettings" style="display:${memoTrainingSettings.trainingMode === 'marathon' ? 'block' : 'none'};">
                    <label class="settings-label">Target</label>
                    <select id="marathonTarget" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
                        <option value="25" ${memoTrainingSettings.marathonTarget === 25 ? 'selected' : ''}>25 cases</option>
                        <option value="50" ${memoTrainingSettings.marathonTarget === 50 ? 'selected' : ''}>50 cases</option>
                        <option value="75" ${memoTrainingSettings.marathonTarget === 75 ? 'selected' : ''}>75 cases</option>
                        <option value="100" ${memoTrainingSettings.marathonTarget === 100 ? 'selected' : ''}>100 cases</option>
                    </select>
                </div>
                
                <div class="settings-group" id="errorModeGroup" style="display:${memoTrainingSettings.trainingMode === 'survival' ? 'none' : 'block'};">
                    <label class="settings-label">Error Mode</label>
                    <select id="errorModeSelect" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
                        <option value="friendly" ${memoTrainingSettings.errorMode === 'friendly' ? 'selected' : ''}>Friendly (undo last click)</option>
                        <option value="punish" ${memoTrainingSettings.errorMode === 'punish' ? 'selected' : ''}>Punish (next scramble)</option>
                    </select>
                </div>
                
                <button class="btn btn-primary" onclick="startMemoTrainingWithMode()" style="width:100%;margin-top:15px;">Start</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for mode changes
    document.getElementById('modeSelect').addEventListener('change', (e) => {
        const mode = e.target.value;
        document.getElementById('timeAttackSettings').style.display = mode === 'time-attack' ? 'block' : 'none';
        document.getElementById('marathonSettings').style.display = mode === 'marathon' ? 'block' : 'none';
        document.getElementById('errorModeGroup').style.display = mode === 'survival' ? 'none' : 'block';
    });
    
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

function startMemoTrainingWithMode() {
    // Save settings
    memoTrainingSettings.trainingMode = document.getElementById('modeSelect').value;
    // Force punish mode for survival
    if (memoTrainingSettings.trainingMode === 'survival') {
        memoTrainingSettings.errorMode = 'punish';
    } else {
        memoTrainingSettings.errorMode = document.getElementById('errorModeSelect').value;
    }
    memoTrainingSettings.timeAttackDuration = parseInt(document.getElementById('timeAttackDuration').value);
    memoTrainingSettings.marathonTarget = parseInt(document.getElementById('marathonTarget').value);
    saveMemoTrainingSettings();
    
    // Close only the mode selection modal, not the main training modal
    const modeModal = event.target.closest('.modal');
    if (modeModal) modeModal.remove();
    
    // Initialize training state
    memoTrainingState = {
        isActive: true,
        mode: memoTrainingSettings.trainingMode,
        startTime: null,
        timerInterval: null,
        correctCount: 0,
        errorCount: 0,
        incompleteCases: 0,
        totalCases: 0,
        currentCaseIndex: 0,
        mistakesInSurvival: 0,
        caseCompleted: false,
        timerStarted: false,
        inputLocked: false
    };
    
    // Show training area and stop button
    const trainingArea = document.getElementById('memoTrainingArea');
    const stopBtn = document.getElementById('memoStopBtn');
    if (trainingArea) trainingArea.style.display = 'flex';
    if (stopBtn) stopBtn.style.display = 'inline-block';
    
    // Update label text based on mode and error mode
    updateLiveScorecardLabels();
    
    // Don't start timer yet - will start on first click
    
    // Update displays
    updateMemoProgressDisplay();
    
    // Load first case
    loadNextMemoCase();
}

function startTimerInterval() {
    if (memoTrainingState.timerInterval) {
        clearInterval(memoTrainingState.timerInterval);
    }
    
    memoTrainingState.timerInterval = setInterval(() => {
        updateTimerDisplay();
    }, 1000);
}

function updateLiveScorecardLabels() {
    const mode = memoTrainingSettings.trainingMode;
    const errorMode = memoTrainingSettings.errorMode;
    
    const correctContainer = document.getElementById('memoCorrectContainer');
    const errorContainer = document.getElementById('memoErrorContainer');
    const incompleteContainer = document.getElementById('memoIncompleteContainer');
    
    if (!correctContainer || !errorContainer) return;
    
    // Reset to defaults
    correctContainer.innerHTML = '✓ <span id="memoCorrectCount" style="color:#22c55e;font-weight:600;">0</span>';
    errorContainer.innerHTML = '✗ <span id="memoErrorCount" style="color:#ef4444;font-weight:600;">0</span>';
    
    if (errorMode === 'friendly') {
        // Friendly mode: show errors
        correctContainer.innerHTML = '✓ <span id="memoCorrectCount" style="color:#22c55e;font-weight:600;">0</span>';
        errorContainer.innerHTML = '✗ <span id="memoErrorCount" style="color:#ef4444;font-weight:600;">0</span>';
        if (incompleteContainer) incompleteContainer.style.display = 'none';
    } else {
        // Punish mode
        if (mode === 'survival') {
            correctContainer.innerHTML = 'Errors: <span id="memoCorrectCount" style="color:#ef4444;font-weight:600;">0</span>';
            errorContainer.style.display = 'none';
            if (incompleteContainer) incompleteContainer.style.display = 'none';
        } else {
            correctContainer.innerHTML = 'Mistakes: <span id="memoCorrectCount" style="color:#ef4444;font-weight:600;">0</span>';
            errorContainer.innerHTML = 'Skipped: <span id="memoErrorCount" style="color:#f59e0b;font-weight:600;">0</span>';
            if (incompleteContainer) incompleteContainer.style.display = 'none';
        }
    }
}

function startMemoTraining() {
    openModeSelectionModal();
}

function startMemoTrainingDirectly() {
    if (memoSelectedCases.length === 0) {
        showMemoAlert('Please select at least one case');
        return;
    }
    
    // Initialize training state
    memoTrainingState = {
        isActive: true,
        mode: memoTrainingSettings.trainingMode,
        startTime: null, // Will be set on first click
        timerInterval: null,
        correctCount: 0,
        errorCount: 0,
        incompleteCases: 0,
        totalCases: 0,
        currentCaseIndex: 0,
        mistakesInSurvival: 0,
        caseCompleted: false,
        timerStarted: false,
        inputLocked: false
    };

    // Show training area and stop button
    const trainingArea = document.getElementById('memoTrainingArea');
    const stopBtn = document.getElementById('memoStopBtn');
    if (trainingArea) trainingArea.style.display = 'flex';
    if (stopBtn) stopBtn.style.display = 'inline-block';
    
    // Don't start timer yet - will start on first click
    
    // Update displays
    updateMemoProgressDisplay();
    
    // Load first case
    loadNextMemoCase();
}

function loadNextMemoCase() {
    
    if (memoSelectedCases.length === 0) {
        showMemoAlert('No cases selected');
        return;
    }
    
    // Pick random case
    const randomKey = memoSelectedCases[Math.floor(Math.random() * memoSelectedCases.length)];
    const [cardIdx, caseIdx] = randomKey.split('-').map(Number);
    
    const card = STATE.cards[cardIdx];
    const caseItem = card.cases[caseIdx];
    
    // Generate training scramble using the same logic as solves training
    try {
        const normalized = window.ScrambleNormalizer.normalizeScramble(caseItem.solution || '');
        memoCurrentScramble = normalized;
        
        const result = window.TrainingModule.generateTrainingScramble(normalized);
        
        // Apply RBL transformation if lock orientation is off
        let finalHex = result.randomHex;
        let trueHex = result.originalHex; // This is for hitboxes
        let rul = 0, rdl = 0;
        let mirrorApplied = false;
        
        if (!memoTrainingSettings.lockOrientation) {
            const rblResult = applyRBLToHex(finalHex);
            finalHex = rblResult.hex;
            rul = rblResult.rul;
            rdl = rblResult.rdl;
            
            // Apply same RBL to true hex for hitboxes
            trueHex = applyRBL(trueHex, rul, rdl);
            
            // Check if this is a symmetric shape for mirroring
            const shapeIndex = hexToShapeIndex(finalHex);
            const isSymmetric = NO_MIRROR_SHAPES.has(shapeIndex);
            
            // Apply mirror transformation if allowed and not symmetric
            if (memoTrainingSettings.allowMirror && !isSymmetric && Math.random() < 0.5) {
                finalHex = applyMirrorToHex(finalHex);
                trueHex = applyMirrorToHex(trueHex);
                mirrorApplied = true;
            }
        }
        
        memoCurrentHex = finalHex;
        memoTrueHex = trueHex; // Store for hitboxes
        memoRBLInfo = { rul, rdl };
        memoMirrorApplied = mirrorApplied;
        
        // Update biodata with path format
        const pathParts = [
            card.title || 'Untitled',
            caseItem.variant === 'original' ? 'original' : 'mirror',
            caseItem.type === 'parity' ? 'odd' : 'even',
            `angle${caseIdx + 1}`
        ];
        document.getElementById('biodataPath').textContent = pathParts.join(' / ');
        document.getElementById('biodataAlgorithm').textContent = caseItem.solution || 'No algorithm';
        
        // Update transform info
        const transformEl = document.getElementById('biodataTransform');
        if (!memoTrainingSettings.lockOrientation) {
            let transformText = `RBL: (${rul}, ${rdl})`;
            if (mirrorApplied) {
                transformText += ' | Mirrored';
            }
            transformEl.textContent = transformText;
        } else {
            transformEl.textContent = '';
        }
        
        memoClickedPieces = [];
        memoTrainingState.caseCompleted = false;
        
        // Show stats box if hidden
        const statsBox = document.getElementById('memoStatsBox');
        if (statsBox) statsBox.style.display = 'block';
        
        // Show next button
        const nextBtn = document.getElementById('memoNextBtn');
        if (nextBtn) nextBtn.style.display = 'inline-block';
        
        generateMemoVisualization();
      
    } catch (error) {
        showMemoAlert('Error: ' + error.message, 'Error');
        console.error(error);
    }
}

function generateMemoTraining() {
    const input = document.getElementById('memoAlgorithmInput').value.trim();
    
    if (!input) {
        showMemoAlert('Please enter an algorithm');
        return;
    }

    try {
        // Normalize the algorithm
        const normalized = window.ScrambleNormalizer.normalizeScramble(input);
        memoCurrentScramble = normalized;
        // Convert to hex
        const inverted = pleaseInvertThisScrambleForSolutionVisualization(normalized);
        const cubeState = applyScrambleToCubePlease(inverted);        
        const hexCode = pleaseEncodeMyCubeStateToHexNotation(cubeState);
        
        if (hexCode.startsWith('Error:')) {
            showMemoAlert('Error generating visualization: ' + hexCode, 'Error');
            return;
        }
        
        // Apply RBL if needed
        let finalHex = hexCode;
        if (!memoTrainingSettings.lockOrientation) {
            const rblResult = applyRBLToHex(finalHex);
            finalHex = rblResult.hex;
        }
        
        // Apply mirror if needed
        if (memoTrainingSettings.allowMirror && !memoTrainingSettings.lockOrientation && Math.random() < 0.5) {
            finalHex = applyMirrorToHex(finalHex);
        }
        
        memoCurrentHex = finalHex;
        
        // Validate hex code
        if (!finalHex || finalHex.length < 24) {
            showMemoAlert('Invalid hex code generated. Please check your algorithm.', 'Error');
            return;
        }
        
        // Generate expected order
        memoExpectedOrder = memoTrainingSettings.pieceOrder.map(pieceCode => {
            const mapping = STATE.settings.colorMappings.find(m => m.pieceCode === pieceCode);
            return mapping ? mapping.hex.toLowerCase() : null;
        }).filter(Boolean);
        
        // Reset clicked pieces
        memoClickedPieces = [];
        document.getElementById('memoClickedOutput').value = '';
        
        // Show training area
        document.getElementById('memoTrainingArea').style.display = 'flex';
        
        // Generate visualization with hitboxes
        generateMemoVisualization();
           
    } catch (error) {
        showMemoAlert('Error: ' + error.message, 'Error');
        console.error(error);
    }
}

function generateMemoVisualization() {    
    const container = document.getElementById('memoImageContainer');
    container.innerHTML = '';
    
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
        
        // Build piece code to hex map from settings
        const pieceCodeToHex = {};
        const hexToPieceCode = {};
        STATE.settings.colorMappings.forEach(mapping => {
            pieceCodeToHex[mapping.pieceCode] = mapping.hex;
            hexToPieceCode[mapping.hex] = mapping.pieceCode;
        });
        
        // Build piece labels map for display only (using hex as keys)
        const pieceLabels = {};
        STATE.settings.colorMappings.forEach(mapping => {
            if (mapping.label) {
                pieceLabels[mapping.hex] = mapping.label;
            }
        });
        
        // Generate base image (decoy - fully colored, randomized)
        const baseImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
            memoCurrentHex, 
            memoTrainingSettings.imageSize, 
            colorScheme, 
            5, 
            false,
            null
        );
        
        // Generate invisible hitbox overlay from true hex (real scramble)
        const hitboxOverlay = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
            memoTrueHex, 
            memoTrainingSettings.imageSize, 
            colorScheme, 
            5, 
            true, // Show labels
            pieceLabels
        );
        
        // Create wrapper with both layers
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.webkitTapHighlightColor = 'transparent';
        wrapper.style.webkitTouchCallout = 'none';
        wrapper.style.userSelect = 'none';
        wrapper.innerHTML = baseImage;
        
        // Add invisible hitbox overlay on top
        const overlayDiv = document.createElement('div');
        overlayDiv.style.position = 'absolute';
        overlayDiv.style.top = '0';
        overlayDiv.style.left = '0';
        overlayDiv.style.width = '100%';
        overlayDiv.style.height = '100%';
        overlayDiv.style.pointerEvents = 'none';
        overlayDiv.style.webkitTapHighlightColor = 'transparent';
        overlayDiv.style.webkitTouchCallout = 'none';
        overlayDiv.style.userSelect = 'none';
        overlayDiv.innerHTML = hitboxOverlay;
        
        // Apply styles to all SVG elements to prevent tap highlights
        const svgElements = overlayDiv.querySelectorAll('svg, svg *');
        svgElements.forEach(el => {
            el.style.webkitTapHighlightColor = 'transparent';
            el.style.webkitTouchCallout = 'none';
            el.style.userSelect = 'none';
        });
        
        // Make all polygons in overlay invisible and clickable (hitboxes)
        const allPolygons = overlayDiv.querySelectorAll('polygon');
        const allTexts = overlayDiv.querySelectorAll('text');
        
        // Create a map of labels to text elements
        const labelToTextMap = new Map();
        allTexts.forEach(textEl => {
            const labelText = textEl.textContent.trim();
            labelToTextMap.set(labelText, textEl);
            // Hide all labels initially
            textEl.style.opacity = '0';
            textEl.style.pointerEvents = 'none';
        });
        
        // Make each polygon a clickable hitbox
            allPolygons.forEach((polygon, polyIndex) => {            
                // Make polygon completely transparent but clickable
                polygon.style.fill = 'transparent';
                polygon.style.stroke = 'transparent';
                polygon.style.pointerEvents = 'auto';
                polygon.style.cursor = 'pointer';
                polygon.style.webkitTapHighlightColor = 'transparent';
                polygon.style.userSelect = 'none';
            
            // Find associated text element (it should be a sibling)
            const parentSvg = polygon.closest('svg');
            const textsInSvg = parentSvg ? parentSvg.querySelectorAll('text') : [];
            
            // Get polygon center
            const points = polygon.getAttribute('points').split(' ');
            let sumX = 0, sumY = 0, count = 0;
            points.forEach(point => {
                const [x, y] = point.split(',').map(Number);
                sumX += x;
                sumY += y;
                count++;
            });
            const centerX = sumX / count;
            const centerY = sumY / count;
            
            // Find closest text element
            let closestText = null;
            let minDistance = Infinity;
            let pieceHex = null;
            
            textsInSvg.forEach(textEl => {
                const x = parseFloat(textEl.getAttribute('x'));
                const y = parseFloat(textEl.getAttribute('y'));
                const distance = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestText = textEl;
                }
            });
            
            if (closestText && minDistance < 100) {
                const labelText = closestText.textContent.trim();
                
                // Get the hex value directly from the scramble at this position
                // The text elements are created in order by the visualization library
                const parentSvg = closestText.closest('svg');
                const allSvgs = overlayDiv.querySelectorAll('svg');
                const isBottomLayer = parentSvg === allSvgs[1];
                
                // Find the index of this text element among all texts in its layer
                const textsInLayer = parentSvg.querySelectorAll('text');
                const textIndex = Array.from(textsInLayer).indexOf(closestText);
                
                // Build the piece hex by parsing through the layer
                let currentPieceIndex = 0;
                let hexIndex = isBottomLayer ? 13 : 0;
                const endIndex = isBottomLayer ? 25 : 12;
                
                while (hexIndex < endIndex && currentPieceIndex <= textIndex) {
                    const char = memoTrueHex[hexIndex].toLowerCase();
                    const isCorner = ['1', '3', '5', '7', '9', 'b', 'd', 'f'].includes(char);
                    
                    if (currentPieceIndex === textIndex) {
                        // Found our piece
                        if (isCorner && hexIndex + 1 < endIndex) {
                            pieceHex = char + char; // Corner piece like '11', '33', etc.
                        } else {
                            pieceHex = char; // Edge piece like '0', '2', etc.
                        }
                        break;
                    }
                    
                    currentPieceIndex++;
                    if (isCorner) {
                        hexIndex += 2; // Corner takes 2 slots
                    } else {
                        hexIndex += 1; // Edge takes 1 slot
                    }
                    
                    // Skip separator
                    if (hexIndex === 12) hexIndex = 13;
                }
                
                // Find piece code for display (optional, just for reference)
                let pieceCode = null;
                for (const [hex, code] of Object.entries(hexToPieceCode)) {
                    if (hex.toLowerCase() === pieceHex) {
                        pieceCode = code;
                        break;
                    }
                }
                
                if (pieceHex) {                    
                    // Add click handler for desktop
                    polygon.addEventListener('click', (e) => {
                        if (memoTrainingState.inputLocked) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }
                        e.stopPropagation();
                        handlePieceClick(pieceCode, closestText, polygon, pieceHex);
                    });
                    
                    // Add touch handler for mobile
                    polygon.addEventListener('touchend', (e) => {
                        if (memoTrainingState.inputLocked) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        handlePieceClick(pieceCode, closestText, polygon, pieceHex);
                    }, { passive: false });
                    
                    // Update cursor based on clicked state
                    polygon.addEventListener('mouseenter', () => {
                        const isClicked = polygon.dataset.clicked === 'true';
                        const cursorStyle = isClicked ? 'default' : 'pointer';
                        
                        if (!isClicked) {
                            polygon.style.cursor = 'pointer';
                        } else {
                            polygon.style.cursor = 'default';
                        }
                    });
                }
            }
        });
        
        wrapper.appendChild(overlayDiv);
        
        // Add comprehensive input blocker overlay when locked
        const blockerOverlay = document.createElement('div');
        blockerOverlay.id = 'inputBlockerOverlay';
        blockerOverlay.style.position = 'absolute';
        blockerOverlay.style.top = '0';
        blockerOverlay.style.left = '0';
        blockerOverlay.style.width = '100%';
        blockerOverlay.style.height = '100%';
        blockerOverlay.style.zIndex = '9999';
        blockerOverlay.style.display = 'none';
        blockerOverlay.style.backgroundColor = 'transparent';
        
        // Block all interaction types
        ['click', 'touchstart', 'touchend', 'touchmove', 'mousedown', 'mouseup', 'pointerdown', 'pointerup'].forEach(eventType => {
            blockerOverlay.addEventListener(eventType, (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, { passive: false, capture: true });
        });
        
        wrapper.appendChild(blockerOverlay);
        container.appendChild(wrapper);
        
    } catch (error) {
        console.error('Error generating memo visualization:', error);
        container.innerHTML = '<div style="color:#e53e3e;">Error generating visualization</div>';
    }
}

function handlePieceClick(pieceCode, textElement, polygon, hexValue) {    
    // Check if input is locked
    if (memoTrainingState.inputLocked) {
        return;
    }
    
    // Check if THIS specific polygon has already been clicked
    if (polygon.dataset.clicked === 'true') {
        return;
    }
    
    // Check if case is already completed
    if (memoTrainingState.caseCompleted) {
        return;
    }
    
    // Start timer on first click
    if (!memoTrainingState.timerStarted) {
        memoTrainingState.startTime = Date.now();
        memoTrainingState.timerStarted = true;
        startTimerInterval();
        updateMemoProgressDisplay();
    }
    
    // Validate the click - use hex value for matching (unique identifier)
    const expectedIndex = memoClickedPieces.length;
    const expectedHex = memoTrainingSettings.pieceOrder[expectedIndex];
    
    if (!expectedHex || hexValue.toLowerCase() !== expectedHex.toLowerCase()) {
        // Wrong piece clicked!
        handleWrongPieceClick();
        return;
    }
    
    // Correct piece clicked - store the hex value
    memoClickedPieces.push(hexValue.toLowerCase());
    
    // Mark this polygon as clicked
    polygon.dataset.clicked = 'true';    
    // Show label by making text visible with white fill and black outline
    if (textElement) {
        textElement.style.opacity = '1';
        textElement.style.fill = 'white';
        textElement.style.stroke = 'black';
        textElement.style.strokeWidth = '3';
        textElement.setAttribute('paint-order', 'stroke');
    }
    
    // Check if case is complete
    if (memoClickedPieces.length === memoTrainingSettings.pieceOrder.length) {
        handleCaseComplete();
    }
}

function handleWrongPieceClick() {
    // Only increment error count - don't increment totalCases here
    memoTrainingState.errorCount++;
    updateMemoProgressDisplay();
    
    if (memoTrainingSettings.errorMode === 'friendly') {
        // Friendly mode: just show a message, user can try again
        const container = document.getElementById('memoImageContainer');
        container.style.border = '3px solid #ef4444';
        setTimeout(() => {
            container.style.border = '';
        }, 500);
        
        // Play error sound (optional)
        playErrorSound();
        
    } else {
        // Punish mode: lock input, flash red and go to next scramble
        memoTrainingState.inputLocked = true;
        
        // Show input blocker overlay
        const blockerOverlay = document.getElementById('inputBlockerOverlay');
        if (blockerOverlay) blockerOverlay.style.display = 'block';
        
        const container = document.getElementById('memoImageContainer');
        const trainingArea = document.getElementById('memoTrainingArea');
        trainingArea.style.backgroundColor = '#fee';
        
        // Play error sound
        playErrorSound();
        
        setTimeout(() => {
            trainingArea.style.backgroundColor = '';
            
            // Don't increment totalCases here - it's already incremented
            // Just mark this case as incomplete (error in punish mode auto-advances)
            // The error count was already incremented above
            
            // Check survival mode
            if (memoTrainingSettings.trainingMode === 'survival') {
                memoTrainingState.mistakesInSurvival++;
                if (memoTrainingState.mistakesInSurvival >= 5) {
                    endTrainingSession();
                    return;
                }
            }
            
            // Check marathon mode
            if (memoTrainingSettings.trainingMode === 'marathon') {
                if (memoTrainingState.totalCases >= memoTrainingSettings.marathonTarget) {
                    endTrainingSession();
                    return;
                }
            }
            
            // Unlock input and load next case
            memoTrainingState.inputLocked = false;
            
            // Hide input blocker overlay
            const blockerOverlay = document.getElementById('inputBlockerOverlay');
            if (blockerOverlay) blockerOverlay.style.display = 'none';
            
            loadNextMemoCase();
        }, 500);
    }
}

function handleCaseComplete() {
    memoTrainingState.caseCompleted = true;
    memoTrainingState.correctCount++;
    memoTrainingState.totalCases++;
    updateMemoProgressDisplay();
    
    // Flash green screen
    const trainingArea = document.getElementById('memoTrainingArea');
    trainingArea.style.backgroundColor = '#d1fae5';
    
    // Check if training should end (marathon mode)
    if (memoTrainingSettings.trainingMode === 'marathon') {
        // Friendly mode: only count solved + skipped
        // Punish mode: count solved + skipped + mistakes
        const encounteredCases = memoTrainingSettings.errorMode === 'friendly'
            ? memoTrainingState.correctCount + memoTrainingState.incompleteCases
            : memoTrainingState.correctCount + memoTrainingState.incompleteCases + memoTrainingState.errorCount;
        if (encounteredCases >= memoTrainingSettings.marathonTarget) {
            setTimeout(() => {
                trainingArea.style.backgroundColor = '';
                endTrainingSession();
            }, 500);
            return;
        }
    }
    
    // Auto-advance to next scramble after 500ms
    setTimeout(() => {
        trainingArea.style.backgroundColor = '';
        loadNextMemoCase();
    }, 500);
}

function playErrorSound() {
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 200;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
    }
}

function updateMemoProgressDisplay() {
    const progressEl = document.getElementById('memoProgressDisplay');
    const timerEl = document.getElementById('memoTimerDisplay');
    const correctEl = document.getElementById('memoCorrectCount');
    const errorEl = document.getElementById('memoErrorCount');
    const incompleteContainer = document.getElementById('memoIncompleteContainer');
    const incompleteEl = document.getElementById('memoIncompleteCount');
    
    if (!progressEl || !correctEl || !errorEl) return;
    
    const mode = memoTrainingSettings.trainingMode;
    const errorMode = memoTrainingSettings.errorMode;
    
    const solvedCases = memoTrainingState.correctCount;
    
    // FRIENDLY MODE
    if (errorMode === 'friendly') {
        if (mode === 'time-attack') {
            // Progress: solved / encountered (solved + skipped, no errors)
            const encounteredCases = solvedCases + memoTrainingState.incompleteCases;
            progressEl.textContent = `Progress: ${solvedCases} / ${encounteredCases}`;
            correctEl.textContent = memoTrainingState.correctCount;
            errorEl.textContent = memoTrainingState.errorCount;
            if (incompleteContainer) incompleteContainer.style.display = 'none';
        } else if (mode === 'marathon') {
            // Target: 25/50/75/100, Progress: solved / encountered (solved + skipped, no errors)
            const encounteredCases = solvedCases + memoTrainingState.incompleteCases;
            progressEl.textContent = `Target: ${memoTrainingSettings.marathonTarget} | Progress: ${solvedCases} / ${encounteredCases}`;
            correctEl.textContent = memoTrainingState.correctCount;
            errorEl.textContent = memoTrainingState.errorCount;
            if (incompleteContainer) incompleteContainer.style.display = 'none';
        }
    }
    // PUNISH MODE
    else {
        if (mode === 'time-attack') {
            // Cases: solved / encountered (solved + skipped + mistakes)
            const encounteredCases = solvedCases + memoTrainingState.incompleteCases + memoTrainingState.errorCount;
            progressEl.textContent = `Cases: ${solvedCases} / ${encounteredCases}`;
            correctEl.textContent = memoTrainingState.errorCount; // Mistakes
            errorEl.textContent = memoTrainingState.incompleteCases; // Skipped
            if (incompleteContainer) incompleteContainer.style.display = 'none';
        } else if (mode === 'marathon') {
            // Target: 25/50/75/100, Progress: solved / encountered (solved + skipped + mistakes)
            const encounteredCases = solvedCases + memoTrainingState.incompleteCases + memoTrainingState.errorCount;
            progressEl.textContent = `Target: ${memoTrainingSettings.marathonTarget} | Progress: ${solvedCases} / ${encounteredCases}`;
            correctEl.textContent = memoTrainingState.errorCount; // Mistakes
            errorEl.textContent = memoTrainingState.incompleteCases; // Skipped
            if (incompleteContainer) incompleteContainer.style.display = 'none';
        } else if (mode === 'survival') {
            // Cases: just show solved count
            progressEl.textContent = `Cases: ${solvedCases}`;
            correctEl.textContent = memoTrainingState.errorCount + memoTrainingState.incompleteCases; // Errors (mistakes + skipped)
            errorEl.textContent = ''; // Not used in survival
            if (incompleteContainer) incompleteContainer.style.display = 'none';
        }
    }
    
    // Update timer
    if (memoTrainingState.isActive && memoTrainingState.startTime !== null) {
        updateTimerDisplay();
    }
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('memoTimerDisplay');
    if (!timerEl) return;
    
    // Don't update if training is not active or timer hasn't started
    if (!memoTrainingState.isActive || memoTrainingState.startTime === null) {
        return;
    }
    
    const elapsed = Math.floor((Date.now() - memoTrainingState.startTime) / 1000);
    
    if (memoTrainingSettings.trainingMode === 'time-attack') {
        const remaining = memoTrainingSettings.timeAttackDuration - elapsed;
        if (remaining <= 0) {
            endTrainingSession();
            return;
        }
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        timerEl.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerEl.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function endTrainingSession() {
    memoTrainingState.isActive = false;
    
    if (memoTrainingState.timerInterval) {
        clearInterval(memoTrainingState.timerInterval);
        memoTrainingState.timerInterval = null;
    }
    
    // Calculate final stats - only if timer was actually started
    let elapsed = 0;
    let minutes = 0;
    let seconds = 0;
    
    if (memoTrainingState.startTime !== null) {
        elapsed = Math.floor((Date.now() - memoTrainingState.startTime) / 1000);
        minutes = Math.floor(elapsed / 60);
        seconds = elapsed % 60;
    }
    
    const mode = memoTrainingSettings.trainingMode;
    const errorMode = memoTrainingSettings.errorMode;
    let resultsHtml = '';
    
    // Build training name
    let trainingName = '';
    if (mode === 'time-attack') {
        const durationMin = Math.floor(memoTrainingSettings.timeAttackDuration / 60);
        trainingName = `Time Attack, ${durationMin} min, ${errorMode}`;
    } else if (mode === 'marathon') {
        trainingName = `Marathon, ${memoTrainingSettings.marathonTarget} cases, ${errorMode}`;
    } else if (mode === 'survival') {
        trainingName = `Survival, 5 mistakes`;
    }
    
    const solvedCases = memoTrainingState.correctCount;
    
    // FRIENDLY MODE
    if (errorMode === 'friendly') {
        if (mode === 'time-attack') {
            const encounteredCases = solvedCases + memoTrainingState.incompleteCases;
            resultsHtml = `
                <div style="text-align:center;padding:40px;background:#f9f9f9;border:2px solid #22c55e;border-radius:8px;">
                    <h2 style="color:#22c55e;margin-bottom:20px;">Training Complete!</h2>
                    <div style="font-size:14px;color:#666;margin-bottom:15px;">${trainingName}</div>
                    <div style="font-size:18px;line-height:2;">
                        <div><strong>Cases:</strong> ${solvedCases} / ${encounteredCases}</div>
                        <div><strong>Errors:</strong> ${memoTrainingState.errorCount}</div>
                        <div><strong>Time:</strong> ${minutes}:${seconds.toString().padStart(2, '0')}</div>
                    </div>
                </div>
            `;
        } else if (mode === 'marathon') {
            const encounteredCases = solvedCases + memoTrainingState.incompleteCases; // No errors in friendly marathon
            resultsHtml = `
                <div style="text-align:center;padding:40px;background:#f9f9f9;border:2px solid #22c55e;border-radius:8px;">
                    <h2 style="color:#22c55e;margin-bottom:20px;">Training Complete!</h2>
                    <div style="font-size:14px;color:#666;margin-bottom:15px;">${trainingName}</div>
                    <div style="font-size:18px;line-height:2;">
                        <div><strong>Target:</strong> ${memoTrainingSettings.marathonTarget}</div>
                        <div><strong>Cases:</strong> ${solvedCases} / ${encounteredCases}</div>
                        <div><strong>Errors:</strong> ${memoTrainingState.errorCount}</div>
                        <div><strong>Time:</strong> ${minutes}:${seconds.toString().padStart(2, '0')}</div>
                    </div>
                </div>
            `;
        }
    }
    // PUNISH MODE
    else {
        if (mode === 'time-attack') {
            const encounteredCases = solvedCases + memoTrainingState.incompleteCases + memoTrainingState.errorCount;
            resultsHtml = `
                <div style="text-align:center;padding:40px;background:#f9f9f9;border:2px solid #22c55e;border-radius:8px;">
                    <h2 style="color:#22c55e;margin-bottom:20px;">Training Complete!</h2>
                    <div style="font-size:14px;color:#666;margin-bottom:15px;">${trainingName}</div>
                    <div style="font-size:18px;line-height:2;">
                        <div><strong>Cases:</strong> ${solvedCases} / ${encounteredCases}</div>
                        <div><strong>Mistakes:</strong> ${memoTrainingState.errorCount}</div>
                        <div><strong>Skipped:</strong> ${memoTrainingState.incompleteCases}</div>
                        <div><strong>Time:</strong> ${minutes}:${seconds.toString().padStart(2, '0')}</div>
                    </div>
                </div>
            `;
        } else if (mode === 'marathon') {
            const encounteredCases = solvedCases + memoTrainingState.incompleteCases + memoTrainingState.errorCount;
            resultsHtml = `
                <div style="text-align:center;padding:40px;background:#f9f9f9;border:2px solid #22c55e;border-radius:8px;">
                    <h2 style="color:#22c55e;margin-bottom:20px;">Training Complete!</h2>
                    <div style="font-size:14px;color:#666;margin-bottom:15px;">${trainingName}</div>
                    <div style="font-size:18px;line-height:2;">
                        <div><strong>Target:</strong> ${memoTrainingSettings.marathonTarget}</div>
                        <div><strong>Cases:</strong> ${solvedCases} / ${encounteredCases}</div>
                        <div><strong>Mistakes:</strong> ${memoTrainingState.errorCount}</div>
                        <div><strong>Skipped:</strong> ${memoTrainingState.incompleteCases}</div>
                        <div><strong>Time:</strong> ${minutes}:${seconds.toString().padStart(2, '0')}</div>
                    </div>
                </div>
            `;
        } else if (mode === 'survival') {
            resultsHtml = `
                <div style="text-align:center;padding:40px;background:#f9f9f9;border:2px solid #22c55e;border-radius:8px;">
                    <h2 style="color:#22c55e;margin-bottom:20px;">Training Complete!</h2>
                    <div style="font-size:14px;color:#666;margin-bottom:15px;">${trainingName}</div>
                    <div style="font-size:18px;line-height:2;">
                        <div><strong>Cases:</strong> ${solvedCases}</div>
                        <div><strong>Errors:</strong> ${memoTrainingState.errorCount + memoTrainingState.incompleteCases}</div>
                        <div><strong>Time:</strong> ${minutes}:${seconds.toString().padStart(2, '0')}</div>
                    </div>
                </div>
            `;
        }
    }
    
    // Hide stats box
    const statsBox = document.getElementById('memoStatsBox');
    if (statsBox) statsBox.style.display = 'none';
    
    // Show results on main screen
    const container = document.getElementById('memoImageContainer');
    container.innerHTML = resultsHtml;
    
    // Hide next and stop buttons
    document.getElementById('memoNextBtn').style.display = 'none';
    document.getElementById('memoStopBtn').style.display = 'none';
}

function resetMemoTraining() {
    memoClickedPieces = [];
    document.getElementById('memoClickedOutput').value = '';
    generateMemoVisualization();
}

function openMemoTrainingSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    function renderPieceOrderSelector() {
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
        
        // Build piece labels map
        const pieceLabels = {};
        STATE.settings.colorMappings.forEach(mapping => {
            if (mapping.label) {
                pieceLabels[mapping.hex] = mapping.label;
            }
        });
        
        // (0,0) hex code
        const zeroZeroHex = '011233455677|998bbaddcffe';
        
        // Generate (0,0) base image (fully colored, randomized - decoy)
        const baseImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
            zeroZeroHex,
            200, 
            colorScheme, 
            5, 
            false,
            null
        );
        
        // Generate hitbox overlay (invisible polygons with labels)
        const hitboxOverlay = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
            zeroZeroHex,
            200, 
            colorScheme, 
            5, 
            true, // Show labels
            pieceLabels
        );
        
        return `
            <div style="margin-bottom:15px;">
                <div style="font-weight:600;margin-bottom:8px;">Click pieces in your desired order:</div>
                <div style="display:flex;justify-content:center;margin-bottom:10px;">
                    <div id="memoOrderSelector" style="position:relative;display:inline-block;">
                        ${baseImage}
                        <div id="memoOrderOverlay" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;">
                            ${hitboxOverlay}
                        </div>
                    </div>
                </div>
                <div id="memoOrderPreview" style="padding:10px;background:#f0f0f0;border-radius:4px;font-size:13px;min-height:40px;margin-bottom:10px;">
                    Click pieces to set order...
                </div>
                <div style="display:flex;gap:10px;">
                    <button class="btn" onclick="window.resetMemoOrderSelection()">Reset Selection</button>
                    <button class="btn btn-primary" onclick="window.applyMemoOrderSelection()">Apply Order</button>
                </div>
            </div>
        `;
    }

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;max-height:80vh;">
            <div class="modal-header">
                <h3>Memo Training Settings</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="overflow-y:auto;">
                <div class="settings-group">
                    <label class="settings-label">Image Size</label>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <input type="range" min="150" max="400" value="${memoTrainingSettings.imageSize}" 
                               oninput="updateMemoImageSize(parseInt(this.value)); this.nextElementSibling.textContent = this.value + 'px';"
                               style="flex:1;">
                        <span style="min-width:60px;text-align:right;">${memoTrainingSettings.imageSize}px</span>
                    </div>
                </div>
                
                <div class="settings-group">
                    <label class="settings-label">
                        <input type="checkbox" ${memoTrainingSettings.lockOrientation ? 'checked' : ''} 
                               onchange="updateMemoLockOrientation(this.checked)"
                               style="margin-right:5px;">
                        Lock Orientation
                    </label>
                </div>
                
                <div class="settings-group" style="display:${memoTrainingSettings.lockOrientation ? 'none' : 'block'};" id="memoAllowMirrorContainer">
                    <label class="settings-label">
                        <input type="checkbox" ${memoTrainingSettings.allowMirror ? 'checked' : ''} 
                               onchange="updateMemoAllowMirror(this.checked)"
                               style="margin-right:5px;">
                        Allow Mirror
                    </label>
                </div>
                
                <div class="settings-group" style="border-top:1px solid #ddd;padding-top:15px;margin-top:15px;">
                    <label class="settings-label">Piece Order</label>
                    <div style="padding:10px;background:#f0f0f0;border-radius:4px;font-size:13px;margin-bottom:10px;font-family:monospace;">
                        Current Order: ${memoTrainingSettings.pieceOrder.map(hex => `${translateHexToPieceCode(hex)} (${hex})`).join(' → ')}
                    </div>
                    <div id="memoPieceOrderSelector">
                        ${renderPieceOrderSelector()}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup click handlers for piece order selector
    memoOrderClickSequence = [];
    setTimeout(() => {
        const overlay = document.getElementById('memoOrderOverlay');
        if (overlay) {
            const allPolygons = overlay.querySelectorAll('polygon');
            const allTexts = overlay.querySelectorAll('text');
            
            // Hide all labels initially
            allTexts.forEach(textEl => {
                textEl.style.opacity = '0';
                textEl.style.pointerEvents = 'none';
            });
            
            // Make each polygon a clickable hitbox
            allPolygons.forEach(polygon => {
                // Make polygon transparent but clickable
                polygon.style.fill = 'transparent';
                polygon.style.stroke = 'transparent';
                polygon.style.pointerEvents = 'auto';
                polygon.style.cursor = 'pointer';
                polygon.style.webkitTapHighlightColor = 'transparent';
                polygon.style.userSelect = 'none';
                
                // Find associated text element
                const parentSvg = polygon.closest('svg');
                const textsInSvg = parentSvg ? parentSvg.querySelectorAll('text') : [];
                
                // Get polygon center
                const points = polygon.getAttribute('points').split(' ');
                let sumX = 0, sumY = 0, count = 0;
                points.forEach(point => {
                    const [x, y] = point.split(',').map(Number);
                    sumX += x;
                    sumY += y;
                    count++;
                });
                const centerX = sumX / count;
                const centerY = sumY / count;
                
                // Find closest text element
                let closestText = null;
                let minDistance = Infinity;
                
                textsInSvg.forEach(textEl => {
                    const x = parseFloat(textEl.getAttribute('x'));
                    const y = parseFloat(textEl.getAttribute('y'));
                    const distance = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestText = textEl;
                    }
                });
                
                if (closestText && minDistance < 100) {
                    const labelText = closestText.textContent.trim();
                    
                    // Get the hex value directly from the scramble at this position
                    // The text elements are created in order by the visualization library
                    // We can use the text's parent SVG to determine if it's top or bottom layer
                    const parentSvg = closestText.closest('svg');
                    const allSvgs = overlay.querySelectorAll('svg');
                    const isBottomLayer = parentSvg === allSvgs[1];
                    
                    // Find the index of this text element among all texts in its layer
                    const textsInLayer = parentSvg.querySelectorAll('text');
                    const textIndex = Array.from(textsInLayer).indexOf(closestText);
                    
                    // Get hex value from the (0,0) scramble based on position
                    const zeroZeroHex = '011233455677|998bbaddcffe';
                    let pieceHex = null;
                    
                    // Build the piece hex by parsing through the layer
                    let currentPieceIndex = 0;
                    let hexIndex = isBottomLayer ? 13 : 0;
                    const endIndex = isBottomLayer ? 25 : 12;
                    
                    while (hexIndex < endIndex && currentPieceIndex <= textIndex) {
                        const char = zeroZeroHex[hexIndex].toLowerCase();
                        const isCorner = ['1', '3', '5', '7', '9', 'b', 'd', 'f'].includes(char);
                        
                        if (currentPieceIndex === textIndex) {
                            // Found our piece
                            if (isCorner && hexIndex + 1 < endIndex) {
                                pieceHex = char + char; // Corner piece like '11', '33', etc.
                            } else {
                                pieceHex = char; // Edge piece like '0', '2', etc.
                            }
                            break;
                        }
                        
                        currentPieceIndex++;
                        if (isCorner) {
                            hexIndex += 2; // Corner takes 2 slots
                        } else {
                            hexIndex += 1; // Edge takes 1 slot
                        }
                        
                        // Skip separator
                        if (hexIndex === 12) hexIndex = 13;
                    }
                    
                    // Find piece code for display (optional, just for reference)
                    let pieceCode = null;
                    for (const mapping of STATE.settings.colorMappings) {
                        if (mapping.hex.toLowerCase() === pieceHex.toLowerCase()) {
                            pieceCode = mapping.pieceCode;
                            break;
                        }
                    }
                    
                    if (pieceHex) {
                        // Add click handler
                        polygon.addEventListener('click', (e) => {
                            e.stopPropagation();
                            handleMemoOrderClick(pieceCode, closestText, polygon, pieceHex);
                        });
                        
                        // Update cursor based on clicked state
                        polygon.addEventListener('mouseenter', () => {
                            // Check if THIS specific polygon element has been clicked
                            if (!polygon.dataset.clicked) {
                                polygon.style.cursor = 'pointer';
                            } else {
                                polygon.style.cursor = 'default';
                            }
                        });
                    }
                }
            });
        }
    }, 100);

    window.handleMemoOrderClick = function(pieceCode, textEl, polygon, hexValue) {
        // Check if THIS specific polygon has already been clicked
        if (polygon.dataset.clicked === 'true') {
            return;
        }
        
        // Mark this polygon as clicked
        polygon.dataset.clicked = 'true';
        
        // Store hex value in dataset for uniqueness verification
        polygon.dataset.hexValue = hexValue;
        
        // Push hex value as the canonical identifier
        memoOrderClickSequence.push(hexValue.toLowerCase());
        
        // Show label with white text and black outline
        textEl.style.opacity = '1';
        textEl.style.fill = 'white';
        textEl.style.stroke = 'black';
        textEl.style.strokeWidth = '3';
        textEl.setAttribute('paint-order', 'stroke');
        
        // Update preview - show hex values with translation
        const preview = document.getElementById('memoOrderPreview');
        if (preview) {
            preview.textContent = `Order: ${memoOrderClickSequence.map(hex => `${translateHexToPieceCode(hex)} (${hex})`).join(' → ')}`;
        }
    };

    window.resetMemoOrderSelection = function() {
        memoOrderClickSequence = [];
        
        // Hide all text labels and reset clicked state
        const overlay = document.getElementById('memoOrderOverlay');
        if (overlay) {
            const textElements = overlay.querySelectorAll('text');
            textElements.forEach(textEl => {
                textEl.style.opacity = '0';
            });
            const polygons = overlay.querySelectorAll('polygon');
            polygons.forEach(poly => {
                delete poly.dataset.clicked;
                delete poly.dataset.hexValue;
            });
        }
        
        const preview = document.getElementById('memoOrderPreview');
        if (preview) {
            preview.textContent = 'Click pieces to set order...';
        }
    };

    window.applyMemoOrderSelection = function() {
        if (memoOrderClickSequence.length === 0) {
            showMemoAlert('Please select at least one piece');
            return;
        }
        
        if (memoOrderClickSequence.length !== 16) {
            showMemoConfirm(`You've only selected ${memoOrderClickSequence.length} pieces. Continue anyway?`, () => {
                memoTrainingSettings.pieceOrder = [...memoOrderClickSequence];
                saveMemoTrainingSettings();
                showTemporaryMessage('Piece order updated successfully!');
            });
            return;
        }
        
        memoTrainingSettings.pieceOrder = [...memoOrderClickSequence];
        saveMemoTrainingSettings();
        showTemporaryMessage('Piece order updated successfully!');
    };  

    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function updateMemoImageSize(size) {
    memoTrainingSettings.imageSize = size;
    saveMemoTrainingSettings();
    
    // Regenerate current visualization with new size if training is active
    const trainingArea = document.getElementById('memoTrainingArea');
    if (trainingArea && trainingArea.style.display !== 'none') {
        generateMemoVisualization();
    }
}

function updateMemoLockOrientation(value) {
    memoTrainingSettings.lockOrientation = value;
    saveMemoTrainingSettings();
    
    const mirrorContainer = document.getElementById('memoAllowMirrorContainer');
    if (mirrorContainer) {
        mirrorContainer.style.display = value ? 'none' : 'block';
    }
}

function updateMemoAllowMirror(value) {
    memoTrainingSettings.allowMirror = value;
    saveMemoTrainingSettings();
}

// Helper functions from co-tracker-training.js
function applyRBLToHex(hexScramble) {
    try {
        const shapeIndex = getShapeIndexFromHex(hexScramble);
        const validRotations = getValidRBLForShape(shapeIndex);
        const rul = validRotations.top[Math.floor(Math.random() * validRotations.top.length)];
        const rdl = validRotations.bottom[Math.floor(Math.random() * validRotations.bottom.length)];
        return {
            hex: applyRBL(hexScramble, rul, rdl),
            rul: rul,
            rdl: rdl
        };
    } catch (e) {
        console.error('Error applying RBL:', e);
        return { hex: hexScramble, rul: 0, rdl: 0 };
    }
}

function applyMirrorToHex(hexScramble) {
    const parsed = parseHexScramble(hexScramble);
    return parsed.bottom + parsed.equator + parsed.top;
}

function parseHexScramble(hexScramble) {
    hexScramble = hexScramble.replace(/\s/g, '');
    return {
        top: hexScramble.slice(0, 12),
        equator: hexScramble[12],
        bottom: hexScramble.slice(13, 25)
    };
}

function getShapeIndexFromHex(hexScramble) {
    const parsed = parseHexScramble(hexScramble);
    const fullHex = parsed.top + parsed.bottom;
    const shapeArray = new Array(24);
    
    for (let i = 0; i < 24; i++) {
        const piece = fullHex[i].toLowerCase();
        const isCorner = ['1', '3', '5', '7', '9', 'b', 'd', 'f'].includes(piece);
        shapeArray[i] = isCorner ? 1 : 0;
    }
    
    let value = 0;
    for (let i = 0; i < 24; i++) {
        value |= shapeArray[23 - i] << i;
    }
    
    const shapeIndex = pleaseSaveAllValidShapeIndicesHereThankYou.indexOf(value);
    if (shapeIndex === -1) throw new Error('Invalid shape');
    return shapeIndex;
}

function getValidRBLForShape(shapeIndex) {
    const VALID_ROTATIONS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
    const shapeValue = pleaseSaveAllValidShapeIndicesHereThankYou[shapeIndex];
    const s24 = shapeValue.toString(2).padStart(24, '0');
    const top = s24.slice(0, 12);
    const bottom = s24.slice(12, 24);
    
    const getValidRotations = (layer) => {
        const valid = [];
        for (const r of VALID_ROTATIONS) {
            const rotated = rotate12(layer, r);
            if (layerIsValid(rotated)) valid.push(r);
        }
        return valid;
    };
    
    return {
        top: getValidRotations(top),
        bottom: getValidRotations(bottom)
    };
}

function rotate12(s, rot) {
    if (!rot) return s;
    rot = ((rot % 12) + 12) % 12;
    if (rot === 0) return s;
    return s.slice(rot) + s.slice(0, rot);
}

function layerIsValid(s) {
    if (s.length !== 12) return false;
    
    const countLeading = (str) => {
        let c = 0;
        for (let ch of str) {
            if (ch === '1') c++; else break;
        }
        return c;
    };
    
    const countTrailing = (str) => {
        let c = 0;
        for (let i = str.length - 1; i >= 0; i--) {
            if (str[i] === '1') c++; else break;
        }
        return c;
    };
    
    const lead = countLeading(s);
    if (lead % 2 === 1) return false;
    
    const trail = countTrailing(s);
    if (trail % 2 === 1) return false;
    
    if (s[5] === '1') {
        const after = s.slice(6, 12);
        const onesAfter = (after.match(/1/g) || []).length;
        if (onesAfter % 2 === 1) return false;
    }
    
    return true;
}

function hexToShapeIndex(hexScramble) {
    const parsed = parseHexScramble(hexScramble);
    const fullHex = parsed.top + parsed.bottom;
    const shapeArray = new Array(24);
    
    for (let i = 0; i < 24; i++) {
        const piece = fullHex[i].toLowerCase();
        const isCorner = ['1', '3', '5', '7', '9', 'b', 'd', 'f'].includes(piece);
        shapeArray[i] = isCorner ? 1 : 0;
    }
    
    let value = 0;
    for (let i = 0; i < 24; i++) {
        value |= shapeArray[23 - i] << i;
    }
    
    const shapeIndex = pleaseSaveAllValidShapeIndicesHereThankYou.indexOf(value);
    if (shapeIndex === -1) throw new Error('Invalid shape');
    return shapeIndex;
}

function applyRBL(hexScramble, rul, rdl) {
    const rulRotation = rul < 0 ? 12 + rul : rul;
    const rdlRotation = rdl < 0 ? 12 + rdl : rdl;
    
    let result = '';
    
    for (let i = 0; i < 12; i++) {
        const sourceIndex = (i + rulRotation) % 12;
        result += hexScramble[sourceIndex];
    }
    
    result += hexScramble[12];
    
    for (let i = 0; i < 12; i++) {
        const sourceIndex = 13 + ((i + rdlRotation) % 12);
        result += hexScramble[sourceIndex];
    }
    
    return result;
}

function getValidRBLForShape(shapeIndex) {
    const VALID_ROTATIONS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
    
    // Define restricted patterns with their allowed rotations
    const RESTRICTED_PATTERNS = {
        '111111111111': [0],
        '011011011011': [0, 1],
        '110110110110': [0, -1],
        '001100110011': [0, -2],
        '110011001100': [0, 2],
        '011110011110': [1, -1, -3],
        '001111001111': [1, 2, -2],
        '110011110011': [2, 3, -2]
    };
    
    const shapeValue = pleaseSaveAllValidShapeIndicesHereThankYou[shapeIndex];
    const s24 = shapeValue.toString(2).padStart(24, '0');
    const top = s24.slice(0, 12);
    const bottom = s24.slice(12, 24);
    
    const getValidRotations = (layer) => {
        // Check if this layer matches a restricted pattern
        if (RESTRICTED_PATTERNS[layer]) {
            return [...RESTRICTED_PATTERNS[layer]];
        }
        
        // Otherwise, find all valid rotations
        const valid = [];
        for (const r of VALID_ROTATIONS) {
            const rotated = rotate12(layer, r);
            if (layerIsValid(rotated)) valid.push(r);
        }
        return valid;
    };
    
    return {
        top: getValidRotations(top),
        bottom: getValidRotations(bottom)
    };
}

function rotate12(s, rot) {
    if (!rot) return s;
    rot = ((rot % 12) + 12) % 12;
    if (rot === 0) return s;
    return s.slice(rot) + s.slice(0, rot);
}

function layerIsValid(s) {
    if (s.length !== 12) return false;
    
    const countLeading = (str) => {
        let c = 0;
        for (let ch of str) {
            if (ch === '1') c++; else break;
        }
        return c;
    };
    
    const countTrailing = (str) => {
        let c = 0;
        for (let i = str.length - 1; i >= 0; i--) {
            if (str[i] === '1') c++; else break;
        }
        return c;
    };
    
    const lead = countLeading(s);
    if (lead % 2 === 1) return false;
    
    const trail = countTrailing(s);
    if (trail % 2 === 1) return false;
    
    if (s[5] === '1') {
        const after = s.slice(6, 12);
        const onesAfter = (after.match(/1/g) || []).length;
        if (onesAfter % 2 === 1) return false;
    }
    
    return true;
}

// Helper function to translate hex to piece code
function translateHexToPieceCode(hex) {
    const hexMap = {
        '11': 'UBL',
        '0': 'UB',
        '77': 'URB',
        '6': 'UR',
        '55': 'UFR',
        '4': 'UF',
        '33': 'ULF',
        '2': 'UL',
        'dd': 'DLF',
        'a': 'DF',
        'bb': 'DFR',
        '8': 'DR',
        '99': 'DRB',
        'e': 'DB',
        'ff': 'DLB',
        'c': 'DL'
    };
    return hexMap[hex.toLowerCase()] || hex;
}

function openMemoInstructionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;max-height:80vh;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <div class="modal-header">
                <h3>Memo Marathon Instructions</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="line-height:1.8;overflow-y:auto;flex:1;">
                <h4 style="margin-bottom:10px;">Training Modes:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;"><strong>Time Attack:</strong> Solve as many cases as possible within a time limit (1-10 minutes)</li>
                    <li style="margin-bottom:10px;"><strong>Marathon:</strong> Complete a target number of cases (25, 50, 75, or 100)</li>
                    <li style="margin-bottom:10px;"><strong>Survival:</strong> Solve cases until you make 5 mistakes</li>
                </ul>

                <h4 style="margin-bottom:10px;">Error Modes:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;"><strong>Friendly:</strong> Wrong clicks don't advance to next scramble - try again</li>
                    <li style="margin-bottom:10px;"><strong>Punish:</strong> Wrong clicks immediately advance to next scramble (auto-enabled in Survival)</li>
                </ul>

                <h4 style="margin-bottom:10px;">How to Play:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;">Click pieces in your configured order (set in settings)</li>
                    <li style="margin-bottom:10px;">Timer starts on your first click</li>
                    <li style="margin-bottom:10px;">Click "Skip Case" to skip a difficult case (counts as incomplete)</li>
                    <li style="margin-bottom:10px;">Case auto-advances when completed correctly</li>
                </ul>

                <h4 style="margin-bottom:10px;">Settings:</h4>
                <ul style="padding-left:20px;">
                    <li style="margin-bottom:10px;">Configure piece clicking order in the settings modal</li>
                    <li style="margin-bottom:10px;">Adjust image size for better visibility</li>
                    <li style="margin-bottom:10px;">Toggle Lock Orientation and Allow Mirror options</li>
                </ul>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// Export
if (typeof window !== 'undefined') {
    window.MemoTraining = {
        openModal: openMemoTrainingModal
    };
}