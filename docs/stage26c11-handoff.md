# Stage 26C11 - Controlled staging finance import

- Finance CSV must pass server-side reconciliation and explicitly confirmed staging action.
- Import accepts exactly one management reporting week and checks duplicate canonical dataset hashes.
- Uses the caller JWT and existing RLS for finance_imports and finance_metric_values; no service-role bypass.
- Writes import metadata with pending reconciliation, then four metrics per department. Failed metric writes mark the import failed where RLS permits. A partial-write failure requires manual review and must never be treated as published.
- No approval, publication, or finance metric display from staged records. Published finance feed remains separate.
- Browser/role acceptance and database write permissions remain unverified. Do not use operationally before full testing.
