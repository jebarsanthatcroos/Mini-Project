import { connectDB } from "@/lib/mongodb";
import User, { UserRole } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { 
      name, 
      email, 
      password, 
      role = "USER", 
      phone, 
      department, 
      specialization 
    } = await req.json();

    // Validation
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

    // Validate role
    const validRoles: UserRole[] = [
      "ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", 
      "LABTECH", "PHARMACIST", "STAFF", "PATIENT", "USER"
    ];
    
    if (!validRoles.includes(role as UserRole)) {
      return Response.json(
        { message: "Invalid role specified" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { message: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role as UserRole,
      phone,
      department,
      specialization
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