import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupModel from "@/models/group.model";
import UserModel from "@/models/user.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const manageRequestSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  userId: z.string().min(1, "User ID is required"),
  action: z.enum(["approve", "reject"], { message: "Invalid action" }),
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
    const parsedData = manageRequestSchema.parse(body);

    const group = await GroupModel.findById(parsedData.groupId);
    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 }
      );
    }

    if (group.creator.toString() !== session.user._id) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the group creator can manage requests",
        },
        { status: 403 }
      );
    }

    const user = await UserModel.findById(parsedData.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!group.pendingJoinRequests.includes(user._id)) {
      return NextResponse.json(
        { success: false, message: "No pending request found for this user" },
        { status: 400 }
      );
    }

    if (parsedData.action === "approve") {
      group.pendingJoinRequests = group.pendingJoinRequests.filter(
        (id) => id.toString() !== user._id.toString()
      );
      group.members.push(user._id);
      await group.save();
      return NextResponse.json(
        { success: true, message: "Join request approved successfully" },
        { status: 200 }
      );
    } else if (parsedData.action === "reject") {
      group.pendingJoinRequests = group.pendingJoinRequests.filter(
        (id) => id.toString() !== user._id.toString()
      );
      await group.save();
      return NextResponse.json(
        { success: true, message: "Join request rejected successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error managing join request:", error);
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
      { success: false, message: "Error managing join request" },
      { status: 500 }
    );
  }
}
