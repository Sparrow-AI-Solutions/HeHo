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

    const { bucketName, storageColumns } = await req.json();

    if (!bucketName) {
      return NextResponse.json({ error: "Bucket name is required" }, { status: 400 });
    }

    if (storageColumns && (!Array.isArray(storageColumns) || storageColumns.some(col => typeof col !== 'string'))) {
        return NextResponse.json({ error: "storageColumns must be an array of strings." }, { status: 400 });
    }

    const { data: userData, error: userError } = await adminSupabase
      .from("users")
      .select("supabase_url, supabase_key_encrypted")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "Could not retrieve user credentials" }, { status: 500 });
    }

    const userSupabase = createUserSupabaseClient(userData.supabase_url!, userData.supabase_key_encrypted!);

    const { error: listError } = await userSupabase.storage.from(bucketName).list(undefined, { limit: 0 });

    if (listError && listError.message.includes("Bucket not found")) {
        return NextResponse.json({ error: `Bucket '${bucketName}' does not exist or you don\'t have permission to access it.` }, { status: 404 });
    }

    const updatePayload: {
        storage_bucket: string;
        storage_columns?: string[];
    } = {
        storage_bucket: bucketName
    };

    if (storageColumns) {
        updatePayload.storage_columns = storageColumns;
    }

    const { data: updatedUser, error: updateError } = await adminSupabase
      .from("users")
      .update(updatePayload)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user storage settings:", updateError);
      return NextResponse.json({ error: `Failed to save storage settings: ${updateError.message}` }, { status: 500 });
    }

    const message = storageColumns 
        ? "Storage bucket and columns connected successfully" 
        : "Storage bucket connected successfully";

    return NextResponse.json({ message, data: updatedUser });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Unexpected error in /api/database/connect-storage:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: updatedUser, error: updateError } = await adminSupabase
            .from("users")
            .update({ storage_bucket: null, storage_columns: null })
            .eq("id", user.id)
            .select()
            .single();

        if (updateError) {
            console.error("Error disconnecting storage bucket:", updateError);
            return NextResponse.json({ error: `Failed to disconnect storage: ${updateError.message}` }, { status: 500 });
        }

        return NextResponse.json({ message: "Storage bucket disconnected successfully", data: updatedUser });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Unexpected error in DELETE /api/database/connect-storage:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
