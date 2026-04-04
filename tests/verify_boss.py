from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:8080')

        # Start game
        # It's #playGameBtn now
        page.click('#playGameBtn')
        time.sleep(1)

        # Simulate high score to trigger boss (we set it to 10)
        page.evaluate("window.game.score = 11;")
        time.sleep(2) # Wait for boss entry

        page.screenshot(path='/home/jules/verification/screenshots/boss_encounter.png')

        # Try to dash (Right click)
        page.mouse.click(100, 100, button="right")
        time.sleep(0.5)
        page.screenshot(path='/home/jules/verification/screenshots/boss_dash.png')

        browser.close()

if __name__ == '__main__':
    run()
