import os
import glob

html_files = glob.glob('*.html')
target = '<a href="letter-generator.html">Letter Generator</a>'
nav_insertion = f'{target}\n                        <a href="gratitude-board.html">Gratitude Board</a>'

for fpath in html_files:
    if fpath == 'gratitude-board.html':
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    if target in content and "gratitude-board.html" not in content:
        content = content.replace(target, nav_insertion)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {fpath}")

print("Navigation injection complete.")
