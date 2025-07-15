import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import PostModel from "@/models/post.model";
import GroupPostModel from "@/models/groupPost.model";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";

const createPostSchema = z.object({
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
    const parsedData = createPostSchema.parse(body);

    const post = new PostModel({
      creator: session.user._id,
      content: parsedData.content,
      image: parsedData.image || null,
    });

    await post.save();

    return NextResponse.json(
      {
        success: true,
        message: "Post created successfully",
        data: {
          _id: post._id,
          creator: post.creator,
          content: post.content,
          image: post.image,
          createdAt: post.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
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
      { success: false, message: "Error creating post" },
      { status: 500 }
    );
  }
}

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

    const user = await UserModel.findById(session.user._id).select("connections");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Fetch personal posts from user and their connections
    const personalPosts = await PostModel.find({
      creator: { $in: [session.user._id, ...user.connections] },
    })
      .populate<{ creator: {_id: mongoose.Types.ObjectId; userName: string; profilePicture?: string } }>(
        "creator",
        "userName profilePicture"
      )
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Fetch public group posts
    const publicGroups = await GroupModel.find({ privacy: "public" }).select("_id");
    const publicGroupPosts = await GroupPostModel.find({
      groupId: { $in: publicGroups.map((g) => g._id) },
    })
      .populate<{ creator: {_id: mongoose.Types.ObjectId; userName: string; profilePicture?: string } }>(
        "creator",
        "userName profilePicture"
      )
      .populate<{ groupId: {_id: mongoose.Types.ObjectId; name: string } }>("groupId", "name")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const combinedPosts = [
      ...personalPosts.map((post) => ({
        _id: post._id.toString(),
        type: "personal",
        creator: {
          _id: post.creator._id.toString(),
          userName: post.creator.userName,
          profilePicture: post.creator.profilePicture,
        },
        content: post.content,
        image: post.image,
        createdAt: post.createdAt.toISOString(),
      })),
      ...publicGroupPosts.map((post) => ({
        _id: post._id.toString(),
        type: "group",
        groupId: post.groupId._id.toString(),
        groupName: post.groupId.name,
        creator: {
          _id: post.creator._id.toString(),
          userName: post.creator.userName,
          profilePicture: post.creator.profilePicture,
        },
        content: post.content,
        image: post.image,
        createdAt: post.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: combinedPosts.slice(0, 20),
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching posts" },
      { status: 500 }
    );
  }
}