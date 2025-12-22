# Testing Notes

## JP Lesson Adventure proof-of-concept
- Start a simple server to load the HTML locally:
  - `python -m http.server 8000`
  - Open `http://localhost:8000/jp-game-poc.html`
- Smoke test: launch the page in a headless browser to confirm assets load and the scene renders without errors. Example:
  - Use Playwright or another browser automation tool to visit the URL and capture a screenshot of the rendered page.
- Expected result: overworld canvas renders with sprites, HUD instructions display, and no console errors appear.
