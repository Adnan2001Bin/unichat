import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const removeFriendSchema = z.object({
  friendId: z.string().min(1, "Friend ID is required"),
});

export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsedData = removeFriendSchema.parse(body);

    const currentUser = await UserModel.findOne({ email: session.user.email });
    const friend = await UserModel.findById(parsedData.friendId);

    if (!currentUser || !friend) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!currentUser.connections.includes(friend._id)) {
      return NextResponse.json(
        { success: false, message: "This user is not in your friends list" },
        { status: 400 }
      );
    }

    // Remove friend from both users' connections
    currentUser.connections = currentUser.connections.filter(
      (id) => !id.equals(friend._id)
    );
    friend.connections = friend.connections.filter(
      (id) => !id.equals(currentUser._id)
    );

    await currentUser.save();
    await friend.save();

    return NextResponse.json(
      {
        success: true,
        message: "Friend removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing friend:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Error removing friend" },
      { status: 500 }
    );
  }
}