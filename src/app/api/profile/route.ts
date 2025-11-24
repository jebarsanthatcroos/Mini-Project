/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { user: user.toJSON() },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, phone, department, specialization, address, bio } = await req.json();

    // Validation
    if (name && (name.length < 2 || name.length > 100)) {
      return Response.json(
        { message: "Name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      return Response.json(
        { message: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user and update
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (address !== undefined) updateData.address = address;
    if (bio !== undefined) updateData.bio = bio;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    return Response.json(
      { 
        message: "Profile updated successfully", 
        user: updatedUser.toJSON() 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile update error:", error);
    
    if (error.name === 'ValidationError') {
      return Response.json(
        { message: "Validation error", error: error.errors },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return Response.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }
    
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}