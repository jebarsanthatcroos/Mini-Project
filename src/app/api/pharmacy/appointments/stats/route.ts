import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pharmacistId = session.user.id;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total appointments
    const total = await Appointment.countDocuments({
      pharmacist: pharmacistId,
      isActive: true,
    });

    // Get today's appointments
    const todayCount = await Appointment.countDocuments({
      pharmacist: pharmacistId,
      appointmentDate: { $gte: today, $lt: tomorrow },
      isActive: true,
      status: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
    });

    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcoming = await Appointment.countDocuments({
      pharmacist: pharmacistId,
      appointmentDate: { $gte: now, $lte: nextWeek },
      isActive: true,
      status: { $in: ['SCHEDULED', 'CONFIRMED'] },
    });

    // Get status breakdown
    const statusStats = await Appointment.aggregate([
      {
        $match: {
          pharmacist: pharmacistId,
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get service type breakdown
    const serviceStats = await Appointment.aggregate([
      {
        $match: {
          pharmacist: pharmacistId,
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        today: todayCount,
        upcoming,
        statusBreakdown: statusStats,
        serviceBreakdown: serviceStats,
      },
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment statistics' },
      { status: 500 }
    );
  }
}
