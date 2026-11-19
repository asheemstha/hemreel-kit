// Timers that run in JavaScript. CSS durations live in tokens.css; these mirror them where a script needs a number.
export const TIMING = {
  tooltipDelay: 400, // ms before a tooltip opens
  repeatWait: 400, // ms a stepper button is held before it starts repeating
  repeatEvery: 90, // ms between repeats while held
  toast: 5000, // ms before a toast dismisses itself (placeholder, see section 13)
  clip: 320, // matches --dur-clip
  copied: 1600, // ms a copy button shows "Copied" before it goes back
  searchDebounce: 150, // ms of quiet typing before a search field reports its text
} as const;
