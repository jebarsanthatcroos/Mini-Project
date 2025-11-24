import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import { Types } from "mongoose";

// GET /api/doctors - Get all doctors with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const specialization = searchParams.get('specialization');
    const department = searchParams.get('department');
    const isVerified = searchParams.get('isVerified');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {
      "profile.isVerified": true,
      "profile.licenseExpiry": { $gt: new Date() }
    };

    if (specialization) {
      filter["profile.specialization"] = new RegExp(specialization, 'i');
    }

    if (department) {
      filter["profile.department"] = new RegExp(department, 'i');
    }

    if (isVerified !== null) {
      filter["profile.isVerified"] = isVerified === 'true';
    }

    // Search across multiple fields
    if (search) {
      const userSearch = await User.find({
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ]
      }).select('_id');

      const userIds = userSearch.map(user => user._id);
      
      filter.$or = [
        { user: { $in: userIds } },
        { "profile.specialization": new RegExp(search, 'i') },
        { "profile.department": new RegExp(search, 'i') }
      ];
    }

    const doctors = await Doctor.find(filter)
      .populate('user', 'name email phone image')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Doctor.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

// POST /api/doctors - Create a new doctor profile
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, profile } = body;

    if (!userId || !profile) {
      return NextResponse.json(
        { error: "User ID and profile data are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ user: userId });
    if (existingDoctor) {
      return NextResponse.json(
        { error: "Doctor profile already exists for this user" },
        { status: 409 }
      );
    }

    // Validate license number uniqueness
    const existingLicense = await Doctor.findOne({ 
      "profile.licenseNumber": profile.licenseNumber 
    });
    if (existingLicense) {
      return NextResponse.json(
        { error: "License number already exists" },
        { status: 409 }
      );
    }

    // Create doctor profile
    const doctor = new Doctor({
      user: userId,
      profile: {
        ...profile,
        isVerified: false // New doctors start unverified
      }
    });

    await doctor.save();

    // Populate user data in response
    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone image');

    return NextResponse.json(
      { 
        message: "Doctor profile created successfully", 
        doctor: populatedDoctor 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating doctor profile:", error);
    return NextResponse.json(
      { error: "Failed to create doctor profile" },
      { status: 500 }
    );
  }
}