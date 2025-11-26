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

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch single patient by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Unauthorized access',
        error: 'You must be logged in to view patient details',
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
        error: 'Only admins, pharmacists, and doctors can view patient details',
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const patient = await Patient.findById(params.id)
      .populate('userId', 'firstName lastName email phone dateOfBirth gender')
      .populate('createdBy', 'firstName lastName email role');

    if (!patient) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Patient not found',
        error: 'The requested patient does not exist',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: ApiResponse<typeof patient> = {
      success: true,
      data: patient,
      message: 'Patient fetched successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to fetch patient',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// PUT - Update patient by ID
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Unauthorized access',
        error: 'You must be logged in to update patients',
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
        error: 'Only admins and pharmacists can update patients',
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
      medicalRecordNumber,
      allergies,
      chronicConditions,
      address,
      emergencyContact,
      insuranceInfo,
    } = body;

    // Find patient
    const patient = await Patient.findById(params.id).populate('userId');
    if (!patient) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Patient not found',
        error: 'The requested patient does not exist',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Update user information
    if (patient.userId) {
      const userUpdate: any = {};
      if (firstName) userUpdate.firstName = firstName.trim();
      if (lastName) userUpdate.lastName = lastName.trim();
      if (phone) userUpdate.phone = phone.trim();
      if (dateOfBirth) userUpdate.dateOfBirth = new Date(dateOfBirth);
      if (gender) userUpdate.gender = gender;

      // Check if email is being changed and if it already exists
      if (email && email !== (patient.userId as any).email) {
        const existingUser = await User.findOne({
          email: email.trim().toLowerCase(),
        });
        if (existingUser) {
          const errorResponse: ApiResponse<null> = {
            success: false,
            message: 'Email already exists',
            error: 'Another user with this email already exists',
          };
          return NextResponse.json(errorResponse, { status: 409 });
        }
        userUpdate.email = email.trim().toLowerCase();
      }

      await User.findByIdAndUpdate((patient.userId as any)._id, userUpdate);
    }

    // Update patient information
    const patientUpdate: any = {};
    if (medicalRecordNumber !== undefined)
      patientUpdate.medicalRecordNumber = medicalRecordNumber;
    if (allergies !== undefined) patientUpdate.allergies = allergies;
    if (chronicConditions !== undefined)
      patientUpdate.chronicConditions = chronicConditions;
    if (address !== undefined) patientUpdate.address = address?.trim();
    if (emergencyContact !== undefined)
      patientUpdate.emergencyContact = emergencyContact?.trim();
    if (insuranceInfo !== undefined)
      patientUpdate.insuranceInfo = insuranceInfo?.trim();

    const updatedPatient = await Patient.findByIdAndUpdate(
      params.id,
      patientUpdate,
      { new: true }
    )
      .populate('userId', 'firstName lastName email phone dateOfBirth gender')
      .populate('createdBy', 'firstName lastName email role');

    const response: ApiResponse<typeof updatedPatient> = {
      success: true,
      data: updatedPatient,
      message: 'Patient updated successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error updating patient:', error);

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
      message: 'Failed to update patient',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// DELETE - Delete patient by ID (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Unauthorized access',
        error: 'You must be logged in to delete patients',
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
        error: 'Only admins and pharmacists can delete patients',
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const patient = await Patient.findById(params.id);

    if (!patient) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Patient not found',
        error: 'The requested patient does not exist',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Soft delete - mark as inactive
    await Patient.findByIdAndUpdate(params.id, { isActive: false });

    // Also deactivate the user account
    if (patient.userId) {
      await User.findByIdAndUpdate(patient.userId, { isActive: false });
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Patient deleted successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error deleting patient:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to delete patient',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
