document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const streakCounter = document.getElementById('streak-counter');
    const badge3 = document.getElementById('badge-3');
    const badge7 = document.getElementById('badge-7');
    const badge14 = document.getElementById('badge-14');
    
    const challengeText = document.getElementById('challenge-text');
    const challengeLoader = document.getElementById('challenge-loader');
    const refreshBtn = document.getElementById('refresh-btn');
    const completeBtn = document.getElementById('complete-btn');
    const successMessage = document.getElementById('success-message');
    const habitContext = document.getElementById('habit-context');
    const personalizeBtn = document.getElementById('personalize-btn');

    // Storage Keys
    const STREAK_KEY = 'mainvoice_habit_streak';
    const LAST_DATE_KEY = 'mainvoice_habit_last_date';
    const TODAYS_TASK_KEY = 'mainvoice_habit_current_task_v2';

    let currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
    let lastCompletedDate = localStorage.getItem(LAST_DATE_KEY); // Format: YYYY-MM-DD
    let todaysTask = localStorage.getItem(TODAYS_TASK_KEY);

    const detectOutputLanguage = (text) => {
        const t = (text || '').trim();
        if (!t) return { code: 'en', label: 'English' };

        // CJK Unified Ideographs + common fullwidth punctuation ranges
        const hasChinese = /[\u4E00-\u9FFF]/.test(t);
        if (hasChinese) return { code: 'zh', label: 'Chinese (Simplified)' };

        // Basic heuristic: default to English for other scripts for now
        return { code: 'en', label: 'English' };
    };

    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    };

    const getYesterdayString = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    };

    const updateBadges = () => {
        if (currentStreak >= 3) badge3.classList.remove('locked');
        else badge3.classList.add('locked');
        
        if (currentStreak >= 7) badge7.classList.remove('locked');
        else badge7.classList.add('locked');
        
        if (currentStreak >= 14) badge14.classList.remove('locked');
        else badge14.classList.add('locked');
    };

    const updateStatsUI = () => {
        streakCounter.textContent = currentStreak;
        updateBadges();
    };

    const verifyStreakContinuity = () => {
        const today = getTodayString();
        const yesterday = getYesterdayString();

        if (lastCompletedDate) {
            // If they didn't complete it today or yesterday, they broke the streak
            if (lastCompletedDate !== today && lastCompletedDate !== yesterday) {
                currentStreak = 0;
                localStorage.setItem(STREAK_KEY, '0');
            }
        }
        updateStatsUI();
    };

    const setChallengeText = (text) => {
        challengeText.textContent = text;
        todaysTask = text;
        localStorage.setItem(TODAYS_TASK_KEY, todaysTask);
    };

    const getModelConfig = () => {
        const aiEngine = window.MainVoiceAI;
        if (!aiEngine) return null;
        const model = aiEngine.currentModel === 'pro' ? 'pro' : 'flash';
        return model === 'pro' ? aiEngine.models.pro : aiEngine.models.flash;
    };

    const generateChallenge = async (mode = 'random') => {
        const aiEngine = window.MainVoiceAI;
        const modelConfig = getModelConfig();
        if (!aiEngine || !modelConfig?.key) {
            setChallengeText("AI engine requires the DeepSeek API key to operate.");
            return;
        }

        challengeText.style.display = 'none';
        challengeLoader.style.display = 'flex';
        refreshBtn.disabled = true;
        if (personalizeBtn) personalizeBtn.disabled = true;

        try {
            const context = (habitContext?.value || '').trim();
            const lang = detectOutputLanguage(context);

            // Prompt specifically asking for a short task
            const prompt = `You are a therapeutic mental health AI companion.
Generate a quick, actionable "Daily Micro-Habit Challenge" that takes 5–15 minutes.
The challenge should be based on CBT, Behavioral Activation, Mindfulness, or prevention principles.
It must be suitable for teens/young adults, practical, warm, and not childish.

If the user shares context, tailor the challenge to it. If not, generate a broadly helpful challenge.

USER CONTEXT (may be empty):
${context ? context : "(none)"}

Output ONLY the task text (1–2 sentences max). No title. No bullet points.

Example: Write down one thing you accomplished today, no matter how small, and give yourself credit for it.
Example: Drink a full glass of water and focus on the sensation and temperature while you drink.

CRITICAL: The user wrote their context in "${lang.label}". You MUST output the task strictly in "${lang.label}".`;

            
            const response = await fetch("https://api.deepseek.com/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${modelConfig.key}`
                },
                body: JSON.stringify({
                    model: modelConfig.name,
                    messages: [
                        { role: "system", content: "You are a warm, healing mental health companion." },
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!response.ok) throw new Error("API request failed.");

            const data = await response.json();
            const habitText = (data.choices?.[0]?.message?.content || '').trim();
            if (!habitText) throw new Error("Empty model response.");

            setChallengeText(habitText);

        } catch (error) {
            console.error(error);
            const context = (habitContext?.value || '').trim();
            const lang = detectOutputLanguage(context);
            if (lang.code === 'zh') {
                setChallengeText("做 5 次缓慢深呼吸，把注意力放在胸口起伏的感觉上。（备用挑战）");
            } else {
                setChallengeText("Take 5 slow deep breaths and focus on the feeling of your chest rising and falling. (Fallback challenge)");
            }
        } finally {
            challengeLoader.style.display = 'none';
            challengeText.style.display = 'block';
            refreshBtn.disabled = false;
            if (personalizeBtn) personalizeBtn.disabled = false;
        }
    };

    const markCompleted = () => {
        const today = getTodayString();
        // If not already completed today
        if (lastCompletedDate !== today) {
            currentStreak += 1;
            lastCompletedDate = today;
            
            localStorage.setItem(STREAK_KEY, currentStreak.toString());
            localStorage.setItem(LAST_DATE_KEY, lastCompletedDate);
            
            updateStatsUI();
        }

        // UI transformation
        completeBtn.style.display = 'none';
        refreshBtn.style.display = 'none';
        successMessage.style.display = 'block';
        
        const card = document.getElementById('challenge-card');
        card.style.borderColor = 'var(--color-sage)';
        card.style.background = 'var(--color-sage-light)';
    };

    // Events
    refreshBtn.addEventListener('click', () => generateChallenge('random'));
    if (personalizeBtn) {
        personalizeBtn.addEventListener('click', () => generateChallenge('personalized'));
    }
    completeBtn.addEventListener('click', markCompleted);

    // Initialization logic
    verifyStreakContinuity();

    const todayStr = getTodayString();
    if (lastCompletedDate === todayStr) {
        // Already completed today
        if (todaysTask) challengeText.textContent = todaysTask;
        else challengeText.textContent = "You've already completed your micro-habit for today! Come back tomorrow.";
        
        completeBtn.style.display = 'none';
        refreshBtn.style.display = 'none';
        successMessage.style.display = 'block';
        const card = document.getElementById('challenge-card');
        card.style.borderColor = 'var(--color-sage)';
        card.style.background = 'var(--color-sage-light)';

    } else {
        // Needs to do a task today
        if (todaysTask) {
            challengeText.textContent = todaysTask;
        } else {
            generateChallenge();
        }
    }
});
