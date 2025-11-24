import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor, { IDoctorModel } from "@/models/Doctor";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const time = searchParams.get('time');
    const specialization = searchParams.get('specialization');
    const limit = parseInt(searchParams.get('limit') || '10');

    let doctors;

    if (day && time) {
      // Use the properly typed static method with limit parameter
      doctors = await (Doctor as IDoctorModel).findAvailableDoctors(day, time, limit);
    } else {
      // Use regular find method with exec()
      const today = new Date().toLocaleString('en-us', { weekday: 'long' });
      doctors = await Doctor.find({
        "profile.availability.days": today,
        "profile.isVerified": true,
        "profile.licenseExpiry": { $gt: new Date() }
      })
      .populate('user', 'name email phone image')
      .limit(limit)
      .exec();
    }

    // Additional filtering by specialization if provided
    if (specialization) {
      doctors = doctors.filter((doctor: any) =>
        doctor.profile.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Error fetching available doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch available doctors" },
      { status: 500 }
    );
  }
}