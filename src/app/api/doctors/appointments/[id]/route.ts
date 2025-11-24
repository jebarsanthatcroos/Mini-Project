import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { Types } from "mongoose";


interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid appointment ID" }, { status: 400 });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      doctor: session.user.id
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    ).populate('patient', 'name email phone dateOfBirth gender');

    return NextResponse.json({
      message: "Appointment updated successfully",
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid appointment ID" }, { status: 400 });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      doctor: session.user.id
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    await Appointment.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Appointment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}