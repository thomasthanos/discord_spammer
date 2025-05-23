document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        webhookUrl: document.getElementById('webhook-url'),
        messageContent: document.getElementById('message-content'),
        intervalValue: document.getElementById('interval-value'),
        intervalDisplay: document.getElementById('interval-display'),
        intervalUnit: document.getElementById('interval-unit'),
        messageLimit: document.getElementById('message-limit'),
        startBtn: document.getElementById('start-btn'),
        stopBtn: document.getElementById('stop-btn'),
        testBtn: document.getElementById('test-btn'),
        statusText: document.getElementById('status-text'),
        statusDot: document.querySelector('.status-dot'),
        logContainer: document.getElementById('log-container'),
        toggleVisibility: document.getElementById('toggle-visibility'),
        webhookWarning: document.getElementById('webhook-warning'),
        historyBtn: document.getElementById('history-btn'),
        username: document.getElementById('username'),
        avatarUrl: document.getElementById('avatar-url'),
        randomMessages: document.getElementById('random-messages'),
        statTotal: document.getElementById('stat-total'),
        statSuccess: document.getElementById('stat-success'),
        statFailed: document.getElementById('stat-failed'),
        statAvgTime: document.getElementById('stat-avg-time'),
        resetStats: document.getElementById('reset-stats'),
        enableSounds: document.getElementById('enable-sounds'),
        clearLogs: document.getElementById('clear-logs'),
        previewAvatar: document.getElementById('preview-avatar'),
        previewUsername: document.getElementById('preview-username'),
        previewText: document.getElementById('preview-text'),
        historyModal: document.getElementById('history-modal'),
        historyList: document.getElementById('history-list'),
        successSound: document.getElementById('success-sound'),
        errorSound: document.getElementById('error-sound'),
        notificationSound: document.getElementById('notification-sound'),
        exportJsonMenu: document.getElementById('export-json-menu'),
        exportScreenshotMenu: document.getElementById('export-screenshot-menu'),
        importJsonMenu: document.getElementById('import-json-menu'),
        suggestMessage: document.getElementById('suggest-message'),
        formatHelp: document.getElementById('format-help'),
        suggestionsModal: document.getElementById('suggestions-modal'),
        formatHelpModal: document.getElementById('format-help-modal'),
        toastContainer: document.getElementById('toast-container'),
        themeCarousel: document.querySelector('.theme-carousel'),
        embedList: document.getElementById('embed-list'),
        addEmbedBtn: document.getElementById('add-embed-btn'),
        embedContent: document.getElementById('embed-content'),
        embedToggleBtn: document.getElementById('embed-toggle-btn'),
        messageAttachments: document.getElementById('message-attachments'),
        messageAttachmentsPreview: document.getElementById('message-attachments-preview'),
        embedImageUrl: document.getElementById('embed-image-url'),
        embedThumbnailUrl: document.getElementById('embed-thumbnail-url'),
        fileSizeLimit: document.getElementById('file-size-limit'),
        saveProfileBtn: document.getElementById('save-profile-btn'),
        manageProfilesBtn: document.getElementById('manage-profiles-btn'),
        profilesModal: document.getElementById('profiles-modal'),
        profilesList: document.getElementById('profiles-list'),
        noProfilesMessage: document.getElementById('no-profiles-message')
    };

    function isValidImageUrl(url) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url);
    }

    // Variables
    let intervalId = null;
    let isSending = false;
    let stats = { 
        total: 0,
        success: 0,
        failed: 0,
        responseTimes: [] 
    };
    let embeds = [];
    let embedCount = 1;
    let attachments = [];

    // Moved to outer scope
    function updateMessageLimitPlaceholder() {
        console.log('updateMessageLimitPlaceholder defined');
        const value = elements.messageLimit.value;
        if (value === '0' || value === '') {
            elements.messageLimit.value = ''; // Clear the input to show the placeholder
            elements.messageLimit.placeholder = '∞';
        } else {
            elements.messageLimit.placeholder = 'Unlimited';
        }
    }

    // Initialize app
    function initApp() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        
        // Set active theme preview
        document.querySelectorAll('.theme-preview').forEach(preview => {
            if (preview.dataset.theme === savedTheme) {
                preview.classList.add('active');
            }
        });

        // Load saved settings
        [
            'webhookUrl', 'messageContent', 'username', 'avatarUrl', 'randomMessages',
            'embedImageUrl', 'embedThumbnailUrl', 'fileSizeLimit'
        ].forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                if (key === 'randomMessages' && value === 'true') {
                    elements[key].checked = true;
                } else if (key === 'fileSizeLimit') {
                    elements.fileSizeLimit.value = value || '8'; // Default to 8 MB
                } else {
                    elements[key].value = value;
                }
            }
        });

        // Load embeds
        const savedEmbeds = localStorage.getItem('embeds');
        if (savedEmbeds) {
            embeds = JSON.parse(savedEmbeds);
            embedCount = embeds.length;
            renderEmbeds();
        } else {
            embeds = [{ title: '', description: '', color: '#5865F2', footer: '' }];
            renderEmbeds();
        }

        // Load stats
        const savedStats = localStorage.getItem('stats');
        if (savedStats) {
            stats = JSON.parse(savedStats);
            updateStats();
        }

        // Load sounds preference
        elements.enableSounds.checked = localStorage.getItem('soundsEnabled') !== 'false';

        // Initialize preview
        if (elements.messageContent.value) updatePreview();
        if (elements.avatarUrl.value) elements.previewAvatar.src = elements.avatarUrl.value;

        document.querySelector('.selected-option').onclick = function() {
            let opts = document.querySelector('.options-list');
            opts.style.display = (opts.style.display === 'block' ? 'none' : 'block');
        };

        document.querySelectorAll('.option').forEach(opt => {
            opt.onclick = function() {
                let value = this.dataset.value;
                let text = this.innerText.trim();
                let icon = this.querySelector('.option-icon').src;
                document.getElementById('file-size-limit').value = value;
                document.getElementById('selected-level-text').textContent = text;
                document.getElementById('selected-level-icon').src = icon;
                document.querySelector('.options-list').style.display = 'none';
            };
        });

        document.addEventListener('click', function(e) {
            if (!document.getElementById('file-size-custom-select').contains(e.target)) {
                document.querySelector('.options-list').style.display = 'none';
            }
        });

        // Setup event listeners
        setupEventListeners();
        setupEmbedEventListeners();
        handleFileUploads();
    }

    function setupEventListeners() {
        // Theme selection
        elements.themeCarousel.addEventListener('click', (e) => {
            const themePreview = e.target.closest('.theme-preview');
            if (!themePreview) return;
            
            const theme = themePreview.dataset.theme;
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            // Update active state
            document.querySelectorAll('.theme-preview').forEach(el => {
                el.classList.remove('active');
            });
            themePreview.classList.add('active');
            
            showToast(`Theme changed to ${theme}`, 'success');
        });

        // Webhook URL visibility toggle
        elements.toggleVisibility.addEventListener('click', () => {
            const type = elements.webhookUrl.type === 'password' ? 'text' : 'password';
            elements.webhookUrl.type = type;
            elements.toggleVisibility.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
        });

        // Input changes
        elements.webhookUrl.addEventListener('input', () => {
            localStorage.setItem('webhookUrl', elements.webhookUrl.value);
            checkWebhookPrivacy(elements.webhookUrl.value);
        });

        elements.messageContent.addEventListener('input', () => {
            localStorage.setItem('messageContent', elements.messageContent.value);
            updatePreview();
        });

        elements.username.addEventListener('input', () => {
            localStorage.setItem('username', elements.username.value);
            updatePreview();
        });

        elements.avatarUrl.addEventListener('input', () => {
            localStorage.setItem('avatarUrl', elements.avatarUrl.value);
            updatePreview();
        });

        elements.randomMessages.addEventListener('change', () => {
            localStorage.setItem('randomMessages', elements.randomMessages.checked);
        });

        elements.enableSounds.addEventListener('change', () => {
            localStorage.setItem('soundsEnabled', elements.enableSounds.checked);
        });

        // New input changes for attachments
        elements.embedImageUrl.addEventListener('input', () => {
            localStorage.setItem('embedImageUrl', elements.embedImageUrl.value);
            updatePreview();
        });

        elements.embedThumbnailUrl.addEventListener('input', () => {
            localStorage.setItem('embedThumbnailUrl', elements.embedThumbnailUrl.value);
            updatePreview();
        });

        // File size limit dropdown
        elements.fileSizeLimit.addEventListener('change', (e) => {
            localStorage.setItem('fileSizeLimit', e.target.value);
        });

        // Interval controls
        elements.intervalUnit.addEventListener('change', updateIntervalDisplay);
        elements.intervalValue.addEventListener('input', updateIntervalDisplay);
        updateIntervalDisplay();

        // Message limit input
        elements.messageLimit.addEventListener('input', () => {
            updateMessageLimitPlaceholder();
            const value = elements.messageLimit.value;
            let label = 'Ready';
            if (value && value !== "0") {
                label = `Ready (${value}/${value})`;
            }
            elements.statusText.textContent = label;
        });

        // Increment/Decrement buttons
        document.querySelectorAll('.interval-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                const input = btn.closest('.input-with-buttons').querySelector('input');
                let value = parseInt(input.value) || (input.id === 'message-limit' ? 0 : 10);

                if (input.id === 'message-limit' && input.value === '') {
                    value = 0;
                }

                if (action === 'increment') {
                    if (input.id === 'message-limit' && input.value === '') {
                        input.value = 1;
                    } else {
                        input.value = value + 1;
                    }
                } else if (action === 'decrement' && value > 0) {
                    input.value = value - 1;
                    if (input.value === '0') {
                        input.value = '';
                        updateMessageLimitPlaceholder(); // Ensure placeholder updates
                    }
                }

                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });

        // Auto-select text on input focus
        document.querySelectorAll('.input-with-buttons input').forEach(input => {
            input.addEventListener('focus', function() {
                this.select();
            });
        });

        // Buttons
        elements.startBtn.addEventListener('click', startSending);
        elements.stopBtn.addEventListener('click', stopSending);
        elements.testBtn.addEventListener('click', sendTestMessage);
        elements.resetStats.addEventListener('click', resetStatistics);
        elements.clearLogs.addEventListener('click', clearLogs);
        elements.historyBtn.addEventListener('click', showHistoryModal);
        elements.suggestMessage.addEventListener('click', showMessageSuggestions);
        elements.formatHelp.addEventListener('click', showFormatHelp);

        // Export/Import
        elements.exportJsonMenu.addEventListener('click', exportLogsAsJson);
        elements.exportScreenshotMenu.addEventListener('click', exportLogsAsScreenshot);
        elements.importJsonMenu.addEventListener('click', importLogsFromJson);

        // Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.add('hidden');
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });

        // Initialize message-limit placeholder on page load
        updateMessageLimitPlaceholder();
    }

    function handleFileUploads() {
        elements.messageAttachments.addEventListener('change', (e) => {
            let newFiles = Array.from(e.target.files);
            const maxFileSizeMB = parseInt(elements.fileSizeLimit.value) || 8;
            const maxAttachments = 10;

            // Keep only valid files
            let validFiles = [];
            newFiles.forEach(file => {
                const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
                if (file.size > maxFileSizeMB * 1024 * 1024) {
                    addLog('error', `Attachment '${file.name}' is too large (${fileSizeMB} MB > ${maxFileSizeMB} MB limit)`);
                    showToast(`Το αρχείο '${file.name}' είναι πολύ μεγάλο (${fileSizeMB} MB / όριο ${maxFileSizeMB} MB)`, 'error');
                } else {
                    validFiles.push(file);
                    addLog('success', `Attachment '${file.name}' uploaded (${fileSizeMB} MB)`);
                }
            });

            if (validFiles.length > maxAttachments) {
                addLog('warning', `Too many attachments (${validFiles.length}). Maximum allowed is ${maxAttachments}.`);
                validFiles = validFiles.slice(0, maxAttachments);
            }

            attachments = validFiles;

            // Sync with file input
            const dataTransfer = new DataTransfer();
            attachments.forEach(file => dataTransfer.items.add(file));
            elements.messageAttachments.files = dataTransfer.files;

            renderAttachmentsPreview();
            updatePreview();

            // Clear input if no attachments remain
            if (attachments.length === 0) {
                elements.messageAttachments.value = '';
            }
        });
    }

    function renderAttachmentsPreview() {
        elements.messageAttachmentsPreview.innerHTML = '';
        attachments.forEach((file, i) => {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
            const fileId = `${file.name}_${file.size}`; // Unique ID

            // Determine icon for non-image/video files
            let iconClass = 'fa-file';
            if (file.type === 'application/pdf') iconClass = 'fa-file-pdf';
            else if (file.type.includes('zip') || file.type.includes('compressed')) iconClass = 'fa-file-archive';
            else if (file.type.includes('msword') || file.type.includes('officedocument')) iconClass = 'fa-file-word';

            let innerHTML = '';
            if (file.type.startsWith('image/')) {
                innerHTML = `
                    <img src="${URL.createObjectURL(file)}" alt="${file.name}">
                    <span>${file.name} (${fileSizeMB} MB)</span>
                    <button class="btn-icon-small remove-attachment" data-fid="${fileId}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            } else if (file.type.startsWith('video/')) {
                innerHTML = `
                    <video controls>
                        <source src="${URL.createObjectURL(file)}" type="${file.type}">
                    </video>
                    <span>${file.name} (${fileSizeMB} MB)</span>
                    <button class="btn-icon-small remove-attachment" data-fid="${fileId}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            } else {
                innerHTML = `
                    <i class="fas ${iconClass}"></i>
                    <span>${file.name} (${fileSizeMB} MB)</span>
                    <button class="btn-icon-small remove-attachment" data-fid="${fileId}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }

            const previewElement = document.createElement('div');
            previewElement.className = 'attachment-preview-item';
            previewElement.innerHTML = innerHTML;
            elements.messageAttachmentsPreview.appendChild(previewElement);

            // Remove button
            previewElement.querySelector('.remove-attachment').addEventListener('click', (e) => {
                e.stopPropagation();
                const fileId = e.currentTarget.getAttribute('data-fid');
                attachments = attachments.filter(f => (`${f.name}_${f.size}` !== fileId));

                // Update file input
                const dataTransfer = new DataTransfer();
                attachments.forEach(file => dataTransfer.items.add(file));
                elements.messageAttachments.files = dataTransfer.files;

                renderAttachmentsPreview();
                updatePreview();

                // Clear input if no attachments remain
                if (attachments.length === 0) {
                    elements.messageAttachments.value = '';
                }
            });
        });
    }

    function setupEmbedEventListeners() {
        elements.addEmbedBtn.addEventListener('click', () => {
            if (embedCount >= 10) {
                showToast('Maximum 10 embeds allowed', 'warning');
                return;
            }
            embeds.push({ title: '', description: '', color: '#5865F2', footer: '' });
            embedCount++;
            localStorage.setItem('embeds', JSON.stringify(embeds));
            renderEmbeds();
            updatePreview();
            showToast('New embed added', 'success');
        });

        elements.embedToggleBtn.addEventListener('click', () => {
            const isExpanded = elements.embedContent.classList.toggle('expanded');
            elements.embedToggleBtn.classList.toggle('collapsed', !isExpanded);
            if (isExpanded) {
                if (window.innerWidth < 768) {
                    elements.embedContent.style.maxHeight = '300px';
                } else {
                    if (embedCount > 1) {
                        elements.embedContent.style.maxHeight = '500px';
                    } else {
                        elements.embedContent.style.maxHeight = 'none';
                    }
                }
            } else {
                elements.embedContent.style.maxHeight = '0';
            }
        });
    }

    function renderEmbeds() {
        elements.embedList.innerHTML = '';
        embeds.forEach((embed, index) => {
            embed.index = index; // Re-index

            const embedItem = document.createElement('div');
            embedItem.className = 'embed-item';
            embedItem.dataset.embedIndex = index;
            embedItem.innerHTML = `
                <div class="form-row embed-row">
                    <div class="form-group">
                        <label for="embed-title-${index}"><i class="fas fa-heading"></i> Embed Title</label>
                        <input type="text" id="embed-title-${index}" placeholder="Enter embed title" value="${embed.title || ''}">
                    </div>
                    <div class="form-group">
                        <label for="embed-color-${index}"><i class="fas fa-palette"></i> Embed Color</label>
                        <input type="color" id="embed-color-${index}" value="${embed.color || '#5865F2'}">
                    </div>
                    <button class="btn-icon delete-embed-btn ${index === 0 ? 'hidden' : ''}" data-embed-index="${index}" title="Delete Embed"><i class="fas fa-trash"></i></button>
                </div>
                <div class="form-group">
                    <label for="embed-description-${index}"><i class="fas fa-align-left"></i> Embed Description</label>
                    <textarea id="embed-description-${index}" rows="3" placeholder="Enter embed description">${embed.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="embed-footer-${index}"><i class="fas fa-shoe-prints"></i> Embed Footer</label>
                    <input type="text" id="embed-footer-${index}" placeholder="Enter footer text" value="${embed.footer || ''}">
                </div>
                <div class="form-row">
                    <div class="form-group half-width">
                        <label for="embed-image-url-${index}"><i class="fas fa-image"></i> Embed Image URL</label>
                        <input type="url" id="embed-image-url-${index}" placeholder="https://example.com/image.png" value="${embed.imageUrl || ''}">
                    </div>
                    <div class="form-group half-width">
                        <label for="embed-thumbnail-url-${index}"><i class="fas fa-image"></i> Embed Thumbnail URL</label>
                        <input type="url" id="embed-thumbnail-url-${index}" placeholder="https://example.com/thumbnail.png" value="${embed.thumbnailUrl || ''}">
                    </div>
                </div>
            `;
            elements.embedList.appendChild(embedItem);

            const titleInput = embedItem.querySelector(`#embed-title-${index}`);
            const descriptionInput = embedItem.querySelector(`#embed-description-${index}`);
            const colorInput = embedItem.querySelector(`#embed-color-${index}`);
            const footerInput = embedItem.querySelector(`#embed-footer-${index}`);
            const imageUrlInput = embedItem.querySelector(`#embed-image-url-${index}`);
            const thumbnailUrlInput = embedItem.querySelector(`#embed-thumbnail-url-${index}`);
            
            titleInput.addEventListener('input', () => {
                embeds[index].title = titleInput.value;
                localStorage.setItem('embeds', JSON.stringify(embeds));
                updatePreview();
            });
            
            descriptionInput.addEventListener('input', () => {
                embeds[index].description = descriptionInput.value;
                localStorage.setItem('embeds', JSON.stringify(embeds));
                updatePreview();
            });
            
            colorInput.addEventListener('input', () => {
                embeds[index].color = colorInput.value;
                localStorage.setItem('embeds', JSON.stringify(embeds));
                updatePreview();
            });
            
            footerInput.addEventListener('input', () => {
                embeds[index].footer = footerInput.value;
                localStorage.setItem('embeds', JSON.stringify(embeds));
                updatePreview();
            });
            
            imageUrlInput.addEventListener('input', () => {
                embeds[index].imageUrl = imageUrlInput.value;
                localStorage.setItem('embeds', JSON.stringify(embeds));
                updatePreview();
            });
            
            thumbnailUrlInput.addEventListener('input', () => {
                embeds[index].thumbnailUrl = thumbnailUrlInput.value;
                localStorage.setItem('embeds', JSON.stringify(embeds));
                updatePreview();
            });
        });

        // Delete button
        document.querySelectorAll('.delete-embed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.embedIndex);
                if (index > 0) {
                    embeds.splice(index, 1);
                    embedCount--;
                    localStorage.setItem('embeds', JSON.stringify(embeds));
                    renderEmbeds();
                    updatePreview();
                    showToast('Embed deleted', 'success');
                }
            });
        });

        if (elements.embedContent.classList.contains('expanded')) {
            if (window.innerWidth < 768) { // Mobile
                elements.embedContent.style.maxHeight = '300px';
            } else { // Tablet/Desktop
                if (embedCount > 1) {
                    elements.embedContent.style.maxHeight = '500px';
                } else {
                    elements.embedContent.style.maxHeight = 'none';
                }
            }
        }
    }

    function loadLayout() {
        const defaultLayout = ["settings", "preview", "stats", "controls", "logs"];
        const savedLayout = localStorage.getItem('layout');
        const container = document.querySelector('.app-content');
        
        if (!container) {
            console.error('Error: .app-content container not found in DOM');
            addLog('error', 'Failed to load layout: App content container missing');
            return;
        }

        // Use saved layout if valid, otherwise use default
        let layout = defaultLayout;
        if (savedLayout) {
            try {
                const parsedLayout = JSON.parse(savedLayout);
                if (Array.isArray(parsedLayout) && parsedLayout.length === defaultLayout.length &&
                    defaultLayout.every(card => parsedLayout.includes(card))) {
                    layout = parsedLayout;
                } else {
                    console.warn('Invalid saved layout, using default:', parsedLayout);
                }
            } catch (e) {
                console.error('Error parsing saved layout:', e);
            }
        }

        // Store card elements to ensure they exist
        const cardElements = {};
        layout.forEach(card => {
            const el = document.querySelector(`[data-card="${card}"]`);
            if (el) {
                cardElements[card] = el;
            } else {
                console.error(`Error: Card element for "${card}" not found in DOM`);
            }
        });

        // Check if all cards were found
        if (Object.keys(cardElements).length !== defaultLayout.length) {
            console.error('Missing card elements:', defaultLayout.filter(card => !cardElements[card]));
            addLog('error', 'Failed to load layout: One or more card elements missing');
            // Fallback: Append all available cards in default order
            defaultLayout.forEach(card => {
                const el = document.querySelector(`[data-card="${card}"]`);
                if (el && !container.contains(el)) {
                    container.appendChild(el);
                }
            });
            return;
        }

        // Remove cards from container and re-append in the correct order
        layout.forEach(card => {
            const el = cardElements[card];
            if (el && !container.contains(el)) {
                container.appendChild(el);
            }
        });
    }

    function updateIntervalDisplay() {
        const value = elements.intervalValue.value;
        const unit = elements.intervalUnit.value;
        const symbolMap = {
            seconds: 's',
            minutes: 'm',
            hours: 'h'
        };
        const symbol = symbolMap[unit] || '';
        elements.intervalDisplay.textContent = `${value} ${symbol}`;
    }

    function checkWebhookPrivacy(url) {
        const isPublic = url.includes('discord.com/api/webhooks/') && !url.includes('localhost');
        elements.webhookWarning.classList.toggle('hidden', !isPublic);
    }

    function updatePreview() {
        let messageContent = elements.messageContent.value || 'Your message will appear here...';
        messageContent = formatDiscordMarkdown(messageContent, 'description');
        elements.previewText.innerHTML = messageContent;
        elements.previewUsername.textContent = elements.username.value || 'Webhook Sender';
        elements.previewAvatar.src = elements.avatarUrl.value || 'https://cdn.discordapp.com/embed/avatars/0.png';

        // Remove old preview elements
        document.querySelectorAll('.embed-preview').forEach(preview => preview.remove());
        const attachmentsPreview = document.querySelector('.preview-attachments');
        if (attachmentsPreview) attachmentsPreview.remove();

        // Render attachments first
        if (attachments.length > 0) {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-attachments';
            previewContainer.style.display = 'flex';
            previewContainer.style.gap = '15px';
            previewContainer.style.flexWrap = 'wrap';
            attachments.forEach(file => {
                const attachmentItem = document.createElement('div');
                attachmentItem.className = 'attachment-preview-item';
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(file);
                    img.alt = file.name;
                    attachmentItem.appendChild(img);
                } else {
                    // Only icon for non-image files
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-file';
                    attachmentItem.appendChild(icon);
                }
                // Attachment info
                const info = document.createElement('div');
                info.className = 'attachment-info';
                if (!file.type.startsWith('image/')) {
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-file';
                    info.appendChild(icon);
                }
                const name = document.createElement('span');
                name.style.color = '#4d73fa';
                name.textContent = file.name;
                info.appendChild(name);
                const size = document.createElement('span');
                size.style.color = '#b9bbbe';
                size.textContent = `(${(file.size/1024/1024).toFixed(2)} MB)`;
                info.appendChild(size);

                attachmentItem.appendChild(info);
                previewContainer.appendChild(attachmentItem);
            });
            document.querySelector('.discord-content').appendChild(previewContainer);
        }

        // Render embeds
        embeds.forEach(embed => {
            if (embed.title.trim() || embed.description.trim() || embed.imageUrl || embed.thumbnailUrl) {
                const embedPreview = document.createElement('div');
                embedPreview.className = 'embed-preview';
                const embedColor = embed.color || '#5865F2';
                embedPreview.innerHTML = `
                    <div class="embed" style="border-left: 4px solid ${embedColor}">
                        ${embed.title.trim() ? `<div class="embed-title">${formatDiscordMarkdown(embed.title.trim(), 'title')}</div>` : ''}
                        ${embed.description.trim() ? `<div class="embed-description">${formatDiscordMarkdown(embed.description.trim(), 'description')}</div>` : ''}
                        ${embed.imageUrl ? `<div class="embed-image"><img src="${embed.imageUrl}" alt="Embed Image"></div>` : ''}
                        ${embed.thumbnailUrl && isValidImageUrl(embed.thumbnailUrl) ? `<div class="embed-thumbnail"><img src="${embed.thumbnailUrl}" alt="Embed Thumbnail"></div>` : ''}
                        ${embed.footer.trim() ? `<div class="embed-footer">${formatDiscordMarkdown(embed.footer.trim(), 'description')}</div>` : ''}
                    </div>
                `;
                document.querySelector('.discord-content').appendChild(embedPreview);
            }
        });
    }

    function formatDiscordMarkdown(text, context = 'description') {
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<s>$1</s>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        if (context === 'title') {
            // For embed titles, keep mentions as raw IDs
            return formattedText;
        } else {
            // For descriptions and other content, format mentions as resolved names
            return formattedText
                .replace(/<@!?(\d+)>/g, '<span class="discord-mention">@user</span>')
                .replace(/<#(\d+)>/g, '<span class="discord-mention">#channel</span>')
                .replace(/<@&(\d+)>/g, '<span class="discord-mention">@role</span>')
                .replace(/<a?:(\w+):(\d+)>/g, '<img class="discord-emoji" src="https://cdn.discordapp.com/emojis/$2.png" alt="$1">');
        }
    }

    function getRandomMessage() {
        if (!elements.randomMessages.checked) {
            return elements.messageContent.value.trim();
        }
        const messages = elements.messageContent.value.split('\n').filter(line => line.trim());
        return messages.length ? messages[Math.floor(Math.random() * messages.length)] : elements.messageContent.value;
    }

    function showHistoryModal() {
        elements.historyList.innerHTML = '';
        const history = JSON.parse(localStorage.getItem('webhookHistory') || '[]');
        
        if (history.length === 0) {
            elements.historyList.innerHTML = '<p>No history yet</p>';
            return;
        }

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `<span>${item.url.substring(0, 30)}...</span><i class="fas fa-arrow-right"></i>`;
            historyItem.addEventListener('click', () => {
                elements.webhookUrl.value = item.url;
                localStorage.setItem('webhookUrl', item.url);
                checkWebhookPrivacy(item.url);
                elements.historyModal.classList.add('hidden');
                showToast('Webhook URL loaded from history', 'success');
            });
            elements.historyList.appendChild(historyItem);
        });

        elements.historyModal.classList.remove('hidden');
    }

    function showMessageSuggestions() {
        const suggestions = [
            "Hello world! 👋",
            "This is a test message 🧪",
            "Webhook sender is awesome! 🚀",
            "Customize me! 🎨",
            `Random message: ${Math.random().toString(36).substring(7)}`,
            "New notification! 🔔",
            "Task completed! ✅",
            "Error detected! ❌",
            "Warning: Something happened ⚠️",
            "Information update ℹ️"
        ];
        
        const list = elements.suggestionsModal.querySelector('.suggestions-list');
        list.innerHTML = '';
        
        suggestions.forEach(msg => {
            const div = document.createElement('div');
            div.textContent = msg;
            div.addEventListener('click', () => {
                elements.messageContent.value = msg;
                updatePreview();
                elements.suggestionsModal.classList.add('hidden');
                showToast('Message suggestion applied', 'success');
            });
            list.appendChild(div);
        });
        
        elements.suggestionsModal.classList.remove('hidden');
    }

    function showFormatHelp() {
        elements.formatHelpModal.classList.remove('hidden');
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fas ${getToastIcon(type)}"></i><span>${message}</span>`;
        elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }

    function getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    function playSound(type) {
        if (!elements.enableSounds.checked) return;
        const sound = { 
            success: elements.successSound, 
            error: elements.errorSound, 
            notification: elements.notificationSound 
        }[type];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.error('Error playing sound:', e));
        }
    }

    function addLog(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        const iconClass = { 
            success: 'fa-check-circle', 
            error: 'fa-times-circle', 
            warning: 'fa-exclamation-circle' 
        }[type] || 'fa-info-circle';
        logEntry.innerHTML = `<i class="fas ${iconClass}"></i><span class="log-time">${timestamp}</span><span class="log-message">${message}</span>`;
        elements.logContainer.prepend(logEntry);
        elements.logContainer.scrollTop = 0;
        if (elements.logContainer.children.length > 100) {
            elements.logContainer.removeChild(elements.logContainer.lastChild);
        }
    }

    function updateStats() {
        elements.statTotal.textContent = stats.total;
        elements.statSuccess.textContent = stats.success;
        elements.statFailed.textContent = stats.failed;
        elements.statAvgTime.textContent = stats.responseTimes.length
            ? `${Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)}ms`
            : '0ms';
    }

    function saveStats() {
        localStorage.setItem('stats', JSON.stringify(stats));
    }

    function saveToHistory(url) {
        if (!url) return;
        let history = JSON.parse(localStorage.getItem('webhookHistory') || '[]');
        history = history.filter(item => item.url !== url);
        history.unshift({ url, lastUsed: new Date().toISOString() });
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem('webhookHistory', JSON.stringify(history));
    }

    async function startSending() {
        const webhookUrl = elements.webhookUrl.value.trim();
        const message = elements.messageContent.value.trim();
        const intervalValue = parseInt(elements.intervalValue.value);
        const intervalUnit = elements.intervalUnit.value.toLowerCase();
        let messageLimit = parseInt(elements.messageLimit.value);
        if (isNaN(messageLimit) || elements.messageLimit.value === '') {
            messageLimit = 0;
        }
        let sentCount = 1;

        if (!webhookUrl) {
            addLog('error', 'Please enter a valid Discord webhook URL');
            playSound('error');
            return;
        }
        if (!message && !embeds.some(embed => embed.title.trim() || embed.description.trim()) && attachments.length === 0) {
            addLog('error', 'Please enter a message, add an embed, or attach a file to send');
            playSound('error');
            return;
        }
        if (isNaN(intervalValue) || intervalValue <= 0) {
            addLog('error', 'Please enter a valid interval (greater than 0)');
            playSound('error');
            return;
        }

        stats.success = 0;
        stats.failed = 0;
        stats.responseTimes = [];
        updateStats();
        saveStats();

        let intervalMs = intervalValue * 1000;
        if (intervalUnit === 'minutes') intervalMs *= 60;
        else if (intervalUnit === 'hours') intervalMs *= 3600;
        if (intervalMs < 2000) {
            intervalMs = 2000;
            addLog('warning', 'Interval too short. Using minimum 2 seconds to avoid rate limits.');
        }

        saveToHistory(webhookUrl);

        // Helper for status update
        function updateStatusText() {
            const unitText = intervalValue === 1 ? intervalUnit.replace(/s$/, '') : intervalUnit;
            elements.statusText.textContent =
                `Sending every ${intervalValue} ${unitText}` +
                (messageLimit === 0 ? ' (Unlimited)' : messageLimit ? ` (${sentCount}/${messageLimit})` : '');
        }

        async function sendAndSchedule() {
            sentCount++;
            updateStatusText();
            if (!isNaN(messageLimit) && messageLimit !== 0 && sentCount > messageLimit) {
                stopSending();
                addLog('success', `Stopped after sending ${messageLimit} messages`);
                return;
            }
            intervalId = setTimeout(async () => {
                await sendMessage(webhookUrl, getRandomMessage());
                sendAndSchedule();
            }, intervalMs);
        }

        try {
            // Send first message
            await sendMessage(webhookUrl, getRandomMessage());
            updateStatusText();
            if (!isNaN(messageLimit) && messageLimit !== 0 && sentCount >= messageLimit) {
                stopSending();
                addLog('success', `Stopped after sending ${sentCount} messages`);
                return;
            }
            intervalId = setTimeout(async () => {
                await sendMessage(webhookUrl, getRandomMessage());
                sendAndSchedule();
            }, intervalMs);

            isSending = true;
            elements.startBtn.disabled = true;
            elements.stopBtn.disabled = false;
            elements.statusDot.classList.add('active');
            updateStatusText();
            addLog('success', `Started sending messages every ${intervalValue} ${intervalUnit}` + (messageLimit === 0 ? ' (unlimited)' : messageLimit ? ` for ${messageLimit} messages` : ''));
            playSound('success');
        } catch (error) {
            addLog('error', `Failed to start sending: ${error.message}`);
            playSound('error');
        }
    }

    function stopSending() {
        if (intervalId) clearTimeout(intervalId);
        intervalId = null;
        isSending = false;
        elements.startBtn.disabled = false;
        elements.stopBtn.disabled = true;
        elements.statusDot.classList.remove('active');
        elements.statusText.textContent = 'Ready';
        addLog('warning', 'Stopped sending messages');
        playSound('notification');
    }

    async function sendTestMessage() {
        const webhookUrl = elements.webhookUrl.value.trim();
        const message = elements.messageContent.value.trim();
        if (!webhookUrl) {
            addLog('error', 'Please enter a valid Discord webhook URL');
            playSound('error');
            return;
        }
        if (!message && !embeds.some(embed => embed.title.trim() || embed.description.trim()) && attachments.length === 0) {
            addLog('error', 'Please enter a message, add an embed, or attach a file to send');
            playSound('error');
            return;
        }
        saveToHistory(webhookUrl);
        sendMessage(webhookUrl, getRandomMessage());
    }

    async function sendMessage(webhookUrl, message, isScheduled = false) {
        const startTime = Date.now();
        const username = elements.username.value.trim() || 'Webhook Sender';
        const avatarUrl = elements.avatarUrl.value.trim() || 'https://cdn.discordapp.com/embed/avatars/0.png';
        
        // Validate webhook URL
        if (!webhookUrl.includes('discord.com/api/webhooks/')) {
            throw new Error('Invalid Discord webhook URL');
        }

        const embedsToSend = embeds
            .filter(embed => embed.title.trim() || embed.description.trim() || embed.imageUrl || embed.thumbnailUrl)
            .map(embed => ({
                title: embed.title.trim(),
                description: embed.description.trim(),
                color: parseInt(embed.color.substring(1), 16),
                footer: embed.footer.trim() ? { text: embed.footer.trim() } : undefined,
                image: embed.imageUrl ? { url: embed.imageUrl } : undefined,
                thumbnail: embed.thumbnailUrl ? { url: embed.thumbnailUrl } : undefined,
                timestamp: new Date().toISOString()
            }));

        // Create progress indicator with progress bar
        const progressToast = document.createElement('div');
        progressToast.className = 'toast toast-info';
        progressToast.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Uploading...</span>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: 0%"></div>
            </div>
        `;
        elements.toastContainer.appendChild(progressToast);
        progressToast.classList.add('show');

        try {
            if (attachments.length > 0) {
                const formData = new FormData();
                
                attachments.forEach((file, index) => {
                    formData.append(`file${index}`, file, file.name);
                });
                
                formData.append('payload_json', JSON.stringify({
                    allowed_mentions: { parse: ["users", "roles", "everyone"] },
                    content: message,
                    username,
                    avatar_url: avatarUrl,
                    embeds: embedsToSend.length > 0 ? embedsToSend : undefined
                }));

                const xhr = new XMLHttpRequest();
                xhr.open('POST', webhookUrl, true);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        progressToast.querySelector('.progress-bar-fill').style.width = `${percentComplete}%`;
                    }
                };

                xhr.onload = () => {
                    progressToast.remove();
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const responseTime = Date.now() - startTime;
                        stats.total++;
                        stats.success++;
                        stats.responseTimes.push(responseTime);
                        if (stats.responseTimes.length > 10) stats.responseTimes.shift();
                        updateStats();
                        saveStats();
                        addLog('success', `${isScheduled ? '[Scheduled] ' : ''}Message sent successfully (${responseTime}ms)`);
                        playSound('success');
                    } else {
                        let errorMessage = `HTTP error! Status: ${xhr.status}`;
                        if (xhr.status === 400) {
                            errorMessage = 'Invalid request. Check file format, number of attachments (max 10), or webhook URL.';
                        } else if (xhr.status === 401) {
                            errorMessage = 'Unauthorized. Invalid webhook URL or token.';
                        } else if (xhr.status === 404) {
                            errorMessage = 'Webhook not found. Check the URL.';
                        } else if (xhr.status === 413) {
                            errorMessage = `File size too large for Discord (max ${elements.fileSizeLimit.value || 8} MB).`;
                            showToast(
                                `Το αρχείο είναι πολύ μεγάλο! Μέγιστο επιτρεπτό μέγεθος για Discord: ${elements.fileSizeLimit.value || 8} MB`,
                                'error'
                            );
                            addLog('error', `File size too large for Discord (max ${elements.fileSizeLimit.value || 8} MB)`);
                        } else if (xhr.status === 429) {
                            errorMessage = 'Rate limit exceeded. Please try again later.';
                        }
                        throw new Error(errorMessage);
                    }
                };

                xhr.onerror = () => {
                    progressToast.remove();
                    throw new Error('Network error: Could not connect to the server.');
                };

                xhr.onabort = () => {
                    progressToast.remove();
                    throw new Error('Request aborted.');
                };

                xhr.send(formData);
            } else {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        allowed_mentions: { parse: ["users", "roles", "everyone"] },
                        content: message,
                        username,
                        avatar_url: avatarUrl,
                        embeds: embedsToSend.length > 0 ? embedsToSend : undefined
                    })
                });
                
                progressToast.remove();
                if (!response.ok) {
                    let errorMessage = `HTTP error! Status: ${response.status}`;
                    if (response.status === 400) {
                        errorMessage = 'Invalid request. Check message content or webhook URL.';
                    } else if (response.status === 401) {
                        errorMessage = 'Unauthorized. Invalid webhook URL or token.';
                    } else if (response.status === 404) {
                        errorMessage = 'Webhook not found. Check the URL.';
                    } else if (response.status === 429) {
                        errorMessage = 'Rate limit exceeded. Please try again later.';
                    }
                    throw new Error(errorMessage);
                }
                
                const responseTime = Date.now() - startTime;
                stats.total++;
                stats.success++;
                stats.responseTimes.push(responseTime);
                if (stats.responseTimes.length > 10) stats.responseTimes.shift();
                updateStats();
                saveStats();
                addLog('success', `${isScheduled ? '[Scheduled] ' : ''}Message sent successfully (${responseTime}ms)`);
                playSound('success');
            }
        } catch (error) {
            progressToast.remove();
            stats.total++;
            stats.failed++;
            updateStats();
            saveStats();
            addLog('error', `${isScheduled ? '[Scheduled] ' : ''}Failed to send message: ${error.message}`);
            playSound('error');
        }
    }

    function resetStatistics() {
        console.log('resetStatistics called');
        if (confirm('Are you sure you want to reset ALL settings and data? This cannot be undone!')) {
            console.log('Calling updateMessageLimitPlaceholder');
            stopSending();
            
            // Reset input fields
            elements.webhookUrl.value = '';
            elements.messageContent.value = '';
            elements.intervalValue.value = '10';
            elements.intervalUnit.value = 'seconds';
            elements.messageLimit.value = ''; // Set to empty for 'Unlimited'
            elements.username.value = '';
            elements.avatarUrl.value = '';
            elements.randomMessages.checked = false;
            elements.embedImageUrl.value = '';
            elements.embedThumbnailUrl.value = '';
            elements.messageAttachments.value = '';
            elements.messageAttachmentsPreview.innerHTML = '';
            elements.fileSizeLimit.value = '8'; // Reset to Level 1 default
            attachments = [];
            
            // Reset embeds
            embeds = [{ title: '', description: '', color: '#5865F2', footer: '' }];
            embedCount = 1;
            renderEmbeds();
            
            // Reset preview
            elements.previewText.textContent = 'Your message will appear here...';
            elements.previewUsername.textContent = 'Webhook Sender';
            elements.previewAvatar.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            
            // Reset stats
            stats = { total: 0, success: 0, failed: 0, responseTimes: [] };
            updateStats();
            
            // Clear logs
            elements.logContainer.innerHTML = '';
            
            // Clear localStorage
            localStorage.removeItem('webhookUrl');
            localStorage.removeItem('messageContent');
            localStorage.removeItem('username');
            localStorage.removeItem('avatarUrl');
            localStorage.removeItem('randomMessages');
            localStorage.removeItem('stats');
            localStorage.removeItem('embeds');
            localStorage.removeItem('layout');
            localStorage.removeItem('embedImageUrl');
            localStorage.removeItem('embedThumbnailUrl');
            localStorage.removeItem('fileSizeLimit');
            localStorage.removeItem('logs');
            
            // Update UI
            elements.statusText.textContent = 'Ready';
            elements.statusDot.classList.remove('active');
            
            addLog('warning', 'Reset all settings and data');
            playSound('notification');
            
            loadLayout();
            updateMessageLimitPlaceholder();
        }
    }

    function clearLogs() {
        if (confirm('Are you sure you want to clear all logs?')) {
            elements.logContainer.innerHTML = '';
            localStorage.removeItem('logs');
            addLog('warning', 'Cleared all logs');
        }
    }

    function exportLogsAsJson() {
        const exportData = {
            metadata: {
                app: "Webhook Sender PRO",
                version: "3.0",
                exportDate: new Date().toISOString()
            },
            settings: {
                webhookUrl: elements.webhookUrl.value,
                messageContent: elements.messageContent.value,
                username: elements.username.value,
                avatarUrl: elements.avatarUrl.value,
                randomMessages: elements.randomMessages.checked,
                interval: {
                    value: elements.intervalValue.value,
                    unit: elements.intervalUnit.value
                },
                messageLimit: elements.messageLimit.value === '' ? 'Unlimited' : elements.messageLimit.value,
                enableSounds: elements.enableSounds.checked,
                embeds: embeds,
                fileSizeLimit: elements.fileSizeLimit.value
            },
            statistics: {
                totalMessages: stats.total,
                successful: stats.success,
                failed: stats.failed,
                averageResponseTime: stats.responseTimes.length 
                    ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
                    : 0
            },
            logs: Array.from(elements.logContainer.querySelectorAll('.log-entry')).map(log => ({
                time: log.querySelector('.log-time').textContent,
                message: log.querySelector('.log-message').textContent,
                type: log.classList.contains('log-success') ? 'success' : 
                      log.classList.contains('log-error') ? 'error' : 'warning'
            }))
        };

        const fileName = `webhook-sender-export-${new Date().toISOString().slice(0, 10)}.json`;
        downloadFile(JSON.stringify(exportData, null, 2), fileName, 'application/json');
        localStorage.setItem('logs', JSON.stringify(exportData.logs));
        addLog('success', 'Exported application data as JSON');
        playSound('success');
    }

    function exportLogsAsScreenshot() {
        html2canvas(elements.logContainer, {
            backgroundColor: getComputedStyle(document.body).getPropertyValue('--card-color'),
            scale: 2
        }).then(canvas => {
            const url = canvas.toDataURL('image/png');
            downloadFile(url, `webhook-logs-${new Date().toISOString().slice(0, 10)}.png`, 'image/png', true);
            addLog('success', 'Exported logs as screenshot');
            playSound('success');
        });
    }

    function importLogsFromJson() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    importJsonData(jsonData);
                } catch (err) {
                    addLog('error', `Failed to parse JSON: ${err.message}`);
                    playSound('error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    function importJsonData(jsonData) {
        try {
            stopSending();

            // Import settings
            if (jsonData.settings) {
                elements.webhookUrl.value = jsonData.settings.webhookUrl || '';
                elements.messageContent.value = jsonData.settings.messageContent || '';
                elements.username.value = jsonData.settings.username || '';
                elements.avatarUrl.value = jsonData.settings.avatarUrl || '';
                elements.randomMessages.checked = jsonData.settings.randomMessages || false;
                elements.enableSounds.checked = jsonData.settings.enableSounds !== false;
                
                // Import embeds
                if (jsonData.settings.embeds && Array.isArray(jsonData.settings.embeds)) {
                    embeds = jsonData.settings.embeds;
                    embedCount = embeds.length;
                    renderEmbeds();
                } else {
                    embeds = [{ title: '', description: '', color: '#5865F2', footer: '' }];
                    embedCount = 1;
                    renderEmbeds();
                }
                
                // Import interval settings
                if (jsonData.settings.interval) {
                    elements.intervalValue.value = jsonData.settings.interval.value || '10';
                    elements.intervalUnit.value = jsonData.settings.interval.unit || 'seconds';
                }
                
                elements.messageLimit.value = jsonData.settings.messageLimit === 'Unlimited' ? '' : jsonData.settings.messageLimit || '';
                elements.fileSizeLimit.value = jsonData.settings.fileSizeLimit || '8';
                
                updatePreview();
            }
            
            // Import statistics
            if (jsonData.statistics) {
                stats = {
                    total: jsonData.statistics.totalMessages || 0,
                    success: jsonData.statistics.successful || 0,
                    failed: jsonData.statistics.failed || 0,
                    responseTimes: jsonData.statistics.responseTimes || []
                };
                updateStats();
            }
            
            // Import and render logs
            if (jsonData.logs && Array.isArray(jsonData.logs)) {
                elements.logContainer.innerHTML = '';
                jsonData.logs.forEach(log => {
                    addLog(log.type || 'info', log.message || 'Imported log');
                });
            }
            
            // Save settings to localStorage
            localStorage.setItem('webhookUrl', elements.webhookUrl.value);
            localStorage.setItem('messageContent', elements.messageContent.value);
            localStorage.setItem('username', elements.username.value);
            localStorage.setItem('avatarUrl', elements.avatarUrl.value);
            localStorage.setItem('randomMessages', elements.randomMessages.checked);
            localStorage.setItem('stats', JSON.stringify(stats));
            localStorage.setItem('soundsEnabled', elements.enableSounds.checked);
            localStorage.setItem('embeds', JSON.stringify(embeds));
            localStorage.setItem('fileSizeLimit', elements.fileSizeLimit.value);
            localStorage.setItem('logs', JSON.stringify(jsonData.logs || []));
            
            loadLayout();
            updateMessageLimitPlaceholder();
            addLog('success', 'Successfully imported settings and data from JSON');
            playSound('success');
        } catch (error) {
            addLog('error', `Failed to import data: ${error.message}`);
            playSound('error');
        }
    }

    function downloadFile(content, fileName, type, isUrl = false) {
        const a = document.createElement('a');
        a.href = isUrl ? content : URL.createObjectURL(new Blob([content], { type }));
        a.download = fileName;
        a.click();
        if (!isUrl) URL.revokeObjectURL(a.href);
    }

    // --- SUPABASE JS ---
    const SUPABASE_URL = 'https://trxxmujjyjtmpewwthdk.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyeHhtdWpqeWp0bXBld3d0aGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDkyMjgsImV4cCI6MjA2MzUyNTIyOH0.5_Pl0wZikbRPBfdsCNt6Xczt2e2a8B1t-hkbKDR8HaA';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // === Elements ===
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    const fetchJsonBtn = document.getElementById('fetch-json-btn');
    const exportCloudBtn = document.getElementById('export-json-cloud');
    const importCloudBtn = document.getElementById('import-json-cloud');

    // === Login with Discord ===
    loginBtn.addEventListener('click', async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'discord' });
        if (error) {
            console.error('Login failed:', error.message);
            addLog('error', `Login failed: ${error.message}`);
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        userInfo.textContent = 'Not logged in';
        addLog('success', 'Logged out successfully');
        playSound('notification');
    });

    // === Check user session on load ===
    async function checkUserSession() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                if (error.name === 'AuthSessionMissingError') {
                    userInfo.textContent = 'Not logged in';
                } else {
                    console.error('Error checking user session:', error.message);
                    addLog('error', `Error checking user session: ${error.message}`);
                }
                return;
            }
            userInfo.textContent = user ? `Logged in as ${user.email || user.id}` : 'Not logged in';
        } catch (e) {
            console.error('Unexpected error in checkUserSession:', e.message);
            addLog('error', `Unexpected error checking session: ${e.message}`);
        }
    }

    // === Export JSON to Supabase Cloud ===
    exportCloudBtn.addEventListener('click', async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            alert('❌ You must be logged in!');
            addLog('error', 'Export failed: User not logged in');
            return;
        }

        const exportData = {
            metadata: {
                app: "Webhook Sender PRO",
                version: "3.0",
                exportDate: new Date().toISOString()
            },
            settings: {
                webhookUrl: elements.webhookUrl.value,
                messageContent: elements.messageContent.value,
                username: elements.username.value,
                avatarUrl: elements.avatarUrl.value,
                randomMessages: elements.randomMessages.checked,
                interval: {
                    value: elements.intervalValue.value,
                    unit: elements.intervalUnit.value
                },
                messageLimit: elements.messageLimit.value === '' ? 'Unlimited' : elements.messageLimit.value,
                enableSounds: elements.enableSounds.checked,
                embeds: embeds,
                fileSizeLimit: elements.fileSizeLimit.value
            },
            statistics: {
                totalMessages: stats.total,
                successful: stats.success,
                failed: stats.failed,
                averageResponseTime: stats.responseTimes.length 
                    ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
                    : 0
            },
            logs: Array.from(elements.logContainer.querySelectorAll('.log-entry')).map(log => ({
                time: log.querySelector('.log-time').textContent,
                message: log.querySelector('.log-message').textContent,
                type: log.classList.contains('log-success') ? 'success' : 
                      log.classList.contains('log-error') ? 'error' : 'warning'
            }))
        };

        const { error } = await supabase
            .from('user_jsons')
            .upsert({ user_id: user.id, data: exportData }, { onConflict: 'user_id' });

        if (error) {
            console.error('Upload error:', error.message);
            alert('❌ Upload failed.');
            addLog('error', `Upload failed: ${error.message}`);
        } else {
            localStorage.setItem('logs', JSON.stringify(exportData.logs));
            alert('✅ Logs saved to cloud!');
            addLog('success', 'Exported application data to cloud');
            playSound('success');
        }
    });

    // === Import JSON from Supabase Cloud ===
    importCloudBtn.addEventListener('click', async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            alert('❌ You must be logged in!');
            addLog('error', 'Import failed: User not logged in');
            return;
        }

        const { data, error } = await supabase
            .from('user_jsons')
            .select('data')
            .eq('user_id', user.id)
            .single();

        if (error || !data?.data) {
            console.error('Fetch error:', error?.message);
            alert('❌ Failed to load data.');
            addLog('error', `Failed to load data: ${error?.message || 'No data found'}`);
            return;
        }

        try {
            importJsonData(data.data);
            alert('✅ Logs imported from cloud!');
            addLog('success', 'Imported application data from cloud');
        } catch (e) {
            console.error('Invalid JSON:', e);
            alert('❌ Invalid cloud data.');
            addLog('error', `Invalid cloud data: ${e.message}`);
        }
    });

    // === Handle OAuth redirect ===
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
        (async () => {
            try {
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    console.error('Error checking session:', sessionError.message);
                    addLog('error', `Session check failed: ${sessionError.message}`);
                    return;
                }

                if (!sessionData.session) {
                    const { data, error } = await supabase.auth.exchangeCodeForSession({ code });
                    if (error) {
                        console.error('Error exchanging code:', error.message);
                        addLog('error', `OAuth exchange failed: ${error.message}`);
                        return;
                    }
                    console.log('OAuth session established:', data);
                    userInfo.textContent = `Logged in as ${data.user.email || data.user.id}`;
                    addLog('success', 'Successfully logged in via OAuth');
                    playSound('success');
                }
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {
                console.error('Unexpected error in OAuth handling:', e.message);
                addLog('error', `OAuth error: ${e.message}`);
            }
        })();
    } else {
        checkUserSession();
    }


// === Profile Management ===
const MAX_PROFILES = 10;

// Save current configuration as a profile
elements.saveProfileBtn.addEventListener('click', async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        alert('❌ You must be logged in to save profiles!');
        addLog('error', 'Profile save failed: User not logged in');
        return;
    }

    // Check how many profiles the user already has
    const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (count >= MAX_PROFILES) {
        alert(`❌ You've reached the maximum of ${MAX_PROFILES} saved profiles. Please delete one first.`);
        addLog('error', `Profile save failed: Maximum of ${MAX_PROFILES} profiles reached`);
        return;
    }

    const profileName = prompt('Enter a name for this profile:');
    if (!profileName) return;

    const profileData = {
        webhookUrl: elements.webhookUrl.value,
        messageContent: elements.messageContent.value,
        username: elements.username.value,
        avatarUrl: elements.avatarUrl.value,
        randomMessages: elements.randomMessages.checked,
        interval: {
            value: elements.intervalValue.value,
            unit: elements.intervalUnit.value
        },
        messageLimit: elements.messageLimit.value === '' ? 'Unlimited' : elements.messageLimit.value,
        enableSounds: elements.enableSounds.checked,
        embeds: embeds,
        fileSizeLimit: elements.fileSizeLimit.value
    };

    const { error } = await supabase
        .from('user_profiles')
        .insert({
            user_id: user.id,
            name: profileName,
            data: profileData
            // last_updated will be automatically set by the default value
        });

    if (error) {
        console.error('Profile save error:', error.message);
        alert('❌ Failed to save profile.');
        addLog('error', `Profile save failed: ${error.message}`);
    } else {
        alert('✅ Profile saved successfully!');
        addLog('success', `Profile "${profileName}" saved to cloud`);
        playSound('success');
    }
});

// Update the manageProfilesBtn event listener to handle null cases
elements.manageProfilesBtn.addEventListener('click', async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        alert('❌ You must be logged in to manage profiles!');
        addLog('error', 'Profile management failed: User not logged in');
        return;
    }

    try {
        const { data: profiles, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .order('last_updated', { ascending: false });
        
        if (error) throw error;
        
        // Ensure we always pass an array to renderProfilesList
        renderProfilesList(profiles || []);
        elements.profilesModal.classList.remove('hidden');
    } catch (error) {
        console.error('Profile fetch error:', error.message);
        alert('❌ Failed to load profiles.');
        addLog('error', `Profile load failed: ${error.message}`);
        // Still open modal but show empty state
        renderProfilesList([]);
        elements.profilesModal.classList.remove('hidden');
    }
});
function renderProfilesList(profiles) {
    const profilesList = document.getElementById('profiles-list');
    const noProfilesMsg = document.getElementById('no-profiles-message');
    
    profilesList.innerHTML = '';
    
    // Handle null/undefined or empty array cases
    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
        noProfilesMsg.style.display = 'block';
        return;
    }
    
    noProfilesMsg.style.display = 'none';
    
    profiles.forEach(profile => {
        const profileItem = document.createElement('div');
        profileItem.className = 'profile-item';
        
        const date = new Date(profile.last_updated || profile.created_at || new Date());
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        profileItem.innerHTML = `
            <div class="profile-info">
                <div class="profile-name">${profile.name || 'Unnamed Profile'}</div>
                <div class="profile-date">${formattedDate}</div>
            </div>
            <div class="profile-actions">
                <button class="btn-icon-small load-profile" data-profile-id="${profile.id}">
                    <i class="fas fa-download" title="Load Profile"></i>
                </button>
                <button class="btn-icon-small delete-profile" data-profile-id="${profile.id}">
                    <i class="fas fa-trash" title="Delete Profile"></i>
                </button>
            </div>
        `;
        
        profilesList.appendChild(profileItem);
        
        // Add event listeners
        profileItem.querySelector('.load-profile').addEventListener('click', () => loadProfile(profile));
        profileItem.querySelector('.delete-profile').addEventListener('click', () => deleteProfile(profile.id));
    });
}

async function loadProfile(profile) {
    if (!confirm(`Load profile "${profile.name}"? This will overwrite your current settings.`)) {
        return;
    }
    
    try {
        // Stop any active sending
        stopSending();
        
        // Load profile data
        const profileData = profile.data;
        
        // Update UI elements
        elements.webhookUrl.value = profileData.webhookUrl || '';
        elements.messageContent.value = profileData.messageContent || '';
        elements.username.value = profileData.username || '';
        elements.avatarUrl.value = profileData.avatarUrl || '';
        elements.randomMessages.checked = profileData.randomMessages || false;
        elements.enableSounds.checked = profileData.enableSounds !== false;
        
        // Update interval settings
        if (profileData.interval) {
            elements.intervalValue.value = profileData.interval.value || '10';
            elements.intervalUnit.value = profileData.interval.unit || 'seconds';
        }
        
        elements.messageLimit.value = profileData.messageLimit === 'Unlimited' ? '' : profileData.messageLimit || '';
        elements.fileSizeLimit.value = profileData.fileSizeLimit || '8';
        
        // Update embeds
        if (profileData.embeds && Array.isArray(profileData.embeds)) {
            embeds = profileData.embeds;
            embedCount = embeds.length;
            renderEmbeds();
        } else {
            embeds = [{ title: '', description: '', color: '#5865F2', footer: '' }];
            embedCount = 1;
            renderEmbeds();
        }
        
        // Update preview
        updatePreview();
        
        // Save to localStorage
        localStorage.setItem('webhookUrl', elements.webhookUrl.value);
        localStorage.setItem('messageContent', elements.messageContent.value);
        localStorage.setItem('username', elements.username.value);
        localStorage.setItem('avatarUrl', elements.avatarUrl.value);
        localStorage.setItem('randomMessages', elements.randomMessages.checked);
        localStorage.setItem('enableSounds', elements.enableSounds.checked);
        localStorage.setItem('embeds', JSON.stringify(embeds));
        localStorage.setItem('fileSizeLimit', elements.fileSizeLimit.value);
        
        // Close modal
        elements.profilesModal.classList.add('hidden');
        
        addLog('success', `Profile "${profile.name}" loaded successfully`);
        playSound('success');
        showToast(`Profile "${profile.name}" loaded`, 'success');
    } catch (error) {
        addLog('error', `Failed to load profile: ${error.message}`);
        playSound('error');
    }
}

async function deleteProfile(profileId) {
    if (!confirm('Are you sure you want to delete this profile? This cannot be undone.')) {
        return;
    }
    
    const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profileId);
    
    if (error) {
        console.error('Profile delete error:', error.message);
        alert('❌ Failed to delete profile.');
        addLog('error', `Profile delete failed: ${error.message}`);
        return;
    }
    
    // Refresh the profiles list
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profiles, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .order('last_updated', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        // Make sure profiles is an array even if empty
        renderProfilesList(profiles || []);
        addLog('warning', 'Profile deleted successfully');
        playSound('notification');
    } catch (e) {
        console.error('Error refreshing profiles:', e.message);
        addLog('error', `Error refreshing profiles: ${e.message}`);
    }
}
// Στο init:
const userAuthMenu = document.getElementById('user-auth-menu');
const avatarMenuBtn = document.getElementById('avatar-menu-btn');
const userAvatar = document.getElementById('user-avatar');
const userUsername = document.getElementById('user-username');

// Προαιρετικό: κρύβεις τα παλιά auth κουμπιά/section αν υπάρχουν
const oldAuthSection = document.getElementById('auth-section');
if (oldAuthSection) oldAuthSection.style.display = "none";

// 1. Login handler
loginBtn.addEventListener('click', async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'discord' });
  // Redirect handled by Supabase/Discord
});

// 2. Logout handler
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  updateAuthUI(null);
});

// 3. Check user session on page load
checkUserSession();

// 4. Supabase session change (live update)
supabase.auth.onAuthStateChange((event, session) => {
  updateAuthUI(session?.user);
});

// === Core functions ===
async function checkUserSession() {
  const { data: { user } } = await supabase.auth.getUser();
  updateAuthUI(user);
}

function updateAuthUI(user) {
  const userAuthMenu = document.getElementById('user-auth-menu');
  const userAvatar = document.getElementById('user-avatar');
  const userUsername = document.getElementById('user-username');
  const loginBtn = document.querySelector('#user-auth-menu #login-btn');
  const logoutBtn = document.querySelector('#user-auth-menu #logout-btn');

  if (user && user.user_metadata) {
    // User is logged in
    userAuthMenu.classList.add('user-logged-in');
    
    // Set avatar
    let avatarUrl = user.user_metadata.avatar_url || 
                   (user.user_metadata.avatar ? 
                    `https://cdn.discordapp.com/avatars/${user.id}/${user.user_metadata.avatar}.png` : 
                    'https://cdn.discordapp.com/embed/avatars/0.png');
    userAvatar.src = avatarUrl;
    
    // Set username
    userUsername.textContent = user.user_metadata.full_name || 
                              user.user_metadata.username || 
                              'Discord User';
    userUsername.style.color = 'var(--primary-color)';
  } else {
    // Guest user
    userAuthMenu.classList.remove('user-logged-in');
    userAvatar.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
    userUsername.textContent = 'Guest User';
    userUsername.style.color = 'var(--text-secondary)';
  }
}

// Dropdown ανοίγει με hover/click (εξαρτάται πώς το έχεις, εδώ με hover είναι το default)

    checkUserSession();
    initApp();
    loadLayout();
});