import { NextResponse } from "next/server";
    import { v2 as cloudinary } from "cloudinary";

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    export async function GET() {
      try {
        if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          throw new Error('Missing Cloudinary API Key or API Secret in environment variables');
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
          { timestamp, upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET },
          process.env.CLOUDINARY_API_SECRET!
        );

        return NextResponse.json({
          success: true,
          signature,
          timestamp,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        }, { status: 200 });
      } catch (error: any) {
        console.error("Error generating Cloudinary signature:", error.message);
        return NextResponse.json(
          { success: false, message: error.message || "Failed to generate signature" },
          { status: 500 }
        );
      }
    }