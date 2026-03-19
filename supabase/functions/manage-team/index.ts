import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: corsHeaders });
    }

    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!caller) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: corsHeaders });
    }

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Apenas admins podem gerenciar equipe" }), { status: 403, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "POST" && action === "create") {
      const { email, password, display_name, permissions } = await req.json();

      // Create user with display_name in metadata
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: display_name || email },
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), { status: 400, headers: corsHeaders });
      }

      // Update the profile display_name if provided
      if (display_name && newUser.user) {
        await supabaseAdmin
          .from("profiles")
          .update({ display_name })
          .eq("user_id", newUser.user.id);
      }

      // Update permissions if provided
      if (permissions && newUser.user) {
        await supabaseAdmin
          .from("team_permissions")
          .update(permissions)
          .eq("user_id", newUser.user.id);
      }

      return new Response(JSON.stringify({ user: newUser.user }), { status: 200, headers: corsHeaders });
    }

    if (req.method === "GET" && action === "list") {
      // List all team members with their permissions
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const { data: permissions } = await supabaseAdmin.from("team_permissions").select("*");
      const { data: roles } = await supabaseAdmin.from("user_roles").select("*");
      const { data: profiles } = await supabaseAdmin.from("profiles").select("*");

      const team = users?.users?.map((u) => ({
        id: u.id,
        email: u.email,
        display_name: profiles?.find((p) => p.user_id === u.id)?.display_name || u.email,
        role: roles?.find((r) => r.user_id === u.id)?.role || "user",
        permissions: permissions?.find((p) => p.user_id === u.id) || null,
        created_at: u.created_at,
      })) || [];

      return new Response(JSON.stringify({ team }), { status: 200, headers: corsHeaders });
    }

    if (req.method === "PUT" && action === "update-permissions") {
      const { user_id, permissions } = await req.json();

      const { error } = await supabaseAdmin
        .from("team_permissions")
        .update(permissions)
        .eq("user_id", user_id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }

    if (req.method === "DELETE" && action === "remove") {
      const { user_id } = await req.json();
      console.log("Removing user:", user_id);

      // First, get all gmail IDs owned by this user
      const { data: userGmails } = await supabaseAdmin
        .from("gmails")
        .select("id")
        .eq("created_by", user_id);

      const gmailIds = userGmails?.map((g) => g.id) || [];

      // Delete acessos created by the user
      const r1 = await supabaseAdmin.from("acessos").delete().eq("created_by", user_id);
      console.log("Delete acessos by created_by:", r1.error?.message || "ok");

      // Delete acessos that reference this user's gmails (created by others)
      if (gmailIds.length > 0) {
        const r1b = await supabaseAdmin.from("acessos").delete().in("gmail_id", gmailIds);
        console.log("Delete acessos by gmail_id:", r1b.error?.message || "ok");
      }

      // Now delete gmails
      const r2 = await supabaseAdmin.from("gmails").delete().eq("created_by", user_id);
      console.log("Delete gmails:", r2.error?.message || "ok");

      const r3 = await supabaseAdmin.from("team_permissions").delete().eq("user_id", user_id);
      console.log("Delete team_permissions:", r3.error?.message || "ok");

      const r4 = await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      console.log("Delete user_roles:", r4.error?.message || "ok");

      const r5 = await supabaseAdmin.from("profiles").delete().eq("user_id", user_id);
      console.log("Delete profiles:", r5.error?.message || "ok");

      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) {
        console.log("Delete user error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      console.log("User removed successfully");
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
