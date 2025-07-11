import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params to resolve the Promise and access groupId
    const { groupId } = await context.params;

    const group = await GroupModel.findById(groupId)
      .select("name description coverImage privacy creator members")
      .populate("creator", "userName")
      .lean();

    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 }
      );
    }

    // Check if user is allowed to view the group
    if (
      group.privacy === "private" &&
      !group.members.some((member) => member.toString() === session.user._id)
    ) {
      return NextResponse.json(
        { success: false, message: "Access denied to private group" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: group._id.toString(),
        name: group.name,
        description: group.description,
        coverImage: group.coverImage,
        privacy: group.privacy,
        creator: group.creator, // Updated to access populated userName
        memberCount: group.members.length,
        isMember: group.members.some(
          (member) => member.toString() === session.user._id
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching group details" },
      { status: 500 }
    );
  }
}
