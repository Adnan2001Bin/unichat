import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(context: { params: Promise<{ groupId: string }> }) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { groupId } = await context.params;

    const group = await GroupModel.findById(groupId)
      .select("members")
      .populate("members", "userName profilePicture")
      .lean();

    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 }
      );
    }

    if (
      !group.members.some(
        (member: any) => member._id.toString() === session.user._id
      )
    ) {
      return NextResponse.json(
        { success: false, message: "You are not a member of this group" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: group.members.map((member: any) => ({
        _id: member._id.toString(),
        userName: member.userName,
        profilePicture: member.profilePicture,
      })),
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching group members" },
      { status: 500 }
    );
  }
}
