'use server'

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = authData.user;

    const { bucketName } = await req.json();

    if (!bucketName) {
      return NextResponse.json({ error: "Bucket name is required" }, { status: 400 });
    }

    // Get user's Supabase credentials from the database
    const { data: userData, error: userError } = await adminSupabase
      .from("users")
      .select("supabase_url, supabase_key_encrypted")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "Could not retrieve user credentials" }, { status: 500 });
    }

    // Create a new Supabase client with the user's credentials
    const userSupabase = createAdminClient(userData.supabase_url, userData.supabase_key_encrypted);

    // Check if the bucket exists
    const { data: bucketData, error: bucketError } = await userSupabase.storage.getBucket(bucketName);

    if (bucketError) {
      return NextResponse.json({ error: `Bucket '${bucketName}' does not exist or you don\'t have permission to access it.` }, { status: 404 });
    }

    // If the bucket exists, save it to the users table
    const { error: updateError } = await adminSupabase
      .from("users")
      .update({ storage_bucket: bucketName })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to save bucket name to user profile" }, { status: 500 });
    }

    return NextResponse.json({ message: "Storage bucket connected successfully" });

  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}
