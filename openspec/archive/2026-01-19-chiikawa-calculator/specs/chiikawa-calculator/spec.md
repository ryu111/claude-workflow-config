# Chiikawa Calculator Specification

## Overview

吉伊卡哇風格科學計算機 - 結合療癒可愛視覺與實用科學計算的網頁應用。

---

## ADDED Requirements

### Requirement: Basic Arithmetic Operations
The system SHALL support four basic arithmetic operations.

#### Scenario: Addition
- **GIVEN** user enters "5 + 3"
- **WHEN** user presses equals
- **THEN** display shows "8"

#### Scenario: Subtraction
- **GIVEN** user enters "10 - 4"
- **WHEN** user presses equals
- **THEN** display shows "6"

#### Scenario: Multiplication
- **GIVEN** user enters "6 * 7"
- **WHEN** user presses equals
- **THEN** display shows "42"

#### Scenario: Division
- **GIVEN** user enters "15 / 3"
- **WHEN** user presses equals
- **THEN** display shows "5"

#### Scenario: Division by Zero
- **GIVEN** user enters "5 / 0"
- **WHEN** user presses equals
- **THEN** display shows "Error"
- **AND** character shows confused expression

---

### Requirement: Scientific Functions
The system SHALL support scientific mathematical functions.

#### Scenario: Trigonometric Functions
- **GIVEN** user has a number on display
- **WHEN** user presses sin/cos/tan button
- **THEN** system calculates trigonometric value (radians)
- **AND** displays result

#### Scenario: Inverse Trigonometric Functions
- **GIVEN** user has a number in valid range [-1, 1] for asin/acos
- **WHEN** user presses asin/acos/atan button
- **THEN** system calculates inverse trigonometric value
- **AND** displays result in radians

#### Scenario: Logarithmic Functions
- **GIVEN** user has a positive number on display
- **WHEN** user presses log (base 10) or ln (natural log)
- **THEN** system calculates logarithm
- **AND** displays result

#### Scenario: Invalid Logarithm Input
- **GIVEN** user has zero or negative number
- **WHEN** user presses log or ln
- **THEN** display shows "Error"
- **AND** character shows confused expression

#### Scenario: Power Operations
- **GIVEN** user enters base number
- **WHEN** user presses x^y and enters exponent
- **THEN** system calculates power
- **AND** displays result

#### Scenario: Square Root
- **GIVEN** user has a non-negative number
- **WHEN** user presses sqrt button
- **THEN** system calculates square root
- **AND** displays result

#### Scenario: Invalid Square Root
- **GIVEN** user has a negative number
- **WHEN** user presses sqrt button
- **THEN** display shows "Error"
- **AND** character shows confused expression

---

### Requirement: Parentheses Support
The system SHALL support parentheses for operation grouping.

#### Scenario: Nested Parentheses
- **GIVEN** user enters "(2 + 3) * (4 - 1)"
- **WHEN** user presses equals
- **THEN** system evaluates inner expressions first
- **AND** displays "15"

#### Scenario: Unbalanced Parentheses
- **GIVEN** user enters "((2 + 3)"
- **WHEN** user presses equals
- **THEN** display shows "Error"
- **AND** character shows confused expression

---

### Requirement: Clear and Backspace
The system SHALL provide clear and backspace functionality.

#### Scenario: Clear All (AC)
- **WHEN** user presses AC button
- **THEN** display resets to "0"
- **AND** expression history clears
- **AND** character shows surprised expression

#### Scenario: Backspace
- **GIVEN** user has entered "123"
- **WHEN** user presses backspace
- **THEN** display shows "12"

---

### Requirement: Character Emotion Feedback
The system SHALL display character emotions based on calculator state.

#### Scenario: Idle State
- **WHEN** calculator is idle
- **THEN** character displays smile expression

#### Scenario: Inputting
- **WHEN** user is entering numbers or operators
- **THEN** character displays focus expression

#### Scenario: Successful Calculation
- **WHEN** calculation completes successfully
- **THEN** character displays happy expression
- **AND** expression persists for 2 seconds

#### Scenario: Error State
- **WHEN** calculation results in error
- **THEN** character displays confused expression
- **AND** expression persists for 2 seconds

#### Scenario: Clear Action
- **WHEN** user presses AC
- **THEN** character displays surprised expression
- **AND** expression persists for 1 second

#### Scenario: Large Result
- **WHEN** result exceeds 1,000,000
- **THEN** character displays amazed expression

---

### Requirement: Visual Design - Chiikawa Style
The system SHALL follow Chiikawa visual design principles.

#### Scenario: Color Palette
- **THEN** primary colors are soft pastels (light blue, light pink, cream)
- **AND** accent colors are warm (peach, light yellow)
- **AND** no harsh or saturated colors

#### Scenario: Border Radius
- **THEN** all interactive elements have border-radius >= 16px
- **AND** main container has border-radius >= 24px
- **AND** no sharp corners visible

#### Scenario: Typography
- **THEN** font is rounded and friendly
- **AND** numbers are clearly legible
- **AND** button labels are easy to read

#### Scenario: Character Display
- **THEN** character SVG is visible in designated area
- **AND** character size is proportionate to calculator
- **AND** character does not obstruct functionality

---

### Requirement: Button Animation
The system SHALL provide animated feedback for button interactions.

#### Scenario: Button Press
- **WHEN** user clicks a button
- **THEN** button scales down slightly (0.95)
- **AND** returns to normal with bounce easing
- **AND** animation duration is 150ms

#### Scenario: Button Hover
- **WHEN** user hovers over a button
- **THEN** button slightly lifts (translateY: -2px)
- **AND** shadow increases subtly
- **AND** transition is smooth (200ms)

---

### Requirement: Keyboard Support
The system SHALL support keyboard input.

#### Scenario: Number Keys
- **WHEN** user presses 0-9 keys
- **THEN** corresponding number is entered

#### Scenario: Operator Keys
- **WHEN** user presses +, -, *, /
- **THEN** corresponding operator is entered

#### Scenario: Enter Key
- **WHEN** user presses Enter or =
- **THEN** calculation executes

#### Scenario: Escape Key
- **WHEN** user presses Escape
- **THEN** calculator clears (same as AC)

#### Scenario: Backspace Key
- **WHEN** user presses Backspace
- **THEN** last character is deleted

---

### Requirement: Responsive Design
The system SHALL be responsive across devices.

#### Scenario: Desktop View
- **GIVEN** viewport width >= 768px
- **THEN** calculator displays at optimal size
- **AND** all buttons are comfortably clickable

#### Scenario: Mobile View
- **GIVEN** viewport width < 768px
- **THEN** calculator scales to fit screen
- **AND** buttons remain touch-friendly (min 44px)
- **AND** no horizontal scrolling required

#### Scenario: Reduced Motion
- **GIVEN** user has prefers-reduced-motion enabled
- **THEN** animations are disabled or minimal
- **AND** functionality remains intact

---

### Requirement: Accessibility
The system SHALL be accessible to all users.

#### Scenario: Screen Reader Support
- **THEN** all buttons have aria-labels
- **AND** display has aria-live for result announcements
- **AND** calculator has role="application"

#### Scenario: Focus Management
- **THEN** all interactive elements are focusable
- **AND** focus order is logical
- **AND** focus indicators are visible

---

## Constants Definition

```javascript
// Emotion types
const EMOTIONS = Object.freeze({
  SMILE: 'smile',
  FOCUS: 'focus',
  HAPPY: 'happy',
  CONFUSED: 'confused',
  SURPRISED: 'surprised',
  AMAZED: 'amazed'
});

// Operator types
const OPERATORS = Object.freeze({
  ADD: '+',
  SUBTRACT: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  POWER: '^'
});

// Scientific functions
const FUNCTIONS = Object.freeze({
  SIN: 'sin',
  COS: 'cos',
  TAN: 'tan',
  ASIN: 'asin',
  ACOS: 'acos',
  ATAN: 'atan',
  LOG: 'log',
  LN: 'ln',
  SQRT: 'sqrt',
  SQUARE: 'square',
  CUBE: 'cube'
});

// Timing constants (ms)
const TIMING = Object.freeze({
  BUTTON_PRESS: 150,
  BUTTON_HOVER: 200,
  EMOTION_PERSIST: 2000,
  CLEAR_EMOTION: 1000
});

// Thresholds
const THRESHOLDS = Object.freeze({
  LARGE_NUMBER: 1000000,
  MAX_DISPLAY_LENGTH: 15
});
```
