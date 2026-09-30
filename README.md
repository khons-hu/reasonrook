# Khonsolve

[Open app ↗](https://solve.khns.dev/)

A free practice workshop for coding, debugging, logic, prompts and agent skills. Write an approach, try it, reveal hints when needed, then reflect.

## What's here

- 15 original exercises across five tracks.
- Five executable exercises with JavaScript, TypeScript and Python sample checks in disposable browser workers.
- Experimental local C11 / C++17 compilation with Clang 8 in WebAssembly. Full programs run with a main function and printed output, rather than automatic exercise grading. First use loads about 60 MB.
- Go starter code, separate saved drafts, download and a link to Go Playground. Go does not have an in-app compiler.
- Written exercises with incremental hints, explanations and explicit self-review rubrics.
- Saved drafts, a revisit list, light/dark themes and JSON backup/import.
- No account, backend, telemetry, paid dependencies or paid AI calls.

## Run locally

Requires Node.js 20+ for the development server and tests. The deployed app runs in modern browsers.

```sh
npm start
# http://127.0.0.1:4174
npm test
```

No npm install is needed. Runtime files are vendored and loaded on demand. Deploy on Vercel with Framework Preset **Other**, no build command and output directory `.`.

## What the checks mean

Passing the visible cases is not a proof of correctness or a complexity assessment. Written exercises are self-reviewed. Reference answers are teaching examples, not the only valid solution. This is a curated starting collection, not a continuously updated or universally best curriculum.

All local language runners execute in a Worker inside a sandboxed iframe without `allow-same-origin`. Runner CSP blocks HTTP network access (in-memory blob resources are permitted), and the worker is terminated after two seconds of code execution (runtime initialization has a separate limit). There is no server-side execution in Khonsolve. Go Playground and Compiler Explorer run code externally only after you submit it there. TypeScript uses a browser-compatible 6.0.3 transpiler, without semantic type checking or package imports. Python uses Pyodide 314.0.7, with an approximately 14 MB first-run download from this site and no pip support. It is a personal learning runner, not a secure competition judge: a determined user can inspect answers or tamper with their own results. Memory limits depend on the browser. Do not paste secrets or run code you do not understand.

Progress stays in this browser's local storage. Clearing site data or using another device does not preserve it. Export a backup. Import validates the schema, caps file/field sizes, ignores unknown exercise IDs and merges known exercises after explicit confirmation.

## Content and sources

All exercise wording, examples and explanations are authored for this project. External links are for further study. No affiliation with LeetCode, HackerRank or model providers.

Sources checked September 2026:
- [LeetCode Top Interview 150](https://leetcode.com/studyplan/top-interview-150/)
- [HackerRank preparation kits](https://www.hackerrank.com/interview/preparation-kits)
- [Prompt engineering guidance](https://developers.openai.com/api/docs/guides/prompt-engineering)
- [Agent Skills specification](https://agentskills.io/specification)
- [MDN Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)

## Contributing

Exercises live in `content.mjs`. Include a learning objective, three hints, a worked explanation and three observable review criteria. Runnable exercises also need starter code, deterministic tests and a reference implementation. Run `npm test` and check keyboard/mobile behaviour before proposing changes.

Built by [khonsu](https://khns.dev/) with coding-agent assistance.

Vendored runtime provenance and build notes: [vendor/README.md](vendor/README.md).

## License

Original project code is available under the [MIT License](LICENSE), copyright © 2026 Patrick Obrtal. Third-party components retain their own licenses.

Bundled compiler and runtime notices are documented in [vendor/README.md](vendor/README.md) and retained next to their files. The root MIT license does not replace those terms.

## Android preview

[Download the signed APK](https://github.com/khons-hu/khonsolve/releases/tag/android-v1.0.0-preview.1) · [Build instructions](android/README.md) · [Verification](android/VERIFICATION.md)

Android 8.0+ with a current TWA-capable browser (Chrome recommended). This small package opens the live web app. First load and server data require internet. Build, lint and signature checks pass, but installation and flows on an Android device have not yet been verified. No Google Play release or additional background notification service.
