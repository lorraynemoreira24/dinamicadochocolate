import React from "react";
import { X, BookOpen } from "lucide-react";
import { NIBO_VALUES } from "../data/niboValues";

interface ValuesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValuesGuideModal: React.FC<ValuesGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-xl border border-stone-200 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-stone-900 flex items-center justify-center text-xl shrink-0 border border-amber-200">
            📖
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Os 9 Valores Oficiais da Nibo</h2>
            <p className="text-xs text-stone-500">Guia oficial da Dinâmica do Chocolate</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {NIBO_VALUES.map((val) => (
            <div
              key={val.id}
              className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/60 flex items-start gap-3.5 hover:bg-white hover:border-amber-400 transition-all shadow-2xs"
            >
              <span className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                {val.id}
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-stone-900 text-sm">{val.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{val.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
