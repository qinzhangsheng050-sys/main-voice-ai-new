import os

DIRECTORY = "/Users/hengyuhu/mainvoice-ai"

for file_name in os.listdir(DIRECTORY):
    if not file_name.endswith(".html"):
        continue
    
    file_path = os.path.join(DIRECTORY, file_name)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    
    # Check if styles.css is linked
    if 'href="styles.css"' not in content:
        # Insert before closing head
        content = content.replace("</head>", '    <link rel="stylesheet" href="styles.css">\n</head>')
        
    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Added styles.css to {file_name}")
