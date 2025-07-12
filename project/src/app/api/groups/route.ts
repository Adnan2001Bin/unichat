import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { groupListSchema } from "@/schemas/groupListSchema";
import { z } from "zod";
import { FilterQuery } from "mongoose";
import { IGroup } from "@/models/group.model";

// Interface for the response data
interface GroupListResponse {
  success: boolean;
  data?: {
    _id: string;
    name: string;
    description: string;
    coverImage?: string;
    privacy: "public" | "private";
    creator: { userName: string };
    memberCount: number;
    isMember: boolean;
  }[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<GroupListResponse>> {
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
    const parsedData = groupListSchema.parse({
      query: searchParams.get("query"),
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
    });

    const { query, page, limit } = parsedData;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IGroup> = {};
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    const [groups, total] = await Promise.all([
      GroupModel.find(filter)
        .skip(skip)
        .limit(limit)
        .select("name description coverImage privacy creator members")
        .populate<{ creator: { userName: string } }>("creator", "userName")
        .lean(),
      GroupModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: groups.map((group) => ({
        _id: group._id.toString(),
        name: group.name,
        description: group.description,
        coverImage: group.coverImage,
        privacy: group.privacy,
        creator: group.creator,
        memberCount: group.members.length,
        isMember: group.members.some((member) => member.toString() === session.user._id),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching groups:", error);
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
      { success: false, message: "Error fetching groups" },
      { status: 500 }
    );
  }
}