import React, { useState } from "react";
import { Search, Heart, MessageSquareQuote, Filter, Gift, Calendar, Plus } from "lucide-react";
import { ChocolateEntry, NiboValue, MeetingEdition } from "../types";

interface MuralViewProps {
  entries: ChocolateEntry[];
  niboValues: NiboValue[];
  editions: MeetingEdition[];
  selectedEditionId: string;
  onSelectEdition: (editionId: string) => void;
  onOpenAddModal: () => void;
}

export const MuralView: React.FC<MuralViewProps> = ({
  entries,
  niboValues,
  editions,
  selectedEditionId,
  onSelectEdition,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState<number | "all">("all");

  const filteredEntries = entries.filter((entry) => {
    const matchesEdition =
      selectedEditionId === "all" ||
      !entry.editionId ||
      entry.editionId === selectedEditionId;

    const matchesSearch =
      entry.giver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesValue =
      selectedValue === "all" || entry.valueIds.includes(selectedValue);

    return matchesEdition && matchesSearch && matchesValue;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2.5">
            <span>Mural dos Chocolates</span>
            <span className="text-2xl">🍫</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Celebre e releia todas as homenagens e carinhos compartilhados pelo time Nibo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Edition / Month Selector */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedEditionId}
              onChange={(e) => onSelectEdition(e.target.value)}
              className="text-xs font-semibold bg-transparent text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Reuniões</option>
              {editions.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.monthYear} {ed.status === "active" ? "(Ativa)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar no mural..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 placeholder-stone-400"
            />
          </div>

          {/* Value Filter */}
          <select
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="py-2 px-3 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium cursor-pointer"
          >
            <option value="all">Todos os Valores</option>
            {niboValues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id} - {v.shortName}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Homenagear
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-2xl p-5 border border-stone-200/90 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
            >
              {/* Header inside card: De -> Para */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center">
                      {entry.giver.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wide">
                        De
                      </span>
                      <span className="font-bold text-xs text-stone-900">{entry.giver}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-amber-700 block uppercase tracking-wide">
                      Para
                    </span>
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1 justify-end">
                      <span>{entry.receiver}</span>
                      <span>🍫</span>
                    </span>
                  </div>
                </div>

                {/* Values recognized badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {entry.valueIds.map((vid) => {
                    const val = niboValues.find((v) => v.id === vid);
                    if (!val) return null;
                    return (
                      <span
                        key={vid}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium inline-flex items-center gap-1 border border-stone-200/80"
                      >
                        <span className="w-3.5 h-3.5 rounded bg-stone-900 text-amber-300 flex items-center justify-center text-[8px] font-bold shrink-0">
                          {val.id}
                        </span>
                        <span>{val.shortName}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Note message */}
                {entry.notes && (
                  <div className="bg-stone-50/80 p-3.5 rounded-xl text-xs text-stone-700 italic border border-stone-100 leading-relaxed">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-stone-400 mb-1" />
                    "{entry.notes}"
                  </div>
                )}
              </div>

              {/* Footer details */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span>Ordem #{entry.order}</span>
                {entry.presentedAt ? (
                  <span className="text-emerald-700 font-medium">Entregue com sucesso ✨</span>
                ) : (
                  <span className="text-amber-700 font-medium">Na fila da reunião 🕒</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
            <p className="font-semibold text-sm">Nenhum chocolate encontrado</p>
            <p className="text-xs text-stone-400 mt-1">
              Ajuste sua busca ou adicione um novo reconhecimento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
