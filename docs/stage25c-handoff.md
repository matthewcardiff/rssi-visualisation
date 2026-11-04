# Stage 25C: HSQE/Bids special department workflows

- HSQE department reporting provides five ordered structured sections saved as report_sections.content.fields JSON, with section keys hsqe_accidents, hsqe_close_calls, hsqe_assurance, hsqe_events, hsqe_documents.
- Bids/RFQs department reporting provides a link to https://rssi-bid-hub-staging2.netlify.app/#/tracker; no cross-app authentication or embedded tracker is implemented.
- Existing nine legacy departments plus HSQE and Bids/RFQs remain in Supabase; no schema migration was applied.
- Current HSQE audits/NCR fields are multiline registers; automatic week-to-week carry-forward of open records, sign-off history, and rolling 12-month aggregation are NOT implemented. They require persistent structured registers and dedicated acceptance testing before production.
- For HSQE users: assign department_memberships before editing; choose a specific department and an open reporting week.
- Submission locks HSQE weekly sections, matching existing reports. Pipeline remains independently editable.
- Verification: node --check on acceptance.js and acceptance.mjs; ZIP CRC test. Live authentication/permissions/persistence not tested.
