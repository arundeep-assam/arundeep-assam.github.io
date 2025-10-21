class Calculator {
            constructor(previousOperandTextElement, currentOperandTextElement, historyListElement) {
                this.previousOperandTextElement = previousOperandTextElement;
                this.currentOperandTextElement = currentOperandTextElement;
                this.historyListElement = historyListElement;
                this.history = this.loadHistory();
                this.clear();
                this.updateHistoryDisplay();
            }

            clear() {
                this.currentOperand = '0';
                this.previousOperand = '';
                this.operation = undefined;
            }

            delete() {
                this.currentOperand = this.currentOperand.toString().slice(0, -1);
                if (this.currentOperand === '') {
                    this.currentOperand = '0';
                }
            }

            appendNumber(number) {
                // Clear error state if a new number is typed
                if (this.currentOperand === 'Error') {
                    this.currentOperand = '0';
                    this.previousOperand = '';
                    this.operation = undefined;
                }
                if (number === '.' && this.currentOperand.includes('.')) return;
                if (this.currentOperand === '0' && number !== '.') {
                    this.currentOperand = number.toString();
                } else {
                    this.currentOperand = this.currentOperand.toString() + number.toString();
                }
            }

            chooseOperation(operation) {
                // Clear error state if an operator is chosen
                if (this.currentOperand === 'Error') {
                    this.currentOperand = '0';
                    this.previousOperand = '';
                    this.operation = undefined;
                }
                if (this.currentOperand === '') return;
                if (this.previousOperand !== '') {
                    this.compute();
                }
                this.operation = operation;
                this.previousOperand = this.currentOperand;
                this.currentOperand = '';
            }

            compute() {
                let computation;
                const prev = parseFloat(this.previousOperand);
                const current = parseFloat(this.currentOperand);
                if (isNaN(prev) || isNaN(current)) return;

                switch (this.operation) {
                    case '+':
                        computation = prev + current;
                        break;
                    case '-':
                        computation = prev - current;
                        break;
                    case '×':
                        computation = prev * current;
                        break;
                    case '÷':
                        if (current === 0) {
                            this.currentOperand = 'Error';
                            this.previousOperand = '';
                            this.operation = undefined;
                            this.updateDisplay();
                            return;
                        }
                        computation = prev / current;
                        break;
                    default:
                        return;
                }

                const historyEntry = `${this.getDisplayNumber(prev)} ${this.operation} ${this.getDisplayNumber(current)} = ${this.getDisplayNumber(computation)}`;
                this.addHistoryEntry(historyEntry);

                this.currentOperand = computation.toString();
                this.operation = undefined;
                this.previousOperand = '';
            }

            getDisplayNumber(number) {
                const stringNumber = number.toString();
                const integerDigits = parseFloat(stringNumber.split('.')[0]);
                const decimalDigits = stringNumber.split('.')[1];
                let integerDisplay;
                if (isNaN(integerDigits)) {
                    integerDisplay = '';
                } else {
                    integerDisplay = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(integerDigits);
                }
                if (decimalDigits != null) {
                    return `${integerDisplay}.${decimalDigits}`;
                } else {
                    return integerDisplay;
                }
            }

            updateDisplay() {
                if (this.currentOperand === 'Error') {
                    this.currentOperandTextElement.innerText = 'Error';
                    this.previousOperandTextElement.innerText = '';
                    return;
                }
                this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
                if (this.operation != null) {
                    this.previousOperandTextElement.innerText =
                        `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
                } else {
                    this.previousOperandTextElement.innerText = '';
                }
            }

            loadHistory() {
                try {
                    const storedHistory = sessionStorage.getItem('calculatorHistory');
                    return storedHistory ? JSON.parse(storedHistory) : [];
                } catch (e) {
                    console.error("Failed to load history from session storage:", e);
                    return [];
                }
            }

            saveHistory() {
                try {
                    sessionStorage.setItem('calculatorHistory', JSON.stringify(this.history));
                } catch (e) {
                    console.error("Failed to save history to session storage:", e);
                }
            }

            addHistoryEntry(entry) {
                this.history.push(entry);
                this.saveHistory();
                this.updateHistoryDisplay();
            }

            clearAllHistory() {
                this.history = [];
                this.saveHistory();
                this.updateHistoryDisplay();
            }

            updateHistoryDisplay() {
                this.historyListElement.innerHTML = '';
                this.history.forEach(entry => {
                    const listItem = document.createElement('li');
                    listItem.innerText = entry;
                    this.historyListElement.prepend(listItem);
                });
            }
        }

        const htmlElement = document.documentElement;
        const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = document.getElementById('theme-icon-sun');
        const moonIcon = document.getElementById('theme-icon-moon');
        const clearHistoryButton = document.getElementById('clear-history-button');

        function setTheme(theme) {
            if (theme === 'dark') {
                htmlElement.classList.add('dark-mode');
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
                localStorage.setItem('theme', 'dark');
            } else {
                htmlElement.classList.remove('dark-mode');
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
                localStorage.setItem('theme', 'light');
            }
        }

        function initializeTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                setTheme(savedTheme);
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
            } else {
                setTheme('light');
            }
        }

        themeToggle.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark-mode')) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        });

        const numberButtons = document.querySelectorAll('[data-number]');
        const operatorButtons = document.querySelectorAll('[data-operator]');
        const equalsButton = document.querySelector('[data-equals]');
        const deleteButton = document.querySelector('[data-delete]');
        const allClearButton = document.querySelector('[data-all-clear]');
        const previousOperandTextElement = document.querySelector('[data-previous-operand]');
        const currentOperandTextElement = document.querySelector('[data-current-operand]');
        const historyListElement = document.querySelector('[data-history-list]');
        const calculatorElement = document.querySelector('.calculator');
        const historyPanelElement = document.querySelector('.history-panel');

        const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, historyListElement);

        function adjustHistoryPanelHeight() {
            if (window.innerWidth > 768) {
                const calculatorHeight = calculatorElement.offsetHeight;
                historyPanelElement.style.height = `${calculatorHeight}px`;
            } else {
                historyPanelElement.style.height = 'auto';
            }
        }

        window.addEventListener('load', () => {
            initializeTheme();
            adjustHistoryPanelHeight();
        });
        window.addEventListener('resize', adjustHistoryPanelHeight);

        numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                calculator.appendNumber(button.innerText);
                calculator.updateDisplay();
            });
        });

        operatorButtons.forEach(button => {
            button.addEventListener('click', () => {
                calculator.chooseOperation(button.innerText);
                calculator.updateDisplay();
            });
        });

        equalsButton.addEventListener('click', button => {
            calculator.compute();
            calculator.updateDisplay();
        });

        allClearButton.addEventListener('click', button => {
            calculator.clear();
            calculator.updateDisplay();
        });

        deleteButton.addEventListener('click', button => {
            calculator.delete();
            calculator.updateDisplay();
        });

        clearHistoryButton.addEventListener('click', () => {
            calculator.clearAllHistory();
        });

        // Function to highlight a button
        function highlightButton(buttonElement) {
            if (buttonElement) {
                buttonElement.classList.add('active-key');
                setTimeout(() => {
                    buttonElement.classList.remove('active-key');
                }, 150); // Highlight for 150ms
            }
        }

        // Keyboard support with highlighting
        document.addEventListener('keydown', e => {
            let targetButton = null;
            if (e.key >= '0' && e.key <= '9') {
                targetButton = document.querySelector(`.button[data-number]:contains("${e.key}")`);
                calculator.appendNumber(e.key);
            } else if (e.key === '.') {
                targetButton = document.querySelector(`.button[data-number]:contains(".")`);
                calculator.appendNumber(e.key);
            } else if (e.key === '+') {
                targetButton = document.querySelector(`.button[data-operator]:contains("+")`);
                calculator.chooseOperation('+');
            } else if (e.key === '-') {
                targetButton = document.querySelector(`.button[data-operator]:contains("-")`);
                calculator.chooseOperation('-');
            } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
                targetButton = document.querySelector(`.button[data-operator]:contains("×")`);
                calculator.chooseOperation('×');
            } else if (e.key === '/') {
                targetButton = document.querySelector(`.button[data-operator]:contains("÷")`);
                calculator.chooseOperation('÷');
            } else if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault(); // Prevent default action (e.g., form submission)
                targetButton = equalsButton;
                calculator.compute();
            } else if (e.key === 'Backspace') {
                targetButton = deleteButton;
                calculator.delete();
            } else if (e.key === 'Delete' || e.key === 'Escape') {
                targetButton = allClearButton;
                calculator.clear();
            }

            highlightButton(targetButton); // Call highlight function
            calculator.updateDisplay();
        });

        // Add a custom :contains pseudo-class for easier DOM selection in JavaScript
        // This is not standard CSS, but useful for JavaScript querySelector.
        // It's a simple helper, not a full CSS extension.
        // This should be defined before use if using querySelector with :contains
        // However, a simpler query using the innerText directly or filtering the NodeList is often better.
        // For simplicity and to avoid extending native prototypes, we will find the element by iterating the NodeList.
        // The original code already uses `document.querySelectorAll(...):contains(...)`
        // which implies such a helper or alternative selection method is needed for `.button:contains(...)`.
        // Let's refine the selection to directly use the innerText matching.

        // Refined key mapping for highlighting
        // (No need for a custom :contains pseudo-class in this approach)

        // The previous `targetButton = document.querySelector(`.button[data-number]:contains("${e.key}")`);` syntax
        // does not work directly without a custom polyfill for `:contains` in vanilla JS.
        // I will adjust the `targetButton` selection logic to correctly find the button based on its `innerText` or `dataset` attributes.
        const allButtons = document.querySelectorAll('.button'); // Get all calculator buttons once

        // Updated Keyboard support with accurate highlighting logic
        document.removeEventListener('keydown', (e) => { /* remove old listener first */ }); // Ensure no duplicate listeners
        document.addEventListener('keydown', e => {
            let targetButton = null;
            const key = e.key;
            let handled = true; // Flag to indicate if key was handled and should prevent default

            if (key >= '0' && key <= '9') {
                targetButton = Array.from(numberButtons).find(button => button.innerText === key);
                calculator.appendNumber(key);
            } else if (key === '.') {
                targetButton = Array.from(numberButtons).find(button => button.innerText === '.');
                calculator.appendNumber(key);
            } else if (key === '+') {
                targetButton = Array.from(operatorButtons).find(button => button.innerText === '+');
                calculator.chooseOperation('+');
            } else if (key === '-') {
                targetButton = Array.from(operatorButtons).find(button => button.innerText === '-');
                calculator.chooseOperation('-');
            } else if (key === '*' || key.toLowerCase() === 'x') {
                targetButton = Array.from(operatorButtons).find(button => button.innerText === '×'); // Use '×' for multiplication
                calculator.chooseOperation('×');
            } else if (key === '/') {
                targetButton = Array.from(operatorButtons).find(button => button.innerText === '÷'); // Use '÷' for division
                calculator.chooseOperation('÷');
            } else if (key === 'Enter' || key === '=') {
                targetButton = equalsButton;
                calculator.compute();
            } else if (key === 'Backspace') {
                targetButton = deleteButton;
                calculator.delete();
            } else if (key === 'Delete' || key === 'Escape') { // Using Delete key for All Clear
                targetButton = allClearButton;
                calculator.clear();
            } else {
                handled = false; // Key not handled by our calculator logic
            }

            if (handled) {
                e.preventDefault(); // Prevent default browser actions for handled keys
                highlightButton(targetButton);
                calculator.updateDisplay();
            }
        });

        // Disable right-click context menu on the entire page
        // This prevents users from right-clicking to save images or inspect elements easily.
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault(); // Prevent the default right-click behavior
        });