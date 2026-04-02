import asyncio
from playwright.async_api import async_playwright
import os

BASE_DIR = '/Users/hengyuhu/mainvoice-ai'
OUT_DIR = os.path.join(BASE_DIR, 'mockups')

if not os.path.exists(OUT_DIR):
    os.makedirs(OUT_DIR)

async def capture(page, filename, url, selector=None, full_page=False):
    print(f"Loading {url}...")
    await page.goto(f"file://{BASE_DIR}/{url}")
    
    # Inject warm theme and wait for fonts and transitions
    await page.evaluate("""() => {
        localStorage.setItem('mainvoice-theme', 'warm');
        document.documentElement.setAttribute('data-theme', 'warm');
    }""")
    await page.reload()
    await page.wait_for_timeout(1000) # give it time for animations
    
    path = os.path.join(OUT_DIR, filename)
    if selector:
        await page.locator(selector).screenshot(path=path)
    else:
        await page.screenshot(path=path, full_page=full_page)
    print(f"Captured {filename}")

async def main():
    async with async_playwright() as p:
        # High resolution premium viewport
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2 # Retina display quality
        )
        
        # 1. Hero Landing
        await capture(page, 'shot_hero.png', 'index.html', full_page=False)
        
        # 2. Chat Section
        await capture(page, 'shot_chat.png', 'index.html', selector='#chat-section')
        
        # 3. Crisis Section
        await capture(page, 'shot_crisis.png', 'index.html', selector='#crisis')
        
        # 4. Mood Tracker
        await capture(page, 'shot_mood.png', 'mood-tracker.html', full_page=False)
        
        # 5. Gratitude Board
        await capture(page, 'shot_gratitude.png', 'gratitude-board.html', full_page=False)
        
        # 6. Micro Habits
        await capture(page, 'shot_habits.png', 'micro-habits.html', full_page=False)
        
        # 7. Self Help Manual
        await capture(page, 'shot_manual.png', 'self-help-manual.html', full_page=False)
        
        # 8. Parents Letter Generator
        await capture(page, 'shot_letter.png', 'letter-generator.html', full_page=False)
        
        # 9. Stress Testing (Quiz)
        await capture(page, 'shot_quiz.png', 'quiz-life.html', full_page=False)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
