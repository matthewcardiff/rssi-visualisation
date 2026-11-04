# Stage 26C16 acceptance checklist

- [ ] Confirm finance table RLS policies exist and are appropriately scoped
- [ ] Confirm no finance data access for anonymous or ordinary departmental accounts beyond authorised published views
- [ ] Verify finance/admin can stage a complete import with a real authenticated JWT
- [ ] Verify non-finance account cannot stage or publish
- [ ] Verify failed row insert rolls back header and all rows
- [ ] Verify duplicate/concurrent imports fail without partial writes
- [ ] Verify two-rail-week source mapping including rail-year boundary
- [ ] Verify four distinct metrics per department and missing-vs-zero behaviour
- [ ] Verify reconciliation approval is restricted and audit event is written
- [ ] Verify published version supersedes prior version atomically
- [ ] Verify department submission without finance data
- [ ] Re-run security advisor and document results
