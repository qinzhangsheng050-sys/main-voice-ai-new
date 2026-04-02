import os
import re

DIRECTORY = "/Users/hengyuhu/mainvoice-ai"

for file_name in os.listdir(DIRECTORY):
    if not file_name.endswith(".html") or file_name == "index.html":
        continue
    
    file_path = os.path.join(DIRECTORY, file_name)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    
    # Remove all inline <style>...</style> blocks
    content = re.sub(r'<style>.*?</style>', '', content, flags=re.DOTALL)
    
    # Strip inline styles from elements that are not necessary
    # (Leaving this to manual replacement for safer structural changes)

    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Removed inline styles from {file_name}")

