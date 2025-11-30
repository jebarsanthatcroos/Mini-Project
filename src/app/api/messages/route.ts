import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { receiverId, content, messageType = 'text' } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { success: false, error: 'Receiver ID and content are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [session.user.id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [session.user.id, receiverId],
      });
    }

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: session.user.id,
      receiverId,
      content,
      messageType,
      read: false,
    });

    // Update conversation's last message and timestamp
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
