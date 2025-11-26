/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const serviceType = searchParams.get('serviceType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const doctorId = session.user.id;

    const query: any = {
      doctor: doctorId,
      isActive: true,
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.appointmentDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // Service type filter
    if (serviceType && serviceType !== 'all') {
      query.serviceType = serviceType;
    }

    // Search filter (by patient name)
    if (search) {
      // We'll handle this after population since we need to search in patient data
    }

    const skip = (page - 1) * limit;

    // First, get appointments without search to count
    const appointmentsQuery = Appointment.find(query)
      .populate({
        path: 'patient',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone dateOfBirth gender',
        },
      })
      .populate('doctor', 'name address phone')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    let appointments = await appointmentsQuery.lean();

    if (search) {
      const searchLower = search.toLowerCase();
      appointments = appointments.filter(apt => {
        const patient: any = apt.patient;
        return (
          patient?.userId?.firstName?.toLowerCase().includes(searchLower) ||
          patient?.userId?.lastName?.toLowerCase().includes(searchLower) ||
          patient?.userId?.email?.toLowerCase().includes(searchLower) ||
          patient?.medicalRecordNumber?.toLowerCase().includes(searchLower)
        );
      });
    }

    const totalQuery = Appointment.countDocuments(query);
    let total = await totalQuery;

    if (search) {
      total = appointments.length;
      appointments = appointments.slice(skip, skip + limit);
    }

    return NextResponse.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'patient',
      'pharmacy',
      'appointmentDate',
      'appointmentTime',
      'serviceType',
      'reason',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const appointmentData = {
      ...body,
      doctor: session.user.id,
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    await appointment.populate([
      {
        path: 'patient',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone dateOfBirth gender',
        },
      },
      {
        path: 'pharmacy',
        select: 'name address phone',
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: appointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
