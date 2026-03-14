# Security Design

## Attack Surface

Minimal. This is a static SPA with no backend, no auth, no database, no user input that gets stored or transmitted. All lesson logic runs client-side. There are no API keys, no secrets, no server-side code.

The only attack vectors worth considering:
- Hosting misconfiguration (missing headers, open redirects)
- Supply chain compromise via npm dependencies
- Content injection if Firebase config is misconfigured

## Content Security Policy

Add security headers in `firebase.json` under the hosting config:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; frame-ancestors 'none'"
          }
        ]
      }
    ]
  }
}
```

Notes:
- `'unsafe-inline'` for style-src is needed because shadcn/ui injects inline styles. This is acceptable for a static app with no user-generated content.
- `connect-src 'none'` because there are no API calls. If TTS or any fetch is added later, this must be relaxed.
- `frame-ancestors 'none'` prevents clickjacking (equivalent to X-Frame-Options DENY but CSP-native).

## HTTPS

Firebase Hosting enforces HTTPS by default on `*.web.app` and `*.firebaseapp.com` domains. No action needed. If a custom domain is added later, Firebase handles cert provisioning automatically.

## Environment Isolation

Prod and staging are separate Firebase Hosting sites within the same Firebase project (or separate projects). Key considerations:

- **Same project, two sites** is the simplest setup. Use `firebase hosting:channel:deploy staging` for preview channels, or configure two named sites in `firebase.json`.
- No secrets to isolate since there's no backend.
- Staging URL should not be indexed: add `X-Robots-Tag: noindex` header on the staging site, or use a `robots.txt` that disallows all.
- Both environments serve identical static assets; there is no config that differs between them, so environment drift is not a concern.

## Child Safety

Even though no data is collected, this app is designed for children ages 7-11. COPPA considerations:

- **No data collection = no COPPA compliance burden.** No cookies, no analytics, no form inputs, no localStorage of personal info. This is the ideal posture.
- **Do not add analytics later without review.** If Google Analytics, session recording, or any tracking is introduced, COPPA requires verifiable parental consent for children under 13. For a 1-week demo, simply don't add any tracking.
- **No third-party scripts.** No ads, no social widgets, no embedded iframes. The CSP above enforces this.
- **No external links.** The app should not link out to external sites that a child could navigate to unsupervised.

If the app is ever deployed beyond a demo, a minimal privacy notice stating "we do not collect any personal information" would be appropriate.

## Dependencies

Supply chain risk is the most realistic threat vector, but impact is low for a demo.

**Direct dependencies of concern:**
- `react`, `react-dom` -- well-maintained, low risk
- `shadcn/ui` -- not an npm package; it's a code generator that copies component source into your repo. Once generated, the code is yours. No runtime dependency on a third-party registry. This is actually better than a typical library dependency.
- `tailwindcss` -- build-time only, not shipped to the browser
- SVG manipulation / pointer event handling -- likely no additional library needed; native browser APIs suffice

**Mitigations (lightweight, appropriate for a 1-week sprint):**
- Use `npm audit` or `pnpm audit` once after initial setup. Fix criticals if any.
- Pin exact versions in the lockfile (default behavior with pnpm/npm).
- Don't add dependencies you don't need. The fewer packages, the smaller the attack surface.

No need for Dependabot, SRI hashes, or subresource integrity for a demo project.

## Key Trade-offs

| Decision | Rationale |
|---|---|
| `'unsafe-inline'` in style-src | Required by shadcn/ui. Acceptable because no user content is rendered. |
| No analytics | Avoids COPPA complexity entirely. Means no usage data from the demo. |
| No SRI hashes on scripts | Unnecessary -- all assets are self-hosted on Firebase, served over HTTPS. |
| Single Firebase project for both envs | Simpler than two projects. Acceptable since there are no secrets or data to isolate. |

## Implementation Notes

1. **Add the `headers` block to `firebase.json` when setting up hosting.** This is a 5-minute task and the single most impactful security action for this project.
2. **Do not add Google Analytics or any tracking SDK.** If an evaluator asks about analytics, explain the COPPA rationale.
3. **Run `npm audit` once** after scaffolding the project. Don't spend time chasing moderate/low findings.
4. Everything else (HTTPS, CDN, caching) is handled by Firebase Hosting defaults.
