/* eslint-disable @typescript-eslint/no-explicit-any */

import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/patients - Get all patients with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view patients
    const allowedRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const gender = searchParams.get('gender');
    const bloodType = searchParams.get('bloodType');
    const ageGroup = searchParams.get('ageGroup');
    const isActive = searchParams.get('isActive') ?? 'true'; // Default to active patients

    const query: any = {};

    // Filter by active status
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    // Filter by gender
    if (gender && gender !== 'ALL') {
      query.gender = gender;
    }

    // Filter by blood type
    if (bloodType && bloodType !== 'ALL') {
      query.bloodType = bloodType;
    }

    // If user is a doctor, only show their created patients
    if (user.role === 'DOCTOR') {
      query.createdBy = user._id;
    }

    const skip = (page - 1) * limit;

    let patients;
    let total;

    if (search) {
      // Search across multiple fields
      patients = await Patient.find({
        ...query,
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { nic: { $regex: search, $options: 'i' } },
        ],
      })
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await Patient.countDocuments({
        ...query,
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { nic: { $regex: search, $options: 'i' } },
        ],
      });
    } else {
      patients = await Patient.find(query)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await Patient.countDocuments(query);
    }

    // Apply age group filtering in memory if needed
    if (ageGroup && ageGroup !== 'ALL') {
      patients = patients.filter(patient => {
        const age = patient.calculateAge();
        switch (ageGroup) {
          case 'CHILD':
            return age < 18;
          case 'ADULT':
            return age >= 18 && age < 65;
          case 'SENIOR':
            return age >= 65;
          default:
            return true;
        }
      });
      // Update total for age group filtering
      total = patients.length;
    }

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
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
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
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const allowedRoles = ['ADMIN', 'RECEPTIONIST', 'DOCTOR'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'nic',
      'dateOfBirth',
      'gender',
    ];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate NIC format
    const nicRegex = /^[0-9]{9}[VX]|[0-9]{12}$/;
    if (!nicRegex.test(body.nic)) {
      return NextResponse.json(
        { success: false, message: 'Invalid NIC format' },
        { status: 400 }
      );
    }

    // Validate date of birth
    const dob = new Date(body.dateOfBirth);
    if (dob >= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Date of birth must be in the past' },
        { status: 400 }
      );
    }

    // Check if patient with same email or NIC already exists
    const existingPatient = await Patient.findOne({
      $or: [
        { email: body.email.toLowerCase() },
        { nic: body.nic.toUpperCase() },
      ],
    });

    if (existingPatient) {
      const field =
        existingPatient.email === body.email.toLowerCase() ? 'email' : 'NIC';
      return NextResponse.json(
        {
          success: false,
          message: `Patient with this ${field} already exists`,
        },
        { status: 400 }
      );
    }

    // Set createdBy to current user
    body.createdBy = user._id;

    // Normalize data
    body.email = body.email.toLowerCase();
    body.nic = body.nic.toUpperCase();

    // Set default values for nested objects if not provided
    if (!body.address) {
      body.address = {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      };
    }

    if (!body.emergencyContact) {
      body.emergencyContact = {
        name: '',
        phone: '',
        relationship: '',
      };
    }

    if (!body.insurance) {
      body.insurance = {
        provider: '',
        policyNumber: '',
        groupNumber: '',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };
    }

    // Create the patient
    const patient = await Patient.create(body);

    // Populate createdBy field in response
    const populatedPatient = await Patient.findById(patient._id).populate(
      'createdBy',
      'name email role'
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Patient created successfully',
        data: populatedPatient,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating patient:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        {
          success: false,
          message: `Patient with this ${field} already exists`,
        },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
