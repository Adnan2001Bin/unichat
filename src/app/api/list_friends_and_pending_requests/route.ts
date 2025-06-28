import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await UserModel.findOne({ email: session.user.email })
      .populate("connections", "userName profilePicture university headline")
      .populate("pendingSentRequests", "userName profilePicture university headline")
      .populate("pendingReceivedRequests", "userName profilePicture university headline");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        connections: user.connections,
        pendingSentRequests: user.pendingSentRequests,
        pendingReceivedRequests: user.pendingReceivedRequests,
      },
    });
  } catch (error) {
    console.error("Error fetching friends data:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching friends data" },
      { status: 500 }
    );
  }
}