import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").trim(),
});

export async function GET(request: NextRequest) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    const parsedData = searchSchema.safeParse({ query });
    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsedData.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const currentUser = await UserModel.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const users = await UserModel.find({
      userName: { $regex: parsedData.data.query, $options: "i" },
      isVerified: true,
      _id: { $ne: currentUser._id }, // Exclude current user
    })
      .select("userName profilePicture university headline")
      .limit(10);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { success: false, message: "Error searching users" },
      { status: 500 }
    );
  }
}