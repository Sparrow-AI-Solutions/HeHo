'use server'

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { createClient as createUserSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const userSupabase = createUserSupabaseClient(userData.supabase_url!, userData.supabase_key_encrypted!);

    // Check if the bucket exists by attempting to list from it.
    const { error: listError } = await userSupabase.storage.from(bucketName).list(undefined, { limit: 0 });

    if (listError && listError.message.includes("Bucket not found")) {
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
