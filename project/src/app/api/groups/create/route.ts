import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { createGroupSchema } from "@/schemas/groupSchema";
import { z } from "zod";

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

    const user = await UserModel.findById(session.user._id);
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { success: false, message: "User not found or not verified" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsedData = createGroupSchema.parse(body);

    const existingGroup = await GroupModel.findOne({ name: parsedData.name });
    if (existingGroup) {
      return NextResponse.json(
        { success: false, message: "Group name is already taken" },
        { status: 400 }
      );
    }

    const group = new GroupModel({
      name: parsedData.name,
      description: parsedData.description,
      privacy: parsedData.privacy,
      creator: user._id,
      members: [user._id],
      coverImage: parsedData.coverImage || null,
    });

    await group.save();

    return NextResponse.json(
      {
        success: true,
        message: "Group created successfully",
        data: {
          _id: group._id,
          name: group.name,
          description: group.description,
          privacy: group.privacy,
          coverImage: group.coverImage,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
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
      { success: false, message: "Error creating group" },
      { status: 500 }
    );
  }
}