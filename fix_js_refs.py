import glob, re

for f in glob.glob('*.js'):
    if f in ['global.js', 'ai-engine.js', 'app.js']: continue
    with open(f, 'r') as file: content = file.read()
    content = re.sub(r"=== 'deepseek' \? .*? : .*?\.models\?\.gemini", "=== 'pro' ? aiEngine.models.pro : aiEngine.models.flash", content)
    content = re.sub(r"=== 'deepseek' \? 'deepseek' : 'gemini'", "=== 'pro' ? 'pro' : 'flash'", content)
    with open(f, 'w') as file: file.write(content)

print("Fixed references in sub-scripts.")
