/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

// Helper function to serialize product data for public users
const serializeProductForUser = (product: any) => {
  const productObj = product.toObject ? product.toObject() : product;

  return {
    id: productObj._id?.toString(),
    name: productObj.name,
    description: productObj.description,
    price: productObj.price,
    category: productObj.category,
    image: productObj.image,
    inStock: productObj.inStock,
    stockQuantity: productObj.stockQuantity,
    manufacturer: productObj.manufacturer,
    requiresPrescription: productObj.requiresPrescription,
    sku: productObj.sku,
    pharmacy: productObj.pharmacy
      ? {
          id: productObj.pharmacy._id?.toString(),
          name: productObj.pharmacy.name,
          address: productObj.pharmacy.address,
          contact: productObj.pharmacy.contact,
        }
      : null,
    // Add calculated fields
    availableQuantity:
      productObj.stockQuantity - (productObj.reservedQuantity || 0),
    isLowStock:
      productObj.stockQuantity - (productObj.reservedQuantity || 0) <=
      (productObj.minStockLevel || 10),
    createdAt: productObj.createdAt,
    updatedAt: productObj.updatedAt,
  };
};

// GET - Fetch a single product by ID for public users (no authentication required)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    console.log('🚀 Single product endpoint hit!');

    await connectDB();

    const { id } = await context.params;

    console.log('🔍 Fetching product with ID:', id);
    console.log('📝 ID type:', typeof id);
    console.log('📏 ID length:', id?.length);

    // Validate MongoDB ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid ID format');
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Invalid product ID',
        error: 'The provided ID is not a valid format',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    console.log('✅ ID format valid, querying database...');

    // Find product and populate pharmacy info
    const product = await Product.findById(id)
      .populate('pharmacy', 'name address contact')
      .lean();

    console.log('📦 Product found:', product ? 'Yes' : 'No');

    if (product) {
      console.log('📋 Product name:', product.name);
    }

    // Check if product exists
    if (!product) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Product not found',
        error: 'No product found with the provided ID',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if product is available for public viewing
    // Note: We still return the product even if out of stock,
    // but users can see it's unavailable
    const serializedProduct = serializeProductForUser(product);

    const response: ApiResponse<any> = {
      success: true,
      data: serializedProduct,
      message: 'Product fetched successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching product for user:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to fetch product',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
