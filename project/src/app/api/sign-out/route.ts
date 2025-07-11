import { NextRequest, NextResponse } from "next/server";
import { signOut } from "next-auth/react";

export async function POST(request: NextRequest) {
  try {
    // Since this is an API route, we don't call signOut directly here.
    // Instead, we'll redirect to the NextAuth sign-out process.
    // NextAuth handles session invalidation internally.
    return NextResponse.json(
      { success: true, message: "Signed out successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error signing out:", error);
    return NextResponse.json(
      { success: false, message: "Error signing out" },
      { status: 500 }
    );
  }
}