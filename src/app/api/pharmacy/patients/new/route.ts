import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission
    if (!['ADMIN', 'PHARMACIST'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Return empty data for new patient form
    return NextResponse.json({
      success: true,
      data: {
        doctors: await User.find({ role: 'DOCTOR', isActive: true }).select(
          'firstName lastName specialty'
        ),
      },
      message: 'New patient form data fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching new patient data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new patient data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission
    if (!['ADMIN', 'PHARMACIST'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      bloodType,
      height,
      weight,
      allergies,
      chronicConditions,
      emergencyContact,
      insurance,
      primaryPhysician,
      notes,
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
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user account
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      role: 'PATIENT',
      isActive: true,
    });

    await newUser.save();

    // Create patient record
    const newPatient = new Patient({
      userId: newUser._id,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      bloodType,
      height,
      weight,
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      emergencyContact,
      insurance,
      primaryPhysician,
      notes,
      createdBy: user._id,
      isActive: true,
    });

    await newPatient.save();

    // Populate response
    await newPatient.populate('userId', 'firstName lastName email phone');
    await newPatient.populate(
      'primaryPhysician',
      'firstName lastName specialty'
    );

    return NextResponse.json(
      {
        success: true,
        data: newPatient,
        message: 'Patient created successfully',
      },
      { status: 201 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating patient:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Patient already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create patient' },
      { status: 500 }
    );
  }
}
