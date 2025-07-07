import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return new Response("Invalid token", { status: 400 });

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gte: new Date(),
      },
    },
  });

  if (!user) return new Response("Token expired or invalid", { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return new Response("Email verified", { status: 200 });
}
