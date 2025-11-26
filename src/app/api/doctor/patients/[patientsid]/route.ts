/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { authOptions } from '@/lib/auth';

// GET - Get single patient by ID with optional appointments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeAppointments = searchParams.get('includeAppointments');

    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Validate ID format (basic check)
    if (id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid patient ID format' },
        { status: 400 }
      );
    }

    const patient = await Patient.findById(id).lean();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    let appointments = [];

    if (includeAppointments === 'true') {
      try {
        // Import and fetch appointments for this patient
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Appointment = require('@/models/Appointment').default;
        appointments = await Appointment.find({ patientId: id })
          .sort({ appointmentDate: -1, appointmentTime: -1 })
          .lean();
      } catch (appointmentError) {
        console.error('Error fetching appointments:', appointmentError);
        // Continue without appointments if there's an error
      }
    }

    const responseData: any = {
      _id: patient._id.toString(),
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      emergencyContact: patient.emergencyContact || {
        name: '',
        phone: '',
        relationship: '',
      },
      medicalHistory: patient.medicalHistory || '',
      allergies: patient.allergies || [],
      medications: patient.medications || [],
      insurance: patient.insurance || {
        provider: '',
        policyNumber: '',
        groupNumber: '',
      },
      bloodType: patient.bloodType || null,
      height: patient.height || null,
      weight: patient.weight || null,
      isActive: patient.isActive !== undefined ? patient.isActive : true,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };

    if (includeAppointments === 'true') {
      responseData.appointments = appointments.map((apt: any) => ({
        _id: apt._id.toString(),
        appointmentDate: apt.appointmentDate,
        appointmentTime: apt.appointmentTime,
        type: apt.type,
        status: apt.status,
        reason: apt.reason,
        duration: apt.duration,
        createdAt: apt.createdAt,
      }));
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error('Error fetching patient:', error);

    // Handle CastError (invalid ID format)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid patient ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// PUT - Update patient by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Validate ID format
    if (id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid patient ID format' },
        { status: 400 }
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
      address,
      emergencyContact,
      medicalHistory,
      allergies,
      medications,
      insurance,
      bloodType,
      height,
      weight,
    } = body;

    // Find patient by ID
    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

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
        {
          error:
            'Missing required fields: firstName, lastName, email, phone, dateOfBirth, and gender are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another patient
    if (email !== patient.email) {
      const emailExists = await Patient.findOne({
        email,
        _id: { $ne: id },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'A patient with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update patient fields
    patient.firstName = firstName;
    patient.lastName = lastName;
    patient.email = email;
    patient.phone = phone;
    patient.dateOfBirth = new Date(dateOfBirth);
    patient.gender = gender;
    patient.address = address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    };
    patient.emergencyContact = emergencyContact || {
      name: '',
      phone: '',
      relationship: '',
    };
    patient.medicalHistory = medicalHistory || '';
    patient.allergies = allergies || [];
    patient.medications = medications || [];
    patient.insurance = insurance || {
      provider: '',
      policyNumber: '',
      groupNumber: '',
    };
    patient.bloodType = bloodType;
    patient.height = height;
    patient.weight = weight;

    // Save the updated patient
    const updatedPatient = await patient.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: updatedPatient._id.toString(),
        firstName: updatedPatient.firstName,
        lastName: updatedPatient.lastName,
        email: updatedPatient.email,
        phone: updatedPatient.phone,
        dateOfBirth: updatedPatient.dateOfBirth,
        gender: updatedPatient.gender,
        address: updatedPatient.address,
        emergencyContact: updatedPatient.emergencyContact,
        medicalHistory: updatedPatient.medicalHistory,
        allergies: updatedPatient.allergies,
        medications: updatedPatient.medications,
        insurance: updatedPatient.insurance,
        bloodType: updatedPatient.bloodType,
        height: updatedPatient.height,
        weight: updatedPatient.weight,
        isActive: updatedPatient.isActive,
        createdAt: updatedPatient.createdAt,
        updatedAt: updatedPatient.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating patient:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A patient with this email already exists' },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Handle CastError (invalid ID format)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid patient ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// DELETE - Delete patient by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Validate ID format
    if (id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid patient ID format' },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Soft delete (recommended - keeps record but marks as inactive)
    await Patient.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting patient:', error);

    // Handle CastError (invalid ID format)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid patient ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
