# Visualisation Hub Build 051 cleanup

Removed the test-account panel, password autofill, demonstration account registry,
email-selected role routing inputs, callable demo-admin/report-deletion module,
temporary delete-all implementation and portable-copy generator. Removed the old
local-preview badge wording and obsolete interface notice. Retained Build 051,
branding, password visibility styling and the feature source needed for integration.

The application deliberately denies entry. No replacement authentication is claimed.
Deny-only identity hooks and disabled navigation must be replaced alongside Supabase
shared storage and database permissions, not treated as hosted security controls.
Browser storage and migration utilities remain implementation dependencies.
AI/reminder availability messages remain because those services are unconnected.

Validation: all executable scripts compile; removal-marker and isolated access-gate
checks pass. The original Build050 is unchanged. See verification.json for results.
A real browser could not run because Chromium is unavailable. Full feature regression,
Edge visual verification and authenticated multi-user tests remain outstanding.

No deployment, data deletion, live email or AI request was performed.
