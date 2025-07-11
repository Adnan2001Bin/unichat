import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await UserModel.findOne({ email: session.user.email }).select(
      "userName profilePicture coverPhoto university graduationYear skills headline"
    );
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userName: user.userName,
        profilePicture: user.profilePicture,
        coverPhoto: user.coverPhoto,
        university: user.university,
        graduationYear: user.graduationYear,
        skills: user.skills,
        headline: user.headline,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching user data" },
      { status: 500 }
    );
  }
}