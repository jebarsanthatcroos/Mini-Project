// ============================================
// File: src/app/api/products/user/[id]/route.ts
// WORKING SOLUTION: Extract ID from URL
// ============================================
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    console.log(`🔍 Extracted ID from URL: ${id}`);
    console.log(`📍 Full URL: ${request.url}`);
    console.log(`📍 Path parts:`, pathParts);

    // Validate ID
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      console.error('❌ Product ID is missing or invalid');
      return NextResponse.json(
        {
          success: false,
          message: 'Product ID is missing',
        },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format (24 hex characters)
    if (!Types.ObjectId.isValid(id)) {
      console.error(`❌ Invalid product ID format: ${id}`);
      return NextResponse.json(
        {
          success: false,
          message:
            'Invalid product ID format. Must be a 24 character hex string.',
        },
        { status: 400 }
      );
    }

    console.log(`✅ Valid ID format: ${id}`);

    await connectDB();

    const product = await Product.findById(id);

    if (!product) {
      console.error(`❌ Product not found with ID: ${id}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    console.log(`✅ Found product: ${product.name}`);

    // Convert to plain object with string IDs
    const productObj = product.toObject();
    const transformedProduct = {
      ...productObj,
      _id: productObj._id.toString(),
      pharmacy: productObj.pharmacy?.toString(),
      createdBy: productObj.createdBy?.toString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct,
    });
  } catch (error) {
    console.error('❌ Error fetching product:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch product',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
