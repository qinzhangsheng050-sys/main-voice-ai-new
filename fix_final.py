import os
import re

DIRECTORY = "/Users/hengyuhu/mainvoice-ai"

replacements = {
    # General layout replacements
    '<main class="content">': '<main class="container">',
    
    # Hero/Header standardisation
    'class="resources-hero"': 'class="page-header"',
    'class="reports-hero"': 'class="page-header"',
    'class="quizzes-hero"': 'class="page-header"',
    'class="page-hero"': 'class="page-header"',
    'class="manual-hero"': 'class="page-header"',
    
    # Grid standardisation
    'class="resource-cards"': 'class="container grid"',
    'class="report-cards"': 'class="container grid"',
    
    # Card standardisation
    'class="res-card"': 'class="card"',
    'class="report-card"': 'class="card"',
    'class="res-icon"': 'class="card-icon"',
    'class="report-icon"': 'class="card-icon"',
    
    # Specifics
    '<div class="about-card">': '<div class="content-body">',
}

for file_name in os.listdir(DIRECTORY):
    if not file_name.endswith(".html") or file_name == "index.html":
        continue
    
    file_path = os.path.join(DIRECTORY, file_name)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated classes in {file_name}")

