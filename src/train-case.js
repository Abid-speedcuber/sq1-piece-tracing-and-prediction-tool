// ========================================
// Square-1 Case Training Logic
// ========================================

// === SHAPE INDEX CALCULATION ===
const Shape_halflayer = [0, 3, 6, 12, 15, 24, 27, 30, 48, 51, 54, 60, 63];
const Shape_ShapeIdx = [];

function initTrainingShapes() {
    let count = 0;
    for (let i = 0; i < 28561; i++) {
        const dr = Shape_halflayer[i % 13];
        const dl = Shape_halflayer[Math.floor(i / 13) % 13];
        const ur = Shape_halflayer[Math.floor(Math.floor(i / 13) / 13) % 13];
        const ul = Shape_halflayer[Math.floor(Math.floor(Math.floor(i / 13) / 13) / 13)];
        const value = ul << 18 | ur << 12 | dl << 6 | dr;
        
        let bitCount = 0;
        let temp = value;
        while (temp) {
            bitCount += temp & 1;
            temp >>= 1;
        }
        
        if (bitCount === 16) {
            Shape_ShapeIdx[count++] = value;
        }
    }
}

function shapeArrayToValue(shapeArray) {
    let value = 0;
    for (let i = 0; i < 24; i++) {
        value |= shapeArray[23 - i] << i;
    }
    return value;
}

function hexToShapeIndex(hexScramble) {
    const cleanHex = hexScramble.replace(/[\/|]/g, '');
    
    if (cleanHex.length !== 24) {
        throw new Error(`Invalid length: expected 24 characters, got ${cleanHex.length}`);
    }
    
    if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
        throw new Error('Invalid characters: only hex digits (0-9, a-f) are allowed');
    }
    
    const shapeArray = new Array(24);
    let corners = 0;
    let edges = 0;
    
    for (let i = 0; i < 24; i++) {
        const char = cleanHex[i].toLowerCase();
        const value = parseInt(char, 16);
        shapeArray[i] = (value % 2 === 1) ? 1 : 0;
        
        if (shapeArray[i] === 1) corners++;
        else edges++;
    }
    
    if (corners !== 16) {
        throw new Error(`Invalid shape: expected 16 corners, got ${corners}`);
    }
    if (edges !== 8) {
        throw new Error(`Invalid shape: expected 8 edges, got ${edges}`);
    }
    
    const shapeValue = shapeArrayToValue(shapeArray);
    const shapeIndex = Shape_ShapeIdx.indexOf(shapeValue);
    
    if (shapeIndex === -1) {
        throw new Error('Shape not found in valid shape list');
    }
    
    return shapeIndex;
}

// === PARITY CALCULATION ===
const CANONICAL_CORNERS = ['1', '3', '5', '7', '9', 'b', 'd', 'f'];
const CANONICAL_EDGES = ['0', '2', '4', '6', '8', 'a', 'c', 'e'];

function parseHexToPieces(hexScramble) {
    const cleanHex = hexScramble.replace(/[\/|]/g, '').toLowerCase();
    
    if (cleanHex.length !== 24) {
        throw new Error(`Invalid length: expected 24 characters, got ${cleanHex.length}`);
    }
    
    if (!/^[0-9a-f]+$/.test(cleanHex)) {
        throw new Error('Invalid characters: only hex digits (0-9, a-f) are allowed');
    }
    
    const corners = [];
    const edges = [];
    
    for (let i = 0; i < 24; i++) {
        const char = cleanHex[i];
        const value = parseInt(char, 16);
        
        if (value % 2 === 1) {
            if (i === 0 || cleanHex[i-1] !== char) {
                corners.push(char);
            }
        } else {
            edges.push(char);
        }
    }
    
    return { corners, edges, cleanHex };
}

function countSwapsToCanonical(pieces, canonical) {
    const arr = [...pieces];
    let swaps = 0;
    
    for (let i = 0; i < arr.length; i++) {
        const targetPiece = canonical[i];
        const currentIndex = arr.indexOf(targetPiece);
        
        if (currentIndex !== i) {
            [arr[i], arr[currentIndex]] = [arr[currentIndex], arr[i]];
            swaps++;
        }
    }
    
    return swaps;
}

function calculateParity(hexScramble) {
    const { corners, edges } = parseHexToPieces(hexScramble);
    
    if (corners.length !== 8) {
        throw new Error(`Invalid corner count: expected 8, got ${corners.length}`);
    }
    
    if (edges.length !== 8) {
        throw new Error(`Invalid edge count: expected 8, got ${edges.length}`);
    }
    
    const cornerSwaps = countSwapsToCanonical(corners, CANONICAL_CORNERS);
    const edgeSwaps = countSwapsToCanonical(edges, CANONICAL_EDGES);
    
    const totalSwaps = cornerSwaps + edgeSwaps;
    const parity = totalSwaps % 2 === 0 ? 'even' : 'odd';
    
    return {
        corners,
        edges,
        cornerSwaps,
        edgeSwaps,
        totalSwaps,
        parity
    };
}

// === RANDOM HEX GENERATION ===
function rn(n) {
    return Math.floor(Math.random() * n);
}

function SqCubie() {
    this.ul = 0x011233;
    this.ur = 0x455677;
    this.dl = 0x998bba;
    this.dr = 0xddcffe;
    this.ml = 0;
}

SqCubie.prototype.toString = function() {
    return this.ul.toString(16).padStart(6, '0') +
        this.ur.toString(16).padStart(6, '0') +
        "|" +
        this.dl.toString(16).padStart(6, '0') +
        this.dr.toString(16).padStart(6, '0');
}

SqCubie.prototype.setPiece = function(idx, value) {
    if (idx < 6) {
        this.ul &= ~(0xf << ((5 - idx) << 2));
        this.ul |= value << ((5 - idx) << 2);
    } else if (idx < 12) {
        this.ur &= ~(0xf << ((11 - idx) << 2));
        this.ur |= value << ((11 - idx) << 2);
    } else if (idx < 18) {
        this.dl &= ~(0xf << ((17 - idx) << 2));
        this.dl |= value << ((17 - idx) << 2);
    } else {
        this.dr &= ~(0xf << ((23 - idx) << 2));
        this.dr |= value << ((23 - idx) << 2);
    }
}

function generateRandomCube(shapeIndex) {
    if (shapeIndex === undefined) {
        shapeIndex = rn(3678);
    }
    
    const f = new SqCubie();
    const shape = Shape_ShapeIdx[shapeIndex];
    let corner = 0x01234567 << 1 | 0x11111111;
    let edge = 0x01234567 << 1;
    let n_corner = 8, n_edge = 8;
    
    for (let i = 0; i < 24; i++) {
        if (((shape >> i) & 1) === 0) {
            const rnd = rn(n_edge) << 2;
            f.setPiece(23 - i, (edge >> rnd) & 0xf);
            const m = (1 << rnd) - 1;
            edge = (edge & m) + ((edge >> 4) & ~m);
            n_edge--;
        } else {
            const rnd = rn(n_corner) << 2;
            f.setPiece(23 - i, (corner >> rnd) & 0xf);
            f.setPiece(22 - i, (corner >> rnd) & 0xf);
            const m = (1 << rnd) - 1;
            corner = (corner & m) + ((corner >> 4) & ~m);
            n_corner--;
            i++;
        }
    }
    f.ml = rn(2);
    return f;
}

// === PARITY FIXING ===
function swapTwoCornersInHex(hexScramble) {
    const cleanHex = hexScramble.replace(/[\/|]/g, '').toLowerCase();
    const equator = hexScramble.includes('|') ? '|' : (hexScramble.includes('/') ? '/' : '');
    
    const hexArray = cleanHex.split('');
    const cornerIndices = [];
    
    for (let i = 0; i < hexArray.length; i++) {
        const value = parseInt(hexArray[i], 16);
        if (value % 2 === 1) {
            cornerIndices.push(i);
            if (cornerIndices.length === 4) break;
        }
    }
    
    if (cornerIndices.length < 4) {
        throw new Error('Could not find enough corners to swap');
    }
    
    const piece1 = hexArray[cornerIndices[0]];
    const piece2 = hexArray[cornerIndices[2]];
    
    hexArray[cornerIndices[0]] = piece2;
    hexArray[cornerIndices[1]] = piece2;
    hexArray[cornerIndices[2]] = piece1;
    hexArray[cornerIndices[3]] = piece1;
    
    const fixedHex = hexArray.join('');
    
    if (equator) {
        return fixedHex.slice(0, 12) + equator + fixedHex.slice(12);
    }
    
    return fixedHex;
}

// === MAIN TRAINING LOGIC ===
function generateTrainingScramble(solution) {
    // 1. Convert solution to scramble
    const expandedSolution = expandVariables(solution);
    const scramble = pleaseInvertThisScrambleForSolutionVisualization(expandedSolution);
    
    // 2. Convert scramble to hex
    const cubeState = applyScrambleToCubePlease(scramble);
    const hexCode = pleaseEncodeMyCubeStateToHexNotation(cubeState);
    
    if (hexCode.startsWith('Error:')) {
        throw new Error(hexCode);
    }
    
    // 3. Get shape index and parity
    const targetShapeIndex = hexToShapeIndex(hexCode);
    const targetParity = calculateParity(hexCode).parity;
    
    // 4. Generate random hex with same shape
    const randomCube = generateRandomCube(targetShapeIndex);
    let randomHex = randomCube.toString();
    
    // 5. Check and fix parity if needed
    const randomParity = calculateParity(randomHex).parity;
    
    if (randomParity !== targetParity) {
        randomHex = swapTwoCornersInHex(randomHex);
    }
    
    // Verify final parity
    const finalParity = calculateParity(randomHex).parity;
    
    return {
        originalScramble: scramble,
        originalHex: hexCode,
        targetShapeIndex,
        targetParity,
        randomHex,
        finalParity,
        parityFixed: randomParity !== targetParity
    };
}

// Initialize shapes on load
initTrainingShapes();

// === UNIFIED HEX GENERATION FOR TRAINING ===
function getTwoHex(solution, lockOrientation, allowMirror, noMirrorShapes) {
    const expandedSolution = window.ScrambleNormalizer.normalizeScramble(solution);
    const scramble = pleaseInvertThisScrambleForSolutionVisualization(expandedSolution);
    const cubeState = applyScrambleToCubePlease(scramble);
    const originalHex = pleaseEncodeMyCubeStateToHexNotation(cubeState);
    
    if (originalHex.startsWith('Error:')) {
        throw new Error(originalHex);
    }
    
    const targetShapeIndex = hexToShapeIndex(originalHex);
    const targetParity = calculateParity(originalHex).parity;
    
    const randomCube = generateRandomCube(targetShapeIndex);
    let randomHex = randomCube.toString();
    
    const randomParity = calculateParity(randomHex).parity;
    if (randomParity !== targetParity) {
        randomHex = swapTwoCornersInHex(randomHex);
    }
    
    let trueHex = originalHex;
    let displayHex = randomHex;
    let rul = 0, rdl = 0, mirrorApplied = false;
    
    if (!lockOrientation) {
        const rblResult = applyRBLToHex(displayHex);
        displayHex = rblResult.hex;
        rul = rblResult.rul;
        rdl = rblResult.rdl;
        
        trueHex = applyRBL(trueHex, rul, rdl);
        
        const shapeIndex = hexToShapeIndex(displayHex);
        const isSymmetric = noMirrorShapes && noMirrorShapes.has(shapeIndex);
        
        if (allowMirror && !isSymmetric && Math.random() < 0.5) {
            displayHex = applyMirrorToHex(displayHex);
            trueHex = applyMirrorToHex(trueHex);
            mirrorApplied = true;
        }
    }
    
    return {
        trueHex,
        displayHex,
        rul,
        rdl,
        mirrorApplied,
        originalHex
    };
}

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
    
    const shapeIndex = Shape_ShapeIdx.indexOf(value);
    if (shapeIndex === -1) throw new Error('Invalid shape');
    return shapeIndex;
}

function getValidRBLForShape(shapeIndex) {
    const VALID_ROTATIONS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
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
    
    const shapeValue = Shape_ShapeIdx[shapeIndex];
    const s24 = shapeValue.toString(2).padStart(24, '0');
    const top = s24.slice(0, 12);
    const bottom = s24.slice(12, 24);
    
    const getValidRotations = (layer) => {
        if (RESTRICTED_PATTERNS[layer]) {
            return [...RESTRICTED_PATTERNS[layer]];
        }
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

// Export for use in HTML
if (typeof window !== 'undefined') {
    window.TrainingModule = {
        generateTrainingScramble,
        hexToShapeIndex,
        calculateParity,
        getTwoHex
    };
}