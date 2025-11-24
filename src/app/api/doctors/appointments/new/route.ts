
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const patients = await User.find({ 
      role: "PATIENT",
      isActive: true 
    }).select('name email phone dateOfBirth gender');

    const timeSlots = generateTimeSlots();
    const appointmentTypes = ["CONSULTATION", "FOLLOW_UP", "CHECK_UP", "EMERGENCY", "ROUTINE", "SPECIALIST"];

    return NextResponse.json({
      patients,
      timeSlots,
      appointmentTypes,
      doctor: {
        id: session.user.id,
        name: session.user.name,
        specialization: session.user.specialization
      }
    });
  } catch (error) {
    console.error("Error fetching new appointment data:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment data" },
      { status: 500 }
    );
  }
}

function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
}

