# Stage 26C18 security acceptance matrix

| Test | Expected result | Status |
|---|---|---|
| Anonymous direct finance SELECT/INSERT/UPDATE/DELETE | Denied | Not run |
| Contributor direct finance writes | Denied | Not run |
| Finance direct finance writes | Denied (RPC only) | Not run |
| Administrator direct finance writes | Denied (RPC only) | Not run |
| Finance authorised RPC import | Atomic; one import, 4 metrics/dept | Not run |
| Concurrent same-hash imports | Exactly one succeeds | Not run |
| Malformed import | Zero rows committed | Not run |
| Non-finance RPC import or publish | Denied | Not run |
| Finance approval audit | Immutable approval event and approved source | Not run |
| Concurrent publications same week | Monotonic versions; one published | Not run |
| Finance period mapping | Exactly two rail periods earlier | Not run |
| Finance published SELECT | Only permitted organisation/departments | Not run |
| Security advisor re-run | No unexpected permissive policies | Not run |

No live changes or acceptance tests are claimed.
