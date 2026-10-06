# RMP production handoff

Round 7 staging freeze, reviewed October 5, 2026 (America/Phoenix; October 6 UTC).

Approved frontend: `raisingmypuppy/rmp-demo-v2`, based on Round 6B commit `cb33ef43cbfe6b1861f0d31507d57e2c6ebd4ad1` plus the narrow Round 7 fixes recorded in [QA-ROUND-7.md](QA-ROUND-7.md). The commit containing this document is the freeze reference. The original `rmp-demo` and the production application were not changed.

- Public staging: https://raisingmypuppy.github.io/rmp-demo-v2/
- Member staging: https://raisingmypuppy.github.io/rmp-demo-v2/member.html
- Review states: `member.html?preview=available`, `?preview=used`, `?preview=subscribed`, `?preview=returning`.

## Preserve the approved experience

Carry this frontend into the existing Lovable application. Do not start from a generic template or reopen design decisions. Preserve public layout/copy, navy and metallic gold styling, typography, responsive behavior, immersive uploaded-photo hero, continuous Puppy Helper conversation, Account tray, inline guides, both complete planner editions, and motion/reduced-motion behavior.

Brand: **Raising My Puppy**. Brand line: **Your Official Puppy Manual**. Public hero: **Puppy problems? Let’s figure this out.** The planner statement remains **30+ printable pages in full-color and printer-friendly versions.**

The Puppy Planner is included in RMP membership only. There is no planner-only tier or planner-only price inside RMP. Any future separate planner marketing belongs outside this membership product.

## Customer states and conversion contract

| State | Required behavior |
| --- | --- |
| Available | Clean conversation, optional puppy details/photo, one free question and one answer. Paid history, guides and complete planner remain locked. |
| Used | Keep that answer visible. Further sending is locked. Show guide value and membership invitation. |
| Active/subscribed | Unlimited ongoing conversations, saved conversations, profiles, personalized guides and complete planner access. |
| Returning | Restore active puppy, conversation and history. Clearly offer **Start a new conversation** without removing existing history. |

The public composer draft survives email sign-in and arrives in the member composer unsent. Optional puppy setup must preserve it. Sign-in itself must not consume the free answer. The production server must enforce one completed free exchange per account across browsers/devices, with retry handling that does not double-charge the allowance.

After the free answer, preserve this text:

> No need to remember everything we just talked about. With membership, the Puppy Helper can turn this conversation into a simple step-by-step guide you can save, print, and follow when you need it.

The gold action is **Make [Puppy Name]’s step-by-step guide** or **Make my step-by-step guide**, without a decorative arrow. Before payment, it focuses the membership invitation. After activation, it generates a guide inline and saves it to Account while leaving the chat active.

A successful upgrade must unlock the same conversation, preserve draft/photo/profile context and scroll position, and enable follow-up. It must not replace the conversation or navigate to an empty dashboard.

## Existing Puppy Helper integration: preserve the answer system

Use the existing, approved RMP Puppy Helper production reasoning, prompts, response style and conversational behavior. This repository does not contain or replace that trained configuration. The static `replyFor()` function and `RMPMemberData` fixtures demonstrate UI states only; **do not ship their keyword branches or canned replies as the production AI**.

Before connecting the website channel, locate and preserve the actual existing Lovable/backend PH configuration and calling workflow. Connect this frontend to that existing behavior. Do not rewrite prompts to match the static demo, invent a simplified troubleshooting engine, or change models/prompts simply because the frontend moved through GitHub.

The website request/response boundary must carry:

- Authenticated account and active puppy identifiers.
- Profile context: name, gender, breed/mix, date of birth, estimate flag where relevant, and current calculated age.
- The current user message and prior conversation turns, preserving their order and speaker.
- Uploaded image references/context where supported. Browser `blob:` URLs must be uploaded/resolved into authorized backend image references before an AI request.
- A response tied to the same conversation and a guide-generation request using that conversation's actual context.

Production responses must address the specific situation, use supplied details, ask relevant follow-up questions, and continue naturally. Preserve profile/history/image context. Do not add generic topic menus, canned reassurance, or broad prewritten advice that ignores the question.

Keep `messages`, puppy-owned `history`, conversation identifiers, and guide `source` relationships when mapping to persistent records. Guide updates should retain user notes and completed steps where applicable. Connect async request/pending/error handling at the response boundary without redesigning the conversation.

## Facebook Helper preservation

**The existing Facebook Puppy Helper experience is outside this website rebuild and must remain unchanged unless explicitly requested later.**

Do not modify its prompts, logic, workflows, integrations or behavior. Preserve the existing Facebook writing/helper workflows as well. Website PH integration is a separate channel; website changes must not overwrite shared production configuration used by Facebook.

## Lovable, authentication and persistence

Next phase connects the existing Lovable environment to real email sign-in, persistent accounts, puppy profiles/photos, conversation history, saved guides, real PH AI/image context, Stripe billing and server-enforced entitlements. Preserve the approved UI while connecting those services.

- Keep email-only sign-in and the optional profile step. Do not require payment details for the free session.
- Store date of birth or estimated date of birth, not a permanently fixed age. Recalculate current age for display and each PH request. Demo sample ages belong only to Winnie/Milo fixtures.
- Store each dog's profile, photos, conversations and guides under the correct account. Active-puppy switching must never mix histories or guide sources.
- Preserve Female/Male choices, birthdate, breed/mix, profile photo and multiple dogs.
- Preserve the portrait hero's blurred cover atmosphere plus contained, feathered sharp image under the navy gradient. Landscape/square images retain immersive cover rendering.
- Store uploads persistently with account-scoped access. The demo's object URLs/IndexedDB are not a production file store.
- Save conversations, guides, checks and notes with account ownership enforced by the backend. Persist the current conversation/active dog across visits.
- Connect voice transcription separately if included in the production MVP. The staging microphone opens an editable text fallback and does not record audio.

## Root-domain routing

Production root: `https://raisingmypuppy.com/`.

| Account state | Root destination |
| --- | --- |
| Not signed in | Approved public landing page |
| Signed in, active membership | Member experience automatically, with saved puppy/conversation context |
| Signed in, no active membership | Appropriate available/used/membership state based on the server account status |

Active members should not repeatedly arrive on the sales page. Preserve any draft through the authentication callback before applying state routing. Production routing must not trust a `preview` query parameter for entitlements. No production authentication routing was implemented in GitHub staging.

## Stripe production contract

Documented only; no Stripe integration or charge was added in Round 7.

- First PH question and answer free, no card required.
- Request payment only after the free answer.
- Membership is **$3.99/month or $30/year**.
- Cancel anytime; access continues through the paid period.
- Digital purchases are non-refundable under the approved product policy.
- No planner-only payment tier. Both planner editions are included with membership.

Connect real Checkout, verified/idempotent webhook handling, subscription state and Customer Portal in the backend phase. Enable member access from verified server subscription status, not a button click or return URL. Reconcile cancellations, payment failures, renewal dates and paid-through access with the account record. Preserve the conversation throughout checkout/return.

## Legacy URL Redirect Requirements

Inventory is based on the staging repository, read-only inspection of the existing RMP public site on October 5/6, 2026, and the user-confirmed FYH campaign path from the September 26 project conversation. Repository source contained `/privacy` and `/terms`; guide/coach routes are not implemented in this static build. The additional paths below were found in the current site's links/search records or the identified campaign brief, not invented.

All paths are on `https://raisingmypuppy.com`. Preserve these paths or issue permanent redirects (301/308) to their real replacements. Where there is no one-to-one replacement, redirect to `https://raisingmypuppy.com/`. Do not deploy these redirects to GitHub Pages or modify production during this staging round.

| Observed legacy path | Evidence | Production requirement |
| --- | --- | --- |
| `/coach` | [Guides navigation](https://raisingmypuppy.com/guides) | Preserve PH entry; route through auth/account state with any draft/context retained. |
| `/coach?topic=biting` | [Home problem links](https://raisingmypuppy.com/) | Preserve topic context through PH entry. |
| `/coach?topic=potty` | Home problem links | Same. |
| `/coach?topic=crate` | Home problem links | Same. |
| `/coach?topic=overwhelmed` | Home problem links | Same. |
| `/guides` | Home navigation and guide index | Retain index if carried forward; otherwise permanent redirect to root. |
| `/puppy-blues` | [Guide index](https://raisingmypuppy.com/guides) and home footer | Retain guide or redirect to direct replacement; root if removed. |
| `/guides/biting` | Guide index | Same. |
| `/guides/crate-training` | Guide index | Same. |
| `/guides/potty-training` | Guide index | Same. |
| `/training-videos` | Guide index | Same. |
| `/nail-trimming` | Guide index link, observed redirect to `/games/nail-trim` | Preserve existing alias, avoiding a redirect loop. |
| `/games` | Home navigation | Retain destination if carried forward; root if removed. |
| `/games/nail-trim` | Home game link and `/nail-trimming` redirect | Retain game if carried forward; root if removed. |
| `/planners` | Home and guide navigation | Route to membership-included planner value/access. Do not restore a planner-only RMP checkout. |
| `/pricing` | Home/guide footer | Direct replacement is the approved membership offer at root; preserve active-member routing. |
| `/fyh` | User-confirmed September 26 FYH landing page and QR flyer brief | Preserve the Follow Your Heart QR destination and existing campaign handling; if retired without a direct replacement, permanent redirect to root. Current reachability could not be independently verified in this audit. |
| `/privacy` | Repository footer and live site | Keep current policy destination available and update it for actual production handling. |
| `/terms` | Repository footer and live site | Keep policy available; align terms with the new approved offer before launch. |
| `/refunds` | Existing indexed [Refund Policy](https://raisingmypuppy.com/refunds) | Preserve or redirect to the actual policy replacement. |
| `/refund-policy` | Existing indexed [Refund Policy](https://raisingmypuppy.com/refund-policy) | Preserve this alternate policy path as well. |

This is an evidence-based inventory, not proof of every externally distributed URL. The static repository contains no export of Pinterest pins, Facebook links, QR codes, campaign routes or production route definitions. Sitemap/robots retrieval was unavailable during the audit. Before production cutover, supplement this table from the existing Lovable route configuration, search analytics, pin/post link lists and actual QR campaign destinations. Every discovered guide, Pinterest, Facebook, `/coach` and QR link must resolve after launch. Preserve meaningful topic/campaign query parameters where appropriate; do not forward authentication tokens to unrelated destinations.

Test the redirect map before launch: known URLs should return the retained page or a permanent redirect with no loop/404. Do not silently delete old guides or rename publicly distributed paths.

## Metadata and launch checks

Both staging HTML pages retain `noindex,nofollow`. Remove the restriction only for the intended public production page when production launches; authenticated pages should remain appropriately non-indexed.

Public title is **Raising My Puppy | Your Official Puppy Manual**. Open Graph/Twitter metadata uses the existing approved `assets/social/rmp-social-preview.png` unchanged (1731 × 909). At production launch, update staging absolute metadata URLs to the production domain and preserve the approved social image.

The staging footer now points to the existing RMP privacy/terms pages instead of missing GitHub-root paths. The existing public production pricing/policy pages still contain legacy offers/policy text. Update the applicable pages to the approved one-free-answer, $3.99/$30, non-refundable and membership-only planner rules during production integration, before launch. This round did not edit production content.

## Staging limits and freeze boundary

This is a static UX demonstration, not live authentication, email delivery, AI, audio recording or billing. The sign-in continuation sends no email; **Continue with RMP** simulates activation. Normal `member.html` uses browser-local IndexedDB. Explicit preview states use temporary fixtures independent of saved browser data and reset on reload.

The public continuation still enters `?preview=available` and transfers its question through one-time sessionStorage. Customer entry hides reviewer controls/debug notes; explicit review URLs retain them, and `&test=1` can force their display. That separation does not change entitlements or make the temporary flow production persistence. Browser storage must be available for the static draft handoff.

The complete PDFs and images remain public static URLs in staging; UI locks demonstrate the product flow only. Production requires server-side membership checks and appropriate protected asset delivery.

Ready for the Lovable/backend integration phase after the QA freeze. Production launch still requires the real services above, validation of the existing PH behavior, full legacy-route inventory/redirect verification, policy alignment, and cross-browser/device checks with the connected application. Do not treat this freeze as authorization to replace the existing PH or Facebook workflows, change DNS, or launch production.
