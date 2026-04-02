import glob
import re

nav_html = """<nav class="nav">
            <a href="MainVoice-AI.html">Home</a>
            <a href="self-help-manual.html">Self-Help</a>
            <a href="research.html">Research</a>
            <a href="MainVoice-AI.html#chat-section">Chat</a>
            <a href="MainVoice-AI.html#crisis">Crisis</a>
            <a href="resources.html">Resources</a>
            <a href="about.html">About</a>
            <div class="theme-toggles">
                <button class="theme-ball light-ball" onclick="setThemeContext('light')" aria-label="Light Theme" title="Light Theme"></button>
                <button class="theme-ball dark-ball" onclick="setThemeContext('dark')" aria-label="Dark Theme" title="Dark Theme"></button>
            </div>
        </nav>"""

for filepath in glob.glob("*.html"):
    with open(filepath, "r") as f:
        content = f.read()
    
    # Simple regex to replace the <nav class="nav">...</nav> blocks entirely
    # Allowing for dotall to match across newlines
    new_content = re.sub(r'<nav class="nav">.*?</nav>', nav_html, content, flags=re.DOTALL)
    
    with open(filepath, "w") as f:
        f.write(new_content)
        
print("Updated all navigation bars.")
