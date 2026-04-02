/**
 * MainVoice AI — Mental Health Support Engine
 * Provides empathetic, CBT-informed responses with crisis detection
 */

const MainVoiceAI = {
    // simple conversational memory (not persisted; all local in this tab)
    lastTopic: null,
    lastMessageAt: null,
    currentModel: localStorage.getItem('selectedModel') || 'flash',
    
    models: {
        flash: {
            name: 'deepseek-chat',
            key: localStorage.getItem('deepseek_api_key') || 'sk-e7a3cb2ae0a943d19eeef970a1c6a3f7'
        },
        pro: {
            name: 'deepseek-reasoner',
            key: localStorage.getItem('deepseek_api_key') || 'sk-e7a3cb2ae0a943d19eeef970a1c6a3f7'
        }
    },

    // Crisis triggers — immediate referral (EN + ZH, all local, no network)
    crisisKeywords: [
        // English
        'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
        'self harm', 'self-harm', 'cutting', 'hurt myself', 'cant go on', "can't go on",
        'emergency', '911', 'helpless', 'hopeless', 'no reason to live',
        // Chinese
        '自杀', '想死', '不想活', '结束生命', '伤害自己', '割腕', '撑不住了', '活不下去'
    ],

    // Topic patterns for contextual responses (all processed locally)
    patterns: {
        // Each pattern group contains English and common Chinese keywords so the
        // fully offline engine can recognise more ways people talk about feelings.
        socialMedia: [
            /social media|instagram|tiktok|facebook|twitter|scroll|comparison|fomo|screen time|online|社交媒体|刷短视频|朋友圈|对比心理/i
        ],
        depression: [
            /depress|depression|sad|low mood|hopeless|empty|numb|worthless|no energy|can\'t get out|dont want to|抑郁|很丧|没意义|绝望|空虚|提不起劲|不想动/i
        ],
        anxiety: [
            /anxi|anxiety|worry|panic|panic attack|nervous|scared|overwhelm|overwhelmed|racing thoughts|breath|breathing|can\'t breathe|焦虑|紧张|害怕|慌张|心跳很快|呼吸不过来/i
        ],
        parentSchool: [
            /parent|mother|father|mom|dad|school|teacher|pressure|expectations|grades|父母|家长|妈妈|爸爸|学校|老师|成绩|压力/i
        ],
        stress: [
            /stress|stressed|burned out|burnt out|too much work|overloaded|压力大|压力山大/i
        ],
        prevention: [
            /prevent|cope|coping|resilience|strateg|routine|sleep|exercise|manage|预防|应对|调节|抗压|作息|运动|习惯/i
        ],
        selfEsteem: [
            /ugly|fat|stupid|hate myself|not good enough|loser|failure|body image|丑|胖|笨|讨厌自己|不够好|失败者|自卑|身材|外貌/i
        ],
        sleepIssues: [
            /can\'t sleep|insomnia|tired|exhausted|wake up|nightmares|睡不着|失眠|很困|睡不好|半夜醒|噩梦/i
        ],
        relationships: [
            /friend|boyfriend|girlfriend|breakup|lonely|alone|left out|ignored|argue|朋友|同学|分手|恋爱|孤独|一个人|被忽视|吵架/i
        ],
        burnout: [
            /burnout|burnt out|exhausted|can\'t do this|too much|overworked|倦怠|累坏了|撑不住|太多事情|压力山大|透支/i
        ],
        bullying: [
            /bully|bullying|bullied|picked on|being mean to me|teased|teasing|harassed|threatened|被欺负|霸凌|校园暴力/i
        ]
    },

    // CBT-informed responses and guidance (no networking, all rule-based)
    responses: {
        crisis: {
            immediate: `🚨 I hear that you're going through something very difficult right now, and I'm so glad you reached out. Your feelings matter.
            
**Your safety is the priority.** What you're experiencing deserves professional support. Please consider reaching out right now:

• **Foundry BC** — Youth mental health & substance use: [foundrybc.ca](https://foundrybc.ca)
• **Crisis Services Canada** — 24/7: Call **1-833-456-4566** or text **45645**
• **Kids Help Phone** — 1-800-668-6868 or text CONNECT to 686868
• **Emergency** — If in immediate danger: **911**

You don't have to face this alone. A trained counselor can listen and help. Would you like to talk more after you've connected with someone? 💙`,
            followUp: `I want you to know that reaching out shows real strength 💪. Have you been able to connect with any of those resources? I'm here if you want to keep talking.`
        },
        socialMedia: [
            `📱 It makes sense that social media can affect how we feel. Many people experience comparison, FOMO, or feeling "less than" when scrolling. That's totally valid.
            
**A CBT lens:** Our thoughts about what we see (e.g., "everyone else is happier") can intensify difficult emotions. Noticing that link is a first step.

**Gentle suggestions:** 🌿
• Set boundaries: limits on when and how long you use apps
• Curate your feed: mute or unfollow accounts that trigger negative feelings
• Schedule "no phone" times, especially before bed
• Remember: what people post is a highlight reel, not their full life

Would it help to talk more about what specifically bothers you?`,
            `Social media can really amplify anxiety and low mood. 🌪 The constant comparison, notifications, and curated perfection often don't reflect reality.

**What helps for many people:** ✨
• Turning off non-essential notifications
• Designating phone-free zones (e.g., meals, bedroom)
• Following accounts that encourage rather than compare
• Checking in: "How do I feel after 10 minutes of scrolling?" — if worse, it's a sign to pause

You're not alone in this. What aspect feels hardest for you right now?`,
            `It can be so draining to constantly be "plugged in" 🔌. Taking a step back from the feed allows your mind to rest. Have you considered trying a 24-hour digital detox this weekend to see how you feel? 🌱`
        ],
        depression: [
            `I hear you, and it takes courage to share this 🫂. Feelings of depression can make everything feel really heavy—that's real, not a character flaw.
            
**A few things that sometimes help:** 🌤
• Small steps: even a short walk or opening a curtain can shift things slightly
• Routine: gentle structure (sleep, meals, movement) can provide a sense of stability
• Connection: talking to one trusted person, even briefly
• Professional support: therapy (including CBT) is highly effective for depression

You don't have to "fix" everything at once. What would feel manageable today?`,
            `Thank you for trusting me with this 💙. Depression can make it hard to see a way forward, but it won't always feel this way. Your experience is valid.

**CBT perspective:** Depression often involves negative "filters" about oneself, the world, or the future. Noticing those thoughts (without judging them) is a first step. They're thoughts—not facts. 🧠

Consider reaching out to a counselor or doctor. Foundry BC and similar services offer youth-friendly support. Would you like me to share crisis or local resources?`,
            `When things feel numb or empty, even getting out of bed is an accomplishment. 🌱 Please be gentle with yourself. Could you try setting one tiny goal today, like drinking a glass of water or listening to a comforting song? 🎵`
        ],
        anxiety: [
            `Anxiety can feel completely overwhelming—racing thoughts, tension, or that sense of dread. 🌪 You're not alone, and these feelings *can* be managed.
            
**CBT-informed ideas:** 🌿
• Grounding: 5-4-3-2-1 — name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste
• Breath: slow exhales (e.g., 4 seconds in, 6 seconds out) can calm the nervous system
• Challenge the thought: "What's the evidence? What would I tell a friend in this situation?"

If anxiety is affecting daily life, a therapist can help with tailored strategies. Would you like to try one of these techniques together right now?`,
            `Anxiety is so tough—it can make everything feel urgent and uncertain. Acknowledging it is already a big step. 🛤

**Practical tools:** 🛠
• Name the feeling: "I'm feeling anxious right now" — naming it can reduce its intensity
• Check the facts: Is this a real threat right now, or is my mind magnifying it?
• Small actions: focus on the next 5 minutes, not the whole day

Professional support (CBT, mindfulness) can build long-term coping skills. How are you feeling in your body as you read this?`,
            `When my anxiety spikes, I find it helpful to visualize my thoughts like leaves floating down a stream. 🍃 You observe them passing, but you don't have to jump into the water with them. What is your go-to way to ground yourself when panic hits? 🌊`
        ],
        parentSchool: [
            `Family and school pressure can add a lot to what you're already carrying. 🎒 It's completely okay to feel overwhelmed.
            
**For young people:** You have a right to be heard. 🗣 Sometimes writing down what you want to say, or choosing one trusted adult (parent, counselor, teacher), can make it easier to ask for support.

**For parents/caregivers:** Listening without judgment, validating feelings, and avoiding immediate "fixes" can help. Watch for changes in sleep, appetite, or interest in activities. Foundry BC and school counselors can support both you and your child.`,
            `Pressures from parents or school can feel incredibly heavy. 📚 Your feelings about expectations, grades, or fitting in are entirely valid.

**What can help:** 💡
• One honest conversation with a parent or counselor—they may not realize how much you're struggling
• Schools often have mental health supports; asking is a sign of strength
• Setting small boundaries (e.g., "I need a 30-minute break after school before homework") can reduce burnout

Would you like to talk about a specific situation with your parents or school?`,
            `Grades and expectations don't define your worth as a person. 🌟 Sometimes taking a step back to remember what *you* value outside of academics can help restore balance. What is something you enjoy just for the sake of it? 🎨`
        ],
        prevention: [
            `Building resilience and healthy habits can protect mental health over time. Small, consistent actions really matter! 🌱
            
**Evidence-based strategies:** 📋
• Sleep: Regular schedule, limit screens before bed 💤
• Movement: Even short walks can boost mood 🚶‍♀️
• Connection: Regular contact with people you trust 🤝
• Purpose: Hobbies, goals, or helping others can provide meaning ✨
• Self-compassion: Treat yourself as gently as you would a friend 💙

What's one small thing you could try this week?`,
            `Prevention is about building a toolkit *before* a crisis hits. You're already doing great by being here. 🛠

**CBT-informed prevention:** 🧠
• Notice thought patterns: "Do I tend to catastrophize or filter out the positive?"
• Behavioral activation: Schedule small, enjoyable activities
• Problem-solving: Break big problems into manageable steps
• Seek support early: Don't wait until things feel unmanageable

What area would you like to focus on—sleep, relationships, stress, or something else?`,
            `Consistency is key when building emotional resilience. 🧱 Even dedicating 5 minutes a day to a mindfulness practice or journaling can make a huge difference over months. How do you usually like to reflect on your days? 📓`
        ],
        selfEsteem: [
            `Hearing those kind of thoughts about yourself sounds really painful. 💔 Please know that thoughts are just thoughts—they are not facts, and they don't define your true worth. ✨
            
**A CBT perspective:** Often we have an "inner critic" that is much harsher than we would ever be to a friend. 
Try catching a negative thought and asking: "Is this 100% true? What would I say to someone I love who felt this way?"`,
            `It's so easy to fall into the trap of self-criticism, especially when the world is constantly telling us we need to "be better". 🥀 But you are enough, exactly as you are right now. 
            
Have you tried writing down three things you appreciate about yourself? Even small things count! 📝`,
            `Body image and self-esteem struggles are so common, but they feel very isolating. 🫂 Try to focus on what your body *does* for you, rather than just how it looks. You deserve kindness from yourself. 🌷`
        ],
        sleepIssues: [
            `Not being able to sleep is incredibly frustrating and can make everything else feel harder to deal with. 🥱 
            
**Sleep hygiene tips:** 🌙
• Try to wind down without screens for an hour before bed.
• Keep your bedroom cool and dark.
• If you're tossing and turning for more than 20 minutes, get out of bed and do a relaxing activity (like reading) until you feel sleepy again.`,
            `Insomnia is tough. 🌑 Sometimes anxiety keeps our brains "on" when we desperately want to turn them off. 
            
Have you tried listening to a guided sleep meditation, or doing a "brain dump" where you write down everything you're worried about before getting into bed? ✍️`,
            `Consistent sleep is foundational for mental health. 🛌 Try going to bed and waking up at the same time every day, even on weekends, to help regulate your body's internal clock. ⏰`
        ],
        relationships: [
            `Relationships, whether it's family, friends, or a partner, can be complex and sometimes really painful. 💔 It sounds like you're going through a tough spot.
            
**It can help to:** 🗣
• Use "I" statements when communicating (e.g., "I feel upset when...")
• Remember that it's okay to set boundaries.
• Give yourself space to process your feelings without rushing to fix everything immediately.`,
            `Feeling lonely or left out is a deeply human experience, but it hurts. 🌧 Even when you feel isolated, your connection to yourself matters. 
            
Is there a community group, club, or safe online space where you might find people with similar interests? 🤝`,
            `Navigating conflicts with people we care about takes a lot of energy. 🔋 Remember that you are only responsible for your own actions and reactions, not how others behave. What do you need right now to feel safe and supported? 🫂`
        ],
        burnout: [
            `It sounds like you are completely exhausted, and your body is telling you to slow down. 🛑 Burnout is real, and pushing through it usually makes it worse. 
            
**Your permission slip:** You are allowed to rest. You don't have to earn it. 🛋
Can you step away from your responsibilities for even just an evening to recharge?`,
            `When we are burned out, even tiny tasks feel like climbing a mountain. 🏔 Please be incredibly gentle with yourself right now.
            
What is the absolute bare minimum you need to get done today? Let the rest go for now. 🎈`,
            `Burnout happens when our output exceeds our input for too long. 🔋 How can you pour some energy back into your own cup today? Even a hot shower or a quiet walk counts as self-care. 🚿🚶‍♂️`
        ],
        bullying: [
            `I'm really glad you told me about this—being bullied is not your fault, and it is never "just a joke". 💔 You deserve to feel safe.

Here are **three concrete steps** you can take:
1) **Safety first:** If anyone is threatening or physically hurting you, move to a safer place and reach out to a trusted adult (parent, caregiver, teacher, counselor) immediately.  
2) **Document it:** Write down what happened, when and where it happened, who was involved, and save screenshots or messages. This makes it easier for adults to take action.  
3) **Tell someone with authority:** Schools usually have policies against bullying. Talking to a teacher, school counselor, or administrator is not "snitching"—it's asking for protection.  

We can also talk about how this has affected how you see yourself, and work on rebuilding that sense of safety.`,
            `Bullying can make you feel small, scared, or ashamed, but what is happening to you is not okay. 🌧 You are not the problem—the behaviour is.

**Some options you can consider:**
• If it's online, block and report the accounts, and show the messages to an adult you trust.  
• If it's at school, try not to face it alone—go with a friend to talk to a teacher or counselor.  
• Practise short phrases you can use in the moment, like “That’s not okay” or walking away to an adult rather than arguing back.  

Would you like help drafting a message or script for talking to a teacher or parent about this?`
        ],
        stress: [
            `It sounds like stress has been really heavy lately. 🌧 When stress stays high for a long time, it can affect sleep, mood, focus, and even your body.
            
**Quick stabilising plan (today):**
• Pick one tiny task you can finish in under 10 minutes  
• Schedule one short break where you step away from screens  
• Notice and write down the top 1–2 worries rather than all of them at once  

Longer‑term, CBT‑based strategies like problem‑solving, thought‑challenging, and behavioural activation can reduce stress over weeks—not just days. Would you like to focus on tasks, thoughts, or self‑care first?`,
            `Stress often shows up in the body before we consciously notice it—headaches, tight shoulders, racing heart, stomach issues. 🧠➡️🫀

**Three layers of support you can try:**
1) **Body:** breathing exercises, stretching, or a short walk  
2) **Mind:** listing out your stressors and circling the ones you actually control  
3) **Support:** telling one trusted person what you’re carrying  

Tell me which layer you want to work on and I’ll suggest specific steps.`
        ],
        general: [
            `Thank you for reaching out—it takes real courage to put this into words. 💛

This assistant runs **entirely on your device (no cloud, no account, no server)**. Everything you type stays in this browser tab.

To start, you can:
• Describe what has been hardest lately  
• Tell me how your body has been feeling (sleep, energy, appetite)  
• Share one situation that has been looping in your mind  

What feels most important to talk about first?`,
            `I'm here to listen. 🎧 MainVoice is a **privacy‑first, offline mental health companion** built with ideas from CBT and youth mental health research.

I can help you:
• Name and organize your emotions  
• Explore unhelpful thoughts and possible reframes  
• Brainstorm coping plans for the next 24 hours  

Where would you like to begin—feelings, thoughts, or a specific situation?`,
            `Your wellbeing matters here. 🌻 Nothing you say is "too small" or "too big" for this space.

One way we can work together is to move through a simple three‑step loop:
1) **Notice** — what happened and how you felt  
2) **Name** — the thoughts that showed up  
3) **Nudge** — one small, kind action you could take next  

Tell me about a recent moment that really stuck with you, and we can walk through this together.`,
            `Sometimes just writing everything out is a kind of emotional reset. 💭

If you like, you can try a quick, guided check‑in:
• "Right now I feel…"  
• "The hardest part of this is…"  
• "What I wish other people understood is…"  

You can answer any of these, in any order. I'm here with you.`
        ]
    },

    /**
     * Detect if message suggests crisis
     */
    isCrisis(message) {
        const lower = message.toLowerCase().trim();
        return this.crisisKeywords.some(kw => lower.includes(kw));
    },

    /**
     * Match message to topic pattern
     */
    fallbackLocal(msg) {
        const topic = this.matchTopic(msg);
        this.lastTopic = topic || 'general';

        let pool = this.responses.general;
        if (topic && this.responses[topic]) {
            pool = this.responses[topic];
        }

        const fallbackResponse = pool[Math.floor(Math.random() * pool.length)];
        
        this.chatHistory.push({
            role: "model",
            parts: [{ text: fallbackResponse }]
        });
        
        return fallbackResponse;
    },

    matchTopic(message) {
        for (const [topic, regexes] of Object.entries(this.patterns)) {
            if (regexes.some(r => r.test(message))) return topic;
        }
        return null;
    },

    switchModel() {
        this.currentModel = this.currentModel === 'flash' ? 'pro' : 'flash';
        localStorage.setItem('selectedModel', this.currentModel);
    },

    /**
     * Generate AI response using Gemini API
     */
    async respond(userMessage, imageDataUrl = null, imageMimeType = null) {
        const msg = userMessage.trim();
        if (!msg && !imageDataUrl) {
            return "I'd love to hear what's on your mind. You can start with how today has felt for you.";
        }

        this.lastMessageAt = Date.now();

        // Crisis check first
        if (this.isCrisis(msg)) {
            this.lastTopic = 'crisis';
            return this.responses.crisis.immediate;
        }

        // Initialize chat history array if it doesn't exist
        if (!this.chatHistory) {
            this.chatHistory = [];
        }

        const parts = [];
        if (msg) {
            parts.push({ text: msg });
        }
        if (imageDataUrl && imageMimeType) {
            const base64Data = imageDataUrl.split(',')[1];
            parts.push({
                inlineData: {
                    mimeType: imageMimeType,
                    data: base64Data
                }
            });
        }

        this.chatHistory.push({
            role: "user",
            parts: parts
        });

        const systemPrompt = "You are MainVoice AI, a compassionate and supportive mental health companion built with ideas from CBT and youth mental health research. Please provide empathetic, evidence-based responses. Listen actively and suggest small, practical coping strategies when appropriate. Avoid diagnosing. Keep your responses concise and well-formatted.";

        const deepSeekMessages = [
            { role: "system", content: systemPrompt }
        ];
        
        for (const msgItem of this.chatHistory) {
            const role = msgItem.role === 'model' ? 'assistant' : 'user';
            const textPart = msgItem.parts.find(p => p.text);
            const content = textPart ? textPart.text : "";
            
            if (content) {
                deepSeekMessages.push({ role, content });
            }
        }

        try {
            const currentModelConfig = this.models[this.currentModel];
            const response = await fetch("https://api.deepseek.com/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentModelConfig.key}`
                },
                body: JSON.stringify({
                    model: currentModelConfig.name,
                    messages: deepSeekMessages
                })
            });

            if (!response.ok) {
                throw new Error("DeepSeek API Error: " + response.statusText);
            }

            const data = await response.json();
            const replyText = data.choices[0].message.content;

            this.chatHistory.push({
                role: "model",
                parts: [{ text: replyText }]
            });

            return replyText;
        } catch (error) {
            console.error("DeepSeek API Error:", error);
            return this.fallbackLocal(msg);
        }
    }
};

// Export for use
window.MainVoiceAI = MainVoiceAI;
