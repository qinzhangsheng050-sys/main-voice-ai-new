import os
import glob

html_files = glob.glob('*.html')
nav_insertion = """<a href="research.html">Research Insights</a>
                        <a href="letter-generator.html">Letter Generator</a>"""

target = '<a href="research.html">Research Insights</a>'

for fpath in html_files:
    # Don't modify the newly created one to avoid double insertion if accidentally matched
    if fpath == 'letter-generator.html':
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    if target in content and nav_insertion not in content:
        content = content.replace(target, nav_insertion)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {fpath}")
print("Finished updating navigation.")
