// supabase/functions/verify-login/index.ts
//
// Проверяет логин/пароль кассира/админа НА СЕРВЕРЕ.
// Пароли хранятся как секреты Supabase (ADMIN_PASSWORD, MANAGER_PASSWORD),
// а не в клиентском JS, который лежит в публичном репозитории.
//
// Деплой:
//   supabase functions deploy verify-login --no-verify-jwt
// Секреты:
//   supabase secrets set ADMIN_PASSWORD=новый_пароль MANAGER_PASSWORD=новый_пароль

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const CREDENTIALS: Record<string, string | undefined> = {
  admin: Deno.env.get("ADMIN_PASSWORD"),
  manager: Deno.env.get("MANAGER_PASSWORD"),
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Очень простая защита от перебора: небольшая задержка на каждый запрос.
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  await sleep(300);

  try {
    const { login, pass } = await req.json();
    const normalizedLogin = String(login ?? "").trim().toLowerCase();
    const expected = CREDENTIALS[normalizedLogin];
    const ok = Boolean(expected) && expected === pass;

    return new Response(JSON.stringify({ ok, user: ok ? normalizedLogin : null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "bad_request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
