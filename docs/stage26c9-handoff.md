# Stage 26C9 — Published finance read-only integration

- Verified staging finance tables exist and all four contain zero rows at inspection.
- Added caller-JWT/RLS-scoped read-only API operation `finance_published`.
- Only `published` finance publications are displayed; no draft/import data exposed by this endpoint.
- Selected reporting week is mapped to the rail calendar; finance source period must be exactly two earlier chronological rail periods.
- Publication values with missing/invalid/mismatched source period are withheld, not converted to zero.
- Weekly gap to close calculated only if both weekly budget and revenue are valid.
- Departmental submission remains independent of finance uploads.
- No finance import, approval, publication creation, or live browser acceptance in this stage.
- No schema or database record changes.
