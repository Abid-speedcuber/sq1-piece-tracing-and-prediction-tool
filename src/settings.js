function openSettingsModal(context = 'sidebar') {
    // context can be: 'sidebar', 'card', 'training', 'memo'
    // Hide sidebar when opening settings
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    // Determine which tabs are accessible
    const tabs = {
        overall: { enabled: true, id: 'overall', icon: 'settings-overall' },
        home: { enabled: context === 'sidebar', id: 'home', icon: 'settings-home' },
        case: { enabled: context === 'sidebar' || context === 'card', id: 'case', icon: 'abid' },
        training: { enabled: context === 'training', id: 'training', icon: 'settings-training' },
        memo: { enabled: context === 'memo', id: 'memo', icon: 'settings-memo' }
    };
    
    // Determine initial active tab based on context
    let activeTab = 'overall';
    if (context === 'card') {
        activeTab = 'case';
    } else if (context === 'training') {
        activeTab = 'training';
    } else if (context === 'memo') {
        activeTab = 'memo';
    }
    
    function renderTabContent(tabId) {
        switch(tabId) {
            case 'overall':
                return `
                    <div class="settings-group">
                        <button class="btn btn-primary" style="width:100%;margin-bottom:8px;" onclick="openColorMappingModalInline();">Configure Color Mappings</button>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.enableLabels ? 'checked' : ''} 
                                   onchange="STATE.settings.enableLabels = this.checked; saveState(); if (typeof updatePeekButtonVisibility === 'function') updatePeekButtonVisibility(); liveUpdateCaseModal(); if (typeof window.refreshHomeScreen === 'function') window.refreshHomeScreen();" 
                                   style="margin-right:5px;">
                            Enable Letter/Number Labels
                        </label>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">Color Scheme</label>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                            <div>
                                <label style="font-size:12px;display:block;margin-bottom:3px;">Top Color</label>
                                <input type="color" value="${STATE.settings.colorScheme?.topColor || '#000000'}" 
                                       onchange="updateGlobalColor('topColor', this.value)"
                                       style="width:100%;height:32px;cursor:pointer;">
                            </div>
                            <div>
                                <label style="font-size:12px;display:block;margin-bottom:3px;">Bottom Color</label>
                                <input type="color" value="${STATE.settings.colorScheme?.bottomColor || '#FFFFFF'}" 
                                       onchange="updateGlobalColor('bottomColor', this.value)"
                                       style="width:100%;height:32px;cursor:pointer;">
                            </div>
                            <div>
                                <label style="font-size:12px;display:block;margin-bottom:3px;">Front Color</label>
                                <input type="color" value="${STATE.settings.colorScheme?.frontColor || '#CC0000'}" 
                                       onchange="updateGlobalColor('frontColor', this.value)"
                                       style="width:100%;height:32px;cursor:pointer;">
                            </div>
                            <div>
                                <label style="font-size:12px;display:block;margin-bottom:3px;">Right Color</label>
                                <input type="color" value="${STATE.settings.colorScheme?.rightColor || '#00AA00'}" 
                                       onchange="updateGlobalColor('rightColor', this.value)"
                                       style="width:100%;height:32px;cursor:pointer;">
                            </div>
                            <div>
                                <label style="font-size:12px;display:block;margin-bottom:3px;">Back Color</label>
                                <input type="color" value="${STATE.settings.colorScheme?.backColor || '#FF8C00'}" 
                                       onchange="updateGlobalColor('backColor', this.value)"
                                       style="width:100%;height:32px;cursor:pointer;">
                            </div>
                            <div>
                                <label style="font-size:12px;display:block;margin-bottom:3px;">Left Color</label>
                                <input type="color" value="${STATE.settings.colorScheme?.leftColor || '#0066CC'}" 
                                       onchange="updateGlobalColor('leftColor', this.value)"
                                       style="width:100%;height:32px;cursor:pointer;">
                            </div>
                        </div>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.hideInstructions ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.hideInstructions = this.checked; saveState(); updateTopbar(); renderCards(); updateSettingsInstructionButton();" 
                                   style="margin-right:5px;">
                            Hide Instruction Buttons
                        </label>
                    </div>
                    <div class="settings-group" style="border-top:1px solid #ddd;padding-top:15px;">
                        <button class="btn" style="width:100%;margin-bottom:8px;" onclick="exportData()">Export Data</button>
                        <button class="btn" style="width:100%;" onclick="document.getElementById('importFile').click()">Import Data</button>
                        <input type="file" id="importFile" style="display:none;" onchange="importData(this)">
                    </div>
                `;
            case 'home':
                return `
                    <div class="settings-group">
                        <label class="settings-label">Card Size Scale</label>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <input type="range" min="0.5" max="2" step="0.1" value="${STATE.settings.personalization.cardScale || 1}" 
                                   oninput="this.nextElementSibling.textContent = this.value + 'x'; STATE.settings.personalization.cardScale = parseFloat(this.value); saveState(); renderCards();"
                                   style="flex:1;">
                            <span style="min-width:60px;text-align:right;">${STATE.settings.personalization.cardScale || 1}x</span>
                        </div>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.hideSearchBar ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.hideSearchBar = this.checked; saveState(); renderCards();" 
                                   style="margin-right:5px;">
                            Hide Search Bar on Home Screen
                        </label>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.showTrainButtonHome ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.showTrainButtonHome = this.checked; saveState(); updateTopbar();" 
                                   style="margin-right:5px;">
                            Show Train Button on Home Screen
                        </label>
                    </div>
                `;
            case 'case':
                return `
                    <div class="settings-group">
                        <label class="settings-label" style="font-weight:600;font-size:15px;margin-bottom:10px;">CS Case Division</label>
                        <div style="display:flex;flex-direction:column;gap:10px;padding:10px;background:#f5f5f5;border-radius:4px;">
                            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                <input type="checkbox" ${STATE.settings.divisionSettings?.byParity !== false ? 'checked' : ''} 
                                       onchange="updateGlobalDivisionSetting('byParity', this.checked)"
                                       style="margin:0;">
                                <span style="font-size:14px;">By Parity</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                <input type="checkbox" ${STATE.settings.divisionSettings?.byOrientation !== false ? 'checked' : ''} 
                                       onchange="updateGlobalDivisionSetting('byOrientation', this.checked)"
                                       style="margin:0;">
                                <span style="font-size:14px;">By Orientation</span>
                            </label>
                            <p style="font-size:12px;color:#666;margin:8px 0 0 0;font-style:italic;">
                                Turning off a division will merge cases across all cards while preserving their original classification for later restoration.
                            </p>
                        </div>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">Image Size</label>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <input type="range" min="100" max="400" value="${STATE.settings.imageSize}" 
                                   oninput="this.nextElementSibling.textContent = this.value + 'px'; STATE.settings.imageSize = parseInt(this.value); saveState(); liveUpdateCaseModal();"
                                   style="flex:1;">
                            <span style="min-width:60px;text-align:right;">${STATE.settings.imageSize}px</span>
                        </div>
                    </div>
                    <div class="settings-group">
                        <button class="btn btn-primary" style="width:100%;margin-bottom:8px;" onclick="openDefaultTrackedPiecesModalInline();">Default Tracked Pieces</button>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.hideActualStateButton ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.hideActualStateButton = this.checked; saveState(); liveUpdateCaseModal();" 
                                   style="margin-right:5px;">
                            Hide "Show Actual State" Button
                        </label>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.hideChangeTrackedPiecesButton ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.hideChangeTrackedPiecesButton = this.checked; saveState(); liveUpdateCaseModal();" 
                                   style="margin-right:5px;">
                            Hide "Change Tracked Pieces" Button
                        </label>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.hideReferenceSchemeButton ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.hideReferenceSchemeButton = this.checked; saveState(); liveUpdateCaseModal();" 
                                   style="margin-right:5px;">
                            Hide "Show Reference Scheme" Button
                        </label>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.swapAlgorithmDisplay ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.swapAlgorithmDisplay = this.checked; saveState(); liveUpdateCaseModal();" 
                                   style="margin-right:5px;">
                            Swap Input & Normalized Algorithm Display
                        </label>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.enableMobileView ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.enableMobileView = this.checked; saveState(); liveUpdateCaseModal();" 
                                   style="margin-right:5px;">
                            Enable Mobile View (Vertical Layout)
                        </label>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.hideOverrideTrackedPieces ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.hideOverrideTrackedPieces = this.checked; saveState(); liveUpdateCaseModal();" 
                                   style="margin-right:5px;">
                            Hide Override Tracked Pieces in Edit Modal
                        </label>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.showTrainButtonCase ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.showTrainButtonCase = this.checked; saveState(); liveUpdateCaseModalTopbar();" 
                                   style="margin-right:5px;">
                            Show Train Button on Case Screen
                        </label>
                    </div>
                `;
            case 'training':
                return renderTrainingSettings();
            case 'memo':
                return renderMemoSettings();
            default:
                return '';
        }
    }
    
    function renderTrainingSettings() {
        if (!window.trainingSettings) window.trainingSettings = loadTrainingSettings();
        
        const parityEnabled = STATE.settings.divisionSettings?.byParity !== false;
        const orientationEnabled = STATE.settings.divisionSettings?.byOrientation !== false;
        
        return `
            <div class="settings-group">
                <label class="settings-label">Scramble Text Size</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="range" min="10" max="24" value="${window.trainingSettings.scrambleTextSize}" 
                           oninput="updateTrainingTextSize(parseInt(this.value)); this.nextElementSibling.textContent = this.value + 'px';"
                           style="flex:1;">
                    <span style="min-width:50px;text-align:right;">${window.trainingSettings.scrambleTextSize}px</span>
                </div>
            </div>
            <div class="settings-group">
                <label class="settings-label">Scramble Image Size</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="range" min="150" max="400" value="${window.trainingSettings.scrambleImageSize}" 
                           oninput="updateTrainingImageSize(parseInt(this.value)); this.nextElementSibling.textContent = this.value + 'px';"
                           style="flex:1;">
                    <span style="min-width:60px;text-align:right;">${window.trainingSettings.scrambleImageSize}px</span>
                </div>
            </div>
            <div class="settings-group" style="border-top:1px solid #ddd;padding-top:15px;margin-top:15px;">
                <label class="settings-label">Display Options</label>
                <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
                    <label style="display:flex;align-items:center;gap:5px;">
                        <input type="checkbox" ${window.trainingSettings.showCaseName ? 'checked' : ''} 
                               onchange="updateTrainingDisplayOption('showCaseName', this.checked)"
                               style="margin:0;">
                        <span style="font-size:13px;">Show Case Name</span>
                    </label>
                    <label style="display:flex;align-items:center;gap:5px;${parityEnabled ? '' : 'opacity:0.5;'}">
                        <input type="checkbox" ${window.trainingSettings.showParity ? 'checked' : ''} 
                               onchange="updateTrainingDisplayOption('showParity', this.checked)"
                               style="margin:0;" ${parityEnabled ? '' : 'disabled'}>
                        <span style="font-size:13px;">Show Parity ${parityEnabled ? '' : '(N/A - Parity division off)'}</span>
                    </label>
                    <label style="display:flex;align-items:center;gap:5px;${orientationEnabled ? '' : 'opacity:0.5;'}">
                        <input type="checkbox" ${window.trainingSettings.showOrientation ? 'checked' : ''} 
                               onchange="updateTrainingDisplayOption('showOrientation', this.checked)"
                               style="margin:0;" ${orientationEnabled ? '' : 'disabled'}>
                        <span style="font-size:13px;">Show Orientation ${orientationEnabled ? '' : '(N/A - Orientation division off)'}</span>
                    </label>
                </div>
            </div>
            <div class="settings-group" style="border-top:1px solid #ddd;padding-top:15px;margin-top:15px;">
                <label class="settings-label">
                    <input type="checkbox" ${window.trainingSettings.lockOrientation ? 'checked' : ''} 
                           onchange="updateTrainingLockOrientation(this.checked)"
                           style="margin-right:5px;">
                    Lock Orientation
                </label>
            </div>
            <div class="settings-group" style="display:${window.trainingSettings.lockOrientation ? 'none' : 'block'};" id="allowMirrorContainer">
                <label class="settings-label">
                    <input type="checkbox" ${window.trainingSettings.allowMirror ? 'checked' : ''} 
                           onchange="updateTrainingAllowMirror(this.checked)"
                           style="margin-right:5px;">
                    Allow Mirror
                </label>
            </div>
            <div class="settings-group" style="border-top:1px solid #ddd;padding-top:15px;margin-top:15px;">
                <label class="settings-label">
                    <input type="checkbox" ${window.trainingSettings.disableStartCue ? 'checked' : ''} 
                           onchange="updateTrainingDisableStartCue(this.checked)"
                           style="margin-right:5px;">
                    Turn Off Starting Cue (Remove 0.3s Hold)
                </label>
            </div>
        `;
    }
    
    function renderMemoSettings() {
        if (!window.memoTrainingSettings) loadMemoTrainingSettings();
        
        const parityEnabled = STATE.settings.divisionSettings?.byParity !== false;
        const orientationEnabled = STATE.settings.divisionSettings?.byOrientation !== false;
        
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
            <div class="settings-group">
                <label class="settings-label">Image Size</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="range" min="150" max="400" value="${window.memoTrainingSettings.imageSize}" 
                           oninput="updateMemoImageSize(parseInt(this.value)); this.nextElementSibling.textContent = this.value + 'px';"
                           style="flex:1;">
                    <span style="min-width:60px;text-align:right;">${window.memoTrainingSettings.imageSize}px</span>
                </div>
            </div>
            <div class="settings-group">
                <label class="settings-label">
                    <input type="checkbox" ${window.memoTrainingSettings.lockOrientation ? 'checked' : ''} 
                           onchange="updateMemoLockOrientation(this.checked)"
                           style="margin-right:5px;">
                    Lock Orientation
                </label>
            </div>
            <div class="settings-group" style="display:${window.memoTrainingSettings.lockOrientation ? 'none' : 'block'};" id="memoAllowMirrorContainer">
                <label class="settings-label">
                    <input type="checkbox" ${window.memoTrainingSettings.allowMirror ? 'checked' : ''} 
                           onchange="updateMemoAllowMirror(this.checked)"
                           style="margin-right:5px;">
                    Allow Mirror
                </label>
            </div>
            <div class="settings-group">
                <label class="settings-label">
                    <input type="checkbox" ${window.memoTrainingSettings.enableVerticalMode ? 'checked' : ''} 
                           onchange="updateMemoVerticalMode(this.checked)"
                           style="margin-right:5px;">
                    Enable Vertical Mode (Mobile-Friendly)
                </label>
            </div>
            <div class="settings-group" style="border-top:1px solid #ddd;padding-top:15px;margin-top:15px;">
                <label class="settings-label">Piece Order</label>
                <div style="padding:10px;background:#f0f0f0;border-radius:4px;font-size:13px;margin-bottom:10px;font-family:monospace;" id="memoOrderCurrentDisplay">
                    Current Order: ${window.memoTrainingSettings.pieceOrder.map(hex => translateHexToPieceCode(hex)).join(' → ')}
                </div>
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
            </div>
        `;
    }
    
    function updateTabContent() {
        
        const contentArea = document.getElementById('settingsTabContent');
        if (contentArea) {
            contentArea.innerHTML = renderTabContent(activeTab);
            
        } else {
            console.error('[MemoOrder] settingsTabContent element NOT FOUND!');
        }
        
        // Update modal title based on active tab
        const titleEl = document.getElementById('settingsModalTitle');
        if (titleEl) {
            const titles = {
                overall: 'Overall Settings',
                home: 'Home Screen Settings',
                case: 'Case Settings',
                training: 'Training Settings',
                memo: 'Memo Marathon Settings'
            };
            titleEl.textContent = titles[activeTab] || 'Settings';
        }
        
        // Update button styles to reflect active state
        updateTabButtons();
        
        // Initialize memo order selector if on memo tab
        // Initialize memo order selector if on memo tab
    
    if (activeTab === 'memo') {
        
        
        setTimeout(() => {
            
            
            
            if (typeof initializeMemoOrderSelector === 'function') {
                initializeMemoOrderSelector();
            } else {
                console.error('[MemoOrder] initializeMemoOrderSelector is not a function!');
            }
        }, 100);
    } else {
        
    }
        
        // Reload training settings to get fresh values
        if (activeTab === 'training') {
            window.trainingSettings = loadTrainingSettings();
        }
    }
    
    function updateTabButtons() {
        for (const [key, tab] of Object.entries(tabs)) {
            const button = document.querySelector(`[data-tab-id="${key}"]`);
            if (button) {
                const isActive = activeTab === key;
                const isDisabled = !tab.enabled;
                const bgColor = isActive ? '#007bff' : (isDisabled ? '#f0f0f0' : '#fff');
                const textColor = isActive ? '#fff' : (isDisabled ? '#999' : '#333');
                
                button.style.background = bgColor;
                button.style.color = textColor;
            }
        }
    }
    
    function renderTabs() {
        let tabsHtml = '<div style="display:flex;flex-direction:column;gap:5px;padding:10px;background:#f5f5f5;border-right:1px solid #ddd;min-width:60px;">';
        
        for (const [key, tab] of Object.entries(tabs)) {
            const isActive = activeTab === key;
            const isDisabled = !tab.enabled;
            const bgColor = isActive ? '#007bff' : (isDisabled ? '#f0f0f0' : '#fff');
            const textColor = isActive ? '#fff' : (isDisabled ? '#999' : '#333');
            const cursor = isDisabled ? 'not-allowed' : 'pointer';
            const opacity = isDisabled ? '0.5' : '1';
            
            tabsHtml += `
                <button data-tab-id="${key}" onclick="${isDisabled ? '' : `window.switchSettingsTab('${key}')`}" 
                        style="padding:12px;background:${bgColor};color:${textColor};border:1px solid #ddd;cursor:${cursor};opacity:${opacity};border-radius:4px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;"
                        ${isDisabled ? 'disabled' : ''}
                        title="${key.charAt(0).toUpperCase() + key.slice(1)} Settings">
                    <img src="res/${tab.icon}.svg" style="width:24px;height:24px;">
                </button>
            `;
        }
        
        tabsHtml += '</div>';
        return tabsHtml;
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width:700px;max-height:85vh;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;">
            <div class="modal-header">
                <div style="display:flex;align-items:center;gap:10px;">
                    <h3 id="settingsModalTitle">Settings</h3>
                    <button class="icon-btn" onclick="openSettingsTabInstructionModal()" title="Help" style="width:24px;height:24px;background:#555;display:${STATE.settings.personalization.hideInstructions ? 'none' : 'flex'};">
                        <img src="res/white-instruction.svg" style="width:12px;height:12px;">
                    </button>
                </div>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div style="display:flex;flex:1;overflow:hidden;">
                ${renderTabs()}
                <div id="settingsTabContent" style="flex:1;padding:20px;overflow-y:auto;">
                    ${renderTabContent(activeTab)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    
    window.switchSettingsTab = function(tabId) {
        
        activeTab = tabId;
        updateTabContent();
    };
    
    // Initialize the initial tab content (including memo selector if memo tab is active)
    
    updateTabContent();
    
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function updateGlobalColor(colorKey, value) {
    if (!STATE.settings.colorScheme) {
        STATE.settings.colorScheme = {
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
    STATE.settings.colorScheme[colorKey] = value;
    saveState();
    liveUpdateCaseModal();
}

function openColorMappingModalInline() {
    openColorMappingModal();
}

function openDefaultTrackedPiecesModalInline() {
    openDefaultTrackedPiecesModal();
}

function openMemoOrderConfigModal() {
    openMemoTrainingSettingsModal();
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

function openPersonalizationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <div class="modal-header">
                <h3>Personalization</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="settings-group">
                    <label class="settings-label">Card Size Scale</label>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <input type="range" min="0.5" max="2" step="0.1" value="${STATE.settings.personalization.cardScale || 1}" 
                               oninput="this.nextElementSibling.textContent = this.value + 'x'; STATE.settings.personalization.cardScale = parseFloat(this.value); saveState(); renderCards();"
                               style="flex:1;">
                        <span style="min-width:60px;text-align:right;">${STATE.settings.personalization.cardScale || 1}x</span>
                    </div>
                </div>
                <div class="settings-group">
                    <label class="settings-label">
                        <input type="checkbox" ${STATE.settings.personalization.hideActualStateButton ? 'checked' : ''} 
                               onchange="STATE.settings.personalization.hideActualStateButton = this.checked; saveState(); liveUpdateCaseModal();" 
                               style="margin-right:5px;">
                        Hide "Show Actual State" Button
                    </label>
                </div>
                <div class="settings-group">
                    <label class="settings-label">
                        <input type="checkbox" ${STATE.settings.personalization.hideChangeTrackedPiecesButton ? 'checked' : ''} 
                               onchange="STATE.settings.personalization.hideChangeTrackedPiecesButton = this.checked; saveState(); liveUpdateCaseModal();" 
                               style="margin-right:5px;">
                        Hide "Change Tracked Pieces" Button
                    </label>
                </div>
                <div class="settings-group">
                    <label class="settings-label">
                        <input type="checkbox" ${STATE.settings.personalization.hideReferenceSchemeButton ? 'checked' : ''} 
                               onchange="STATE.settings.personalization.hideReferenceSchemeButton = this.checked; saveState(); liveUpdateCaseModal();" 
                               style="margin-right:5px;">
                        Hide "Show Reference Scheme" Button
                    </label>
                </div>
                <div class="settings-group">
                    <label class="settings-label">
                        <input type="checkbox" ${STATE.settings.personalization.swapAlgorithmDisplay ? 'checked' : ''} 
                               onchange="STATE.settings.personalization.swapAlgorithmDisplay = this.checked; saveState(); liveUpdateCaseModal();" 
                               style="margin-right:5px;">
                        Swap Input & Normalized Algorithm Display
                    </label>
                </div>
                <div class="settings-group">
                    <label class="settings-label">
                        <input type="checkbox" ${STATE.settings.personalization.enableMobileView ? 'checked' : ''} 
                               onchange="STATE.settings.personalization.enableMobileView = this.checked; saveState(); liveUpdateCaseModal();" 
                               style="margin-right:5px;">
                        Enable Mobile View (Vertical Layout)
                    </label>
                </div>
                <div class="settings-group">
                    <label class="settings-label">
                        <input type="checkbox" ${STATE.settings.personalization.hideSearchBar ? 'checked' : ''} 
                               onchange="STATE.settings.personalization.hideSearchBar = this.checked; saveState(); renderCards();" 
                               style="margin-right:5px;">
                        Hide Search Bar on Home Screen
                    </label>
                </div>
                <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.hideOverrideTrackedPieces ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.hideOverrideTrackedPieces = this.checked; saveState(); liveUpdateCaseModal();" 
                                   style="margin-right:5px;">
                            Hide Override Tracked Pieces in Edit Modal
                        </label>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label">
                            <input type="checkbox" ${STATE.settings.personalization.showTrainButtonCase ? 'checked' : ''} 
                                   onchange="STATE.settings.personalization.showTrainButtonCase = this.checked; saveState(); liveUpdateCaseModalTopbar();" 
                                   style="margin-right:5px;">
                            Show Train Button on Case Screen
                        </label>
                    </div>
                <div class="settings-group">
                    <label class="settings-label">
                        <input type="checkbox" ${STATE.settings.personalization.hideInstructions ? 'checked' : ''} 
                               onchange="STATE.settings.personalization.hideInstructions = this.checked; saveState(); updateTopbar(); renderCards();" 
                               style="margin-right:5px;">
                        Hide Instruction Buttons
                    </label>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function exportData() {
    // Include ALL settings from localStorage
    const exportData = {
        ...STATE,
        trainingSettings: loadTrainingSettings(),
        memoTrainingSettings: JSON.parse(localStorage.getItem('sq1MemoTrainingSettings') || '{}'),
        memoSelectedCases: JSON.parse(localStorage.getItem('sq1MemoSelectedCases') || '[]'),
        trainingSelectedCases: JSON.parse(localStorage.getItem('sq1TrainingSelectedCases') || '[]')
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
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
            
            // Import ALL training settings if present
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
            
            if (imported.trainingSelectedCases) {
                localStorage.setItem('sq1TrainingSelectedCases', JSON.stringify(imported.trainingSelectedCases));
                delete imported.trainingSelectedCases;
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

function liveUpdateCaseModal() {
    const openModal = document.querySelector('.modal-content');
    if (openModal && openModal.querySelector('[id^="cases-container-"]')) {
        const containerId = openModal.querySelector('[id^="cases-container-"]').id;
        const cardIdx = parseInt(containerId.split('-')[2]);
        if (!isNaN(cardIdx)) {
            renderCases(cardIdx);
        }
    }
}

function liveUpdateCaseSettingsChanges() {
    liveUpdateCaseModal();
}

function initializeMemoOrderSelector() {
    window.memoOrderClickSequence = [];
    const overlay = document.getElementById('memoOrderOverlay');
      
    if (!overlay) {
        console.error('[MemoOrder] ❌ OVERLAY ELEMENT NOT FOUND!');
        console.error('[MemoOrder] Available elements with "memo" in ID:');
        document.querySelectorAll('[id*="memo"]').forEach(el => {
            console.error('[MemoOrder]   -', el.id, el.tagName);
        });
        return;
    }
    
    
    
    // Clear all existing click states from polygons
    const existingPolygons = overlay.querySelectorAll('polygon');
    
    existingPolygons.forEach((poly, idx) => {
        const hadClicked = poly.dataset.clicked;
        const hadHex = poly.dataset.hexValue;
        delete poly.dataset.clicked;
        delete poly.dataset.hexValue;
        if (hadClicked || hadHex) {
            
        }
    });
    
    if (!overlay) {
        console.error('[MemoOrder] Overlay element NOT found!');
        return;
    }
    
    const allPolygons = overlay.querySelectorAll('polygon');
    const allTexts = overlay.querySelectorAll('text');
    
    
    // Hide all labels initially
    
    allTexts.forEach((textEl, idx) => {
        textEl.style.opacity = '0';
        textEl.style.pointerEvents = 'none';
    });
    
    // Make each polygon a clickable hitbox
    
    allPolygons.forEach((polygon, polyIdx) => {
        
        polygon.style.fill = 'transparent';
        polygon.style.stroke = 'transparent';
        polygon.style.pointerEvents = 'auto';
        polygon.style.cursor = 'pointer';
        polygon.style.webkitTapHighlightColor = 'transparent';
        polygon.style.userSelect = 'none';
          
        const parentSvg = polygon.closest('svg');
        const textsInSvg = parentSvg ? parentSvg.querySelectorAll('text') : [];
        
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
            const allSvgs = overlay.querySelectorAll('svg');
            const isBottomLayer = parentSvg === allSvgs[1];
            const textsInLayer = parentSvg.querySelectorAll('text');
            const textIndex = Array.from(textsInLayer).indexOf(closestText);
            
            const zeroZeroHex = '011233455677|998bbaddcffe';
            let pieceHex = null;
            
            let currentPieceIndex = 0;
            let hexIndex = isBottomLayer ? 13 : 0;
            const endIndex = isBottomLayer ? 25 : 12;
            
            while (hexIndex < endIndex && currentPieceIndex <= textIndex) {
                const char = zeroZeroHex[hexIndex].toLowerCase();
                const isCorner = ['1', '3', '5', '7', '9', 'b', 'd', 'f'].includes(char);
                
                if (currentPieceIndex === textIndex) {
                    if (isCorner && hexIndex + 1 < endIndex) {
                        pieceHex = char + char;
                    } else {
                        pieceHex = char;
                    }
                    break;
                }
                
                currentPieceIndex++;
                if (isCorner) {
                    hexIndex += 2;
                } else {
                    hexIndex += 1;
                }
                
                if (hexIndex === 12) hexIndex = 13;
            }
            
            let pieceCode = null;
            for (const mapping of STATE.settings.colorMappings) {
                if (mapping.hex.toLowerCase() === pieceHex.toLowerCase()) {
                    pieceCode = mapping.pieceCode;
                    break;
                }
            }
            
            if (pieceHex) {
                
                
                polygon.addEventListener('click', (e) => {
                    
                    e.stopPropagation();
                    handleMemoOrderClick(pieceCode, closestText, polygon, pieceHex);
                });
                
                polygon.addEventListener('mouseenter', () => {
                    const isClicked = polygon.dataset.clicked === 'true';
                    
                    if (!isClicked) {
                        polygon.style.cursor = 'pointer';
                    } else {
                        polygon.style.cursor = 'default';
                    }
                });
            } else {
                console.warn(`[MemoOrder] Polygon ${polyIdx}: No pieceHex found!`);
            }
        } else {
            console.warn(`[MemoOrder] Polygon ${polyIdx}: No closest text found (minDistance: ${minDistance})`);
        }
    });    
}

function handleMemoOrderClick(pieceCode, textElement, polygon, hexValue) {
    
    if (polygon.dataset.clicked === 'true') { 
        return;
    }
    
    if (!window.memoOrderClickSequence) {
        console.error('[MemoOrder] Click sequence not initialized!');
        window.memoOrderClickSequence = [];
    }
    
    polygon.dataset.clicked = 'true';
    polygon.dataset.hexValue = hexValue;    
    window.memoOrderClickSequence.push(hexValue.toLowerCase());
    textElement.style.opacity = '1';
    textElement.style.fill = 'white';
    textElement.style.stroke = 'black';
    textElement.style.strokeWidth = '3';
    textElement.setAttribute('paint-order', 'stroke');
    
    const preview = document.getElementById('memoOrderPreview');
    if (preview) {
        preview.textContent = `Order: ${window.memoOrderClickSequence.map(hex => translateHexToPieceCode(hex)).join(' → ')}`;
    }
}

window.resetMemoOrderSelection = function() {
    window.memoOrderClickSequence = [];
    
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
    if (!window.memoOrderClickSequence || window.memoOrderClickSequence.length === 0) {
        showConfirmModal('Error', 'Please select at least one piece', () => {});
        return;
    }
    
    if (window.memoOrderClickSequence.length !== 16) {
        showConfirmModal('Warning', `You've only selected ${window.memoOrderClickSequence.length} pieces. Continue anyway?`, () => {
            if (!window.memoTrainingSettings) {
                loadMemoTrainingSettings();
            }
            window.memoTrainingSettings.pieceOrder = [...window.memoOrderClickSequence];
            saveMemoTrainingSettings();
            
            // Update current display
            const display = document.getElementById('memoOrderCurrentDisplay');
            if (display) {
                display.textContent = `Current Order: ${window.memoTrainingSettings.pieceOrder.map(hex => translateHexToPieceCode(hex)).join(' → ')}`;
            }
            
            showConfirmModal('Success', 'Piece order updated successfully!', () => {});
        });
        return;
    }
    
    if (!window.memoTrainingSettings) {
        loadMemoTrainingSettings();
    }
    window.memoTrainingSettings.pieceOrder = [...window.memoOrderClickSequence];
    saveMemoTrainingSettings();
    
    // Update current display
    const display = document.getElementById('memoOrderCurrentDisplay');
    if (display) {
        display.textContent = `Current Order: ${window.memoTrainingSettings.pieceOrder.map(hex => translateHexToPieceCode(hex)).join(' → ')}`;
    }
    
    showConfirmModal('Success', 'Piece order updated successfully!', () => {});
};

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

function saveMemoTrainingSettings() {
    if (window.memoTrainingSettings) {
        localStorage.setItem('sq1MemoTrainingSettings', JSON.stringify(window.memoTrainingSettings));
    }
}

function loadMemoTrainingSettings() {
    const saved = localStorage.getItem('sq1MemoTrainingSettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (!window.memoTrainingSettings) {
                window.memoTrainingSettings = {};
            }
            window.memoTrainingSettings = { ...window.memoTrainingSettings, ...parsed };
        } catch (e) {
            console.error('Error loading memo training settings:', e);
        }
    }
}

function updateGlobalDivisionSetting(setting, value) {
    if (!STATE.settings.divisionSettings) {
        STATE.settings.divisionSettings = { byParity: true, byOrientation: true };
    }
    STATE.settings.divisionSettings[setting] = value;
    
    // Reset all cards' view states to defaults when toggling
    STATE.cards.forEach(card => {
        if (!value) {
            if (setting === 'byParity') {
                card.viewState.parity = 'odd';
            } else if (setting === 'byOrientation') {
                card.viewState.orientation = 'original';
            }
        }
    });
    
    saveState();
    
    // Live update if card modal is open
    const openModal = document.querySelector('.modal');
    if (openModal && openModal.querySelector('[id^="cases-container-"]')) {
        const containerId = openModal.querySelector('[id^="cases-container-"]').id;
        const cardIdx = parseInt(containerId.split('-')[2]);
        if (!isNaN(cardIdx)) {
            // Update the radio buttons visibility in the modal header
            const modalBody = openModal.querySelector('.modal-body');
            if (modalBody) {
                const controlsDiv = modalBody.querySelector('div[style*="display:flex"][style*="gap:40px"]');
                if (controlsDiv) {
                    // Update parity controls
                    const parityDiv = controlsDiv.querySelector('div:has(input[name^="parity-"])');
                    if (parityDiv) {
                        parityDiv.style.display = STATE.settings.divisionSettings?.byParity !== false ? 'flex' : 'none';
                    }
                    
                    // Update orientation controls
                    const orientationDiv = controlsDiv.querySelector('div:has(input[name^="orientation-"])');
                    if (orientationDiv) {
                        orientationDiv.style.display = STATE.settings.divisionSettings?.byOrientation !== false ? 'flex' : 'none';
                    }
                }
            }
            
            // Re-render cases with new division settings
            renderCases(cardIdx);
        }
    }
}

function updateMemoVerticalMode(value) {
    if (!window.memoTrainingSettings) loadMemoTrainingSettings();
    window.memoTrainingSettings.enableVerticalMode = value;
    saveMemoTrainingSettings();
    
    // Regenerate current visualization with new vertical mode if training is active
    const trainingArea = document.getElementById('memoTrainingArea');
    if (trainingArea && trainingArea.style.display !== 'none' && typeof generateMemoVisualization === 'function') {
        generateMemoVisualization();
    }
}

function openSettingsTabInstructionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    // Get the active tab from the settings modal
    const titleEl = document.getElementById('settingsModalTitle');
    const currentTitle = titleEl ? titleEl.textContent : 'Settings';
    
    let instructionContent = '';
    
    if (currentTitle === 'Overall Settings') {
        instructionContent = `
            <h4 style="margin-bottom:10px;">Color Mappings:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;">Assign unique colors and labels to each piece position</li>
                <li style="margin-bottom:10px;">Labels appear on traced pieces when "Enable Letter/Number Labels" is on</li>
                <li style="margin-bottom:10px;">These colors are used throughout the app for piece tracking</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Letter/Number Labels:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;">Toggle to show/hide labels on all traced images</li>
                <li style="margin-bottom:10px;">Useful for memorization practice</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Color Scheme:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;">Set the colors for the fully-colored cube visualization</li>
                <li style="margin-bottom:10px;">Used in "Show Actual State" and training modes</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Data Management:</h4>
            <ul style="padding-left:20px;">
                <li style="margin-bottom:10px;"><strong>Export Data:</strong> Save all your cases, settings, and variables as a backup file</li>
                <li style="margin-bottom:10px;"><strong>Import Data:</strong> Restore from a previously exported backup (replaces current data)</li>
            </ul>
        `;
    } else if (currentTitle === 'Home Screen Settings') {
        instructionContent = `
            <h4 style="margin-bottom:10px;">Card Size Scale:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;">Adjust the size of case cards on the home screen (0.5x to 2x)</li>
                <li style="margin-bottom:10px;">Useful for smaller/larger screens or personal preference</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Hide Search Bar:</h4>
            <ul style="padding-left:20px;">
                <li style="margin-bottom:10px;">Remove the search bar from the home screen if you don't need it</li>
                <li style="margin-bottom:10px;">Gives more space for your case cards</li>
            </ul>
        `;
    } else if (currentTitle === 'Case Settings') {
        instructionContent = `
            <h4 style="margin-bottom:10px;">CS Case Division:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;"><strong>By Parity:</strong> Separate cases into Odd/Even parity groups</li>
                <li style="margin-bottom:10px;"><strong>By Orientation:</strong> Separate cases into Original/Mirror orientation groups</li>
                <li style="margin-bottom:10px;">Turning off a division merges cases while preserving their classification</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Image Size:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;">Controls the size of traced images in case view modals</li>
                <li style="margin-bottom:10px;">Training modes have separate image size controls</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Default Tracked Pieces:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;">Set which pieces are tracked by default across all cases</li>
                <li style="margin-bottom:10px;">Individual cases can override this setting</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Button Visibility:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;">Hide buttons you don't use to reduce clutter</li>
                <li style="margin-bottom:10px;">Options include: Actual State, Change Tracked Pieces, Reference Scheme</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Display Options:</h4>
            <ul style="padding-left:20px;">
                <li style="margin-bottom:10px;"><strong>Swap Algorithm Display:</strong> Switch which algorithm appears larger (input vs normalized)</li>
                <li style="margin-bottom:10px;"><strong>Mobile View:</strong> Enable vertical layout for better mobile experience</li>
                <li style="margin-bottom:10px;"><strong>Hide Override Tracked Pieces:</strong> Remove this option from edit modal if unused</li>
            </ul>
        `;
    } else if (currentTitle === 'Training Settings') {
        instructionContent = `
            <h4 style="margin-bottom:10px;">Text & Image Size:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;">Adjust scramble text size for better readability (10-24px)</li>
                <li style="margin-bottom:10px;">Set scramble image size to fit your screen (150-400px)</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Display Options:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;"><strong>Show Case Name:</strong> Display which case you're solving</li>
                <li style="margin-bottom:10px;"><strong>Show Parity:</strong> Display whether it's odd/even parity (if division enabled)</li>
                <li style="margin-bottom:10px;"><strong>Show Orientation:</strong> Display whether it's original/mirror (if division enabled)</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Randomization:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;"><strong>Lock Orientation:</strong> Always generate scrambles in the same orientation</li>
                <li style="margin-bottom:10px;"><strong>Allow Mirror:</strong> Randomly mirror scrambles (only if orientation unlocked)</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Timer Options:</h4>
            <ul style="padding-left:20px;">
                <li style="margin-bottom:10px;"><strong>Turn Off Starting Cue:</strong> Remove the 0.3s hold requirement to start timer</li>
                <li style="margin-bottom:10px;">When off, timer starts immediately on release</li>
            </ul>
        `;
    } else if (currentTitle === 'Memo Marathon Settings') {
        instructionContent = `
            <h4 style="margin-bottom:10px;">Image Size:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;">Adjust the size of the cube visualization (150-400px)</li>
                <li style="margin-bottom:10px;">Larger sizes are better for seeing piece details</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Randomization:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;"><strong>Lock Orientation:</strong> Always generate scrambles in the same orientation</li>
                <li style="margin-bottom:10px;"><strong>Allow Mirror:</strong> Randomly mirror scrambles (only if orientation unlocked)</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Vertical Mode:</h4>
            <ul style="padding-left:20px;margin-bottom:20px;">
                <li style="margin-bottom:10px;">Stack the two cube layers vertically instead of horizontally</li>
                <li style="margin-bottom:10px;">Better for mobile devices or smaller screens</li>
            </ul>
            
            <h4 style="margin-bottom:10px;">Piece Order:</h4>
            <ul style="padding-left:20px;">
                <li style="margin-bottom:10px;">Click pieces on the (0,0) visualization in your desired memorization order</li>
                <li style="margin-bottom:10px;">The app will expect you to click pieces in this order during training</li>
                <li style="margin-bottom:10px;">Preview shows your current selection before applying</li>
                <li style="margin-bottom:10px;">You can configure any order that works for your memorization system</li>
            </ul>
        `;
    }

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;max-height:80vh;margin:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <div class="modal-header">
                <h3>${currentTitle} Instructions</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="line-height:1.8;overflow-y:auto;flex:1;">
                ${instructionContent}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function updateSettingsInstructionButton() {
    const instructionBtn = document.querySelector('.modal-header button[onclick="openSettingsTabInstructionModal()"]');
    if (instructionBtn) {
        instructionBtn.style.display = STATE.settings.personalization.hideInstructions ? 'none' : 'flex';
    }
}