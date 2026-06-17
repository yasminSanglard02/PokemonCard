import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const cards = await prisma.card.findMany({
    where: {
      userId: session.id,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const { name, type, hp, attack, description, imageUrl, rarity } = await req.json();

    if (!name || !type || !hp || !attack || !description || !imageUrl || !rarity) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    const card = await prisma.card.create({
      data: { name, type, hp: Number(hp), attack, description, imageUrl, rarity, userId: session.id },
    });

    return NextResponse.json(card, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar card." }, { status: 500 });
  }
}