# Stage 26C8 - meeting-host action register and CSV export

Added a read-only action register to the authenticated department chooser for meeting hosts. Data is retrieved using the existing caller-JWT-protected `actions` endpoint; no new privileges or database changes. Filter by authorised department and status (outstanding, completed, cancelled, all). CSV export uses the current filtered view and quotes all fields, with spreadsheet formula injection mitigation. Print uses the browser print facility; print formatting and live browser behaviour require acceptance testing.

This is not the full Build 052 presenter mode: slide navigation, finance, presenter-specific login and visual parity remain outstanding.
