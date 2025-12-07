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

// Export for use in HTML
if (typeof window !== 'undefined') {
    window.TrainingModule = {
        generateTrainingScramble,
        hexToShapeIndex,
        calculateParity
    };
}