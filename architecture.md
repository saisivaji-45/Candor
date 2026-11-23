# Architecture

```mermaid
flowchart LR
  W["Band or phone"] --> HC["Health Connect"]
  subgraph Phone["On the phone: raw data never leaves"]
    HC --> DB[("Encrypted local DB")]
    DB --> ST["Stats engine"]
    ST --> V["Verdict card"]
    DB --> SCH["Nudge scheduler"]
    SCH --> PR["Privacy receipt"]
  end
  SCH -- "template id + language only" --> L["AWS Lambda proxy"]
  subgraph Cloud["Cloud: no health data"]
    L --> E["ElevenLabs TTS"]
    L --> S3[("S3 audio cache")]
  end
```

| Block | Status |
|---|---|
| Stats engine, verdict card, privacy receipt (browser) | Built: `engine.js`, `index.html` |
| Lambda proxy to ElevenLabs | Code and mocked tests: `cloud/nudge-proxy.js`; not yet run against the live API |
| Health Connect, encrypted DB, scheduler (Android) | Planned |
| S3 audio cache, Bedrock explanations | Planned |

## How a verdict is computed
1. A randomised plan alternates habit-on and habit-off blocks (3 cycles × 3+3 nights), shuffled within each cycle.
2. Only nights where the plan was followed count (adherence is reported).
3. Effect = mean(on) − mean(off). A bootstrap (5,000 resamples, seeded) gives a 95% range.
4. *Likely helps* needs the whole range above 0 and an effect of at least 15 min (an assumption). *No meaningful effect* needs the whole range within ±15 min. Anything else is *Not enough evidence*.
