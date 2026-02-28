let display = document.getElementById('result');
let history = document.getElementById('history');
let historyList = document.getElementById('historyList');
let memoryIndicator = document.getElementById('memoryIndicator');
let currentInput = '';
let lastResult = '';
let memory = 0;
let calculationHistory = [];

// Animasi tombol
function addButtonAnimation(button) {
    button.classList.add('btn-clicked');
    setTimeout(() => {
        button.classList.remove('btn-clicked');
    }, 200);
}

// Override fungsi tombol dengan animasi
const originalAppendNumber = appendNumber;
appendNumber = function(num) {
    addButtonAnimation(event.target);
    originalAppendNumber(num);
};

const originalAppendOperator = appendOperator;
appendOperator = function(op) {
    addButtonAnimation(event.target);
    originalAppendOperator(op);
};

const originalCalculateFunction = calculateFunction;
calculateFunction = function(func) {
    addButtonAnimation(event.target);
    originalCalculateFunction(func);
};

function appendNumber(num) {
    if (num === 'pi') {
        currentInput += Math.PI.toString();
    } else if (num === 'e') {
        currentInput += Math.E.toString();
    } else {
        currentInput += num;
    }
    updateDisplay();
}

function appendOperator(op) {
    if (op === '(' || op === ')') {
        currentInput += op;
    } else if (currentInput && !isOperator(currentInput.slice(-1))) {
        currentInput += op;
    }
    updateDisplay();
}

function isOperator(char) {
    return ['+', '-', '*', '/', '(', ')'].includes(char);
}

function calculateFunction(func) {
    if (!currentInput && func !== 'factorial' && func !== 'powY') {
        return;
    }

    let num = parseFloat(currentInput) || 0;
    let result;

    switch(func) {
        case 'sin':
        case 'cos':
        case 'tan':
            result = trigonometricFunction(func, num);
            break;
        case 'asin':
        case 'acos':
        case 'atan':
            result = inverseTrigonometricFunction(func, num);
            break;
        case 'log':
            result = Math.log10(num);
            break;
        case 'ln':
            result = Math.log(num);
            break;
        case 'sqrt':
            result = Math.sqrt(num);
            break;
        case 'pow2':
            result = Math.pow(num, 2);
            break;
        case 'pow3':
            result = Math.pow(num, 3);
            break;
        case 'powY':
            addToHistory(currentInput + ' ^ ');
            history.innerHTML = currentInput + ' ^ ';
            currentInput = '';
            lastResult = 'powY';
            return;
        case 'factorial':
            result = factorial(num);
            break;
        case 'abs':
            result = Math.abs(num);
            break;
        case 'reciprocal':
            result = 1 / num;
            break;
        case 'mod':
            addToHistory(currentInput + ' % ');
            history.innerHTML = currentInput + ' % ';
            currentInput = '';
            lastResult = 'mod';
            return;
    }

    if (result !== undefined) {
        if (isNaN(result) || !isFinite(result)) {
            showError('Hasil tidak valid');
        } else {
            currentInput = result.toString();
            updateDisplay();
        }
    }
}

function trigonometricFunction(func, num) {
    let angle = num;
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    if (mode === 'deg') {
        angle = num * (Math.PI / 180);
    } else if (mode === 'grad') {
        angle = num * (Math.PI / 200);
    }
    
    switch(func) {
        case 'sin': return Math.sin(angle);
        case 'cos': return Math.cos(angle);
        case 'tan': return Math.tan(angle);
    }
}

function inverseTrigonometricFunction(func, num) {
    let result;
    switch(func) {
        case 'asin': result = Math.asin(num); break;
        case 'acos': result = Math.acos(num); break;
        case 'atan': result = Math.atan(num); break;
    }
    
    const mode = document.querySelector('input[name="mode"]:checked').value;
    if (mode === 'deg') {
        result = result * (180 / Math.PI);
    } else if (mode === 'grad') {
        result = result * (200 / Math.PI);
    }
    
    return result;
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    if (!Number.isInteger(n)) return NaN;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function toggleSign() {
    if (currentInput) {
        let num = parseFloat(currentInput);
        currentInput = (num * -1).toString();
        updateDisplay();
    }
}

function deleteLast() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
}

function clearAll() {
    currentInput = '';
    history.innerHTML = '';
    lastResult = '';
    updateDisplay();
}

function updateDisplay() {
    display.value = currentInput || '0';
    // Tambahkan efek glow berdasarkan nilai
    if (currentInput.length > 10) {
        display.style.fontSize = '32px';
    } else {
        display.style.fontSize = '42px';
    }
}

function showError(message) {
    display.value = 'Error';
    display.style.color = '#ef4444';
    setTimeout(() => {
        display.value = currentInput || '0';
        display.style.color = '#fff';
    }, 1500);
}

function addToHistory(entry) {
    calculationHistory.unshift(entry);
    if (calculationHistory.length > 10) {
        calculationHistory.pop();
    }
    updateHistoryPanel();
}

function updateHistoryPanel() {
    historyList.innerHTML = '';
    calculationHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = item;
        historyItem.onclick = () => {
            currentInput = item.split('=')[0].trim();
            updateDisplay();
        };
        historyList.appendChild(historyItem);
    });
}

// Memory Functions
function memoryStore() {
    if (currentInput) {
        memory = parseFloat(currentInput);
        memoryIndicator.style.display = 'block';
        addToHistory(`M → ${memory}`);
    }
}

function memoryRecall() {
    if (memory !== 0) {
        currentInput = memory.toString();
        updateDisplay();
    }
}

function memoryClear() {
    memory = 0;
    memoryIndicator.style.display = 'none';
    addToHistory('Memory cleared');
}

function memoryAdd() {
    if (currentInput) {
        memory += parseFloat(currentInput);
        memoryIndicator.style.display = 'block';
        addToHistory(`M+ → ${memory}`);
    }
}

function calculate() {
    if (!currentInput) return;

    try {
        let expression = currentInput;
        let calculationString = currentInput;
        
        // Handle special operations
        if (lastResult === 'powY') {
            let base = parseFloat(history.innerHTML.replace(' ^ ', ''));
            let exponent = parseFloat(currentInput);
            currentInput = Math.pow(base, exponent).toString();
            calculationString = `${base} ^ ${exponent} = ${currentInput}`;
            history.innerHTML = '';
            lastResult = '';
        } else if (lastResult === 'mod') {
            let dividend = parseFloat(history.innerHTML.replace(' % ', ''));
            let divisor = parseFloat(currentInput);
            currentInput = (dividend % divisor).toString();
            calculationString = `${dividend} % ${divisor} = ${currentInput}`;
            history.innerHTML = '';
            lastResult = '';
        } else {
            // Evaluate regular expression
            expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
            
            // Gunakan Function constructor untuk evaluasi yang aman
            const result = new Function('return ' + expression)();
            
            if (isNaN(result) || !isFinite(result)) {
                throw new Error('Hasil tidak valid');
            }
            
            calculationString = `${currentInput} = ${result}`;
            currentInput = result.toString();
        }
        
        addToHistory(calculationString);
        history.innerHTML = calculationString;
        updateDisplay();
        
    } catch (error) {
        showError('Error');
        currentInput = '';
    }
}

// Keyboard support dengan animasi
document.addEventListener('keydown', (e) => {
    const key = e.key;
    const buttons = document.querySelectorAll('.btn');
    
    // Cari tombol yang sesuai dan beri animasi
    buttons.forEach(button => {
        if (button.textContent === key || 
            (key === 'Enter' && button.textContent === '=') ||
            (key === 'Escape' && button.textContent === 'C')) {
            addButtonAnimation(button);
        }
    });
    
    if (key >= '0' && key <= '9') {
        appendNumber(key);
    } else if (key === '.') {
        appendNumber('.');
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        appendOperator(key);
    } else if (key === '(' || key === ')') {
        appendOperator(key);
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
    } else if (key === 'Escape') {
        clearAll();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

// Initialize
clearAll();

// Tambahkan efek loading simulasi
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Efek hover modern untuk semua tombol
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        btn.style.setProperty('--mouse-x', `${x}px`);
        btn.style.setProperty('--mouse-y', `${y}px`);
    });
});