# Round 7 QA and staging freeze

Reviewed October 5, 2026 (America/Phoenix; October 6 UTC), on the Round 6B baseline `cb33ef43cbfe6b1861f0d31507d57e2c6ebd4ad1` with the corrections below. This document and [PRODUCTION-HANDOFF.md](PRODUCTION-HANDOFF.md) travel with the freeze commit.

## Corrections made

1. Restored three confirmed zero-byte viewer images from the corresponding pages in the existing PDFs: `color/19.webp` (Behavior & Mood Log), `color/31.webp` (Food Allergy Guide), and `ink/05.webp` (Important Contacts). Rendered at the existing 1600 × 2071 size. The PDFs, cover assets, remaining 76 page images and viewer architecture were unchanged.
2. Added missing Open Graph/Twitter metadata pointing to the existing approved social image. Preserved the Round 6B title and staging robots restrictions.
3. Changed public Privacy/Terms links from missing GitHub-root destinations to the existing RMP policy URLs. Production policy alignment is documented separately; production was not edited.
4. Kept reviewer controls/debug notes out of public-to-member customer entry, including a page reload. Explicit review URLs retain controls; `test=1` can explicitly show them. Membership-state/persistence isolation remains unchanged.
5. Restricted member settings/membership technical notes to testing states. The microphone fallback now uses neutral language in normal customer entry and still clearly says it is not recording. Public replay is labeled “Replay example.”
6. Allowed membership-benefit text to wrap below the existing 760px breakpoint. A `white-space: nowrap` rule had clipped the planner benefit at 390px and 320px. Copy, typography, colors and desktop/tablet behavior were unchanged.

No redesign, pricing changes, AI/prompt changes, real authentication, email, Stripe integration, Facebook changes, production-site changes or DNS changes were made. `replyFor()` and `sendMessage()` were compared against the baseline and are unchanged. All member CSS, including approved portrait-photo and ticker behavior, is unchanged. Public CSS has only the narrow benefit-wrapping correction.

## Test coverage

Tests used local Chromium 153/Playwright, the actual HTML/JS/CSS and assets, and fresh browser contexts. No mocked PH/backend service was substituted for the shipped static demo. Native print invocation was observed with a print stub; browser print CSS was additionally rendered to PDF. A physical printer, Safari and Firefox were not exercised.

| Viewport width | Public/free/paid journey | All four isolated states | Public, Account, planner controls | Result |
| --- | --- | --- | --- | --- |
| 1440px | Pass | Pass | Pass | Pass |
| 1280px | Pass | Pass | Pass | Pass |
| 1024px | Pass | Pass | Pass | Pass |
| 768px | Pass | Pass | Pass | Pass |
| 390px | Pass | Pass | Pass | Pass |
| 320px | Pass | Pass | Pass | Pass |

Full journeys additionally passed with reduced motion at 1440px and 320px. Reduced-motion ticker/public final-example states were checked at all six widths. Mobile checks used 740px height; an additional 320 × 640 check covered dialogs, keyboard focus and persistence. Screenshots of public/member flows, Account, planner and photos were inspected.

### Customer journey and state checks

- Public typed question → Start your session → valid email entry → Continue to my free session → member composer prefill, without submitting or spending the free answer.
- Invalid/empty email does not continue. Sign-in drawer opens/closes and restores focus.
- Optional puppy details and photo preserve the draft. Available state has no fake messages, recent conversations or guides.
- One free user question and one PH answer; Send and Enter cannot create another exchange in used state.
- Guide value and membership offer appear after the answer. Free guide action restores/focuses the invitation without creating a guide. History/guides/planner remain gated.
- Continue with RMP enables active access without replacing message/composer DOM nodes, losing draft/profile context or jumping to the page top.
- Follow-up appends another exchange. Guide generation stays inline, saves to Account and leaves the composer active. Notes/checks and source-conversation relationships survive reopening.
- Start a new conversation preserves profile and prior history. Switching Winnie/Milo restores each dog's own context/history.
- Normal browser-local active state and saved guides restore on reload. The four explicit preview states ignore that saved paid account.
- Customer entry hides testing controls, including on reload; explicit `test=1` remains available. Normal membership/settings/voice surfaces contain no demo/backend disclaimers.

### Profile, photo and age checks

- Name, birthdate, Female/Male choices, breed/mix and photo controls are present; no Unknown choice.
- Claire portrait, landscape puppy image and square puppy image tested at desktop/tablet/mobile widths (1440, 768, 390, 320).
- Portrait uses contain plus blurred cover atmosphere, intersecting feather masks and the navy gradient; no border, rounded card, shadow or card background. Landscape/square retain cover treatment. Uploaded images do not acquire unwanted parallax cropping.
- Message photo attachment displays within the conversation. Profile photo, conversation, guide notes and checks persist in normal browser-local storage.
- With the clock fixed at October 5, 2026, birthdates produced Under 1 month, 1 month, 5 months, 11 months, 1 year and 2 years as expected. Advancing the clock and rendering the same profile updated its age without changing its stored birthdate.

### Planner, printing and motion checks

- Both editions receive equal button/preview treatment. Complete 39-page color and 40-page printer-friendly viewers open, scroll to their final page, and switch editions.
- All 79 WebP files decode successfully, including the repaired pages. All public page images decode.
- Both PDF download responses contain valid PDF data; browser download controls produce the correct filenames.
- Print controls prepare all 39/40 page images, wait for image decode, and temporarily close the dialog. After-print restores the viewer.
- Browser-generated print PDFs contain exactly 39 color pages and 40 printer-friendly pages at US Letter size. Guide print content is also rendered through the print stylesheet.
- Desktop/tablet planner loops retain 100s, linear, infinite timing. Mobile remains 84.75s, about 18% faster in duration-based traversal rate. Hover/focus pauses; reduced motion removes animation and permits manual horizontal browsing.
- Public PH example completes its one-time animation, displays the guide, and replays on demand. Reduced motion shows its final state directly.

### Layout, copy and metadata checks

- No document horizontal overflow at the required widths. The clipped mobile membership benefit was corrected and retested. Account/dialog/planner content remains scrollable on short screens.
- Public hero, PH, static planner showcase, refrigerator, Account preview, membership CTA and email drawer work. Header Account scrolls to the correct public preview.
- Persistent member composer, photo/mic controls, readable dark Send text, active state and new-conversation action remain intact. Dialog focus is contained and Escape restores focus.
- Only $3.99/month and $30/year appear as RMP membership prices in the staging offer. One-free-answer/no-card language and membership-only planner rules are preserved.
- Raising My Puppy / Your Official Puppy Manual branding is intact. The old tagline and customer-facing staging labels are absent from normal surfaces.
- Both HTML pages have `noindex,nofollow`. Public title is Raising My Puppy | Your Official Puppy Manual.
- Approved social image is unchanged, valid and linked by absolute Open Graph/Twitter URLs. No source or layout modification to that image.
- No JavaScript page errors occurred in passing test runs.

## Immutable asset references

SHA-256 checks confirm the unchanged originals:

| File | SHA-256 |
| --- | --- |
| `assets/member-planner/puppy-planner-color.pdf` | `ea07598a66ed669110b82b82d1660da826e21e7f3fa96015a9ed383b7d4cbf3d` |
| `assets/member-planner/puppy-planner-ink.pdf` | `fe11160d68ee8a66048ad19b4e9c9769e491db961342420765d47dec1f3c48b8` |
| `assets/social/rmp-social-preview.png` | `6d44cd3cd633796f9118b03a50a1a54fb4b852c18d521d9b9422b2c55e4729c2` |

## Remaining boundaries

No known blocking defect remains in the tested staging scope. This is ready for the Lovable/backend integration phase, not a production launch.

The static build does not send emails, record audio, call the real PH, process payments, provide secure planner access or persist preview fixtures across reloads. These are documented integration boundaries, not claims of completed backend functionality.

The legacy route inventory records discovered routes and the required redirect policy. Full campaign/Pinterest/Facebook/QR link coverage must be reconciled with the production route/link inventory before cutover. Existing production pricing and policy pages must also be aligned with the approved offer. Neither production content nor Facebook Helper was changed.
