import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { Types } from "mongoose";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/doctors/[id]/statistics - Get doctor statistics
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid doctor ID" },
        { status: 400 }
      );
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    const statistics = await doctor.getPatientStatistics();

    return NextResponse.json({ statistics });
  } catch (error) {
    console.error("Error fetching doctor statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}