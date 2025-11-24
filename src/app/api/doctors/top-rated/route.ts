import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

// GET /api/doctors/top-rated - Get top-rated doctors
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const minRatings = parseInt(searchParams.get('minRatings') || '5');

    const doctors = await Doctor.find({
      "profile.isVerified": true,
      "profile.licenseExpiry": { $gt: new Date() },
      "profile.rating.count": { $gte: minRatings }
    })
    .populate('user', 'name email phone image')
    .sort({ "profile.rating.average": -1 })
    .limit(limit);

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Error fetching top-rated doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch top-rated doctors" },
      { status: 500 }
    );
  }
}