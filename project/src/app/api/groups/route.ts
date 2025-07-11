// import connectDB from "@/lib/connectDB";
// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";
// import { authOptions } from "../auth/[...nextauth]/options";
// import { groupListSchema } from "@/schemas/groupListSchema";
// import GroupModel from "@/models/group.model";
// import { z } from "zod";

// export async function GET(request: NextRequest) {
//   await connectDB();

//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user?._id) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Get query parameters (search term, page, limit) from the URL
//     const { searchParams } = new URL(request.url);
//     // Validate query parameters using Zod schema, with defaults for page (1) and limit (10)
//     const parsedData = groupListSchema.parse({
//       query: searchParams.get("query"),
//       page: searchParams.get("page") || "1",
//       limit: searchParams.get("limit") || "10",
//     });

//     // Extract validated query, page, and limit values
//     const { query, page, limit } = parsedData;

//     // Calculate how many groups to skip for pagination (e.g., page 2, limit 10 => skip 10)
//     const skip = (page - 1) * limit;

//     // Define filter to find groups: either public or ones the user is a member of
//     const filter: any = {
//       $or: [
//         { privacy: "public" }, // Include all public groups
//         { members: session.user._id }, // Include private groups where user is a member
//       ],
//     };

//     // If a search query is provided, filter groups by name (case-insensitive)
//     if (query) {
//       filter.name = { $regex: query, $options: "i" };
//     }

//     // Fetch groups and total count in parallel for efficiency
//     const [groups, total] = await Promise.all([
//       // Find groups matching the filter, skip some for pagination, limit results, and select specific fields
//       GroupModel.find(filter)
//         .skip(skip)
//         .limit(limit)
//         .select("name description coverImage privacy creator members")
//         .populate("creator", "userName") // Get creator's username
//         .lean(), // Convert to plain JavaScript object for better performance
//       // Count total matching groups for pagination
//       GroupModel.countDocuments(filter),
//     ]);

//     // Return successful response with group data and pagination info
//     return NextResponse.json({
//       success: true,
//       data: groups.map((group) => ({
//         _id: group._id.toString(),
//         name: group.name,
//         description: group.description,
//         coverImage: group.coverImage,
//         privacy: group.privacy,
//         creator: group.creator,
//         memberCount: group.members.length,
//       })),
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit), // Calculate total pages
//       },
//     });
//   } catch (error) {
//     // Log and handle errors
//     console.error("Error fetching groups:", error);
//     // Handle Zod validation errors
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: error.errors.map((e) => e.message).join(", "),
//         },
//         { status: 400 }
//       );
//     }
//     // Handle other errors
//     return NextResponse.json(
//       { success: false, message: "Error fetching groups" },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import GroupModel from "@/models/group.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { groupListSchema } from "@/schemas/groupListSchema";
import { z } from "zod";

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
    const parsedData = groupListSchema.parse({
      query: searchParams.get("query"),
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
    });

    const { query, page, limit } = parsedData;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    const [groups, total] = await Promise.all([
      GroupModel.find(filter)
        .skip(skip)
        .limit(limit)
        .select("name description coverImage privacy creator members")
        .populate("creator", "userName")
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
  } catch (error) {
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