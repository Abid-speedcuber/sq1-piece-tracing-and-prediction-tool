function openHomeInstructionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:600px;height:80vh;">
            <div class="modal-header">
                <h3>Welcome to SQ1 Piece Tracing Tool</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body" style="line-height:1.8;overflow-y:auto;flex:1;">
                <h4 style="margin-bottom:10px;">Getting Started:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;">Look for the <strong>help icons (ⓘ)</strong> throughout the app—they provide context-specific instructions</li>
                    <li style="margin-bottom:10px;">This app was built using Claude AI. If you encounter bugs, please report them to <a href="mailto:abidashrafkhulna@gmail.com">abidashrafkhulna@gmail.com</a></li>
                    <li style="margin-bottom:10px;"><strong>Important:</strong> Regularly export your data from Settings to prevent data loss</li>
                    <li style="margin-bottom:10px;">If the app freezes, refresh the page—your data is saved automatically</li>
                </ul>

                <h4 style="margin-bottom:10px;">Variables:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;">Click the <strong>table icon</strong> in the top bar to access the Variables table</li>
                    <li style="margin-bottom:10px;">Store frequently used triggers as variables for easier input</li>
                    <li style="margin-bottom:10px;">Variables can reference other variables (they expand recursively)</li>
                    <li style="margin-bottom:10px;">Use variables in algorithms with <code>*variableName*</code> or <code>&lt;variableName&gt;</code></li>
                </ul>
                
                <h4 style="margin-bottom:10px;">Case Organization:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;">Each case contains 4 sections organized by parity (odd/even) and orientation (original/mirror)</li>
                    <li style="margin-bottom:10px;">Click the <strong>edit icon</strong> to delete or rearrange cases</li>
                    <li style="margin-bottom:10px;">Each case card shows a thumbnail of its first angle for quick reference</li>
                    <li style="margin-bottom:10px;">Access Settings to customize colors, labels, and default tracked pieces</li>
                </ul>

                <h4 style="margin-bottom:10px;">Open Source:</h4>
                <p style="padding-left:20px;">This project is open source! View the code on <a href="https://github.com/Abid-speedcuber/sq1-piece-tracing-and-prediction-tool" target="_blank">GitHub</a>. Contributions and feedback are welcome!</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
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
                    <li style="margin-bottom:15px;"><strong>Show Actual State</strong> displays the algorithm result on a fully colored Square-1 cube.</li>
                    <li style="margin-bottom:15px;"><strong>Change Tracked Pieces</strong> allows you to view different piece combinations and perspectives for this specific case.</li>
                    <li style="margin-bottom:15px;"><strong>Show Reference Scheme</strong> displays your labeling system on a square/square (0,0) state for reference.</li>
                    <li style="margin-bottom:15px;"><strong>Train This Case</strong> opens the training mode for this specific case, maintaining the exact parity and orientation.</li>
                </ul>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function openEditInstructionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

modal.innerHTML = `
<div class="modal-content" 
     style="max-width:500px; max-height:80vh; margin:auto; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); display:flex; flex-direction:column;">

    <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
        <h3>Edit Mode Instructions</h3>
        <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
    </div>

    <div class="modal-body" style="line-height:1.8; overflow-y:auto; flex:1;">
        <ol style="padding-left:20px;">
            <li style="margin-bottom:15px;">
                <strong>Alternative notation shortcuts:</strong> 
                <span style="font-style:italic; color:#666;">
                    Use apostrophe (') as a minus sign (e.g., 4' means -4). 
                    Slashes are optional—the app will insert them automatically. 
                    Letter mappings for moves:
                    <br>1 → A, O, S
                    <br>2 → T, C
                    <br>3 → U, D
                    <br>4 → V, E
                    <br>5 → X, F
                    <br>6 → W, B
                    <br>Add apostrophe after letters for negative moves (e.g., A' means -1).
                </span>
            </li>
            <li style="margin-bottom:15px;">
                When inserting a scramble, it will automatically be converted to the inverse algorithm upon saving.
            </li>
            <li style="margin-bottom:15px;">
                <strong>Override default tracked pieces</strong> lets you customize which pieces are tracked for this specific case only.
            </li>
        </ol>
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
                <p style="margin-bottom:15px;"><strong>Alternative notation shortcuts for easier input:</strong></p>
                <ul style="padding-left:20px;line-height:1.8;">
                    <li style="margin-bottom:10px;">Use apostrophe (') as a minus sign: <code>4'</code> means <code>-4</code></li>
                    <li style="margin-bottom:10px;">Slashes are optional—they'll be inserted automatically</li>
                    <li style="margin-bottom:10px;">Letter shortcuts for moves:
                        <ul style="margin-top:5px;padding-left:20px;">
                            <li>1 → A, O, S</li>
                            <li>2 → T, C</li>
                            <li>3 → U, D</li>
                            <li>4 → V, E</li>
                            <li>5 → X, F</li>
                            <li>6 → W, B</li>
                        </ul>
                    </li>
                    <li style="margin-bottom:10px;">Add apostrophe after letters for negative moves: <code>A'</code> means <code>-1</code></li>
                    <li style="margin-bottom:10px;">Variables can reference other variables—they expand recursively</li>
                </ul>
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
                <ul style="padding-left:20px;">
                    <li style="margin-bottom:15px;"><strong>Image Size:</strong> This controls the size of traced images in case views. Training modal images have separate size controls within the training settings.</li>
                    <li style="margin-bottom:15px;"><strong>Letter/Number Labels:</strong> Toggle to show or hide piece labels on traced images.</li>
                    <li style="margin-bottom:15px;"><strong>Color Mappings:</strong> Customize the color and label for each piece position. These colors are used when tracking specific pieces.</li>
                    <li style="margin-bottom:15px;"><strong>Default Tracked Pieces:</strong> Set which pieces are tracked by default. Individual cases can override this setting.</li>
                    <li style="margin-bottom:15px;"><strong>Export Data:</strong> Regularly export your data as a backup. All settings, cases, and variables are included in the export.</li>
                    <li style="margin-bottom:15px;"><strong>Import Data:</strong> Restore from a previously exported backup. This will replace all current data.</li>
                </ul>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}