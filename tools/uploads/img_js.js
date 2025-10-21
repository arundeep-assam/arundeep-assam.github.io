// Get references to DOM elements
        const imageInput = document.getElementById('imageInput');
        const imageCanvas = document.getElementById('imageCanvas');
        const ctx = imageCanvas.getContext('2d');
        const cropBtn = document.getElementById('cropBtn');
        const resetCropBtn = document.getElementById('resetCropBtn');
        const clearImageBtn = document.getElementById('clearImageBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const croppedImage = document.getElementById('croppedImage');
        const croppedImageContainer = document.getElementById('croppedImageContainer');
        const imageCanvasContainer = document.getElementById('imageCanvasContainer'); // New container for canvas
        const messageBox = document.getElementById('messageBox');
        const dropZone = document.getElementById('dropZone');
        const ratioButtons = document.querySelectorAll('.ratio-btn');
        const toggleCropControlsBtn = document.getElementById('toggleCropControlsBtn');
        const togglePopularFiltersBtn = document.getElementById('togglePopularFiltersBtn'); // Get reference to the button
        const toggleAdjustControlsBtn = document.getElementById('toggleAdjustControlsBtn'); // Get reference to the button


        const brightnessSlider = document.getElementById('brightness');
        const contrastSlider = document.getElementById('contrast');
        const saturationSlider = document.getElementById('saturation');
        const grayscaleSlider = document.getElementById('grayscale');
        const sepiaSlider = document.getElementById('sepia');
        const brightnessValueSpan = document.getElementById('brightnessValue');
        const contrastValueSpan = document.getElementById('contrastValue');
        const saturationValueSpan = document.getElementById('saturationValue');
        const grayscaleValueSpan = document.getElementById('grayscaleValue');
        const sepiaValueSpan = document.getElementById('sepiaValue');
        const resetAdjustmentsBtn = document.getElementById('resetAdjustmentsBtn');

        const popularFiltersPopup = document.getElementById('popularFiltersPopup');
        const popularFiltersPopupHeader = popularFiltersPopup.querySelector('.popup-header');
        const closePopularFiltersPopupBtn = document.getElementById('closePopularFiltersPopupBtn');
        const filterButtonsContainer = document.getElementById('filterButtonsContainer');
        const resetPopularFiltersBtn = document.getElementById('resetPopularFiltersBtn');

        // Preview button and comparison popup related elements
        const previewBtn = document.getElementById('previewBtn');
        const imageComparisonPopup = document.getElementById('imageComparisonPopup');
        const imageComparisonPopupHeader = imageComparisonPopup.querySelector('.popup-header');
        const closeComparisonPopupBtn = document.getElementById('closeComparisonPopupBtn');
        const beforeImageDiv = document.getElementById('beforeImageDiv'); // Changed to div
        const afterImageDiv = document.getElementById('afterImageDiv');   // Changed to div
        const comparisonHandle = document.getElementById('comparisonHandle');
        const comparisonImagesContainer = document.querySelector('.comparison-images-container');

        const cropControlsPopup = document.getElementById('cropControlsPopup');
        const cropPopupHeader = cropControlsPopup.querySelector('.popup-header');
        const closeCropPopupBtn = document.getElementById('closeCropPopupBtn');

        const adjustControlsPopup = document.getElementById('adjustControlsPopup');
        const adjustPopupHeader = adjustControlsPopup.querySelector('.popup-header');
        const closeAdjustPopupBtn = document.getElementById('closeAdjustPopupBtn');

        // Theme toggle elements
        const themeToggle = document.getElementById('themeToggle');
        const htmlElement = document.documentElement;

        // Loading indicator element
        const loadingOverlay = document.getElementById('loadingOverlay');

        // New elements for info popup and modal overlay
        const infoButton = document.getElementById('infoButton');
        const infoPopup = document.getElementById('infoPopup');
        const closeInfoPopupBtn = document.getElementById('closeInfoPopupBtn');
        const modalOverlay = document.getElementById('modalOverlay');


        let originalImage = null;
        let isDrawing = false;
        let isMoving = false;
        let isResizing = false;
        let activeHandle = null;

        let startX, startY;
        let cropWidth, cropHeight;

        let initialMouseX, initialMouseY;
        let initialCropX, initialCropY, initialCropW, initialCropH;

        let scaleFactor = 1;
        let currentRatio = null;
        const HANDLE_SIZE = 10;

        // --- Constants for Filter Ranges ---
        const MIN_BRIGHTNESS = 0;
        const MAX_BRIGHTNESS = 200;
        const DEFAULT_BRIGHTNESS = 100;

        const MIN_CONTRAST = 0;
        const MAX_CONTRAST = 200;
        const DEFAULT_CONTRAST = 100;

        const MIN_SATURATION = 0;
        const MAX_SATURATION = 200;
        const DEFAULT_SATURATION = 100;

        const MIN_GRAYSCALE = 0;
        const MAX_GRAYSCALE = 100;
        const DEFAULT_GRAYSCALE = 0;

        const MIN_SEPIA = 0;
        const MAX_SEPIA = 100;
        const DEFAULT_SEPIA = 0;

        // Current filter values applied to the image
        const filters = {
            brightness: DEFAULT_BRIGHTNESS,
            contrast: DEFAULT_CONTRAST,
            saturation: DEFAULT_SATURATION,
            grayscale: DEFAULT_GRAYSCALE,
            sepia: DEFAULT_SEPIA
        };

        // Predesigned popular filters
        const popularFilterPresets = [
            { name: "None", brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0 },
            { name: "Vintage", brightness: 120, contrast: 110, saturation: 80, grayscale: 0, sepia: 50 },
            { name: "Black & White", brightness: 100, contrast: 120, saturation: 0, grayscale: 100, sepia: 0 },
            { name: "Warm", brightness: 105, contrast: 105, saturation: 115, grayscale: 0, sepia: 0 },
            { name: "Cool", brightness: 95, contrast: 105, saturation: 110, grayscale: 0, sepia: 0 },
            { name: "Sepia Tone", brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 80 },
            { name: "High Contrast", brightness: 100, contrast: 150, saturation: 100, grayscale: 0, sepia: 0 },
            { name: "Soft Light", brightness: 110, contrast: 90, saturation: 100, grayscale: 0, sepia: 0 }
        ];

        let isDraggingPopup = false;
        let activePopup = null;
        let popupOffsetX, popupOffsetY;

        let isDraggingComparison = false; // New state for comparison slider drag

        // --- Loading Indicator Functions ---
        function showLoadingIndicator() {
            loadingOverlay.classList.add('show');
        }

        function hideLoadingIndicator() {
            // Add a small delay to ensure the spinner is visible
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
            }, 300); // 300ms delay
        }

        function showMessage(message, type = 'info') {
            messageBox.textContent = message;
            messageBox.setAttribute('data-type', type);
            messageBox.style.display = 'block';
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 5000);
        }

        function clearCanvas() {
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary');
            ctx.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
        }

        // Function to draw the crop rectangle and its handles
        function drawCropRectangle() {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dashed line
            ctx.strokeRect(startX, startY, cropWidth, cropHeight);
            ctx.setLineDash([]); // Solid line for handles

            // Draw handles
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;

            // Top-left
            ctx.fillRect(startX - HANDLE_SIZE / 2, startY - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
            ctx.strokeRect(startX - HANDLE_SIZE / 2, startY - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);

            // Top-right
            ctx.fillRect(startX + cropWidth - HANDLE_SIZE / 2, startY - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
            ctx.strokeRect(startX + cropWidth - HANDLE_SIZE / 2, startY - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);

            // Bottom-left
            ctx.fillRect(startX - HANDLE_SIZE / 2, startY + cropHeight - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
            ctx.strokeRect(startX - HANDLE_SIZE / 2, startY + cropHeight - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);

            // Bottom-right
            ctx.fillRect(startX + cropWidth - HANDLE_SIZE / 2, startY + cropHeight - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
            ctx.strokeRect(startX + cropWidth - HANDLE_SIZE / 2, startY + cropHeight - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
        }

        function drawImage() {
            if (!originalImage) {
                clearCanvas();
                return;
            }

            const aspectRatio = originalImage.width / originalImage.height;
            // Use parent container's width to determine canvas width for responsiveness
            const parentWidth = imageCanvasContainer.clientWidth; // Use the new container's width
            let canvasWidth = parentWidth;
            let canvasHeight = parentWidth / aspectRatio; // Calculate height based on aspect ratio

            // Adjust if height exceeds viewport or max-height constraints
            // This ensures the image doesn't become excessively tall on very wide screens
            if (canvasHeight > window.innerHeight * 0.7) {
                canvasHeight = window.innerHeight * 0.7;
                canvasWidth = canvasHeight * aspectRatio;
            }

            imageCanvas.width = canvasWidth;
            imageCanvas.height = canvasHeight;

            // The croppedImage will now size naturally based on its content, constrained by max-width: 100% and height: auto in CSS

            scaleFactor = originalImage.width / imageCanvas.width;

            clearCanvas();
            ctx.drawImage(originalImage, 0, 0, imageCanvas.width, imageCanvas.height);

            if (cropWidth > 0 && cropHeight > 0) {
                drawCropRectangle();
            }
        }

        function getHandleAtPoint(x, y) {
            const handles = {
                'tl': { x: startX, y: startY },
                'tr': { x: startX + cropWidth, y: startY },
                'bl': { x: startX, y: startY + cropHeight },
                'br': { x: startX + cropWidth, y: startY + cropHeight }
            };

            for (const handleId in handles) {
                const handleX = handles[handleId].x;
                const handleY = handles[handleId].y;
                if (x >= handleX - HANDLE_SIZE / 2 && x <= handleX + HANDLE_SIZE / 2 &&
                    y >= handleY - HANDLE_SIZE / 2 && y <= handleY + HANDLE_SIZE / 2) {
                    return handleId;
                }
            }
            return null;
        }

        function isInsideCrop(x, y) {
            return x > startX && x < startX + cropWidth &&
                   y > startY && y < startY + cropHeight;
        }

        function updateCursor(e) {
            if (!originalImage) {
                imageCanvas.style.cursor = 'crosshair';
                return;
            }

            const rect = imageCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const handle = getHandleAtPoint(mouseX, mouseY);
            if (handle) {
                switch (handle) {
                    case 'tl':
                    case 'br':
                        imageCanvas.style.cursor = 'nwse-resize';
                        break;
                    case 'tr':
                    case 'bl':
                        imageCanvas.style.cursor = 'nesw-resize';
                        break;
                }
            } else if (isInsideCrop(mouseX, mouseY)) {
                imageCanvas.style.cursor = 'move';
            } else {
                imageCanvas.style.cursor = 'crosshair';
            }
        }

        function resetCropState() {
            showLoadingIndicator(); // Show loading indicator
            setTimeout(() => {
                isDrawing = false;
                isMoving = false;
                isResizing = false;
                activeHandle = null;
                startX = 0;
                startY = 0;
                cropWidth = 0;
                cropHeight = 0;
                downloadBtn.style.display = 'none'; // Hide download button
                previewBtn.style.display = 'none'; // Hide preview button
                croppedImageContainer.style.display = 'none'; // Hide the container initially

                if (originalImage) {
                    drawImage(); // Redraw canvas with original image and no crop rectangle

                    // After resetting crop, if filters are active, apply them to the full original image
                    // and update the croppedImage source for consistency (even if container is hidden)
                    // This ensures the correct "edited" state is maintained for download/preview
                    const isFilteredOrAdjusted = (
                        filters.brightness !== DEFAULT_BRIGHTNESS ||
                        filters.contrast !== DEFAULT_CONTRAST ||
                        filters.saturation !== DEFAULT_SATURATION ||
                        filters.grayscale !== DEFAULT_GRAYSCALE ||
                        filters.sepia !== DEFAULT_SEPIA
                    );

                    if (isFilteredOrAdjusted) {
                        croppedImage.src = getFilteredImageDataURL(originalImage, false); // Apply filters to full original
                        croppedImageContainer.style.display = 'flex'; // Show it again if filters are active
                        downloadBtn.style.display = 'block'; // Enable download if filters are active
                        previewBtn.style.display = 'block'; // Show preview button if filters are active
                    } else {
                        // If no filters/adjustments, ensure croppedImage is cleared/hidden
                        croppedImage.src = '';
                        croppedImageContainer.style.display = 'none';
                        downloadBtn.style.display = 'none';
                        previewBtn.style.display = 'none';
                    }
                    showMessage('Crop selection reset. Drag to select a new area or choose a ratio.', 'info');

                } else {
                    showMessage('No image loaded to reset crop.', 'info');
                }
                updatePreviewButtonVisibility(); // Update visibility after reset
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for reset
        }

        function clearImage() {
            showLoadingIndicator(); // Show loading indicator immediately

            originalImage = null; // Clear the image data
            imageInput.value = ''; // Reset the file input

            clearCanvas(); // Explicitly clear the canvas immediately

            // Reset other states related to cropping and output image
            isDrawing = false;
            isMoving = false;
            isResizing = false;
            activeHandle = null;
            startX = 0;
            startY = 0;
            cropWidth = 0;
            cropHeight = 0;

            croppedImage.src = ''; // Clear the cropped image display
            croppedImageContainer.style.display = 'none'; // Hide the cropped image container
            downloadBtn.style.display = 'none'; // Hide download button
            previewBtn.style.display = 'none'; // Hide preview button
            clearImageBtn.style.display = 'none'; // Hide clear image button itself
            imageCanvasContainer.style.display = 'none'; // Hide the uploaded image container

            // Hide the control buttons when image is cleared
            toggleCropControlsBtn.style.display = 'none';
            togglePopularFiltersBtn.style.display = 'none';
            toggleAdjustControlsBtn.style.display = 'none';


            // Reset filter values to default and update UI, but don't re-apply to a non-existent image
            filters.brightness = DEFAULT_BRIGHTNESS;
            filters.contrast = DEFAULT_CONTRAST;
            filters.saturation = DEFAULT_SATURATION;
            filters.grayscale = DEFAULT_GRAYSCALE;
            filters.sepia = DEFAULT_SEPIA;

            brightnessSlider.value = DEFAULT_BRIGHTNESS;
            contrastSlider.value = DEFAULT_CONTRAST;
            saturationSlider.value = DEFAULT_SATURATION;
            grayscaleSlider.value = DEFAULT_GRAYSCALE;
            sepiaSlider.value = DEFAULT_SEPIA;

            brightnessValueSpan.textContent = `${DEFAULT_BRIGHTNESS}%`;
            contrastValueSpan.textContent = `${DEFAULT_CONTRAST}%`;
            saturationValueSpan.textContent = `${DEFAULT_SATURATION}%`;
            grayscaleValueSpan.textContent = `${DEFAULT_GRAYSCALE}%`;
            sepiaValueSpan.textContent = `${DEFAULT_SEPIA}%`;

            showMessage('Image cleared. Please choose a new image.', 'info');
            updatePreviewButtonVisibility(); // Update visibility after clear

            hideLoadingIndicator(); // Hide loading indicator after a small delay
        }

        /**
         * Generates a data URL for an image with current filters applied.
         * If a crop is active, filters are applied to the cropped portion.
         * If no crop is active, filters are applied to the entire original image.
         * @param {HTMLImageElement} imageSource The original image element.
         * @param {boolean} applyCurrentCrop Whether to apply the current crop settings before filtering.
         * Defaults to true. Set to false to get the original image with filters.
         */
        function getFilteredImageDataURL(imageSource, applyCurrentCrop = true) {
            if (!imageSource) return '';

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = imageSource.naturalWidth || imageSource.width;
            let sourceHeight = imageSource.naturalHeight || imageSource.height;

            const isCropped = (cropWidth > 0 && cropHeight > 0);

            if (applyCurrentCrop && isCropped) {
                // If a crop is active and we want to apply it
                sourceX = startX * scaleFactor;
                sourceY = startY * scaleFactor;
                sourceWidth = cropWidth * scaleFactor;
                sourceHeight = cropHeight * scaleFactor;
            }

            tempCanvas.width = sourceWidth;
            tempCanvas.height = sourceHeight;

            tempCtx.filter = `
                brightness(${filters.brightness}%)
                contrast(${filters.contrast}%)
                saturate(${filters.saturation}%)
                grayscale(${filters.grayscale}%)
                sepia(${filters.sepia}%)
            `;

            tempCtx.drawImage(
                imageSource,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0, // Destination X
                0, // Destination Y
                sourceWidth, // Destination Width
                sourceHeight // Destination Height
            );
            tempCtx.filter = 'none'; // Reset filter for next draw

            return tempCanvas.toDataURL('image/png');
        }

        function loadImageFile(file) {
            showLoadingIndicator(); // Show loading indicator
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    originalImage = new Image();
                    originalImage.onload = () => {
                        setTimeout(() => { // Add delay here for image processing
                            drawImage();
                            resetCropState(); // This will call updatePreviewButtonVisibility
                            // Do NOT reset adjustments here. They should persist.
                            // Instead, apply existing adjustments to the newly loaded image.
                            if (
                                filters.brightness !== DEFAULT_BRIGHTNESS ||
                                filters.contrast !== DEFAULT_CONTRAST ||
                                filters.saturation !== DEFAULT_SATURATION ||
                                filters.grayscale !== DEFAULT_GRAYSCALE ||
                                filters.sepia !== DEFAULT_SEPIA
                            ) {
                                croppedImage.src = getFilteredImageDataURL(originalImage, false); // Apply filters to full original
                                croppedImageContainer.style.display = 'flex';
                                downloadBtn.style.display = 'block'; // Show download button if filters are active
                            } else {
                                 croppedImage.src = ''; // Clear if no filters
                                 croppedImageContainer.style.display = 'none';
                                 downloadBtn.style.display = 'none'; // Hide download button if no filters
                            }

                            showMessage('Image loaded. Drag on the image to select a crop area.', 'success');
                            clearImageBtn.style.display = 'block';
                            imageCanvasContainer.style.display = 'flex'; // Show the uploaded image container

                            // Show the control buttons when image is loaded
                            toggleCropControlsBtn.style.display = 'block';
                            togglePopularFiltersBtn.style.display = 'block';
                            toggleAdjustControlsBtn.style.display = 'block';

                            updatePreviewButtonVisibility(); // Ensure button visibility is correct after load
                            hideLoadingIndicator(); // Hide loading indicator
                        }, 100); // Small delay after image load
                    };
                    reader.onerror = () => {
                        showMessage('Failed to read image file. It might be corrupted or unreadable.', 'error');
                        originalImage = null;
                        clearCanvas();
                        croppedImageContainer.style.display = 'none';
                        imageCanvasContainer.style.display = 'none'; // Hide on error
                        updatePreviewButtonVisibility(); // Update visibility on error
                        clearImageBtn.style.display = 'none';
                        downloadBtn.style.display = 'none'; // Hide download button on error
                        previewBtn.style.display = 'none'; // Hide preview button on error
                        // Hide the control buttons on error
                        toggleCropControlsBtn.style.display = 'none';
                        togglePopularFiltersBtn.style.display = 'none';
                        toggleAdjustControlsBtn.style.display = 'none';
                        hideLoadingIndicator(); // Hide loading indicator
                    };
                    originalImage.onerror = () => {
                        showMessage('Could not load image. Please try a different file.', 'error');
                        originalImage = null;
                        clearCanvas();
                        croppedImageContainer.style.display = 'none';
                        imageCanvasContainer.style.display = 'none'; // Hide on error
                        updatePreviewButtonVisibility(); // Update visibility on error
                        clearImageBtn.style.display = 'none';
                        downloadBtn.style.display = 'none'; // Hide download button on error
                        previewBtn.style.display = 'none'; // Hide preview button on error
                        // Hide the control buttons on error
                        toggleCropControlsBtn.style.display = 'none';
                        togglePopularFiltersBtn.style.display = 'none';
                        toggleAdjustControlsBtn.style.display = 'none';
                        hideLoadingIndicator(); // Hide loading indicator
                    };
                    originalImage.src = event.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                showMessage('Please drop an image file (e.g., JPG, PNG, GIF).', 'error');
                updatePreviewButtonVisibility(); // Update visibility if file type is wrong
                clearImageBtn.style.display = 'none';
                downloadBtn.style.display = 'none'; // Hide download button if file type is wrong
                previewBtn.style.display = 'none'; // Hide preview button if file type is wrong
                imageCanvasContainer.style.display = 'none'; // Hide if wrong file type
                // Hide the control buttons if file type is wrong
                toggleCropControlsBtn.style.display = 'none';
                togglePopularFiltersBtn.style.display = 'none';
                toggleAdjustControlsBtn.style.display = 'none';
                hideLoadingIndicator(); // Hide loading indicator
            }
        }

        function applyCropRatio(ratio) {
            showLoadingIndicator(); // Show loading indicator
            if (!originalImage) {
                showMessage('Please load an image first to apply a crop ratio.', 'error');
                hideLoadingIndicator(); // Hide loading indicator
                return;
            }
            setTimeout(() => { // Re-added delay here
                const canvasWidth = imageCanvas.width;
                const canvasHeight = imageCanvas.height;

                let newCropWidth = 0;
                let newCropHeight = 0;

                if (ratio === 'original') {
                    newCropWidth = canvasWidth;
                    newCropHeight = canvasHeight;
                    currentRatio = originalImage.width / originalImage.height;
                } else if (ratio === 'free') {
                    currentRatio = null;
                    resetCropState(); // This will call updatePreviewButtonVisibility and hideLoadingIndicator
                    showMessage('Freeform cropping selected. Drag on the image to draw your crop area.', 'info');
                    return; // Exit early as resetCropState handles hiding indicator
                }
                else {
                    const [ratioX, ratioY] = ratio.split(':').map(Number);
                    currentRatio = ratioX / ratioY;

                    const imageRatio = canvasWidth / canvasHeight;
                    const desiredRatio = currentRatio;

                    if (imageRatio > desiredRatio) {
                        newCropHeight = canvasHeight;
                        newCropWidth = newCropHeight * desiredRatio;
                    } else {
                        newCropWidth = canvasWidth;
                        newCropHeight = newCropWidth / desiredRatio;
                    }
                }

                startX = (canvasWidth - newCropWidth) / 2;
                startY = (canvasHeight - newCropHeight) / 2;
                cropWidth = newCropWidth;
                cropHeight = newCropHeight;

                drawImage();

                // When a new crop ratio is set, re-apply filters to the newly defined crop area
                if (originalImage) {
                    croppedImage.src = getFilteredImageDataURL(originalImage, true); // Apply filters to the new crop
                    croppedImageContainer.style.display = 'flex';
                    downloadBtn.style.display = 'block'; // Show download button after crop
                } else {
                    croppedImageContainer.style.display = 'none';
                    downloadBtn.style.display = 'none';
                }

                showMessage(`Crop ratio set to ${ratio}. You can now drag the crop box or its handles. Click "Crop Image" to apply.`, 'success');
                updatePreviewButtonVisibility(); // Update visibility after ratio change
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for applying ratio
        }

        function resetAdjustments() {
            showLoadingIndicator(); // Show loading indicator
            setTimeout(() => { // Re-added delay here
                filters.brightness = DEFAULT_BRIGHTNESS;
                filters.contrast = DEFAULT_CONTRAST;
                filters.saturation = DEFAULT_SATURATION;
                filters.grayscale = DEFAULT_GRAYSCALE;
                filters.sepia = DEFAULT_SEPIA;

                brightnessSlider.value = DEFAULT_BRIGHTNESS;
                contrastSlider.value = DEFAULT_CONTRAST;
                saturationSlider.value = DEFAULT_SATURATION;
                grayscaleSlider.value = DEFAULT_GRAYSCALE;
                sepiaSlider.value = DEFAULT_SEPIA;

                brightnessValueSpan.textContent = `${DEFAULT_BRIGHTNESS}%`;
                contrastValueSpan.textContent = `${DEFAULT_CONTRAST}%`;
                saturationValueSpan.textContent = `${DEFAULT_SATURATION}%`;
                grayscaleValueSpan.textContent = `${DEFAULT_GRAYSCALE}%`;
                sepiaValueSpan.textContent = `${DEFAULT_SEPIA}%`;

                if (originalImage) {
                    // Apply filters to the current state (cropped or uncropped)
                    croppedImage.src = getFilteredImageDataURL(originalImage);
                    // Only show croppedImageContainer if there are active filters/adjustments OR if it's cropped
                    if (
                        filters.brightness !== DEFAULT_BRIGHTNESS ||
                        filters.contrast !== DEFAULT_CONTRAST ||
                        filters.saturation !== DEFAULT_SATURATION ||
                        filters.grayscale !== DEFAULT_GRAYSCALE ||
                        filters.sepia !== DEFAULT_SEPIA ||
                        (cropWidth > 0 && cropHeight > 0)
                    ) {
                        croppedImageContainer.style.display = 'flex';
                        downloadBtn.style.display = 'block';
                    } else {
                        croppedImageContainer.style.display = 'none';
                        downloadBtn.style.display = 'none';
                    }
                } else {
                    croppedImageContainer.style.display = 'none';
                    downloadBtn.style.display = 'none';
                }
                showMessage('Image adjustments reset to default.', 'info');
                updatePreviewButtonVisibility(); // Update visibility after reset
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for reset adjustments
        }

        function applyPopularFilter(filter) {
            showLoadingIndicator(); // Show loading indicator
            if (!originalImage) {
                showMessage('Please load an image first to apply a filter.', 'error');
                hideLoadingIndicator(); // Hide loading indicator
                return;
            }
            setTimeout(() => { // Re-added delay here
                filters.brightness = filter.brightness;
                filters.contrast = filter.contrast;
                filters.saturation = filter.saturation;
                filters.grayscale = filter.grayscale;
                filters.sepia = filter.sepia;

                brightnessSlider.value = filters.brightness;
                contrastSlider.value = filters.contrast;
                saturationSlider.value = filters.saturation;
                grayscaleSlider.value = filters.grayscale;
                sepiaSlider.value = filters.sepia;

                brightnessValueSpan.textContent = `${filters.brightness}%`;
                contrastValueSpan.textContent = `${filters.contrast}%`;
                saturationValueSpan.textContent = `${filters.saturation}%`;
                grayscaleValueSpan.textContent = `${filters.grayscale}%`;
                sepiaValueSpan.textContent = `${filters.sepia}%`;

                // Apply filters to the current state (cropped or uncropped)
                croppedImage.src = getFilteredImageDataURL(originalImage);
                croppedImageContainer.style.display = 'flex';
                downloadBtn.style.display = 'block';
                showMessage(`Applied "${filter.name}" filter.`, 'success');
                updatePreviewButtonVisibility(); // Update visibility after filter applied
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for applying filter
        }

        function createFilterButtons() {
            filterButtonsContainer.innerHTML = '';
            popularFilterPresets.forEach(filter => {
                const button = document.createElement('button');
                button.classList.add('filter-preset-btn');
                button.textContent = filter.name;
                button.addEventListener('click', () => applyPopularFilter(filter));
                filterButtonsContainer.appendChild(button);
            });
        }

        // Function to determine preview button visibility
        function updatePreviewButtonVisibility() {
            if (!originalImage) {
                previewBtn.style.display = 'none';
                return;
            }

            // Check if any filter or adjustment is active
            const isFilteredOrAdjusted = (
                filters.brightness !== DEFAULT_BRIGHTNESS ||
                filters.contrast !== DEFAULT_CONTRAST ||
                filters.saturation !== DEFAULT_SATURATION ||
                filters.grayscale !== DEFAULT_GRAYSCALE ||
                filters.sepia !== DEFAULT_SEPIA
            );

            // Show the preview button if any filter/adjustment is applied
            if (isFilteredOrAdjusted) {
                previewBtn.style.display = 'block';
            } else {
                previewBtn.style.display = 'none';
            }
        }


        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            loadImageFile(file);
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('highlight');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('highlight');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('highlight');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                loadImageFile(files[0]);
            }
        });


        imageCanvas.addEventListener('mousedown', (e) => {
            if (!originalImage) {
                showMessage('Please load an image first.', 'info');
                return;
            }
            e.preventDefault();

            const rect = imageCanvas.getBoundingClientRect();
            initialMouseX = e.clientX - rect.left;
            initialMouseY = e.clientY - rect.top;

            activeHandle = getHandleAtPoint(initialMouseX, initialMouseY);
            if (activeHandle) {
                isResizing = true;
                initialCropX = startX;
                initialCropY = startY;
                initialCropW = cropWidth;
                initialCropH = cropHeight;
                return;
            }

            if (cropWidth > 0 && cropHeight > 0 && isInsideCrop(initialMouseX, initialMouseY)) {
                isMoving = true;
                initialCropX = startX;
                initialCropY = startY;
                return;
            }

            if (currentRatio === null) {
                isDrawing = true;
                startX = initialMouseX;
                startY = initialMouseY;
                cropWidth = 0;
                cropHeight = 0;
            } else {
                showMessage('Please use the handles to adjust the crop area or switch to "Freeform" to draw a new one.', 'info');
            }
        });

        imageCanvas.addEventListener('mousemove', (e) => {
            if (!originalImage) return;

            const rect = imageCanvas.getBoundingClientRect();
            const currentMouseX = e.clientX - rect.left;
            const currentMouseY = e.clientY - rect.top;

            if (!isDrawing && !isMoving && !isResizing) {
                updateCursor(e);
            }

            if (isMoving) {
                let newX = initialCropX + (currentMouseX - initialMouseX);
                let newY = initialCropY + (currentMouseY - initialMouseY);

                newX = Math.max(0, Math.min(newX, imageCanvas.width - cropWidth));
                newY = Math.max(0, Math.min(newY, imageCanvas.height - cropHeight));

                startX = newX;
                startY = newY;
                drawImage();
            }
            else if (isResizing) {
                let newX = startX;
                let newY = startY;
                let newW = cropWidth;
                let newH = cropHeight;

                const deltaX = currentMouseX - initialMouseX;
                const deltaY = currentMouseY - initialMouseY;

                switch (activeHandle) {
                    case 'tl':
                        newW = initialCropW - deltaX;
                        newH = initialCropH - deltaY;
                        newX = initialCropX + deltaX;
                        newY = initialCropY + deltaY;
                        break;
                    case 'tr':
                        newW = initialCropW + deltaX;
                        newH = initialCropH - deltaY;
                        newX = initialCropX;
                        newY = initialCropY + deltaY;
                        break;
                    case 'bl':
                        newW = initialCropW - deltaX;
                        newH = initialCropH + deltaY;
                        newX = initialCropX + deltaX;
                        newY = initialCropY;
                        break;
                    case 'br':
                        newW = initialCropW + deltaX;
                        newH = initialCropH + deltaY;
                        newX = initialCropX;
                        newY = initialCropY;
                        break;
                }

                if (currentRatio !== null) {
                    if (Math.abs(newW - initialCropW) > Math.abs(newH - initialCropH)) {
                        newH = newW / currentRatio;
                    } else {
                        newW = newH * currentRatio;
                    }
                }

                newW = Math.max(0, newW);
                newH = Math.max(0, newH);

                if (activeHandle === 'tl' || activeHandle === 'bl') {
                    newX = Math.min(initialCropX + initialCropW - newW, newX);
                    newX = Math.max(0, newX);
                }
                if (activeHandle === 'tl' || activeHandle === 'tr') {
                    newY = Math.min(initialCropY + initialCropH - newH, newY);
                    newY = Math.max(0, newY);
                }

                if (newX + newW > imageCanvas.width) {
                    newW = imageCanvas.width - newX;
                    if (currentRatio !== null) newH = newW / currentRatio;
                }
                if (newY + newH > imageCanvas.height) {
                    newH = imageCanvas.height - newY;
                    if (currentRatio !== null) newW = newH * currentRatio;
                }

                if (activeHandle === 'tl' || activeHandle === 'bl') {
                    if (newX < 0) {
                        newX = 0;
                        if (currentRatio !== null) newW = newH * currentRatio;
                    }
                }
                if (activeHandle === 'tl' || activeHandle === 'tr') {
                    if (newY < 0) {
                        newY = 0;
                        if (currentRatio !== null) newH = newW / currentRatio;
                    }
                }

                startX = newX;
                startY = newY;
                cropWidth = newW;
                cropHeight = newH;

                drawImage();
            }
            else if (isDrawing) {
                cropWidth = currentMouseX - startX;
                cropHeight = currentMouseY - startY;

                drawImage();
            }
        });

        imageCanvas.addEventListener('mouseup', () => {
            isDrawing = false;
            isMoving = false;
            isResizing = false;
            activeHandle = null;

            startX = Math.min(startX, startX + cropWidth);
            startY = Math.min(startY, startY + cropHeight);
            cropWidth = Math.abs(cropWidth);
            cropHeight = Math.abs(cropHeight);

            if (cropWidth > 0 && cropHeight > 0) {
                showMessage('Crop area selected. Click "Crop Image" to proceed.', 'success');
            } else {
                showMessage('No valid crop area selected. Drag to select.', 'info');
                drawImage();
            }
            updatePreviewButtonVisibility(); // Update visibility after drawing/moving/resizing
        });

        cropBtn.addEventListener('click', () => {
            showLoadingIndicator(); // Show loading indicator
            if (!originalImage) {
                showMessage('No image loaded to crop.', 'error');
                hideLoadingIndicator(); // Hide loading indicator
                return;
            }
            if (cropWidth === 0 || cropHeight === 0) {
                showMessage('Please select a cropping area first by dragging on the image or choosing a ratio.', 'error');
                hideLoadingIndicator(); // Hide loading indicator
                return;
            }
            setTimeout(() => { // Re-added delay here
                // When cropping, we want the output to be the cropped part of the original image
                // Filters will be applied to this cropped image later if adjustments are made.
                croppedImage.src = getFilteredImageDataURL(originalImage, true); // Apply filters to the cropped portion
                croppedImageContainer.style.display = 'flex';
                downloadBtn.style.display = 'block';
                showMessage('Image cropped successfully!', 'success');
                updatePreviewButtonVisibility(); // Update visibility after crop
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for crop
        });

        resetCropBtn.addEventListener('click', resetCropState);
        clearImageBtn.addEventListener('click', clearImage);
        resetAdjustmentsBtn.addEventListener('click', resetAdjustments);
        resetPopularFiltersBtn.addEventListener('click', resetAdjustments);

        downloadBtn.addEventListener('click', () => {
            showLoadingIndicator(); // Show loading indicator
            setTimeout(() => { // Delay for download
                if (croppedImage.src && croppedImage.src !== window.location.href) {
                    const a = document.createElement('a');
                    a.href = croppedImage.src;
                    a.download = 'edited_image.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    showMessage('Edited image downloaded.', 'success');
                } else {
                    showMessage('No edited image available for download.', 'error');
                }
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for download
        });

        ratioButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ratio = e.target.dataset.ratio;
                applyCropRatio(ratio);
            });
        });

        // Function to center popups that are not handled by CSS positioning (draggable ones)
        function centerPopup(popupElement) {
            // If the popup is infoPopup or imageComparisonPopup, it's centered via CSS, so we return.
            if (popupElement.id === 'infoPopup' || popupElement.id === 'imageComparisonPopup') {
                return;
            }

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const popupWidth = popupElement.offsetWidth;
            const popupHeight = popupElement.offsetHeight;

            // Calculate center position
            const leftPos = (viewportWidth - popupWidth) / 2;
            const topPos = (viewportHeight - popupHeight) / 2;

            // Apply calculated position
            popupElement.style.left = `${leftPos}px`;
            popupElement.style.top = `${topPos}px`;
        }


        // Toggle Crop Controls Pop-up
        toggleCropControlsBtn.addEventListener('click', () => {
            cropControlsPopup.classList.toggle('show');
            if (cropControlsPopup.classList.contains('show')) {
                toggleCropControlsBtn.textContent = 'Hide Crop Controls';
                centerPopup(cropControlsPopup); // Center on open
            } else {
                toggleCropControlsBtn.textContent = 'Show Crop Controls';
            }
        });

        // Close Crop Controls Pop-up
        closeCropPopupBtn.addEventListener('click', () => {
            cropControlsPopup.classList.remove('show');
            toggleCropControlsBtn.textContent = 'Show Crop Controls';
        });

        // Toggle Popular Filters Pop-up
        togglePopularFiltersBtn.addEventListener('click', () => {
            popularFiltersPopup.classList.toggle('show');
            if (popularFiltersPopup.classList.contains('show')) {
                togglePopularFiltersBtn.textContent = 'Hide Popular Filters';
                createFilterButtons();
                centerPopup(popularFiltersPopup); // Center on open
            } else {
                togglePopularFiltersBtn.textContent = 'Show Popular Filters';
            }
        });

        // Close Popular Filters Pop-up
        closePopularFiltersPopupBtn.addEventListener('click', () => {
            popularFiltersPopup.classList.remove('show');
            togglePopularFiltersBtn.textContent = 'Show Popular Filters';
        });

        // Toggle Adjust Controls Pop-up
        toggleAdjustControlsBtn.addEventListener('click', () => {
            adjustControlsPopup.classList.toggle('show');
            if (adjustControlsPopup.classList.contains('show')) {
                toggleAdjustControlsBtn.textContent = 'Hide Image Adjustments';
                centerPopup(adjustControlsPopup); // Center on open
            } else {
                toggleAdjustControlsBtn.textContent = 'Show Image Adjustments';
            }
        });

        // Close Adjust Controls Pop-up
        closeAdjustPopupBtn.addEventListener('click', () => {
            adjustControlsPopup.classList.remove('show');
            toggleAdjustControlsBtn.textContent = 'Show Image Adjustments';
        });

        // Preview Button Logic
        previewBtn.addEventListener('click', () => {
            showLoadingIndicator();
            if (!originalImage) {
                showMessage('Please load an image first to preview.', 'error');
                hideLoadingIndicator();
                return;
            }
            setTimeout(() => {
                imageComparisonPopup.classList.add('show');

                const isCropped = (cropWidth > 0 && cropHeight > 0);
                
                let beforeImageSrc;
                let afterImageSrc;

                if (isCropped) {
                    // If cropped, the 'before' image for comparison is the cropped-only version
                    // This is the content of `croppedImage.src` *before* filters are applied.
                    const tempCanvasForCroppedOriginal = document.createElement('canvas');
                    const tempCtxForCroppedOriginal = tempCanvasForCroppedOriginal.getContext('2d');

                    const sourceX = startX * scaleFactor;
                    const sourceY = startY * scaleFactor;
                    const sourceWidth = cropWidth * scaleFactor;
                    const sourceHeight = cropHeight * scaleFactor;

                    tempCanvasForCroppedOriginal.width = sourceWidth;
                    tempCanvasForCroppedOriginal.height = sourceHeight;
                    tempCtxForCroppedOriginal.drawImage(
                        originalImage,
                        sourceX,
                        sourceY,
                        sourceWidth,
                        sourceHeight,
                        0,
                        0,
                        sourceWidth,
                        sourceHeight
                    );
                    beforeImageSrc = tempCanvasForCroppedOriginal.toDataURL('image/png');

                    // The 'after' image is the currently displayed croppedImage (which includes filters if applied)
                    afterImageSrc = croppedImage.src;

                } else {
                    // If not cropped, the 'before' image is the original image (unfiltered)
                    beforeImageSrc = originalImage.src;
                    // The 'after' image is the original image with current filters applied
                    afterImageSrc = getFilteredImageDataURL(originalImage, false); // Pass false to not apply crop
                }

                beforeImageDiv.style.backgroundImage = `url('${beforeImageSrc}')`;
                afterImageDiv.style.backgroundImage = `url('${afterImageSrc}')`;
                
                comparisonImagesContainer.style.setProperty('--slider-x', '50%');
                hideLoadingIndicator();
            }, 100);
        });

        closeComparisonPopupBtn.addEventListener('click', () => {
            imageComparisonPopup.classList.remove('show');
        });

        // Comparison Slider Drag Logic
        comparisonHandle.addEventListener('mousedown', (e) => {
            isDraggingComparison = true;
            e.preventDefault();
            comparisonHandle.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDraggingComparison) return;

            const containerRect = comparisonImagesContainer.getBoundingClientRect();
            let mouseX = e.clientX - containerRect.left;

            mouseX = Math.max(0, Math.min(mouseX, containerRect.width));

            const percentage = (mouseX / containerRect.width) * 100;

            comparisonImagesContainer.style.setProperty('--slider-x', `${percentage}%`);
        });

        document.addEventListener('mouseup', () => {
            isDraggingComparison = false;
            if (comparisonHandle) {
                comparisonHandle.style.cursor = 'ew-resize';
            }
        });


        // Drag functionality for ALL Pop-ups
        function setupDraggablePopup(popupElement, headerElement) {
            // Only add drag listeners if it's not the imageComparisonPopup or infoPopup
            if (popupElement.id !== 'imageComparisonPopup' && popupElement.id !== 'infoPopup') {
                headerElement.addEventListener('mousedown', (e) => {
                    isDraggingPopup = true;
                    activePopup = popupElement;
                    popupOffsetX = e.clientX - activePopup.getBoundingClientRect().left;
                    popupOffsetY = e.clientY - activePopup.getBoundingClientRect().top;
                    activePopup.style.cursor = 'grabbing';
                    e.preventDefault();
                });
            } else { // For imageComparisonPopup and infoPopup, ensure header cursor is default
                headerElement.style.cursor = 'default';
            }
        }

        document.addEventListener('mousemove', (e) => {
            if (!isDraggingPopup || !activePopup) return;

            let newX = e.clientX - popupOffsetX;
            let newY = e.clientY - popupOffsetY;

            const maxX = window.innerWidth - activePopup.offsetWidth;
            const maxY = window.innerHeight - activePopup.offsetHeight;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            activePopup.style.left = `${newX}px`;
            activePopup.style.top = `${newY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (activePopup && activePopup.id !== 'imageComparisonPopup' && activePopup.id !== 'infoPopup') {
                activePopup.style.cursor = 'grab';
            }
            isDraggingPopup = false;
            activePopup = null;
        });

        // Setup draggable for existing popups
        setupDraggablePopup(cropControlsPopup, cropPopupHeader);
        setupDraggablePopup(adjustControlsPopup, adjustPopupHeader);
        setupDraggablePopup(popularFiltersPopup, popularFiltersPopupHeader);
        setupDraggablePopup(imageComparisonPopup, imageComparisonPopupHeader);
        // Setup for the new info popup
        setupDraggablePopup(infoPopup, infoPopup.querySelector('.popup-header'));


        brightnessSlider.addEventListener('input', (e) => {
            brightnessValueSpan.textContent = `${e.target.value}%`;
        });
        brightnessSlider.addEventListener('change', (e) => {
            showLoadingIndicator(); // Show loading indicator
            setTimeout(() => { // Re-added delay here
                filters.brightness = e.target.value;
                if (originalImage) {
                    // Apply filters to the cropped image if available, otherwise to original
                    croppedImage.src = getFilteredImageDataURL(originalImage);
                    croppedImageContainer.style.display = 'flex';
                    downloadBtn.style.display = 'block';
                }
                updatePreviewButtonVisibility(); // Update visibility after adjustment
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for adjustment
        });

        contrastSlider.addEventListener('input', (e) => {
            contrastValueSpan.textContent = `${e.target.value}%`;
        });
        contrastSlider.addEventListener('change', (e) => {
            showLoadingIndicator(); // Show loading indicator
            setTimeout(() => { // Re-added delay here
                filters.contrast = e.target.value;
                if (originalImage) {
                    // Apply filters to the cropped image if available, otherwise to original
                    croppedImage.src = getFilteredImageDataURL(originalImage);
                    croppedImageContainer.style.display = 'flex';
                    downloadBtn.style.display = 'block';
                }
                updatePreviewButtonVisibility(); // Update visibility after adjustment
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for adjustment
        });

        saturationSlider.addEventListener('input', (e) => {
            saturationValueSpan.textContent = `${e.target.value}%`;
        });
        saturationSlider.addEventListener('change', (e) => {
            showLoadingIndicator(); // Show loading indicator
            setTimeout(() => { // Re-added delay here
                filters.saturation = e.target.value;
                if (originalImage) {
                    // Apply filters to the cropped image if available, otherwise to original
                    croppedImage.src = getFilteredImageDataURL(originalImage);
                    croppedImageContainer.style.display = 'flex';
                    downloadBtn.style.display = 'block';
                }
                updatePreviewButtonVisibility(); // Update visibility after adjustment
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for adjustment
        });

        grayscaleSlider.addEventListener('input', (e) => {
            grayscaleValueSpan.textContent = `${e.target.value}%`;
        });
        grayscaleSlider.addEventListener('change', (e) => {
            showLoadingIndicator(); // Show loading indicator
            setTimeout(() => { // Re-added delay here
                filters.grayscale = e.target.value;
                if (originalImage) {
                    // Apply filters to the cropped image if available, otherwise to original
                    croppedImage.src = getFilteredImageDataURL(originalImage);
                    croppedImageContainer.style.display = 'flex';
                    downloadBtn.style.display = 'block';
                }
                updatePreviewButtonVisibility(); // Update visibility after adjustment
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for adjustment
        });

        sepiaSlider.addEventListener('input', (e) => {
            sepiaValueSpan.textContent = `${e.target.value}%`;
        });
        sepiaSlider.addEventListener('change', (e) => {
            showLoadingIndicator(); // Show loading indicator
            setTimeout(() => { // Re-added delay here
                filters.sepia = e.target.value;
                if (originalImage) {
                    // Apply filters to the cropped image if available, otherwise to original
                    croppedImage.src = getFilteredImageDataURL(originalImage);
                    croppedImageContainer.style.display = 'flex';
                    downloadBtn.style.display = 'block';
                }
                updatePreviewButtonVisibility(); // Update visibility after adjustment
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for adjustment
        });


        window.addEventListener('resize', () => {
            if (originalImage) {
                drawImage();
                if (cropWidth > 0 && cropHeight > 0) {
                    drawCropRectangle();
                }
            }
            // Recenter draggable popups on resize
            if (cropControlsPopup.classList.contains('show')) {
                centerPopup(cropControlsPopup);
            }
            if (adjustControlsPopup.classList.contains('show')) {
                centerPopup(adjustControlsPopup);
            }
            if (popularFiltersPopup.classList.contains('show')) {
                centerPopup(popularFiltersPopup);
            }
            // infoPopup and imageComparisonPopup are centered by CSS, no JS needed here.
        });

        // Theme Toggle Logic
        themeToggle.addEventListener('click', () => {
            showLoadingIndicator(); // Show loading indicator
            setTimeout(() => { // Delay for theme toggle
                const currentTheme = htmlElement.getAttribute('data-theme');
                if (currentTheme === 'dark') {
                    htmlElement.removeAttribute('data-theme');
                    themeToggle.textContent = '☀️';
                    localStorage.setItem('theme', 'light');
                } else {
                    htmlElement.setAttribute('data-theme', 'dark');
                    themeToggle.textContent = '🌙';
                    localStorage.setItem('theme', 'dark');
                }
                // Redraw canvas and cropped image to apply new theme colors
                if (originalImage) {
                    drawImage();
                    if (cropWidth > 0 && cropHeight > 0) {
                        drawCropRectangle();
                    }
                }
                if (croppedImageContainer.style.display === 'flex' && originalImage) {
                    // Re-apply filters to the currently displayed image (cropped or not)
                    croppedImage.src = getFilteredImageDataURL(originalImage);
                }
                hideLoadingIndicator(); // Hide loading indicator
            }, 100); // Small delay for theme toggle
        });

        // Apply saved theme on load
        window.onload = function() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                htmlElement.removeAttribute('data-theme');
                themeToggle.textContent = '☀️';
            } else {
                // Default to dark if no theme saved or if saved theme is dark
                htmlElement.setAttribute('data-theme', 'dark');
                themeToggle.textContent = '🌙';
                localStorage.setItem('theme', 'dark'); // Ensure 'dark' is saved if it's the default
            }

            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary');
            ctx.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
            showMessage('Welcome! Drag & Drop an image or choose one to start editing. Click "Show Crop Controls", "Show Popular Filters", or "Show Image Adjustments" to reveal options.', 'info');
            updatePreviewButtonVisibility(); // Ensure button is hidden on initial load
            clearImageBtn.style.display = 'none';
            downloadBtn.style.display = 'none'; // Ensure download button is hidden on initial load
            imageCanvasContainer.style.display = 'none'; // Hide the uploaded image container on initial load

            // Hide the control buttons on initial load
            toggleCropControlsBtn.style.display = 'none';
            togglePopularFiltersBtn.style.display = 'none';
            toggleAdjustControlsBtn.style.display = 'none';
        };

        // Disable right-click context menu on the entire page
        // This prevents users from right-clicking to save images or inspect elements easily.
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault(); // Prevent the default right-click behavior
        });

        // Function to toggle modal state (show/hide overlay and popup)
        function toggleModal(show) {
            if (show) {
                modalOverlay.classList.add('modal-overlay-visible'); // Show overlay
                document.body.classList.add('modal-active'); // Add class to body to disable main content interaction
                infoPopup.classList.add('show'); // Show the info popup
            } else {
                modalOverlay.classList.remove('modal-overlay-visible'); // Hide overlay
                document.body.classList.remove('modal-active'); // Remove body class
                infoPopup.classList.remove('show'); // Hide the info popup
            }
        }

        // Event listener for the new info button
        infoButton.addEventListener('click', () => {
            toggleModal(true); // Show the info modal
        });

        // Event listener for the close button inside the info popup
        closeInfoPopupBtn.addEventListener('click', () => {
            toggleModal(false); // Hide the info modal
        });