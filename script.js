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
        loginBtn: document.getElementById('login-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        userInfo: document.getElementById('user-info'),
        fetchJsonBtn: document.getElementById('fetch-json-btn'),
        exportCloudBtn: document.getElementById('export-json-cloud'),
        importCloudBtn: document.getElementById('import-json-cloud'),
        configNameInput: document.getElementById('config-name'),
        saveConfigBtn: document.getElementById('save-config-btn'),
        loadConfigBtn: document.getElementById('load-config-btn'),
        deleteConfigBtn: document.getElementById('delete-config-btn'),
        configSelector: document.getElementById('config-selector')
    };

    // Validate DOM elements
    const missingElements = Object.entries(elements).filter(([key, value]) => !value).map(([key]) => key);
    if (missingElements.length) {
        console.error('Missing DOM elements:', missingElements);
        addLog('error', `Initialization failed: Missing DOM elements (${missingElements.join(', ')})`);
        return;
    }

    // Variables
    let intervalId = null;
    let isSending = false;
    let stats = { total: 0, success: 0, failed: 0, responseTimes: [] };
    let embeds = [];
    let embedCount = 1;
    let attachments = [];
    let eventListeners = [];

    // Supabase setup
    const SUPABASE_URL = 'https://trxxmujjyjtmpewwthdk.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyeHhtdWpqeWp0bXBld3d0aGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDkyMjgsImV4cCI6MjA2MzUyNTIyOH0.5_Pl0wZikbRPBfdsCNt6Xczt2e2a8B1t-hkbKDR8HaA';
    let supabase = null;
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error('Supabase library not loaded');
        addLog('error', 'Supabase initialization failed: Library not loaded');
    }

    // Utility: Debounce function
    function debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Utility: Validate image URL
    function isValidImageUrl(url) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url);
    }

    // Utility: Validate file type
    function isValidFileType(file) {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'video/mp4', 'video/webm',
            'application/pdf', 'text/plain',
            'application/zip', 'application/x-rar-compressed'
        ];
        return allowedTypes.includes(file.type);
    }

    // Update message limit placeholder
    function updateMessageLimitPlaceholder() {
        const value = elements.messageLimit.value;
        elements.messageLimit.placeholder = value === '0' || value === '' ? '∞' : 'Unlimited';
        if (value === '0') elements.messageLimit.value = '';
        elements.statusText.textContent = value && value !== '0' ? `Ready (${value}/${value})` : 'Ready';
    }

    // Initialize app
    function initApp() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        document.querySelectorAll('.theme-preview').forEach(preview => {
            preview.classList.toggle('active', preview.dataset.theme === savedTheme);
        });

        // Load saved settings
        ['webhookUrl', 'messageContent', 'username', 'avatarUrl', 'randomMessages', 'embedImageUrl', 'embedThumbnailUrl', 'fileSizeLimit']
            .forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    if (key === 'randomMessages') {
                        elements[key].checked = value === 'true';
                    } else if (key === 'fileSizeLimit') {
                        elements[key].value = value || '8';
                    } else {
                        elements[key].value = value;
                    }
                }
            });

        // Load embeds
        const savedEmbeds = localStorage.getItem('embeds');
        if (savedEmbeds) {
            try {
                embeds = JSON.parse(savedEmbeds);
                embedCount = embeds.length;
                renderEmbeds();
            } catch (e) {
                console.error('Error parsing saved embeds:', e);
                addLog('error', 'Failed to load embeds from storage');
            }
        } else {
            embeds = [{ title: '', description: '', color: '#5865F2', footer: '' }];
            renderEmbeds();
        }

        // Load stats
        const savedStats = localStorage.getItem('stats');
        if (savedStats) {
            try {
                stats = JSON.parse(savedStats);
                updateStats();
            } catch (e) {
                console.error('Error parsing saved stats:', e);
                addLog('error', 'Failed to load stats from storage');
            }
        }

        // Load sounds preference
        elements.enableSounds.checked = localStorage.getItem('soundsEnabled') !== 'false';

        // Initialize preview
        updatePreview();
        if (elements.avatarUrl.value) elements.previewAvatar.src = elements.avatarUrl.value;

        // Setup dropdown
        setupDropdown();

        // Setup event listeners
        cleanupEventListeners();
        setupEventListeners();
        setupEmbedEventListeners();
        handleFileUploads();

        updateMessageLimitPlaceholder();
    }

    // Setup dropdown for file size limit
    function setupDropdown() {
        const selectedOption = document.querySelector('.selected-option');
        if (selectedOption) {
            selectedOption.onclick = () => {
                const opts = document.querySelector('.options-list');
                opts.style.display = opts.style.display === 'block' ? 'none' : 'block';
            };
        }

        document.querySelectorAll('.option').forEach(opt => {
            opt.onclick = () => {
                const value = opt.dataset.value;
                const text = opt.innerText.trim();
                const icon = opt.querySelector('.option-icon').src;
                elements.fileSizeLimit.value = value;
                document.getElementById('selected-level-text').textContent = text;
                document.getElementById('selected-level-icon').src = icon;
                document.querySelector('.options-list').style.display = 'none';
                localStorage.setItem('fileSizeLimit', value);
            };
        });

        document.addEventListener('click', e => {
            if (!document.getElementById('file-size-custom-select').contains(e.target)) {
                document.querySelector('.options-list').style.display = 'none';
            }
        }, { once: false });
    }

    // Cleanup event listeners
    function cleanupEventListeners() {
        eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        eventListeners = [];
    }

    // Setup event listeners
    function setupEventListeners() {
        const addListener = (element, event, handler) => {
            element.addEventListener(event, handler);
            eventListeners.push({ element, event, handler });
        };

        // Theme selection
        addListener(elements.themeCarousel, 'click', e => {
            const themePreview = e.target.closest('.theme-preview');
            if (!themePreview) return;
            const theme = themePreview.dataset.theme;
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            document.querySelectorAll('.theme-preview').forEach(el => el.classList.remove('active'));
            themePreview.classList.add('active');
            showToast(`Theme changed to ${theme}`, 'success');
        });

        // Webhook URL visibility toggle
        addListener(elements.toggleVisibility, 'click', () => {
            const type = elements.webhookUrl.type === 'password' ? 'text' : 'password';
            elements.webhookUrl.type = type;
            elements.toggleVisibility.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
        });

        // Input changes with debouncing
        const debouncedUpdatePreview = debounce(updatePreview, 300);
        ['webhookUrl', 'messageContent', 'username', 'avatarUrl', 'embedImageUrl', 'embedThumbnailUrl'].forEach(key => {
            addListener(elements[key], 'input', () => {
                localStorage.setItem(key, elements[key].value);
                if (key === 'webhookUrl') checkWebhookPrivacy(elements[key].value);
                debouncedUpdatePreview();
            });
        });

        addListener(elements.randomMessages, 'change', () => {
            localStorage.setItem('randomMessages', elements.randomMessages.checked);
        });

        addListener(elements.enableSounds, 'change', () => {
            localStorage.setItem('soundsEnabled', elements.enableSounds.checked);
        });

        addListener(elements.fileSizeLimit, 'change', e => {
            localStorage.setItem('fileSizeLimit', e.target.value);
        });

        // Interval controls
        addListener(elements.intervalUnit, 'change', updateIntervalDisplay);
        addListener(elements.intervalValue, 'input', updateIntervalDisplay);

        // Message limit input
        addListener(elements.messageLimit, 'input', () => {
            updateMessageLimitPlaceholder();
        });

        // Increment/Decrement buttons
        document.querySelectorAll('.interval-btn').forEach(btn => {
            addListener(btn, 'click', () => {
                const action = btn.getAttribute('data-action');
                const input = btn.closest('.input-with-buttons').querySelector('input');
                let value = parseInt(input.value) || (input.id === 'message-limit' ? 0 : 10);
                if (input.id === 'message-limit' && input.value === '') value = 0;
                if (action === 'increment') {
                    input.value = value + 1;
                } else if (action === 'decrement' && value > 0) {
                    input.value = value - 1;
                    if (input.id === 'message-limit' && input.value === '0') {
                        input.value = '';
                    }
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });

        // Auto-select text on input focus
        document.querySelectorAll('.input-with-buttons input').forEach(input => {
            addListener(input, 'focus', () => input.select());
        });

        // Buttons
        addListener(elements.startBtn, 'click', startSending);
        addListener(elements.stopBtn, 'click', stopSending);
        addListener(elements.testBtn, 'click', sendTestMessage);
        addListener(elements.resetStats, 'click', resetStatistics);
        addListener(elements.clearLogs, 'click', clearLogs);
        addListener(elements.historyBtn, 'click', showHistoryModal);
        addListener(elements.suggestMessage, 'click', showMessageSuggestions);
        addListener(elements.formatHelp, 'click', showFormatHelp);

        // Export/Import
        addListener(elements.exportJsonMenu, 'click', exportLogsAsJson);
        addListener(elements.exportScreenshotMenu, 'click', exportLogsAsScreenshot);
        addListener(elements.importJsonMenu, 'click', importLogsFromJson);

        // Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            addListener(btn, 'click', () => btn.closest('.modal').classList.add('hidden'));
        });

        addListener(window, 'click', e => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });

        // Supabase auth
        addListener(elements.loginBtn, 'click', async () => {
            if (!supabase) {
                addLog('error', 'Supabase not initialized');
                return;
            }
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'discord' });
            if (error) {
                console.error('Login failed:', error);
                addLog('error', `Login failed: ${error.message}`);
            }
        });

        addListener(elements.logoutBtn, 'click', async () => {
            if (!supabase) {
                addLog('error', 'Supabase not initialized');
                return;
            }
            await supabase.auth.signOut();
            elements.userInfo.textContent = 'Not logged in';
            addLog('success', 'Logged out successfully');
            playSound('notification');
        });

        addListener(elements.exportCloudBtn, 'click', exportToCloud);
        addListener(elements.importCloudBtn, 'click', importFromCloud);

        // Config management
        addListener(elements.saveConfigBtn, 'click', saveConfig);
        addListener(elements.loadConfigBtn, 'click', loadConfig);
        addListener(elements.deleteConfigBtn, 'click', deleteConfig);
    }

    // Handle file uploads
    function handleFileUploads() {
        elements.messageAttachments.addEventListener('change', e => {
            let newFiles = Array.from(e.target.files);
            const maxFileSizeMB = parseInt(elements.fileSizeLimit.value) || 8;
            const maxAttachments = 10;

            // Validate files
            let validFiles = [];
            newFiles.forEach(file => {
                const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
                if (file.size > maxFileSizeMB * 1024 * 1024) {
                    addLog('error', `Attachment '${file.name}' exceeds size limit (${fileSizeMB} MB > ${maxFileSizeMB} MB)`);
                    showToast(`Attachment '${file.name}' exceeds size limit (${fileSizeMB} MB / ${maxFileSizeMB} MB)`, 'error');
                } else if (!isValidFileType(file)) {
                    addLog('error', `Attachment '${file.name}' has unsupported file type (${file.type})`);
                    showToast(`Unsupported file type for '${file.name}'`, 'error');
                } else {
                    validFiles.push(file);
                    addLog('success', `Attachment '${file.name}' uploaded (${fileSizeMB} MB)`);
                }
            });

            if (validFiles.length > maxAttachments) {
                addLog('warning', `Too many attachments (${validFiles.length}). Limited to ${maxAttachments}.`);
                validFiles = validFiles.slice(0, maxAttachments);
            }

            attachments = validFiles;
            const dataTransfer = new DataTransfer();
            attachments.forEach(file => dataTransfer.items.add(file));
            elements.messageAttachments.files = dataTransfer.files;

            renderAttachmentsPreview();
            updatePreview();

            if (attachments.length === 0) {
                elements.messageAttachments.value = '';
            }
        });
    }

    // Render attachments preview
    function renderAttachmentsPreview() {
        elements.messageAttachmentsPreview.innerHTML = '';
        attachments.forEach((file, i) => {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
            const fileId = `${file.name}_${file.size}`;
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

            previewElement.querySelector('.remove-attachment').addEventListener('click', e => {
                e.stopPropagation();
                const fileId = e.currentTarget.getAttribute('data-fid');
                attachments = attachments.filter(f => `${f.name}_${f.size}` !== fileId);
                const dataTransfer = new DataTransfer();
                attachments.forEach(file => dataTransfer.items.add(file));
                elements.messageAttachments.files = dataTransfer.files;
                renderAttachmentsPreview();
                updatePreview();
                if (attachments.length === 0) {
                    elements.messageAttachments.value = '';
                }
            });
        });
    }

    // Setup embed event listeners
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
            elements.embedContent.style.maxHeight = isExpanded
                ? (window.innerWidth < 768 ? '300px' : embedCount > 1 ? '500px' : 'none')
                : '0';
        });
    }

    // Render embeds
    function renderEmbeds() {
        elements.embedList.innerHTML = '';
        embeds.forEach((embed, index) => {
            embed.index = index;
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

            const inputs = {
                title: embedItem.querySelector(`#embed-title-${index}`),
                description: embedItem.querySelector(`#embed-description-${index}`),
                color: embedItem.querySelector(`#embed-color-${index}`),
                footer: embedItem.querySelector(`#embed-footer-${index}`),
                imageUrl: embedItem.querySelector(`#embed-image-url-${index}`),
                thumbnailUrl: embedItem.querySelector(`#embed-thumbnail-url-${index}`)
            };

            Object.entries(inputs).forEach(([key, input]) => {
                input.addEventListener('input', () => {
                    embeds[index][key] = input.value;
                    localStorage.setItem('embeds', JSON.stringify(embeds));
                    updatePreview();
                });
            });

            const deleteBtn = embedItem.querySelector('.delete-embed-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (index > 0) {
                        embeds.splice(index, 1);
                        embedCount--;
                        localStorage.setItem('embeds', JSON.stringify(embeds));
                        renderEmbeds();
                        updatePreview();
                        showToast('Embed deleted', 'success');
                    }
                });
            }
        });
    }

    // Load layout
    function loadLayout() {
        const defaultLayout = ["settings", "preview", "stats", "controls", "logs"];
        const savedLayout = localStorage.getItem('layout');
        const container = document.querySelector('.app-content');
        if (!container) {
            console.error('Error: .app-content container not found');
            addLog('error', 'Failed to load layout: App content container missing');
            return;
        }

        let layout = defaultLayout;
        if (savedLayout) {
            try {
                const parsedLayout = JSON.parse(savedLayout);
                if (Array.isArray(parsedLayout) && parsedLayout.length === defaultLayout.length &&
                    defaultLayout.every(card => parsedLayout.includes(card))) {
                    layout = parsedLayout;
                }
            } catch (e) {
                console.error('Error parsing saved layout:', e);
            }
        }

        const cardElements = {};
        layout.forEach(card => {
            const el = document.querySelector(`[data-card="${card}"]`);
            if (el) cardElements[card] = el;
        });

        if (Object.keys(cardElements).length !== defaultLayout.length) {
            console.error('Missing card elements:', defaultLayout.filter(card => !cardElements[card]));
            addLog('error', 'Failed to load layout: One or more card elements missing');
            defaultLayout.forEach(card => {
                const el = document.querySelector(`[data-card="${card}"]`);
                if (el && !container.contains(el)) container.appendChild(el);
            });
            return;
        }

        layout.forEach(card => {
            const el = cardElements[card];
            if (el && !container.contains(el)) container.appendChild(el);
        });
    }

    // Update interval display
    function updateIntervalDisplay() {
        const value = parseInt(elements.intervalValue.value) || 10;
        const unit = elements.intervalUnit.value;
        const symbolMap = { seconds: 's', minutes: 'm', hours: 'h' };
        elements.intervalDisplay.textContent = `${value} ${symbolMap[unit] || ''}`;
    }

    // Check webhook privacy
    function checkWebhookPrivacy(url) {
        const isPublic = url.includes('discord.com/api/webhooks/') && !url.includes('localhost');
        const isSecure = url.startsWith('https://');
        elements.webhookWarning.classList.toggle('hidden', !isPublic && isSecure);
        if (!isSecure) {
            addLog('warning', 'Insecure webhook URL detected. Use HTTPS for security.');
        }
    }

    // Update preview
    function updatePreview() {
        let messageContent = elements.messageContent.value || 'Your message will appear here...';
        messageContent = formatDiscordMarkdown(messageContent, 'description');
        elements.previewText.innerHTML = messageContent;
        elements.previewUsername.textContent = elements.username.value || 'Webhook Sender';
        elements.previewAvatar.src = elements.avatarUrl.value || 'https://cdn.discordapp.com/embed/avatars/0.png';

        document.querySelectorAll('.embed-preview').forEach(preview => preview.remove());
        const attachmentsPreview = document.querySelector('.preview-attachments');
        if (attachmentsPreview) attachmentsPreview.remove();

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
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-file';
                    attachmentItem.appendChild(icon);
                }
                const info = document.createElement('div');
                info.className = 'attachment-info';
                const name = document.createElement('span');
                name.style.color = '#4d73fa';
                name.textContent = file.name;
                info.appendChild(name);
                const size = document.createElement('span');
                size.style.color = '#b9bbbe';
                size.textContent = `(${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                info.appendChild(size);
                attachmentItem.appendChild(info);
                previewContainer.appendChild(attachmentItem);
            });
            document.querySelector('.discord-content').appendChild(previewContainer);
        }

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

    // Format Discord markdown
    function formatDiscordMarkdown(text, context = 'description') {
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<s>$1</s>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        if (context === 'title') {
            return formattedText;
        }
        return formattedText
            .replace(/<@!?(\d+)>/g, '<span class="discord-mention">@user</span>')
            .replace(/<#(\d+)>/g, '<span class="discord-mention">#channel</span>')
            .replace(/<@&(\d+)>/g, '<span class="discord-mention">@role</span>')
            .replace(/<a?:(\w+):(\d+)>/g, '<img class="discord-emoji" src="https://cdn.discordapp.com/emojis/$2.png" alt="$1">');
    }

    // Get random message
    function getRandomMessage() {
        if (!elements.randomMessages.checked) return elements.messageContent.value.trim();
        const messages = elements.messageContent.value.split('\n').filter(line => line.trim());
        return messages.length ? messages[Math.floor(Math.random() * messages.length)] : elements.messageContent.value;
    }

    // Show history modal
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

    // Show message suggestions
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

    // Show format help
    function showFormatHelp() {
        elements.formatHelpModal.classList.remove('hidden');
    }

    // Show toast notification
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

    // Get toast icon
    function getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Play sound
    function playSound(type) {
        if (!elements.enableSounds.checked) return;
        const sound = {
            success: elements.successSound,
            error: elements.errorSound,
            notification: elements.notificationSound
        }[type];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.error('Error playing sound:', e);
                addLog('error', `Failed to play ${type} sound: ${e.message}`);
            });
        }
    }

    // Add log entry
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

        // Archive logs to localStorage
        const logs = JSON.parse(localStorage.getItem('logs') || '[]');
        logs.unshift({ time: timestamp, message, type });
        if (logs.length > 100) {
            logs.pop();
            elements.logContainer.removeChild(elements.logContainer.lastChild);
        }
        localStorage.setItem('logs', JSON.stringify(logs));
    }

    // Update stats
    function updateStats() {
        elements.statTotal.textContent = stats.total;
        elements.statSuccess.textContent = stats.success;
        elements.statFailed.textContent = stats.failed;
        elements.statAvgTime.textContent = stats.responseTimes.length
            ? `${Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)}ms`
            : '0ms';
    }

    // Save stats
    function saveStats() {
        localStorage.setItem('stats', JSON.stringify(stats));
    }

    // Save to history
    function saveToHistory(url) {
        if (!url) return;
        let history = JSON.parse(localStorage.getItem('webhookHistory') || '[]');
        history = history.filter(item => item.url !== url);
        history.unshift({ url, lastUsed: new Date().toISOString() });
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem('webhookHistory', JSON.stringify(history));
    }

    // Start sending messages
    async function startSending() {
        const webhookUrl = elements.webhookUrl.value.trim();
        const message = elements.messageContent.value.trim();
        const intervalValue = parseInt(elements.intervalValue.value);
        const intervalUnit = elements.intervalUnit.value.toLowerCase();
        let messageLimit = parseInt(elements.messageLimit.value) || 0;
        if (elements.messageLimit.value === '') messageLimit = 0;
        let sentCount = 1;

        if (!webhookUrl) {
            addLog('error', 'Please enter a valid Discord webhook URL');
            playSound('error');
            return;
        }
        if (!message && !embeds.some(embed => embed.title.trim() || embed.description.trim()) && attachments.length === 0) {
            addLog('error', 'Please enter a message, add an embed, or attach a file');
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

        function updateStatusText() {
            const unitText = intervalValue === 1 ? intervalUnit.replace(/s$/, '') : intervalUnit;
            elements.statusText.textContent =
                `Sending every ${intervalValue} ${unitText}` +
                (messageLimit === 0 ? ' (Unlimited)' : ` (${sentCount}/${messageLimit})`);
        }

        async function sendAndSchedule() {
            sentCount++;
            updateStatusText();
            if (messageLimit !== 0 && sentCount > messageLimit) {
                stopSending();
                addLog('success', `Stopped after sending ${messageLimit} messages`);
                return;
            }
            intervalId = setTimeout(async () => {
                await sendMessage(webhookUrl, getRandomMessage(), true);
                sendAndSchedule();
            }, intervalMs);
        }

        try {
            await sendMessage(webhookUrl, getRandomMessage());
            updateStatusText();
            if (messageLimit !== 0 && sentCount >= messageLimit) {
                stopSending();
                addLog('success', `Stopped after sending ${sentCount} messages`);
                return;
            }
            intervalId = setTimeout(async () => {
                await sendMessage(webhookUrl, getRandomMessage(), true);
                sendAndSchedule();
            }, intervalMs);

            isSending = true;
            elements.startBtn.disabled = true;
            elements.stopBtn.disabled = false;
            elements.statusDot.classList.add('active');
            addLog('success', `Started sending messages every ${intervalValue} ${intervalUnit}${messageLimit === 0 ? ' (unlimited)' : ` for ${messageLimit} messages`}`);
            playSound('success');
        } catch (error) {
            addLog('error', `Failed to start sending: ${error.message}`);
            playSound('error');
        }
    }

    // Stop sending messages
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

    // Send test message
    async function sendTestMessage() {
        const webhookUrl = elements.webhookUrl.value.trim();
        const message = elements.messageContent.value.trim();
        if (!webhookUrl) {
            addLog('error', 'Please enter a valid Discord webhook URL');
            playSound('error');
            return;
        }
        if (!message && !embeds.some(embed => embed.title.trim() || embed.description.trim()) && attachments.length === 0) {
            addLog('error', 'Please enter a message, add an embed, or attach a file');
            playSound('error');
            return;
        }
        saveToHistory(webhookUrl);
        await sendMessage(webhookUrl, getRandomMessage());
    }

    // Send message with retry for rate limits
    async function sendMessage(webhookUrl, message, isScheduled = false, retryCount = 0) {
        const startTime = Date.now();
        const username = elements.username.value.trim() || 'Webhook Sender';
        const avatarUrl = elements.avatarUrl.value.trim() || 'https://cdn.discordapp.com/embed/avatars/0.png';

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

        const progressToast = document.createElement('div');
        progressToast.className = 'toast toast-info';
        progressToast.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>${attachments.length > 0 ? 'Uploading...' : 'Sending...'}</span>
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

                xhr.upload.onprogress = event => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        progressToast.querySelector('.progress-bar-fill').style.width = `${percentComplete}%`;
                    }
                };

                return await new Promise((resolve, reject) => {
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
                            resolve();
                        } else {
                            let errorMessage = `HTTP error! Status: ${xhr.status}`;
                            if (xhr.status === 400) errorMessage = 'Invalid request. Check file format or webhook URL.';
                            else if (xhr.status === 401) errorMessage = 'Unauthorized. Invalid webhook URL or token.';
                            else if (xhr.status === 404) errorMessage = 'Webhook not found. Check the URL.';
                            else if (xhr.status === 413) errorMessage = `File size too large (max ${elements.fileSizeLimit.value || 8} MB).`;
                            else if (xhr.status === 429 && retryCount < 3) {
                                const retryAfter = parseInt(xhr.getResponseHeader('Retry-After') || '5') * 1000;
                                addLog('warning', `Rate limit hit. Retrying after ${retryAfter / 1000}s...`);
                                setTimeout(() => sendMessage(webhookUrl, message, isScheduled, retryCount + 1), retryAfter);
                                return;
                            }
                            reject(new Error(errorMessage));
                        }
                    };

                    xhr.onerror = () => {
                        progressToast.remove();
                        reject(new Error('Network error: Could not connect to the server.'));
                    };

                    xhr.onabort = () => {
                        progressToast.remove();
                        reject(new Error('Request aborted.'));
                    };

                    xhr.send(formData);
                });
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
                    if (response.status === 400) errorMessage = 'Invalid request. Check message content or webhook URL.';
                    else if (response.status === 401) errorMessage = 'Unauthorized. Invalid webhook URL or token.';
                    else if (response.status === 404) errorMessage = 'Webhook not found. Check the URL.';
                    else if (response.status === 429 && retryCount < 3) {
                        const retryAfter = parseInt(response.headers.get('Retry-After') || '5') * 1000;
                        addLog('warning', `Rate limit hit. Retrying after ${retryAfter / 1000}s...`);
                        setTimeout(() => sendMessage(webhookUrl, message, isScheduled, retryCount + 1), retryAfter);
                        return;
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
            throw error;
        }
    }

    // Reset statistics
    function resetStatistics() {
        if (!confirm('Are you sure you want to reset ALL settings and data? This cannot be undone!')) return;
        stopSending();
        elements.webhookUrl.value = '';
        elements.messageContent.value = '';
        elements.intervalValue.value = '10';
        elements.intervalUnit.value = 'seconds';
        elements.messageLimit.value = '';
        elements.username.value = '';
        elements.avatarUrl.value = '';
        elements.randomMessages.checked = false;
        elements.embedImageUrl.value = '';
        elements.embedThumbnailUrl.value = '';
        elements.messageAttachments.value = '';
        elements.messageAttachmentsPreview.innerHTML = '';
        elements.fileSizeLimit.value = '8';
        attachments = [];
        embeds = [{ title: '', description: '', color: '#5865F2', footer: '' }];
        embedCount = 1;
        renderEmbeds();
        elements.previewText.textContent = 'Your message will appear here...';
        elements.previewUsername.textContent = 'Webhook Sender';
        elements.previewAvatar.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
        stats = { total: 0, success: 0, failed: 0, responseTimes: [] };
        updateStats();
        elements.logContainer.innerHTML = '';
        localStorage.clear();
        elements.statusText.textContent = 'Ready';
        elements.statusDot.classList.remove('active');
        addLog('warning', 'Reset all settings and data');
        playSound('notification');
        loadLayout();
        updateMessageLimitPlaceholder();
    }

    // Clear logs
    function clearLogs() {
        if (!confirm('Are you sure you want to clear all logs?')) return;
        elements.logContainer.innerHTML = '';
        localStorage.removeItem('logs');
        addLog('warning', 'Cleared all logs');
    }

    // Export logs as JSON
    function exportLogsAsJson() {
        const exportData = createFullExport();
        const fileName = `webhook-sender-export-${new Date().toISOString().slice(0, 10)}.json`;
        downloadFile(JSON.stringify(exportData, null, 2), fileName, 'application/json');
        localStorage.setItem('logs', JSON.stringify(exportData.logs));
        addLog('success', 'Exported application data as JSON');
        playSound('success');
    }

    // Export logs as screenshot
    function exportLogsAsScreenshot() {
        if (!window.html2canvas) {
            addLog('error', 'Screenshot export failed: html2canvas library not loaded');
            return;
        }
        html2canvas(elements.logContainer, {
            backgroundColor: getComputedStyle(document.body).getPropertyValue('--card-color'),
            scale: 2
        }).then(canvas => {
            const url = canvas.toDataURL('image/png');
            downloadFile(url, `webhook-logs-${new Date().toISOString().slice(0, 10)}.png`, 'image/png', true);
            addLog('success', 'Exported logs as screenshot');
            playSound('success');
        }).catch(e => {
            console.error('Screenshot export failed:', e);
            addLog('error', `Screenshot export failed: ${e.message}`);
        });
    }

    // Import logs from JSON
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
                    addLog('success', 'Imported application data from JSON');
                    playSound('success');
                } catch (err) {
                    addLog('error', `Failed to parse JSON: ${err.message}`);
                    playSound('error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Import JSON data
    function importJsonData(jsonData) {
        stopSending();
        if (jsonData.settings) {
            elements.webhookUrl.value = jsonData.settings.webhookUrl || '';
            elements.messageContent.value = jsonData.settings.messageContent || '';
            elements.username.value = jsonData.settings.username || '';
            elements.avatarUrl.value = jsonData.settings.avatarUrl || '';
            elements.randomMessages.checked = jsonData.settings.randomMessages || false;
            elements.enableSounds.checked = jsonData.settings.enableSounds !== false;
            if (jsonData.settings.embeds && Array.isArray(jsonData.settings.embeds)) {
                embeds = jsonData.settings.embeds;
                embedCount = embeds.length;
                renderEmbeds();
            }
            if (jsonData.settings.interval) {
                elements.intervalValue.value = jsonData.settings.interval.value || '10';
                elements.intervalUnit.value = jsonData.settings.interval.unit || 'seconds';
            }
            elements.messageLimit.value = jsonData.settings.messageLimit === 'Unlimited' ? '' : jsonData.settings.messageLimit || '';
            elements.fileSizeLimit.value = jsonData.settings.fileSizeLimit || '8';
            updatePreview();
        }
        if (jsonData.statistics) {
            stats = {
                total: jsonData.statistics.totalMessages || 0,
                success: jsonData.statistics.successful || 0,
                failed: jsonData.statistics.failed || 0,
                responseTimes: jsonData.statistics.responseTimes || []
            };
            updateStats();
        }
        if (jsonData.logs && Array.isArray(jsonData.logs)) {
            elements.logContainer.innerHTML = '';
            jsonData.logs.forEach(log => addLog(log.type || 'info', log.message || 'Imported log'));
            localStorage.setItem('logs', JSON.stringify(jsonData.logs));
        }
        localStorage.setItem('webhookUrl', elements.webhookUrl.value);
        localStorage.setItem('messageContent', elements.messageContent.value);
        localStorage.setItem('username', elements.username.value);
        localStorage.setItem('avatarUrl', elements.avatarUrl.value);
        localStorage.setItem('randomMessages', elements.randomMessages.checked);
        localStorage.setItem('stats', JSON.stringify(stats));
        localStorage.setItem('soundsEnabled', elements.enableSounds.checked);
        localStorage.setItem('embeds', JSON.stringify(embeds));
        localStorage.setItem('fileSizeLimit', elements.fileSizeLimit.value);
        loadLayout();
        updateMessageLimitPlaceholder();
    }

    // Download file
    function downloadFile(content, fileName, type, isUrl = false) {
        const a = document.createElement('a');
        a.href = isUrl ? content : URL.createObjectURL(new Blob([content], { type }));
        a.download = fileName;
        a.click();
        if (!isUrl) URL.revokeObjectURL(a.href);
    }

    // Export to Supabase cloud
    async function exportToCloud() {
        if (!supabase) {
            addLog('error', 'Supabase not initialized');
            return;
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            alert('❌ You must be logged in!');
            addLog('error', 'Export failed: User not logged in');
            return;
        }

        const exportData = createFullExport();
        const { error } = await supabase
        .from('user_jsons')
        .upsert({ user_id: user.id, name: configName, data: exportData }, { onConflict: ['user_id', 'name'] });


        if (error) {
            console.error('Upload error:', error);
            alert('❌ Upload failed.');
            addLog('error', `Upload failed: ${error.message}`);
        } else {
            localStorage.setItem('logs', JSON.stringify(exportData.logs));
            alert('✅ Logs saved to cloud!');
            addLog('success', 'Exported application data to cloud');
            playSound('success');
        }
    }

    // Import from Supabase cloud
    async function importFromCloud() {
        if (!supabase) {
            addLog('error', 'Supabase not initialized');
            return;
        }
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
        .eq('name', selectedName)
        .single();


        if (error || !data?.data) {
            console.error('Fetch error:', error);
            alert('❌ Failed to load data.');
            addLog('error', `Failed to load data: ${error?.message || 'No data found'}`);
            return;
        }

        importJsonData(data.data);
        alert('✅ Logs imported from cloud!');
        addLog('success', 'Imported application data from cloud');
    }

    // Create full export
    function createFullExport() {
        return {
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
            statistics: stats,
            logs: Array.from(elements.logContainer.querySelectorAll('.log-entry')).map(log => ({
                time: log.querySelector('.log-time').textContent,
                message: log.querySelector('.log-message').textContent,
                type: log.classList.contains('log-success') ? 'success' :
                    log.classList.contains('log-error') ? 'error' : 'warning'
            }))
        };
    }

    // Refresh config list
    async function refreshConfigList() {
        if (!supabase) {
            addLog('error', 'Supabase not initialized');
            return;
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

    const { data, error } = await supabase
    .from('user_jsons')
    .select('name')
    .eq('user_id', user.id)
    .neq('name', null); // μόνο αυτά που έχουν όνομα (configs)


        elements.configSelector.innerHTML = `<option value="">-- No configs available --</option>`;
        if (data && data.length) {
            elements.configSelector.innerHTML = `<option value="">-- Select a config --</option>`;
            data.forEach(cfg => {
                const opt = document.createElement('option');
                opt.value = cfg.name;
                opt.textContent = cfg.name;
                elements.configSelector.appendChild(opt);
            });
        }
        if (error) {
            console.error('Error fetching configs:', error);
            addLog('error', `Failed to fetch configs: ${error.message}`);
        }
    }

    // Save config
    async function saveConfig() {
        const configName = elements.configNameInput.value.trim();
        if (!configName) {
            alert('❗ Please enter a config name');
            return;
        }
        if (!supabase) {
            addLog('error', 'Supabase not initialized');
            return;
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            alert('❌ You must be logged in!');
            addLog('error', 'Save failed: User not logged in');
            return;
        }

        const exportData = {
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
        .from('user_jsons')
        .upsert({ user_id: user.id, name: configName, data: exportData }, { onConflict: ['user_id', 'name'] });


        if (error) {
            alert('❌ Failed to save config');
            addLog('error', `Save failed: ${error.message}`);
        } else {
            alert('✅ Config saved!');
            addLog('success', `Saved config "${configName}"`);
            refreshConfigList();
        }
    }

    // Load config
    async function loadConfig() {
        const selectedName = elements.configSelector.value;
        if (!selectedName) return;
        if (!supabase) {
            addLog('error', 'Supabase not initialized');
            return;
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            alert('❌ You must be logged in!');
            addLog('error', 'Load failed: User not logged in');
            return;
        }

        const { data, error } = await supabase
        .from('user_jsons')
        .select('data')
        .eq('user_id', user.id)
        .eq('name', selectedName)
        .single();


        if (error || !data?.data) {
            alert('❌ Failed to load config');
            addLog('error', `Load failed: ${error?.message || 'No data'}`);
            return;
        }

        importJsonData({ settings: data.data });
        alert(`✅ Loaded "${selectedName}"`);
        addLog('success', `Loaded config "${selectedName}"`);
    }

    // Delete config
    async function deleteConfig() {
        const selectedName = elements.configSelector.value;
        if (!selectedName) return;
        if (!confirm(`Are you sure you want to delete "${selectedName}"?`)) return;
        if (!supabase) {
            addLog('error', 'Supabase not initialized');
            return;
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            alert('❌ You must be logged in!');
            addLog('error', 'Delete failed: User not logged in');
            return;
        }

        const { error } = await supabase
        .from('user_jsons')
        .delete()
        .eq('user_id', user.id)
        .eq('name', selectedName);


        if (error) {
            alert('❌ Failed to delete config');
            addLog('error', `Delete failed: ${error.message}`);
        } else {
            alert(`🗑 Config "${selectedName}" deleted`);
            addLog('success', `Deleted config "${selectedName}"`);
            refreshConfigList();
        }
    }

    // Check user session
    async function checkUserSession() {
        if (!supabase) {
            addLog('error', 'Supabase not initialized');
            return;
        }
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                if (error.name === 'AuthSessionMissingError') {
                    elements.userInfo.textContent = 'Not logged in';
                } else {
                    console.error('Error checking user session:', error);
                    addLog('error', `Session check failed: ${error.message}`);
                }
                return;
            }
            elements.userInfo.textContent = user ? `Logged in as ${user.email || user.id}` : 'Not logged in';
            refreshConfigList();
        } catch (e) {
            console.error('Unexpected error in checkUserSession:', e);
            addLog('error', `Unexpected error checking session: ${e.message}`);
        }
    }

    // Handle OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
        (async () => {
            if (!supabase) {
                addLog('error', 'Supabase not initialized');
                return;
            }
            try {
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    console.error('Error checking session:', sessionError);
                    addLog('error', `Session check failed: ${sessionError.message}`);
                    return;
                }

                if (!sessionData.session) {
                    const { data, error } = await supabase.auth.exchangeCodeForSession({ code });
                    if (error) {
                        console.error('Error exchanging code:', error);
                        addLog('error', `OAuth exchange failed: ${error.message}`);
                        return;
                    }
                    elements.userInfo.textContent = `Logged in as ${data.user.email || data.user.id}`;
                    addLog('success', 'Successfully logged in via OAuth');
                    playSound('success');
                }
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {
                console.error('Unexpected error in OAuth handling:', e);
                addLog('error', `OAuth error: ${e.message}`);
            }
        })();
    }

    // Initialize app
    checkUserSession();
    initApp();
    loadLayout();
});