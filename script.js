document.addEventListener('DOMContentLoaded', () => {
    // Custom Modal Functions
    const showCustomPrompt = (message, title = 'Prompt', defaultValue = '') => {
        return new Promise((resolve) => {
            const modal = getElement('custom-prompt-modal');
            const input = getElement('custom-prompt-input');
            const messageEl = getElement('custom-prompt-message');
            const titleEl = getElement('custom-prompt-title');
            const confirmBtn = getElement('custom-prompt-confirm');
            const cancelBtn = getElement('custom-prompt-cancel');
            const closeBtn = modal.querySelector('.close-modal');

            messageEl.textContent = message;
            titleEl.textContent = title;
            input.value = defaultValue;
            modal.classList.remove('hidden');

            const closeModal = () => {
                modal.classList.add('hidden');
                input.value = '';
                resolve(null);
            };

            const handleConfirm = () => {
                const value = input.value.trim();
                modal.classList.add('hidden');
                input.value = '';
                resolve(value || null);
            };

            const handleKeyPress = (e) => {
                if (e.key === 'Enter') handleConfirm();
                if (e.key === 'Escape') closeModal();
            };

            confirmBtn.addEventListener('click', handleConfirm, { once: true });
            cancelBtn.addEventListener('click', closeModal, { once: true });
            closeBtn.addEventListener('click', closeModal, { once: true });
            input.addEventListener('keypress', handleKeyPress);

            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            }, { once: true });

            input.focus();
        });
    };

    const showCustomConfirm = (message, title = 'Confirm') => {
        return new Promise((resolve) => {
            const modal = getElement('custom-confirm-modal');
            const messageEl = getElement('custom-confirm-message');
            const titleEl = getElement('custom-confirm-title');
            const yesBtn = getElement('custom-confirm-yes');
            const noBtn = getElement('custom-confirm-no');
            const closeBtn = modal.querySelector('.close-modal');

            messageEl.textContent = message;
            titleEl.textContent = title;
            modal.classList.remove('hidden');

            const closeModal = () => {
                modal.classList.add('hidden');
                resolve(false);
            };

            const handleYes = () => {
                modal.classList.add('hidden');
                resolve(true);
            };

            yesBtn.addEventListener('click', handleYes, { once: true });
            noBtn.addEventListener('click', closeModal, { once: true });
            closeBtn.addEventListener('click', closeModal, { once: true });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            }, { once: true });
        });
    };

    const showCustomAlert = (message, title = 'Alert') => {
        return new Promise((resolve) => {
            const modal = getElement('custom-alert-modal');
            const messageEl = getElement('custom-alert-message');
            const titleEl = getElement('custom-alert-title');
            const okBtn = getElement('custom-alert-ok');
            const closeBtn = modal.querySelector('.close-modal');

            messageEl.textContent = message;
            titleEl.textContent = title;
            modal.classList.remove('hidden');

            const closeModal = () => {
                modal.classList.add('hidden');
                resolve();
            };

            okBtn.addEventListener('click', closeModal, { once: true });
            closeBtn.addEventListener('click', closeModal, { once: true });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            }, { once: true });
        });
    };

    // Utility Functions
    const getElement = (id) => {
        const el = document.getElementById(id);
        if (!el) console.warn(`Element with ID ${id} not found`);
        return el;
    };

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // DOM Elements
    const elements = {
        webhookUrl: getElement('webhook-url'),
        messageContent: getElement('message-content'),
        intervalValue: getElement('interval-value'),
        intervalDisplay: getElement('interval-display'),
        intervalUnit: getElement('interval-unit'),
        messageLimit: getElement('message-limit'),
        startBtn: getElement('start-btn'),
        stopBtn: getElement('stop-btn'),
        testBtn: getElement('test-btn'),
        statusText: getElement('status-text'),
        statusDot: document.querySelector('.status-dot'),
        logContainer: getElement('log-container'),
        toggleVisibility: getElement('toggle-visibility'),
        webhookWarning: getElement('webhook-warning'),
        historyBtn: getElement('history-btn'),
        username: getElement('username'),
        avatarUrl: getElement('avatar-url'),
        randomMessages: getElement('random-messages'),
        statTotal: getElement('stat-total'),
        statSuccess: getElement('stat-success'),
        statFailed: getElement('stat-failed'),
        statAvgTime: getElement('stat-avg-time'),
        resetStats: getElement('reset-stats'),
        enableSounds: getElement('enable-sounds'),
        clearLogs: getElement('clear-logs'),
        previewAvatar: getElement('preview-avatar'),
        previewUsername: getElement('preview-username'),
        previewText: getElement('preview-text'),
        historyModal: getElement('history-modal'),
        historyList: getElement('history-list'),
        successSound: getElement('success-sound'),
        errorSound: getElement('error-sound'),
        notificationSound: getElement('notification-sound'),
        exportJsonMenu: getElement('export-json-menu'),
        exportScreenshotMenu: getElement('export-screenshot-menu'),
        importJsonMenu: getElement('import-json-menu'),
        exportJsonCloud: getElement('export-json-cloud'),
        suggestMessage: getElement('suggest-message'),
        formatHelp: getElement('format-help'),
        suggestionsModal: getElement('suggestions-modal'),
        formatHelpModal: getElement('format-help-modal'),
        toastContainer: getElement('toast-container'),
        themeCarousel: document.querySelector('.theme-carousel'),
        embedList: getElement('embed-list'),
        addEmbedBtn: getElement('add-embed-btn'),
        embedContent: getElement('embed-content'),
        embedToggleBtn: getElement('embed-toggle-btn'),
        messageAttachments: getElement('message-attachments'),
        messageAttachmentsPreview: getElement('message-attachments-preview'),
        embedImageUrl: getElement('embed-image-url'),
        embedThumbnailUrl: getElement('embed-thumbnail-url'),
        manageProfilesBtn: getElement('manage-profiles-btn'),
        profilesModal: getElement('profiles-modal'),
        profilesList: getElement('profiles-list'),
        noProfilesMessage: getElement('no-profiles-message'),
        loginBtn: getElement('login-btn'),
        logoutBtn: getElement('logout-btn'),
        userAvatar: getElement('user-avatar'),
        userUsername: getElement('user-username'),
        avatarMenuBtn: getElement('avatar-menu-btn')
    };

    // Variables
    let intervalId = null;
    let isSending = false;
    let stats = { total: 0, success: 0, failed: 0, responseTimes: [] };
    let embeds = [];
    let embedCount = 1;
    let attachments = [];

    // Supabase Configuration
    const SUPABASE_URL = 'https://trxxmujjyjtmpewwthdk.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyeHhtdWpqeWp0bXBld3d0aGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDkyMjgsImV4cCI6MjA2MzUyNTIyOH0.5_Pl0wZikbRPBfdsCNt6Xczt2e2a8B1t-hkbKDR8HaA';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Utility Functions
    const isValidImageUrl = (url) => /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url);

    const saveToLocalStorage = (key, value) => localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);

    const updateMessageLimitPlaceholder = () => {
        const value = elements.messageLimit.value;
        elements.messageLimit.placeholder = value === '' || value === '0' ? '∞' : 'Unlimited';
        elements.statusText.textContent = value && value !== '0' ? `Ready (${value}/${value})` : 'Ready';
    };

    const updateIntervalDisplay = () => {
        const value = elements.intervalValue.value;
        const unit = elements.intervalUnit.value;
        const symbolMap = { seconds: 's', minutes: 'm', hours: 'h' };
        elements.intervalDisplay.textContent = `${value} ${symbolMap[unit] || ''}`;
    };

    const checkWebhookPrivacy = (url) => {
        if (elements.webhookWarning) {
            elements.webhookWarning.classList.toggle('hidden', !url.includes('discord.com/api/webhooks/') || url.includes('localhost'));
        }
    };

    const addLog = (type, message) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        const iconClass = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle' }[type] || 'fa-info-circle';
        logEntry.innerHTML = `<i class="fas ${iconClass}"></i><span class="log-time">${timestamp}</span><span class="log-message">${message}</span>`;
        elements.logContainer.prepend(logEntry);
        elements.logContainer.scrollTop = 0;
        if (elements.logContainer.children.length > 100) {
            elements.logContainer.removeChild(elements.logContainer.lastChild);
        }
    };

    const playSound = (type) => {
        if (!elements.enableSounds.checked) return;
        const sound = { success: elements.successSound, error: elements.errorSound, notification: elements.notificationSound }[type];
        if (sound) sound.play().catch(e => console.error('Sound error:', e));
    };

    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fas fa-${{ success: 'check-circle', error: 'times-circle', warning: 'exclamation-circle', info: 'info-circle' }[type] || 'info-circle'}"></i><span>${message}</span>`;
        elements.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    };

    const formatDiscordMarkdown = (text, context = 'description') => {
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<s>$1</s>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        if (context !== 'title') {
            formatted = formatted
                .replace(/<@!?(\d+)>/g, '<span class="discord-mention">@user</span>')
                .replace(/<#(\d+)>/g, '<span class="discord-mention">#channel</span>')
                .replace(/<@&(\d+)>/g, '<span class="discord-mention">@role</span>')
                .replace(/<a?:(\w+):(\d+)>/g, '<img class="discord-emoji" src="https://cdn.discordapp.com/emojis/$2.png" alt="$1">');
        }
        return formatted;
    };

    const updatePreview = debounce(() => {
        elements.previewText.innerHTML = elements.messageContent.value ? formatDiscordMarkdown(elements.messageContent.value) : 'Your message will appear here...';
        elements.previewUsername.textContent = elements.username.value || 'Webhook Sender';
        elements.previewAvatar.src = elements.avatarUrl.value || 'https://cdn.discordapp.com/embed/avatars/0.png';

        document.querySelectorAll('.embed-preview, .preview-attachments').forEach(el => el.remove());

        if (attachments.length) {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-attachments';
            previewContainer.style.cssText = 'display: flex; gap: 15px; flex-wrap: wrap;';
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
                if (!file.type.startsWith('image/')) {
                    info.innerHTML = `<i class="fas fa-file"></i>`;
                }
                info.innerHTML += `<span style="color: #4d73fa">${file.name}</span><span style="color: #b9bbbe">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>`;
                attachmentItem.appendChild(info);
                previewContainer.appendChild(attachmentItem);
            });
            document.querySelector('.discord-content')?.appendChild(previewContainer);
        }

        embeds.forEach(embed => {
            if (embed.title.trim() || embed.description.trim() || embed.imageUrl || embed.thumbnailUrl) {
                const embedPreview = document.createElement('div');
                embedPreview.className = 'embed-preview';
                embedPreview.innerHTML = `
                    <div class="embed" style="border-left: 4px solid ${embed.color || '#5865F2'}">
                        ${embed.title.trim() ? `<div class="embed-title">${formatDiscordMarkdown(embed.title.trim(), 'title')}</div>` : ''}
                        ${embed.description.trim() ? `<div class="embed-description">${formatDiscordMarkdown(embed.description.trim())}</div>` : ''}
                        ${embed.imageUrl ? `<div class="embed-image"><img src="${embed.imageUrl}" alt="Embed Image"></div>` : ''}
                        ${embed.thumbnailUrl && isValidImageUrl(embed.thumbnailUrl) ? `<div class="embed-thumbnail"><img src="${embed.thumbnailUrl}" alt="Embed Thumbnail"></div>` : ''}
                        ${embed.footer.trim() ? `<div class="embed-footer">${formatDiscordMarkdown(embed.footer.trim())}</div>` : ''}
                    </div>`;
                document.querySelector('.discord-content')?.appendChild(embedPreview);
            }
        });
    }, 300);

    // Collapsible Sections
    const setupAdvancedCollapse = () => {
        const advToggle = getElement('advanced-toggle-btn');
        const advSections = document.querySelectorAll('.advanced-collapsible');
        if (advToggle && advSections.length) {
            advToggle.classList.add('collapsed');
            advSections.forEach(el => el.classList.add('collapsed-adv'));
            advToggle.addEventListener('click', () => {
                advToggle.classList.toggle('collapsed');
                advSections.forEach(el => el.classList.toggle('collapsed-adv'));
            });
        }
    };

    const setupIntervalCollapse = () => {
        const intervalToggle = getElement('interval-toggle-btn');
        const intervalContent = getElement('interval-content');
        const intervalIcon = intervalToggle?.querySelector('i');
        if (intervalToggle && intervalContent && intervalIcon) {
            intervalContent.style.maxHeight = '0';
            intervalContent.classList.remove('expanded');
            intervalIcon.classList.remove('fa-chevron-down');
            intervalIcon.classList.add('fa-chevron-right');
            intervalToggle.addEventListener('click', () => {
                const expanded = intervalContent.classList.toggle('expanded');
                intervalContent.style.maxHeight = expanded ? '450px' : '0';
                intervalIcon.classList.toggle('fa-chevron-right', !expanded);
                intervalIcon.classList.toggle('fa-chevron-down', expanded);
            });
        }
    };

    const setupEmbedEventListeners = () => {
        elements.addEmbedBtn.addEventListener('click', () => {
            if (embedCount >= 10) {
                showToast('Maximum 10 embeds allowed', 'warning');
                return;
            }
            embeds.push({ title: '', description: '', color: '#5865F2', footer: '', imageUrl: '', thumbnailUrl: '' });
            embedCount++;
            saveToLocalStorage('embeds', embeds);
            renderEmbeds();
            updatePreview();
            showToast('New embed added', 'success');
            elements.embedContent.classList.add('expanded');
            elements.embedContent.style.maxHeight = '415px';
            elements.embedToggleBtn.classList.remove('collapsed');
            document.getElementById('embed-toggle-icon').className = 'fas fa-chevron-down';
            updateDeleteEmbedBtn();
        });

        elements.embedToggleBtn.addEventListener('click', () => {
            const isExpanded = elements.embedContent.classList.toggle('expanded');
            elements.embedToggleBtn.classList.toggle('collapsed', !isExpanded);
            if (isExpanded && embeds.length > 1) {
                elements.embedContent.style.maxHeight = '415px';
            } else if (isExpanded && embeds.length <= 1) {
                elements.embedContent.style.maxHeight = 'none';
            } else {
                elements.embedContent.style.maxHeight = '0';
            }
            document.getElementById('embed-toggle-icon').className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
        });
    };

    const deleteEmbedBtn = document.getElementById('delete-embed-btn');

    function updateDeleteEmbedBtn() {
        deleteEmbedBtn.style.display = (embeds.length > 1) ? 'inline-flex' : 'none';
    }

    deleteEmbedBtn.addEventListener('click', () => {
        if (embeds.length > 1) {
            embeds.pop();
            embedCount--;
            saveToLocalStorage('embeds', embeds);
            renderEmbeds();
            updatePreview();
            updateDeleteEmbedBtn();
            showToast('Embed deleted', 'success');
        }
    });

    const renderEmbeds = () => {
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
                </div>`;
            elements.embedList.appendChild(embedItem);

            const inputs = {
                title: embedItem.querySelector(`#embed-title-${index}`),
                description: embedItem.querySelector(`#embed-description-${index}`),
                color: embedItem.querySelector(`#embed-color-${index}`),
                footer: embedItem.querySelector(`#embed-footer-${index}`),
                imageUrl: embedItem.querySelector(`#embed-image-url-${index}`),
                thumbnailUrl: embedItem.querySelector(`#embed-thumbnail-url-${index}`)
            };

            for (const [key, input] of Object.entries(inputs)) {
                input.addEventListener('input', () => {
                    embeds[index][key] = input.value;
                    saveToLocalStorage('embeds', embeds);
                    updatePreview();
                });
            }
        });

        if (elements.embedContent.classList.contains('expanded')) {
            if (embeds.length > 1) {
                elements.embedContent.style.maxHeight = '415px';
                elements.embedContent.style.overflowY = 'auto';
            } else {
                elements.embedContent.style.maxHeight = 'none';
                elements.embedContent.style.overflowY = 'visible';
            }
        }

        updateDeleteEmbedBtn();
    };

    const handleFileUploads = () => {
        elements.messageAttachments.addEventListener('change', (e) => {
            const maxFileSizeMB = 8;
            const maxAttachments = 10;
            const newFiles = Array.from(e.target.files);
            const validFiles = [];

            newFiles.forEach(file => {
                const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
                if (file.size > maxFileSizeMB * 1024 * 1024) {
                    addLog('error', `Attachment '${file.name}' too large (${fileSizeMB} MB > ${maxFileSizeMB} MB)`);
                    showToast(`File '${file.name}' too large (${fileSizeMB} MB / ${maxFileSizeMB} MB)`, 'error');
                } else {
                    validFiles.push(file);
                    addLog('success', `Attachment '${file.name}' uploaded (${fileSizeMB} MB)`);
                }
            });

            if (validFiles.length > maxAttachments) {
                addLog('warning', `Too many attachments (${validFiles.length}). Max ${maxAttachments}.`);
                validFiles.splice(maxAttachments);
            }

            attachments = validFiles;
            const dataTransfer = new DataTransfer();
            attachments.forEach(f => dataTransfer.items.add(f));
            elements.messageAttachments.files = dataTransfer.files;
            renderAttachmentsPreview();
            updatePreview();
            if (!attachments.length) elements.messageAttachments.value = '';
        });
    };

    const renderAttachmentsPreview = () => {
        elements.messageAttachmentsPreview.innerHTML = '';
        attachments.forEach((file, i) => {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
            const fileId = `${file.name}_${file.size}`;
            const iconClass = file.type === 'application/pdf' ? 'fa-file-pdf' :
                             file.type.includes('zip') || file.type.includes('compressed') ? 'fa-file-archive' :
                             file.type.includes('msword') || file.type.includes('officedocument') ? 'fa-file-word' : 'fa-file';

            const previewElement = document.createElement('div');
            previewElement.className = 'attachment-preview-item';
            previewElement.innerHTML = file.type.startsWith('image/') ? `
                <img src="${URL.createObjectURL(file)}" alt="${file.name}">
                <span>${file.name} (${fileSizeMB} MB)</span>
                <button class="btn-icon-small remove-attachment" data-fid="${fileId}"><i class="fas fa-times"></i></button>
            ` : file.type.startsWith('video/') ? `
                <video controls><source src="${URL.createObjectURL(file)}" type="${file.type}"></video>
                <span>${file.name} (${fileSizeMB} MB)</span>
                <button class="btn-icon-small remove-attachment" data-fid="${fileId}"><i class="fas fa-times"></i></button>
            ` : `
                <i class="fas ${iconClass}"></i>
                <span>${file.name} (${fileSizeMB} MB)</span>
                <button class="btn-icon-small remove-attachment" data-fid="${fileId}"><i class="fas fa-times"></i></button>
            `;
            elements.messageAttachmentsPreview.appendChild(previewElement);

            previewElement.querySelector('.remove-attachment').addEventListener('click', (e) => {
                e.stopPropagation();
                attachments = attachments.filter(f => `${f.name}_${f.size}` !== fileId);
                const dataTransfer = new DataTransfer();
                attachments.forEach(f => dataTransfer.items.add(f));
                elements.messageAttachments.files = dataTransfer.files;
                renderAttachmentsPreview();
                updatePreview();
                if (!attachments.length) elements.messageAttachments.value = '';
            });
        });
    };

    const setupEventListeners = () => {
        elements.themeCarousel.addEventListener('click', (e) => {
            const themePreview = e.target.closest('.theme-preview');
            if (!themePreview) return;
            const theme = themePreview.dataset.theme;
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            document.body.setAttribute('data-theme', theme);
            saveToLocalStorage('theme', theme);
            document.querySelectorAll('.theme-preview').forEach(el => el.classList.remove('active'));
            themePreview.classList.add('active');
            showToast(`Theme changed to ${theme}`, 'success');
            setTimeout(() => { document.body.style.transition = ''; }, 300);
        });

        elements.toggleVisibility.addEventListener('click', () => {
            const type = elements.webhookUrl.type === 'password' ? 'text' : 'password';
            elements.webhookUrl.type = type;
            elements.toggleVisibility.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
        });

        const inputHandlers = {
            webhookUrl: () => { saveToLocalStorage('webhookUrl', elements.webhookUrl.value); checkWebhookPrivacy(elements.webhookUrl.value); },
            messageContent: () => { saveToLocalStorage('messageContent', elements.messageContent.value); updatePreview(); },
            username: () => { saveToLocalStorage('username', elements.username.value); updatePreview(); },
            avatarUrl: () => { saveToLocalStorage('avatarUrl', elements.avatarUrl.value); updatePreview(); },
            randomMessages: () => saveToLocalStorage('randomMessages', elements.randomMessages.checked),
            enableSounds: () => saveToLocalStorage('soundsEnabled', elements.enableSounds.checked),
            embedImageUrl: () => { saveToLocalStorage('embedImageUrl', elements.embedImageUrl.value); updatePreview(); },
            embedThumbnailUrl: () => { saveToLocalStorage('embedThumbnailUrl', elements.embedThumbnailUrl.value); updatePreview(); },
            intervalUnit: updateIntervalDisplay,
            intervalValue: updateIntervalDisplay,
            messageLimit: updateMessageLimitPlaceholder
        };

        for (const [key, handler] of Object.entries(inputHandlers)) {
            elements[key].addEventListener('input', debounce(handler, 200));
            if (key === 'randomMessages' || key === 'enableSounds') {
                elements[key].addEventListener('change', handler);
            }
        }

        document.querySelectorAll('.interval-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const input = btn.closest('.input-with-buttons').querySelector('input');
                let value = parseInt(input.value) || (input.id === 'message-limit' ? 0 : 10);
                if (action === 'increment') {
                    input.value = input.id === 'message-limit' && input.value === '' ? 1 : value + 1;
                } else if (action === 'decrement' && value > 0) {
                    input.value = value - 1;
                    if (input.value === '0' && input.id === 'message-limit') input.value = '';
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });

        document.querySelectorAll('.input-with-buttons input').forEach(input => input.addEventListener('focus', () => input.select()));

        const buttonHandlers = {
            startBtn: startSending,
            stopBtn: stopSending,
            testBtn: sendTestMessage,
            resetStats: resetStatistics,
            clearLogs: clearLogs,
            historyBtn: showHistoryModal,
            suggestMessage: showMessageSuggestions,
            formatHelp: showFormatHelp,
            exportJsonMenu: exportLogsAsJson,
            exportScreenshotMenu: exportLogsAsScreenshot,
            importJsonMenu: importLogsFromJson,
            exportJsonCloud: exportCloud,
            importJsonCloud: importCloud,
            saveProfileBtn: saveProfile,
            manageProfilesBtn: manageProfiles
        };

        for (const [key, handler] of Object.entries(buttonHandlers)) {
            elements[key]?.addEventListener('click', handler);
        }

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => btn.closest('.modal').classList.add('hidden'));
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) e.target.classList.add('hidden');
        });

        elements.avatarMenuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.avatarMenuBtn.nextElementSibling?.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-content.show').forEach(dropdown => dropdown.classList.remove('show'));
        });

        elements.loginBtn?.addEventListener('click', async (e) => {
            e.stopPropagation();
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'discord' });
            if (error) {
                addLog('error', `Login failed: ${error.message}`);
                showToast('Login failed', 'error');
            }
        });

        elements.logoutBtn?.addEventListener('click', async (e) => {
            e.stopPropagation();
            await supabase.auth.signOut();
            updateAuthUI(null);
            addLog('success', 'Logged out successfully');
            showToast('Logged out successfully', 'success');
            playSound('notification');
        });
    };

    const getRandomMessage = () => {
        if (!elements.randomMessages.checked) return elements.messageContent.value.trim();
        const messages = elements.messageContent.value.split('\n').filter(line => line.trim());
        return messages.length ? messages[Math.floor(Math.random() * messages.length)] : elements.messageContent.value;
    };

    const showHistoryModal = () => {
        elements.historyList.innerHTML = '';
        let history = JSON.parse(localStorage.getItem('webhookHistory') || '[]');
        history = [...new Set(history.map(item => item.url))].map(url => ({ url, lastUsed: new Date().toISOString() })).slice(0, 10);
        saveToLocalStorage('webhookHistory', history);

        if (!history.length) {
            elements.historyList.innerHTML = '<p>No history yet</p>';
            elements.historyModal.classList.remove('hidden');
            return;
        }

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            const url = item.url;
            const prettyUrl = url.indexOf('/api/') !== -1 ? url.substring(url.indexOf('/api/') + 5) : url;
            historyItem.innerHTML = `<span>${prettyUrl}</span><i class="fas fa-arrow-right"></i>`;
            historyItem.title = url;
            historyItem.addEventListener('click', () => {
                elements.webhookUrl.value = url;
                saveToLocalStorage('webhookUrl', url);
                checkWebhookPrivacy(url);
                elements.historyModal.classList.add('hidden');
                showToast('Webhook URL loaded from history', 'success');
            });
            elements.historyList.appendChild(historyItem);
        });

        elements.historyModal.classList.remove('hidden');
    };

    const showMessageSuggestions = () => {
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
    };

    const showFormatHelp = () => {
        elements.formatHelpModal.classList.remove('hidden');
    };

    const updateStats = () => {
        elements.statTotal.textContent = stats.total;
        elements.statSuccess.textContent = stats.success;
        elements.statFailed.textContent = stats.failed;
        elements.statAvgTime.textContent = stats.responseTimes.length
            ? `${Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)}ms`
            : '0ms';
    };

    const saveStats = () => saveToLocalStorage('stats', stats);

    const saveToHistory = (url) => {
        if (!url) return;
        let history = JSON.parse(localStorage.getItem('webhookHistory') || '[]');
        history = history.filter(item => item.url !== url);
        history.unshift({ url, lastUsed: new Date().toISOString() });
        saveToLocalStorage('webhookHistory', history.slice(0, 10));
    };

    const startSending = async () => {
        const webhookUrl = elements.webhookUrl.value.trim();
        const message = elements.messageContent.value.trim();
        const intervalValue = parseInt(elements.intervalValue.value);
        const intervalUnit = elements.intervalUnit.value.toLowerCase();
        let messageLimit = parseInt(elements.messageLimit.value) || 0;
        let sentCount = 1;

        if (!webhookUrl) {
            addLog('error', 'Please enter a valid Discord webhook URL');
            playSound('error');
            return;
        }
        if (!message && !embeds.some(embed => embed.title.trim() || embed.description.trim()) && !attachments.length) {
            addLog('error', 'Please enter a message, add an embed, or attach a file');
            playSound('error');
            return;
        }
        if (isNaN(intervalValue) || intervalValue <= 0) {
            addLog('error', 'Please enter a valid interval (> 0)');
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
            addLog('warning', 'Interval too short. Using minimum 2 seconds.');
        }

        saveToHistory(webhookUrl);

        const updateStatusText = () => {
            const unitText = intervalValue === 1 ? intervalUnit.replace(/s$/, '') : intervalUnit;
            elements.statusText.textContent = `Sending every ${intervalValue} ${unitText}` +
                (messageLimit === 0 ? ' (Unlimited)' : ` (${sentCount}/${messageLimit})`);
        };

        const sendAndSchedule = async () => {
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
        };

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
            addLog('success', `Started sending every ${intervalValue} ${intervalUnit}${messageLimit === 0 ? ' (unlimited)' : ` for ${messageLimit} messages`}`);
            playSound('success');
        } catch (error) {
            addLog('error', `Failed to start sending: ${error.message}`);
            playSound('error');
        }
    };

    const stopSending = () => {
        if (intervalId) clearTimeout(intervalId);
        intervalId = null;
        isSending = false;
        elements.startBtn.disabled = false;
        elements.stopBtn.disabled = true;
        elements.statusDot.classList.remove('active');
        elements.statusText.textContent = 'Ready';
        addLog('warning', 'Stopped sending messages');
        playSound('notification');
    };

    const sendTestMessage = async () => {
        const webhookUrl = elements.webhookUrl.value.trim();
        const message = elements.messageContent.value.trim();
        if (!webhookUrl) {
            addLog('error', 'Please enter a valid Discord webhook URL');
            playSound('error');
            return;
        }
        if (!message && !embeds.some(embed => embed.title.trim() || embed.description.trim()) && !attachments.length) {
            addLog('error', 'Please enter a message, add an embed, or attach a file');
            playSound('error');
            return;
        }
        saveToHistory(webhookUrl);
        await sendMessage(webhookUrl, getRandomMessage());
    };

    const sendMessage = async (webhookUrl, message, isScheduled = false) => {
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
            <span>Uploading...</span>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: 0%"></div>
            </div>`;
        elements.toastContainer.appendChild(progressToast);
        progressToast.classList.add('show');

        try {
            if (attachments.length) {
                const formData = new FormData();
                attachments.forEach((file, index) => formData.append(`file${index}`, file, file.name));
                formData.append('payload_json', JSON.stringify({
                    allowed_mentions: { parse: ["users", "roles", "everyone"] },
                    content: message,
                    username,
                    avatar_url: avatarUrl,
                    embeds: embedsToSend.length ? embedsToSend : undefined
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
                    try {
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
                            const errorMap = {
                                400: 'Invalid request. Check file format or webhook URL.',
                                401: 'Unauthorized. Invalid webhook URL or token.',
                                404: 'Webhook not found. Check the URL.',
                                413: 'File size too large for Discord (max 8 MB).',
                                429: 'Rate limit exceeded. Please try again later.'
                            };
                            throw new Error(errorMap[xhr.status] || `HTTP error! Status: ${xhr.status}`);
                        }
                    } catch (error) {
                        stats.total++;
                        stats.failed++;
                        updateStats();
                        saveStats();
                        addLog('error', `${isScheduled ? '[Scheduled] ' : ''}Failed to send message: ${error.message}`);
                        playSound('error');
                    }
                };

                xhr.onerror = () => {
                    progressToast.remove();
                    stats.total++;
                    stats.failed++;
                    updateStats();
                    saveStats();
                    addLog('error', `${isScheduled ? '[Scheduled] ' : ''}Failed to send message: Network error`);
                    playSound('error');
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
                        embeds: embedsToSend.length ? embedsToSend : undefined
                    })
                });

                progressToast.remove();
                if (!response.ok) {
                    const errorMap = {
                        400: 'Invalid request. Check message content or webhook URL.',
                        401: 'Unauthorized. Invalid webhook URL or token.',
                        404: 'Webhook not found. Check the URL.',
                        429: 'Rate limit exceeded. Please try again later.'
                    };
                    throw new Error(errorMap[response.status] || `HTTP error! Status: ${response.status}`);
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
    };

    const resetStatistics = async () => {
        const confirmed = await showCustomConfirm('Are you sure you want to reset ALL settings and data? This cannot be undone!');
        if (!confirmed) return;
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
    };

    const clearLogs = async () => {
        const confirmed = await showCustomConfirm('Are you sure you want to clear all logs?');
        if (!confirmed) return;
        elements.logContainer.innerHTML = '';
        saveToLocalStorage('logs', []);
        addLog('warning', 'Cleared all logs');
    };

    const exportLogsAsJson = () => {
        const exportData = {
            metadata: { app: "Webhook Sender PRO", version: "3.0", exportDate: new Date().toISOString() },
            settings: {
                webhookUrl: elements.webhookUrl.value,
                messageContent: elements.messageContent.value,
                username: elements.username.value,
                avatarUrl: elements.avatarUrl.value,
                randomMessages: elements.randomMessages.checked,
                interval: { value: elements.intervalValue.value, unit: elements.intervalUnit.value },
                messageLimit: elements.messageLimit.value === '' ? 'Unlimited' : elements.messageLimit.value,
                enableSounds: elements.enableSounds.checked,
                embeds
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

        downloadFile(JSON.stringify(exportData, null, 2), `webhook-sender-export-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
        saveToLocalStorage('logs', exportData.logs);
        addLog('success', 'Exported application data as JSON');
        playSound('success');
    };

    const exportLogsAsScreenshot = () => {
        html2canvas(elements.logContainer, {
            backgroundColor: getComputedStyle(document.body).getPropertyValue('--card-color'),
            scale: 2
        }).then(canvas => {
            downloadFile(canvas.toDataURL('image/png'), `webhook-logs-${new Date().toISOString().slice(0, 10)}.png`, 'image/png', true);
            addLog('success', 'Exported logs as screenshot');
            playSound('success');
        });
    };

    const importLogsFromJson = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    importJsonData(JSON.parse(event.target.result));
                } catch (err) {
                    addLog('error', `Failed to parse JSON: ${err.message}`);
                    showToast('Failed to parse JSON', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const importJsonData = (jsonData) => {
        try {
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
                } else {
                    embeds = [{ title: '', description: '', color: '#5865F2', footer: '' }];
                    embedCount = 1;
                    renderEmbeds();
                }
                if (jsonData.settings.interval) {
                    elements.intervalValue.value = jsonData.settings.interval.value || '10';
                    elements.intervalUnit.value = jsonData.settings.interval.unit || 'seconds';
                }
                elements.messageLimit.value = jsonData.settings.messageLimit === 'Unlimited' ? '' : jsonData.settings.messageLimit || '';
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
            }
            saveToLocalStorage('webhookUrl', elements.webhookUrl.value);
            saveToLocalStorage('messageContent', elements.messageContent.value);
            saveToLocalStorage('username', elements.username.value);
            saveToLocalStorage('avatarUrl', elements.avatarUrl.value);
            saveToLocalStorage('randomMessages', elements.randomMessages.checked);
            saveToLocalStorage('stats', stats);
            saveToLocalStorage('soundsEnabled', elements.enableSounds.checked);
            saveToLocalStorage('embeds', embeds);
            saveToLocalStorage('logs', jsonData.logs || []);
            loadLayout();
            updateMessageLimitPlaceholder();
            addLog('success', 'Imported settings and data from JSON');
            showToast('Imported settings successfully', 'success');
            playSound('success');
        } catch (error) {
            addLog('error', `Failed to import data: ${error.message}`);
            showToast('Failed to import data', 'error');
            playSound('error');
        }
    };

    const downloadFile = (content, fileName, type, isUrl = false) => {
        const a = document.createElement('a');
        a.href = isUrl ? content : URL.createObjectURL(new Blob([content], { type }));
        a.download = fileName;
        a.click();
        if (!isUrl) URL.revokeObjectURL(a.href);
    };

    const loadLayout = () => {
        const defaultLayout = ["settings", "preview", "stats", "controls", "logs"];
        const savedLayout = localStorage.getItem('layout');
        const container = document.querySelector('.app-content');
        if (!container) {
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
    };

    // Supabase Functions
    const updateAuthUI = (user) => {
        if (!elements.userAvatar || !elements.userUsername || !elements.loginBtn || !elements.logoutBtn) return;
        if (user) {
            elements.loginBtn.style.display = 'none';
            elements.logoutBtn.style.display = 'block';
            elements.userAvatar.src = user.user_metadata?.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png';
            elements.userAvatar.style.display = 'block';
            elements.userUsername.textContent = user.user_metadata?.name || user.email || user.id;
            elements.userUsername.style.display = 'block';
        } else {
            elements.loginBtn.style.display = 'block';
            elements.logoutBtn.style.display = 'none';
            elements.userAvatar.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            elements.userAvatar.style.display = 'block';
            elements.userUsername.textContent = 'Guest User';
            elements.userUsername.style.display = 'block';
        }
    };

    const exportCloud = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            addLog('error', 'Export failed: User not logged in');
            showToast('You must be logged in to export to cloud', 'error');
            await showCustomAlert('You must be logged in!', 'Error');
            return;
        }

        const exportData = {
            metadata: { app: "Webhook Sender PRO", version: "3.0", exportDate: new Date().toISOString() },
            settings: {
                webhookUrl: elements.webhookUrl.value,
                messageContent: elements.messageContent.value,
                username: elements.username.value,
                avatarUrl: elements.avatarUrl.value,
                randomMessages: elements.randomMessages.checked,
                interval: { value: elements.intervalValue.value, unit: elements.intervalUnit.value },
                messageLimit: elements.messageLimit.value === '' ? 'Unlimited' : elements.messageLimit.value,
                enableSounds: elements.enableSounds.checked,
                embeds
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
            addLog('error', `Upload failed: ${error.message}`);
            showToast('Cloud export failed', 'error');
            await showCustomAlert('Upload failed.', 'Error');
        } else {
            saveToLocalStorage('logs', exportData.logs);
            addLog('success', 'Exported application data to cloud');
            showToast('Exported to cloud successfully', 'success');
            await showCustomAlert('Logs saved to cloud!', 'Success');
            playSound('success');
        }
    };

    const importCloud = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            addLog('error', 'Import failed: User not logged in');
            showToast('You must be logged in to import from cloud', 'error');
            await showCustomAlert('You must be logged in!', 'Error');
            return;
        }

        const { data, error } = await supabase
            .from('user_jsons')
            .select('data')
            .eq('user_id', user.id)
            .single();

        if (error || !data?.data) {
            addLog('error', `Failed to load data: ${error?.message || 'No data found'}`);
            showToast('No cloud data found', 'error');
            await showCustomAlert('Failed to load data.', 'Error');
            return;
        }

        try {
            importJsonData(data.data);
            addLog('success', 'Imported application data from cloud');
            showToast('Imported from cloud successfully', 'success');
            await showCustomAlert('Logs imported from cloud!', 'Success');
            playSound('success');
        } catch (e) {
            addLog('error', `Invalid cloud data: ${e.message}`);
            showToast('Invalid cloud data', 'error');
            await showCustomAlert('Invalid cloud data.', 'Error');
        }
    };

    const saveProfile = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            addLog('error', 'Profile save failed: User not logged in');
            showToast('You must be logged in to save profiles', 'error');
            await showCustomAlert('You must be logged in to save profiles!', 'Error');
            return;
        }

        const { count } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (count >= 10) {
            addLog('error', `Profile save failed: Maximum of 10 profiles reached`);
            showToast('Maximum of 10 profiles reached', 'error');
            await showCustomAlert('You’ve reached the maximum of 10 saved profiles. Please delete one first.', 'Error');
            return;
        }

        const profileName = await showCustomPrompt('Enter a name for this profile:');
        if (!profileName) return;

        const profileData = {
            webhookUrl: elements.webhookUrl.value,
            messageContent: elements.messageContent.value,
            username: elements.username.value,
            avatarUrl: elements.avatarUrl.value,
            randomMessages: elements.randomMessages.checked,
            interval: { value: elements.intervalValue.value, unit: elements.intervalUnit.value },
            messageLimit: elements.messageLimit.value === '' ? 'Unlimited' : elements.messageLimit.value,
            enableSounds: elements.enableSounds.checked,
            embeds
        };

        const { error } = await supabase
            .from('user_profiles')
            .insert({ user_id: user.id, name: profileName, data: profileData });

        if (error) {
            addLog('error', `Profile save failed: ${error.message}`);
            showToast('Failed to save profile', 'error');
            await showCustomAlert('Failed to save profile.', 'Error');
        } else {
            addLog('success', `Profile "${profileName}" saved to cloud`);
            showToast(`Profile "${profileName}" saved`, 'success');
            await showCustomAlert('Profile saved successfully!', 'Success');
            playSound('success');
        }
    };

    const manageProfiles = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            addLog('error', 'Profile management failed: User not logged in');
            showToast('You must be logged in to manage profiles', 'error');
            await showCustomAlert('You must be logged in to manage profiles!', 'Error');
            return;
        }

        try {
            const { data: profiles, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .order('last_updated', { ascending: false });

            if (error) throw error;
            renderProfilesList(profiles || []);
            elements.profilesModal.classList.remove('hidden');
        } catch (error) {
            addLog('error', `Profile load failed: ${error.message}`);
            showToast('Failed to load profiles', 'error');
            await showCustomAlert('Failed to load profiles.', 'Error');
            renderProfilesList([]);
            elements.profilesModal.classList.remove('hidden');
        }
    };

    const renderProfilesList = (profiles) => {
        elements.profilesList.innerHTML = '';
        elements.noProfilesMessage.style.display = (!profiles || !Array.isArray(profiles) || !profiles.length) ? 'block' : 'none';

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
                    <button class="btn-icon-small load-profile" title="Load Profile"><i class="fas fa-download"></i></button>
                    <button class="btn-icon-small delete-profile" title="Delete Profile"><i class="fas fa-trash"></i></button>
                </div>`;
            profileItem.querySelector('.load-profile').addEventListener('click', () => loadProfile(profile));
            profileItem.querySelector('.delete-profile').addEventListener('click', () => deleteProfile(profile.id));
            elements.profilesList.appendChild(profileItem);
        });
    };

    const loadProfile = async (profile) => {
        const confirmed = await showCustomConfirm(`Load profile "${profile.name}"? This will overwrite your current settings.`);
        if (!confirmed) return;
        try {
            stopSending();
            const profileData = profile.data;
            elements.webhookUrl.value = profileData.webhookUrl || '';
            elements.messageContent.value = profileData.messageContent || '';
            elements.username.value = profileData.username || '';
            elements.avatarUrl.value = profileData.avatarUrl || '';
            elements.randomMessages.checked = profileData.randomMessages || false;
            elements.enableSounds.checked = profileData.enableSounds !== false;
            if (profileData.interval) {
                elements.intervalValue.value = profileData.interval.value || '10';
                elements.intervalUnit.value = profileData.interval.unit || 'seconds';
            }
            elements.messageLimit.value = profileData.messageLimit === 'Unlimited' ? '' : profileData.messageLimit || '';
            if (profileData.embeds && Array.isArray(profileData.embeds)) {
                embeds = profileData.embeds;
                embedCount = embeds.length;
                renderEmbeds();
            } else {
                embeds = [{ title: '', description: '', color: '#5865F2', footer: '' }];
                embedCount = 1;
                renderEmbeds();
            }
            updatePreview();
            saveToLocalStorage('webhookUrl', elements.webhookUrl.value);
            saveToLocalStorage('messageContent', elements.messageContent.value);
            saveToLocalStorage('username', elements.username.value);
            saveToLocalStorage('avatarUrl', elements.avatarUrl.value);
            saveToLocalStorage('randomMessages', elements.randomMessages.checked);
            saveToLocalStorage('enableSounds', elements.enableSounds.checked);
            saveToLocalStorage('embeds', embeds);
            elements.profilesModal.classList.add('hidden');
            addLog('success', `Profile "${profile.name}" loaded successfully`);
            showToast(`Profile "${profile.name}" loaded`, 'success');
            playSound('success');
        } catch (error) {
            addLog('error', `Failed to load profile: ${error.message}`);
            showToast('Failed to load profile', 'error');
            playSound('error');
        }
    };

    const deleteProfile = async (profileId) => {
        const confirmed = await showCustomConfirm('Are you sure you want to delete this profile? This cannot be undone.');
        if (!confirmed) return;
        const { error } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', profileId);

        if (error) {
            addLog('error', `Profile delete failed: ${error.message}`);
            showToast('Failed to delete profile', 'error');
            await showCustomAlert('Failed to delete profile.', 'Error');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profiles, error: fetchError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .order('last_updated', { ascending: false });

            if (fetchError) throw fetchError;
            renderProfilesList(profiles || []);
            addLog('warning', 'Profile deleted successfully');
            showToast('Profile deleted', 'warning');
            playSound('notification');
        } catch (e) {
            addLog('error', `Error refreshing profiles: ${e.message}`);
            showToast('Error refreshing profiles', 'error');
        }
    };

    // Handle OAuth Redirect
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
        (async () => {
            try {
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    addLog('error', `Session check failed: ${sessionError.message}`);
                    showToast('Session check failed', 'error');
                    return;
                }
                if (!sessionData.session) {
                    const { data, error } = await supabase.auth.exchangeCodeForSession({ code });
                    if (error) {
                        addLog('error', `OAuth exchange failed: ${error.message}`);
                        showToast('OAuth exchange failed', 'error');
                        return;
                    }
                    updateAuthUI(data.user);
                    addLog('success', 'Successfully logged in via OAuth');
                    showToast('Logged in successfully', 'success');
                    playSound('success');
                }
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {
                addLog('error', `OAuth error: ${e.message}`);
                showToast('OAuth error', 'error');
            }
        })();
    }

    // Initialize
    const initApp = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        document.querySelector(`.theme-preview[data-theme="${savedTheme}"]`)?.classList.add('active');

        const savedSettings = ['webhookUrl', 'messageContent', 'username', 'avatarUrl', 'randomMessages', 'embedImageUrl', 'embedThumbnailUrl'];
        for (const key of savedSettings) {
            const value = localStorage.getItem(key);
            if (value) {
                elements[key][key === 'randomMessages' ? 'checked' : 'value'] = key === 'randomMessages' ? value === 'true' : value;
            }
        }

        const savedEmbeds = localStorage.getItem('embeds');
        if (savedEmbeds) {
            embeds = JSON.parse(savedEmbeds);
            embedCount = embeds.length;
            renderEmbeds();
            updateDeleteEmbedBtn();
        } else {
            embeds = [{ title: '', description: '', color: '#5865F2', footer: '' }];
            renderEmbeds();
            updateDeleteEmbedBtn();
        }

        const savedStats = localStorage.getItem('stats');
        if (savedStats) {
            stats = JSON.parse(savedStats);
            updateStats();
        }

        elements.enableSounds.checked = localStorage.getItem('soundsEnabled') !== 'false';
        if (elements.messageContent.value) updatePreview();
        if (elements.avatarUrl.value) elements.previewAvatar.src = elements.avatarUrl.value;

        setupEventListeners();
        setupEmbedEventListeners();
        handleFileUploads();
        setupAdvancedCollapse();
        setupIntervalCollapse();
        updateMessageLimitPlaceholder();
        updateIntervalDisplay();
    };

    const initAuth = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error && error.message !== 'Auth session missing!') {
                addLog('error', `Session check failed: ${error.message}`);
                showToast('Session check failed', 'error');
            }
            updateAuthUI(user);
        } catch (e) {
            addLog('error', `Auth initialization error: ${e.message}`);
            showToast('Auth initialization error', 'error');
        }
    };

    initAuth();
    initApp();
    loadLayout();
});