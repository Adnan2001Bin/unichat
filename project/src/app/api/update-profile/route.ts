import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";
import { updateProfileSchema } from "@/schemas/updateProfileSchema";

// Interface for the response data
interface UpdateProfileResponse {
  success: boolean;
  message: string;
}

export async function PATCH(request: NextRequest): Promise<NextResponse<UpdateProfileResponse>> {
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
    const parsedData = updateProfileSchema.parse(body);

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update only the provided fields
    const updateData: Partial<z.infer<typeof updateProfileSchema>> = {};
    if (parsedData.userName) updateData.userName = parsedData.userName;
    if (parsedData.university) updateData.university = parsedData.university;
    if (parsedData.graduationYear) updateData.graduationYear = parsedData.graduationYear;
    if (parsedData.skills) updateData.skills = parsedData.skills;
    if (parsedData.headline) updateData.headline = parsedData.headline;
    if (parsedData.profilePicture) updateData.profilePicture = parsedData.profilePicture;
    if (parsedData.coverPhoto) updateData.coverPhoto = parsedData.coverPhoto;

    await UserModel.updateOne({ email: session.user.email }, { $set: updateData });

    return NextResponse.json(
      { success: true, message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }
    const errorMessage = error instanceof Error ? error.message : "Error updating profile";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}