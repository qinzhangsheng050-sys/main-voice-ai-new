import re

file_path = "/Users/hengyuhu/mainvoice-ai/self-help-manual.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the ToC section to include an image and make it look beautiful
toc_replacement = '''
        <div class="toc-container">
            <div class="toc-image" style="background-image: url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80');"></div>
            <div class="toc">
                <h2>Table of Contents</h2>
                <div class="toc-links">
                    <a href="#grounding"><span class="toc-num">01</span> Grounding Techniques</a>
                    <a href="#breathing"><span class="toc-num">02</span> Breathing Exercises</a>
                    <a href="#cbt"><span class="toc-num">03</span> CBT Thought-Challenging</a>
                    <a href="#behavioral"><span class="toc-num">04</span> Behavioural Activation</a>
                    <a href="#social-media"><span class="toc-num">05</span> Healthier Social Media Use</a>
                    <a href="#sleep"><span class="toc-num">06</span> Sleep &amp; Routine</a>
                    <a href="#when-to-seek"><span class="toc-num">07</span> When to Seek Help</a>
                </div>
            </div>
        </div>
'''
content = re.sub(r'<div class="toc">.*?</div>', toc_replacement, content, flags=re.DOTALL)

# 2. Update all the 7 parts with unique images, smaller proportions, and structured layouts
# Part 1 Grounding
content = re.sub(
    r'<section id="grounding" class="section">.*?<h2>1\. Grounding Techniques</h2>',
    '<section id="grounding" class="section">\n            <div class="section-image" style="background-image: url(\'https://images.unsplash.com/photo-1620052581691-3832c3f5eaed?w=600&q=80\');"></div>\n            <div class="section-content">\n            <h2>1. Grounding Techniques</h2>',
    content, flags=re.DOTALL
)
# Part 2 Breathing
content = re.sub(
    r'<section id="breathing" class="section">.*?<h2>2\. Breathing Exercises</h2>',
    '        </div>\n        </section>\n\n        <section id="breathing" class="section">\n            <div class="section-image" style="background-image: url(\'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80\');"></div>\n            <div class="section-content">\n            <h2>2. Breathing Exercises</h2>',
    content, flags=re.DOTALL
)
# Part 3 CBT - Missing image originally!
content = re.sub(
    r'<section id="cbt" class="section">.*?<h2>3\. CBT Thought-Challenging</h2>',
    '        </div>\n        </section>\n\n        <section id="cbt" class="section">\n            <div class="section-image" style="background-image: url(\'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=600&q=80\');"></div>\n            <div class="section-content">\n            <h2>3. CBT Thought-Challenging</h2>',
    content, flags=re.DOTALL
)
# Part 4 Behavioral
content = re.sub(
    r'<section id="behavioral" class="section">.*?<h2>4\. Behavioural Activation</h2>',
    '        </div>\n        </section>\n\n        <section id="behavioral" class="section">\n            <div class="section-image" style="background-image: url(\'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80\');"></div>\n            <div class="section-content">\n            <h2>4. Behavioural Activation</h2>',
    content, flags=re.DOTALL
)
# Part 5 Social Media
content = re.sub(
    r'<section id="social-media" class="section">.*?<h2>5\. Healthier Social Media Use</h2>',
    '        </div>\n        </section>\n\n        <section id="social-media" class="section">\n            <div class="section-image" style="background-image: url(\'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&q=80\');"></div>\n            <div class="section-content">\n            <h2>5. Healthier Social Media Use</h2>',
    content, flags=re.DOTALL
)
# Part 6 Sleep
content = re.sub(
    r'<section id="sleep" class="section">.*?<h2>6\. Sleep &amp; Routine</h2>',
    '        </div>\n        </section>\n\n        <section id="sleep" class="section">\n            <div class="section-image" style="background-image: url(\'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80\');"></div>\n            <div class="section-content">\n            <h2>6. Sleep &amp; Routine</h2>',
    content, flags=re.DOTALL
)
# Part 7 When to Seek Help
content = re.sub(
    r'<section id="when-to-seek" class="section">.*?<h2>7\. When to Seek Professional Help</h2>',
    '        </div>\n        </section>\n\n        <section id="when-to-seek" class="section">\n            <div class="section-image" style="background-image: url(\'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=600&q=80\');"></div>\n            <div class="section-content">\n            <h2>7. When to Seek Professional Help</h2>',
    content, flags=re.DOTALL
)

# Close the last section content div cleanly before the back link
content = content.replace(
    '<a href="index.html" class="back page-link">&larr; Back to MainVoice AI</a>',
    '        </div>\n        </section>\n\n        <a href="index.html" class="back-floating-btn page-link">\n            <span class="icon">⟵</span>\n            <span class="text">Back to Home</span>\n        </a>'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated self-help-manual html structure.")
