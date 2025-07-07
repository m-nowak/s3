import { sendMail } from "@/lib/mail";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing email or password" }),
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Email already registered" }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = randomUUID();

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
    });

    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

      await sendMail(
        email,
        "Verify your email",
        `<p>Click to verify: <a href="${baseUrl}/verify-email?token=${token}">Verify</a></p>`
      );
    } catch (emailError) {
      console.error("Email failed to send:", emailError);
      // Optionally: rollback user creation if email is critical
    }

    return new Response(JSON.stringify({ message: "User created" }), {
      status: 201,
    });
  } catch (err) {
    console.error("Registration failed:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
