/**
 * grok-assistant.js
 * Frontend Client for the Secure Grok Learning Assistant
 * 
 * Features:
 * - Floating circular button (bottom-right) styled with Neo-Brutalist tokens.
 * - Collapsible AI chat panel with quick question chips.
 * - Live context-aware Q&A (sessions, streaks, progress, revision tips).
 * - Safe rendering, typing state, clear conversation, error handling.
 * - NO API keys in frontend (all calls route through POST /api/ai/chat).
 */

(function () {
    let grokPanelOpen = false;
    let grokConversation = [];
    let grokIsLoading = false;
    let studentUser = null;

    // Neo-Brutalist Styles for Grok Assistant
    const grokStyles = `
        #grokFloatingBtn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #4f46e5;
            color: #ffffff;
            border: 2.5px solid #18181b;
            box-shadow: 3px 3px 0px #18181b;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            cursor: pointer;
            z-index: 1050;
            transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        #grokFloatingBtn:hover {
            transform: translate(-2px, -2px);
            box-shadow: 5px 5px 0px #18181b;
            background: #4338ca;
        }
        #grokFloatingBtn:active {
            transform: translate(1px, 1px);
            box-shadow: 2px 2px 0px #18181b;
        }
        #grokChatPanel {
            position: fixed;
            bottom: 86px;
            right: 24px;
            width: 380px;
            max-width: calc(100vw - 32px);
            height: 530px;
            max-height: calc(100vh - 110px);
            background: #ffffff;
            border: 3px solid #18181b;
            border-radius: 12px;
            box-shadow: 7px 7px 0px #18181b;
            display: none;
            flex-direction: column;
            z-index: 1050;
            overflow: hidden;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            animation: grokSlideUp 0.18s ease-out;
        }
        @keyframes grokSlideUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .grok-header {
            background: #f8fafc;
            border-bottom: 2.5px solid #18181b;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .grok-header-title {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .grok-badge-pill {
            font-size: 0.65rem;
            font-family: var(--font-mono, monospace);
            font-weight: 700;
            padding: 2px 6px;
            background: #ede9fe;
            color: #4f46e5;
            border: 1.5px solid #18181b;
            border-radius: 4px;
        }
        .grok-actions {
            display: flex;
            gap: 6px;
        }
        .grok-btn-icon {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px 6px;
            border-radius: 4px;
            color: #475569;
            font-size: 0.95rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .grok-btn-icon:hover {
            background: #e2e8f0;
            color: #0f172a;
        }
        .grok-chips-bar {
            padding: 8px 12px;
            background: #f1f5f9;
            border-bottom: 1.5px solid #18181b;
            display: flex;
            gap: 6px;
            overflow-x: auto;
            white-space: nowrap;
        }
        .grok-chips-bar::-webkit-scrollbar {
            height: 3px;
        }
        .grok-chip {
            background: #ffffff;
            border: 1.5px solid #18181b;
            border-radius: 14px;
            font-size: 0.72rem;
            font-weight: 600;
            padding: 3px 9px;
            cursor: pointer;
            color: #1e293b;
            box-shadow: 1px 1px 0px #18181b;
            transition: all 0.1s ease;
        }
        .grok-chip:hover {
            background: #ede9fe;
            color: #4338ca;
            transform: translate(-1px, -1px);
            box-shadow: 2px 2px 0px #18181b;
        }
        .grok-messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #ffffff;
        }
        .grok-msg {
            max-width: 86%;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 0.84rem;
            line-height: 1.48;
            word-wrap: break-word;
        }
        .grok-msg-assistant {
            align-self: flex-start;
            background: #f8fafc;
            color: #0f172a;
            border: 2px solid #18181b;
            box-shadow: 2px 2px 0px #18181b;
        }
        .grok-msg-user {
            align-self: flex-end;
            background: #4f46e5;
            color: #ffffff;
            border: 2px solid #18181b;
            box-shadow: 2px 2px 0px #18181b;
        }
        .grok-typing-bubble {
            align-self: flex-start;
            background: #f8fafc;
            border: 1.5px solid #18181b;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.78rem;
            color: #64748b;
            display: none;
            align-items: center;
            gap: 6px;
        }
        .grok-dot {
            width: 6px;
            height: 6px;
            background: #6366f1;
            border-radius: 50%;
            display: inline-block;
            animation: grokBounce 1.2s infinite ease-in-out both;
        }
        .grok-dot:nth-child(1) { animation-delay: -0.32s; }
        .grok-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes grokBounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        .grok-input-area {
            border-top: 2.5px solid #18181b;
            background: #f8fafc;
            padding: 10px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .grok-input {
            flex: 1;
            border: 2px solid #18181b;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 0.85rem;
            background: #ffffff;
            outline: none;
        }
        .grok-input:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
        .grok-send-btn {
            background: #18181b;
            color: #ffffff;
            border: 2px solid #18181b;
            border-radius: 6px;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.12s ease;
        }
        .grok-send-btn:hover {
            background: #4f46e5;
            transform: translate(-1px, -1px);
            box-shadow: 2px 2px 0px #18181b;
        }
        .grok-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
    `;

    function injectStyles() {
        if (document.getElementById('grokAssistantStyles')) return;
        const styleEl = document.createElement('style');
        styleEl.id = 'grokAssistantStyles';
        styleEl.innerHTML = grokStyles;
        document.head.appendChild(styleEl);
    }

    function createGrokUi(user) {
        if (document.getElementById('grokFloatingBtn')) return;

        injectStyles();

        // 1. Floating Action Button
        const fab = document.createElement('button');
        fab.id = 'grokFloatingBtn';
        fab.type = 'button';
        fab.title = 'Ask Grok Learning Assistant';
        fab.innerHTML = '<i class="bi bi-robot"></i>';
        fab.onclick = toggleGrokPanel;

        // 2. Chat Panel
        const panel = document.createElement('div');
        panel.id = 'grokChatPanel';
        panel.innerHTML = `
            <div class="grok-header">
                <div class="grok-header-title">
                    <span style="font-weight: 800; font-size: 0.95rem; color: #0f172a; font-family: 'Space Grotesk', sans-serif;">Grok Assistant</span>
                    <span class="grok-badge-pill">STUDENT COPILOT</span>
                </div>
                <div class="grok-actions">
                    <button class="grok-btn-icon" title="Clear Conversation" onclick="window.clearGrokConversation()">
                        <i class="bi bi-trash3"></i>
                    </button>
                    <button class="grok-btn-icon" title="Close Panel" onclick="window.toggleGrokPanel()">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>

            <!-- Quick Suggestion Chips -->
            <div class="grok-chips-bar">
                <button class="grok-chip" onclick="window.sendGrokQuickPrompt('When is my next session?')">📅 Next Session</button>
                <button class="grok-chip" onclick="window.sendGrokQuickPrompt('What is my learning streak?')">🔥 My Streak</button>
                <button class="grok-chip" onclick="window.sendGrokQuickPrompt('What did I learn in the last session?')">📘 Last Class</button>
                <button class="grok-chip" onclick="window.sendGrokQuickPrompt('What topics should I revise?')">💡 Revise Topics</button>
                <button class="grok-chip" onclick="window.sendGrokQuickPrompt('What is my current skill progress?')">📊 Progress</button>
            </div>

            <!-- Messages Stream Area -->
            <div class="grok-messages-container" id="grokMessagesContainer">
                <div class="grok-msg grok-msg-assistant">
                    👋 Hi <strong>${escapeHtml(user.fullName || 'Student')}</strong>! I'm <strong>Grok</strong>, your campus Skill Exchange Learning Assistant.
                    <div class="mt-2 text-muted" style="font-size:0.78rem;">
                        I have access to your active exchanges, scheduled sessions, daily streak, and verified learning records. Ask me anything to prepare for your peer classes!
                    </div>
                </div>
            </div>

            <!-- Typing Indicator -->
            <div class="px-3 py-1">
                <div class="grok-typing-bubble" id="grokTypingIndicator">
                    <span class="grok-dot"></span>
                    <span class="grok-dot"></span>
                    <span class="grok-dot"></span>
                    <span>Grok is thinking...</span>
                </div>
            </div>

            <!-- Input Bar -->
            <form class="grok-input-area" id="grokInputForm" onsubmit="window.handleGrokFormSubmit(event)">
                <input type="text" class="grok-input" id="grokInputField" placeholder="Ask about sessions, streaks, revision..." maxlength="1000" autocomplete="off">
                <button type="submit" class="grok-send-btn" id="grokSendBtn" title="Send Question">
                    <i class="bi bi-arrow-up-short" style="font-size:1.4rem;"></i>
                </button>
            </form>
        `;

        document.body.appendChild(fab);
        document.body.appendChild(panel);
    }

    function toggleGrokPanel() {
        const panel = document.getElementById('grokChatPanel');
        if (!panel) return;
        grokPanelOpen = !grokPanelOpen;
        panel.style.display = grokPanelOpen ? 'flex' : 'none';
        if (grokPanelOpen) {
            document.getElementById('grokInputField')?.focus();
            scrollToBottom();
        }
    }

    function scrollToBottom() {
        const c = document.getElementById('grokMessagesContainer');
        if (c) c.scrollTop = c.scrollHeight;
    }

    function clearGrokConversation() {
        grokConversation = [];
        const container = document.getElementById('grokMessagesContainer');
        if (container) {
            container.innerHTML = `
                <div class="grok-msg grok-msg-assistant">
                    Conversation reset. Ask me a question about your upcoming sessions, streak, or exchange topics!
                </div>
            `;
        }
    }

    function sendGrokQuickPrompt(text) {
        const input = document.getElementById('grokInputField');
        if (input) {
            input.value = text;
            handleGrokSend(text);
        }
    }

    async function handleGrokFormSubmit(e) {
        if (e && e.preventDefault) e.preventDefault();
        const input = document.getElementById('grokInputField');
        if (!input) return;
        const msg = input.value.trim();
        if (!msg) return;
        input.value = '';
        await handleGrokSend(msg);
    }

    async function handleGrokSend(userText) {
        if (grokIsLoading || !userText) return;

        const container = document.getElementById('grokMessagesContainer');
        const typing = document.getElementById('grokTypingIndicator');
        const sendBtn = document.getElementById('grokSendBtn');

        // 1. Append User Message
        const userMsgEl = document.createElement('div');
        userMsgEl.className = 'grok-msg grok-msg-user';
        userMsgEl.textContent = userText;
        container.appendChild(userMsgEl);
        scrollToBottom();

        grokConversation.push({ role: 'user', content: userText });

        // 2. Set Loading State
        grokIsLoading = true;
        if (typing) typing.style.display = 'inline-flex';
        if (sendBtn) sendBtn.disabled = true;
        scrollToBottom();

        try {
            const res = await API.post('/api/ai/chat', {
                message: userText,
                history: grokConversation.slice(-6)
            });

            if (res && res.success && res.data && res.data.answer) {
                const answer = res.data.answer;
                grokConversation.push({ role: 'assistant', content: answer });

                const botMsgEl = document.createElement('div');
                botMsgEl.className = 'grok-msg grok-msg-assistant';
                botMsgEl.innerHTML = formatGrokMarkdown(answer);
                container.appendChild(botMsgEl);
            } else {
                const errorMsg = (res && res.message) ? res.message : "AI assistant is temporarily unavailable. Please try again.";
                const errEl = document.createElement('div');
                errEl.className = 'grok-msg grok-msg-assistant';
                errEl.style.borderColor = '#ef4444';
                errEl.style.background = '#fef2f2';
                errEl.innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-exclamation-triangle-fill me-1"></i> ${escapeHtml(errorMsg)}</span>`;
                container.appendChild(errEl);
            }
        } catch (err) {
            console.error("Grok chat error:", err);
            const errEl = document.createElement('div');
            errEl.className = 'grok-msg grok-msg-assistant';
            errEl.style.borderColor = '#ef4444';
            errEl.style.background = '#fef2f2';
            errEl.innerHTML = `<span class="text-danger"><i class="bi bi-wifi-off me-1"></i> Connection failed. Please check your network.</span>`;
            container.appendChild(errEl);
        } finally {
            grokIsLoading = false;
            if (typing) typing.style.display = 'none';
            if (sendBtn) sendBtn.disabled = false;
            scrollToBottom();
            document.getElementById('grokInputField')?.focus();
        }
    }

    function formatGrokMarkdown(text) {
        if (!text) return "";
        let formatted = escapeHtml(text);

        // Bold: **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic: *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Bullet lists: - item or • item
        formatted = formatted.replace(/^[\s]*[-•]\s+(.*)$/gm, '<li class="ms-3">$1</li>');

        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    function escapeHtml(text) {
        if (!text) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Public Initializer
    window.initGrokAssistant = function (user) {
        if (!user || !user.authenticated) {
            const fab = document.getElementById('grokFloatingBtn');
            const panel = document.getElementById('grokChatPanel');
            if (fab) fab.remove();
            if (panel) panel.remove();
            return;
        }
        studentUser = user;
        createGrokUi(user);
    };

    window.toggleGrokPanel = toggleGrokPanel;
    window.clearGrokConversation = clearGrokConversation;
    window.sendGrokQuickPrompt = sendGrokQuickPrompt;
    window.handleGrokFormSubmit = handleGrokFormSubmit;

})();
