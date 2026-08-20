import React, { useState } from "react";
import { 
  Trophy, 
  Award, 
  Heart, 
  Sparkles, 
  BarChart3, 
  Calendar, 
  Search, 
  ChevronRight, 
  Star,
  Users,
  Flame,
  PieChart as PieIcon,
  Crown
} from "lucide-react";
import { ChocolateEntry, NiboValue, MeetingEdition } from "../types";

interface RankingViewProps {
  entries: ChocolateEntry[];
  niboValues: NiboValue[];
  editions: MeetingEdition[];
  selectedEditionId: string;
  onSelectEdition: (editionId: string) => void;
}

export const RankingView: React.FC<RankingViewProps> = ({
  entries,
  niboValues,
  editions,
  selectedEditionId,
  onSelectEdition,
}) => {
  const [selectedTab, setSelectedTab] = useState<"receivers" | "givers" | "values">("receivers");
  const [activeValueFilter, setActiveValueFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPersonDetails, setSelectedPersonDetails] = useState<{
    name: string;
    type: "receiver" | "giver";
    count: number;
    valueIds?: number[];
    chocolates: ChocolateEntry[];
  } | null>(null);

  // Filter entries according to edition
  const filteredEntries = entries.filter((e) => {
    if (selectedEditionId === "all") return true;
    return !e.editionId || e.editionId === selectedEditionId;
  });

  // Calculate Receivers Ranking
  const receiversMap = new Map<string, { count: number; valueIds: number[]; chocolates: ChocolateEntry[] }>();
  filteredEntries.forEach((e) => {
    const individualReceivers = e.receiver.split(/,| e /i).map((r) => r.trim()).filter(Boolean);
    const targets = individualReceivers.length > 0 ? individualReceivers : [e.receiver];

    targets.forEach((person) => {
      const existing = receiversMap.get(person) || { count: 0, valueIds: [], chocolates: [] };
      existing.count += 1;
      existing.valueIds.push(...e.valueIds);
      existing.chocolates.push(e);
      receiversMap.set(person, existing);
    });
  });

  const receiversRanking = Array.from(receiversMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);

  // Calculate Givers Ranking
  const giversMap = new Map<string, { count: number; chocolates: ChocolateEntry[] }>();
  filteredEntries.forEach((e) => {
    const existing = giversMap.get(e.giver) || { count: 0, chocolates: [] };
    existing.count += 1;
    existing.chocolates.push(e);
    giversMap.set(e.giver, existing);
  });

  const giversRanking = Array.from(giversMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);

  // Calculate Values Distribution
  const valueCounts = niboValues.map((v) => {
    const matchedEntries = filteredEntries.filter((e) => e.valueIds.includes(v.id));
    return {
      value: v,
      count: matchedEntries.length,
      entries: matchedEntries,
    };
  }).sort((a, b) => b.count - a.count);

  const totalValueTags = valueCounts.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const maxCount = Math.max(...valueCounts.map((v) => v.count), 1);

  // Filtered by search
  const displayedReceivers = receiversRanking.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedGivers = giversRanking.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered entries if a value is clicked
  const filteredByValue = activeValueFilter
    ? filteredEntries.filter((e) => e.valueIds.includes(activeValueFilter))
    : [];

  const currentEditionName = selectedEditionId === "all"
    ? "Todas as Reuniões"
    : editions.find((e) => e.id === selectedEditionId)?.monthYear || "Edição Selecionada";

  const totalChocolates = filteredEntries.length;
  const uniqueReceivers = receiversRanking.length;
  const uniqueGivers = giversRanking.length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center text-xl shrink-0 border border-amber-200/80">
            🍫
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide block">
              Total Entregas
            </span>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              {totalChocolates}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl shrink-0 border border-purple-200/80">
            <Award className="w-5 h-5 text-purple-700" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide block">
              Homenageados
            </span>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              {uniqueReceivers} <span className="text-xs font-normal text-stone-500">pessoas</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center text-xl shrink-0 border border-rose-200/80">
            <Heart className="w-5 h-5 text-rose-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide block">
              Quem Doou
            </span>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              {uniqueGivers} <span className="text-xs font-normal text-stone-500">pessoas</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl shrink-0 border border-emerald-200/80">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide block">
              Valor Mais Vivido
            </span>
            <p className="text-sm font-bold text-stone-900 truncate leading-tight mt-0.5" title={valueCounts[0]?.value ? `#${valueCounts[0].value.id} - ${valueCounts[0].value.title}` : "—"}>
              {valueCounts[0]?.value ? `#${valueCounts[0].value.id}` : "—"}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {valueCounts[0]?.count || 0} citações
            </span>
          </div>
        </div>
      </div>

      {/* Main Header & Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              Ranking & Cultura Nibo
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Métricas de reconhecimento e vivência dos 9 Valores ({currentEditionName}).
          </p>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Monthly Edition Select */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
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

          {/* Tab Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => { setSelectedTab("receivers"); setSearchTerm(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === "receivers"
                  ? "bg-white text-stone-950 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Mais Reconhecidos</span>
            </button>
            <button
              onClick={() => { setSelectedTab("givers"); setSearchTerm(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === "givers"
                  ? "bg-white text-stone-950 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Quem Mais Doou</span>
            </button>
            <button
              onClick={() => { setSelectedTab("values"); setSearchTerm(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === "values"
                  ? "bg-white text-stone-950 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Valores Nibo</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: MAIS RECONHECIDOS (RECEIVERS) */}
      {selectedTab === "receivers" && (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          {receiversRanking.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              {receiversRanking[1] ? (
                <div 
                  onClick={() => setSelectedPersonDetails({
                    name: receiversRanking[1].name,
                    type: "receiver",
                    count: receiversRanking[1].count,
                    valueIds: receiversRanking[1].valueIds,
                    chocolates: receiversRanking[1].chocolates,
                  })}
                  className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-sm flex flex-col items-center text-center relative order-2 md:order-1 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <span className="w-7 h-7 rounded-full bg-stone-200 text-stone-800 font-black text-xs flex items-center justify-center mb-2.5">
                    2º
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 text-sm font-bold flex items-center justify-center mb-2 border border-stone-200 group-hover:scale-105 transition-transform">
                    {receiversRanking[1].name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm truncate max-w-full">
                    {receiversRanking[1].name}
                  </h3>
                  <div className="mt-2 text-xs font-semibold text-amber-900 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/80">
                    {receiversRanking[1].count} {receiversRanking[1].count === 1 ? "chocolate" : "chocolates"} 🍫
                  </div>
                  <span className="text-[10px] text-stone-400 mt-2">Clique para ver detalhes →</span>
                </div>
              ) : <div className="hidden md:block order-2 md:order-1" />}

              {/* 1st Place */}
              {receiversRanking[0] && (
                <div 
                  onClick={() => setSelectedPersonDetails({
                    name: receiversRanking[0].name,
                    type: "receiver",
                    count: receiversRanking[0].count,
                    valueIds: receiversRanking[0].valueIds,
                    chocolates: receiversRanking[0].chocolates,
                  })}
                  className="bg-gradient-to-b from-amber-50/70 via-white to-white rounded-2xl p-6 border-2 border-amber-300 shadow-md flex flex-col items-center text-center relative order-1 md:order-2 transform md:-translate-y-2 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
                    <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Líder de Reconhecimentos</span>
                  </div>
                  <span className="w-9 h-9 rounded-full bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center my-2 shadow-xs">
                    1º
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-stone-900 text-amber-400 text-base font-bold flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                    {receiversRanking[0].name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-stone-900 text-base truncate max-w-full">
                    {receiversRanking[0].name}
                  </h3>
                  <div className="mt-2 text-xs font-bold text-stone-950 bg-amber-400 px-4 py-1.5 rounded-xl shadow-xs">
                    {receiversRanking[0].count} {receiversRanking[0].count === 1 ? "chocolate" : "chocolates"} 🍫
                  </div>
                  <span className="text-[10px] text-stone-500 mt-2">Clique para ver mensagens e valores →</span>
                </div>
              )}

              {/* 3rd Place */}
              {receiversRanking[2] ? (
                <div 
                  onClick={() => setSelectedPersonDetails({
                    name: receiversRanking[2].name,
                    type: "receiver",
                    count: receiversRanking[2].count,
                    valueIds: receiversRanking[2].valueIds,
                    chocolates: receiversRanking[2].chocolates,
                  })}
                  className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-sm flex flex-col items-center text-center relative order-3 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center mb-2.5">
                    3º
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 text-sm font-bold flex items-center justify-center mb-2 border border-stone-200 group-hover:scale-105 transition-transform">
                    {receiversRanking[2].name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm truncate max-w-full">
                    {receiversRanking[2].name}
                  </h3>
                  <div className="mt-2 text-xs font-semibold text-amber-900 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/80">
                    {receiversRanking[2].count} {receiversRanking[2].count === 1 ? "chocolate" : "chocolates"} 🍫
                  </div>
                  <span className="text-[10px] text-stone-400 mt-2">Clique para ver detalhes →</span>
                </div>
              ) : <div className="hidden md:block order-3" />}
            </div>
          )}

          {/* Full List with Search */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Todos os Homenageados ({displayedReceivers.length})
                </h3>
                <p className="text-xs text-stone-500">Clique em qualquer pessoa para ver os depoimentos recebidos.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar pelo nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {displayedReceivers.length > 0 ? (
                displayedReceivers.map((person, index) => {
                  const uniqueValIds = Array.from(new Set(person.valueIds));
                  return (
                    <div
                      key={person.name}
                      onClick={() => setSelectedPersonDetails({
                        name: person.name,
                        type: "receiver",
                        count: person.count,
                        valueIds: person.valueIds,
                        chocolates: person.chocolates,
                      })}
                      className="p-4 flex items-center justify-between hover:bg-stone-50/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                          index === 0 ? "bg-amber-400 text-stone-950 font-black" :
                          index === 1 ? "bg-stone-300 text-stone-800" :
                          index === 2 ? "bg-amber-100 text-amber-900" :
                          "bg-stone-100 text-stone-600"
                        }`}>
                          {index + 1}º
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-center shrink-0">
                          {person.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 text-sm truncate group-hover:text-amber-700 transition-colors">
                            {person.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-stone-500">
                              {person.chocolates.length} {person.chocolates.length === 1 ? "depoimento" : "depoimentos"}
                            </span>
                            <span className="text-stone-300">•</span>
                            <div className="flex items-center gap-1">
                              {uniqueValIds.slice(0, 3).map((vid) => {
                                const v = niboValues.find(nv => nv.id === vid);
                                return (
                                  <span key={vid} className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 font-medium">
                                    Val. {vid}
                                  </span>
                                );
                              })}
                              {uniqueValIds.length > 3 && (
                                <span className="text-[10px] text-stone-400">+{uniqueValIds.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-stone-900 bg-stone-100 px-3 py-1 rounded-lg">
                          {person.count} 🍫
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-stone-400 text-xs">
                  Nenhum homenageado encontrado para "{searchTerm}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUEM MAIS DOOU (GIVERS) */}
      {selectedTab === "givers" && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Colaboradores que Mais Reconheceram Colegas ({displayedGivers.length})
              </h3>
              <p className="text-xs text-stone-500">Pessoas que mais compartilharam carinho e cultura na reunião.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar pelo nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {displayedGivers.length > 0 ? (
              displayedGivers.map((person, index) => (
                <div
                  key={person.name}
                  onClick={() => setSelectedPersonDetails({
                    name: person.name,
                    type: "giver",
                    count: person.count,
                    chocolates: person.chocolates,
                  })}
                  className="p-4 flex items-center justify-between hover:bg-stone-50/80 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}º
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-center shrink-0 border border-rose-100">
                      {person.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 text-sm truncate group-hover:text-rose-700 transition-colors">
                        {person.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        Homenageou {person.count} {person.count === 1 ? "colega" : "colegas"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200/80 px-3 py-1 rounded-lg">
                      {person.count} {person.count === 1 ? "chocolate doado" : "chocolates doados"} ❤️
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-stone-400 text-xs">
                Ninguém encontrado para "{searchTerm}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VALORES NIBO (DISTRIBUIÇÃO INTERATIVA & BARRAS MODERNAS) */}
      {selectedTab === "values" && (
        <div className="space-y-6">
          {/* Visual Bar Progression */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Frequência dos 9 Valores no Período
              </h3>
              <p className="text-xs text-stone-500">
                Visualização comparativa de quais pilares da cultura Nibo foram mais celebrados.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {valueCounts.map((item) => {
                const percentage = Math.round((item.count / totalValueTags) * 100);
                const barWidth = Math.max(Math.round((item.count / maxCount) * 100), item.count > 0 ? 5 : 0);
                const isSelected = activeValueFilter === item.value.id;

                return (
                  <div
                    key={item.value.id}
                    onClick={() => setActiveValueFilter(isSelected ? null : item.value.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-amber-50/60 border-amber-400 shadow-xs" 
                        : "bg-stone-50/50 border-stone-200/70 hover:bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected ? "bg-stone-900 text-amber-300" : "bg-stone-200 text-stone-700"
                        }`}>
                          {item.value.id}
                        </span>
                        <span className="truncate">{item.value.title}</span>
                      </div>
                      <span className="shrink-0 text-stone-600 font-bold">
                        {item.count} ({percentage}%)
                      </span>
                    </div>

                    {/* Bar track */}
                    <div className="h-2 w-full bg-stone-200/70 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelected ? "bg-amber-500" : "bg-stone-800"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {valueCounts.map((item) => {
              const percentage = Math.round((item.count / totalValueTags) * 100);
              const isSelected = activeValueFilter === item.value.id;
              return (
                <div
                  key={item.value.id}
                  onClick={() => setActiveValueFilter(isSelected ? null : item.value.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "bg-stone-900 text-white border-stone-900 shadow-md"
                      : "bg-white text-stone-900 border-stone-200 hover:border-stone-300 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                          isSelected ? "bg-amber-400 text-stone-950 font-black" : "bg-stone-100 text-stone-800"
                        }`}
                      >
                        {item.value.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                          isSelected ? "bg-stone-800 text-amber-300" : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {item.count} {item.count === 1 ? "vez" : "vezes"} ({percentage}%)
                      </span>
                    </div>

                    <h3 className="font-bold text-sm leading-snug mb-1.5">{item.value.title}</h3>
                    <p
                      className={`text-xs line-clamp-2 leading-relaxed ${
                        isSelected ? "text-stone-300" : "text-stone-500"
                      }`}
                    >
                      {item.value.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/40 flex items-center justify-between text-[11px]">
                    <span className={isSelected ? "text-amber-300 font-semibold" : "text-stone-500"}>
                      {isSelected ? "Clique para desmarcar" : "Ver mensagens vinculadas →"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* If a value card is clicked, show matching chocolates */}
          {activeValueFilter && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-stone-900 text-amber-300 text-xs font-bold flex items-center justify-center">
                    {activeValueFilter}
                  </span>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {niboValues.find((v) => v.id === activeValueFilter)?.title} ({filteredByValue.length} reconhecimentos)
                  </h4>
                </div>
                <button
                  onClick={() => setActiveValueFilter(null)}
                  className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  Fechar filtro
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredByValue.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-stone-900">
                        {c.giver} <span className="text-stone-400">→</span> {c.receiver} 🍫
                      </span>
                    </div>
                    {c.notes ? (
                      <p className="text-xs text-stone-600 italic bg-white p-2.5 rounded-lg border border-stone-100">
                        "{c.notes}"
                      </p>
                    ) : (
                      <p className="text-xs text-stone-400 italic">— Sem mensagem escrita —</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal for Details of a specific Person */}
      {selectedPersonDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-stone-900 font-bold flex items-center justify-center text-sm border border-amber-200">
                  {selectedPersonDetails.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    {selectedPersonDetails.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {selectedPersonDetails.type === "receiver" 
                      ? `${selectedPersonDetails.count} chocolates recebidos`
                      : `${selectedPersonDetails.count} chocolates doados`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPersonDetails(null)}
                className="text-xs text-stone-400 hover:text-stone-800 font-bold px-2 py-1 rounded-md hover:bg-stone-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {selectedPersonDetails.chocolates.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                    <span>
                      {selectedPersonDetails.type === "receiver" ? `De: ${c.giver}` : `Para: ${c.receiver} 🍫`}
                    </span>
                  </div>

                  {/* Values badges */}
                  <div className="flex flex-wrap gap-1">
                    {c.valueIds.map((vid) => {
                      const val = niboValues.find((v) => v.id === vid);
                      if (!val) return null;
                      return (
                        <span
                          key={vid}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-800 font-medium inline-flex items-center gap-1"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-stone-900 text-amber-300 text-[8px] font-bold flex items-center justify-center">
                            {val.id}
                          </span>
                          <span>{val.shortName}</span>
                        </span>
                      );
                    })}
                  </div>

                  {c.notes && (
                    <p className="text-xs text-stone-600 italic bg-white p-2.5 rounded-lg border border-stone-100">
                      "{c.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100 text-right">
              <button
                onClick={() => setSelectedPersonDetails(null)}
                className="px-4 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
