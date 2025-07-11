import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupMessageModel from "@/models/groupMessage.model";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const groupChatHistorySchema = z.object({
  groupId: z
    .string()
    .min(1, "Group ID is required")
    .refine((id) => /^[0-9a-fA-F]{24}$/.test(id), {
      message: "Group ID must be a valid MongoDB ObjectId",
    }),
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
    const groupId = searchParams.get("groupId");
    if (!groupId) {
      return NextResponse.json(
        { success: false, message: "Group ID is missing" },
        { status: 400 }
      );
    }

    const parsedData = groupChatHistorySchema.parse({
      groupId,
    });

    const group = await GroupModel.findById(parsedData.groupId);
    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 }
      );
    }

    if (
      !group.members.some((member) => member.toString() === session.user._id)
    ) {
      return NextResponse.json(
        { success: false, message: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const messages = await GroupMessageModel.find({
      groupId: parsedData.groupId,
    })
      .sort({ createdAt: 1 })
      .populate<{ sender: { _id: string; userName: string } }>(
        "sender",
        "userName"
      )
      .select("sender content createdAt")
      .lean();

    return NextResponse.json({
      success: true,
      data: messages.map((msg) => {
        if (!msg.sender) {
          throw new Error("Sender information missing");
        }
        return {
          senderId: msg.sender._id.toString(),
          senderName: msg.sender.userName,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching group chat history:", error);
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
      { success: false, message: "Error fetching group chat history" },
      { status: 500 }
    );
  }
}
