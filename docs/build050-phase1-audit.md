# Visualisation Hub — Build 050 Phase 1 parity audit

**Audit date:** 5 November 2026  
**Phase 1:** inspection and evidence only; no application code changed during that phase
**Phase 2:** source corrections for specific audited parity defects; awaiting preview deployment and authenticated acceptance
**Reference:** `Visualisation_Hub_Build050(3).html`  
**Reference SHA-256:** `d0edb912514dd65723db610d9a1e48b71a3361a735c2e937c543c9f5cf92efb8`  
**Source audited:** `matthewcardiff/rssi-visualisation`, branch `build052-visual-restoration`, commit `57a8403c62ade90d0a49e03944654f1b0056750a`  
**Live page inspected:** `https://rssi-visualisation.netlify.app/`

## Scope and evidence

Build 050 is the visual and intended-interaction baseline. The connected app remains authoritative for live identity, access permissions, persistence and finance publication controls. I compared the Build 050 HTML and screenshots with the current branch source, recent screenshots supplied in this conversation, and the currently reachable Netlify page.

The current Netlify page first showed the Build 052 sign-in page. I signed into the user's authorised staging session using the secure browser sign-in flow, then inspected the authenticated dashboard and a department report. The live dashboard states that it is the “native reporting workspace” and that other original Build 052 workflows remain disabled pending migration. The current page's DOM does not contain the branch's `Retry loading weeks` marker. This confirms that protected application pages can be inspected, but it still does not prove that Netlify serves commit `57a8403`.

The supplied Build 050(2) and Build 050(3) files have the same SHA-256. The screenshots in this conversation include the Build 050 presenter with all nine baseline departments, Safety Moment first, full-screen and exit controls; the Action Log; Reporting Weeks; and the home loading/readiness panel. They also show reported connected-build defects: missing presenter department tabs, oversized grey Action Log controls, and loading that does not complete for live rail weeks.

## Page-by-page parity matrix

| Page / state | Build 050 baseline | Connected branch source | Finding and evidence | Severity / Phase 1 status |
|---|---|---|---|---|
| Sign-in | RSSI branded sign-in, email/password, show-password control and submit. Build 050 also contains a local test-account selector. | Connected sign-in uses the staging identity service and removes the test-account selector. A secure workspace loading overlay is present. | Secure sign-in succeeded. Removing local test accounts is an intentional security difference. | Medium — authenticated |
| Workspace loading | Loading should be a brief transition while identity and report data load. | `enterConnected()` shows the loader while identity is verified; report views include their own loading/error states. | Sign-in completed and displayed the dashboard. Department report visibly showed “Loading reports…” before data appeared on the next accessibility snapshot. This transient loading state is visible; its duration and stability need a timed repeat. | Medium — transient load observed; timing not benchmarked |
| Meeting home / readiness | Blue RSSI hero, orange launch button, selected/current rail week, submission counts and open-action count; navigation to host areas. | The actual live dashboard is a text header, Sign out and 11 department cards. It has no visible Presenter Mode launch, host navigation, Action Log, Reporting Weeks or Settings controls. A banner says other original Build 052 workflows remain disabled pending migration. | Live signed-in dashboard differs materially from the Build 050 host home. The branch source includes a host dashboard, but the Netlify-served screen does not expose it. | Critical — live parity failure |
| Presenter Mode — entry | Launch opens directly on Safety Moment. The Build 050 header has the RSS mark, week label, All departments, Full screen and Exit. Safety Moment is the selected first tab. | Branch source contains a connected Presenter Mode, but it is not available from the live signed-in dashboard. | No launch control is visible in the authenticated deployed app. Safety Moment, All departments, Full screen and Exit are therefore unavailable from the inspected route. This is stronger evidence than the source-only concern about waiting on readiness data. | Critical — live feature absent from dashboard |
| Presenter — department tabs | Safety Moment, Finance & Commercial and the nine Build 050 departments: Managed Environments, Civils, Rail Operations, S&T, TWS, Welding, MMA, HS2 and Montel. Rounded pill buttons wrap onto another line as needed. | The live dashboard displays 11 department cards, adding HSQE and Bids/RFQs, and uses several expanded/different labels. | All 11 departments are visible in the department chooser, but they are not presenter tabs: the presenter route is absent. Labels include Signalling, Civils & Construction, Midland Metro and Track Warning Systems instead of Build 050's S&T, Civils, MMA and TWS. | High — chooser count passes; presenter parity fails |
| Presenter — Safety Moment | Category selector, Generate, Write, Save for this meeting, Create action; orange/white rounded controls; empty-state notice; discussion content when prepared. | Controls exist in branch source only; none are available from the live dashboard. | Safety Moment cannot be reached from the inspected live app. Source save remains browser-local; AI depends on provider configuration. | Critical — live feature absent; persistence gap confirmed |
| Presenter — finance and departments | Finance tab and department slides show the selected week’s report/finance content; previous/next department navigation; All departments overview. | Read-only published-finance view and department overview/slide rendering are present in branch source. | Presenter route is not available in the deployed interface; no live presenter department/finance data can be reached. Preserve the rule that staged imports are not shown as published finance. | Critical — live page absent |
| Presenter — full screen / exit | Full screen enters browser full-screen presentation; Exit leaves Presenter Mode; keyboard Escape/arrow navigation is available in the older presentation flow. | Full-screen control and `:fullscreen` styling exist in source. | No presenter shell or full-screen control is available in the deployed interface, so browser behavior could not be tested. | Critical — live controls absent |
| Department report | Six stages: Pipeline, Delivery, Programme, Risks, Resources, Review & submit. Form items support owner/support and required-by dates; add/remove opportunities, action/support, draft, preview, submit, reopen and absence controls. | Live department report has week selector, Refresh, finance panels, action refresh, Pipeline/Delivery/Programme/Risks/Resources tabs and a section editor. | Authenticated route initially showed “Loading reports…”, then populated on its own at the next state check. Report status is submitted and section save/submit controls are disabled. Only five section tabs are rendered; Review & submit is not a tab. The report includes finance import/reconciliation panels before the report form. | Critical — transient blank/load observed; page layout and workflow differ |
| Action Log | Department-specific register; filters; refresh; export CSV; print; edit/status/complete controls where permitted. Compact white/outlined controls consistent with other pages. | No Action Log navigation or register is visible from the live signed-in dashboard or report route. The report has a “Departmental meeting actions” panel with Refresh actions only; it states only hosts can create/update. | The host Action Log functionality and its filters/export/print cannot be reached in the deployed interface. The user's screenshot also shows oversized grey controls, consistent with current connected button styling. | Critical — page unavailable; visual defect observed |
| Reporting Weeks | Rail weeks listed newest first, week label/date range, department selector, report count, View and Add next week. Calendar controls/settings restricted to host. | The live department report has only a week selector. It offered Week 31 and Week 32. No Reporting Weeks page/list, report counts, View or Add next week control is exposed from the dashboard. | The screenshot-reported “Loading live reporting weeks…” state is not reachable from current dashboard; route is absent. The live report's two-option week selector loaded. Branch source retry UI is not proof of live deployment. | Critical — required page unavailable; selector only partially available |
| Finance & Commercial | Excel financial workbook flow: upload workbook, review figures, stage validated figures, approval/publication step. Import reconciliation history and department allocation; two-week source lag; missing values must not become zero. | Live department report exposes “Finance import reconciliation and staging” with Choose File, “Validate finance CSV”, disabled “Stage validated import”, an import register and published finance panel. No standalone Finance page/navigation is visible. | This directly confirms the deployed finance flow is CSV-based, not the Build 050 Excel workbook workflow. No file was selected or uploaded. Finance source week is shown two weeks behind management week, and publication remains disabled. | Critical — live functionality and layout fail parity; import not tested |
| Settings / rail calendar | Settings area; host-only rail calendar update, template download/upload/preview/activation, backup and restore utilities. Testing-only delete controls must not be exposed in the connected operational build. | No Settings control is visible on the live signed-in dashboard or department report. | Cannot inspect settings/calendar workflow in the deployed app. Source-only presence is not a live feature pass. | Critical — page unavailable |
| Report Absence | Modal with manager name, department, reason, privacy notice, Cancel and Prepare notification email. Email is a draft for review; no automatic send. | No absence control is visible in the signed-in dashboard or report route. | Cannot inspect the live absence modal or prepare-notification flow. | High — page unavailable |
| Dialogs and supporting actions | Action create/edit, opportunity support, report delete confirmation, spell check, AI review, safety edit and safety action creation; print/export outputs. | Corresponding dialogs and handlers exist in the connected source. AI review is consent-based and authenticated. Exports and print routes are present. | A source handler is not an acceptance result. Every dialog validation, cancel path, persistence result and generated file needs runtime test. AI provider is not confirmed live. | High — inventory found; runtime blocked |

## Control inventory for Phase 2 verification

| Area | Controls/actions found in Build 050 or connected screen | Required verification |
|---|---|---|
| Sign-in | Email, password, show/hide password, sign in, sign out; local test-user picker in Build 050 only | Invalid credentials, session restore/expiry, sign out, role landing, loader timing; do not restore test account access in connected staging |
| Host home | Week select, presenter launch, overview/action/week/settings navigation, readiness counts | Correct selected week and counts; immediate presenter launch; navigation does not route to Department Report unexpectedly |
| Presenter | Safety, Finance and department tabs; All departments; Full screen; Exit; previous/next; category selector; Generate; Write; Save; Create action | All eleven authorized departments visible to host; no unauthorized data; opens on usable Safety Moment; full-screen enter/exit; tab, keyboard and wrap behavior |
| Department report | Six section tabs/step buttons; fields; pipeline add/remove; action creation; support request; draft save; preview; submit; reopen; absence; spell check; AI review | Correct department/week on first click; no blank flash; field validation; persistence after refresh/sign-out; submit without finance; role-specific edit/submit restrictions |
| Action Log | Department and status selectors; refresh; export; print; row status; edit/save; mark complete; close/cancel | Correct scope/carry-forward/history; controls match shared size/radius/type scale; downloaded CSV/PDF content; writes persist and enforce role rules |
| Reporting Weeks | Week and department selectors; Add next week; View; retry; calendar template download/upload; preview; activate; backup/restore | Request success/failure/timeout, retry recovery, no indefinite loading, correct calendar rows and report counts, duplicate prevention, host-only access |
| Finance | Week select; file picker/drop; workbook review; stage validated figures; refresh import register; reconciliation history; allocation; finance source label | Real approved `.xlsx` parsing and validation; preview totals and missing-value behavior; atomic staging/reconciliation; correct two-week source week; no department submission dependency; publication stays disabled |
| Absence / supporting dialogs | Report absence; name/department/reason; cancel; prepare email; action/support forms; AI consent and review; spell corrections; delete confirmation | Validation, cancellation, safe draft generation, no unintended email, correct permission checks, accurate persistence, accessible keyboard focus |

## Consolidated findings and priorities

1. **P0 — Live build is functionally incomplete against Build 050.** After secure sign-in, the dashboard exposed 11 department cards but no Presenter Mode, Action Log, Reporting Weeks or Settings navigation. It explicitly says the other workflows remain disabled pending migration. The live page does not contain the branch's `Retry loading weeks` marker, so the Netlify deployment still cannot be identified as commit `57a8403`.
2. **P0 — Finance upload is the older CSV flow.** The authenticated report screen has “Validate finance CSV”, a disabled CSV staging button and import register; it does not present Build 050's Excel workbook upload, figure review and staging steps. No upload was made.
3. **P1 — Department report has a loading flash and parity gap.** The screen first shows “Loading reports…” and fills in shortly afterward. The loaded view has five tabs rather than Build 050's six-step path and places finance staging panels above the report editor.
4. **P1 — Presenter source still delays the Safety Moment.** Branch source selects Safety Moment but awaits the full readiness load before rendering. The live page lacks the presenter route entirely, so this source path remains unverified.
5. **P1 — Department chooser works, presenter tabs do not.** All 11 configured departments appear in the chooser, but these are not presenter tabs. Some labels differ from Build 050's short labels and need an explicit approved mapping.
6. **P1 — Grey controls are visibly oversized.** The live department screen has large grey Refresh / finance buttons, while the reference uses compact, consistent controls. The host Action Log itself is not reachable, and exact dimensions still need same-viewport comparison.
7. **P1 — Safety Moment and host workflows are inaccessible live.** Safety, Action Log, Reporting Weeks and host settings are absent from the signed-in navigation. Source-only handlers are not acceptance evidence.
8. **P1 — Finance workbook operation still needs an authorised `.xlsx` test after the correct flow is deployed.** Preserve the two-week lag, missing-value rules, atomic staging and disabled publication.

## Visual no-drift comparison inputs

- Fixed source hash above; preserve this exact Build 050 artifact.
- Keep the user-provided Build 050 screenshots as individual references, not recreated approximations.
- Capture reference and deployed preview at the same viewport size, browser zoom and signed-in role.
- Compare logo asset/rendering, top bar and content bounds, selected-tab state, heading hierarchy, font sizes, text wrapping, button height/radius/padding, colour, icons, focus/disabled styles and empty/loading/error states.
- Record any difference required by connected data/security separately; it must not silently alter visual hierarchy or workflow.
- Require a screenshot and actual interaction result for every control group in the inventory before acceptance.

## Phase 1 conclusion

**Phase 1 source and authenticated visible-state audit is complete. Phase 2 should not be described as acceptance or visual matching.** The live app was inspected after secure sign-in, and a read-only department navigation was tested. The deployed page visibly differs from Build 050 and omits the host workflows. No report was saved, submitted, deleted, or changed; no finance file was uploaded. Netlify's deployed commit is still unverified. The findings above define the correction and retest work for Phase 2.

## Phase 2 — source corrections and verification

The following corrections address findings that could be fixed safely in the connected branch without changing database data or weakening access controls:

- Presenter Mode now renders directly on Safety Moment while host readiness loads in the background. Department labels map to the Build 050 labels (Civils, S&T, TWS and MMA), and the presenter tab list is reset from the current authorised identity each time.
- Authenticated preview retesting caught a stale click-handler binding that still opened the All departments overview. The launch control now calls the current Presenter Mode handler so the Safety Moment default is applied; a regression check covers the binding.
- Finance navigation now opens the Finance workspace directly, loads the available reporting weeks, selects the current open week, then loads published figures and the import register. It no longer opens a department report first. The file picker accepts `.xlsx` workbooks only.
- Host Action Log buttons use the shared compact 36 px control height and Build 050 rounded white/orange treatments.
- Regression checks cover these route, loading, label, upload and control-size requirements.

**Verification:** `npm test` passed 39/39 tests; Stage 26C4 reporting checks passed; `git diff --check` passed. These checks validate source and backend contracts. The authenticated PR-preview retest additionally confirmed the Safety Moment launch state and Finance's direct route. No approved finance workbook was available for an end-to-end import, and no staging report was changed.

### Authenticated preview retest

| Area | Deployed observation | Result |
|---|---|---|
| Department chooser | 11 authorised departments displayed. | Pass |
| Meeting overview | Readiness initially showed a loading state, then populated NRW Weeks 31 and 32, with 1 submitted and 10 awaiting. | Pass after transient loading |
| Presenter launch | Launch now opens directly on Safety Moment. All 11 tabs appear, including Build 050 short labels Civils, S&T, MMA and TWS. | Pass |
| Presenter fullscreen | The control was clicked, but this cloud browser reports “Full screen unavailable”; its page context exposes no Fullscreen API. Exit works. | Unverified in a standard user browser |
| Finance route | One click opens the Finance page directly; it does not show Department report first. The page presents the Excel financial workbook flow, and Weeks 31 and 32 load. | Pass for navigation and visible workflow |
| Finance upload | No approved workbook was selected. | Not tested end to end |
| Host Action Log | Register loads the empty state. Refresh, Export CSV and Print register buttons measure 36 px high, 13 px type and 8 px radius. | Pass for visible route and sizing; exports not exercised |
| Reporting Weeks | Live week data populates. The connected page shows week rows, but not Build 050's report-count column, department selector or Add next week action. | Partial; functional parity remains open |
| Settings | Connected host screen currently exposes account, role and department details; Build 050 calendar management controls are not represented in this view. | Gap remains open |

GitHub accepted the code, regression tests and audit through its connected repository integration. The PR preview's served HTML contains the Phase 2 source markers, and its runtime showed the fixed Safety Moment launch and direct Finance route. GitHub reports no status checks for the latest commit, so an exact Netlify-to-commit SHA match is not independently confirmed.

**Phase 2 status: targeted corrections deployed and observed; complete acceptance remains open.** Remaining work includes verifying native fullscreen in a standard browser, restoring the missing Reporting Weeks controls and host calendar settings, testing all remaining dialogs and workflows, and running a real approved `.xlsx` through finance review/staging without enabling publication. Do not call the product a visual match until those checks pass against the same Build 050 viewports.


## Phase 2 follow-up — source fixes and open verification

The following corrections were made after the authenticated preview retest:

- Connected Reporting Weeks now uses the Build 050 table hierarchy, a department selector, a report-started count, View actions, and a host-only Add next week action. The create operation selects only the next chronological period already in the shared rail calendar and sends the signed-in caller token; it does not create a local-only week.
- Connected Settings now shows the loaded rail-calendar range and provides Download calendar CSV, Refresh calendar data, and Add next week controls. Shared calendar upload, activation, backup and rollback are still not available because this branch has no shared calendar-version endpoint.
- Presenter full-screen now falls back to a full-window presentation layout when the browser does not expose the Fullscreen API. Standard-browser native fullscreen remains to be verified.
- The finance workbook path now carries the complete rail-calendar list and department register into Finance, resolves the intentional two-week source period, presents the validated department figures before staging, preserves blank values as missing, and requires an acknowledgement when workbook checks produce warnings.
- Finance SQL source scripts accept `.xlsx` filenames for the atomic staging RPC. The staging database function and deployment gate have not been updated or exercised in this session.

The supplied test workbook was inspected read-only. It contains 11 worksheets and maps to the nine finance departments. For the Finance source period selected by a Week 31 management report (Week 29), the weekly revenue cells are blank for all nine departments; those remain “Not reported” in the import representation. The workbook's YTD total formula excludes the Montel row, so review must show that warning and require acknowledgement. No figures were published or written to staging.

`npm test` passes 44/44 tests; `node --check netlify/functions/acceptance.mjs`, Stage 26C4 checks and `git diff --check` pass. These are source-level checks. The preview is at the sign-in screen, and this session does not expose the secure sign-in/file-upload handoff or Supabase project access. The workbook was not uploaded. The latest GitHub commit has zero status checks; Netlify's exact deployed SHA remains unconfirmed.

**Acceptance remains open.** Required next evidence: deploy the updated branch to its Netlify preview; apply the reviewed `.xlsx` RPC filename change and confirm the staging write gate; authenticate using the secure app sign-in flow; review the workbook and verify the import register without approval/publication; and compare every reference screen at matching viewport/zoom.
