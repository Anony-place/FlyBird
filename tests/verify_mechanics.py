import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Inject script to start game and trigger boss immediately
        page.goto("http://localhost:8080")

        # Click through splash
        page.click("#startingAnimation")
        time.sleep(1)

        # Start Game
        page.click("#playGameBtn")

        # Force score to trigger boss and mutators
        page.evaluate("""
            window.game.score = 99;
            // Next pillar pass will trigger boss at 100
        """)

        time.sleep(2) # Let it play a bit

        # Take screenshot of boss entry
        page.screenshot(path="/home/jules/verification/screenshots/boss_entry_verification.png")

        # Wait for charge
        time.sleep(5)
        page.screenshot(path="/home/jules/verification/screenshots/boss_charge_verification.png")

        # Verify zone transition by forcing score to 49 then passing
        page.evaluate("""
            window.game.score = 49;
            window.game.lastZoneScore = 0;
        """)
        time.sleep(2)
        page.screenshot(path="/home/jules/verification/screenshots/zone_transition_verification.png")

        browser.close()

if __name__ == "__main__":
    run()
