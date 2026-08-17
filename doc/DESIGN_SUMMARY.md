# Design Summary

## 1. Project Overview

The project is a compact Sports Squad Constraint Checker. It validates a manually selected seven-player squad against a fixed local roster and shows the rules that pass or fail.

The application only validates the selected squad. It does not select, rank, recommend, or optimize players.

## 2. Technology Choice

### React

I chose React because I have worked with it before and I am comfortable with it. It was a good fit for the interactive UI with checkboxes, live counts, validation results, and the formation view.

### Vite

I used Vite for the React project setup and local development server.

### JavaScript

I chose JavaScript because it is simple and works naturally with React for this project. I kept the validation logic in a separate plain JavaScript file, `validator.js`, so the rules are independent from the UI. This makes the validation easier to test, understand, and modify without affecting the React components.

### No Backend or Database

The roster is fixed and all validation happens locally, so a backend or database was not needed.

## 3. Architecture Decisions

The project was kept simple with the main work split between `validator.js` and `App.jsx`.

### `validator.js`

This file contains the roster, default selection, and `validateSquad()` function.

Keeping the validation logic separate makes it easier to test and modify the rules without changing the UI. If there is a problem in the UI, I can work mainly in `App.jsx` without disturbing the core validation logic.

### `App.jsx`

This handles the user interface, including the roster, checkboxes, live counts, validation result, Reset button, and formation view.

The UI uses the results from `validateSquad()` from `validator.js` instead of creating another validation system.

### Formation View

The formation view only arranges the selected players by position using the existing data. It does not add new validation logic.

## 4. Main Design Constraints

I gave the AI these main constraints:

- Use React with Vite.
- Keep validation in one plain JavaScript file with pure functions.
- No backend, database, or state management library.
- No `useEffect`.
- Counts update live as the selection changes.
- VALID or INVALID updates only after clicking Validate Squad.
- Show a small message when the selection changes after validation.
- Use one Reset button.
- Test the required cases before adding the formation view.
- Keep the design simple and clean.

## 5. AI Influence

### Prompt 1

I first asked for a short 3 to 5 step plan without code. The AI gave a general plan for the data, validation, UI, reactivity, and testing.

### Prompt 2

I refined the plan by choosing React and Vite, requiring a separate `validator.js`, adding the duplicate and unknown ID test, and moving the formation view to the end.

This also fixed a gap in the first plan because the project setup was not clearly included as the first implementation step.

### Prompt 3

I asked the AI to actually create the React project, install the packages, start the dev server, and verify it before writing the app code. The initial scaffold produced the wrong template, so the AI detected and fixed it.

### Prompt 4

I asked for the validation engine and direct tests for the main cases and edge cases before building the UI.

### Prompt 5

I asked for the UI with live counts, button-based validation, one Reset button, simple styling, and no `useEffect`.

### Prompt 6

After testing, I found three issues with Reset, selection comparison, and duplicate counting logic. I described the exact problems and the AI fixed them.

### Prompt 7

I asked for the final formation view using the existing selected-player data without adding new validation logic.

Overall, AI helped me speed up the development process by assisting with planning, implementation, testing, and debugging. I still decided the requirements, constraints, and final changes based on my own testing and project needs.

## 6. Trade-offs

I prioritized a simple and focused solution over adding extra technologies or features.

### I prioritized

- Core validation
- Clear UI
- Separate validation logic
- Testing and edge cases
- Reusing existing data for the formation view

### I kept out

- Backend and database
- Authentication
- State management libraries
- Player recommendation or optimization
- Extra features outside the problem statement

The formation view was also kept until the end so that the core validation and required tests were completed first.

## 7. Final Result

The final application follows the refined plan, with improvements made during testing. The core validation was built first, the UI was tested and fixed, and the formation view was added last.
