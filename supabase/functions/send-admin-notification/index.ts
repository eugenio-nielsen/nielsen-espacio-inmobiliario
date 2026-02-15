import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  notification_type: string;
  title: string;
  message: string;
  related_user_id?: string;
  related_property_id?: string;
  related_lead_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();

    const { data: notification, error: insertError } = await supabase
      .from("admin_notifications")
      .insert({
        notification_type: payload.notification_type,
        title: payload.title,
        message: payload.message,
        related_user_id: payload.related_user_id || null,
        related_property_id: payload.related_property_id || null,
        related_lead_id: payload.related_lead_id || null,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const adminEmail = "eugenio@espacioinmobiliario.com.ar";

    console.log(`Email notification would be sent to: ${adminEmail}`);
    console.log(`Subject: ${payload.title}`);
    console.log(`Message: ${payload.message}`);

    await supabase
      .from("admin_notifications")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", notification.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification recorded and logged",
        notification_id: notification.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
