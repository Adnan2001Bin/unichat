import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
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
    const parsedData = searchSchema.parse({
      query: searchParams.get("query"),
    });

    const currentUser = await UserModel.findById(session.user._id).select("connections");
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const users = await UserModel.find({
      userName: { $regex: parsedData.query, $options: "i" },
      _id: { $ne: session.user._id, $nin: currentUser.connections },
      isVerified: true,
    })
      .select("_id userName profilePicture")
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        _id: user._id.toString(),
        userName: user.userName,
        profilePicture: user.profilePicture,
      })),
    });
  } catch (error) {
    console.error("Error searching users:", error);
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
      { success: false, message: "Error searching users" },
      { status: 500 }
    );
  }
}