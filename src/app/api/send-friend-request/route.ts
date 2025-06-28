import connectDB from "@/lib/connectDB";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/models/user.model";

const sendFriendRequestSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
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
    const parsedData = sendFriendRequestSchema.parse(body);

    const sender = await UserModel.findOne({ email: session.user.email });
    const recipient = await UserModel.findById(parsedData.recipientId);

    if (!sender || !recipient) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (sender._id.equals(recipient._id)) {
      return NextResponse.json(
        { success: false, message: "Cannot send friend request to yourself" },
        { status: 400 }
      );
    }

    if (sender.connections.includes(recipient._id)) {
      return NextResponse.json(
        { success: false, message: "Already friends" },
        { status: 400 }
      );
    }

    if (sender.pendingSentRequests.includes(recipient._id)) {
      return NextResponse.json(
        { success: false, message: "Friend request already sent" },
        { status: 400 }
      );
    }

    if (recipient.pendingReceivedRequests.includes(sender._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Friend request already received from this user",
        },
        { status: 400 }
      );
    }

    sender.pendingSentRequests.push(recipient._id)
    recipient.pendingReceivedRequests.push(sender._id);

    await sender.save();
    await recipient.save();

    return NextResponse.json(
      { success: true, message: "Friend request sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending friend request:", error);
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
      { success: false, message: "Error sending friend request" },
      { status: 500 }
    );
  }
}