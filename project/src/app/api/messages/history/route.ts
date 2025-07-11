import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import MessageModel from "@/models/message.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const chatHistorySchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
});

export async function GET(request: NextRequest) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsedData = chatHistorySchema.parse({
      recipientId: searchParams.get("recipientId"),
    });

    const messages = await MessageModel.find({
      $or: [
        { sender: session.user._id, recipient: parsedData.recipientId },
        { sender: parsedData.recipientId, recipient: session.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .select("sender recipient content createdAt")
      .lean();

    return NextResponse.json({
      success: true,
      data: messages.map((msg) => ({
        senderId: msg.sender.toString(),
        recipientId: msg.recipient.toString(),
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
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
      { success: false, message: "Error fetching chat history" },
      { status: 500 }
    );
  }
}