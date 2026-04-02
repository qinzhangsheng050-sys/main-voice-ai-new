import os
import re

DIRECTORY = "/Users/hengyuhu/mainvoice-ai"

for file_name in os.listdir(DIRECTORY):
    if not file_name.endswith(".html"):
        continue
    
    file_path = os.path.join(DIRECTORY, file_name)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    
    # 1. Remove inline theme script from head. Often wrapped in <script>...</script>
    content = re.sub(
        r'<script>\s*\(function\(\)\{var t=localStorage\.getItem\(\'mainvoice-theme\'\)\|\|\'light\';document\.documentElement\.setAttribute\(\'data-theme\',t\);\s*\}\)\(\);\s*</script>',
        '',
        content
    )
    
    # Also another variant where whitespace differs
    content = re.sub(
        r'<script>\s*\(function\(\)\{\s*var t=localStorage\.getItem\(\'mainvoice-theme\'\)\|\|\'light\';\s*document\.documentElement\.setAttribute\(\'data-theme\',t\);\s*\}\)\(\);\s*</script>',
        '',
        content
    )
    
    # 2. Add global.js to head if not exists, right before </head>
    if '<script src="global.js"></script>' not in content:
        content = content.replace("</head>", '    <script src="global.js"></script>\n</head>')
    
    # 3. Find and remove the inline `<script>` containing `setThemeContext` or `DOMContentLoaded` transition logic
    # Find all <script>...</script> blocks
    scripts = re.findall(r'<script.*?>.*?</script>', content, flags=re.DOTALL)
    for script in scripts:
        if 'setThemeContext' in script or "document.querySelectorAll('a.page-link" in script:
            content = content.replace(script, "")
            
    # 4. Standardise the theme toggles in nav
    # Find the entire <div class="theme-toggles"> block and replace it
    # Note: re.sub with DOTALL
    standard_toggles = '''<div class="theme-toggles">
                <button class="theme-ball light-ball" onclick="setThemeContext('light')" aria-label="Light Theme" title="Light Theme"></button>
                <button class="theme-ball dark-ball" onclick="setThemeContext('dark')" aria-label="Dark Theme" title="Dark Theme"></button>
            </div>'''
    
    content = re.sub(r'<div class="theme-toggles">.*?</div>', standard_toggles, content, flags=re.DOTALL)
    
    # Small fix: The index.html needs app.js included.
    if file_name == "index.html" and '<script src="app.js"></script>' not in content:
        # insert before ai-engine.js
        content = content.replace('<script src="ai-engine.js"></script>', '<script src="app.js"></script>\n    <script src="ai-engine.js"></script>')

    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {file_name}")

print("Done updating HTML files.")
