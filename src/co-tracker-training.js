// ========================================
// CO Tracker Training Modal
// ========================================

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
            <div class="modal-header" style="background:#333;color:#fff;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <h3 style="color:#fff;margin:0;" id="trainingCaseTitle">Training: Case</h3>
                    <button class="icon-btn" onclick="openTrainingInstructionModal()" title="Training Help" style="width:24px;height:24px;background:#555;">
                        <img src="res/white-instruction.svg" style="width:12px;height:12px;">
                    </button>
                </div>
                <div style="display:flex;gap:10px;">
                    <button class="icon-btn" id="trainingPrevBtn" title="Previous scramble" style="background:#555;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:16px;height:16px;">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <button class="icon-btn" id="trainingRefreshBtn" title="Regenerate scramble" style="background:#555;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:16px;height:16px;">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                        </svg>
                    </button>                   
                    <button class="icon-btn" id="trainingSettingsBtn" title="Training Settings" style="background:#555;"><img src="res/trainingSettings.svg" style="width:16px;height:16px;">
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
                <button id="trainingPeekBtn" title="Peek at Reference Scheme (Hold to peek or drag to move)" 
                        style="position:fixed;bottom:5vh;right:5vh;width:48px;height:48px;border:2px solid #333;background:#fff;border-radius:50%;cursor:move;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:10;touch-action:none;">
                    <img src="res/eye.svg" style="width:24px;height:24px;pointer-events:none;">
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('trainingRefreshBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        nextTrainingScrambleManual();
    });

    document.getElementById('trainingSettingsBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        openTrainingSettingsModal();
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

    let peekTimeout = null;

    peekBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        dragStartTime = Date.now();
        dragStartX = e.clientX - currentX;
        dragStartY = e.clientY - currentY;
        isDragging = false;
        
        // Start peeking after a short delay if not dragging
        peekTimeout = setTimeout(() => {
            if (!isDragging) {
                startPeeking();
            }
        }, 150);
    });

    peekBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragStartTime = Date.now();
        const touch = e.touches[0];
        dragStartX = touch.clientX - currentX;
        dragStartY = touch.clientY - currentY;
        isDragging = false;
        
        // Start peeking after a short delay if not dragging
        peekTimeout = setTimeout(() => {
            if (!isDragging) {
                startPeeking();
            }
        }, 150);
    });

    document.addEventListener('mousemove', (e) => {
        const modal = document.getElementById('coTrackerTrainingModal');
        if (!modal || modal.style.display === 'none') return;
        
        if (dragStartTime > 0) {
            const deltaX = Math.abs(e.clientX - (dragStartX + currentX));
            const deltaY = Math.abs(e.clientY - (dragStartY + currentY));
            
            if (deltaX > 5 || deltaY > 5) {
                if (!isDragging) {
                    // Just started dragging - clear peek timeout and start peeking
                    clearTimeout(peekTimeout);
                    isDragging = true;
                    startPeeking();
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
                    // Just started dragging - clear peek timeout and start peeking
                    clearTimeout(peekTimeout);
                    isDragging = true;
                    startPeeking();
                }
                currentX = touch.clientX - dragStartX;
                currentY = touch.clientY - dragStartY;
                peekBtn.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }
    });

    peekBtn.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        clearTimeout(peekTimeout);
        dragStartTime = 0;
        
        // Always stop peeking on release
        stopPeeking();
        isDragging = false;
    });

    peekBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearTimeout(peekTimeout);
        dragStartTime = 0;
        
        // Always stop peeking on release
        stopPeeking();
        isDragging = false;
    });

    document.addEventListener('mouseup', () => {
        const modal = document.getElementById('coTrackerTrainingModal');
        if (modal && modal.style.display !== 'none') {
            clearTimeout(peekTimeout);
            if (dragStartTime > 0 || isDragging) {
                stopPeeking();
            }
        }
        dragStartTime = 0;
        isDragging = false;
    });

    document.addEventListener('touchend', () => {
        const modal = document.getElementById('coTrackerTrainingModal');
        if (modal && modal.style.display !== 'none') {
            clearTimeout(peekTimeout);
            if (dragStartTime > 0 || isDragging) {
                stopPeeking();
            }
        }
        dragStartTime = 0;
        isDragging = false;
    });

    document.getElementById('trainingPrevBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        previousTrainingScramble();
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

function openCOTrackerTrainingModal(cardIdx, caseIdx) {
    // Close any existing modal first
    const existingModal = document.getElementById('coTrackerTrainingModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Reset all state variables
    currentTrainingCardIdx = null;
    currentTrainingCaseIdx = null;
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
    const card = STATE.cards[cardIdx];
    const caseItem = card.cases[caseIdx];

    currentTrainingCardIdx = cardIdx;
    currentTrainingCaseIdx = caseIdx;

    // Set title
    document.getElementById('trainingCaseTitle').textContent = `Training: ${card.title || 'Case'}`;

    // Pre-generate 3 scrambles
    for (let i = 0; i < 3; i++) {
        trainingPreGeneratedScrambles.push(generateNextTrainingScrambleData());
    }

    displayNextTrainingScramble();

    modal.style.display = 'flex';
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
                    <label class="settings-label">
                        <input type="checkbox" ${trainingSettings.lockOrientation ? 'checked' : ''} 
                               onchange="updateTrainingLockOrientation(this.checked)"
                               style="margin-right:5px;">
                        Lock Orientation
                    </label>
                </div>
                <div class="settings-group" style="display:${trainingSettings.lockOrientation ? 'none' : 'block'};" id="allowMirrorContainer">
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
    // Regenerate current scramble with new size
    if (trainingCurrentHistoryIndex >= 0 && trainingScrambleHistory[trainingCurrentHistoryIndex]) {
        const currentData = trainingScrambleHistory[trainingCurrentHistoryIndex];
        regenerateTrainingImageWithSize(currentData);
    }
    // Regenerate pre-generated scrambles with new size
    trainingPreGeneratedScrambles = trainingPreGeneratedScrambles.map(scrambleData => {
        regenerateTrainingImageWithSize(scrambleData);
        return scrambleData;
    });
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

        if (!effectiveTrackedPieces || effectiveTrackedPieces.length === 0) {
            scrambleImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
                scrambleData.hex, trainingSettings.scrambleImageSize, colorScheme, 5
            );
        } else {
            scrambleImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
                scrambleData.hex, trainingSettings.scrambleImageSize, colorScheme, 5
            );
        }

        document.getElementById('trainingScrambleImage').innerHTML = scrambleImage;
        scrambleData.image = scrambleImage;
    } catch (e) {
        console.error('Error regenerating image:', e);
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
        const card = STATE.cards[currentTrainingCardIdx];
        const caseItem = card.cases[currentTrainingCaseIdx];

        let solution = caseItem.solution || '';
        if (caseItem.inputType === 'scramble') {
            solution = pleaseInvertThisScrambleForSolutionVisualization(solution);
        }

        // Generate training scramble
        const result = window.TrainingModule.generateTrainingScramble(solution);
        
        // Apply RBL transformation if lock orientation is off
        let finalHex = result.randomHex;
        if (!trainingSettings.lockOrientation) {
            finalHex = applyRBLToHex(finalHex);
            
            // Apply mirror transformation if allowed
            if (trainingSettings.allowMirror && Math.random() < 0.5) {
                finalHex = applyMirrorToHex(finalHex);
            }
        }

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
            result: result
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
        trainingCurrentScrambleText = scrambleData.text;

        // Format and wrap the scramble text
        const wrappedText = wrapScrambleText(scrambleData.text, trainingSettings.scrambleTextSize);
        const coloredHtml = formatScrambleWithColor(wrappedText);

        const textEl = document.getElementById('trainingScrambleText');
        textEl.innerHTML = coloredHtml.replace(/\n/g, '<br>');
        textEl.style.fontSize = trainingSettings.scrambleTextSize + 'px';

        document.getElementById('trainingScrambleImage').innerHTML = scrambleData.image;

        // Add to history
        trainingScrambleHistory.push(scrambleData);
        trainingCurrentHistoryIndex = trainingScrambleHistory.length - 1;

        // Limit history
        if (trainingScrambleHistory.length > 50) {
            trainingScrambleHistory.shift();
            trainingCurrentHistoryIndex--;
        }
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

    document.getElementById('trainingScrambleImage').innerHTML = scrambleData.image;
}

function nextTrainingScrambleManual() {
    stopTrainingTimerOnly();
    displayNextTrainingScramble();
}

// Mouse handlers
function handleTrainingTimerMouseDown() {
    if (trainingTimerRunning) return;
    trainingIsHolding = true;
    document.getElementById('trainingTimer').style.color = '#ffc107';
}

function handleTrainingTimerMouseUp() {
    if (trainingTimerRunning) {
        displayNextTrainingScramble();
        stopTrainingTimerOnly();
    } else if (trainingIsHolding) {
        trainingIsHolding = false;
        document.getElementById('trainingTimer').style.color = '#2d3748';
        startTrainingTimer();
    }
}

function handleTrainingTimerMouseLeave() {
    if (trainingIsHolding && !trainingTimerRunning) {
        trainingIsHolding = false;
        document.getElementById('trainingTimer').style.color = '#2d3748';
    }
}

// Touch handlers
function handleTrainingTimerTouchStart(e) {
    e.preventDefault();
    if (trainingTimerRunning) return;
    trainingIsHolding = true;
    document.getElementById('trainingTimer').style.color = '#ffc107';
}

function handleTrainingTimerTouchEnd(e) {
    e.preventDefault();
    if (trainingTimerRunning) {
        displayNextTrainingScramble();
        stopTrainingTimerOnly();
    } else if (trainingIsHolding) {
        trainingIsHolding = false;
        document.getElementById('trainingTimer').style.color = '#2d3748';
        startTrainingTimer();
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
    trainingOriginalImage = imageContainer.innerHTML;

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

        // Show complex labeled image of current scramble
        const referenceHtml = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
            currentData.hex, trainingSettings.scrambleImageSize, colorScheme, 5, STATE.settings.enableLabels, pieceLabels
        );

        imageContainer.innerHTML = referenceHtml;
    } catch (e) {
        console.error('Error generating reference scheme:', e);
    }
}

function stopPeeking() {
    if (!trainingPeeking) return;
    trainingPeeking = false;

    const imageContainer = document.getElementById('trainingScrambleImage');
    imageContainer.innerHTML = trainingOriginalImage;
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
                    <li style="margin-bottom:10px;"><strong>Quick tap/click</strong> the eye button to toggle the reference scheme view</li>
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
            timerEl.style.color = '#ffc107';
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
                trainingIsHolding = false;
                timerEl.style.color = '#2d3748';
                startTrainingTimer();
            }
        }
    }
});

function applyRBLToHex(hexScramble) {
    try {
        // Get shape index
        const shapeIndex = getShapeIndexFromHex(hexScramble);
        
        // Get valid rotations for this shape
        const validRotations = getValidRBLForShape(shapeIndex);
        
        // Select random RUL and RDL
        const rul = validRotations.top[Math.floor(Math.random() * validRotations.top.length)];
        const rdl = validRotations.bottom[Math.floor(Math.random() * validRotations.bottom.length)];
        
        // Apply RBL
        return applyRBL(hexScramble, rul, rdl);
    } catch (e) {
        console.error('Error applying RBL:', e);
        return hexScramble;
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
    const ALL_ONES_ALLOWED = [0, 2, 4, 6, -4, -2];
    
    const shapeValue = pleaseSaveAllValidShapeIndicesHereThankYou[shapeIndex];
    const s24 = shapeValue.toString(2).padStart(24, '0');
    const top = s24.slice(0, 12);
    const bottom = s24.slice(12, 24);
    
    const getValidRotations = (layer) => {
        if (layer === '111111111111') return [...ALL_ONES_ALLOWED];
        
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

function applyRBL(hexScramble, rul, rdl) {
    const rulRotation = rul < 0 ? 12 + rul : rul;
    const rdlRotation = rdl < 0 ? 12 + rdl : rdl;
    
    let result = '';
    
    // Apply RUL to top layer
    for (let i = 0; i < 12; i++) {
        const sourceIndex = (i + rulRotation) % 12;
        result += hexScramble[sourceIndex];
    }
    
    // Keep equator
    result += hexScramble[12];
    
    // Apply RDL to bottom layer
    for (let i = 0; i < 12; i++) {
        const sourceIndex = 13 + ((i + rdlRotation) % 12);
        result += hexScramble[sourceIndex];
    }
    
    return result;
}

// Export functions
if (typeof window !== 'undefined') {
    window.COTrackerTraining = {
        openTrainingModal: openCOTrackerTrainingModal,
        closeTrainingModal: closeCOTrackerTrainingModal
    };
}