import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Appointment, { IAppointmentModel } from "@/models/Appointment";

// GET /api/doctor/appointments/upcoming - Get upcoming appointments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Use the properly typed static method
    const appointments = await (Appointment as IAppointmentModel).findUpcomingByDoctor(session.user.id, limit);

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming appointments" },
      { status: 500 }
    );
  }
}