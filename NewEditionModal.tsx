import React, { useState } from "react";
import { X, Calendar, Plus, AlertCircle } from "lucide-react";
import { MeetingEdition } from "../types";

interface NewEditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEdition: (edition: MeetingEdition) => void;
}

export const NewEditionModal: React.FC<NewEditionModalProps> = ({
  isOpen,
  onClose,
  onCreateEdition,
}) => {
  const [name, setName] = useState("");
  const [monthYear, setMonthYear] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Por favor informe o título da reunião.");
      return;
    }
    const my = monthYear.trim() || name.trim();
    const newEdition: MeetingEdition = {
      id: `edition-${Date.now()}`,
      name: name.trim(),
      monthYear: my,
      date: date || new Date().toISOString().slice(0, 10),
      status: "active",
    };

    onCreateEdition(newEdition);
    setName("");
    setMonthYear("");
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-stone-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-stone-900 flex items-center justify-center text-xl shrink-0 border border-amber-200">
            <Calendar className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Criar Nova Reunião Mensal</h2>
            <p className="text-xs text-stone-500">
              Inicie uma nova rodada mensal da dinâmica do chocolate.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Título da Reunião: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Reunião Geral Nibo - Setembro/2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Mês / Identificador:
            </label>
            <input
              type="text"
              placeholder="Ex: Setembro/2026"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Data:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Criar Reunião
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
