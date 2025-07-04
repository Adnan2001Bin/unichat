import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupModel from "@/models/group.model";
import { createGroupSchema } from "@/schemas/createGroupSchema";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";
import UserModel from "@/models/user.model";

export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsedData = createGroupSchema.parse(body);

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const group = new GroupModel({
      ...parsedData,
      admin: user._id,
      members: [user._id],
      coverImage: parsedData.coverImage,
    });

    await group.save();

    return NextResponse.json(
      {
        success: true,
        message: "Group created successfully",
        data: {
          groupId: group._id,
          name: group.name,
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