import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 50) {
      return Response.json(
        { message: "Name must be between 2 and 50 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { message: "User already exists with this email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword 
    });

    const userWithoutPassword = user.toJSON();

    return Response.json(
      { 
        message: "User created successfully", 
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Registration error:", error);
    
    if (error.code === 11000) {
      return Response.json(
        { message: "User already exists with this email" },
        { status: 409 }
      );
    }
    
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}