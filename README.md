# MainVoice AI — Mental Health Companion

A compassionate, AI-powered mental health support website. MainVoice AI provides empathetic listening, CBT-informed guidance, and crisis referral resources.

## Features

- **AI Chat**: Empathetic, evidence-based responses on mental health topics
- **CBT-Informed Support**: Cognitive Behavioral Therapy principles integrated into guidance
- **Crisis Detection**: Automatically detects crisis keywords and offers immediate referral to Foundry BC, Crisis Services Canada, Kids Help Phone, and emergency services
- **Core Topics**:
  - Social media's impact on mental health
  - Depression and anxiety causes & coping
  - Parent and school intervention strategies
  - Prevention programs and resilience building

## Getting Started

Open `index.html` in a web browser. No build step or server required.

```bash
# Option 1: Open directly
open index.html

# Option 2: Use a local server (recommended for full functionality)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Project Structure

- `index.html` — Main page with hero, topics, chat, and crisis resources
- `styles.css` — Calming UI with sage, coral, and warm neutrals
- `ai-engine.js` — Rule-based AI with crisis detection and topic matching
- `app.js` — Chat UI, message handling, and formatting

## Integrating a Real AI Model

To use OpenAI or another LLM instead of the built-in responses:

1. Add your API key to a backend or use a serverless function
2. Replace the `MainVoiceAI.respond()` logic in `ai-engine.js` with an API call
3. Keep the crisis detection logic — run it before sending to the external API

Example structure for OpenAI:

```javascript
// In ai-engine.js, modify the respond method:
if (this.isCrisis(msg)) return this.responses.crisis.immediate;
const systemPrompt = `You are MainVoice AI, a mental health support assistant...`;
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: msg, system: systemPrompt })
});
return (await response.json()).text;
```

## Disclaimer

MainVoice AI provides support, not professional diagnosis or treatment. Users in crisis should contact emergency services or a crisis hotline. This tool complements—not replaces—professional mental health care.

## License

MIT
