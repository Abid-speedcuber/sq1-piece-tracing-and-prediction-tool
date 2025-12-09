/* Modals */

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


/* Main Variable Table Logics */

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
                <div style="display:flex;align-items:center;gap:10px;">
                    <h3 style="margin:0;">Variable Table</h3>
                    <button class="icon-btn" onclick="openVariableInstructionModal()" title="Variable Help" style="width:24px;height:24px;">
                        <img src="res/instruction.svg" style="width:12px;height:12px;">
                    </button>
                </div>
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

function expandVariables(notation) {
    // Use the new normalizer module
    return window.ScrambleNormalizer.normalizeScramble(notation);
}

function highlightVariablesInNormalized(solution) {
    if (!solution) return '';

    // Normalize using the new module
    let normalized = window.ScrambleNormalizer.normalizeScramble(solution);

    // Remove all whitespace for display
    return normalized.replace(/\s+/g, '');
}