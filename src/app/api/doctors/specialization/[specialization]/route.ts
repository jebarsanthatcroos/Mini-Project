import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor, { IDoctorModel } from "@/models/Doctor";

interface Params {
  params: {
    specialization: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { specialization } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Now the method accepts limit as a parameter and returns a Promise
    const doctors = await (Doctor as IDoctorModel).findBySpecialization(specialization, limit);

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Error fetching doctors by specialization:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}