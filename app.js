/**
 * MainVoice AI — Chat UI & Interaction
 */

(function () {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const modelSwitchBtn = document.getElementById('model-switch-btn');

    function scrollToChat() {
        document.getElementById('chat-section').scrollIntoView({ behavior: 'smooth' });
    }
    window.scrollToChat = scrollToChat;

    function addMessage(content, isUser = false, imageUrl = null) {
        const wrap = document.createElement('div');
        wrap.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = isUser ? '✓' : '◉';

        const body = document.createElement('div');
        body.className = 'message-content';

        if (typeof content === 'string' && content.trim() !== '') {
            const p = document.createElement('p');
            p.innerHTML = formatResponse(content);
            body.appendChild(p);
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }

        wrap.appendChild(avatar);
        wrap.appendChild(body);
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatResponse(text) {
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        const parts = html.split(/\n\n+/);
        const nodes = parts.map(p => {
            const trimmed = p.trim();
            if (!trimmed) return '';
            if (/^[•\-]\s/m.test(trimmed)) {
                const items = trimmed.split(/\n/).map(line => {
                    const content = line.replace(/^[•\-]\s*/, '');
                    return content ? `<li>${content}</li>` : '';
                }).filter(Boolean).join('');
                return items ? `<ul>${items}</ul>` : `<p>${trimmed}</p>`;
            }
            return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
        });
        return nodes.filter(Boolean).join('');
    }

    function showTypingIndicator() {
        const wrap = document.createElement('div');
        wrap.className = 'message ai-message';
        wrap.id = 'typing-indicator';
        wrap.innerHTML = `
            <div class="message-avatar">◉</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    function createContentNode(html) {
        const div = document.createElement('div');
        div.innerHTML = formatResponse(html);
        return div;
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        chatInput.style.height = 'auto';

        addMessage(text, true);
        sendBtn.disabled = true;
        showTypingIndicator();

        try {
            const response = await MainVoiceAI.respond(text);
            removeTypingIndicator();
            addMessage(response, false);
        } catch (e) {
            removeTypingIndicator();
            addMessage("I'm sorry, I'm having trouble right now. Please try again, or reach out to a counselor or crisis line if you need support. You matter.", false);
        }

        sendBtn.disabled = false;
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (modelSwitchBtn) {
        const updateModelBtnUI = (model) => {
            modelSwitchBtn.textContent = model === 'gemini' ? 'PRO' : 'FLASH';
            modelSwitchBtn.setAttribute('data-model', model);
        };
        
        const initialModel = localStorage.getItem('selectedModel') || 'gemini';
        updateModelBtnUI(initialModel);
        
        modelSwitchBtn.addEventListener('click', () => {
            MainVoiceAI.switchModel();
            updateModelBtnUI(MainVoiceAI.currentModel);
        });
    }

    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        chatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
})();

// --- QUIZZES LOGIC ---

function switchQuiz(id) {
    document.querySelectorAll('.quiz-container').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.quiz-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelector(`.quiz-tab[onclick="switchQuiz('${id}')"]`).classList.add('active');
}

function calculateLifeStress() {
    const form = document.getElementById('life-stress-form');
    let total = 0;
    let allAnswered = true;

    for (let i = 1; i <= 5; i++) {
        const selected = form.querySelector(`input[name="ls_q${i}"]:checked`);
        if (selected) {
            total += parseInt(selected.value);
        } else {
            allAnswered = false;
        }
    }

    const errorDiv = document.getElementById('ls-error');
    if (!allAnswered) {
        errorDiv.style.display = 'block';
        return;
    }

    errorDiv.style.display = 'none';
    form.style.display = 'none';

    const resultBox = document.getElementById('life-stress-result');
    resultBox.style.display = 'block';

    // Animate score circle
    const degree = (total / 20) * 360;
    setTimeout(() => {
        resultBox.querySelector('.score-circle').style.setProperty('--score-deg', `${degree}deg`);
        animateValue("ls-score-display", 0, total, 1000);
    }, 100);

    let title, text;
    if (total <= 6) {
        title = "Low Stress";
        text = "Your score suggests you are currently experiencing low levels of stress. You seem to be managing daily challenges effectively and maintaining a healthy balance. Continue with your current coping strategies, such as the CBT and mindfulness exercises found in our self-help manual.";
        resultBox.querySelector('.score-circle').style.background = `conic-gradient(var(--color-sage) var(--score-deg, 0deg), var(--color-border) 0deg)`;
    } else if (total <= 13) {
        title = "Moderate Stress";
        text = "Your score indicates a moderate level of stress. This is common, but it's important to monitor it. You might occasionally feel overwhelmed by unexpected events. Setting aside time for our Breathing Exercises or practicing Emotional Articulation with MainVoice AI can help bring things back into focus.";
        resultBox.querySelector('.score-circle').style.background = `conic-gradient(#f59e0b var(--score-deg, 0deg), var(--color-border) 0deg)`;
    } else {
        title = "High Perceived Stress";
        text = "Your score is high, indicating that you frequently feel overwhelmed and out of control. It's crucial to prioritize self-care right now. Please explore our Self-Help Manual for Grounding Techniques, and consider speaking to a counselor or using our Crisis Resources if things feel unmanageable.";
        resultBox.querySelector('.score-circle').style.background = `conic-gradient(#ef4444 var(--score-deg, 0deg), var(--color-border) 0deg)`;
    }

    document.getElementById('ls-status-title').innerText = title;
    document.getElementById('ls-interpretation').innerText = text;
}

function calculateStudyStress() {
    const form = document.getElementById('study-stress-form');
    let total = 0;
    let allAnswered = true;

    for (let i = 1; i <= 5; i++) {
        const selected = form.querySelector(`input[name="ss_q${i}"]:checked`);
        if (selected) {
            total += parseInt(selected.value);
        } else {
            allAnswered = false;
        }
    }

    const errorDiv = document.getElementById('ss-error');
    if (!allAnswered) {
        errorDiv.style.display = 'block';
        return;
    }

    errorDiv.style.display = 'none';
    form.style.display = 'none';

    const resultBox = document.getElementById('study-stress-result');
    resultBox.style.display = 'block';

    const degree = (total / 20) * 360;
    setTimeout(() => {
        resultBox.querySelector('.score-circle').style.setProperty('--score-deg', `${degree}deg`);
        animateValue("ss-score-display", 0, total, 1000);
    }, 100);

    let title, text;
    if (total <= 7) {
        title = "Healthy Academic Pressure";
        text = "You are managing your academic workload well. While you may occasionally face deadlines, they do not disrupt your daily life or sleep. Keep utilizing your current time-management and relaxation techniques.";
        resultBox.querySelector('.score-circle').style.background = `conic-gradient(var(--color-sage) var(--score-deg, 0deg), var(--color-border) 0deg)`;
    } else if (total <= 14) {
        title = "Moderate Academic Stress";
        text = "You are under significant academic pressure. School demands might sometimes interfere with your sleep or cause anxiety. Consider breaking tasks into smaller steps (Behavioural Activation) and taking proactive breaks from studying.";
        resultBox.querySelector('.score-circle').style.background = `conic-gradient(#f59e0b var(--score-deg, 0deg), var(--color-border) 0deg)`;
    } else {
        title = "Severe Academic Burnout Risk";
        text = "School is causing you severe distress and taking a toll on your wellbeing. This level of stress is unsustainable and can lead to burnout. It is highly recommended that you speak to a school counselor to discuss workload adjustments or support systems.";
        resultBox.querySelector('.score-circle').style.background = `conic-gradient(#ef4444 var(--score-deg, 0deg), var(--color-border) 0deg)`;
    }

    document.getElementById('ss-status-title').innerText = title;
    document.getElementById('ss-interpretation').innerText = text;
}

function resetQuiz(id) {
    const form = document.getElementById(id + '-form');
    const resultBox = document.getElementById(id + '-result');
    form.reset();
    form.style.display = 'block';
    resultBox.style.display = 'none';
    resultBox.querySelector('.score-circle').style.setProperty('--score-deg', '0deg');
    const displayId = id === 'life-stress' ? 'ls-score-display' : 'ss-score-display';
    document.getElementById(displayId).innerHTML = '0';
}

function animateValue(id, start, end, duration) {
    if (start === end) {
        document.getElementById(id).innerHTML = end;
        return;
    }
    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / range));
    let obj = document.getElementById(id);
    let timer = setInterval(function () {
        current += increment;
        obj.innerHTML = current;
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}
