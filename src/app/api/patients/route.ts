/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/patients - Get all patients or filter by query params
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view patients
    const allowedRoles = ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const physicianId = searchParams.get("physicianId");

    const query: any = {};

    // If doctor, only show their patients
    if (user.role === "DOCTOR") {
      query.primaryPhysician = user._id;
    }

    // Filter by physician if provided
    if (physicianId && user.role !== "DOCTOR") {
      query.primaryPhysician = physicianId;
    }

    // Filter by active status
    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    let patients;
    if (search) {
      // Search by medical record number or user details
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
        role: "PATIENT",
      }).select("_id");

      const userIds = users.map((u) => u._id);

      patients = await Patient.find({
        ...query,
        $or: [
          { userId: { $in: userIds } },
          { medicalRecordNumber: { $regex: search, $options: "i" } },
        ],
      })
        .populate("userId", "-password")
        .populate("primaryPhysician", "-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      patients = await Patient.find(query)
        .populate("userId", "-password")
        .populate("primaryPhysician", "-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    const total = await Patient.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const allowedRoles = ["ADMIN", "RECEPTIONIST", "DOCTOR"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.userId || !body.dateOfBirth || !body.gender) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists and has PATIENT role
    const patientUser = await User.findById(body.userId);
    if (!patientUser) {
      return NextResponse.json(
        { success: false, message: "Patient user not found" },
        { status: 404 }
      );
    }

    if (patientUser.role !== "PATIENT") {
      return NextResponse.json(
        { success: false, message: "User must have PATIENT role" },
        { status: 400 }
      );
    }

    // Check if patient already exists for this user
    const existingPatient = await Patient.findOne({ userId: body.userId });
    if (existingPatient) {
      return NextResponse.json(
        { success: false, message: "Patient record already exists for this user" },
        { status: 400 }
      );
    }

    // Generate medical record number if not provided
    if (!body.medicalRecordNumber) {
      body.medicalRecordNumber = await (Patient as any).generateMRN();
    }

    // Validate primary physician if provided
    if (body.primaryPhysician) {
      const physician = await User.findById(body.primaryPhysician);
      if (!physician || physician.role !== "DOCTOR") {
        return NextResponse.json(
          { success: false, message: "Invalid primary physician" },
          { status: 400 }
        );
      }
    }

    const patient = await Patient.create(body);

    const populatedPatient = await Patient.findById(patient._id)
      .populate("userId", "-password")
      .populate("primaryPhysician", "-password");

    return NextResponse.json(
      {
        success: true,
        message: "Patient created successfully",
        data: populatedPatient,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/patients - Update multiple patients (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { patientIds, updates } = body;

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid patient IDs" },
        { status: 400 }
      );
    }

    const result = await Patient.updateMany(
      { _id: { $in: patientIds } },
      { $set: updates }
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} patients`,
      data: { modified: result.modifiedCount },
    });
  } catch (error: any) {
    console.error("Error updating patients:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/patients - Delete multiple patients (bulk delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { success: false, message: "No patient IDs provided" },
        { status: 400 }
      );
    }

    const patientIds = idsParam.split(",");

    // Soft delete by setting isActive to false
    const result = await Patient.updateMany(
      { _id: { $in: patientIds } },
      { $set: { isActive: false } }
    );

    return NextResponse.json({
      success: true,
      message: `Deactivated ${result.modifiedCount} patients`,
      data: { deactivated: result.modifiedCount },
    });
  } catch (error: any) {
    console.error("Error deleting patients:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}