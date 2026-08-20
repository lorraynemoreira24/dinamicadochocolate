import React, { useState } from "react";
import { Mic, Table, Trophy, LayoutGrid, Plus, BookOpen, Calendar, ChevronDown, Check } from "lucide-react";
import { MeetingEdition } from "../types";
import { NiboLogo } from "./NiboLogo";

interface HeaderProps {
  currentTab: "stage" | "sheet" | "ranking" | "mural";
  setCurrentTab: (tab: "stage" | "sheet" | "ranking" | "mural") => void;
  editions: MeetingEdition[];
  selectedEditionId: string;
  onSelectEdition: (editionId: string) => void;
  onOpenAddModal: () => void;
  onOpenValuesGuide: () => void;
  onOpenNewEditionModal: () => void;
  activeCount: number;
  completedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  editions,
  selectedEditionId,
  onSelectEdition,
  onOpenValuesGuide,
  onOpenNewEditionModal,
  activeCount,
}) => {
  const [isEditionDropdownOpen, setIsEditionDropdownOpen] = useState(false);

  const selectedEdition = editions.find((e) => e.id === selectedEditionId);
  const currentMonth = selectedEditionId === "all" ? "Todas as Edições" : selectedEdition?.monthYear || selectedEdition?.name;

  return (
    <header className="bg-[#1c1917]/95 backdrop-blur-md text-stone-100 border-b border-stone-800/80 sticky top-0 z-40 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand + Edition Selector */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="flex items-center gap-2.5 shrink-0 cursor-pointer group"
              onClick={() => setCurrentTab("stage")}
              title="Voltar ao Palco"
            >
              <NiboLogo className="h-7 w-7 shrink-0 text-amber-500 transition-transform group-hover:scale-105" withText={false} variant="white" />
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  nibo
                </span>
                <span className="text-amber-400 font-semibold text-xs px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                  Chocolate 🍫
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-4 w-px bg-stone-700/60" />

            {/* Clean Monthly Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsEditionDropdownOpen(!isEditionDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-stone-800/90 hover:bg-stone-700/90 px-3 py-1.5 rounded-lg border border-stone-700 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-medium truncate max-w-[130px] sm:max-w-[200px]">
                  {currentMonth}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400 shrink-0 ml-0.5" />
              </button>

              {isEditionDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsEditionDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-72 bg-stone-900 border border-stone-800 rounded-xl shadow-xl z-40 py-1.5 text-xs overflow-hidden">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-800">
                      Reunião Mensal:
                    </div>

                    <button
                      onClick={() => {
                        onSelectEdition("all");
                        setIsEditionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-stone-800 transition-colors ${
                        selectedEditionId === "all" ? "bg-stone-800 text-amber-400 font-bold" : "text-stone-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>📚</span>
                        <span>Todas as Edições (Histórico Geral)</span>
                      </span>
                      {selectedEditionId === "all" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    <div className="h-px bg-stone-800 my-1" />

                    {editions.map((ed) => {
                      const isSelected = ed.id === selectedEditionId;
                      const isActive = ed.status === "active";
                      return (
                        <button
                          key={ed.id}
                          onClick={() => {
                            onSelectEdition(ed.id);
                            setIsEditionDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-stone-800 transition-colors ${
                            isSelected ? "bg-stone-800 text-amber-400 font-bold" : "text-stone-300"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate font-medium">{ed.name}</p>
                            <p className="text-[10px] text-stone-500">{ed.date}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isActive ? (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Ativa
                              </span>
                            ) : (
                              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                                Concluída
                              </span>
                            )}
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 ml-1" />}
                          </div>
                        </button>
                      );
                    })}

                    <div className="pt-1.5 mt-1 border-t border-stone-800 px-2">
                      <button
                        onClick={() => {
                          setIsEditionDropdownOpen(false);
                          onOpenNewEditionModal();
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-colors text-center"
                      >
                        <Plus className="w-3 h-3 text-amber-400" />
                        <span>+ Nova Reunião Mensal</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center Navigation Tabs - Modern Pill Bar */}
          <nav className="hidden md:flex items-center bg-stone-900/90 p-1 rounded-xl border border-stone-800 shadow-inner">
            <button
              onClick={() => setCurrentTab("stage")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === "stage"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-stone-300 hover:text-white hover:bg-stone-800/60"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Palco & Fila</span>
              {activeCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    currentTab === "stage" ? "bg-stone-950 text-amber-400" : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {activeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab("sheet")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === "sheet"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-stone-300 hover:text-white hover:bg-stone-800/60"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Planilha</span>
            </button>

            <button
              onClick={() => setCurrentTab("ranking")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === "ranking"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-stone-300 hover:text-white hover:bg-stone-800/60"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Ranking & Cultura</span>
            </button>

            <button
              onClick={() => setCurrentTab("mural")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === "mural"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-stone-300 hover:text-white hover:bg-stone-800/60"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Mural</span>
            </button>
          </nav>

          {/* Right Action: 9 Valores Guide */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenValuesGuide}
              title="Guia dos 9 Valores Nibo"
              className="px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800/90 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-semibold">9 Valores Nibo</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between pb-2.5 pt-1 border-t border-stone-800 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => setCurrentTab("stage")}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === "stage" ? "bg-amber-500 text-stone-950" : "text-stone-400"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Palco</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-stone-950 text-amber-400 text-[9px] font-bold">
                {activeCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab("sheet")}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === "sheet" ? "bg-amber-500 text-stone-950" : "text-stone-400"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Planilha</span>
          </button>
          <button
            onClick={() => setCurrentTab("ranking")}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === "ranking" ? "bg-amber-500 text-stone-950" : "text-stone-400"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Ranking</span>
          </button>
          <button
            onClick={() => setCurrentTab("mural")}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === "mural" ? "bg-amber-500 text-stone-950" : "text-stone-400"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Mural</span>
          </button>
        </div>
      </div>
    </header>
  );
};
