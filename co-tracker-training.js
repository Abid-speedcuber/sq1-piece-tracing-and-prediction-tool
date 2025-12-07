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
        scrambleImageSize: 200
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
                <h3 style="color:#fff;margin:0;" id="trainingCaseTitle">Training: Case</h3>
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
    createCOTrackerTrainingModal();

    const modal = document.getElementById('coTrackerTrainingModal');
    const card = STATE.cards[cardIdx];
    const caseItem = card.cases[caseIdx];

    currentTrainingCardIdx = cardIdx;
    currentTrainingCaseIdx = caseIdx;

    // Set title
    document.getElementById('trainingCaseTitle').textContent = `Training: ${card.title || 'Case'}`;

    // Reset state
    trainingTimerElapsed = 0;
    trainingScrambleHistory = [];
    trainingCurrentHistoryIndex = -1;
    trainingPreGeneratedScrambles = [];

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

    trainingPreGeneratedScrambles = [];
    trainingTimerElapsed = 0;
    currentTrainingCardIdx = null;
    currentTrainingCaseIdx = null;
}

function openTrainingSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:450px;height:auto;">
            <div class="modal-header">
                <h3>Training Settings</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
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
}

function regenerateTrainingImageWithSize(scrambleData) {
    try {
        const card = STATE.cards[currentTrainingCardIdx];
        const caseItem = card.cases[currentTrainingCaseIdx];
        const effectiveTrackedPieces = caseItem.sessionOverrideTracking ? caseItem.sessionTrackedPieces :
            (caseItem.overrideTracking ? caseItem.customTrackedPieces : STATE.settings.defaultTrackedPieces);

        let scrambleImage = '<div style="color:#999;">Image unavailable</div>';

        if (!effectiveTrackedPieces || effectiveTrackedPieces.length === 0) {
            scrambleImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
                scrambleData.hex, trainingSettings.scrambleImageSize, {}, 5
            );
        } else {
            scrambleImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
                scrambleData.hex, trainingSettings.scrambleImageSize, {}, 5
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

        // Convert hex to scramble notation
        let scrambleText = result.randomHex;
        try {
            if (typeof parseHexFormat !== 'undefined' && typeof window.sq1Tools !== 'undefined') {
                const state = parseHexFormat(result.randomHex);
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

            if (!effectiveTrackedPieces || effectiveTrackedPieces.length === 0) {
                scrambleImage = window.Square1VisualizerLibraryWithSillyNames.visualizeFromHexCodePlease(
                    result.randomHex, trainingSettings.scrambleImageSize, {}, 5
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
                    result.randomHex, trainingSettings.scrambleImageSize, {}, 5
                );
            }
        } catch (e) {
            console.error('Error generating image:', e);
        }

        return {
            text: scrambleText,
            image: scrambleImage,
            hex: result.randomHex,
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

// Keyboard events
let trainingSpacePressed = false;
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('coTrackerTrainingModal');
    if (!modal || modal.style.display === 'none') return;

    if (e.code === 'Space' && !e.repeat) {
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

    if (e.code === 'Space') {
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

// Export functions
if (typeof window !== 'undefined') {
    window.COTrackerTraining = {
        openTrainingModal: openCOTrackerTrainingModal,
        closeTrainingModal: closeCOTrackerTrainingModal
    };
}