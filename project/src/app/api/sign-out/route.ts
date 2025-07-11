import { NextResponse } from "next/server";

export async function POST() {
  try {
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
