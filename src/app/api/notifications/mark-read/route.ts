import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { notificationIds, read } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, error: 'Notification IDs array is required' },
        { status: 400 }
      );
    }

    await connectDB();

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: session.user.id,
      },
      {
        $set: { read },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Notifications marked as ${read ? 'read' : 'unread'}`,
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
