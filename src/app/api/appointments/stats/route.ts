/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(_request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const doctorId = session.user.id;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get this month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Parallel queries for better performance
    const [
      totalAppointments,
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
      scheduledAppointments,
      thisWeekAppointments,
      thisMonthAppointments,
      statusBreakdown,
      typeBreakdown,
    ] = await Promise.all([
      // Total appointments
      Appointment.countDocuments({
        doctor: doctorId,
        isActive: true,
      }),

      // Today's appointments
      Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: today, $lt: tomorrow },
        isActive: true,
      }),

      // Upcoming appointments (future + scheduled/confirmed)
      Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: today },
        status: { $in: ['SCHEDULED', 'CONFIRMED'] },
        isActive: true,
      }),

      // Completed appointments
      Appointment.countDocuments({
        doctor: doctorId,
        status: 'COMPLETED',
        isActive: true,
      }),

      // Cancelled appointments
      Appointment.countDocuments({
        doctor: doctorId,
        status: 'CANCELLED',
        isActive: true,
      }),

      // Scheduled appointments
      Appointment.countDocuments({
        doctor: doctorId,
        status: 'SCHEDULED',
        isActive: true,
      }),

      // This week's appointments
      Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: startOfWeek, $lt: endOfWeek },
        isActive: true,
      }),

      // This month's appointments
      Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: startOfMonth, $lte: endOfMonth },
        isActive: true,
      }),

      // Status breakdown
      Appointment.aggregate([
        {
          $match: {
            doctor: session.user.id,
            isActive: true,
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Type breakdown
      Appointment.aggregate([
        {
          $match: {
            doctor: session.user.id,
            isActive: true,
          },
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format status breakdown
    const statusStats = statusBreakdown.reduce(
      (acc, item) => {
        acc[item._id.toLowerCase()] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Format type breakdown
    const typeStats = typeBreakdown.reduce(
      (acc, item) => {
        acc[item._id.toLowerCase()] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const stats = {
      total: totalAppointments,
      today: todayAppointments,
      upcoming: upcomingAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      scheduled: scheduledAppointments,
      thisWeek: thisWeekAppointments,
      thisMonth: thisMonthAppointments,
      byStatus: {
        scheduled: statusStats.scheduled || 0,
        confirmed: statusStats.confirmed || 0,
        in_progress: statusStats.in_progress || 0,
        completed: statusStats.completed || 0,
        cancelled: statusStats.cancelled || 0,
        no_show: statusStats.no_show || 0,
      },
      byType: {
        consultation: typeStats.consultation || 0,
        follow_up: typeStats.follow_up || 0,
        emergency: typeStats.emergency || 0,
        checkup: typeStats.checkup || 0,
        other: typeStats.other || 0,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching appointment stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch appointment statistics',
      },
      { status: 500 }
    );
  }
}
