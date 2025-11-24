import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import Order from '@/models/order';
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';



export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await Order.findById(params.id)
      .populate('customer', 'name email phone')
      .populate('pharmacy', 'name address phone')
      .populate('items.product', 'name price image requiresPrescription')
      .populate('createdBy', 'name email');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, paymentStatus, driver, estimatedDelivery, notes } = body;

    const order = await Order.findByIdAndUpdate(
      params.id,
      {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(driver && { driver }),
        ...(estimatedDelivery && { estimatedDelivery }),
        ...(notes && { notes }),
        updatedBy: session.user.id
      },
      { new: true, runValidators: true }
    )
      .populate('customer', 'name email phone')
      .populate('pharmacy', 'name address phone')
      .populate('items.product', 'name price image requiresPrescription');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}