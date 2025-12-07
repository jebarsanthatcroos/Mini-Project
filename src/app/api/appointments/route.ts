/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Import models - this ensures they are registered
let Appointment: any;
let Patient: any;

try {
  // Try to get existing models or import them

  Appointment =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mongoose.models.Appointment || require('@/models/Appointment').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Patient = mongoose.models.Patient || require('@/models/Patient').default;
} catch (error) {
  console.error('Error loading models:', error);
}

export async function GET(request: NextRequest) {
  try {
    // Step 1: Connect to database
    await connectDB();

    // Ensure models are loaded
    if (!Appointment) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Appointment = require('@/models/Appointment').default;
    }
    if (!Patient) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Patient = require('@/models/Patient').default;
    }

    console.log('Models loaded:', {
      Appointment: !!Appointment,
      Patient: !!Patient,
      registeredModels: Object.keys(mongoose.models),
    });

    // Step 2: Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Step 3: Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');

    // Step 4: Build query
    const query: any = {
      isActive: true,
    };

    // Try to find if this user's appointments use 'doctor' or 'pharmacist' field
    const sampleAppointment = await Appointment.findOne({
      $or: [{ doctor: session.user.id }, { pharmacist: session.user.id }],
    }).lean();

    // Set the appropriate field based on what exists
    if (sampleAppointment?.doctor) {
      query.doctor = session.user.id;
    } else if (sampleAppointment?.pharmacist) {
      query.pharmacist = session.user.id;
    } else {
      // If no appointments found, default to doctor
      query.doctor = session.user.id;
    }

    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    if (type && type !== 'all') {
      query.type = type.toUpperCase();
    }

    if (date) {
      try {
        const selectedDate = new Date(date);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        query.appointmentDate = {
          $gte: selectedDate,
          $lt: nextDay,
        };
      } catch (dateError) {
        console.error('Date parsing error:', dateError);
      }
    }

    console.log('Query:', query);

    // Step 5: Fetch appointments
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate({
          path: 'patient',
          model: 'Patient', // Explicitly specify the model name
          select:
            'firstName lastName email phone nic dateOfBirth gender address',
        })
        .sort({ appointmentDate: -1, appointmentTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Appointment.countDocuments(query),
    ]);

    console.log(`Found ${appointments.length} appointments, total: ${total}`);

    // Step 6: Format appointments
    const formattedAppointments = appointments.map((apt: any) => {
      // Check if patient is populated
      const patientData = apt.patient
        ? {
            _id: apt.patient._id?.toString() || '',
            firstName: apt.patient.firstName || '',
            lastName: apt.patient.lastName || '',
            email: apt.patient.email || '',
            phone: apt.patient.phone || '',
            nic: apt.patient.nic || '',
            dateOfBirth: apt.patient.dateOfBirth || null,
            gender: apt.patient.gender || '',
            address: apt.patient.address || null,
          }
        : null;

      return {
        _id: apt._id?.toString() || '',
        patient: patientData,
        doctor: apt.doctor?.toString() || '',
        appointmentDate: apt.appointmentDate
          ? new Date(apt.appointmentDate).toISOString().split('T')[0]
          : '',
        appointmentTime: apt.appointmentTime || '',
        duration: apt.duration || 30,
        type: apt.type || '',
        status: apt.status || 'SCHEDULED',
        reason: apt.reason || '',
        symptoms: apt.symptoms || '',
        diagnosis: apt.diagnosis || '',
        prescription: apt.prescription || '',
        notes: apt.notes || '',
        createdAt: apt.createdAt || null,
        updatedAt: apt.updatedAt || null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          appointments: formattedAppointments,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('=== ERROR IN GET /api/appointments ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Registered models:', Object.keys(mongoose.models));

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch appointments',
        error:
          process.env.NODE_ENV === 'development'
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
                registeredModels: Object.keys(mongoose.models),
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
