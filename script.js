document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        webhookUrl: document.getElementById('webhook-url'),
        messageContent: document.getElementById('message-content'),
        intervalValue: document.getElementById('interval-value'),
        intervalUnit: document.getElementById('interval-unit'),
        messageLimit: document.getElementById('message-limit'),
        startBtn: document.getElementById('start-btn'),
        stopBtn: document.getElementById('stop-btn'),
        testBtn: document.getElementById('test-btn'),
        statusText: document.getElementById('status-text'),
        statusDot: document.querySelector('.status-dot'),
        logContainer: document.getElementById('log-container'),
        themeSelector: document.getElementById('theme-selector'),
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
        importJsonMenu: document.getElementById('import-json-menu')
    };

    // Variables
    let intervalId = null;
    let isSending = false;
    let stats = { 
        total: 0,
        success: 0,
        failed: 0,
        responseTimes: [] 
    };
    let scheduledJobs = [];

    // Initialize app
    function initApp() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        elements.themeSelector.value = savedTheme;

        ['webhookUrl', 'messageContent', 'username', 'avatarUrl', 'randomMessages'].forEach(key => {
            const value = localStorage.getItem(key);
            if (value) elements[key].value = value;
            if (key === 'randomMessages' && value === 'true') {
                elements[key].checked = true;
            }
        });

        if (elements.webhookUrl.value) checkWebhookPrivacy(elements.webhookUrl.value);
        if (elements.messageContent.value) updatePreview();
        if (elements.avatarUrl.value) elements.previewAvatar.src = elements.avatarUrl.value;

        const savedStats = localStorage.getItem('stats');
        if (savedStats) {
            stats = JSON.parse(savedStats);
            updateStats();
        }

        const savedJobs = localStorage.getItem('scheduledJobs');
        if (savedJobs) {
            scheduledJobs = JSON.parse(savedJobs);
            renderScheduledJobs();
        }

        elements.enableSounds.checked = localStorage.getItem('soundsEnabled') !== 'false';

        // Event listeners for export menu
        elements.exportJsonMenu.addEventListener('click', exportLogsAsJson);
        elements.exportScreenshotMenu.addEventListener('click', exportLogsAsScreenshot);
        elements.importJsonMenu.addEventListener('click', importLogsFromJson);

        updatePreview();
        startScheduler();
    }


    function exportLogsAsJson() {
        // Συλλογή όλων των δεδομένων
        const exportData = {
            metadata: {
                app: "Webhook Sender PRO",
                version: "2.0",
                exportDate: new Date().toISOString(),
                type: "full_export"
            },
            settings: {
                webhookUrl: elements.webhookUrl.value,
                messageContent: elements.messageContent.value,  // Προσθήκη Message Content
                username: elements.username.value,
                avatarUrl: elements.avatarUrl.value,
                randomMessages: elements.randomMessages.checked,
                interval: {
                    value: elements.intervalValue.value,
                    unit: elements.intervalUnit.value
                },
                messageLimit: elements.messageLimit.value || 'Unlimited',
                enableSounds: elements.enableSounds.checked    // Προσθήκη sound settings
            },
            statistics: {
                totalMessages: stats.total,
                successful: stats.success,
                failed: stats.failed,
                averageResponseTime: stats.responseTimes.length 
                    ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
                    : 0,
                responseTimes: stats.responseTimes  // Προσθήκη πλήρους ιστορικού χρόνων
            },
            logs: Array.from(elements.logContainer.querySelectorAll('.log-entry')).map(log => ({
                time: log.querySelector('.log-time').textContent,
                message: log.querySelector('.log-message').textContent,
                type: log.classList.contains('log-success') ? 'success' : 
                    log.classList.contains('log-error') ? 'error' : 'warning'
            })),
            history: JSON.parse(localStorage.getItem('webhookHistory') || '[]')  // Προσθήκη ιστορικού webhooks
        };

        const fileName = `webhook-sender-full-export-${new Date().toISOString().slice(0, 10)}.json`;
        downloadFile(JSON.stringify(exportData, null, 2), fileName, 'application/json');
        addLog('success', 'Exported COMPLETE application data as JSON');
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

    function importJsonData(jsonData) {
        try {
            // Stop any active sending first
            stopSending();

            // Import settings
            if (jsonData.settings) {
                elements.webhookUrl.value = jsonData.settings.webhookUrl || '';
                elements.messageContent.value = jsonData.settings.messageContent || '';  // Message Content
                elements.username.value = jsonData.settings.username || '';
                elements.avatarUrl.value = jsonData.settings.avatarUrl || '';
                elements.randomMessages.checked = jsonData.settings.randomMessages || false;
                elements.enableSounds.checked = jsonData.settings.enableSounds !== false;
                
                if (jsonData.settings.interval) {
                    elements.intervalValue.value = jsonData.settings.interval.value || '10';
                    elements.intervalUnit.value = jsonData.settings.interval.unit || 'seconds';
                }
                
                elements.messageLimit.value = jsonData.settings.messageLimit === 'Unlimited' ? '' : jsonData.settings.messageLimit || '';
                
                // Update preview and local storage
                updatePreview();
                localStorage.setItem('messageContent', elements.messageContent.value);
                localStorage.setItem('enableSounds', elements.enableSounds.checked);
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
                localStorage.setItem('stats', JSON.stringify(stats));
            }
            
            // Import logs
            if (jsonData.logs && Array.isArray(jsonData.logs)) {
                elements.logContainer.innerHTML = '';
                jsonData.logs.forEach(log => {
                    addLog(log.type || 'info', log.message || 'Imported log');
                });
            }
            
            // Import webhook history
            if (jsonData.history && Array.isArray(jsonData.history)) {
                localStorage.setItem('webhookHistory', JSON.stringify(jsonData.history));
            }
            
            // Save other settings to local storage
            localStorage.setItem('webhookUrl', elements.webhookUrl.value);
            localStorage.setItem('username', elements.username.value);
            localStorage.setItem('avatarUrl', elements.avatarUrl.value);
            localStorage.setItem('randomMessages', elements.randomMessages.checked);
            
            addLog('success', 'Successfully imported ALL settings and data from JSON');
            playSound('success');
        } catch (error) {
            addLog('error', `Failed to import data: ${error.message}`);
            playSound('error');
        }
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

    function downloadFile(content, fileName, type, isUrl = false) {
        const a = document.createElement('a');
        a.href = isUrl ? content : URL.createObjectURL(new Blob([content], { type }));
        a.download = fileName;
        a.click();
        if (!isUrl) URL.revokeObjectURL(a.href);
    }

    // Theme handling
    elements.themeSelector.addEventListener('change', () => {
        const theme = elements.themeSelector.value;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });

    // Webhook URL handling
    elements.toggleVisibility.addEventListener('click', () => {
        const type = elements.webhookUrl.type === 'password' ? 'text' : 'password';
        elements.webhookUrl.type = type;
        elements.toggleVisibility.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
    });

    elements.webhookUrl.addEventListener('input', () => {
        localStorage.setItem('webhookUrl', elements.webhookUrl.value);
        checkWebhookPrivacy(elements.webhookUrl.value);
    });

    function checkWebhookPrivacy(url) {
        const isPublic = url.includes('discord.com/api/webhooks/') && !url.includes('localhost');
        elements.webhookWarning.classList.toggle('hidden', !isPublic);
    }

    // Message preview
    function updatePreview() {
        elements.previewText.textContent = elements.messageContent.value || 'Your message will appear here...';
        elements.previewUsername.textContent = elements.username.value || 'Webhook Sender';
        elements.previewAvatar.src = elements.avatarUrl.value || 'https://cdn.discordapp.com/embed/avatars/0.png';
    }

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

    // Random message function
    function getRandomMessage() {
        if (!elements.randomMessages.checked) {
            return elements.messageContent.value.trim();
        }
        const messages = elements.messageContent.value.split('\n').filter(line => line.trim());
        return messages.length ? messages[Math.floor(Math.random() * messages.length)] : elements.messageContent.value;
    }

    // History modal
    elements.historyBtn.addEventListener('click', showHistoryModal);

    function showHistoryModal() {
        elements.historyList.innerHTML = '';
        const history = JSON.parse(localStorage.getItem('webhookHistory') || '[]');
        elements.historyList.innerHTML = history.length ? '' : '<p>No history yet</p>';

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `<span>${item.url.substring(0, 30)}...</span><i class="fas fa-arrow-right"></i>`;
            historyItem.addEventListener('click', () => {
                elements.webhookUrl.value = item.url;
                localStorage.setItem('webhookUrl', item.url);
                checkWebhookPrivacy(item.url);
                elements.historyModal.classList.add('hidden');
            });
            elements.historyList.appendChild(historyItem);
        });

        elements.historyModal.classList.remove('hidden');
    }

    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => btn.closest('.modal').classList.add('hidden'));
    });

    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal')) e.target.classList.add('hidden');
    });

    // Statistics
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

    elements.resetStats.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset ALL settings and data? This cannot be undone!')) {
            // Stop any active sending
            stopSending();
            
            // Reset all form fields
            elements.webhookUrl.value = '';
            elements.messageContent.value = '';
            elements.intervalValue.value = '10';
            elements.intervalUnit.value = 'seconds';
            elements.messageLimit.value = '';
            elements.username.value = '';
            elements.avatarUrl.value = '';
            elements.randomMessages.checked = false;
            
            // Reset preview
            elements.previewText.textContent = 'Your message will appear here...';
            elements.previewUsername.textContent = 'Webhook Sender';
            elements.previewAvatar.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            
            // Reset stats
            stats = { total: 0, success: 0, failed: 0, responseTimes: [] };
            updateStats();
            
            // Clear logs
            elements.logContainer.innerHTML = '';
            
            // Clear local storage
            localStorage.removeItem('webhookUrl');
            localStorage.removeItem('messageContent');
            localStorage.removeItem('username');
            localStorage.removeItem('avatarUrl');
            localStorage.removeItem('randomMessages');
            localStorage.removeItem('stats');
            
            // Update UI
            elements.statusText.textContent = 'Ready';
            elements.statusDot.classList.remove('active');
            
            addLog('warning', 'Reset all settings and data');
            playSound('notification');
        }
    });

    // Sound toggle
    elements.enableSounds.addEventListener('change', () => {
        localStorage.setItem('soundsEnabled', elements.enableSounds.checked);
    });

    function playSound(type) {
        if (!elements.enableSounds.checked) return;
        const sound = { success: elements.successSound, error: elements.errorSound, notification: elements.notificationSound }[type];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.error('Error playing sound:', e));
        }
    }

    elements.clearLogs.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all logs?')) {
            elements.logContainer.innerHTML = '';
            addLog('warning', 'Cleared all logs');
        }
    });

    // Start sending
    elements.startBtn.addEventListener('click', async () => {
        const webhookUrl = elements.webhookUrl.value.trim();
        const message = elements.messageContent.value.trim();
        const intervalValue = parseInt(elements.intervalValue.value);
        const intervalUnit = elements.intervalUnit.value.toLowerCase();
        const messageLimit = parseInt(elements.messageLimit.value);
        let sentCount = 1;

        if (!webhookUrl) return addLog('error', 'Please enter a valid Discord webhook URL'), playSound('error');
        if (!message) return addLog('error', 'Please enter a message to send'), playSound('error');
        if (isNaN(intervalValue) || intervalValue <= 0) return addLog('error', 'Please enter a valid interval (greater than 0)'), playSound('error');

        // Reset session stats when starting new sending
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

        try {
            await sendMessage(webhookUrl, getRandomMessage());
            intervalId = setInterval(() => {
                if (!isNaN(messageLimit) && sentCount >= messageLimit) {
                    stopSending();
                    addLog('success', `Stopped after sending ${sentCount} messages`);
                    return;
                }
                sendMessage(webhookUrl, getRandomMessage());
                sentCount++;
            }, intervalMs);

            isSending = true;
            elements.startBtn.disabled = true;
            elements.stopBtn.disabled = false;
            elements.statusDot.classList.add('active');
            const unitText = intervalValue === 1 ? intervalUnit.replace(/s$/, '') : intervalUnit;
            elements.statusText.textContent = `Sending every ${intervalValue} ${unitText}`;
            addLog('success', `Started sending messages every ${intervalValue} ${unitText}`);
            playSound('success');
        } catch (error) {
            addLog('error', `Failed to start sending: ${error.message}`);
            playSound('error');
        }
    });

    // Stop sending
    function stopSending() {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
        isSending = false;
        elements.startBtn.disabled = false;
        elements.stopBtn.disabled = true;
        elements.statusDot.classList.remove('active');
        elements.statusText.textContent = 'Ready';
        addLog('warning', 'Stopped sending messages');
        playSound('notification');
    }

    elements.stopBtn.addEventListener('click', stopSending);

    // Test button
    elements.testBtn.addEventListener('click', () => {
        const webhookUrl = elements.webhookUrl.value.trim();
        const message = elements.messageContent.value.trim();
        if (!webhookUrl) return addLog('error', 'Please enter a valid Discord webhook URL'), playSound('error');
        if (!message) return addLog('error', 'Please enter a message to send'), playSound('error');
        saveToHistory(webhookUrl);
        sendMessage(webhookUrl, getRandomMessage());
    });

    // Send message to Discord webhook
    async function sendMessage(webhookUrl, message, isScheduled = false) {
        const startTime = Date.now();
        const username = elements.username.value.trim() || 'Webhook Sender';
        const avatarUrl = elements.avatarUrl.value.trim() || 'https://cdn.discordapp.com/embed/avatars/0.png';

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message, username, avatar_url: avatarUrl })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const responseTime = Date.now() - startTime;
            stats.total++;
            stats.success++;
            stats.responseTimes.push(responseTime);
            if (stats.responseTimes.length > 10) stats.responseTimes.shift();
            updateStats();
            saveStats();
            addLog('success', `${isScheduled ? '[Scheduled] ' : ''}Message sent successfully (${responseTime}ms)`);
            playSound('success');
        } catch (error) {
            stats.total++;
            stats.failed++;
            updateStats();
            saveStats();
            addLog('error', `${isScheduled ? '[Scheduled] ' : ''}Failed to send message: ${error.message}`);
            playSound('error');
        }
    }

    // Add log entry
    function addLog(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type} animate__animated animate__fadeIn`;
        const iconClass = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle' }[type] || 'fa-info-circle';
        logEntry.innerHTML = `<i class="fas ${iconClass}"></i><span class="log-time">${timestamp}</span><span class="log-message">${message}</span>`;
        elements.logContainer.prepend(logEntry);
        elements.logContainer.scrollTop = 0;
        if (elements.logContainer.children.length > 100) elements.logContainer.removeChild(elements.logContainer.lastChild);
    }

    // Save webhook to history
    function saveToHistory(url) {
        if (!url) return;
        let history = JSON.parse(localStorage.getItem('webhookHistory') || '[]');
        history = history.filter(item => item.url !== url);
        history.unshift({ url, lastUsed: new Date().toISOString() });
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem('webhookHistory', JSON.stringify(history));
    }

    // Scheduler
    function startScheduler() {
        function checkSchedule() {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const currentDay = now.getDay();
            scheduledJobs.forEach(job => {
                if (job.enabled && job.time === currentTime && job.days.includes(currentDay)) {
                    sendMessage(elements.webhookUrl.value.trim(), getRandomMessage(), true);
                }
            });
            requestAnimationFrame(checkSchedule);
        }
        requestAnimationFrame(checkSchedule);
    }

    // Initialize
    initApp();
});