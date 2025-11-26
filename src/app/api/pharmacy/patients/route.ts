/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Patient from '@/models/Patient';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

// GET - Fetch all patients with search and pagination
export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Unauthorized access',
        error: 'You must be logged in to view patients',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    await connectDB();

    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'User not found',
        error: 'Unable to verify user account',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if user has permission
    if (!['ADMIN', 'PHARMACIST', 'DOCTOR'].includes(user.role)) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Insufficient permissions',
        error: 'Only admins, pharmacists, and doctors can view patients',
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build query

    const query: any = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { medicalRecordNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query
    const patients = await Patient.find(query)
      .populate('userId', 'firstName lastName email phone dateOfBirth gender')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Patient.countDocuments(query);

    const response: ApiResponse<{
      patients: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }> = {
      success: true,
      data: {
        patients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: 'Patients fetched successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to fetch patients',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST - Create a new patient
export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Unauthorized access',
        error: 'You must be logged in to create patients',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    await connectDB();

    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'User not found',
        error: 'Unable to verify user account',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if user has permission
    if (!['ADMIN', 'PHARMACIST'].includes(user.role)) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Insufficient permissions',
        error: 'Only admins and pharmacists can create patients',
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      password = 'defaultPassword123', // Default password, should be changed
      medicalRecordNumber,
      allergies = [],
      chronicConditions = [],
      address,
      emergencyContact,
      insuranceInfo,
    } = body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !dateOfBirth ||
      !gender
    ) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Missing required fields',
        error:
          'First name, last name, email, phone, date of birth, and gender are required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if user with same email already exists
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existingUser) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Email already exists',
        error: 'A user with this email already exists',
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // Create user account for patient
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      password, // In production, this should be hashed
      role: 'PATIENT',
      isActive: true,
    });

    await newUser.save();

    // Create patient record
    const newPatient = new Patient({
      userId: newUser._id,
      medicalRecordNumber: medicalRecordNumber || `MRN-${Date.now()}`,
      allergies,
      chronicConditions,
      address: address?.trim(),
      emergencyContact: emergencyContact?.trim(),
      insuranceInfo: insuranceInfo?.trim(),
      createdBy: user._id,
      isActive: true,
    });

    await newPatient.save();

    // Populate the response
    await newPatient.populate(
      'userId',
      'firstName lastName email phone dateOfBirth gender'
    );
    await newPatient.populate('createdBy', 'firstName lastName email role');

    const response: ApiResponse<typeof newPatient> = {
      success: true,
      data: newPatient,
      message: 'Patient created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating patient:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Duplicate entry',
        error: 'A patient with this information already exists',
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to create patient',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
