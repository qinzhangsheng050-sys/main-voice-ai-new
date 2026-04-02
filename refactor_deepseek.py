import os
import glob
import re

html_files = glob.glob('*.html')

for fpath in html_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove image preview container
    content = re.sub(r'<div id="image-preview-container".*?</div>\s*</div>', '', content, flags=re.DOTALL)
    
    # Remove image upload btn
    content = re.sub(r'<button id="image-upload-btn".*?</button>', '', content, flags=re.DOTALL)
    
    # Remove image input
    content = re.sub(r'<input type="file" id="image-input".*?>', '', content)

    # Remove settings card from resources.html
    if 'resources.html' in fpath:
        content = re.sub(r'<a href="settings.html" class="card">.*?</a>', '', content, flags=re.DOTALL)

    # Remove any stray settings link just in case
    content = re.sub(r'<a href="settings\.html".*?>Settings</a>', '', content)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

# Delete settings files
if os.path.exists('settings.html'):
    os.remove('settings.html')
if os.path.exists('settings.js'):
    os.remove('settings.js')

print("HTML files and settings cleanup complete.")
