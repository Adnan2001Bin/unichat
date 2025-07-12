import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Interface for a pending user
interface PendingUser {
  userId: string;
  userName: string;
}

// Interface for a group request
interface GroupRequest {
  groupId: string;
  groupName: string;
  pendingUsers: PendingUser[];
}

// Interface for the response data
interface PendingRequestsResponse {
  success: boolean;
  data?: GroupRequest[];
  message?: string;
}

export async function GET(): Promise<NextResponse<PendingRequestsResponse>> {
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
      .populate<{ pendingJoinRequests: { _id: string; userName: string }[] }>(
        "pendingJoinRequests",
        "userName"
      )
      .lean();

    const requests: GroupRequest[] = groups.map((group) => ({
      groupId: group._id.toString(),
      groupName: group.name,
      pendingUsers: group.pendingJoinRequests.map((user) => ({
        userId: user._id.toString(),
        userName: user.userName,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error fetching pending requests";
    console.error("Error fetching pending requests:", errorMessage);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}