import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Appointment, { IAppointmentModel } from "@/models/Appointment";

// GET /api/doctor/appointments/today - Get today's appointments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Use the properly typed static method
    const appointments = await (Appointment as IAppointmentModel).findTodayByDoctor(session.user.id);

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's appointments" },
      { status: 500 }
    );
  }
}