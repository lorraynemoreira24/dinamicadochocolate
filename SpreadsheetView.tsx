import React, { useState } from "react";
import { Search, Download, Plus, Trash2, Calendar, Mic } from "lucide-react";
import { ChocolateEntry, NiboValue, ChocolateStatus, MeetingEdition } from "../types";

interface SpreadsheetViewProps {
  entries: ChocolateEntry[];
  niboValues: NiboValue[];
  editions: MeetingEdition[];
  selectedEditionId: string;
  onSelectEdition: (editionId: string) => void;
  onOpenAddModal: () => void;
  onUpdateEntryStatus: (id: string, status: ChocolateStatus) => void;
  onDeleteEntry: (id: string) => void;
  onSetSpeaking: (id: string) => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  entries,
  niboValues,
  editions,
  selectedEditionId,
  onSelectEdition,
  onOpenAddModal,
  onUpdateEntryStatus,
  onDeleteEntry,
  onSetSpeaking,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredEntries = entries.filter((entry) => {
    const matchesEdition =
      selectedEditionId === "all" ||
      !entry.editionId ||
      entry.editionId === selectedEditionId;

    const matchesSearch =
      entry.giver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.receiver.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || entry.status === statusFilter;

    return matchesEdition && matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["Ordem", "De", "Para", "Valores Nibo", "Status"];
    const rows = filteredEntries.map((e) => {
      const vals = e.valueIds.map((vid) => `#${vid}`).join(", ");
      return [
        e.order,
        `"${e.giver.replace(/"/g, '""')}"`,
        `"${e.receiver.replace(/"/g, '""')}"`,
        `"${vals}"`,
        e.status,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nibo_chocolates_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Direto & Compacto */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <span>Lista Geral</span>
            <span className="text-xs bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-md font-semibold">
              {filteredEntries.length}
            </span>
          </h2>

          {/* Month / Edition */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedEditionId}
              onChange={(e) => onSelectEdition(e.target.value)}
              className="text-xs font-semibold bg-transparent text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Reuniões</option>
              {editions.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.monthYear}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="fila">Na Fila</option>
            <option value="falando">Falando</option>
            <option value="entregue">Entregue</option>
          </select>

          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Tabela Direta e Limpa */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-stone-50/90 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">De</th>
                <th className="py-3 px-4">Para</th>
                <th className="py-3 px-4">Valores Nibo</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-stone-50/80 transition-colors ${
                      entry.status === "falando" ? "bg-amber-50/40" : ""
                    }`}
                  >
                    {/* # Ordem */}
                    <td className="py-3 px-4 text-center font-bold text-stone-400">
                      {entry.order}
                    </td>

                    {/* De */}
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {entry.giver}
                    </td>

                    {/* Para */}
                    <td className="py-3 px-4 font-bold text-stone-900">
                      <span className="inline-flex items-center gap-1">
                        <span>{entry.receiver}</span>
                        <span className="text-xs">🍫</span>
                      </span>
                    </td>

                    {/* Valores Nibo Compactos */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {entry.valueIds.map((vid) => {
                          const val = niboValues.find((v) => v.id === vid);
                          return (
                            <span
                              key={vid}
                              title={val?.title || `Valor ${vid}`}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-medium inline-flex items-center gap-1 border border-stone-200"
                            >
                              <span className="w-3.5 h-3.5 rounded bg-stone-900 text-amber-300 text-[9px] font-bold flex items-center justify-center">
                                {vid}
                              </span>
                              <span className="text-stone-600">{val?.shortName || `Val. ${vid}`}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Status Direto */}
                    <td className="py-3 px-4">
                      <select
                        value={entry.status}
                        onChange={(e) =>
                          onUpdateEntryStatus(
                            entry.id,
                            e.target.value as ChocolateStatus
                          )
                        }
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          entry.status === "falando"
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : entry.status === "entregue"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-stone-50 text-stone-700 border-stone-200"
                        }`}
                      >
                        <option value="fila">🕒 Na Fila</option>
                        <option value="falando">🎙️ Falando</option>
                        <option value="entregue">✨ Entregue</option>
                      </select>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {entry.status !== "falando" && (
                          <button
                            onClick={() => onSetSpeaking(entry.id)}
                            title="Colocar no microfone"
                            className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Mic className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          title="Excluir"
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400 text-xs">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
