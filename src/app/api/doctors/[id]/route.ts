import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";;
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import { Types } from "mongoose";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/doctors/[id] - Get specific doctor by ID
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

    const doctor = await Doctor.findById(id)
      .populate('user', 'name email phone image address bio');

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor" },
      { status: 500 }
    );
  }
}

// PUT /api/doctors/[id] - Update doctor profile
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { profile } = body;

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

    // Check if license number is being changed and if it's unique
    if (profile.licenseNumber && profile.licenseNumber !== doctor.profile.licenseNumber) {
      const existingLicense = await Doctor.findOne({
        "profile.licenseNumber": profile.licenseNumber,
        _id: { $ne: id }
      });
      if (existingLicense) {
        return NextResponse.json(
          { error: "License number already exists" },
          { status: 409 }
        );
      }
    }

    // Update doctor profile
    doctor.profile = {
      ...doctor.profile.toObject(),
      ...profile
    };

    await doctor.save();

    const updatedDoctor = await Doctor.findById(id)
      .populate('user', 'name email phone image');

    return NextResponse.json({
      message: "Doctor profile updated successfully",
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { error: "Failed to update doctor profile" },
      { status: 500 }
    );
  }
}

// DELETE /api/doctors/[id] - Delete doctor profile
export async function DELETE(request: NextRequest, { params }: Params) {
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

    // Update user role back to USER
    await User.findByIdAndUpdate(doctor.user, { role: "USER" });

    // Delete doctor profile
    await Doctor.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Doctor profile deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor profile" },
      { status: 500 }
    );
  }
}