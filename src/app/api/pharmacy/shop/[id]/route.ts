import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Shop, { IShop } from '@/models/shop';
import { Types } from 'mongoose';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await connectDB();

    // Await the params Promise
    const { id } = await params;

    console.log('API Route - Received ID:', id);

    if (!id || id === 'undefined' || id === '[id]') {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Shop ID is required',
        error: 'Missing shop ID parameter',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    let shopPost: IShop | null;

    // Try to find by MongoDB ObjectId first
    if (Types.ObjectId.isValid(id)) {
      shopPost = await Shop.findById(id);
    } else {
      // Try to find by custom id field
      shopPost = await Shop.findOne({ id: id });
      if (!shopPost) {
        // Try to find by _id as string
        shopPost = await Shop.findOne({ _id: id });
      }
    }

    if (!shopPost) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Shop not found',
        error: 'No shop found with the provided ID',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: ApiResponse<IShop> = {
      success: true,
      data: shopPost,
      message: 'Shop fetched successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in shop detail API:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to fetch shop',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
