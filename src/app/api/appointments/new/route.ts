/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'patientId',
      'appointmentDate',
      'appointmentTime',
      'type',
      'reason',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate appointment date is not in the past
    const appointmentDate = new Date(body.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return NextResponse.json(
        { success: false, message: 'Appointment date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(body.appointmentTime)) {
      return NextResponse.json(
        { success: false, message: 'Invalid time format. Use HH:MM format' },
        { status: 400 }
      );
    }

    // Create appointment data
    const appointmentData = {
      patient: body.patientId,
      doctor: session.user.id,
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
      duration: body.duration || 30,
      type: body.type,
      status: body.status || 'SCHEDULED',
      reason: body.reason,
      symptoms: body.symptoms || '',
      diagnosis: body.diagnosis || '',
      prescription: body.prescription || '',
      notes: body.notes || '',
      isActive: true,
    };

    // Create and save appointment
    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Populate patient details
    await appointment.populate({
      path: 'patient',
      select: 'firstName lastName email phone nic dateOfBirth gender address',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment created successfully',
        data: appointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating appointment:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
      return NextResponse.json(
        {
          success: false,
          message: `Validation error: ${validationErrors}`,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: 'An appointment already exists with these details',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create appointment',
      },
      { status: 500 }
    );
  }
}
