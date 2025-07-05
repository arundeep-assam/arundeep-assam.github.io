const rollButton = document.getElementById('rollButton');
        const diceContainer = document.getElementById('diceContainer');
        const themeSwitchButton = document.getElementById('themeSwitchButton');
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');
        const body = document.body;

        let isDragging = false;
        let startX, startY;
        let currentRotationX = 0;
        let currentRotationY = 0;
        let currentRotationZ = 0;
        const rotationSpeed = 0.5;

        // Define the base rotations for each dice face to appear squarely facing the viewer (front).
        const faceRotations = {
            1: { x: 0, y: 0, z: 0 },
            2: { x: 0, y: 180, z: 0 },
            3: { x: -90, y: 0, z: 0 },
            4: { x: 90, y: 0, z: 0 },
            5: { x: 0, y: -90, z: 0 },
            6: { x: 0, y: 90, z: 0 }
        };

        // Function to apply the transform to the dice container.
        function applyDiceTransform(x, y, z, transition = true) {
            diceContainer.style.transition = transition ? 'transform 1.5s ease-out' : 'none';
            diceContainer.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
        }

        // --- Mouse Events for Dragging ---
        diceContainer.addEventListener('mousedown', (e) => {
            if (rollButton.disabled) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            applyDiceTransform(currentRotationX, currentRotationY, currentRotationZ, false);
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            currentRotationY += deltaX * rotationSpeed;
            currentRotationX -= deltaY * rotationSpeed;

            applyDiceTransform(currentRotationX, currentRotationY, currentRotationZ, false);

            startX = e.clientX;
            startY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                rollDice();
            }
        });

        // --- Touch Events for Dragging ---
        diceContainer.addEventListener('touchstart', (e) => {
            if (rollButton.disabled) return;
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            applyDiceTransform(currentRotationX, currentRotationY, currentRotationZ, false);
            e.preventDefault();
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;

            currentRotationY += deltaX * rotationSpeed;
            currentRotationX -= deltaY * rotationSpeed;

            applyDiceTransform(currentRotationX, currentRotationY, currentRotationZ, false);

            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        window.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                rollDice();
            }
        });

        // Main roll function, called by button or drag release
        function rollDice() {
            if (rollButton.disabled) return;

            rollButton.disabled = true;
            isDragging = false;

            const outcome = Math.floor(Math.random() * 6) + 1;
            const baseRot = faceRotations[outcome];

            const nearestX360 = Math.round(currentRotationX / 360) * 360;
            const nearestY360 = Math.round(currentRotationY / 360) * 360;
            const nearestZ360 = Math.round(currentRotationZ / 360) * 360;

            const numSpins = Math.floor(Math.random() * 5) + 5;

            const targetX = nearestX360 + baseRot.x + (numSpins * 360);
            const targetY = nearestY360 + baseRot.y + (numSpins * 360);
            const targetZ = nearestZ360 + baseRot.z + (numSpins * 360);


            currentRotationX = targetX;
            currentRotationY = targetY;
            currentRotationZ = targetZ;

            applyDiceTransform(currentRotationX, currentRotationY, currentRotationZ, true);

            setTimeout(() => {
                rollButton.disabled = false;
            }, 1500); // Matches the CSS transition duration
        }

        // --- Theme Toggle Logic ---
        function applyTheme(isDarkMode) {
            if (isDarkMode) {
                body.classList.add('dark-mode');
            } else {
                body.classList.remove('dark-mode');
            }
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        }

        // Event listener for the theme switch button
        themeSwitchButton.addEventListener('click', () => {
            const isDarkMode = body.classList.contains('dark-mode');
            applyTheme(!isDarkMode); // Toggle theme
        });

        // Load theme preference from localStorage on page load
        window.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                applyTheme(true);
            } else {
                applyTheme(false); // Default to light if no preference or 'light'
            }

            // Initial setup for dice position to show '1' directly facing the viewer
            currentRotationX = faceRotations[1].x;
            currentRotationY = faceRotations[1].y;
            currentRotationZ = faceRotations[1].z;
            applyDiceTransform(currentRotationX, currentRotationY, currentRotationZ, false); // No transition on initial load
        });

        // Add event listener to the roll button
        rollButton.addEventListener('click', rollDice);

        // Disable right-click context menu on the entire page
        // This prevents users from right-clicking to save images or inspect elements easily.
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault(); // Prevent the default right-click behavior
        });