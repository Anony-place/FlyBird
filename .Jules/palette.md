## UX & Accessibility Learnings

### 2026-04-04 - [Accessibility & Rebranding Upgrade]
- Implemented ARIA labels for all icon-only buttons to ensure screen reader compatibility.
- Converted toggle elements to semantic '<button>' elements with 'aria-pressed' states for keyboard accessibility.
- Rebranded 'Aero Dash' to 'Neon Ghost: Phase Runner' to distance the product from clone-based aesthetics and intellectual property issues.
- Introduced high-fidelity 'Viper' model using procedural Canvas API to replace generic emoji assets, improving visual depth and quality.
- Hardened 'Phase Dash' and boss timers by moving from 'setTimeout' to frame-rate independent 'update(dt)' logic, ensuring consistency across performance levels.
