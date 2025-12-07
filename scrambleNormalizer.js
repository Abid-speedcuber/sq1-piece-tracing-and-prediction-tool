// ========================================
// Square-1 Scramble Normalizer Module
// Handles all normalization logic in one place
// ========================================

/**
 * Main executive function - normalizes any scramble input
 * @param {string} input - Raw scramble input
 * @returns {string} Normalized scramble
 */
function normalizeScramble(input) {
    if (!input) return '';
    
    // First, check if input has variables
    const hasVars = checkForVariables(input);
    
    if (hasVars) {
        // Expand variables recursively
        const expanded = expandVariablesRecursive(input);
        // Then normalize the expanded result
        return normalizeScrambleFormat(expanded);
    } else {
        // No variables, just normalize the format
        return normalizeScrambleFormat(input);
    }
}

/**
 * Check if input contains variable syntax
 * @param {string} input - Input string to check
 * @returns {boolean} True if variables exist
 */
function checkForVariables(input) {
    if (!input) return false;
    
    // Check for *varName* or <varName> patterns
    const asteriskPattern = /\*\w+\*/;
    const anglePattern = /<\w+>/;
    
    return asteriskPattern.test(input) || anglePattern.test(input);
}

/**
 * Recursively expand variables until none remain
 * @param {string} input - Input with variables
 * @param {number} depth - Recursion depth (safety limit)
 * @returns {string} Fully expanded string
 */
function expandVariablesRecursive(input, variableTable = null, depth = 0) {
    // Safety limit to prevent infinite loops
    if (depth > 10) {
        console.warn('Variable expansion depth limit reached');
        return input;
    }
    
    // Expand one level
    const expanded = expandVariablesOneLevel(input, variableTable);
    
    // Check if result still has variables
    if (checkForVariables(expanded)) {
        // Recursively expand again
        return expandVariablesRecursive(expanded, variableTable, depth + 1);
    }
    
    return expanded;
}

/**
 * Expand variables by ONE level only (dumb replacement)
 * @param {string} input - Input with variables
 * @returns {string} String with variables replaced by their raw values
 */
function expandVariablesOneLevel(input, variableTable = null) {
    if (!input) return input;
    
    // Use provided table, or try to get from global STATE, or use empty object
    const variables = variableTable || 
                     (typeof STATE !== 'undefined' && STATE.variables) || 
                     {};
    
    let result = input;
    const varRegex = /[*<](\w+)[*>]/g;
    
    result = result.replace(varRegex, (match, varName) => {
        if (variables[varName] !== undefined) {
            return variables[varName];
        }
        // If variable not found, keep the original syntax
        return match;
    });
    
    return result;
}

/**
 * Normalize scramble format (remove whitespace, combine moves)
 * @param {string} input - Raw scramble string
 * @returns {string} Normalized scramble
 */
function normalizeScrambleFormat(input) {
    if (!input) return '';
    
    // Remove all whitespace and normalize slashes
    let clean = normalizeInput(input);
    
    // Parse into tokens
    let tokens = parseSets(clean);
    
    // Simplify (combine adjacent moves)
    let steps = [];
    let simplified = simplifyScramble(tokens, steps);
    
    // Convert back to string with proper spacing
    let output = simplified.map((tok, i) => {
        if (tok === "/") return "/";
        if (i === 0) return tok;
        return " " + tok;
    }).join("").replace(/\/\s*\(/g, "/ (");
    
    return output;
}

/**
 * Remove whitespace and normalize basic syntax
 */
function normalizeInput(str) {
    return str
        .replace(/[ ]/g, "")
        .replace(/\\/g, "/")
        .replace(/\+\+/g, "+")
        .trim();
}

/**
 * Decode letter shortcuts and prime notation into numbers
 * @param {string} str - Input with letters/primes
 * @returns {string} Decoded string with only numbers and valid syntax
 */
function decodeScramble(str) {
    if (!str) return '';
    
    console.log('=== DECODE START ===');
    console.log('Input string:', str);
    console.log('Input length:', str.length);
    console.log('Char codes:', [...str].map((c, i) => `[${i}]='${c}' (${c.charCodeAt(0)})`));
    
    // Define letter mappings (case-insensitive)
    const letterMap = {
        'U': '3', 'D': '3',
        'V': '4', 'E': '4',
        'W': '6', 'B': '6',
        'X': '5', 'F': '5',
        'A': '1', 'O': '1', 'S': '1',
        'T': '2', 'C': '2'
    };
    
    // First pass: normalize all apostrophe types to standard '
    let normalized = str.replace(/[''`']/g, "'");
    console.log('After normalization:', normalized);
    console.log('Normalized char codes:', [...normalized].map((c, i) => `[${i}]='${c}' (${c.charCodeAt(0)})`));
    
    let result = '';
    let i = 0;
    
    while (i < normalized.length) {
        const char = normalized[i];
        const upperChar = char.toUpperCase();
        
        console.log(`\n[${i}] Processing: '${char}' (${char.charCodeAt(0)})`);
        
        // Check if it's a DIGIT
        if (/\d/.test(char)) {
            const digit = char;
            console.log(`  → Found digit: ${digit}`);
            
            // LOOK AHEAD for prime or minus
            if (i + 1 < normalized.length) {
                const nextChar = normalized[i + 1];
                console.log(`  → Next char: '${nextChar}' (${nextChar.charCodeAt(0)})`);
                
                if (nextChar === "'" || nextChar === '-') {
                    const num = parseInt(digit);
                    console.log(`  → PRIME DETECTED! Negating ${digit}`);
                    
                    // Special case: 6' = 6, 0' = 0
                    if (num === 6 || num === 0) {
                        result += digit;
                        console.log(`  → Special case (6 or 0), keeping: ${digit}`);
                    } else {
                        result += '-' + digit;
                        console.log(`  → Output: -${digit}`);
                    }
                    
                    i += 2; // Skip digit AND prime/minus
                    continue;
                }
            }
            
            result += digit;
            console.log(`  → No prime, output: ${digit}`);
            i++;
        }
        // Check if it's a LETTER we recognize
        else if (letterMap[upperChar]) {
            console.log(`  → Found letter: ${upperChar} → ${letterMap[upperChar]}`);
            
            // LOOK AHEAD for prime or minus
            let isPrime = false;
            
            if (i + 1 < normalized.length) {
                const nextChar = normalized[i + 1];
                console.log(`  → Next char: '${nextChar}' (${nextChar.charCodeAt(0)})`);
                
                // Accept: ' (apostrophe), - (minus), ` (backtick)
                if (nextChar === "'" || nextChar === "`" || nextChar === '-') {
                    isPrime = true;
                    console.log(`  → PRIME DETECTED!`);
                }
            }
            
            const baseValue = letterMap[upperChar];
            
            // Apply negation for prime (except W/B which stay 6)
            if (isPrime) {
                if (upperChar === 'W' || upperChar === 'B') {
                    result += '6';
                    console.log(`  → W/B with prime, output: 6`);
                } else {
                    result += '-' + baseValue;
                    console.log(`  → Output: -${baseValue}`);
                }
                i += 2; // Skip letter AND prime/minus
            } else {
                result += baseValue;
                console.log(`  → No prime, output: ${baseValue}`);
                i++; // Just skip letter
            }
        }
        // Keep everything else (slashes, parentheses, commas, spaces)
        else {
            console.log(`  → Other char, keeping: '${char}'`);
            // Skip apostrophes that weren't consumed (shouldn't happen, but safety)
            if (char !== "'") {
                result += char;
            }
            i++;
        }
    }
    
    console.log('\n=== DECODE END ===');
    console.log('Final result:', result);
    console.log('==================\n');
    
    return result;
}
/**
 * Parse scramble into token array
 */
function parseSets(str) {
    // Handle empty or whitespace-only input
    if (!str || str.trim() === '') {
        return [];
    }
    
    // DECODE FIRST - convert letters and primes to numbers
    str = decodeScramble(str);
    
    // Check for leading/trailing slashes
    const hasLeadingSlash = str.trimStart().startsWith('/');
    const hasTrailingSlash = str.trimEnd().endsWith('/');
    
    // Extract all INDIVIDUAL DIGITS (including negative signs)
    let numbers = [];
    let i = 0;
    
    while (i < str.length) {
        // Skip non-numeric characters except minus
        if (str[i] === '-') {
            // Check if next character is a digit
            if (i + 1 < str.length && /\d/.test(str[i + 1])) {
                numbers.push(-parseInt(str[i + 1]));
                i += 2; // Skip both minus and digit
            } else {
                i++;
            }
        } else if (/\d/.test(str[i])) {
            numbers.push(parseInt(str[i]));
            i++;
        } else {
            i++;
        }
    }
    
    // If no numbers found, return empty array
    if (numbers.length === 0) {
        return [];
    }
    
    // If odd number of values, auto-pad with 0
    if (numbers.length % 2 !== 0) {
        console.warn(`Odd number of values (${numbers.length}). Auto-padding with 0.`);
        numbers.push(0);
    }
    
    // Group into pairs and format as tokens
    let tokens = [];
    
    // Add leading slash if present
    if (hasLeadingSlash) {
        tokens.push("/");
    }
    
    for (let i = 0; i < numbers.length; i += 2) {
        tokens.push(`(${numbers[i]},${numbers[i + 1]})`);
        // Add slash after each pair except the last
        if (i + 2 < numbers.length) {
            tokens.push("/");
        }
    }
    
    // Add trailing slash if present
    if (hasTrailingSlash) {
        tokens.push("/");
    }
    
    return tokens;
}

/**
 * Add two move sets together
 */
function addSets(a, b) {
    let m = /\((-?\d+),(-?\d+)\)/.exec(a);
    let n = /\((-?\d+),(-?\d+)\)/.exec(b);
    let x1 = parseInt(m[1]), y1 = parseInt(m[2]);
    let x2 = parseInt(n[1]), y2 = parseInt(n[2]);
    let x = x1 + x2, y = y1 + y2;
    
    function norm(v) {
        if (v > 6) v -= 12;
        if (v < -6) v += 12;
        return v;
    }
    
    x = norm(x); 
    y = norm(y);
    return `(${x},${y})`;
}

/**
 * Simplify scramble by combining adjacent moves
 */
function simplifyScramble(tokens, steps) {
    let changed = true;
    
    while (changed) {
        changed = false;
        
        // Remove double slashes
        for (let i = 0; i < tokens.length - 1; i++) {
            if (tokens[i] === "/" && tokens[i + 1] === "/") {
                tokens.splice(i, 2); 
                steps.push(tokens.join("")); 
                changed = true; 
                break;
            }
        }
        if (changed) continue;
        
        // Combine adjacent moves
        for (let i = 0; i < tokens.length - 1; i++) {
            if (tokens[i].startsWith("(") && tokens[i + 1].startsWith("(")) {
                let merged = addSets(tokens[i], tokens[i + 1]);
                tokens.splice(i, 2, merged); 
                steps.push(tokens.join("")); 
                changed = true; 
                break;
            }
        }
        if (changed) continue;
        
        // Remove (0,0) moves
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === "(0,0)") {
                tokens.splice(i, 1);
                steps.push(tokens.join(""));
                changed = true;
                break;
            }
        }
    }
    
    return tokens;
}

// Export for use
if (typeof window !== 'undefined') {
    window.ScrambleNormalizer = {
        normalizeScramble,
        checkForVariables,
        expandVariablesRecursive,
        normalizeScrambleFormat
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        normalizeScramble,
        checkForVariables,
        expandVariablesRecursive,
        normalizeScrambleFormat
    };
}