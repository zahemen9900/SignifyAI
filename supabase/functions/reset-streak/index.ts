// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

type ResetResponse = {
  updated: number;
  checkedAt: string;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Missing Supabase credentials", {
      status: 500,
      headers: corsHeaders
    });
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data, error } = await client
    .from("users")
    .update({ streak_count: 0 })
    .lt("last_active_at", cutoff)
    .gt("streak_count", 0)
    .select("id");

  if (error) {
    console.error("reset-streak: failed to reset streaks", error);
    return new Response(JSON.stringify({ message: "Failed to reset streaks" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const response: ResetResponse = {
    updated: data?.length ?? 0,
    checkedAt: new Date().toISOString()
  };

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
