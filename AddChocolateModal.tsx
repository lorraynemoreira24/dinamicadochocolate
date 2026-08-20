import React, { useState } from "react";
import { X, Check, AlertCircle, Plus } from "lucide-react";
import { NIBO_VALUES } from "../data/niboValues";
import { ChocolateEntry, MeetingEdition } from "../types";

interface AddChocolateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<ChocolateEntry, "id" | "order" | "createdAt" | "status">) => void;
  editions: MeetingEdition[];
  selectedEditionId: string;
}

export const AddChocolateModal: React.FC<AddChocolateModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [giver, setGiver] = useState("");
  const [receiver, setReceiver] = useState("");
  const [selectedValues, setSelectedValues] = useState<number[]>([1]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const toggleValue = (id: number) => {
    if (selectedValues.includes(id)) {
      if (selectedValues.length === 1) return;
      setSelectedValues(selectedValues.filter((v) => v !== id));
    } else {
      setSelectedValues([...selectedValues, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giver.trim()) {
      setError("Por favor, informe quem está dando o chocolate (De).");
      return;
    }
    if (!receiver.trim()) {
      setError("Por favor, informe quem receberá o chocolate (Para).");
      return;
    }
    if (selectedValues.length === 0) {
      setError("Selecione pelo menos um valor Nibo.");
      return;
    }

    onAdd({
      giver: giver.trim(),
      receiver: receiver.trim(),
      valueIds: selectedValues,
      notes: notes.trim(),
    });

    setGiver("");
    setReceiver("");
    setNotes("");
    setSelectedValues([1]);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-xl border border-stone-200 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-stone-900 flex items-center justify-center text-xl shrink-0 border border-amber-200">
            🍫
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Novo Chocolate Nibo</h2>
            <p className="text-xs text-stone-500">
              Cadastre um reconhecimento para entrar na dinâmica
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                De: (Seu Nome) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Larissa Teixeira"
                value={giver}
                onChange={(e) => { setGiver(e.target.value); setError(""); }}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Para: (Quem recebe) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Roberto Rocha ou Time Todo"
                value={receiver}
                onChange={(e) => { setReceiver(e.target.value); setError(""); }}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Values Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Valores Nibo Representados: <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-stone-400 font-medium">
                {selectedValues.length} selecionado{selectedValues.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto p-1.5 bg-stone-50/80 border border-stone-200/80 rounded-xl">
              {NIBO_VALUES.map((val) => {
                const isSelected = selectedValues.includes(val.id);
                return (
                  <button
                    type="button"
                    key={val.id}
                    onClick={() => toggleValue(val.id)}
                    className={`w-full p-2.5 rounded-lg text-xs text-left transition-all border flex items-center justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-stone-900 text-amber-300 border-stone-900 font-semibold shadow-xs"
                        : "bg-white text-stone-700 border-stone-200/80 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected ? "bg-amber-400 text-stone-950" : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {val.id}
                      </span>
                      <span className="leading-snug break-words">{val.title}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Motivo / Mensagem de Reconhecimento (Opcional):
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Mandou super bem no fechamento do mês, sempre solícito e com sorriso no rosto..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white focus:outline-none transition-all resize-none"
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
              Salvar Chocolate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
