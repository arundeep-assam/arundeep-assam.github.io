// Game state variables
        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameActive = true;

        // DOM elements
        const cells = document.querySelectorAll('.cell');
        const statusDisplay = document.getElementById('status');
        const restartButton = document.getElementById('restart-button');
        const winningLine = document.getElementById('winning-line');
        const sparkleColors = ['#F6AD55', '#90CDF4', '#68D391', '#FC8181', '#B794F4'];

        // Winning conditions (rows, columns, diagonals)
        const winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        /**
         * Updates the status message on the screen.
         * @param {string} message - The message to display.
         */
        const updateStatus = (message) => {
            statusDisplay.textContent = message;
        };

        /**
         * Checks for a winner or a draw and updates the game state.
         */
        const handleResultValidation = () => {
            let winCondition = null;
            // Loop through all winning conditions
            for (let i = 0; i < winningConditions.length; i++) {
                const currentCondition = winningConditions[i];
                let a = board[currentCondition[0]];
                let b = board[currentCondition[1]];
                let c = board[currentCondition[2]];

                // If any cell in the condition is empty, continue
                if (a === '' || b === '' || c === '') {
                    continue;
                }

                // If the marks match, a player has won
                if (a === b && b === c) {
                    winCondition = currentCondition;
                    break;
                }
            }

            // If the round is won, declare the winner and draw the line
            if (winCondition) {
                updateStatus(`${currentPlayer} has won!`);
                gameActive = false;
                drawLine(winCondition);
                createSparkles();
                return;
            }

            // Check for a draw (if all cells are filled)
            let roundDraw = !board.includes('');
            if (roundDraw) {
                updateStatus('Game ended in a draw!');
                gameActive = false;
                return;
            }

            // If no win or draw, switch to the other player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateStatus(`${currentPlayer}'s turn`);
        };

        /**
         * Draws the winning line over the winning cells.
         * @param {number[]} condition - The array of indices for the winning cells.
         */
        const drawLine = (condition) => {
            const startCell = cells[condition[0]];
            const endCell = cells[condition[2]];

            const startRect = startCell.getBoundingClientRect();
            const endRect = endCell.getBoundingClientRect();
            const boardRect = document.getElementById('game-board').getBoundingClientRect();

            // Calculate the start and end coordinates relative to the board
            const startX = startRect.left + (startRect.width / 2) - boardRect.left;
            const startY = startRect.top + (startRect.height / 2) - boardRect.top;
            const endX = endRect.left + (endRect.width / 2) - boardRect.left;
            const endY = endRect.top + (endRect.height / 2) - boardRect.top;

            // Calculate the length of the line
            const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

            // Calculate the angle of rotation
            const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

            // Apply styles to the winning line
            
            winningLine.style.transform = `rotate(${angle}deg)`;
            winningLine.style.width = `${length}px`;
            winningLine.style.top = `${startY}px`;
            winningLine.style.left = `${startX}px`;            
            winningLine.style.opacity = '1';
            // Add a class to start the animation
            winningLine.style.animation = 'pulse-glow 1.5s infinite';
        };

        /**
         * Creates and animates a shower of sparkles.
         */
        const createSparkles = () => {
            const numSparkles = 50;
            for (let i = 0; i < numSparkles; i++) {
                const sparkle = document.createElement('div');
                sparkle.classList.add('sparkle');
                
                // Set random size and color
                const size = Math.random() * 10 + 5; // Size between 5 and 15
                const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
                
                sparkle.style.width = `${size}px`;
                sparkle.style.height = `${size}px`;
                sparkle.style.backgroundColor = color;
                
                // Set random initial horizontal position
                sparkle.style.left = `${Math.random() * 100}vw`;
                
                // Set a random animation delay and duration for variation
                sparkle.style.animationDelay = `${Math.random() * 0.5}s`;
                sparkle.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;

                // Add to body and remove after animation
                document.body.appendChild(sparkle);
                sparkle.addEventListener('animationend', () => {
                    sparkle.remove();
                });
            }
        };

        /**
         * Handles a cell click event.
         * @param {Event} event - The click event object.
         */
        const handleCellClick = (event) => {
            const clickedCell = event.target.closest('.cell');
            // Check if the game is active and the clicked cell is empty
            if (!gameActive || clickedCell.querySelector('.cell-content').textContent !== '') {
                return;
            }
            
            // Get the cell's index from its data attribute
            const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

            // Update the game board and the cell's content
            board[clickedCellIndex] = currentPlayer;
            clickedCell.querySelector('.cell-content').textContent = currentPlayer;
            // Add a class for styling based on the player
            clickedCell.querySelector('.cell-content').classList.add(currentPlayer === 'X' ? 'x-mark' : 'o-mark');
            
            // Validate the result after the move
            handleResultValidation();
        };

        /**
         * Restarts the game by resetting the board and state.
         */
        const restartGame = () => {
            gameActive = true;
            currentPlayer = 'X';
            board = ['', '', '', '', '', '', '', '', ''];
            updateStatus(`${currentPlayer}'s turn`);

            // Clear the content of all cells
            cells.forEach(cell => {
                const cellContent = cell.querySelector('.cell-content');
                cellContent.textContent = '';
                cellContent.classList.remove('x-mark', 'o-mark');
            });

            // Hide and reset the winning line and remove the animation
            winningLine.style.opacity = '0';
            // winningLine.style.transform = `rotate(0deg)`;
            winningLine.style.width = '0px';
            winningLine.style.animation = 'none';

            // Clean up any existing sparkles
            const existingSparkles = document.querySelectorAll('.sparkle');
            existingSparkles.forEach(sparkle => sparkle.remove());
        };

        // Add event listeners to each cell
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));

        // Add event listener to the restart button
        restartButton.addEventListener('click', restartGame);


        // Disable right-click context menu on the entire page
        // This prevents users from right-clicking to save images or inspect elements easily.
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault(); // Prevent the default right-click behavior
        });