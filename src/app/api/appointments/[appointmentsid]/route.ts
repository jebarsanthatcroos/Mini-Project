/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Import models
let Appointment: any;
let Patient: any;

try {
  Appointment =
    mongoose.models.Appointment || require('@/models/Appointment').default;
  Patient = mongoose.models.Patient || require('@/models/Patient').default;
} catch (error) {
  console.error('Error loading models:', error);
}

// GET - Fetch single appointment by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Ensure models are loaded
    if (!Appointment) {
      Appointment = require('@/models/Appointment').default;
    }
    if (!Patient) {
      Patient = require('@/models/Patient').default;
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    // Fetch appointment
    const appointment = await Appointment.findOne({
      _id: id,
      isActive: true,
    })
      .populate({
        path: 'patient',
        model: 'Patient',
        select: 'firstName lastName email phone nic dateOfBirth gender address',
      })
      .lean()
      .exec();

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this appointment
    const doctorId = appointment.doctor?.toString();
    const pharmacistId = appointment.pharmacist?.toString();
    const userId = session.user.id;

    if (doctorId !== userId && pharmacistId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to this appointment' },
        { status: 403 }
      );
    }

    // Format appointment
    const formattedAppointment = {
      _id: appointment._id?.toString() || '',
      patient: appointment.patient
        ? {
            _id: appointment.patient._id?.toString() || '',
            firstName: appointment.patient.firstName || '',
            lastName: appointment.patient.lastName || '',
            email: appointment.patient.email || '',
            phone: appointment.patient.phone || '',
            nic: appointment.patient.nic || '',
            dateOfBirth: appointment.patient.dateOfBirth || null,
            gender: appointment.patient.gender || '',
            address: appointment.patient.address || null,
          }
        : null,
      doctor: appointment.doctor?.toString() || '',
      pharmacist: appointment.pharmacist?.toString() || null,
      appointmentDate: appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toISOString().split('T')[0]
        : '',
      appointmentTime: appointment.appointmentTime || '',
      duration: appointment.duration || 30,
      type: appointment.type || '',
      status: appointment.status || 'SCHEDULED',
      reason: appointment.reason || '',
      symptoms: appointment.symptoms || '',
      diagnosis: appointment.diagnosis || '',
      prescription: appointment.prescription || '',
      notes: appointment.notes || '',
      createdAt: appointment.createdAt || null,
      updatedAt: appointment.updatedAt || null,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedAppointment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('=== ERROR IN GET /api/appointments/[id] ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch appointment',
        error:
          process.env.NODE_ENV === 'development'
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}

// PATCH - Update appointment
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Ensure models are loaded
    if (!Appointment) {
      Appointment = require('@/models/Appointment').default;
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Check if appointment exists and user has access
    const existingAppointment = await Appointment.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify user has access
    const doctorId = existingAppointment.doctor?.toString();
    const pharmacistId = existingAppointment.pharmacist?.toString();
    const userId = session.user.id;

    if (doctorId !== userId && pharmacistId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to this appointment' },
        { status: 403 }
      );
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Allowed fields to update
    const allowedFields = [
      'appointmentDate',
      'appointmentTime',
      'duration',
      'type',
      'status',
      'reason',
      'symptoms',
      'diagnosis',
      'prescription',
      'notes',
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Validate status if provided
    if (body.status) {
      const validStatuses = [
        'SCHEDULED',
        'CONFIRMED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
      ];
      if (!validStatuses.includes(body.status.toUpperCase())) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        );
      }
      updateData.status = body.status.toUpperCase();
    }

    // Validate type if provided
    if (body.type) {
      const validTypes = [
        'CONSULTATION',
        'FOLLOW_UP',
        'CHECK_UP',
        'EMERGENCY',
        'ROUTINE',
      ];
      if (!validTypes.includes(body.type.toUpperCase())) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
          },
          { status: 400 }
        );
      }
      updateData.type = body.type.toUpperCase();
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({
        path: 'patient',
        model: 'Patient',
        select: 'firstName lastName email phone nic dateOfBirth gender address',
      })
      .lean()
      .exec();

    if (!updatedAppointment) {
      return NextResponse.json(
        { success: false, message: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    // Format response
    const formattedAppointment = {
      _id: updatedAppointment._id?.toString() || '',
      patient: updatedAppointment.patient
        ? {
            _id: updatedAppointment.patient._id?.toString() || '',
            firstName: updatedAppointment.patient.firstName || '',
            lastName: updatedAppointment.patient.lastName || '',
            email: updatedAppointment.patient.email || '',
            phone: updatedAppointment.patient.phone || '',
            nic: updatedAppointment.patient.nic || '',
            dateOfBirth: updatedAppointment.patient.dateOfBirth || null,
            gender: updatedAppointment.patient.gender || '',
            address: updatedAppointment.patient.address || null,
          }
        : null,
      doctor: updatedAppointment.doctor?.toString() || '',
      pharmacist: updatedAppointment.pharmacist?.toString() || null,
      appointmentDate: updatedAppointment.appointmentDate
        ? new Date(updatedAppointment.appointmentDate)
            .toISOString()
            .split('T')[0]
        : '',
      appointmentTime: updatedAppointment.appointmentTime || '',
      duration: updatedAppointment.duration || 30,
      type: updatedAppointment.type || '',
      status: updatedAppointment.status || 'SCHEDULED',
      reason: updatedAppointment.reason || '',
      symptoms: updatedAppointment.symptoms || '',
      diagnosis: updatedAppointment.diagnosis || '',
      prescription: updatedAppointment.prescription || '',
      notes: updatedAppointment.notes || '',
      createdAt: updatedAppointment.createdAt || null,
      updatedAt: updatedAppointment.updatedAt || null,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment updated successfully',
        data: formattedAppointment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('=== ERROR IN PATCH /api/appointments/[id] ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update appointment',
        error:
          process.env.NODE_ENV === 'development'
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete appointment
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Ensure models are loaded
    if (!Appointment) {
      Appointment = require('@/models/Appointment').default;
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    // Check if appointment exists and user has access
    const existingAppointment = await Appointment.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify user has access
    const doctorId = existingAppointment.doctor?.toString();
    const pharmacistId = existingAppointment.pharmacist?.toString();
    const userId = session.user.id;

    if (doctorId !== userId && pharmacistId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to this appointment' },
        { status: 403 }
      );
    }

    // Soft delete - set isActive to false
    await Appointment.findByIdAndUpdate(id, {
      isActive: false,
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('=== ERROR IN DELETE /api/appointments/[id] ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to delete appointment',
        error:
          process.env.NODE_ENV === 'development'
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
