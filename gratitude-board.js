document.addEventListener('DOMContentLoaded', () => {
    const gratitudeInput = document.getElementById('gratitude-input');
    const postBtn = document.getElementById('post-gratitude-btn');
    const boardContainer = document.getElementById('gratitude-board-container');
    const aiResponseArea = document.getElementById('ai-response-area');

    // Local Storage Key
    const STORAGE_KEY = 'mainvoice_gratitude_notes';

    // Pastel paper colors for the sticky notes
    const noteColors = ['#fdfadd', '#fff3cd', '#fadadd', '#e2f0cb', '#ffdac1'];

    // Load initial notes
    const loadNotes = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    };

    const saveNotes = (notes) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    };

    const renderNotes = () => {
        const notes = loadNotes();
        boardContainer.innerHTML = '';
        if (notes.length === 0) {
            boardContainer.innerHTML = `<p style="text-align:center; color: var(--color-text-muted); width: 100%; font-style: italic;">Your board is waiting for its first note. 🌷</p>`;
            return;
        }

        // Render notes in reverse chronological order
        [...notes].reverse().forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'sticky-note';
            
            // Randomly rotate sticky note for organic pinboard feel
            const rotation = (Math.random() * 6 - 3).toFixed(1); // -3deg to 3deg
            noteEl.style.transform = `rotate(${rotation}deg)`;
            noteEl.style.backgroundColor = note.color;

            // Header: Date + Delete button
            const header = document.createElement('div');
            header.className = 'sticky-note-header';
            
            const dateSpan = document.createElement('span');
            dateSpan.className = 'sticky-note-date';
            const d = new Date(note.timestamp);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            dateSpan.textContent = `${yyyy}.${mm}.${dd}`;
            
            const delBtn = document.createElement('button');
            delBtn.className = 'note-delete-btn';
            delBtn.innerHTML = '&times;';
            delBtn.onclick = () => deleteNote(note.id);
            
            header.appendChild(dateSpan);
            header.appendChild(delBtn);

            // Body: 3rd-person text
            const body = document.createElement('div');
            body.className = 'sticky-note-body';
            body.textContent = note.text;

            // Emoji / Kaomoji signature
            const footer = document.createElement('div');
            footer.className = 'sticky-note-footer';
            footer.textContent = note.emoji;

            noteEl.appendChild(header);
            noteEl.appendChild(body);
            noteEl.appendChild(footer);

            boardContainer.appendChild(noteEl);
        });
    };

    const deleteNote = (id) => {
        if (!confirm('Are you sure you want to remove this memory?')) return;
        const notes = loadNotes().filter(n => n.id !== id);
        saveNotes(notes);
        renderNotes();
    };

    postBtn.addEventListener('click', async () => {
        const rawText = gratitudeInput.value.trim();
        if (!rawText) return;

        const aiEngine = window.MainVoiceAI;
        const modelConfig = aiEngine?.currentModel === 'pro' ? aiEngine.models.pro : aiEngine.models.flash;
        if (!aiEngine || !modelConfig?.key) {
            alert("AI engine is missing or the API key is not configured.");
            return;
        }

        postBtn.disabled = true;
        postBtn.innerHTML = `Pinning... <span class="typing-dot" style="display:inline-block; animation: typingBounce 1s infinite alternate;"></span>`;
        aiResponseArea.style.display = 'none';

        try {
            // Task: Ask Gemini to output two things separated by a delimiter (e.g., |||)
            // 1) A direct, warm, very short encouraging response (in the exact same language).
            // 2) A simplified 3rd-person version in the EXACT same language.
            const prompt = `You are a warm, healing mental health companion.
The user is expressing gratitude for: "${rawText}"

CRITICAL INSTRUCTION: Detect the language of the user's input ("${rawText}"). You MUST respond 100% in THAT EXACT SAME LANGUAGE. For example, if the input is in Japanese, reply in Japanese. If Spanish, reply in Spanish. If English, reply in English. NEVER default to Chinese unless the input is Chinese!

Please provide exactly two things, separated by the delimiter "|||":
1. A very brief, warm, supportive direct response (1-2 sentences) affirming their gratitude, written entirely in the DETECTED LANGUAGE.
2. A simplified, beautiful 3rd-person phrasing of their gratitude, written entirely in the DETECTED LANGUAGE (e.g., equivalent to "You were once grateful for..."), appended with a positive, relevant ASCII kaomoji or emoji.

Example format:
[Direct response in detected language] ||| [3rd-person summary in detected language] (❁´◡\`❁)

Do not include any other text.`;

            
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
            const replyText = (data.choices?.[0]?.message?.content || '').trim();
            if (!replyText) throw new Error("Empty model response.");
            const parts = replyText.split('|||');

            let directResponse = "I'm so glad you shared this beautiful moment.";
            let thirdPersonNote = rawText; // fallback
            
            if (parts.length >= 2) {
                directResponse = parts[0].trim();
                thirdPersonNote = parts[1].trim();
            } else {
                // Formatting failed, fallback to generic
                thirdPersonNote = `✨ ${rawText}`;
            }

            // Extract the emoji/kaomoji from the end if possible, or just treat the whole text as `note.text` and pick a random kaomoji.
            // Let's just keep the string whole, as the prompt asks to append it. We can split the last word/emoji if we want, but it's simpler to render the whole thing.
            
            // Build the new note object
            const notes = loadNotes();
            const newNote = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                text: thirdPersonNote,
                emoji: '', // The prompt already appends the emoji to the text, so this can be blank or left for future expanding
                color: noteColors[Math.floor(Math.random() * noteColors.length)]
            };

            notes.push(newNote);
            saveNotes(notes);

            // Update UI
            gratitudeInput.value = '';
            
            aiResponseArea.textContent = directResponse;
            aiResponseArea.style.display = 'block';

            renderNotes();

        } catch (error) {
            console.error(error);
            alert("Something went wrong communicating with the AI. Your gratitude was still saved in its original form!");
            // Fallback save in original text
            const notes = loadNotes();
            notes.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                text: `✨ ${rawText}`,
                emoji: '',
                color: noteColors[0]
            });
            saveNotes(notes);
            gratitudeInput.value = '';
            renderNotes();
        } finally {
            postBtn.disabled = false;
            postBtn.innerHTML = `Pin to Board ✨`;
        }
    });

    // Initial render
    renderNotes();
});
