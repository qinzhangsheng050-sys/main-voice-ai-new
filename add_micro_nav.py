import os
import glob

html_files = glob.glob('*.html')
target = '<a href="gratitude-board.html">Gratitude Board</a>'
nav_insertion = f'{target}\n                        <a href="micro-habits.html">Daily Micro-Habits</a>'

for fpath in html_files:
    if fpath == 'micro-habits.html':
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    if target in content and "micro-habits.html" not in content:
        content = content.replace(target, nav_insertion)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {fpath}")

print("Navigation injection complete.")
