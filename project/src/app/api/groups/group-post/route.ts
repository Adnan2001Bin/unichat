import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupPostModel from "@/models/groupPost.model";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";
import mongoose from "mongoose";

const createGroupPostSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  content: z
    .string()
    .min(1, "Post content is required")
    .max(2000, "Post content cannot exceed 2000 characters"),
  image: z.string().optional(),
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
    const parsedData = createGroupPostSchema.parse(body);

    const group = await GroupModel.findById(parsedData.groupId);
    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 }
      );
    }

    if (!group.members.includes(session.user._id)) {
      return NextResponse.json(
        { success: false, message: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const post = new GroupPostModel({
      groupId: parsedData.groupId,
      creator: session.user._id,
      content: parsedData.content,
      image: parsedData.image || null,
    });

    await post.save();

    return NextResponse.json(
      {
        success: true,
        message: "Group post created successfully",
        data: {
          _id: post._id,
          groupId: post.groupId,
          creator: post.creator,
          content: post.content,
          image: post.image,
          createdAt: post.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group post:", error);
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
      { success: false, message: "Error creating group post" },
      { status: 500 }
    );
  }
}

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
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { success: false, message: "Group ID is required" },
        { status: 400 }
      );
    }

    const group = await GroupModel.findById(groupId);
    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 }
      );
    }

    if (
      group.privacy === "private" &&
      !group.members.includes(session.user._id)
    ) {
      return NextResponse.json(
        { success: false, message: "Access denied to private group" },
        { status: 403 }
      );
    }

    const posts = await GroupPostModel.find({ groupId })
      .populate<{
        creator: { _id: mongoose.Types.ObjectId; userName: string; profilePicture?: string }
      }>("creator", "_id userName profilePicture")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      data: posts.map((post) => ({
        _id: post._id.toString(),
        groupId: post.groupId.toString(),
        creator: {
          _id: post.creator._id.toString(),
          userName: post.creator.userName,
          profilePicture: post.creator.profilePicture,
        },
        content: post.content,
        image: post.image,
        createdAt: post.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching group posts:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching group posts" },
      { status: 500 }
    );
  }
}