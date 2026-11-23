# Control Group of One

> Your body isn't average. Stop following average advice.

![CI](https://github.com/<your-username>/control-group-of-one/actions/workflows/ci.yml/badge.svg)

An on-phone lab that runs **controlled experiments on your own habits** and tells you honestly what works for you, while your raw health data stays on your device.
Built for **wHACKiest 2026 · Track 3: Know Thyself**.

| | |
|---|---|
| Slides | `<Google Drive link>` |
| Video pitch | `<YouTube link>` |
| Live demo | `https://<your-username>.github.io/control-group-of-one/` |
| Team | `<Team Name>` · `<Team ID>` |

**Status: early prototype / proof of concept.** The statistics engine and a browser demo work and are tested. The Android app is not built yet (see [status](#status)).

## The problem
Health advice is averaged, but people respond differently. In the HERITAGE study, 742 adults did the same 20-week program and gained 400 mL/min of oxygen uptake on average, yet 7% gained 100 or less and 8% gained 700 or more. Researchers debate how much of that gap is measurement noise, which is why one-off before/after comparisons can't settle it. Meanwhile, people's phones and bands record plenty of data that never becomes a decision. Existing tools either tie you to their own hardware, give cloud-based chat advice, or stop at correlations.

## The idea
1. **Pick** a goal and one habit (for example, no caffeine after 2 pm).
2. **Design:** the app builds a ~3-week plan with alternating habit-on and habit-off blocks.
3. **Nudge:** a voice reminder in your language, plus a one-tap check-in.
4. **Measure:** read sleep data and compare followed nights.
5. **Verdict:** *Likely helps / No meaningful effect / Not enough evidence*, always with a range, never a diagnosis.

## Status
| Part | State |
|---|---|
| Experiment engine (plan, bootstrap range, verdict) | Built and tested: `engine.js` |
| Browser demo (plan, chart, verdict, privacy receipt, export/delete) | Built: `index.html` |
| ElevenLabs voice proxy for AWS Lambda | Code and mocked tests: `cloud/nudge-proxy.js`. Not yet run against the live API. |
| Android app (Health Connect, encrypted DB, scheduler) | Planned |
| S3 audio cache, Bedrock explanations | Planned |

## Try it
```bash
git clone https://github.com/<your-username>/control-group-of-one.git
cd control-group-of-one
npm test        # engine + proxy tests, no dependencies to install
npm start       # or just open index.html in a browser
```
In the demo, click a "Demo data" button (synthetic data with a known built-in effect) or paste one line per night: `minutes asleep, followed (1 or 0)`.

## Measured behaviour
18 nights, simulated noise, 200 experiments per row (`tests/engine.test.js`):

| True effect | Called "Likely helps" |
|---|---|
| 0 min | 6% (false positives) |
| +25 min | 50% |
| +40 min | 83.5% |

Short experiments only detect fairly large effects, so "Not enough evidence" is a normal, honest result.

## Tech stack
| Layer | Technology | Why |
|---|---|---|
| Engine, demo, proxy, tests | **JavaScript** (ES2020, Node.js 18+) | Same code runs in the browser and in tests; zero npm dependencies |
| Demo UI | HTML5, CSS3, SVG | Single static page, no build step |
| Voice (browser) | Web Speech API | Offline placeholder for the nudge |
| Voice (sponsor) | **ElevenLabs** text-to-speech API | Nudges in Kannada, Hindi, Tamil and Telugu |
| Cloud (sponsor) | **AWS Lambda** (planned: S3, Bedrock with Guardrails) | Keeps the API key off the device |
| CI and hosting | GitHub Actions, GitHub Pages | Tests on every push; live demo link |
| Planned Android app | Kotlin, Jetpack Compose, Health Connect, Room + SQLCipher, WorkManager | Native access to wearable data, encrypted on-device storage |
| Method | Bootstrap resampling, seeded Mulberry32 PRNG | Honest uncertainty, reproducible results |

## Privacy by design
- Raw data is processed on the device. The demo makes **zero** network requests unless you paste a proxy URL.
- The Lambda proxy accepts only a **template id and a language**, never free text, so health data can't pass through it (tested).
- The privacy receipt screen shows what left the device. Export and delete are one tap.
- Never commit API keys. Set `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (and optionally `ELEVENLABS_MODEL_ID`) as Lambda environment variables.

## Repository layout
```
engine.js               core experiment engine
index.html              browser demo
cloud/nudge-proxy.js    AWS Lambda handler for ElevenLabs voice
tests/                  engine and proxy tests
docs/architecture.md    architecture diagram and method
docs/screenshots/       demo screenshots
.github/workflows/      CI
```

## Limits and honest assumptions
- "Meaningful" means ±15 minutes of sleep, an assumption set in `analyze()`.
- Habits can't be blinded, so results are evidence, not proof. This is not medical advice.
- Demo data is synthetic. Pasted data is not validated against a real wearable yet.
- Cheap-sensor accuracy is a risk; within-person comparisons cancel consistent bias but not random noise.

## Roadmap
Android app with Health Connect → encrypted local database → weekday/workout baseline adjustment → check-in reminders → live ElevenLabs nudges via Lambda → S3 audio cache → guardrailed plain-language explanations.

## Team
| Name | Role |
|---|---|
| `<Member 1 (Lead)>` | `<role>` |
| `<Member 2>` | `<role>` |

## License
MIT. See `LICENSE`. Evidence cited above: HERITAGE Family Study results as reported in the exercise-science literature.
