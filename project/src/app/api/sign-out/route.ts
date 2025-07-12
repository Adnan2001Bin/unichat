import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json(
      { success: true, message: "Signed out successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error signing out:", errorMessage);
    return NextResponse.json(
      { success: false, message: "Error signing out" },
      { status: 500 }
    );
  }
}