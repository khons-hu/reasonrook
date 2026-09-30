# Practice workbench — proposed first version

Status: approved. JavaScript runner with any-language notes implemented.

## Purpose
A personal practice app for solving problems manually, explaining decisions, and learning from mistakes. Free static hosting, no accounts, no paid AI calls. Public GitHub repository and portfolio entry after implementation and QA.

## Practice loop
Choose a problem → write an approach and edge cases → attempt → reveal incremental hints if needed → compare with a worked explanation → reflect and schedule a revisit.

## Content
Five tracks: coding patterns, debugging, logic/data reasoning, prompt design, reusable agent skills. Start with a carefully reviewed original exercise collection covering all tracks. External practice links point to official platforms, without copying their problem statements or implying affiliation. Each exercise carries difficulty, expected effort, learning objective, hints, review rubric and explanation. Code tests assess only supplied cases, not proof of correctness. Written exercises use explicit self-review, not simulated AI grading.

Prompt exercises cover clear goals, input/output contracts, evidence, uncertainty and test cases. Skill exercises cover activation descriptions, scoped instructions, supporting resources and evaluation against realistic tasks.

## Execution choice
Recommended: in-browser JavaScript runner plus any-language notes. Alternative: notes with external runners. Expanded alternative: Python and JavaScript runtimes. Never execute visitor code on the hosting server. Browser execution must be isolated from app storage and network, bounded by a timeout, and tested against infinite loops and errors.

## Interface
Working name: Reasonrook. A quiet workshop, not a leaderboard. Slate blue #20354a, fog #edf2f5, paper #ffffff, muted blue #667b90, ochre #b47529. Georgia for exercise headings, system sans for controls and body, monospace for code. Desktop: searchable/filterable exercise library alongside a focused workbench. Mobile: library above workbench. Signature: the attempt/hints/review progression exposes help deliberately rather than giving away solutions on arrival. No ambient animation.

## Data
Local browser storage for drafts, completion and reflection. JSON export/import with schema validation and size bounds. Clear indication that browser data can be lost and export is a backup. No secrets, telemetry or backend required.

## Acceptance
All exercise filters and navigation work. Drafts survive reload. Hints reveal incrementally. Completion is honest self-assessment. Import/export round-trip without executing imported markup. Keyboard-accessible controls and responsive layout at 320px and desktop. Runner errors and timeouts recover without losing work if runner is selected. Public repository contains only project files and documented source links. Deployment and portfolio link verified live.

## Research sources checked 2026-09-20
- https://leetcode.com/studyplan/top-interview-150/
- https://www.hackerrank.com/interview/preparation-kits
- https://developers.openai.com/api/docs/guides/prompt-engineering
- https://agentskills.io/specification
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

These inform topic selection and implementation. They do not establish a universal best curriculum or guarantee improved critical thinking.
