const colorCanvas = document.getElementById('colorCanvas');
        const ctx = colorCanvas.getContext('2d');
        const hueSliderContainer = document.getElementById('hueSliderContainer');
        const hueSliderThumb = document.getElementById('hueSliderThumb');
        const hexValueElement = document.getElementById('hexValue');
        const rgbValueElement = document.getElementById('rgbValue');
        const cmykValueElement = document.getElementById('cmykValue');
        const hsvValueElement = document.getElementById('hsvValue');
        const hslValueElement = document.getElementById('hslValue');
        const copyHexIcon = document.getElementById('copyHexIcon');
        const finalColorDisplay = document.getElementById('finalColorDisplay');

        const colorSelector = document.getElementById('colorSelector');
        const tooltip = document.getElementById('tooltip');

        // elements for image color picker
        const imageUploadInput = document.getElementById('imageUploadInput');
        const imageUploadArea = document.getElementById('imageUploadArea');
        const browseImageButton = document.getElementById('browseImageButton');
        const uploadedImageContainer = document.getElementById('uploadedImageContainer');
        const uploadedImage = document.getElementById('uploadedImage');
        const imagePickCanvas = document.getElementById('imagePickCanvas');
        const imagePickCtx = imagePickCanvas.getContext('2d');
        const clearImageButton = document.getElementById('clearImageButton');
        const imageColorPickPointer = document.getElementById('imageColorPickPointer');

        // elements for zoom preview
        const imageZoomPreview = document.getElementById('imageZoomPreview');
        const zoomCanvas = document.getElementById('zoomCanvas');
        const zoomCtx = zoomCanvas.getContext('2d');

        // Theme switch elements
        const themeSwitchButton = document.getElementById('themeSwitchButton');
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');


        let currentHue = 0; // 0-360
        let currentSaturationHSV = 1; // 0-1 for HSV Saturation
        let currentValue = 1; // 0-1 for HSV Value/Brightness
        let isDraggingHue = false;
        let isDraggingColor = false;

        // Function to convert HSV to RGB
        function hsvToRgb(h, s, v) {
            s /= 100; // Convert to 0-1 range
            v /= 100; // Convert to 0-1 range
            let c = v * s;
            let x = c * (1 - Math.abs((h / 60) % 2 - 1));
            let m = v - c;
            let r = 0, g = 0, b = 0;

            if (0 <= h && h < 60) {
                r = c; g = x; b = 0;
            } else if (60 <= h && h < 120) {
                r = x; g = c; b = 0;
            } else if (120 <= h && h < 180) {
                r = 0; g = c; b = x;
            } else if (180 <= h && h < 240) {
                r = 0; g = x; b = c;
            } else if (240 <= h && h < 300) {
                r = x; g = 0; b = c;
            } else if (300 <= h && h < 360) {
                r = c; g = 0; b = x;
            }
            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);

            return { r, g, b };
        }

        // Function to convert RGB to HSL (needed for HSL display from HSV internal)
        function rgbToHsl(r, g, b) {
            r /= 255, g /= 255, b /= 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                l: Math.round(l * 100)
            };
        }

        // Function to convert RGB to HSV
        function rgbToHsv(r, g, b) {
            r /= 255, g /= 255, b /= 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, v = max;

            let d = max - min;
            s = max === 0 ? 0 : d / max;

            if (max === min) {
                h = 0; // achromatic
            } else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                v: Math.round(v * 100)
            };
        }


        // Function to draw the color area on the canvas (using HSV logic)
        function drawColorCanvas() {
            const width = colorCanvas.offsetWidth;
            const height = colorCanvas.offsetHeight;
            colorCanvas.width = width;
            colorCanvas.height = height;

            // Fill with the pure hue color (HSV max saturation and value)
            ctx.fillStyle = `hsl(${currentHue}, 100%, 50%)`; // HSL 50% lightness is the pure color for a given hue
            ctx.fillRect(0, 0, width, height);

            // Overlay a gradient from transparent to white (for saturation)
            const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
            whiteGradient.addColorStop(0, 'rgba(255,255,255,0)'); // Transparent white (internal left)
            whiteGradient.addColorStop(1, 'white'); // Opaque white (internal right)
            ctx.fillStyle = whiteGradient;
            ctx.fillRect(0, 0, width, height);

            // Overlay a gradient from transparent to black (for value/brightness)
            const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
            blackGradient.addColorStop(0, 'rgba(0,0,0,0)'); // Transparent black (top)
            blackGradient.addColorStop(1, 'black'); // Opaque black (bottom)
            ctx.fillStyle = blackGradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Function to convert RGB to Hex
        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        }

        // Function to convert RGB to CMYK
        function rgbToCmyk(r, g, b) {
            let R = r / 255;
            let G = g / 255;
            let B = b / 255;

            let K = 1 - Math.max(R, G, B);
            let C = (1 - R - K) / (1 - K);
            let M = (1 - G - K) / (1 - K);
            let Y = (1 - B - K) / (1 - K);

            if (K === 1) {
                C = 0;
                M = 0;
                Y = 0;
            }

            return {
                c: Math.round(C * 100),
                m: Math.round(M * 100),
                y: Math.round(Y * 100),
                k: Math.round(K * 100)
            };
        }

        // Function to update color information (Hex, RGB, CMYK, HSV, HSL)
        function updateColorInfo() {
            // Convert current HSV (Hue, currentSaturationHSV, currentValue) to RGB first
            const rgb = hsvToRgb(currentHue, currentSaturationHSV * 100, currentValue * 100);

            // derive all other formats from this RGB
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b); // Get HSL from the calculated RGB

            hexValueElement.textContent = hex;
            hexValueElement.dataset.value = hex;

            rgbValueElement.textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
            rgbValueElement.dataset.value = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

            cmykValueElement.textContent = `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`;
            cmykValueElement.dataset.value = `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`;

            // HSV values are directly from our internal model, H is rounded for display
            hsvValueElement.textContent = `${Math.round(currentHue)}, ${Math.round(currentSaturationHSV * 100)}%, ${Math.round(currentValue * 100)}%`;
            hsvValueElement.dataset.value = `${Math.round(currentHue)}, ${Math.round(currentSaturationHSV * 100)}%, ${Math.round(currentValue * 100)}%`;

            // HSL values are converted from the final RGB, H is rounded by rgbToHsl
            hslValueElement.textContent = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
            hslValueElement.dataset.value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;

            colorSelector.style.backgroundColor = hex;
            finalColorDisplay.style.backgroundColor = hex; // Update the new display
        }

        // --- Hue Slider Interaction (click and dragging) ---
        function handleHueUpdate(clientX) {
            const sliderRect = hueSliderContainer.getBoundingClientRect();
            let x = clientX - sliderRect.left;
            x = Math.max(0, Math.min(x, sliderRect.width));
            const percentage = x / sliderRect.width;
            currentHue = Math.round(percentage * 360); // Round off the H value here
            hueSliderThumb.style.left = `${percentage * 100}%`;
            drawColorCanvas();
            updateColorInfo();
        }

        hueSliderThumb.addEventListener('mousedown', (e) => {
            isDraggingHue = true;
            hueSliderThumb.style.cursor = 'grabbing';
            e.stopPropagation(); // Prevent container's mousedown from firing when thumb is clicked
        });

        hueSliderContainer.addEventListener('mousedown', (e) => {
            // If the click is on the container, start dragging from that point
            if (e.target.id === 'hueSliderContainer') {
                isDraggingHue = true; // Set dragging flag
                hueSliderThumb.style.cursor = 'grabbing'; // Change cursor
                handleHueUpdate(e.clientX); // update thumb position and color
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDraggingHue) {
                handleHueUpdate(e.clientX);
            } else if (isDraggingColor) {
                const rect = colorCanvas.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;

                x = Math.max(0, Math.min(x, rect.width));
                y = Math.max(0, Math.min(y, rect.height));

                currentSaturationHSV = x / rect.width;
                currentValue = 1 - (y / rect.height);

                colorSelector.style.left = `${x}px`;
                colorSelector.style.top = `${y}px`;

                updateColorInfo();
            }
        });

        document.addEventListener('mouseup', () => {
            isDraggingHue = false;
            isDraggingColor = false;
            hueSliderThumb.style.cursor = 'grab';
        });

        // --- Color Canvas Interaction ---
        colorCanvas.addEventListener('mousedown', (e) => {
            isDraggingColor = true;
            colorSelector.classList.remove('hidden');
            const rect = colorCanvas.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            x = Math.max(0, Math.min(x, rect.width));
            y = Math.max(0, Math.min(y, rect.height));

            currentSaturationHSV = x / rect.width;
            currentValue = 1 - (y / rect.height);

            colorSelector.style.left = `${x}px`;
            colorSelector.style.top = `${y}px`;

            updateColorInfo();
        });

        // --- Touch event handling for both hue slider and color canvas ---
        hueSliderThumb.addEventListener('touchstart', (e) => {
            isDraggingHue = true;
            hueSliderThumb.style.cursor = 'grabbing';
            e.stopPropagation(); // Prevent container's touchstart from firing when thumb is touched
            e.preventDefault(); // Prevent scrolling
        }, { passive: false });

        hueSliderContainer.addEventListener('touchstart', (e) => {
             // If the touch is on the container (not the thumb), start dragging from that point
             if (e.target.id === 'hueSliderContainer') {
                isDraggingHue = true; // Set dragging flag
                hueSliderThumb.style.cursor = 'grabbing'; // Change cursor
                const touch = e.touches[0];
                handleHueUpdate(touch.clientX); // Immediately update thumb position and color
            }
            e.preventDefault(); // Prevent scrolling for the whole container during touch
        }, { passive: false });


        colorCanvas.addEventListener('touchstart', (e) => {
            isDraggingColor = true;
            colorSelector.classList.remove('hidden');
            e.preventDefault();
            const touch = e.touches[0];
            const rect = colorCanvas.getBoundingClientRect();
            let x = touch.clientX - rect.left;
            let y = touch.clientY - rect.top;

            x = Math.max(0, Math.min(x, rect.width));
            y = Math.max(0, Math.min(y, rect.height));

            currentSaturationHSV = x / rect.width;
            currentValue = 1 - (y / rect.height);

            colorSelector.style.left = `${x}px`;
            colorSelector.style.top = `${y}px`;

            updateColorInfo();
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (isDraggingHue) {
                const touch = e.touches[0];
                handleHueUpdate(touch.clientX);
            } else if (isDraggingColor) {
                const touch = e.touches[0];
                const rect = colorCanvas.getBoundingClientRect();
                let x = touch.clientX - rect.left;
                let y = touch.clientY - rect.top;

                x = Math.max(0, Math.min(x, rect.width));
                y = Math.max(0, Math.min(y, rect.height));

                currentSaturationHSV = x / rect.width;
                currentValue = 1 - (y / rect.height);

                colorSelector.style.left = `${x}px`;
                colorSelector.style.top = `${y}px`;

                updateColorInfo();
            }
        });

        document.addEventListener('touchend', () => {
            isDraggingHue = false;
            isDraggingColor = false;
            hueSliderThumb.style.cursor = 'grab';
        });

        // Function to handle copy action and show tooltip
        function copyValueToClipboard(value, targetElement) {
            const tempInput = document.createElement('textarea');
            tempInput.value = value;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);

            // Show tooltip
            tooltip.textContent = `Copied "${value}"!`;
            tooltip.classList.add('show');
            const rect = targetElement.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            setTimeout(() => {
                tooltip.classList.remove('show');
            }, 1500);
        }

        // Copy functionality for all color value fields (clicking the text itself)
        document.querySelectorAll('.color-info-value').forEach(item => {
            item.addEventListener('click', (e) => {
                const valueToCopy = e.target.dataset.value || e.target.textContent;
                copyValueToClipboard(valueToCopy, e.target);
            });
        });

        // Copy functionality for the Hex copy icon
        copyHexIcon.addEventListener('click', () => {
            const hexValue = hexValueElement.dataset.value || hexValueElement.textContent;
            copyValueToClipboard(hexValue, copyHexIcon);
        });

        // --- Image Upload & Color Picking Functions ---

        // Prevent default drag behaviors
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drag area
        function highlight(e) {
            imageUploadArea.classList.add('drag-over');
        }

        // Unhighlight drag area
        function unhighlight(e) {
            imageUploadArea.classList.remove('drag-over');
        }

        // Handle dropped files
        function handleDrop(e) {
            unhighlight(e);
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }

        // Handle files from input or drop
        function handleFiles(files) {
            if (files.length === 0) return;
            const file = files[0];
            if (!file.type.startsWith('image/')) {
                console.error("Only image files are supported.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage.src = event.target.result;
                uploadedImage.onload = () => {
                    // Draw image on hidden canvas for pixel data access
                    imagePickCanvas.width = uploadedImage.naturalWidth;
                    imagePickCanvas.height = uploadedImage.naturalHeight;
                    imagePickCtx.drawImage(uploadedImage, 0, 0, imagePickCanvas.width, imagePickCanvas.height);

                    imageUploadArea.style.display = 'none'; // Hide upload area
                    uploadedImageContainer.style.display = 'block'; // Show image container
                    clearImageButton.style.display = 'block'; // Show clear image button
                    // Set cursor for direct picking
                    uploadedImageContainer.style.cursor = 'crosshair';
                };
            };
            reader.readAsDataURL(file);
        }

        // Handle click on Browse Image button
        browseImageButton.addEventListener('click', () => {
            imageUploadInput.click();
        });

        // Handle file input change
        imageUploadInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });

        // Add event listeners for drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            imageUploadArea.addEventListener(eventName, preventDefaults, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => {
            imageUploadArea.addEventListener(eventName, highlight, false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            imageUploadArea.addEventListener(eventName, unhighlight, false);
        });
        imageUploadArea.addEventListener('drop', handleDrop, false);

        // Function to update only the hover feedback (pointer color and zoom preview)
        function updateImageHoverFeedback(clientX, clientY) {
            if (uploadedImageContainer.style.display === 'none') return;

            const rect = uploadedImageContainer.getBoundingClientRect();
            // Calculate coordinates relative to the original image dimensions, not the displayed size
            const scaleX = uploadedImage.naturalWidth / uploadedImage.offsetWidth;
            const scaleY = uploadedImage.naturalHeight / uploadedImage.offsetHeight;

            let xOnImage = Math.round((clientX - rect.left) * scaleX);
            let yOnImage = Math.round((clientY - rect.top) * scaleY);

            // Clamp coordinates to image dimensions for getImageData
            xOnImage = Math.max(0, Math.min(xOnImage, uploadedImage.naturalWidth - 1));
            yOnImage = Math.max(0, Math.min(yOnImage, uploadedImage.naturalHeight - 1));

            // Get pixel data from the hidden canvas
            const pixel = imagePickCtx.getImageData(xOnImage, yOnImage, 1, 1).data;
            const r = pixel[0];
            const g = pixel[1];
            const b = pixel[2];

            // Position the pick pointer on the image (relative to displayed image container)
            imageColorPickPointer.style.left = `${clientX - rect.left}px`;
            imageColorPickPointer.style.top = `${clientY - rect.top}px`;
            imageColorPickPointer.style.backgroundColor = `rgb(${r},${g},${b})`;
            imageColorPickPointer.style.display = 'block'; // Ensure pointer is visible

            // --- Zoom Preview Logic ---
            const sourceRectSize = 10; // Number of pixels from the original image to display in zoom canvas (e.g., 10x10 area)
            const previewCanvasSize = 100; // Fixed size of the zoom preview canvas (e.g., 100px)

            // Calculate the source rectangle from imagePickCanvas, centered around the pixel
            const sx = Math.max(0, xOnImage - Math.floor(sourceRectSize / 2));
            const sy = Math.max(0, yOnImage - Math.floor(sourceRectSize / 2));
            const sw = sourceRectSize;
            const sh = sourceRectSize;

            // Clear zoom canvas before drawing
            zoomCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
            zoomCanvas.width = previewCanvasSize;
            zoomCanvas.height = previewCanvasSize;

            // Draw the zoomed-in section
            // Ensure sx, sy, sw, sh are valid within the original image bounds
            const finalSx = Math.max(0, Math.min(sx, uploadedImage.naturalWidth - sw));
            const finalSy = Math.max(0, Math.min(sy, uploadedImage.naturalHeight - sh));
            const finalSw = Math.min(sw, uploadedImage.naturalWidth - finalSx);
            const finalSh = Math.min(sh, uploadedImage.naturalHeight - finalSy);

            if (finalSw > 0 && finalSh > 0) {
                 zoomCtx.drawImage(
                    imagePickCanvas, // Source canvas
                    finalSx, finalSy, finalSw, finalSh, // Source x, y, width, height
                    0, 0, previewCanvasSize, previewCanvasSize // Destination x, y, width, height on zoomCanvas
                );
            }

            // Position the zoom preview next to the cursor
            imageZoomPreview.style.left = `${clientX + 20}px`; // 20px offset to the right
            imageZoomPreview.style.top = `${clientY - imageZoomPreview.offsetHeight / 2}px`; // Vertically center on cursor
            imageZoomPreview.style.display = 'block'; // Show the zoom preview
        }

        // Function to apply the picked color to the main color picker UI
        function applyPickedColorToMainPicker(r, g, b) {
            // Convert RGB to HSV
            const hsv = rgbToHsv(r, g, b);

            // Update global color variables
            currentHue = hsv.h;
            currentSaturationHSV = hsv.s / 100; // Convert back to 0-1 range
            currentValue = hsv.v / 100; // Convert back to 0-1 range

            // Update main color picker UI
            drawColorCanvas();
            updateColorInfo();

            // Position the color selector on the main color canvas based on new HSV values
            const mainCanvasWidth = colorCanvas.offsetWidth;
            const mainCanvasHeight = colorCanvas.offsetHeight;
            colorSelector.style.left = `${currentSaturationHSV * mainCanvasWidth}px`;
            colorSelector.style.top = `${(1 - currentValue) * mainCanvasHeight}px`;
            colorSelector.classList.remove('hidden');

            // Also update the hue slider thumb
            hueSliderThumb.style.left = `${(currentHue / 360) * 100}%`;
        }


        uploadedImageContainer.addEventListener('mousemove', (e) => {
            updateImageHoverFeedback(e.clientX, e.clientY);
        });

        uploadedImageContainer.addEventListener('mouseleave', () => {
            imageColorPickPointer.style.display = 'none';
            imageZoomPreview.style.display = 'none'; // Hide zoom preview on mouse leave
        });

        uploadedImageContainer.addEventListener('click', (e) => {
            if (uploadedImageContainer.style.display === 'none') return;
            const rect = uploadedImageContainer.getBoundingClientRect();
            const scaleX = uploadedImage.naturalWidth / uploadedImage.offsetWidth;
            const scaleY = uploadedImage.naturalHeight / uploadedImage.offsetHeight;
            const x = Math.round((e.clientX - rect.left) * scaleX);
            const y = Math.round((e.clientY - rect.top) * scaleY);

            // Clamp coordinates to image dimensions
            const clampedX = Math.max(0, Math.min(x, uploadedImage.naturalWidth - 1));
            const clampedY = Math.max(0, Math.min(y, uploadedImage.naturalHeight - 1));

            const pixel = imagePickCtx.getImageData(clampedX, clampedY, 1, 1).data;
            applyPickedColorToMainPicker(pixel[0], pixel[1], pixel[2]);
        });


        uploadedImageContainer.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            updateImageHoverFeedback(touch.clientX, touch.clientY);
        }, { passive: false });

        uploadedImageContainer.addEventListener('touchend', (e) => {
            // Need to get the last touch position for the click
            // For touchend, e.changedTouches[0] will have the final position
            if (uploadedImageContainer.style.display === 'none' || !e.changedTouches || e.changedTouches.length === 0) return;
            const touch = e.changedTouches[0];
            const rect = uploadedImageContainer.getBoundingClientRect();
            const scaleX = uploadedImage.naturalWidth / uploadedImage.offsetWidth;
            const scaleY = uploadedImage.naturalHeight / uploadedImage.offsetHeight;
            const x = Math.round((touch.clientX - rect.left) * scaleX);
            const y = Math.round((touch.clientY - rect.top) * scaleY);

            // Clamp coordinates to image dimensions
            const clampedX = Math.max(0, Math.min(x, uploadedImage.naturalWidth - 1));
            const clampedY = Math.max(0, Math.min(y, uploadedImage.naturalHeight - 1));

            const pixel = imagePickCtx.getImageData(clampedX, clampedY, 1, 1).data;
            applyPickedColorToMainPicker(pixel[0], pixel[1], pixel[2]);

            // Hide hover feedback after touch (as touchend is like a click)
            imageColorPickPointer.style.display = 'none';
            imageZoomPreview.style.display = 'none';
        });


        // Clear Image button functionality
        clearImageButton.addEventListener('click', () => {
            uploadedImage.src = '#'; // Clear image source
            imageUploadInput.value = ''; // Crucial: Reset file input value to allow re-uploading the same file
            imagePickCtx.clearRect(0, 0, imagePickCanvas.width, imagePickCanvas.height); // Clear hidden canvas
            uploadedImageContainer.style.display = 'none'; // Hide image container
            clearImageButton.style.display = 'none'; // Hide clear image button
            imageUploadArea.style.display = 'flex'; // Show upload area
            imageColorPickPointer.style.display = 'none'; // Hide pointer
            imageZoomPreview.style.display = 'none'; // Hide zoom preview
            uploadedImageContainer.style.cursor = 'default'; // Reset cursor
        });


        // Initialize the color picker
        function initializeColorPicker() {
            // Initial color approximation for #E89623 in HSV: H=30, S=85%, V=91%
            const initialHue = 30;
            const initialSaturationHSV = 0.85; // S value from 0-1
            const initialValue = 0.91; // V value from 0-1

            currentHue = initialHue;
            currentSaturationHSV = initialSaturationHSV;
            currentValue = initialValue;

            drawColorCanvas();
            updateColorInfo();

            const width = colorCanvas.offsetWidth;
            const height = colorCanvas.offsetHeight;

            // Position selector based on HSV values
            const selectorX = currentSaturationHSV * width;
            const selectorY = (1 - currentValue) * height; // Y for value: 0 at top, 1 at bottom

            hueSliderThumb.style.left = `${(currentHue / 360) * 100}%`;
            colorSelector.style.left = `${selectorX}px`;
            colorSelector.style.top = `${selectorY}px`;
            colorSelector.classList.remove('hidden');

            drawColorCanvas();
            updateColorInfo();
        }

        // Adjust canvas size and redraw on window resize
        window.addEventListener('resize', () => {
            drawColorCanvas();
            const width = colorCanvas.offsetWidth;
            const height = colorCanvas.offsetHeight;
            // Re-position selector based on new canvas size and current HSV values
            colorSelector.style.left = `${currentSaturationHSV * width}px`;
            colorSelector.style.top = `${(1 - currentValue) * height}px`;
            generatePixelPattern('pixel-pattern-left');
            generatePixelPattern('pixel-pattern-right');
        });

        // Generate pixel art pattern for background
        function generatePixelPattern(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const pixelSize = 20;
            const containerHeight = 200;
            const numRows = Math.ceil(containerHeight / pixelSize);
            const containerWidth = window.innerWidth;
            const numCols = Math.ceil(containerWidth / pixelSize) + 5;

            container.innerHTML = '';

            const pattern = [
                [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
                [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
                [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
                [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
                [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
            ];

            for (let r = 0; r < numRows; r++) {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'pixel-row';
                for (let c = 0; c < numCols; c++) {
                    const pixelDiv = document.createElement('div');
                    pixelDiv.className = 'pixel';
                    const patternRow = pattern[r % pattern.length];
                    const patternCol = patternRow[c % patternRow.length];
                    if (patternCol === 1) {
                        pixelDiv.classList.add('pixel-dark');
                    }
                    rowDiv.appendChild(pixelDiv);
                }
                container.appendChild(rowDiv);
            }
        }

        // --- Dark/Light Mode Toggle ---
        function toggleTheme() {
            const currentTheme = document.body.dataset.theme;
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.dataset.theme = newTheme;
            localStorage.setItem('theme', newTheme);
            updateThemeSwitchIcon(newTheme);
            // Regenerate pixel patterns to apply new colors
            generatePixelPattern('pixel-pattern-left');
            generatePixelPattern('pixel-pattern-right');
        }

        function applySavedTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
            document.body.dataset.theme = savedTheme;
            updateThemeSwitchIcon(savedTheme);
            // Generate pixel patterns on initial load with the correct theme colors
            generatePixelPattern('pixel-pattern-left');
            generatePixelPattern('pixel-pattern-right');
        }

        function updateThemeSwitchIcon(theme) {
            if (theme === 'dark') {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        }

        // Initialize pixel patterns and color picker on load
        window.addEventListener('load', () => {
            initializeColorPicker();
            applySavedTheme(); // Apply saved theme and generate pixel patterns on load
        });

        themeSwitchButton.addEventListener('click', toggleTheme);


        // Disable right-click context menu on the entire page
        // This prevents users from right-clicking to save images or inspect elements easily.
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault(); // Prevent the default right-click behavior
        });