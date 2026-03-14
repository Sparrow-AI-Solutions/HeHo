import { NextRequest, NextResponse } from "next/server";
import { supabaseOAuthConfig } from "@/lib/supabase/config";
import { createClient as createSupabaseAdminClient } from '@/lib/supabase/admin';

async function getOrganizationId(accessToken: string): Promise<string | null> {
  const orgsResponse = await fetch("https://api.supabase.com/v1/organizations", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!orgsResponse.ok) {
    console.error("Failed to fetch organizations");
    return null;
  }
  const orgs = await orgsResponse.json();
  return orgs.length > 0 ? orgs[0].id : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("userId");

  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  try {
    // Handle OAuth callback for reconnect
    if (code && userId) {
      const redirectUri = `${new URL(req.url).origin}/app/settings/reconnect-supabase`;
      const requestBody = {
        grant_type: "authorization_code",
        client_id: supabaseOAuthConfig.clientId,
        client_secret: supabaseOAuthConfig.clientSecret,
        code: code,
        redirect_uri: redirectUri,
      };

      const tokenResponse = await fetch("https://api.supabase.com/v1/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(requestBody).toString(),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        const errorDescription = tokenData.error_description || `Supabase API error: ${JSON.stringify(tokenData)}`;
        console.error("Error fetching token:", errorDescription);
        return NextResponse.json({ error: `Failed to fetch Supabase token. ${errorDescription}` }, { status: 400 });
      }

      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;

      // Get organization ID
      let organizationId = await getOrganizationId(accessToken);

      // Save tokens to the user's record
      const supabaseAdmin = createSupabaseAdminClient();
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          provider_token: accessToken,
          refresh_token: refreshToken,
          organization_id: organizationId
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Error saving tokens:", updateError);
        return NextResponse.json({ error: `Failed to save OAuth tokens: ${updateError.message}` }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Supabase account connected successfully',
        provider_token: accessToken,
        refresh_token: refreshToken,
        organization_id: organizationId,
      });

    } else {
      return NextResponse.json({ error: "Missing code or userId parameter" }, { status: 400 });
    }

  } catch (error) {
    console.error("Internal Server Error in GET /api/supabase-reconnect:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
