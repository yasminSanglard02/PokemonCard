"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardFormData, PokemonType, Rarity } from "@/types";

const TYPES: PokemonType[] = [
  "Fire","Water","Grass","Electric","Psychic","Ice","Dragon",
  "Dark","Steel","Normal","Fighting","Flying","Poison","Ground",
  "Rock","Bug","Ghost","Fairy",
];
const RARITIES: Rarity[] = ["Common","Uncommon","Rare","Ultra Rare"];

const TYPE_COLORS: Record<string, string> = {
  Fire:"bg-orange-500",Water:"bg-blue-500",Grass:"bg-green-500",
  Electric:"bg-yellow-400",Psychic:"bg-pink-500",Ice:"bg-cyan-400",
  Dragon:"bg-indigo-600",Dark:"bg-gray-700",Steel:"bg-slate-400",
  Normal:"bg-gray-500",Fighting:"bg-red-700",Flying:"bg-sky-400",
  Poison:"bg-purple-600",Ground:"bg-amber-600",Rock:"bg-stone-500",
  Bug:"bg-lime-600",Ghost:"bg-violet-700",Fairy:"bg-rose-400",
};

const RARITY_COLORS: Record<string, string> = {
  Common:"text-gray-400",Uncommon:"text-green-400",
  Rare:"text-blue-400","Ultra Rare":"text-yellow-400",
};

const EMPTY: CardFormData = {
  name:"", type:"Fire", hp:100, attack:"", description:"", imageUrl:"", rarity:"Common",
};

export default function Dashboard() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [form, setForm] = useState<CardFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/cards${search ? `?search=${encodeURIComponent(search)}` : ""}`);
    if (res.status === 401) { router.push("/login"); return; }
    setCards(await res.json());
    setLoading(false);
  }, [search, router]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  function openCreate() {
    setEditingCard(null);
    setForm(EMPTY);
    setError("");
    setShowModal(true);
  }

  function openEdit(card: Card) {
    setEditingCard(card);
    setForm({ name:card.name, type:card.type, hp:card.hp, attack:card.attack,
               description:card.description, imageUrl:card.imageUrl, rarity:card.rarity });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setError("");
    if (!form.name || !form.attack || !form.description || !form.imageUrl) {
      setError("Preencha todos os campos."); return;
    }
    setSaving(true);
    const url = editingCard ? `/api/cards/${editingCard.id}` : "/api/cards";
    const method = editingCard ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { setShowModal(false); fetchCards(); }
    else { const d = await res.json(); setError(d.error); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este card?")) return;
    await fetch(`/api/cards/${id}`, { method:"DELETE" });
    fetchCards();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method:"POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🃏</span>
          <h1 className="text-xl font-bold text-white">Pokémon Cards</h1>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition">
          Sair
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition"
          />
          <button
            onClick={openCreate}
            className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6 py-2.5 rounded-lg transition whitespace-nowrap"
          >
            + Novo Card
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Carregando...</div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">📭</span>
            <p className="text-gray-400 mt-4">
              {search ? "Nenhum card encontrado." : "Você ainda não tem cards. Crie o primeiro!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cards.map((card) => (
              <div key={card.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition group">
                <div className="relative h-44 bg-gray-800 overflow-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=?"; }}
                  />
                  <span className={`absolute top-2 left-2 text-xs text-white font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[card.type] ?? "bg-gray-600"}`}>
                    {card.type}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-white text-lg leading-tight">{card.name}</h2>
                    <span className="text-xs text-gray-400 shrink-0">HP {card.hp}</span>
                  </div>
                  <p className="text-yellow-400 text-xs font-medium mt-1">⚡ {card.attack}</p>
                  <p className="text-gray-400 text-xs mt-2 line-clamp-2">{card.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-xs font-semibold ${RARITY_COLORS[card.rarity]}`}>
                      ★ {card.rarity}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(card)} className="text-xs text-gray-400 hover:text-white transition">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(card.id)} className="text-xs text-red-500 hover:text-red-400 transition">
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingCard ? "Editar Card" : "Novo Card"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition text-xl">
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label:"Nome do Pokémon", key:"name", type:"text", placeholder:"Ex: Pikachu" },
                { label:"Ataque Principal", key:"attack", type:"text", placeholder:"Ex: Thunderbolt" },
                { label:"URL da Imagem", key:"imageUrl", type:"url", placeholder:"https://..." },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-400 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof CardFormData] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as PokemonType })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition"
                  >
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">HP</label>
                  <input
                    type="number"
                    min={1} max={999}
                    value={form.hp}
                    onChange={(e) => setForm({ ...form, hp: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Raridade</label>
                <select
                  value={form.rarity}
                  onChange={(e) => setForm({ ...form, rarity: e.target.value as Rarity })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition"
                >
                  {RARITIES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descreva o Pokémon..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold py-2.5 rounded-lg transition"
              >
                {saving ? "Salvando..." : editingCard ? "Salvar" : "Criar Card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}