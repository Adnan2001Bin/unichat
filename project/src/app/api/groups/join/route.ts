import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupModel from "@/models/group.model";
import UserModel from "@/models/user.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const joinGroupSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  action: z.enum(["join", "request"], { message: "Invalid action" }),
});

export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsedData = joinGroupSchema.parse(body);

    const group = await GroupModel.findById(parsedData.groupId);
    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 }
      );
    }

    const user = await UserModel.findById(session.user._id);
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { success: false, message: "User not found or not verified" },
        { status: 403 }
      );
    }

    if (group.members.includes(user._id)) {
      return NextResponse.json(
        { success: false, message: "You are already a member of this group" },
        { status: 400 }
      );
    }

    if (parsedData.action === "join" && group.privacy === "public") {
      group.members.push(user._id);
      await group.save();
      return NextResponse.json(
        { success: true, message: "Joined group successfully" },
        { status: 200 }
      );
    } else if (parsedData.action === "request" && group.privacy === "private") {
      if (group.pendingJoinRequests.includes(user._id)) {
        return NextResponse.json(
          { success: false, message: "Join request already sent" },
          { status: 400 }
        );
      }
      group.pendingJoinRequests.push(user._id);
      await group.save();
      return NextResponse.json(
        { success: true, message: "Join request sent successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action for group privacy" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error joining group:", error);
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
      { success: false, message: "Error joining group" },
      { status: 500 }
    );
  }
}