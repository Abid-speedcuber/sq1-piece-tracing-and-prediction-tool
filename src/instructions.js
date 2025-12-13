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
                    <li style="margin-bottom:10px;">Click the <strong>hamburger menu</strong> icon in the top-left to access the sidebar with all tools</li>
                    <li style="margin-bottom:10px;">This app was built using Claude AI. Report bugs to <a href="mailto:abidashrafkhulna@gmail.com">abidashrafkhulna@gmail.com</a></li>
                    <li style="margin-bottom:10px;"><strong>Important:</strong> Regularly export your data from Settings to prevent data loss</li>
                    <li style="margin-bottom:10px;">If the app freezes, refresh the page—your data is saved automatically in localStorage</li>
                </ul>

                <h4 style="margin-bottom:10px;">Variables:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;">Access the Variables table from the sidebar menu</li>
                    <li style="margin-bottom:10px;">Store frequently used sequences as variables for easier input</li>
                    <li style="margin-bottom:10px;">Variables can reference other variables (they expand recursively)</li>
                    <li style="margin-bottom:10px;">Use variables in algorithms with <code>*variableName*</code> or <code>&lt;variableName&gt;</code></li>
                </ul>
                
                <h4 style="margin-bottom:10px;">Case Organization:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;">Add cases using the <strong>+ Add CS</strong> button in the top-right</li>
                    <li style="margin-bottom:10px;">Each case can be divided by Parity (Odd/Even) and Orientation (Original/Mirror) in Settings</li>
                    <li style="margin-bottom:10px;">Click <strong>Edit Home Page</strong> in the sidebar to rearrange or delete cases</li>
                    <li style="margin-bottom:10px;">Each case card shows a thumbnail preview of its first angle</li>
                    <li style="margin-bottom:10px;">Customize colors, labels, and default tracked pieces in Settings</li>
                    <li style="margin-bottom:10px;">Search for cases by name using the search bar on the home screen</li>
                </ul>

                <h4 style="margin-bottom:10px;">Training Modes:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;"><strong>Random Scramble:</strong> Practice recognizing and solving your cases with customizable randomization options. Select which cases to train from the case selector modal.</li>
                    <li style="margin-bottom:10px;"><strong>Memo Test:</strong> Click pieces in a specific order to practice memorization. Configure piece order, image size, and set time/target goals in settings.</li>
                    <li style="margin-bottom:10px;">Access training modes from the sidebar under the <strong>Training</strong> dropdown</li>
                    <li style="margin-bottom:10px;">Each training mode has its own settings accessible from within the training modal</li>
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
                    <li style="margin-bottom:15px;">Each case shows multiple angles/algorithms with traced piece movements based on your tracked pieces configuration.</li>
                    <li style="margin-bottom:15px;"><strong>Show Actual State</strong> displays the algorithm result on a fully colored Square-1 cube (can be hidden in Settings).</li>
                    <li style="margin-bottom:15px;"><strong>Change Tracked Pieces</strong> allows you to view different piece combinations and perspectives for this specific case (can be hidden in Settings).</li>
                    <li style="margin-bottom:15px;"><strong>Show Reference Scheme</strong> displays your labeling system on a square/square (0,0) state for reference (can be hidden in Settings).</li>
                    <li style="margin-bottom:15px;"><strong>Train This Case</strong> opens the training mode for this specific case, maintaining the exact parity and orientation (can be shown/hidden in Settings).</li>
                    <li style="margin-bottom:15px;">Click the <strong>Edit</strong> button to modify algorithms, add new angles, or change case settings.</li>
                    <li style="margin-bottom:15px;">Algorithms are displayed in both input format and normalized format (swap display order in Settings).</li>
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
        <h4 style="margin-bottom:10px;">Algorithm Input:</h4>
        <ul style="padding-left:20px;margin-bottom:20px;">
            <li style="margin-bottom:10px;">Enter algorithms in standard SQ1 notation (e.g., <code>1,0 / 3,0 / -1,-1</code>)</li>
            <li style="margin-bottom:10px;">Use apostrophe (') as a minus sign: <code>4'</code> means <code>-4</code></li>
            <li style="margin-bottom:10px;">Slashes are optional—they'll be inserted automatically</li>
            <li style="margin-bottom:10px;">Letter shortcuts for moves:<br>
                1 → A, O, S | 2 → T, C | 3 → U, D | 4 → V, E | 5 → X, F | 6 → W, B<br>
                Add apostrophe for negative: <code>A'</code> means <code>-1</code>
            </li>
            <li style="margin-bottom:10px;">Variables can be used with <code>*variableName*</code> or <code>&lt;variableName&gt;</code></li>
        </ul>
        
        <h4 style="margin-bottom:10px;">Scramble Input:</h4>
        <ul style="padding-left:20px;margin-bottom:20px;">
            <li style="margin-bottom:10px;">When you insert a scramble, it will automatically be converted to the inverse algorithm upon saving</li>
            <li style="margin-bottom:10px;">This allows you to input scrambles directly and have them work as solutions</li>
        </ul>
        
        <h4 style="margin-bottom:10px;">Case Settings:</h4>
        <ul style="padding-left:20px;margin-bottom:20px;">
            <li style="margin-bottom:10px;"><strong>Override default tracked pieces</strong> lets you customize which pieces are tracked for this specific case only (can be hidden in Settings)</li>
            <li style="margin-bottom:10px;">Add custom names to angles for easier identification</li>
            <li style="margin-bottom:10px;">Each angle within a case maintains its parity and orientation classification</li>
        </ul>
        
        <h4 style="margin-bottom:10px;">Edit Mode Navigation:</h4>
        <ul style="padding-left:20px;">
            <li style="margin-bottom:10px;">Use <strong>Undo/Redo</strong> buttons to navigate through your changes</li>
            <li style="margin-bottom:10px;">Click <strong>Done</strong> to save all changes and exit edit mode</li>
            <li style="margin-bottom:10px;">Drag cards to reorder them on the home screen</li>
        </ul>
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
                <h4 style="margin-bottom:10px;">Overall Settings:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;"><strong>Color Mappings:</strong> Customize the color and label for each of the 16 piece positions. These colors are used when tracking specific pieces.</li>
                    <li style="margin-bottom:10px;"><strong>Letter/Number Labels:</strong> Toggle to show or hide piece labels on all traced images throughout the app.</li>
                    <li style="margin-bottom:10px;"><strong>Color Scheme:</strong> Set the colors for the six cube faces (top, bottom, front, right, back, left) for "Show Actual State" visualizations.</li>
                    <li style="margin-bottom:10px;"><strong>Hide Instruction Buttons:</strong> Remove the help (ⓘ) buttons from throughout the app if you don't need them.</li>
                    <li style="margin-bottom:10px;"><strong>Export Data:</strong> Save all your data as a JSON file backup. Includes all cases, variables, settings, and training configurations.</li>
                    <li style="margin-bottom:10px;"><strong>Import Data:</strong> Restore from a previously exported backup. This will replace all current data.</li>
                </ul>
                
                <h4 style="margin-bottom:10px;">Home Settings:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;"><strong>Card Size Scale:</strong> Adjust the size of case cards on the home screen (0.5x to 2x).</li>
                    <li style="margin-bottom:10px;"><strong>Hide Search Bar:</strong> Remove the search bar from the home screen if you don't use it.</li>
                    <li style="margin-bottom:10px;"><strong>Show Train Button:</strong> Display a quick-access training button on each case card.</li>
                </ul>
                
                <h4 style="margin-bottom:10px;">Case Settings:</h4>
                <ul style="padding-left:20px;margin-bottom:20px;">
                    <li style="margin-bottom:10px;"><strong>CS Case Division:</strong> Enable/disable division by Parity (Odd/Even) and Orientation (Original/Mirror).</li>
                    <li style="margin-bottom:10px;"><strong>Image Size:</strong> Controls the size of traced images in case view modals. Training modes have separate size controls.</li>
                    <li style="margin-bottom:10px;"><strong>Default Tracked Pieces:</strong> Set which pieces are tracked by default. Individual cases can override this.</li>
                    <li style="margin-bottom:10px;"><strong>Button Visibility:</strong> Hide buttons you don't use (Actual State, Change Tracked Pieces, Reference Scheme, Train This Case).</li>
                    <li style="margin-bottom:10px;"><strong>Display Options:</strong> Swap algorithm display order, enable mobile view, hide override tracked pieces option.</li>
                </ul>
                
                <h4 style="margin-bottom:10px;">Training & Memo Settings:</h4>
                <ul style="padding-left:20px;">
                    <li style="margin-bottom:10px;">Configure image sizes, text sizes, display options, and randomization settings for each training mode.</li>
                    <li style="margin-bottom:10px;">These settings are accessible from within each training modal and are stored separately.</li>
                </ul>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}