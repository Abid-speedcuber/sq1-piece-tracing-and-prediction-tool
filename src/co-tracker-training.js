// ========================================
// CO Tracker Training Modal
// ========================================

// Shape indices that should never be mirrored (symmetric shapes)
const NO_MIRROR_SHAPES = new Set([
    // Barrel/Barrel
    427, 442, 450, 464, 1452, 1467, 1475, 1489, 2032, 2047, 2055, 2069, 2922, 2937, 2945, 2959,
    // Square/Square
    1015, 1037, 2485, 2507,
    // Kite/Kite
    1168, 1173, 1179, 1184, 1521, 1526, 1532, 1537, 1985, 1990, 1996, 2001, 2338, 2343, 2349, 2354,
    // Scallop/Scallop
    95, 103, 117, 130, 136, 140, 678, 686, 700, 713, 719, 723, 1784, 1792, 1806, 1819, 1825, 1829, 2665, 2673, 2687, 2700, 2706, 2710, 3039, 3047, 3061, 3074, 3080, 3084, 3409, 3417, 3431, 3444, 3450, 3454,
    // Shield/Shield
    343, 347, 364, 369, 379, 384, 588, 592, 609, 614, 624, 629, 1869, 1873, 1890, 1895, 1905, 1910, 2123, 2127, 2144, 2149, 2159, 2164, 2829, 2833, 2850, 2855, 2865, 2870, 3133, 3137, 3154, 3159, 3169, 3174,
    // Muffin/Muffin
    533, 544, 549, 565, 1350, 1361, 1366, 1382, 1604, 1615, 1620, 1636, 2774, 2785, 2790, 2806,
    // Right Pawn/Right Pawn
    639, 641, 661, 676, 870, 872, 892, 907, 2273, 2275, 2295, 2310, 3246, 3248, 3268, 3283,
    // Left Pawn/Left Pawn
    219, 233, 254, 260, 1201, 1215, 1236, 1242, 2724, 2738, 2759, 2765, 3086, 3100, 3121, 3127,
    // Left Fist/Left Fist
    486, 492, 502, 509, 513, 514, 950, 956, 966, 973, 977, 978, 1557, 1563, 1573, 1580, 1584, 1585, 2079, 2085, 2095, 2102, 2106, 2107, 2374, 2380, 2390, 2397, 2401, 2402, 2432, 2438, 2448, 2455, 2459, 2460,
    // Right Fist/Right Fist
    1062, 1063, 1067, 1074, 1084, 1089, 1120, 1121, 1125, 1132, 1142, 1147, 1415, 1416, 1420, 1427, 1437, 1442, 1937, 1938, 1942, 1949, 1959, 1964, 2532, 2533, 2537, 2544, 2554, 2559, 2885, 2886, 2890, 2897, 2907, 2912
]);

let currentTrainingCardIdx = null;
let currentTrainingCaseIdx = null;
let trainingTimerRunning = false;
let trainingTimerStartTime = 0;
let trainingTimerInterval = null;
let trainingTimerElapsed = 0;
let trainingIsHolding = false;
let trainingPreGeneratedScrambles = [];
let trainingCurrentScrambleText = '';
let trainingScrambleHistory = [];
let trainingCurrentHistoryIndex = -1;
let trainingSettings = loadTrainingSettings();
let trainingPeeking = false;
let trainingOriginalImage = '';
let trainingSelectedCases = [];
let trainingHoldStartTime = 0;
const TIMER_HOLD_THRESHOLD = 210; // 150ms

function loadTrainingSelectedCases() {
    trainingSelectedCases = window.CaseSelector.load('solves');
}

function saveTrainingSelectedCases() {
    window.CaseSelector.save('solves', trainingSelectedCases);
}

function getTrainingTitleText() {
    if (trainingSelectedCases.length === 0) {
        return 'Select cases to train';
    }
    
    // Pick a random case to show info
    const randomKey = trainingSelectedCases[Math.floor(Math.random() * trainingSelectedCases.length)];
    const [cardIdx, caseIdx] = randomKey.split('-').map(Number);
    const card = STATE.cards[cardIdx];
    const caseItem = card.cases[caseIdx];
    
    const caseName = card.title || 'Untitled';
    const parity = caseItem.type === 'parity' ? 'Odd' : 'Even';
    const orientation = caseItem.variant === 'original' ? 'Original' : 'Mirror';
    
    const showName = trainingSettings.showCaseName;
    const showParity = trainingSettings.showParity;
    const showOrientation = trainingSettings.showOrientation;
    
    // Count how many are true
    const trueCount = [showName, showParity, showOrientation].filter(Boolean).length;
    
    if (trueCount === 0) {
        return 'Training';
    }
    
    if (trueCount === 1) {
        if (showName) return `Case: ${caseName}`;
        if (showParity) return `Parity: ${parity}`;
        if (showOrientation) return `Orientation: ${orientation}`;
    }
    
    // Build the parts array
    const parts = [];
    if (showName) parts.push(caseName);
    
    const subParts = [];
    if (showParity) subParts.push(parity);
    if (showOrientation) subParts.push(orientation);
    
    if (parts.length === 0) {
        // Only parity and/or orientation
        return `Training: ${subParts.join(', ')}`;
    }
    
    if (subParts.length === 0) {
        // Only case name
        return `Training: ${parts[0]}`;
    }
    
    if (subParts.length === 2) {
        // All three or case name + both
        return `Training: ${parts[0]} (${subParts.join(', ')})`;
    }
    
    // Case name + one of parity/orientation
    return `Training: ${parts[0]} (${subParts[0]})`;
}

function loadTrainingSettings() {
    const saved = localStorage.getItem('sq1TrainingSettings');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error loading training settings:', e);
        }
    }
    return {
        scrambleTextSize: 14,
        scrambleImageSize: 200,
        lockOrientation: true,
        allowMirror: false,
        showCaseName: true,
        showParity: true,
        showOrientation: false,
        disableStartCue: false,
        colorScheme: {
            topColor: '#000000',
            bottomColor: '#FFFFFF',
            frontColor: '#CC0000',
            rightColor: '#00AA00',
            backColor: '#FF8C00',
            leftColor: '#0066CC',
            dividerColor: '#7a0000',
            circleColor: 'transparent'
        }
    };
}

function saveTrainingSettings() {
    localStorage.setItem('sq1TrainingSettings', JSON.stringify(trainingSettings));
}

// Create the training modal
function createCOTrackerTrainingModal() {
    let modal = document.getElementById('coTrackerTrainingModal');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'coTrackerTrainingModal';
    modal.className = 'modal';
    modal.style.display = 'none';

    modal.innerHTML = `
        <div class="modal-content" style="width:100vw;height:100vh;max-width:100vw;margin:0;border:none;border-radius:0;display:flex;flex-direction:column;">
            <div class="modal-header" style="background:#333;color:#fff;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;padding:12px 20px;">
                <div style="display:flex;align-items:center;gap:15px;flex:1;">
                    <h3 style="color:#fff;margin:0;font-size:16px;" id="trainingCaseTitle">${getTrainingTitleText()}</h3>
                    ${!STATE.settings.personalization.hideInstructions ? `<button onclick="openTrainingInstructionModal()" title="Instructions" style="background:none;border:1px solid #666;border-radius:50%;cursor:pointer;color:#ddd;font-size:12px;font-weight:bold;font-family:serif;width:20px;height:20px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;" onmouseover="this.style.borderColor='#aaa';this.style.color='#fff'" onmouseout="this.style.borderColor='#666';this.style.color='#ddd'">i</button>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:15px;">
                    <span onclick="window.openTrainingCaseSelectionModalFromHeader()" style="cursor:pointer;color:#aaa;font-size:13px;transition:all 0.2s;border:1px solid #555;padding:4px 10px;border-radius:4px;" onmouseover="this.style.color='#fff';this.style.borderColor='#777'" onmouseout="this.style.color='#aaa';this.style.borderColor='#555'">${trainingSelectedCases.length} case(s) selected</span>
                    <span style="color:#555;">|</span>
                    <span onclick="previousTrainingScramble()" style="cursor:pointer;color:#00bcd4;font-size:13px;transition:color 0.2s;margin-right:-8px;" onmouseover="this.style.color='#00e5ff'" onmouseout="this.style.color='#00bcd4'">previous</span>
                    <span style="color:#555;margin:0 2px;">/</span>
                    <span onclick="nextTrainingScrambleManual()" style="cursor:pointer;color:#00bcd4;font-size:13px;transition:color 0.2s;margin-left:-8px;" onmouseover="this.style.color='#00e5ff'" onmouseout="this.style.color='#00bcd4'">next</span>
                    <span style="color:#ddd;margin-left:-4px;">scramble</span>
                    <button class="icon-btn" id="trainingSettingsBtn" title="Training Settings" style="background:#444;width:32px;height:32px;border:1px solid #555;"><img src="res/trainingSettings.svg" style="width:16px;height:16px;">
                    </button>
                    <button class="close-btn" id="trainingCloseBtn" style="color:#fff;">×</button>
                </div>
            </div>
            <div style="flex-shrink:0;padding:15px 20px;background:#f8f9fa;border-bottom:1px solid #e9ecef;">
                <div id="trainingScrambleText" style="font-family:monospace;text-align:center;line-height:1.5;white-space:pre-wrap;text-wrap:balance;"></div>
            </div>
            <div id="trainingTimerZone" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;user-select:none;background:#ffffff;position:relative;min-height:0;">
                <div style="padding:20px;display:flex;justify-content:center;align-items:center;pointer-events:none;">
                    <div id="trainingScrambleImage">Loading...</div>
                </div>
                <div id="trainingTimer" style="font-size:5rem;font-weight:600;font-family:'Courier New',monospace;color:#2d3748;letter-spacing:4px;">0.000</div>
                <button id="trainingPeekBtn" title="Peek at Reference Scheme (Click to toggle)" 
                        style="position:fixed;bottom:5vh;right:5vh;width:48px;height:48px;border:2px solid #333;background:#fff;border-radius:50%;cursor:move;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:10;touch-action:none;transition:background-color 0.2s,border-color 0.2s;">
                    <img src="res/eye.svg" style="width:24px;height:24px;pointer-events:none;">
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners

    window.openTrainingCaseSelectionModalFromHeader = function() {
        openTrainingCaseSelectionModal();
    };

    document.getElementById('trainingSettingsBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    openSettingsModal('training');
});

    // Draggable peek button - reset position on new modal open
    const peekBtn = document.getElementById('trainingPeekBtn');
    peekBtn.style.transform = 'translate(0px, 0px)';
    let isDragging = false;
    let dragStartTime = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let currentX = 0;
    let currentY = 0;

    peekBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        dragStartTime = Date.now();
        dragStartX = e.clientX - currentX;
        dragStartY = e.clientY - currentY;
        isDragging = false;
    });

    peekBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragStartTime = Date.now();
        const touch = e.touches[0];
        dragStartX = touch.clientX - currentX;
        dragStartY = touch.clientY - currentY;
        isDragging = false;
    });

    document.addEventListener('mousemove', (e) => {
        const modal = document.getElementById('coTrackerTrainingModal');
        if (!modal || modal.style.display === 'none') return;
        
        if (dragStartTime > 0) {
            const deltaX = Math.abs(e.clientX - (dragStartX + currentX));
            const deltaY = Math.abs(e.clientY - (dragStartY + currentY));
            
            if (deltaX > 5 || deltaY > 5) {
                if (!isDragging) {
                    // Just started dragging
                    isDragging = true;
                }
                currentX = e.clientX - dragStartX;
                currentY = e.clientY - dragStartY;
                peekBtn.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }
    });

    document.addEventListener('touchmove', (e) => {
        const modal = document.getElementById('coTrackerTrainingModal');
        if (!modal || modal.style.display === 'none') return;
        
        if (dragStartTime > 0) {
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - (dragStartX + currentX));
            const deltaY = Math.abs(touch.clientY - (dragStartY + currentY));
            
            if (deltaX > 5 || deltaY > 5) {
                if (!isDragging) {
                    // Just started dragging
                    isDragging = true;
                }
                currentX = touch.clientX - dragStartX;
                currentY = touch.clientY - dragStartY;
                peekBtn.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }
    });

    peekBtn.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        const wasDragging = isDragging;
        dragStartTime = 0;
        isDragging = false;
        
        // Only toggle peek if not dragging
        if (!wasDragging) {
            if (trainingPeeking) {
                stopPeeking();
            } else {
                startPeeking();
            }
        }
    });

    peekBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wasDragging = isDragging;
        dragStartTime = 0;
        isDragging = false;
        
        // Only toggle peek if not dragging
        if (!wasDragging) {
            if (trainingPeeking) {
                stopPeeking();
            } else {
                startPeeking();
            }
        }
    });

    document.addEventListener('mouseup', () => {
        const modal = document.getElementById('coTrackerTrainingModal');
        if (modal && modal.style.display !== 'none') {
            // Don't auto-stop peeking on document mouseup anymore
        }
        dragStartTime = 0;
        isDragging = false;
    });

    document.addEventListener('touchend', () => {
        const modal = document.getElementById('coTrackerTrainingModal');
        if (modal && modal.style.display !== 'none') {
            // Don't auto-stop peeking on document touchend anymore
        }
        dragStartTime = 0;
        isDragging = false;
    });

    document.getElementById('trainingCloseBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        closeCOTrackerTrainingModal();
    });

    const timerZone = document.getElementById('trainingTimerZone');

    // Mouse events
    timerZone.addEventListener('mousedown', handleTrainingTimerMouseDown);
    timerZone.addEventListener('mouseup', handleTrainingTimerMouseUp);
    timerZone.addEventListener('mouseleave', handleTrainingTimerMouseLeave);

    // Touch events
    timerZone.addEventListener('touchstart', handleTrainingTimerTouchStart);
    timerZone.addEventListener('touchend', handleTrainingTimerTouchEnd);
}

function openCOTrackerTrainingModal(cardIdx = null, caseIdx = null) {
    // Load selected cases
    loadTrainingSelectedCases();
    
    // Close any existing modal first
    const existingModal = document.getElementById('coTrackerTrainingModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Reset all state variables
    currentTrainingCardIdx = cardIdx;
    currentTrainingCaseIdx = caseIdx;
    trainingTimerRunning = false;
    trainingTimerStartTime = 0;
    trainingTimerInterval = null;
    trainingTimerElapsed = 0;
    trainingIsHolding = false;
    trainingPreGeneratedScrambles = [];
    trainingCurrentScrambleText = '';
    trainingScrambleHistory = [];
    trainingCurrentHistoryIndex = -1;
    trainingPeeking = false;
    trainingOriginalImage = '';

    // Create fresh modal
    createCOTrackerTrainingModal();

    const modal = document.getElementById('coTrackerTrainingModal');
    
    // Set title
    document.getElementById('trainingCaseTitle').textContent = getTrainingTitleText();

    // Pre-generate 3 scrambles only if cases are selected
    if (trainingSelectedCases.length === 0) {
        // Show empty state message
        document.getElementById('trainingScrambleText').innerHTML = '<span style="color:#999;">Select cases to begin training</span>';
        document.getElementById('trainingScrambleImage').innerHTML = '<div style="color:#999;font-size:14px;">No cases selected</div>';
        document.getElementById('trainingTimer').style.display = 'none';
        document.getElementById('trainingTimerZone').style.pointerEvents = 'none';
        document.getElementById('trainingTimerZone').style.cursor = 'default';
        modal.style.display = 'flex';
        updatePeekButtonVisibility();
        return;
    }

    // Pre-generate 3 scrambles
    for (let i = 0; i < 3; i++) {
        trainingPreGeneratedScrambles.push(generateNextTrainingScrambleData());
    }

    displayNextTrainingScramble();

    modal.style.display = 'flex';
    
    // Show timer and enable timer zone
    document.getElementById('trainingTimer').style.display = 'block';
    document.getElementById('trainingTimerZone').style.pointerEvents = 'auto';
    document.getElementById('trainingTimerZone').style.cursor = 'pointer';
    
    // Reset timer display
    trainingTimerElapsed = 0;
    document.getElementById('trainingTimer').textContent = '0.000';
    document.getElementById('trainingTimer').style.color = '#2d3748';
    
    // Update peek button visibility based on labels setting
    updatePeekButtonVisibility();
}

function closeCOTrackerTrainingModal() {
    const modal = document.getElementById('coTrackerTrainingModal');
    if (!modal) return;

    modal.style.display = 'none';

    if (trainingTimerRunning) {
        stopTrainingTimerOnly();
    }

    if (trainingPeeking) {
        stopPeeking();
    }

    trainingPreGeneratedScrambles = [];
    trainingTimerElapsed = 0;
    trainingOriginalImage = '';
    currentTrainingCardIdx = null;
    currentTrainingCaseIdx = null;
}

function openTrainingSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    if (!trainingSettings.colorScheme) {
        trainingSettings.colorScheme = {
            topColor: '#000000',
            bottomColor: '#FFFFFF',
            frontColor: '#CC0000',
            rightColor: '#00AA00',
            backColor: '#FF8C00',
            leftColor: '#0066CC',
            dividerColor: '#7a0000',
            circleColor: 'transparent'
        };
    }

    // Check if current case has a symmetric shape
    let isSymmetricShape = false;
    if (currentTrainingCardIdx !== null && currentTrainingCaseIdx !== null) {
        try {
            const card = STATE.cards[currentTrainingCardIdx];
            const caseItem = card.cases[currentTrainingCaseIdx];
            let solution = caseItem.solution || '';
            const expandedSolution = window.ScrambleNormalizer.normalizeScramble(solution);
            const scramble = pleaseInvertThisScrambleForSolutionVisualization(expandedSolution);
            const cubeState = applyScrambleToCubePlease(scramble);
            const hexCode = pleaseEncodeMyCubeStateToHexNotation(cubeState);
            const shapeIndex = hexToShapeIndex(hexCode);
            isSymmetricShape = NO_MIRROR_SHAPES.has(shapeIndex);
        } catch (e) {
            console.error('Error checking shape symmetry:', e);
        }
    }

    modal.innerHTML = `
        <div class="modal-content" style="max-width:450px;height:auto;max-height:80vh;">
            <div class="modal-header">
                <h3>Training Settings</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="overflow-y:auto;">
                <div class="settings-group">
                    <label class="settings-label">Scramble Text Size</label>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <input type="range" min="10" max="24" value="${trainingSettings.scrambleTextSize}" 
                               oninput="updateTrainingTextSize(parseInt(this.value)); this.nextElementSibling.textContent = this.value + 'px';"
                               style="flex:1;">
                        <span style="min-width:50px;text-align:right;">${trainingSettings.scrambleTextSize}px</span>
                    </div>
                </div>
                <div class="settings-group">
                    <label class="settings-label">Scramble Image Size</label>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <input type="range" min="150" max="400" value="${trainingSettings.scrambleImageSize}" 
                               oninput="updateTrainingImageSize(parseInt(this.value)); this.nextElementSibling.textContent = this.value + 'px';"
                               style="flex:1;">
                        <span style="min-width:60px;text-align:right;">${trainingSettings.scrambleImageSize}px</span>
                    </div>
                </div>
                <div class="settings-group" style="border-top:1px solid #ddd;padding-top:15px;margin-top:15px;">
                    <label class="settings-label">Display Options</label>
                    <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
                        <label style="display:flex;align-items:center;gap:5px;">
                            <input type="checkbox" ${trainingSettings.showCaseName ? 'checked' : ''} 
                                   onchange="updateTrainingDisplayOption('showCaseName', this.checked)"
                                   style="margin:0;">
                            <span style="font-size:13px;">Show Case Name</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;">
                            <input type="checkbox" ${trainingSettings.showParity ? 'checked' : ''} 
                                   onchange="updateTrainingDisplayOption('showParity', this.checked)"
                                   style="margin:0;">
                            <span style="font-size:13px;">Show Parity</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;">
                            <input type="checkbox" ${trainingSettings.showOrientation ? 'checked' : ''} 
                                   onchange="updateTrainingDisplayOption('showOrientation', this.checked)"
                                   style="margin:0;">
                            <span style="font-size:13px;">Show Orientation</span>
                        </label>
                    </div>
                </div>
                <div class="settings-group" style="border-top:1px solid #ddd;padding-top:15px;margin-top:15px;">
                    <label class="settings-label">
                        <input type="checkbox" ${trainingSettings.lockOrientation ? 'checked' : ''} 
                               onchange="updateTrainingLockOrientation(this.checked)"
                               style="margin-right:5px;">
                        Lock Orientation
                    </label>
                </div>
                <div class="settings-group" style="display:${trainingSettings.lockOrientation || isSymmetricShape ? 'none' : 'block'};" id="allowMirrorContainer">
                    <label class="settings-label">
                        <input type="checkbox" ${trainingSettings.allowMirror ? 'checked' : ''} 
                               onchange="updateTrainingAllowMirror(this.checked)"
                               style="margin-right:5px;">
                        Allow Mirror
                    </label>
                </div>
                <div class="settings-group" style="border-top:1px solid #ddd;padding-top:15px;margin-top:15px;">
                    <label class="settings-label">Color Scheme</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                        <div>
                            <label style="font-size:12px;display:block;margin-bottom:3px;">Top Color</label>
                            <input type="color" value="${trainingSettings.colorScheme.topColor}" 
                                   onchange="updateTrainingColor('topColor', this.value)"
                                   style="width:100%;height:32px;cursor:pointer;">
                        </div>
                        <div>
                            <label style="font-size:12px;display:block;margin-bottom:3px;">Bottom Color</label>
                            <input type="color" value="${trainingSettings.colorScheme.bottomColor}" 
                                   onchange="updateTrainingColor('bottomColor', this.value)"
                                   style="width:100%;height:32px;cursor:pointer;">
                        </div>
                        <div>
                            <label style="font-size:12px;display:block;margin-bottom:3px;">Front Color</label>
                            <input type="color" value="${trainingSettings.colorScheme.frontColor}" 
                                   onchange="updateTrainingColor('frontColor', this.value)"
                                   style="width:100%;height:32px;cursor:pointer;">
                        </div>
                        <div>
                            <label style="font-size:12px;display:block;margin-bottom:3px;">Right Color</label>
                            <input type="color" value="${trainingSettings.colorScheme.rightColor}" 
                                   onchange="updateTrainingColor('rightColor', this.value)"
                                   style="width:100%;height:32px;cursor:pointer;">
                        </div>
                        <div>
                            <label style="font-size:12px;display:block;margin-bottom:3px;">Back Color</label>
                            <input type="color" value="${trainingSettings.colorScheme.backColor}" 
                                   onchange="updateTrainingColor('backColor', this.value)"
                                   style="width:100%;height:32px;cursor:pointer;">
                        </div>
                        <div>
                            <label style="font-size:12px;display:block;margin-bottom:3px;">Left Color</label>
                            <input type="color" value="${trainingSettings.colorScheme.leftColor}" 
                                   onchange="updateTrainingColor('leftColor', this.value)"
                                   style="width:100%;height:32px;cursor:pointer;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function updateTrainingTextSize(size) {
    trainingSettings.scrambleTextSize = size;
    saveTrainingSettings();
    const textEl = document.getElementById('trainingScrambleText');
    if (textEl) {
        textEl.style.fontSize = size + 'px';
    }
}

function updateTrainingImageSize(size) {
    trainingSettings.scrambleImageSize = size;
    saveTrainingSettings();
    
    // Store peek state
    const wasPeeking = trainingPeeking;
    
    // Turn off peeking temporarily
    if (trainingPeeking) {
        trainingPeeking = false;
        const peekBtn = document.getElementById('trainingPeekBtn');
        if (peekBtn) {
            peekBtn.style.backgroundColor = '#fff';
            peekBtn.style.borderColor = '#333';
        }
    }
    
    // Regenerate current scramble with new size
    if (trainingCurrentHistoryIndex >= 0 && trainingScrambleHistory[trainingCurrentHistoryIndex]) {
        const currentData = trainingScrambleHistory[trainingCurrentHistoryIndex];
        regenerateTrainingImageWithSize(currentData);
        
        // Update the original image reference with the NEW regenerated image
        trainingOriginalImage = currentData.image;
        
        // Update the display with the correct regenerated image
        const imageContainer = document.getElementById('trainingScrambleImage');
        if (imageContainer) {
            imageContainer.innerHTML = currentData.image;
        }
    }
    
    // Regenerate pre-generated scrambles with new size
    trainingPreGeneratedScrambles = trainingPreGeneratedScrambles.map(scrambleData => {
        regenerateTrainingImageWithSize(scrambleData);
        return scrambleData;
    });
    
    // Restore peek state if it was on
    if (wasPeeking) {
        setTimeout(() => startPeeking(), 50);
    }
}

function updateTrainingColor(colorKey, value) {
    if (!trainingSettings.colorScheme) {
        trainingSettings.colorScheme = {
            topColor: '#000000',
            bottomColor: '#FFFFFF',
            frontColor: '#CC0000',
            rightColor: '#00AA00',
            backColor: '#FF8C00',
            leftColor: '#0066CC',
            dividerColor: '#7a0000',
            circleColor: 'transparent'
        };
    }
    trainingSettings.colorScheme[colorKey] = value;
    saveTrainingSettings();
    // Regenerate current scramble with new colors
    if (trainingCurrentHistoryIndex >= 0 && trainingScrambleHistory[trainingCurrentHistoryIndex]) {
        const currentData = trainingScrambleHistory[trainingCurrentHistoryIndex];
        regenerateTrainingImageWithSize(currentData);
    }
    // Regenerate pre-generated scrambles with new colors
    trainingPreGeneratedScrambles = trainingPreGeneratedScrambles.map(scrambleData => {
        regenerateTrainingImageWithSize(scrambleData);
        return scrambleData;
    });
}

function updateTrainingDisplayOption(option, value) {
    trainingSettings[option] = value;
    saveTrainingSettings();
    
    // Update title if training modal is open
    const titleEl = document.getElementById('trainingCaseTitle');
    if (titleEl) {
        titleEl.textContent = getTrainingTitleText();
    }
}

function updateTrainingLockOrientation(value) {
    trainingSettings.lockOrientation = value;
    saveTrainingSettings();
    
    // Show/hide the allow mirror option
    const mirrorContainer = document.getElementById('allowMirrorContainer');
    if (mirrorContainer) {
        mirrorContainer.style.display = value ? 'none' : 'block';
    }
}

function updateTrainingAllowMirror(value) {
    trainingSettings.allowMirror = value;
    saveTrainingSettings();
}

function updateTrainingDisableStartCue(value) {
    trainingSettings.disableStartCue = value;
    saveTrainingSettings();
}

function regenerateTrainingImageWithSize(scrambleData) {
    try {
        const card = STATE.cards[currentTrainingCardIdx];
        const caseItem = card.cases[currentTrainingCaseIdx];
        const effectiveTrackedPieces = caseItem.sessionOverrideTracking ? caseItem.sessionTrackedPieces :
            (caseItem.overrideTracking ? caseItem.customTrackedPieces : STATE.settings.defaultTrackedPieces);

        let scrambleImage = '<div style="color:#999;">Image unavailable</div>';

        const colorScheme = trainingSettings.colorScheme || {
            topColor: '#000000',
            bottomColor: '#FFFFFF',
            frontColor: '#CC0000',
            rightColor: '#00AA00',
            backColor: '#FF8C00',
            leftColor: '#0066CC',
            dividerColor: '#7a0000',
            circleColor: 'transparent'
        };

        // Always generate the full colored cube visualization
        scrambleImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
            scrambleData.hex, trainingSettings.scrambleImageSize, colorScheme, 5
        );

        // Update the scramble data's image reference
        scrambleData.image = scrambleImage;
        
        // Do NOT update the DOM here - let the caller handle that
    } catch (e) {
        console.error('Error regenerating image:', e);
        scrambleData.image = '<div style="color:#e53e3e;padding:10px;font-size:11px;">Error regenerating image</div>';
    }
}

function wrapScrambleText(text, fontSize) {
    // Just return the text as-is, let CSS text-wrap: balance handle it
    return text;
}

function formatScrambleWithColor(text) {
    // Use the SQ1ColorizerLib to process the scramble
    if (typeof SQ1ColorizerLib !== 'undefined' && SQ1ColorizerLib.processScramble) {
        const result = SQ1ColorizerLib.processScramble(text);
        return result.html || text;
    }
    return text;
}

function generateNextTrainingScrambleData() {
    try {
        // Pick random case from selected cases
        if (trainingSelectedCases.length === 0) {
            throw new Error('No cases selected');
        }
        
        const randomKey = trainingSelectedCases[Math.floor(Math.random() * trainingSelectedCases.length)];
        const [cardIdx, caseIdx] = randomKey.split('-').map(Number);
        
        // Update current indices for reference
        currentTrainingCardIdx = cardIdx;
        currentTrainingCaseIdx = caseIdx;
        
        const card = STATE.cards[cardIdx];
        const caseItem = card.cases[caseIdx];

        let solution = caseItem.solution || '';

        // Generate training scramble
        const result = window.TrainingModule.generateTrainingScramble(solution);
        
        // Get display and true hex using unified function
        const hexData = window.TrainingModule.getTwoHex(
            solution,
            trainingSettings.lockOrientation,
            trainingSettings.allowMirror,
            NO_MIRROR_SHAPES
        );
        
        const finalHex = hexData.displayHex;
        const rul = hexData.rul;
        const rdl = hexData.rdl;
        const mirrorApplied = hexData.mirrorApplied;

        // Convert hex to scramble notation
        let scrambleText = finalHex;
        try {
            if (typeof parseHexFormat !== 'undefined' && typeof window.sq1Tools !== 'undefined') {
                const state = parseHexFormat(finalHex);
                scrambleText = window.sq1Tools.scrambleFromState(state) || result.randomHex;
            }
        } catch (e) {
            console.error('Error converting hex to notation:', e);
        }

        // Generate image
        let scrambleImage = '<div style="color:#999;">Image unavailable</div>';
        try {
            const effectiveTrackedPieces = caseItem.sessionOverrideTracking ? caseItem.sessionTrackedPieces :
                (caseItem.overrideTracking ? caseItem.customTrackedPieces : STATE.settings.defaultTrackedPieces);

            const colorScheme = trainingSettings.colorScheme || {
                topColor: '#000000',
                bottomColor: '#FFFFFF',
                frontColor: '#CC0000',
                rightColor: '#00AA00',
                backColor: '#FF8C00',
                leftColor: '#0066CC',
                dividerColor: '#7a0000',
                circleColor: 'transparent'
            };

            if (!effectiveTrackedPieces || effectiveTrackedPieces.length === 0) {
                scrambleImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
                    finalHex, trainingSettings.scrambleImageSize, colorScheme, 5
                );
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

                // For training, show full colored cube
                scrambleImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
                    finalHex, trainingSettings.scrambleImageSize, colorScheme, 5
                );
            }
        } catch (e) {
            console.error('Error generating image:', e);
        }

        return {
            text: scrambleText,
            image: scrambleImage,
            hex: finalHex,
            result: {
                ...result,
                rblApplied: !trainingSettings.lockOrientation,
                rul: rul,
                rdl: rdl,
                mirrorApplied: mirrorApplied
            }
        };
    } catch (error) {
        console.error('Error generating training scramble:', error);
        return {
            text: 'Error generating scramble',
            image: '<div style="color:#e53e3e;">Error</div>',
            hex: '',
            result: null
        };
    }
}

function displayNextTrainingScramble() {
    if (trainingPreGeneratedScrambles.length === 0) return;

    const scrambleData = trainingPreGeneratedScrambles.shift();

    if (scrambleData) {
        // Update title to reflect current case
        const titleEl = document.getElementById('trainingCaseTitle');
        if (titleEl) {
            titleEl.textContent = getTrainingTitleText();
        }
        
        trainingCurrentScrambleText = scrambleData.text;

        // Format and wrap the scramble text
        const wrappedText = wrapScrambleText(scrambleData.text, trainingSettings.scrambleTextSize);
        const coloredHtml = formatScrambleWithColor(wrappedText);

        const textEl = document.getElementById('trainingScrambleText');
        textEl.innerHTML = coloredHtml.replace(/\n/g, '<br>');
        textEl.style.fontSize = trainingSettings.scrambleTextSize + 'px';

        // Store the original image
        trainingOriginalImage = scrambleData.image;
        
        // If peeking is active, regenerate the peek view for the new scramble
        if (trainingPeeking) {
            // Turn off peeking first to reset state
            const wasPeeking = trainingPeeking;
            trainingPeeking = false;
            document.getElementById('trainingScrambleImage').innerHTML = scrambleData.image;
            
            // Turn peeking back on with the new scramble
            if (wasPeeking) {
                setTimeout(() => startPeeking(), 50);
            }
        } else {
            document.getElementById('trainingScrambleImage').innerHTML = scrambleData.image;
        }

        // Add to history
        trainingScrambleHistory.push(scrambleData);
        trainingCurrentHistoryIndex = trainingScrambleHistory.length - 1;

        // Limit history
        if (trainingScrambleHistory.length > 50) {
            trainingScrambleHistory.shift();
            trainingCurrentHistoryIndex--;
        }
        
        // Update peek button visibility based on labels setting
        updatePeekButtonVisibility();
    }

    // Generate new scramble in background
    setTimeout(() => {
        trainingPreGeneratedScrambles.push(generateNextTrainingScrambleData());
    }, 0);
}

function previousTrainingScramble() {
    if (trainingCurrentHistoryIndex <= 0) return;

    stopTrainingTimerOnly();
    trainingCurrentHistoryIndex--;

    const scrambleData = trainingScrambleHistory[trainingCurrentHistoryIndex];
    trainingCurrentScrambleText = scrambleData.text;

    // Format and wrap the scramble text
    const wrappedText = wrapScrambleText(scrambleData.text, trainingSettings.scrambleTextSize);
    const coloredHtml = formatScrambleWithColor(wrappedText);

    const textEl = document.getElementById('trainingScrambleText');
    textEl.innerHTML = coloredHtml.replace(/\n/g, '<br>');
    textEl.style.fontSize = trainingSettings.scrambleTextSize + 'px';

    // Store the original image
    trainingOriginalImage = scrambleData.image;
    
    // If peeking is active, regenerate the peek view for this scramble
    if (trainingPeeking) {
        const wasPeeking = trainingPeeking;
        trainingPeeking = false;
        document.getElementById('trainingScrambleImage').innerHTML = scrambleData.image;
        
        if (wasPeeking) {
            setTimeout(() => startPeeking(), 50);
        }
    } else {
        document.getElementById('trainingScrambleImage').innerHTML = scrambleData.image;
    }
    
    // Update peek button visibility based on labels setting
    updatePeekButtonVisibility();
}

function nextTrainingScrambleManual() {
    stopTrainingTimerOnly();
    displayNextTrainingScramble();
}

// Mouse handlers
function handleTrainingTimerMouseDown() {
    if (trainingTimerRunning) return;
    trainingIsHolding = true;
    trainingHoldStartTime = Date.now();
    const timerEl = document.getElementById('trainingTimer');
    if (!timerEl) return;
    if (trainingSettings.disableStartCue) {
        timerEl.style.color = '#22c55e';
    } else {
        timerEl.style.color = '#ef4444';
        // Start checking for threshold
        const checkInterval = setInterval(() => {
            if (!trainingIsHolding) {
                clearInterval(checkInterval);
                return;
            }
            const holdDuration = Date.now() - trainingHoldStartTime;
            if (holdDuration >= TIMER_HOLD_THRESHOLD) {
                timerEl.style.color = '#22c55e';
                clearInterval(checkInterval);
            }
        }, 50);
    }
}

function handleTrainingTimerMouseUp() {
    const timerEl = document.getElementById('trainingTimer');
    if (!timerEl) return;
    
    if (trainingTimerRunning) {
        displayNextTrainingScramble();
        stopTrainingTimerOnly();
    } else if (trainingIsHolding) {
        const holdDuration = Date.now() - trainingHoldStartTime;
        trainingIsHolding = false;
        timerEl.style.color = '#2d3748';
        
        if (trainingSettings.disableStartCue || holdDuration >= TIMER_HOLD_THRESHOLD) {
            startTrainingTimer();
        }
    }
}

function handleTrainingTimerMouseLeave() {
    if (trainingIsHolding && !trainingTimerRunning) {
        trainingIsHolding = false;
        const timerEl = document.getElementById('trainingTimer');
        if (timerEl) {
            timerEl.style.color = '#2d3748';
        }
    }
}

// Touch handlers
function handleTrainingTimerTouchStart(e) {
    e.preventDefault();
    if (trainingTimerRunning) return;
    trainingIsHolding = true;
    trainingHoldStartTime = Date.now();
    const timerEl = document.getElementById('trainingTimer');
    if (!timerEl) return;
    if (trainingSettings.disableStartCue) {
        timerEl.style.color = '#22c55e';
    } else {
        timerEl.style.color = '#ef4444';
        // Start checking for threshold
        const checkInterval = setInterval(() => {
            if (!trainingIsHolding) {
                clearInterval(checkInterval);
                return;
            }
            const holdDuration = Date.now() - trainingHoldStartTime;
            if (holdDuration >= TIMER_HOLD_THRESHOLD) {
                timerEl.style.color = '#22c55e';
                clearInterval(checkInterval);
            }
        }, 50);
    }
}

function handleTrainingTimerTouchEnd(e) {
    e.preventDefault();
    const timerEl = document.getElementById('trainingTimer');
    if (!timerEl) return;
    
    if (trainingTimerRunning) {
        displayNextTrainingScramble();
        stopTrainingTimerOnly();
    } else if (trainingIsHolding) {
        const holdDuration = Date.now() - trainingHoldStartTime;
        trainingIsHolding = false;
        timerEl.style.color = '#2d3748';
        
        if (trainingSettings.disableStartCue || holdDuration >= TIMER_HOLD_THRESHOLD) {
            startTrainingTimer();
        }
    }
}

function startTrainingTimer() {
    if (trainingTimerRunning) return;

    trainingTimerElapsed = 0;
    trainingTimerRunning = true;
    trainingTimerStartTime = Date.now();

    const timerEl = document.getElementById('trainingTimer');
    timerEl.style.color = '#2d3748';

    trainingTimerInterval = setInterval(() => {
        trainingTimerElapsed = Date.now() - trainingTimerStartTime;
        updateTrainingTimerDisplay();
    }, 10);
}

function stopTrainingTimerOnly() {
    if (!trainingTimerRunning) return;

    trainingTimerRunning = false;
    clearInterval(trainingTimerInterval);

    const timerEl = document.getElementById('trainingTimer');
    timerEl.style.color = '#2d3748';
}

function updateTrainingTimerDisplay() {
    const seconds = (trainingTimerElapsed / 1000).toFixed(3);
    document.getElementById('trainingTimer').textContent = seconds;
}

function startPeeking() {
    if (trainingPeeking) return;
    trainingPeeking = true;

    const imageContainer = document.getElementById('trainingScrambleImage');
    const peekBtn = document.getElementById('trainingPeekBtn');
    
    // Store original image if not already stored
    if (!trainingOriginalImage) {
        trainingOriginalImage = imageContainer.innerHTML;
    }
    
    // Add visual feedback to button
    if (peekBtn) {
        peekBtn.style.backgroundColor = '#333';
        peekBtn.style.borderColor = '#555';
    }

    try {
        const currentData = trainingScrambleHistory[trainingCurrentHistoryIndex];
        if (!currentData) return;

        const card = STATE.cards[currentTrainingCardIdx];
        const caseItem = card.cases[currentTrainingCaseIdx];
        const effectiveTrackedPieces = caseItem.sessionOverrideTracking ? caseItem.sessionTrackedPieces :
            (caseItem.overrideTracking ? caseItem.customTrackedPieces : STATE.settings.defaultTrackedPieces);

        if (!effectiveTrackedPieces || effectiveTrackedPieces.length === 0) {
            return; // No tracked pieces, nothing to show
        }

        const colorScheme = trainingSettings.colorScheme || {
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

        // Use the SAME hex for both base image and labels - the current scramble hex
        const scrambleHex = currentData.hex;

        // Generate unlabeled image of current scramble
        const baseImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
            scrambleHex, trainingSettings.scrambleImageSize, colorScheme, 5, false, null
        );

        // Generate label-only overlay from the SAME hex
        const labelOverlay = window.Square1VisualizerLibraryWithSillyNames.visualizeLabelsOnlyPlease(
            scrambleHex, trainingSettings.scrambleImageSize, 5, pieceLabels
        );

        // Combine: base image with label overlay on top
        imageContainer.innerHTML = `
            <div style="position: relative; display: inline-block;">
                ${baseImage}
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
                    ${labelOverlay}
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Error generating reference scheme:', e);
    }
}

function stopPeeking() {
    if (!trainingPeeking) return;
    trainingPeeking = false;

    const imageContainer = document.getElementById('trainingScrambleImage');
    const peekBtn = document.getElementById('trainingPeekBtn');
    
    imageContainer.innerHTML = trainingOriginalImage;
    
    // Remove visual feedback from button
    if (peekBtn) {
        peekBtn.style.backgroundColor = '#fff';
        peekBtn.style.borderColor = '#333';
    }
}

function updatePeekButtonVisibility() {
    const peekBtn = document.getElementById('trainingPeekBtn');
    if (!peekBtn) return;
    
    // Check if labels are enabled in settings
    if (STATE.settings.enableLabels) {
        peekBtn.style.display = 'flex';
    } else {
        peekBtn.style.display = 'none';
        // If peeking is active when labels are disabled, stop peeking
        if (trainingPeeking) {
            stopPeeking();
        }
    }
}

function openTrainingCaseSelectionModal() {
    window.CaseSelector.openModal('solves', (selected) => {
        trainingSelectedCases = selected;
        
        trainingPreGeneratedScrambles = [];
        trainingScrambleHistory = [];
        trainingCurrentHistoryIndex = -1;
        
        const trainingModal = document.getElementById('coTrackerTrainingModal');
        if (trainingModal && trainingModal.style.display !== 'none') {
            if (trainingSelectedCases.length > 0) {
                for (let i = 0; i < 3; i++) {
                    trainingPreGeneratedScrambles.push(generateNextTrainingScrambleData());
                }
                displayNextTrainingScramble();
                
                const titleEl = document.getElementById('trainingCaseTitle');
                if (titleEl) titleEl.textContent = getTrainingTitleText();
                
                const selectCasesSpan = document.querySelector('[onclick="window.openTrainingCaseSelectionModalFromHeader()"]');
                if (selectCasesSpan) selectCasesSpan.textContent = `${trainingSelectedCases.length} case(s) selected`;
            } else {
                const titleEl = document.getElementById('trainingCaseTitle');
                if (titleEl) titleEl.textContent = getTrainingTitleText();
                document.getElementById('trainingScrambleText').innerHTML = '<span style="color:#999;">Select cases to begin training</span>';
                document.getElementById('trainingScrambleImage').innerHTML = '<div style="color:#999;font-size:14px;">No cases selected</div>';
                const selectCasesSpan = document.querySelector('[onclick="window.openTrainingCaseSelectionModalFromHeader()"]');
                if (selectCasesSpan) selectCasesSpan.textContent = '0 case(s) selected';
            }
        }
    });
}

function openTrainingInstructionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;max-height:80vh;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <div class="modal-header">
                <h3>Training Mode Instructions</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="line-height:1.8;overflow-y:auto;flex:1;">
                <h4 style="margin-bottom:10px;">Timer Controls:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;"><strong>Hold Space</strong> (or touch/click the timer area) until it turns yellow, then release to start the timer</li>
                    <li style="margin-bottom:10px;"><strong>Press Space</strong> again (or tap) to stop the timer and generate a new scramble</li>
                </ul>

                <h4 style="margin-bottom:10px;">Scramble Navigation:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;"><strong>Refresh button</strong> generates a new scramble manually</li>
                    <li style="margin-bottom:10px;"><strong>Previous button</strong> returns to your last scramble</li>
                </ul>

                <h4 style="margin-bottom:10px;">Peek at Reference Scheme:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;"><strong>Eye Button:</strong> The floating eye button can be dragged anywhere on screen for your convenience</li>
                    <li style="margin-bottom:10px;"><strong>Click/tap</strong> the eye button to toggle the reference scheme on or off</li>
                    <li style="margin-bottom:10px;"><strong>Hold Backspace</strong> to temporarily view the traced reference scheme (release to hide)</li>
                    <li style="margin-bottom:10px;">The reference shows your labeled pieces on the current scramble, not the (0,0) state</li>
                </ul>

                <h4 style="margin-bottom:10px;">Settings:</h4>
                <ul style="padding-left:20px;">
                    <li style="margin-bottom:10px;">Adjust scramble text size for better readability</li>
                    <li style="margin-bottom:10px;">Change scramble image size to fit your screen</li>
                    <li style="margin-bottom:10px;">Customize color scheme for the cube visualization</li>
                </ul>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// Keyboard events
let trainingSpacePressed = false;
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('coTrackerTrainingModal');
    if (!modal || modal.style.display === 'none') return;

    if (e.code === 'Backspace' && !e.repeat) {
        e.preventDefault();
        startPeeking();
    } else if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (!trainingSpacePressed) {
            trainingSpacePressed = true;
            const timerEl = document.getElementById('trainingTimer');
            trainingHoldStartTime = Date.now();
            if (trainingSettings.disableStartCue) {
                timerEl.style.color = '#22c55e';
            } else {
                timerEl.style.color = '#ef4444';
                // Start checking for threshold
                const checkInterval = setInterval(() => {
                    if (!trainingIsHolding) {
                        clearInterval(checkInterval);
                        return;
                    }
                    const holdDuration = Date.now() - trainingHoldStartTime;
                    if (holdDuration >= TIMER_HOLD_THRESHOLD) {
                        timerEl.style.color = '#22c55e';
                        clearInterval(checkInterval);
                    }
                }, 50);
            }
            if (!trainingTimerRunning) {
                trainingIsHolding = true;
            }
        }
    } else if (e.code === 'Escape') {
        e.preventDefault();
        closeCOTrackerTrainingModal();
    }
});

document.addEventListener('keyup', (e) => {
    const modal = document.getElementById('coTrackerTrainingModal');
    if (!modal || modal.style.display === 'none') return;

    if (e.code === 'Backspace') {
        e.preventDefault();
        stopPeeking();
    } else if (e.code === 'Space') {
        e.preventDefault();
        if (trainingSpacePressed) {
            trainingSpacePressed = false;
            const timerEl = document.getElementById('trainingTimer');

            if (trainingTimerRunning) {
                displayNextTrainingScramble();
                stopTrainingTimerOnly();
            } else if (trainingIsHolding) {
                const holdDuration = Date.now() - trainingHoldStartTime;
                trainingIsHolding = false;
                timerEl.style.color = '#2d3748';
                
                if (trainingSettings.disableStartCue || holdDuration >= TIMER_HOLD_THRESHOLD) {
                    startTrainingTimer();
                }
            }
        }
    } else {
        // Any other key stops the timer if running
        if (trainingTimerRunning) {
            e.preventDefault();
            displayNextTrainingScramble();
            stopTrainingTimerOnly();
        }
    }
});

// Export functions
if (typeof window !== 'undefined') {
    window.COTrackerTraining = {
        openTrainingModal: openCOTrackerTrainingModal,
        closeTrainingModal: closeCOTrackerTrainingModal
    };
}