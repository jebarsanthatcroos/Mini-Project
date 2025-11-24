import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { Types } from "mongoose";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/doctors/[id]/appointments - Get doctor's appointments
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';

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

    // In a real application, you would have an Appointment model
    // This is a simplified version
    const Appointment = require('@/models/Appointment').default;
    
    let appointmentFilter: any = { doctor: id };
    
    if (status) {
      appointmentFilter.status = status;
    }
    
    if (upcoming) {
      appointmentFilter.date = { $gte: new Date() };
    }

    const appointments = await Appointment.find(appointmentFilter)
      .populate('patient', 'name email phone')
      .sort({ date: 1, time: 1 });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}