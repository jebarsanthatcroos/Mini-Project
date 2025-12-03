import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      'notificationPreferences'
    );

    const defaultPreferences = {
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      appointmentReminders: true,
      messageAlerts: true,
      systemUpdates: true,
      marketingEmails: false,
    };

    return NextResponse.json({
      success: true,
      data: user?.notificationPreferences || defaultPreferences,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const preferences = await request.json();

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: { notificationPreferences: preferences },
      },
      { new: true }
    ).select('notificationPreferences');

    return NextResponse.json({
      success: true,
      data: user?.notificationPreferences,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
