const json = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
});

const projectUrl = Deno.env.get("SUPABASE_URL") || "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const validUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return json(405, { error: "POST required" });
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(projectUrl) || !anonKey || !serviceKey) return json(503, { error: "Account-management service is not configured" });
  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (accessToken.length < 30 || accessToken.length > 5000) return json(401, { error: "Sign in again to manage users" });

  const userResponse = await fetch(`${projectUrl}/auth/v1/user`, { headers: { apikey: anonKey, authorization }, signal: AbortSignal.timeout(12000) });
  if (!userResponse.ok) return json(401, { error: "Your session has expired. Sign in again." });
  const actor = await userResponse.json();
  const adminHeaders = { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, "content-type": "application/json" };
  const actorProfileResponse = await fetch(`${projectUrl}/rest/v1/profiles?select=active&id=eq.${encodeURIComponent(actor.id)}`, { headers: adminHeaders, signal: AbortSignal.timeout(12000) });
  const actorRolesResponse = await fetch(`${projectUrl}/rest/v1/user_roles?select=role,organisation_id&user_id=eq.${encodeURIComponent(actor.id)}&role=eq.administrator`, { headers: adminHeaders, signal: AbortSignal.timeout(12000) });
  if (!actorProfileResponse.ok || !actorRolesResponse.ok) return json(503, { error: "Administrator access could not be verified" });
  const actorProfiles = await actorProfileResponse.json();
  const actorRoles = await actorRolesResponse.json();
  if (!actorProfiles.some((profile: { active: boolean }) => profile.active) || !actorRoles.length) return json(403, { error: "Administrator access required" });
  const organisationId = actorRoles[0].organisation_id as string;

  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
  const op = input.op;
  const rest = async (path: string, method = "GET", body?: unknown) => {
    const response = await fetch(`${projectUrl}/rest/v1/${path}`, {
      method,
      headers: { ...adminHeaders, prefer: "return=representation,resolution=merge-duplicates" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => []);
    if (!response.ok) throw new Error(`Database request failed (${response.status})`);
    return data;
  };
  const authAdmin = async (path: string, method = "GET", body?: unknown) => {
    const response = await fetch(`${projectUrl}/auth/v1/admin/${path}`, {
      method,
      headers: adminHeaders,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(String(data.msg || data.message || data.error_description || data.error || `Auth request failed (${response.status})`));
    return data;
  };
  const authPublic = async (path: string, body: unknown) => {
    const response = await fetch(`${projectUrl}/auth/v1/${path}`, {
      method: "POST",
      headers: { apikey: anonKey, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(String(data.msg || data.message || data.error_description || data.error || `Auth request failed (${response.status})`));
    return data;
  };

  try {
    if (op === "list") {
      const pages = await Promise.all(Array.from({ length: 10 }, (_, index) => authAdmin(`users?page=${index + 1}&per_page=100`)));
      const users = pages.flatMap((page) => page.users || []).filter((user) => user.id);
      const [profiles, roles, memberships, departments] = await Promise.all([
        rest("profiles?select=id,display_name,active&limit=2000"),
        rest("user_roles?select=user_id,role,organisation_id&organisation_id=eq." + encodeURIComponent(organisationId) + "&limit=4000"),
        rest("department_memberships?select=user_id,department_id,membership_role,active&limit=4000"),
        rest("departments?select=id,display_name,active&organisation_id=eq." + encodeURIComponent(organisationId) + "&active=eq.true&order=display_name.asc"),
      ]);
      const profileById = new Map(profiles.map((profile: { id: string }) => [profile.id, profile]));
      const roleById = new Map<string, string[]>();
      for (const row of roles) roleById.set(row.user_id, [...(roleById.get(row.user_id) || []), row.role]);
      const deptById = new Map(departments.map((department: { id: string; display_name: string }) => [department.id, department.display_name]));
      const membershipById = new Map<string, string[]>();
      for (const row of memberships) if (row.active) membershipById.set(row.user_id, [...(membershipById.get(row.user_id) || []), deptById.get(row.department_id) || ""]);
      return json(200, { users: users.map((user) => {
        const profile = profileById.get(user.id) || {};
        return { id: user.id, email: user.email || "", confirmed: !!user.email_confirmed_at, last_sign_in_at: user.last_sign_in_at || null,
          display_name: profile.display_name || user.user_metadata?.display_name || "", active: profile.active === true,
          roles: roleById.get(user.id) || [], departments: (membershipById.get(user.id) || []).filter(Boolean) };
      }).sort((a, b) => a.email.localeCompare(b.email)), departments });
    }
    if (op === "departments") {
      const departments = await rest("departments?select=id,display_name,active&organisation_id=eq." + encodeURIComponent(organisationId) + "&active=eq.true&order=display_name.asc");
      return json(200, { departments });
    }
    if (op === "invite") {
      const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
      const displayName = typeof input.display_name === "string" ? input.display_name.trim() : "";
      const role = input.role;
      const departmentIds = Array.isArray(input.department_ids) ? [...new Set(input.department_ids)] : [];
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !displayName || displayName.length > 120) return json(400, { error: "Enter a valid work email and display name" });
      if (!(["administrator", "executive", "meeting_host", "finance", "department_manager", "department_contributor"] as unknown[]).includes(role)) return json(400, { error: "Choose a valid access role" });
      if ((role === "department_manager" || role === "department_contributor") && !departmentIds.length) return json(400, { error: "Select at least one department for a department user" });
      if (departmentIds.some((id) => !validUuid(id))) return json(400, { error: "Invalid department selection" });
      const departments = await rest("departments?select=id,organisation_id&organisation_id=eq." + encodeURIComponent(organisationId) + "&active=eq.true&limit=100");
      const allowedDepartments = new Set(departments.map((department: { id: string }) => department.id));
      if (departmentIds.some((id) => !allowedDepartments.has(id))) return json(400, { error: "One or more selected departments are not available" });
      const existingUsers = await authAdmin(`users?page=1&per_page=1000`);
      if ((existingUsers.users || []).some((user: { email?: string }) => user.email?.toLowerCase() === email)) return json(409, { error: "An account with that email already exists. Use the reset or resend setup action in the user list." });
      const redirectTo = new URL("/reset-password.html", request.headers.get("origin") || "https://rssi-visualisation.netlify.app").toString();
      const invited = await fetch(`${projectUrl}/auth/v1/invite?redirect_to=${encodeURIComponent(redirectTo)}`, {
        method: "POST", headers: adminHeaders, body: JSON.stringify({ email, data: { display_name: displayName } }), signal: AbortSignal.timeout(15000),
      });
      const invitedUser = await invited.json().catch(() => ({}));
      if (!invited.ok || !invitedUser.id) return json(invited.status === 429 ? 429 : 409, { error: String(invitedUser.msg || invitedUser.message || invitedUser.error_description || "Invitation could not be sent") });
      const userId = invitedUser.id as string;
      try {
        await rest("profiles", "POST", { id: userId, display_name: displayName, active: true });
        const currentRoles = await rest("user_roles?select=id&user_id=eq." + encodeURIComponent(userId) + "&organisation_id=eq." + encodeURIComponent(organisationId) + "&role=eq." + encodeURIComponent(String(role)));
        if (!currentRoles.length) await rest("user_roles", "POST", { user_id: userId, organisation_id: organisationId, role });
        for (const departmentId of departmentIds) await rest("department_memberships?on_conflict=user_id,department_id", "POST", { user_id: userId, department_id: departmentId, membership_role: role === "department_manager" ? "manager" : "contributor", active: true });
      } catch (error) {
        await authAdmin(`users/${encodeURIComponent(userId)}`, "DELETE").catch(() => null);
        return json(500, { error: "The invitation was rolled back because its reporting permissions could not be saved. Check the department setup and try again." });
      }
      return json(200, { invited: true, email });
    }
    if (op === "resend_setup" || op === "reset") {
      const userId = input.user_id;
      if (!validUuid(userId)) return json(400, { error: "Select a valid user" });
      const target = await authAdmin(`users/${encodeURIComponent(userId)}`);
      if (!target.email) return json(404, { error: "User email was not found" });
      const redirectTo = new URL("/reset-password.html", request.headers.get("origin") || "https://rssi-visualisation.netlify.app").toString();
      if (op === "resend_setup" && !target.email_confirmed_at) {
        await authPublic(`resend?redirect_to=${encodeURIComponent(redirectTo)}`, { type: "signup", email: target.email });
        return json(200, { sent: true, message: "A fresh account verification link has been sent." });
      }
      await authPublic(`recover?redirect_to=${encodeURIComponent(redirectTo)}`, { email: target.email });
      return json(200, { sent: true, message: "Password setup instructions have been sent." });
    }
    if (op === "deactivate" || op === "reactivate") {
      const userId = input.user_id;
      if (!validUuid(userId)) return json(400, { error: "Select a valid user" });
      if (userId === actor.id && op === "deactivate") return json(409, { error: "You cannot deactivate your own administrator account" });
      const targetRoles = await rest("user_roles?select=role&user_id=eq." + encodeURIComponent(userId) + "&organisation_id=eq." + encodeURIComponent(organisationId));
      if (!targetRoles.length) return json(404, { error: "User access was not found" });
      if (op === "deactivate" && targetRoles.some((row: { role: string }) => row.role === "administrator")) {
        const admins = await rest("user_roles?select=user_id&organisation_id=eq." + encodeURIComponent(organisationId) + "&role=eq.administrator");
        const profiles = await rest("profiles?select=id,active&id=in." + encodeURIComponent(`(${admins.map((row: { user_id: string }) => row.user_id).join(",")})`));
        if (profiles.filter((profile: { active: boolean }) => profile.active).length <= 1) return json(409, { error: "The last active administrator cannot be deactivated" });
      }
      await authAdmin(`users/${encodeURIComponent(userId)}`, "PUT", { ban_duration: op === "deactivate" ? "876000h" : "none" });
      await rest("profiles?id=eq." + encodeURIComponent(userId), "PATCH", { active: op === "reactivate" });
      return json(200, { active: op === "reactivate" });
    }
    return json(400, { error: "Unsupported user-management action" });
  } catch (error) {
    console.error("vh-user-admin operation failed", error);
    return json(502, { error: error instanceof Error ? error.message : "User-management request failed" });
  }
});
