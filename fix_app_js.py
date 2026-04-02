import re

with open('app.js', 'r') as f:
    content = f.read()

# Fix model default logic in app.js
content = content.replace("model === 'pro' ? 'PRO' : 'FLASH'", "model === 'pro' ? 'PRO' : 'FLASH'")
content = content.replace("localStorage.getItem('selectedModel') || 'flash'", "localStorage.getItem('selectedModel') || 'flash'")

with open('app.js', 'w') as f:
    f.write(content)

print("App.js fixed")
