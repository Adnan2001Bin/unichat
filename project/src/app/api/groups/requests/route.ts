import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const groups = await GroupModel.find({
      creator: session.user._id,
      pendingJoinRequests: { $exists: true, $ne: [] },
    })
      .select("name pendingJoinRequests")
      .populate("pendingJoinRequests", "userName")
      .lean();

    const requests = groups.map((group) => ({
      groupId: group._id.toString(),
      groupName: group.name,
      pendingUsers: group.pendingJoinRequests.map((user: any) => ({
        userId: user._id.toString(),
        userName: user.userName,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching pending requests" },
      { status: 500 }
    );
  }
}