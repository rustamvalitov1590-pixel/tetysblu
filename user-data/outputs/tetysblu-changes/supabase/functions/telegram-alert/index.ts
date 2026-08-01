// supabase/functions/telegram-alert/index.ts
//
// Принимает данные о продаже и сам формирует и отправляет сообщение в Telegram.
// Токен бота и chat_id хранятся как секреты Supabase (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID),
// а не в клиентском JS. Сообщение формируется на сервере, чтобы клиент не мог
// отправить в бота произвольный текст.
//
// Деплой:
//   supabase functions deploy telegram-alert --no-verify-jwt
// Секреты:
//   supabase secrets set TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=xxx

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertPayload {
  // "big_sale" — используется в index.html (панель кассира), это тип по умолчанию.
  // "new_request" — используется в client.html (заявка от клиента с сайта).
  type?: "big_sale" | "new_request";

  // Поля для big_sale
  totalSum?: number;
  visitDate?: string;
  guestsCount?: number;
  isAgent?: boolean;
  promocode?: string;
  comment?: string;
  cashier?: string;

  // Поля для new_request
  formattedDate?: string;
  tariffText?: string;
  phone?: string;
  detailsText?: string;
}

// Telegram Markdown требует экранирования спецсимволов в произвольном тексте,
// иначе сообщение с непарными _*`[ может не отправиться.
function escapeMarkdown(text: string): string {
  return text.replace(/([_*`\[])/g, "\\$1");
}

function buildBigSaleMessage(p: AlertPayload): string {
  const dateStr = new Date().toLocaleString("ru-RU");
  let message = `💰 *КРУПНАЯ ПРОДАЖА!*\n\n`;
  message += `*Сумма:* ${(p.totalSum ?? 0).toLocaleString("ru-RU")} ₸\n`;
  message += `*Дата визита:* ${p.visitDate ?? "-"}\n`;
  message += `*Гостей:* ${p.guestsCount ?? 0}\n`;
  message += `*Турагент:* ${p.isAgent ? "Да" : "Нет"}\n`;
  if (p.promocode) message += `*Промокод:* ${escapeMarkdown(p.promocode)}\n`;
  if (p.comment) message += `*Комментарий:* ${escapeMarkdown(p.comment)}\n`;
  message += `\n*Кассир:* ${p.cashier ?? "unknown"}\n`;
  message += `*Создано:* ${dateStr}`;
  return message;
}

function buildNewRequestMessage(p: AlertPayload): string {
  let message = `🆕 *Новая заявка с сайта*\n\n`;
  message += `📅 Дата визита: ${p.formattedDate ?? "-"}\n`;
  message += `🎫 Тариф: ${p.tariffText ?? "-"}\n`;
  message += `👥 Гостей: ${p.guestsCount ?? 0}\n`;
  message += `📞 Телефон: ${p.phone ?? "-"}\n`;
  message += `💰 Сумма: *${(p.totalSum ?? 0).toLocaleString("ru-RU")} ₸*\n\n`;
  if (p.detailsText) message += `📋 *Детали:*\n\`${p.detailsText}\``;
  return message;
}

function buildMessage(p: AlertPayload): string {
  return p.type === "new_request" ? buildNewRequestMessage(p) : buildBigSaleMessage(p);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    return new Response(JSON.stringify({ ok: false, error: "not_configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: AlertPayload = await req.json();
    const message = buildMessage(payload);

    const tgResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await tgResp.json();
    return new Response(JSON.stringify({ ok: tgResp.ok, telegram: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
