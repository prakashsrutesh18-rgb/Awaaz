/**
 * AWAAZ//OS - Core Application Controller
 */

// Global State
const appState = {
    currentView: null,
    scanProgress: 74,
    activeNodes: 14291,
    latency: 24,
    clockInterval: null,
    viewIntervals: [] // Track intervals to clean them up on view swap
};

// Non-blocking toast notifications (replace alert())
function showToast(message, level = 'info', timeout = 4500) {
    const container = document.getElementById('toast-container');
    if (!container) return console.log(message);

    const toast = document.createElement('div');
    toast.className = `max-w-sm p-3 rounded shadow-[4px_4px_0px_#000] bg-white border border-on-surface font-data-mono text-[13px]`;
    if (level === 'error') toast.style.borderColor = '#ba1a1a';
    if (level === 'success') toast.style.borderColor = '#2a9d8f';

    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 250ms, transform 250ms';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => container.removeChild(toast), 300);
    }, timeout);
}

// Route Mapping
const routes = {
    'dashboard': 'views/dashboard.html',
    'heatmap': 'views/heatmap.html',
    'registry': 'views/registry.html',
    'scanner': 'views/scanner.html',
    'archive': 'views/archive.html',
    'manifesto': 'views/manifesto.html',
    'join': 'views/join.html',
    'login': 'views/login.html',
    'admin': 'views/admin.html'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log("AWAAZ//OS KERNEL INITIALIZED // SECURE CHANNEL LOADED");
    
    // Setup Global Clock
    setupClock();
    
    // Setup Global Scan Progress Bar Simulation
    setupGlobalScanProgress();
    
    // Setup Routing listener
    window.addEventListener('hashchange', handleRouting);
    
    // Initial Route - only route if a hash present to avoid auto-navigating
    if (window.location.hash && window.location.hash.length > 1) {
        handleRouting();
    } else {
        // Do not auto-load views on initial page load to prevent unexpected navigation
        appState.currentView = null;
    }
    
    // Bind Shell Button Actions
    setupShellButtons();
    // Initialize chat widget handlers
    initChatWidget();
});

// Setup Clock in Footer
function setupClock() {
    const clockEl = document.getElementById('footer-clock');
    if (clockEl) {
        const updateTime = () => {
            const now = new Date();
            const timeStr = now.toISOString().split('T')[1].split('.')[0];
            clockEl.textContent = `SYS_TIME: ${timeStr} UTC+0`;
        };
        updateTime();
        setInterval(updateTime, 1000);
    }
}

// Global scan progress simulation
function setupGlobalScanProgress() {
    const bar = document.getElementById('footer-scan-bar');
    const text = document.getElementById('footer-scan-text');
    const latencyEl = document.getElementById('footer-latency');
    
    setInterval(() => {
        // Randomly modify scan progress
        appState.scanProgress = Math.min(100, Math.max(30, appState.scanProgress + (Math.random() > 0.52 ? 1 : -1)));
        if (bar) bar.style.width = appState.scanProgress + '%';
        if (text) text.textContent = appState.scanProgress + '%';
        
        // Randomly swing latency
        appState.latency = Math.min(60, Math.max(8, appState.latency + (Math.floor(Math.random() * 5) - 2)));
        if (latencyEl) latencyEl.textContent = appState.latency + 'ms';
    }, 2500);
}

// Bind Header & Sidebar Buttons
function setupShellButtons() {
    // Report Violation Button
    document.getElementById('btn-report-violation').addEventListener('click', () => {
        window.location.hash = '#submit';
    });
    
    // Sidebar Quick Scan Button
    document.getElementById('btn-quick-scan').addEventListener('click', () => {
        window.location.hash = '#scanner';
        setTimeout(() => {
            showToast("INITIATING BROADBAND SATELLITE SWEEP... TARGET: ENCRYPTED CHANNELS", 'info');
        }, 150);
    });
    
    // Logo Click Home
    document.getElementById('shell-logo').addEventListener('click', () => {
        window.location.hash = '#dashboard';
    });

    // Open login view
    const authBtn = document.getElementById('btn-open-login');
    if (authBtn) {
        const updateAuthLabel = () => {
            const token = localStorage.getItem('awaaz_token');
            authBtn.textContent = token ? 'LOGOUT' : 'LOGIN';
        };
        updateAuthLabel();
        authBtn.addEventListener('click', () => {
            const token = localStorage.getItem('awaaz_token');
            if (token) {
                localStorage.removeItem('awaaz_token');
                showToast('Logged out', 'success');
                updateAuthLabel();
            } else {
                window.location.hash = '#login';
            }
        });
    }
}

// Route Handler
async function handleRouting() {
    let hash = window.location.hash.substring(1);
    
    // Map special aliases
    if (hash === 'submit') {
        hash = 'submit';
        routes['submit'] = 'views/submit.html';
    }
    
    const viewName = hash || 'dashboard';
    
    // Prevent reloading same view
    if (appState.currentView === viewName) return;
    
    // Clear active intervals from previous view
    appState.viewIntervals.forEach(clearInterval);
    appState.viewIntervals = [];
    
    // Highlight Active Link in Navigation
    updateNavigationHighlights(viewName);
    
    const contentArea = document.getElementById('main-content');
    
    // Fetch HTML view template
    const templatePath = routes[viewName];
    if (templatePath) {
        try {
            // Show loading state
            contentArea.innerHTML = `
                <div class="flex items-center justify-center min-h-[calc(100vh-128px)]">
                    <div class="text-center font-data-mono text-primary p-12 border-border-thick border-dashed border-primary bg-white brutalist-card">
                        <span class="material-symbols-outlined text-5xl animate-spin mb-4">sync</span>
                        <p class="font-black text-lg">RE-ROUTING GATEWAY [${viewName.toUpperCase()}]...</p>
                    </div>
                </div>`;
                
            const response = await fetch(templatePath);
            if (!response.ok) throw new Error(`Failed to fetch view template: ${viewName}`);
            
            const html = await response.text();
            contentArea.innerHTML = html;
            
            appState.currentView = viewName;
            
            // Execute View specific setup
            initializeView(viewName);
            
            // Standard micro-interactions (e.g. click offsets) on newly loaded elements
            bindGlobalInteractions();
            
        } catch (error) {
            console.error(error);
            contentArea.innerHTML = `
                <div class="p-12 max-w-2xl mx-auto font-data-mono text-error border-4 border-error bg-white brutalist-card mt-12">
                    <h2 class="font-headline-md font-bold mb-4">CONNECTION ERROR</h2>
                    <p>Failed to retrieve sector dashboard template [${viewName.toUpperCase()}]. The encrypted node may be dormant.</p>
                    <button class="mt-6 bg-on-background text-white px-6 py-2 border-2 border-on-background hover:bg-primary transition-all font-bold" onclick="window.location.reload()">RE-ATTEMPT LINK</button>
                </div>`;
        }
    } else {
        // Fallback for custom dashboard routing
        window.location.hash = '#dashboard';
    }
}

// Highlight Nav Items
function updateNavigationHighlights(activeView) {
    // Header Links
    document.querySelectorAll('header .nav-link').forEach(link => {
        const href = link.getAttribute('href').substring(1);
        if (href === activeView) {
            link.className = "nav-link font-label-caps text-label-caps bg-primary text-on-primary px-3 py-1 font-bold transition-colors";
        } else {
            link.className = "nav-link font-label-caps text-label-caps text-on-surface-variant hover:bg-primary hover:text-on-primary px-3 py-1 transition-colors";
        }
    });
    
    // Sidebar Links
    document.querySelectorAll('aside nav a').forEach(link => {
        const id = link.getAttribute('id');
        if (id === `side-${activeView}`) {
            link.className = "flex items-center gap-4 px-4 py-3 bg-primary text-on-primary font-bold border-y-2 border-on-surface transition-all";
        } else {
            link.className = "flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-dim hover:text-on-surface transition-all";
        }
    });
}

// Binds visual offsets to buttons
function bindGlobalInteractions() {
    document.querySelectorAll('button, a.brutalist-card').forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.classList.add('translate-x-[1px]', 'translate-y-[1px]');
        });
        btn.addEventListener('mouseup', () => {
            btn.classList.remove('translate-x-[1px]', 'translate-y-[1px]');
        });
        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('translate-x-[1px]', 'translate-y-[1px]');
        });
    });
}

// Initialize View Controls
function initializeView(viewName) {
    console.log(`INITIALIZING MODULE // ${viewName.toUpperCase()}`);
    
    // Generic sub-tab controller (used in Scanner, Archive, Manifesto, Join)
    setupSubTabs();
    
    switch (viewName) {
        case 'dashboard':
            initDashboardController();
            break;
        case 'heatmap':
            initHeatmapController();
            break;
        case 'registry':
            initRegistryController();
            break;
        case 'scanner':
            initScannerController();
            break;
        case 'archive':
            initArchiveController();
            break;
        case 'manifesto':
            initManifestoController();
            break;
        case 'join':
            initJoinController();
            break;
        case 'admin':
            initAdminController();
            break;
        case 'login':
            initLoginController();
            break;
        case 'submit':
            initSubmitController();
            break;
    }
}

// Sub-Tab Switcher Helper
function setupSubTabs() {
    const buttons = document.querySelectorAll('.subtab-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            
            // Update buttons active class
            buttons.forEach(b => {
                b.className = "px-4 py-2 border border-on-surface hover:bg-surface-variant transition-colors subtab-btn";
            });
            btn.className = "px-4 py-2 border border-on-surface bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#000] subtab-btn";
            
            // Update views visibility
            document.querySelectorAll('.sub-pane').forEach(pane => {
                pane.classList.add('hidden');
            });
            const activePane = document.getElementById(target);
            if (activePane) activePane.classList.remove('hidden');
            
            console.log(`SUB_PANE_ACTIVED // ${target.toUpperCase()}`);
        });
    });
}

// --- VIEW CONTROLLERS ---

// 1. Dashboard View
function initDashboardController() {
    const counterEl = document.getElementById('dash-active-counter');
    const stabilityVal = document.getElementById('dash-stability-value');
    const stabilityBar = document.getElementById('dash-stability-bar');
    const flowVal = document.getElementById('dash-flow-value');
    
    // Active nodes counter simulation
    const counterInt = setInterval(() => {
        let change = Math.floor(Math.random() * 11) - 5;
        appState.activeNodes += change;
        if (counterEl) counterEl.textContent = appState.activeNodes.toLocaleString();
    }, 2000);
    appState.viewIntervals.push(counterInt);
    
    // Stability fluctuation
    const stabilityInt = setInterval(() => {
        let current = parseInt(stabilityVal.textContent);
        let next = Math.min(100, Math.max(85, current + (Math.random() > 0.5 ? 1 : -1)));
        if (stabilityVal) stabilityVal.textContent = next + '%';
        if (stabilityBar) stabilityBar.style.width = next + '%';
    }, 3000);
    appState.viewIntervals.push(stabilityInt);
    
    // Verify Node and File RTI actions
    document.querySelectorAll('.btn-verify-node').forEach(btn => {
        btn.addEventListener('click', () => {
            const node = btn.getAttribute('data-node');
            showToast(`CONFIRMED AUDIT SIG FOR NODE: ${node}`, 'success');
            btn.innerHTML = 'VERIFIED <span class="material-symbols-outlined text-[10px]">check</span>';
            btn.classList.add('bg-tertiary-container', 'text-on-tertiary-container');
        });
    });
    
    document.querySelectorAll('.btn-file-rti').forEach(btn => {
        btn.addEventListener('click', () => {
            const node = btn.getAttribute('data-node');
            window.location.hash = '#submit';
            setTimeout(() => {
                const textLog = document.getElementById('ipt-narrative');
                if (textLog) textLog.value = `FILING REGIONAL DATA ACCESS AUDIT FOR DEVICE ID: ${node}. DETECTED UNRESOLVED TRAFFIC ROUTE CYCLES.`;
            }, 100);
        });
    });
}

// 2. Heatmap View
function initHeatmapController() {
    // Map overlay interactive markers console logs
    document.querySelectorAll('[group] cursor-pointer').forEach(el => {
        el.addEventListener('click', () => {
            showToast("LOCATING DEVICE NODES ON GRID SYSTEM...", 'info');
        });
    });
}

// 3. Registry View
function initRegistryController() {
    // Registry Decrypt Button actions
    document.querySelectorAll('.btn-decrypt-node').forEach(btn => {
        btn.addEventListener('click', () => {
            const nodeName = btn.getAttribute('data-node');
            showToast(`UPLINK HANDSHAKE IN PROGRESS... DECRYPTING META DETAILS OF: ${nodeName}`, 'info');
            btn.textContent = 'DECRYPTED // 0xAF92';
            btn.classList.add('bg-primary-container', 'text-on-primary-container');
        });
    });
    
    // Register node CTA trigger
    const trigger = document.getElementById('btn-trigger-register-node');
    if (trigger) {
        trigger.addEventListener('click', () => {
            window.location.hash = '#submit';
        });
    }
}

// 4. Scanner View
function initScannerController() {
    // Diagnostics logs generator
    const logsContainer = document.getElementById('diag-logs-container');
    const logs = [
        "PING_RESPONSE: NODE_ALPHA_01",
        "RE-ENCRYPTING_CHANNELS...",
        "TRAFFIC_SPIKE: SECTOR_B",
        "MAC_ADDRESS_SPOOF_DETECTED",
        "BUFFER_OVERFLOW_MITIGATED",
        "PACKET_INSPECTION_89%_COMPLETE"
    ];
    
    const logsInt = setInterval(() => {
        if (!logsContainer) return;
        
        const entry = logs[Math.floor(Math.random() * logs.length)];
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        
        const div = document.createElement('div');
        div.className = "opacity-0 transition-opacity duration-300";
        div.innerHTML = `<span class="text-outline-variant">[${time}]</span> <span class="text-secondary-container">[INFO]</span> ${entry}`;
        logsContainer.appendChild(div);
        
        // Remove older entries
        if (logsContainer.children.length > 20) {
            logsContainer.removeChild(logsContainer.firstElementChild);
        }
        logsContainer.scrollTop = logsContainer.scrollHeight;
        setTimeout(() => div.classList.remove('opacity-0'), 10);
    }, 2500);
    appState.viewIntervals.push(logsInt);
    
    // Topology node log generator
    const topologyLog = document.getElementById('topology-logs-container');
    const topLogs = [
        "NODE_DELHI_01 PULSE_RECEIVED",
        "ENCRYPTING_METADATA_STREAM...",
        "THREAT_LEVEL: NOMINAL",
        "BYPASSING_FIREWALL_B_77"
    ];
    
    const topInt = setInterval(() => {
        if (!topologyLog) return;
        const entry = topLogs[Math.floor(Math.random() * topLogs.length)];
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        
        const div = document.createElement('div');
        div.className = "flex gap-2 opacity-0 transition-opacity duration-300";
        div.innerHTML = `<span>[${time}]</span> <span>${entry}</span>`;
        topologyLog.appendChild(div);
        
        if (topologyLog.children.length > 15) {
            topologyLog.removeChild(topologyLog.firstElementChild);
        }
        topologyLog.scrollTop = topologyLog.scrollHeight;
        setTimeout(() => div.classList.remove('opacity-0'), 10);
    }, 3000);
    appState.viewIntervals.push(topInt);
    
    // AI Link Decryption Progress Simulation
    const progText = document.getElementById('decrypt-progress-text');
    const progBar = document.getElementById('decrypt-progress-bar');
    let pct = 78.4;
    
    const decryptInt = setInterval(() => {
        if (!progText || !progBar) return;
        pct = Math.min(100, pct + parseFloat((Math.random() * 0.8).toFixed(1)));
        if (pct >= 100) {
            pct = 40; // loop back
        }
        progText.textContent = pct.toFixed(1) + '%';
        progBar.style.width = pct.toFixed(1) + '%';
    }, 1500);
    appState.viewIntervals.push(decryptInt);
    
    // Packet Logs
    const packetLogs = document.getElementById('packet-logs-container');
    const packMsg = [
        "[10:42:30] EXTRACTING METADATA_V3",
        "[10:42:33] SYSTEM_LOG_CLEARED",
        "[10:42:35] DECRYPTING_PACKET_920... OK",
        "[10:42:40] TUNNELING_SECURE_RELAY"
    ];
    
    const packInt = setInterval(() => {
        if (!packetLogs) return;
        const p = document.createElement('p');
        p.className = 'text-primary';
        p.textContent = packMsg[Math.floor(Math.random() * packMsg.length)];
        packetLogs.appendChild(p);
        
        if (packetLogs.children.length > 15) {
            packetLogs.removeChild(packetLogs.firstElementChild);
        }
        packetLogs.scrollTop = packetLogs.scrollHeight;
    }, 4000);
    appState.viewIntervals.push(packInt);
    
    // Abort button trigger
    const abortBtn = document.getElementById('btn-abort-scan-t');
    if (abortBtn) {
        abortBtn.addEventListener('click', () => {
            showToast("EMERGENCY SCAN TERMINATION SIGNALLING INTERCEPTORS SHUTDOWN NOW!", 'error');
        });
    }
}

// 5. Archive View
function initArchiveController() {
    // Simple table hover interactions
    document.querySelectorAll('tbody tr').forEach(row => {
        row.className = "border-b border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer";
        row.addEventListener('click', () => {
            const targetId = row.cells[1].textContent;
            const violation = row.cells[2].textContent;
            showToast(`FETCHING CASE ARCHIVE REPORT FOR ${targetId} [${violation}]`, 'info');
        });
    });
}

// 6. Manifesto View
function initManifestoController() {
    // Logo Glitch translation mutation cycle
    const logoEl = document.getElementById('man-logo-glitch');
    const words = ["AWAAZ_", "SVAR_", "SOUND_", "VOIX_", "GOLOS_", "STIMME_"];
    let curr = 0;
    
    const glitchInt = setInterval(() => {
        if (!logoEl) return;
        curr = (curr + 1) % words.length;
        const nextWord = words[curr];
        
        logoEl.classList.add('animate-pulse');
        setTimeout(() => {
            logoEl.textContent = nextWord;
            logoEl.classList.remove('animate-pulse');
        }, 150);
    }, 3000);
    appState.viewIntervals.push(glitchInt);
    
    // Subscribe alert
    const subBtn = document.getElementById('btn-subscribe-man');
    if (subBtn) {
        subBtn.addEventListener('click', () => {
            showToast("SUBSCRIBED TO ENCRYPTED BROADCAST CHANNELS", 'success');
            subBtn.textContent = "SUBSCRIBED";
            subBtn.className = "bg-tertiary text-on-tertiary font-bold px-6 py-3 border-2 border-on-surface cursor-default uppercase text-xs";
        });
    }
}

// 7. Join Network Onboarding Wizard View
function initJoinController() {
    const aliasInput = document.getElementById('join-alias-input');
    const hashVal = document.getElementById('join-hash-value');
    const statusVal = document.getElementById('join-status-value');
    const tickerData = document.getElementById('join-ticker-data');
    
    // Ticker binary simulation
    const tickerInt = setInterval(() => {
        if (!tickerData) return;
        let bin = "";
        for (let i = 0; i < 2; i++) {
            bin += Math.floor(Math.random() * 255).toString(2).padStart(8, '0') + " ";
        }
        tickerData.textContent = bin;
    }, 200);
    appState.viewIntervals.push(tickerInt);
    
    // User alias input mapping
    if (aliasInput) {
        aliasInput.addEventListener('input', (e) => {
            const val = e.target.value.toUpperCase();
            e.target.value = val;
            
            if (val.length > 0) {
                // Generate mock base64 hash
                const fake = btoa(val).substring(0, 10).toUpperCase();
                if (hashVal) hashVal.textContent = `AWZ_HASH_${fake}`;
                if (statusVal) {
                    statusVal.textContent = "ALIAS_SECURED";
                    statusVal.className = "text-primary uppercase font-black";
                }
            } else {
                if (hashVal) hashVal.textContent = "A2X_99_NULL";
                if (statusVal) {
                    statusVal.textContent = "PENDING_ENTRY";
                    statusVal.className = "text-tertiary uppercase font-black";
                }
            }
        });
    }
    
    // Interactive Grid Selection
    document.querySelectorAll('.select-box').forEach(box => {
        box.addEventListener('click', () => {
            document.querySelectorAll('.select-box').forEach(b => {
                b.className = "h-12 bg-white flex items-center justify-center font-bold text-xs cursor-pointer border border-on-background hover:bg-primary-container hover:text-white transition-all select-box";
            });
            box.className = "h-12 bg-primary text-white flex items-center justify-center font-bold text-xs cursor-pointer border border-on-background relative select-box active-sector";
            console.log(`SECTOR_SELECTED // ${box.textContent}`);
        });
    });
    
    // Operator Roles choice
    document.querySelectorAll('.role-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.role-card').forEach(c => {
                c.className = "border-2 border-on-background bg-white brutalist-card hover:translate-y-[-2px] transition-all cursor-pointer p-6 flex flex-col justify-between role-card";
            });
            card.className = "border-4 border-primary bg-white brutalist-card p-6 flex flex-col justify-between role-card selected-role scale-105 z-10";
            console.log(`ROLE_CHOSEN // ${card.getAttribute('data-role').toUpperCase()}`);
        });
    });
    
    // Activate Action
    const activateBtn = document.getElementById('btn-activate-node-join');
    if (activateBtn) {
        activateBtn.addEventListener('click', async () => {
            const alias = aliasInput ? aliasInput.value.trim() : '';
            if (!alias) {
                showToast("ERROR: TERMINAL ALIAS FIELD IS EMPTY // IDENTITY REQUIRED", 'error');
                return;
            }

            // Simple auto-register + login flow for hackathon demo
            try {
                const randomPass = Math.random().toString(36).slice(-8);
                // Register
                await fetch('/api/register', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: alias, password: randomPass })
                }).catch(()=>{});

                // Login
                const loginRes = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: alias, password: randomPass }) });
                if (!loginRes.ok) {
                    showToast('Auto-login failed. Please register manually.', 'error');
                    return;
                }
                const data = await loginRes.json();
                if (data && data.token) {
                    localStorage.setItem('awaaz_token', data.token);
                    showToast(`LINKED AND LOGGED IN AS ${alias}`, 'success');
                    window.location.hash = '#dashboard';
                }
            } catch (e) {
                console.error(e);
                showToast('Activation failed', 'error');
            }
        });
    }
}

// 8. Submit Violation Log View
function initSubmitController() {
    const latInput = document.getElementById('ipt-latitude');
    const lonInput = document.getElementById('ipt-longitude');
    const fetchGpsBtn = document.getElementById('btn-fetch-gps');
    
    // Incident buttons selectors
    const typeButtons = document.querySelectorAll('#incident-type-selector button');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => {
                b.className = "border-2 border-on-surface p-4 flex flex-col gap-3 text-left hover:bg-surface-container transition-all active:scale-[0.98]";
            });
            btn.className = "border-2 border-on-surface p-4 bg-primary text-on-primary shadow-[4px_4px_0px_#000] flex flex-col gap-3 text-left transition-all active:scale-[0.98]";
            console.log(`VIOLATION_TYPE_SELECTED // ${btn.getAttribute('data-type')}`);
        });
    });
    
    // Fetch Coordinates Action
    if (fetchGpsBtn) {
        fetchGpsBtn.addEventListener('click', () => {
            fetchGpsBtn.textContent = "LOCATING RELAY...";
            setTimeout(() => {
                // Generate random NCR Delhi bounds
                const lat = (28.5 + Math.random() * 0.2).toFixed(4);
                const lon = (77.1 + Math.random() * 0.2).toFixed(4);
                if (latInput) latInput.value = `${lat}° N`;
                if (lonInput) lonInput.value = `${lon}° E`;
                fetchGpsBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">check_circle</span> GPS_COORDINATES_STABLE';
            }, 1000);
        });
    }
    
    // Drag and Drop mockup
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.addEventListener('click', () => {
            showToast("MOCK UPLOAD TRIGGERED // EV_LOG_DUMP.RAW ASSOCIATED", 'info');
            dropZone.innerHTML = `
                <span class="material-symbols-outlined text-4xl text-tertiary">description</span>
                <div class="font-bold text-[10px] text-tertiary">EV_LOG_DUMP.RAW SUCCESSFULLY INDEXED</div>
                <div class="text-[8px] opacity-75 mt-1">SIZE: 4.8MB // ENCRYPTED STATUS: AES</div>`;
            dropZone.classList.add('border-tertiary');
        });
    }
    
    // Transmit button action
    const transmitBtn = document.getElementById('btn-transmit-report');
    if (transmitBtn) {
        transmitBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('awaaz_token');
            if (!token) {
                showToast('You must be logged in to submit a report. Use the Join/Register flow.', 'error');
                return;
            }

            // Gather payload
            const title = document.querySelector('#incident-type-selector button.bg-primary') ?
                document.querySelector('#incident-type-selector button.bg-primary').textContent.trim() : 'REPORT';
            const narrative = document.getElementById('ipt-narrative') ? document.getElementById('ipt-narrative').value : '';
            const latRaw = latInput ? latInput.value : '';
            const lonRaw = lonInput ? lonInput.value : '';
            // parse numeric lat/lon from strings like '17.3850° N' or plain numbers
            const parseCoord = (s) => parseFloat(s.replace(/[^0-9.-]/g, ''));
            const lat = parseCoord(latRaw);
            const lon = parseCoord(lonRaw);

            transmitBtn.innerHTML = 'TRANSMITTING ENCRYPTED PACKETS...';
            transmitBtn.classList.add('opacity-70');

            try {
                const res = await fetch('/api/reports', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ title, description: narrative, lat, lon, tags: [] })
                });

                if (!res.ok) {
                    const err = await res.json().catch(()=>({ error: 'Unknown' }));
                    showToast('Failed to submit report: ' + (err.error || res.statusText), 'error');
                    transmitBtn.innerHTML = 'TRANSMIT_REPORT';
                    transmitBtn.classList.remove('opacity-70');
                    return;
                }

                const json = await res.json();
                transmitBtn.innerHTML = 'TRANSMISSION SUCCESSFUL <span class="material-symbols-outlined text-sm">check_circle</span>';
                transmitBtn.className = "bg-tertiary text-on-tertiary font-bold px-10 py-4 flex items-center justify-center gap-3 border-2 border-on-background shadow-[4px_4px_0px_#000] cursor-default text-xs";
                showToast('Report submitted successfully', 'success');
                setTimeout(() => { window.location.hash = '#dashboard'; }, 800);
            } catch (e) {
                console.error(e);
                showToast('Submission failed: network error', 'error');
                transmitBtn.innerHTML = 'TRANSMIT_REPORT';
                transmitBtn.classList.remove('opacity-70');
            }
        });
    }
}

// Login / Register Controller
function initLoginController() {
    const usr = document.getElementById('login-username');
    const pwd = document.getElementById('login-password');
    const btnLogin = document.getElementById('btn-login-submit');
    const btnRegister = document.getElementById('btn-register-submit');

    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            const username = usr ? usr.value.trim() : '';
            const password = pwd ? pwd.value : '';
            if (!username || !password) return showToast('Enter username and password', 'error');
            try {
                const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
                const j = await r.json();
                if (!r.ok) return showToast('Login failed: ' + (j.error || 'unknown'), 'error');
                localStorage.setItem('awaaz_token', j.token);
                showToast('Login successful', 'success');
                window.location.hash = '#dashboard';
            } catch (e) {
                console.error(e);
                showToast('Login error', 'error');
            }
        });
    }

    if (btnRegister) {
        btnRegister.addEventListener('click', async () => {
            const username = usr ? usr.value.trim() : '';
            const password = pwd ? pwd.value : '';
            if (!username || !password) return showToast('Enter username and password', 'error');
            try {
                const r = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
                const j = await r.json();
                if (!r.ok) return showToast('Register failed: ' + (j.error || 'unknown'), 'error');
                showToast('Registration successful — you can now log in', 'success');
            } catch (e) {
                console.error(e);
                showToast('Registration error', 'error');
            }
        });
    }
}

// Chat widget initialization
function initChatWidget() {
    const openBtn = document.getElementById('chat-open-btn');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const clearBtn = document.getElementById('chat-clear');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    const promptButtons = document.querySelectorAll('.chat-prompt');

    const storageKey = 'awaaz_chat_history';

    const safeText = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[character]));

    function loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch (error) {
            return [];
        }
    }

    function saveHistory(history) {
        localStorage.setItem(storageKey, JSON.stringify(history.slice(-30)));
    }

    function renderBubble(role, text, meta = '') {
        const bubble = document.createElement('div');
        const isUser = role === 'user';
        bubble.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
        bubble.innerHTML = `
            <div class="max-w-[85%] ${isUser ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface'} border border-on-surface shadow-[3px_3px_0px_#000] px-3 py-2 ${isUser ? 'rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' : 'rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'}">
                <div class="text-[10px] uppercase tracking-widest opacity-70 mb-1 font-bold">${isUser ? 'You' : 'Awaaz Assistant'}</div>
                <div class="whitespace-pre-wrap leading-relaxed">${safeText(text)}</div>
                ${meta ? `<div class="text-[9px] opacity-70 mt-2">${safeText(meta)}</div>` : ''}
            </div>`;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
        return bubble;
    }

    function renderWelcome() {
        const history = loadHistory();
        messages.innerHTML = '';
        if (history.length > 0) {
            history.forEach(item => renderBubble(item.role, item.text, item.meta));
            return;
        }

        renderBubble(
            'assistant',
            'Ask about your rights, how to report surveillance, or what to do next. I can give step-by-step guidance and summarize the basics of the IT Act and DPDP Act.',
            'Starter prompt'
        );
    }

    if (!openBtn) return;
    openBtn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) renderWelcome();
    });
    if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
    if (clearBtn) clearBtn.addEventListener('click', () => {
        localStorage.removeItem(storageKey);
        renderWelcome();
        showToast('Chat cleared', 'success');
    });

    promptButtons.forEach(btn => btn.addEventListener('click', () => {
        if (!input) return;
        input.value = btn.textContent.trim();
        panel.classList.remove('hidden');
        input.focus();
    }));

    async function postQuestion(q) {
        if (!q) return;
        const history = loadHistory();
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        history.push({ role: 'user', text: q, meta: timestamp });
        saveHistory(history);
        renderBubble('user', q, timestamp);

        const typingBubble = renderBubble('assistant', 'Typing...', 'Please wait');
        try {
            const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }) });
            const j = await res.json();
            typingBubble.remove();

            const reply = j.body || j.title || 'No response';
            const replyMeta = j.title || 'Response';
            history.push({ role: 'assistant', text: reply, meta: replyMeta });
            saveHistory(history);
            renderBubble('assistant', reply, replyMeta);
        } catch (e) {
            console.error(e);
            typingBubble.remove();
            showToast('Chat request failed', 'error');
            renderBubble('assistant', 'I could not reach the assistant. Please try again in a moment.', 'Network error');
        }
    }

    if (sendBtn && input) {
        sendBtn.addEventListener('click', () => {
            const q = input.value.trim();
            if (!q) return;
            postQuestion(q);
            input.value = '';
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendBtn.click();
            }
        });
    }

    renderWelcome();
}

// Admin controller
function initAdminController() {
    const container = document.getElementById('admin-list');
    if (!container) return;
    container.innerHTML = '<div class="font-data-mono">Loading reports...</div>';

    async function load() {
        try {
            const token = localStorage.getItem('awaaz_token');
            const res = await fetch('/api/admin/reports', { headers: { 'Authorization': token ? 'Bearer ' + token : '' } });
            if (res.status === 403 || res.status === 401) {
                container.innerHTML = '<div class="text-error font-data-mono">Forbidden — admin access required.</div>';
                return;
            }
            const list = await res.json();
            if (!Array.isArray(list) || list.length === 0) { container.innerHTML = '<div class="font-data-mono">No reports found.</div>'; return; }
            container.innerHTML = '';
            list.forEach(r => {
                const el = document.createElement('div');
                el.className = 'bg-white p-4 border-2 border-black brutalist-card flex justify-between items-start';
                el.innerHTML = `<div class="flex-1">
                    <div class="font-bold">${r.title}</div>
                    <div class="text-[12px] text-on-surface-variant">${r.description || ''}</div>
                    <div class="text-[11px] font-data-mono mt-2">${r.lat}, ${r.lon} — ${new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                    <button data-id="${r.id}" class="btn-delete bg-error text-white px-3 py-1">Delete</button>
                    <button data-id="${r.id}" class="btn-flag bg-secondary text-white px-3 py-1">Flag</button>
                </div>`;
                container.appendChild(el);
            });

            // Attach handlers
            document.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', async (e) => {
                const id = b.getAttribute('data-id');
                if (!confirm) { /* noop to avoid polyfills */ }
                if (!window.confirm('Delete report?')) return;
                const token = localStorage.getItem('awaaz_token');
                const res = await fetch('/api/admin/reports/' + id, { method: 'DELETE', headers: { 'Authorization': token ? 'Bearer ' + token : '' } });
                if (res.ok) { showToast('Deleted', 'success'); load(); } else showToast('Delete failed', 'error');
            }));
            document.querySelectorAll('.btn-flag').forEach(b => b.addEventListener('click', async (e) => {
                const id = b.getAttribute('data-id');
                const token = localStorage.getItem('awaaz_token');
                const res = await fetch('/api/admin/flag/' + id, { method: 'POST', headers: { 'Authorization': token ? 'Bearer ' + token : '' } });
                if (res.ok) { showToast('Flagged', 'success'); load(); } else showToast('Flag failed', 'error');
            }));

        } catch (e) {
            console.error(e);
            container.innerHTML = '<div class="text-error">Error loading reports</div>';
        }
    }
    load();
}
