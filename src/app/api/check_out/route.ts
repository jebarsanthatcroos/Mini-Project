// app/api/check_out/route.ts
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/order';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Types } from 'mongoose';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutData {
  items: CartItem[];
  total: number;
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: string;
  pharmacyId?: string;
}

// SIMPLE order number generator (use this instead of static method)
function generateSimpleOrderNumber(): string {
  const now = new Date();
  const timestamp = now.getTime();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random.toString().padStart(4, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CheckoutData = await request.json();

    console.log('Checkout request received');
    console.log('Items:', body.items?.length);
    console.log('Total:', body.total);

    // Validation
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!body.shippingAddress || !body.shippingAddress.name) {
      return NextResponse.json(
        { success: false, message: 'Shipping address is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify stock availability
    for (const item of body.items) {
      const product = await Product.findById(item._id);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product ${item.name} not found`,
          },
          { status: 404 }
        );
      }

      if (!product.inStock || product.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${item.name}`,
          },
          { status: 400 }
        );
      }
    }

    // Generate order number using simple function
    const orderNumber = generateSimpleOrderNumber();

    // If you have a default pharmacy, use it
    const defaultPharmacyId = '65a1b2c3d4e5f67890123456'; // Replace with actual default pharmacy ID

    // Create order - SIMPLIFIED VERSION
    const orderData = {
      orderNumber,
      customer: new Types.ObjectId(session.user.id),
      pharmacy: body.pharmacyId
        ? new Types.ObjectId(body.pharmacyId)
        : new Types.ObjectId(defaultPharmacyId),
      items: body.items.map(item => ({
        product: new Types.ObjectId(item._id),
        quantity: item.quantity,
        price: item.price,
        prescriptionVerified: false,
      })),
      totalAmount: body.total,
      paymentMethod:
        body.paymentMethod === 'Cash on Delivery'
          ? 'cash'
          : body.paymentMethod === 'Credit Card'
            ? 'card'
            : 'cash',
      paymentStatus: 'pending',
      deliveryAddress: `${body.shippingAddress.address}, ${body.shippingAddress.city}, ${body.shippingAddress.postalCode}`,
      createdBy: new Types.ObjectId(session.user.id),
      status: 'pending',
    };

    console.log(
      'Creating order with data:',
      JSON.stringify(orderData, null, 2)
    );

    const order = await Order.create(orderData);

    // Update product stock quantities
    for (const item of body.items) {
      await Product.findByIdAndUpdate(item._id, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    console.log(`✅ Order created successfully: ${order.orderNumber}`);

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        total: order.totalAmount,
        items: order.items.length,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Checkout error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);

    // More detailed error logging
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: errors,
        },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return NextResponse.json(
        {
          success: false,
          message: 'Order number already exists. Please try again.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process checkout',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(orderId)
      .populate('customer', 'name email')
      .populate('pharmacy', 'name address')
      .populate('items.product', 'name price images');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('❌ Error fetching order:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch order',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
