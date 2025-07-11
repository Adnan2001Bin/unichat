import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const respondFriendRequestSchema = z.object({
  senderId: z.string().min(1, "Sender ID is required"),
  action: z.enum(["accept", "reject"], { message: "Invalid action" }),
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
    const parsedData = respondFriendRequestSchema.parse(body);

    const recipient = await UserModel.findOne({ email: session.user.email });
    const sender = await UserModel.findById(parsedData.senderId);

    if (!recipient || !sender) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!recipient.pendingReceivedRequests.includes(sender._id)) {
      return NextResponse.json(
        { success: false, message: "No pending friend request from this user" },
        { status: 400 }
      );
    }

    if (parsedData.action === "accept") {
      recipient.connections.push(sender._id);
      sender.connections.push(recipient._id);
    }

    recipient.pendingReceivedRequests = recipient.pendingReceivedRequests.filter(
      (id) => !id.equals(sender._id)
    );
    sender.pendingSentRequests = sender.pendingSentRequests.filter(
      (id) => !id.equals(recipient._id)
    );

    await recipient.save();
    await sender.save();

    return NextResponse.json(
      {
        success: true,
        message: `Friend request ${parsedData.action}ed successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error responding to friend request:", error);
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
      { success: false, message: "Error responding to friend request" },
      { status: 500 }
    );
  }
}