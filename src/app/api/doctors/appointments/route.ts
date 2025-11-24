// ========================================
// FILE 3: app/api/doctor/appointments/route.ts
// ========================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { Types } from "mongoose";

interface PatientData {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
}

interface AppointmentData {
  id: string;
  patient: PatientData;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  reason: string;
  symptoms?: string;
  notes?: string;
  room?: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

function transformAppointment(appointment: any): AppointmentData {
  let patient: PatientData;
  
  if (appointment.patient && typeof appointment.patient === 'object') {
    patient = {
      _id: appointment.patient._id || new Types.ObjectId(),
      name: appointment.patient.name || 'Unknown Patient',
      email: appointment.patient.email || '',
      phone: appointment.patient.phone || '',
      dateOfBirth: appointment.patient.dateOfBirth || '',
      gender: appointment.patient.gender || 'unknown'
    };
  } else {
    patient = {
      _id: new Types.ObjectId(),
      name: 'Unknown Patient',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'unknown'
    };
  }

  return {
    id: appointment._id?.toString() || new Types.ObjectId().toString(),
    patient,
    date: appointment.date?.toISOString() || new Date().toISOString(),
    time: appointment.time || '00:00',
    duration: appointment.duration || 30,
    type: appointment.type || 'CONSULTATION',
    status: appointment.status || 'SCHEDULED',
    reason: appointment.reason || '',
    symptoms: appointment.symptoms,
    notes: appointment.notes,
    room: appointment.room,
    priority: appointment.priority || 'MEDIUM',
    createdAt: appointment.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: appointment.updatedAt?.toISOString() || new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;
    const filter: any = { doctor: new Types.ObjectId(session.user.id) };

    if (status && status !== 'ALL') filter.status = status;
    if (type && type !== 'ALL') filter.type = type;
    
    if (date && date !== 'ALL') {
      if (date === 'UPCOMING') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filter.date = { $gte: today };
      } else {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);
        filter.date = { $gte: targetDate, $lt: nextDate };
      }
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone dateOfBirth gender')
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Appointment.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const transformedAppointments = appointments.map(transformAppointment);

    return NextResponse.json({
      appointments: transformedAppointments,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
    });

  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { patientId, date, time, duration, type, reason, symptoms, notes, priority, room } = body;

    if (!patientId || !date || !time || !reason) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const appointment = new Appointment({
      patient: new Types.ObjectId(patientId),
      doctor: new Types.ObjectId(session.user.id),
      date: new Date(date),
      time,
      duration: duration || 30,
      type: type || "CONSULTATION",
      reason,
      symptoms,
      notes,
      priority: priority || "MEDIUM",
      room,
      status: "SCHEDULED"
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone dateOfBirth gender')
      .lean();

    if (!populatedAppointment) {
      return NextResponse.json({ error: "Appointment not found after creation" }, { status: 500 });
    }

    const transformedAppointment = transformAppointment(populatedAppointment);

    return NextResponse.json({
      message: "Appointment created successfully",
      appointment: transformedAppointment
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}

