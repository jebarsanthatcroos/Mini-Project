import NextAuth, { NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "./mongodb";
import UserModel, { UserRole } from "@/models/User";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
      phone?: string;
      department?: string;
      specialization?: string;
      licenseNumber?: string;
      address?: string;
      bio?: string;
      isActive?: boolean;
      lastLogin?: Date;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
    phone?: string;
    department?: string;
    specialization?: string;
    licenseNumber?: string;
    address?: string;
    bio?: string;
    isActive?: boolean;
    lastLogin?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    role?: UserRole;
    phone?: string;
    department?: string;
    specialization?: string;
    licenseNumber?: string;
    address?: string;
    bio?: string;
    isActive?: boolean;
    lastLogin?: Date;
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await connectDB();

          // Find user by email
          const user = await UserModel.findOne({ 
            email: credentials.email.toLowerCase(),
            isActive: true 
          }).select('+password');

          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Check if user has a password (OAuth users might not have one)
          if (!user.password) {
            throw new Error("Please sign in with your social account");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          await UserModel.findByIdAndUpdate(user._id, { 
            lastLogin: new Date() 
          });

        
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            phone: user.phone,
            department: user.department,
            specialization: user.specialization,
            licenseNumber: user.licenseNumber,
            address: user.address,
            bio: user.bio,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error("Authentication failed");
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.department = user.department;
        token.specialization = user.specialization;
        token.licenseNumber = user.licenseNumber;
        token.address = user.address;
        token.bio = user.bio;
        token.isActive = user.isActive;
        token.lastLogin = user.lastLogin;

        // For OAuth providers, we might need to create/update user in database
        if (account?.provider !== "credentials") {
          try {
            await connectDB();
            
            let dbUser = await UserModel.findOne({ email: user.email });
            
            if (!dbUser) {
              dbUser = await UserModel.create({
                name: user.name,
                email: user.email,
                image: user.image,
                role: "USER", 
                isActive: true,
                emailVerified: new Date(),
                lastLogin: new Date(),
              });
            } else {
              await UserModel.findByIdAndUpdate(dbUser._id, {
                lastLogin: new Date(),
                image: user.image,
                name: user.name,
              });
            }
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.phone = dbUser.phone;
            token.department = dbUser.department;
            token.specialization = dbUser.specialization;
            token.licenseNumber = dbUser.licenseNumber;
            token.address = dbUser.address;
            token.bio = dbUser.bio;
            token.isActive = dbUser.isActive;
            token.lastLogin = dbUser.lastLogin;
          } catch (error) {
            console.error("OAuth user creation error:", error);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.picture,
          role: token.role,
          phone: token.phone,
          department: token.department,
          specialization: token.specialization,
          licenseNumber: token.licenseNumber,
          address: token.address,
          bio: token.bio,
          isActive: token.isActive,
          lastLogin: token.lastLogin,
        };
        session.accessToken = token.accessToken;
      }

      return session;
    },
    async signIn({ user, account}) {
      try {
        
        if (account?.provider === "credentials") {
          return true;
        }

        if (account?.provider === "google" && user.email) {
          await connectDB();
          
          const dbUser = await UserModel.findOne({ 
            email: user.email,
            isActive: true 
          });

          if (!dbUser) {
            return true; 
          }

          return true;
        }

        return false;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);