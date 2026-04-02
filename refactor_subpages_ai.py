import glob
import re
import os

files = [
    'gratitude-board.js',
    'letter-generator.js',
    'micro-habits.js',
    'mood-tracker.js'
]

BASE_DIR = '/Users/hengyuhu/mainvoice-ai'

# We want to replace the whole block starting with `let response;` up to `if (!response.ok) throw new Error`
# Basically overriding the entire if-else logic.

for fname in files:
    fpath = os.path.join(BASE_DIR, fname)
    if not os.path.exists(fpath):
        continue
    
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic DeepSeek API logic
    replacement = """
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
            });"""

    # We need to capture the exact if-else block. It usually looks like this:
    # let response;
    # if (aiEngine.currentModel === 'deepseek') {
    #     response = await fetch(...);
    # } else {
    #     response = await fetch(...);
    # }
    
    pattern = r'let response;\s*if\s*\(aiEngine\.currentModel\s*===\s*\'deepseek\'\)\s*\{.*?\n\s*\}\s*else\s*\{.*?\n\s*\}'
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # We also need to fix parsing the response.
    # From:
    # const replyText = aiEngine.currentModel === 'deepseek'
    #     ? (data.choices?.[0]?.message?.content || '').trim()
    #     : (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    
    # To:
    # const replyText = (data.choices?.[0]?.message?.content || '').trim();
    
    parse_pattern = r'const replyText = aiEngine\.currentModel === \'deepseek\'\s*\?\s*\(data\.choices\?\.\[0\]\?\.message\?\.content\s*\|\|\s*\'\'\)\.trim\(\)\s*:\s*\(data\.candidates\?\.\[0\]\?\.content\?\.parts\?\.\[0\]\?\.text\s*\|\|\s*\'\'\)\.trim\(\);'
    
    parse_replacement = r"const replyText = (data.choices?.[0]?.message?.content || '').trim();"
    
    content = re.sub(parse_pattern, parse_replacement, content, flags=re.DOTALL)
    
    # Fixing any other hardcoded currentModel stuff
    # Sometimes it sets modelConfig earlier: const modelConfig = aiEngine.currentModel === 'deepseek' ? ...
    # This was already fixed in gratitude-board.js but let's safely fix it across all files if present.
    config_pattern = r'const modelConfig = aiEngine(?:\??)\.currentModel === \'deepseek\' \? aiEngine\.models\.deepseek : aiEngine\.models\.gemini;'
    config_replacement = r"const modelConfig = aiEngine?.currentModel === 'pro' ? aiEngine.models.pro : aiEngine.models.flash;"
    content = re.sub(config_pattern, config_replacement, content)
    
    # Another variant from mood-tracker
    config_pattern2 = r'const modelConfig = aiEngine\.currentModel === \'deepseek\'\s*\?\s*aiEngine\.models\.deepseek\s*:\s*aiEngine\.models\.gemini;'
    content = re.sub(config_pattern2, config_replacement, content, flags=re.DOTALL)
    
    # Variant from micro-habits checking `model === 'deepseek'`
    config_pattern3 = r'return model === \'deepseek\' \? aiEngine\.models\.deepseek : aiEngine\.models\.gemini;'
    config_replacement3 = r"return model === 'pro' ? aiEngine.models.pro : aiEngine.models.flash;"
    content = re.sub(config_pattern3, config_replacement3, content)

    # Some files still say "AI engine requires the Gemini API key..."
    gemini_msg = r'AI engine requires the Gemini API key to operate\.'
    ds_msg = r'AI engine requires the DeepSeek API key to operate.'
    content = re.sub(gemini_msg, ds_msg, content)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed AI logic in {fname}")

