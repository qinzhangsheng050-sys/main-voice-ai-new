import glob
import os

# 1. Fix styles.css logo text color
with open('styles.css', 'r') as f:
    css = f.read()

# Make sure we don't duplicate
if 'text-decoration: none !important; color: var(--color-text);' not in css:
    css = css.replace('text-decoration: none !important;\n}', 'text-decoration: none !important;\n    color: var(--color-text);\n}')
    # Additionally let's make sure .logo-text inherits it
    css += '\n.logo-text { color: var(--color-text); }\nhtml[data-theme="dark"] .logo-text { color: #f8f6f3 !important; }'
    
with open('styles.css', 'w') as f:
    f.write(css)

# 2. Fix scripts in all HTML files except MainVoice-AI.html
head_script = "<script>(function(){var t=localStorage.getItem('mainvoice-theme')||'light';document.documentElement.setAttribute('data-theme',t);})();</script>\n"

bottom_script = """
    <script>
        function setThemeContext(t) {
            document.documentElement.setAttribute('data-theme', t);
            localStorage.setItem('mainvoice-theme', t);
        }
        document.addEventListener('DOMContentLoaded',function(){document.body.classList.add('loaded');});
        document.querySelectorAll('a.page-link, a[href^="MainVoice-AI"], a[href^="research"], a[href^="self-help"], a[href^="about"], a[href^="resources"], a[href^="reports"], a[href^="quizzes"]').forEach(function(a){
            if(a.getAttribute('href')&&!a.target&&!a.getAttribute('href').startsWith('#')){
                a.addEventListener('click',function(e){
                    var h=this.getAttribute('href');
                    if(h&&h.indexOf('#')<0){
                        e.preventDefault();
                        var pt=document.getElementById('page-transition');
                        if(pt){pt.classList.add('active');}
                        setTimeout(function(){window.location.href=h;},400);
                    }
                });
            }
        });
"""

files_to_fix = [f for f in glob.glob("*.html") if f != "MainVoice-AI.html"]

for filepath in files_to_fix:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Add head script if missing
    if "<script>(function(){var t=localStorage" not in content:
        content = content.replace("<head>", "<head>\n    " + head_script)
        
    # Clean up old bottom scripts (ranging from <script src="app.js"> or <script> function setTheme... to </body>)
    # We find where to stick the new bottom script.
    # Usually right before </body>
    
    s1 = content.find('<script src="app.js"></script>')
    s2 = content.find('<script>\n        function setThemeContext')
    
    start_cut = s1 if s1 != -1 else (s2 if s2 != -1 else content.rfind('<script>'))
    body_end = content.find('</body>')
    
    if start_cut != -1 and body_end != -1:
        existing_script = content[start_cut:body_end]
        
        # Preserve specific logic like Quiz or app.js logic if any
        quiz_logic = ""
        if "quizzes.html" in filepath and "// Quiz Logic" in existing_script:
            q_start = existing_script.find("// Quiz Logic")
            quiz_logic = "\n" + existing_script[q_start:].replace("</script>", "").strip()
            
        new_bottom = bottom_script + quiz_logic + "\n    </script>\n"
        content = content[:start_cut] + new_bottom + content[body_end:]
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Fixed CSS and subpage scripts.")
