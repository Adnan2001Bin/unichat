import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Interface for a group member
interface GroupMember {
  _id: string;
  userName: string;
  profilePicture?: string;
}

// Interface for the response data
interface GroupMembersResponse {
  success: boolean;
  data?: GroupMember[];
  message?: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
): Promise<NextResponse<GroupMembersResponse>> {
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
      .populate<{ members: { _id: string; userName: string; profilePicture?: string }[] }>(
        "members",
        "userName profilePicture"
      )
      .lean();

    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 }
      );
    }

    if (
      !group.members.some(
        (member) => member._id.toString() === session.user._id
      )
    ) {
      return NextResponse.json(
        { success: false, message: "You are not a member of this group" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: group.members.map((member) => ({
        _id: member._id.toString(),
        userName: member.userName,
        profilePicture: member.profilePicture,
      })),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error fetching group members";
    console.error("Error fetching group members:", errorMessage);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}