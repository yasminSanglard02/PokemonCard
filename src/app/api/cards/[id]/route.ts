import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getCard(id: string, userId: string) {
  return prisma.card.findFirst({ where: { id, userId } });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params;

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const card = await getCard(id, session.id);
  if (!card) return NextResponse.json({ error: "Card não encontrado." }, { status: 404 });

  return NextResponse.json(card);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
 
  const { id } = await params;

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const card = await getCard(id, session.id);
  if (!card) return NextResponse.json({ error: "Card não encontrado." }, { status: 404 });

  try {
    const { name, type, hp, attack, description, imageUrl, rarity } = await req.json();
    const updated = await prisma.card.update({
      where: { id: id },
      data: { name, type, hp: Number(hp), attack, description, imageUrl, rarity },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar card." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const card = await getCard(id, session.id);
  if (!card) return NextResponse.json({ error: "Card não encontrado." }, { status: 404 });

  await prisma.card.delete({ where: { id: id } });
  return NextResponse.json({ message: "Card excluído." });
}