import React, { useState, useEffect, KeyboardEvent } from "react";
import confetti from "canvas-confetti";
import { 
  Clock, 
  Users, 
  AlertCircle, 
  Plus, 
  Check, 
  ChevronRight, 
  Trophy, 
  Sparkles, 
  Crown,
  Medal,
  X,
  UserCheck,
  UserPlus,
  Award
} from "lucide-react";
import { ChocolateEntry, NiboValue, MeetingEdition } from "../types";

interface LiveStageProps {
  entries: ChocolateEntry[];
  niboValues: NiboValue[];
  selectedEdition?: MeetingEdition;
  onMarkAsDelivered: (id: string) => void;
  onSetSpeaking: (id: string) => void;
  onSkipEntry: (id: string) => void;
  onAddEntry: (data: Omit<ChocolateEntry, "id" | "order" | "createdAt" | "status">) => void;
  onNavigateToRanking?: () => void;
}

export const LiveStage: React.FC<LiveStageProps> = ({
  entries,
  niboValues,
  onMarkAsDelivered,
  onSetSpeaking,
  onSkipEntry,
  onAddEntry,
  onNavigateToRanking,
}) => {
  const [secondsOnMic, setSecondsOnMic] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Form state
  const [formGiver, setFormGiver] = useState("");
  const [receiverInput, setReceiverInput] = useState("");
  const [receiversList, setReceiversList] = useState<string[]>([]);
  const [formSelectedValues, setFormSelectedValues] = useState<number[]>([1]);
  const [formError, setFormError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Find currently speaking entry, or the first in queue
  const currentSpeaking = entries.find((e) => e.status === "falando") || entries.find((e) => e.status === "fila");
  
  // Pending queue list
  const queueEntries = entries.filter((e) => e.status === "fila" && e.id !== currentSpeaking?.id);
  const completedEntries = entries.filter((e) => e.status === "entregue");

  // Calculate Real-Time Rankings for this edition
  const receiversMap = new Map<string, { count: number; valueIds: number[] }>();
  entries.forEach((e) => {
    const individualReceivers = e.receiver
      .split(/,| e |;| \/ /i)
      .map((r) => r.trim())
      .filter(Boolean);

    const targets = individualReceivers.length > 0 ? individualReceivers : [e.receiver];

    targets.forEach((person) => {
      const existing = receiversMap.get(person) || { count: 0, valueIds: [] };
      existing.count += 1;
      existing.valueIds.push(...e.valueIds);
      receiversMap.set(person, existing);
    });
  });

  const topReceivers = Array.from(receiversMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);

  const firstPlace = topReceivers[0] || null;
  const secondPlace = topReceivers[1] || null;
  const thirdPlace = topReceivers[2] || null;
  const otherHighlights = topReceivers.slice(3, 7);

  // Value frequency
  const valueCounts = niboValues.map((v) => {
    const count = entries.filter((e) => e.valueIds.includes(v.id)).length;
    return { value: v, count };
  }).sort((a, b) => b.count - a.count);

  const topValue = valueCounts[0]?.count > 0 ? valueCounts[0] : null;

  // Timer effect when a speaker is active
  useEffect(() => {
    setSecondsOnMic(0);
    setIsTimerRunning(true);
  }, [currentSpeaking?.id]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && currentSpeaking) {
      interval = setInterval(() => {
        setSecondsOnMic((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentSpeaking]);

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0, audioCtx.currentTime + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + index * 0.08);
        osc.stop(audioCtx.currentTime + index * 0.08 + 0.55);
      });
    } catch {
      // Audio context might be restricted
    }
  };

  const handleDeliver = (id: string) => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#fbbf24", "#f59e0b", "#d97706", "#78350f", "#ffffff"],
    });
    playChime();
    onMarkAsDelivered(id);
  };

  const addReceiverTag = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!receiversList.includes(trimmed)) {
      setReceiversList([...receiversList, trimmed]);
    }
    setReceiverInput("");
    setFormError("");
  };

  const handleReceiverKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addReceiverTag(receiverInput);
    }
  };

  const removeReceiverTag = (indexToRemove: number) => {
    setReceiversList(receiversList.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleValueSelection = (id: number) => {
    if (formSelectedValues.includes(id)) {
      if (formSelectedValues.length === 1) return;
      setFormSelectedValues(formSelectedValues.filter((v) => v !== id));
    } else {
      setFormSelectedValues([...formSelectedValues, id]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGiver.trim()) {
      setFormError("Por favor, informe seu nome.");
      return;
    }

    let finalReceivers = [...receiversList];
    if (receiverInput.trim() && !finalReceivers.includes(receiverInput.trim())) {
      finalReceivers.push(receiverInput.trim());
    }

    if (finalReceivers.length === 0) {
      setFormError("Por favor, informe quem receberá o chocolate.");
      return;
    }
    if (formSelectedValues.length === 0) {
      setFormError("Selecione ao menos 1 valor Nibo.");
      return;
    }

    onAddEntry({
      giver: formGiver.trim(),
      receiver: finalReceivers.join(", "),
      valueIds: formSelectedValues,
      notes: "",
    });

    setFormGiver("");
    setReceiverInput("");
    setReceiversList([]);
    setFormSelectedValues([1]);
    setFormError("");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getReceiverBadges = (receiverString: string) => {
    return receiverString
      .split(/,| e |;| \/ /i)
      .map((r) => r.trim())
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-bounce">
          <span className="text-xl">🍫</span>
          <div>
            <p className="text-xs font-bold text-amber-300">Você entrou na fila com sucesso!</p>
            <p className="text-[11px] text-stone-300">Aguarde sua vez para falar no microfone.</p>
          </div>
        </div>
      )}

      {/* Grid Principal (Layout Original Organizado: 5 colunas formulário | 7 colunas Palco e Fila) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO ESPAÇOSO */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-xl">🍫</span>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                Entrar na Dinâmica do Chocolate
              </h2>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Preencha para homenagear um ou mais colegas e aguardar a sua vez de falar.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* De */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  De: (Seu Nome) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Larissa Teixeira"
                  value={formGiver}
                  onChange={(e) => { setFormGiver(e.target.value); setFormError(""); }}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Para (Múltiplos Destinatários) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Para: (Pode adicionar mais de uma pessoa) <span className="text-rose-500">*</span>
                  </label>
                  {receiversList.length > 0 && (
                    <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {receiversList.length} selecionado{receiversList.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Digite o nome (Ex: Roberto Rocha)"
                    value={receiverInput}
                    onChange={(e) => { setReceiverInput(e.target.value); setFormError(""); }}
                    onKeyDown={handleReceiverKeyDown}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => addReceiverTag(receiverInput)}
                    disabled={!receiverInput.trim()}
                    className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {/* Tags de Pessoas */}
                {receiversList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 bg-amber-50/50 border border-amber-200/60 rounded-xl">
                    {receiversList.map((name, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-bold border border-amber-200 shadow-2xs"
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => removeReceiverTag(index)}
                          className="w-3.5 h-3.5 rounded hover:bg-amber-200/80 flex items-center justify-center text-amber-800 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3 stroke-[3]" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Valores Nibo (Todos os 9 valores abertos diretamente sem barra de rolagem) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-700">
                    Valores Nibo: <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {formSelectedValues.length} selecionado{formSelectedValues.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-1.5 p-2 bg-stone-50 border border-stone-200/80 rounded-xl">
                  {niboValues.map((val) => {
                    const isSelected = formSelectedValues.includes(val.id);
                    return (
                      <button
                        type="button"
                        key={val.id}
                        onClick={() => toggleValueSelection(val.id)}
                        className={`w-full p-2 rounded-lg text-xs text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-stone-900 text-amber-300 border-stone-900 font-semibold shadow-xs"
                            : "bg-white text-stone-700 border-stone-200/70 hover:border-stone-300 hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold shrink-0 ${
                              isSelected ? "bg-amber-400 text-stone-950" : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {val.id}
                          </span>
                          <span className="font-medium text-xs truncate">{val.title}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Entrar na Fila de Fala 🍫
              </button>
            </form>
          </div>
        </div>

        {/* COLUNA DIREITA: PALCO AO VIVO + PRÓXIMOS NA FILA */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. NO MICROFONE AGORA */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  No Microfone Agora
                </span>
              </div>

              {/* Timer Pill */}
              {currentSpeaking && (
                <div className="flex items-center gap-1.5 bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-mono font-semibold border border-stone-200">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>{formatTimer(secondsOnMic)}</span>
                </div>
              )}
            </div>

            {currentSpeaking ? (
              <div className="space-y-4">
                {/* Speaker Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center text-lg font-black shadow-xs shrink-0">
                      {currentSpeaking.giver.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        Falando Agora
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                        {currentSpeaking.giver}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Ordem #{currentSpeaking.order} na reunião
                      </p>
                    </div>
                  </div>

                  {/* Homenageando Tags */}
                  <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200/60">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                      Homenageando
                    </span>
                    <div className="flex flex-wrap sm:justify-end gap-1.5">
                      {getReceiverBadges(currentSpeaking.receiver).map((person, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-950 border border-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>{person}</span>
                          <span>🍫</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Values Highlight */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide block">
                    Valores Nibo Celebrados
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSpeaking.valueIds.map((vid) => {
                      const val = niboValues.find((v) => v.id === vid);
                      if (!val) return null;
                      return (
                        <div
                          key={vid}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-2"
                        >
                          <span className="w-4 h-4 rounded-md bg-stone-900 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {val.id}
                          </span>
                          <span>{val.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    onClick={() => onSkipEntry(currentSpeaking.id)}
                    className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Pular Orador
                  </button>

                  <button
                    onClick={() => handleDeliver(currentSpeaking.id)}
                    className="px-5 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Entregar Chocolate</span>
                    <span>✨</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-xl">
                  🎙️
                </div>
                <h3 className="text-sm font-bold text-stone-900">Nenhum orador no microfone agora</h3>
                <p className="text-xs text-stone-500">
                  A fila está vazia. Adicione um novo chocolate no formulário ao lado.
                </p>
              </div>
            )}
          </div>

          {/* 2. PRÓXIMOS NA FILA */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-600" />
                <h3 className="font-bold text-stone-900 text-sm">
                  Próximos na Fila ({queueEntries.length})
                </h3>
              </div>
              <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-md">
                {completedEntries.length} já entregues
              </span>
            </div>

            {/* Queue List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {queueEntries.length > 0 ? (
                queueEntries.map((entry) => {
                  const receivers = getReceiverBadges(entry.receiver);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => onSetSpeaking(entry.id)}
                      className="p-3 rounded-xl border border-stone-200/80 bg-stone-50/60 hover:border-amber-400 hover:bg-white transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-stone-200/80 text-stone-700 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors">
                          {entry.order}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-stone-900 truncate">
                            {entry.giver} <span className="text-stone-400 font-normal">→</span>{" "}
                            <span className="font-bold text-amber-950">
                              {receivers.join(", ")}
                            </span>
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.valueIds.map((vid) => {
                              const val = niboValues.find((v) => v.id === vid);
                              if (!val) return null;
                              return (
                                <span
                                  key={vid}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/60 text-stone-700 font-medium inline-flex items-center gap-1"
                                >
                                  <span className="w-3 h-3 rounded-full bg-stone-800 text-amber-300 flex items-center justify-center text-[8px] font-bold shrink-0">
                                    {val.id}
                                  </span>
                                  <span>{val.shortName}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-amber-600 group-hover:underline shrink-0">
                        Chamar
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-stone-400 space-y-1">
                  <p className="text-xs font-medium">Fila de espera vazia!</p>
                  <p className="text-[11px]">Envie um chocolate no formulário ao lado para entrar na fila.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: PÓDIO EM FORMATO DE TROFÉU CLÁSSICO COM 1º, 2º e 3º LUGAR E "EM DESTAQUE" */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                Pódio de Homenageados da Reunião
              </h3>
              <p className="text-xs text-stone-500">
                Os colegas mais reconhecidos com chocolates nesta edição
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {topValue && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Valor #{topValue.value.id} em alta</span>
              </span>
            )}

            {onNavigateToRanking && (
              <button
                onClick={onNavigateToRanking}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Ranking Geral</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            )}
          </div>
        </div>

        {/* PÓDIO EM FORMATO DE TROFÉU (2º - 1º - 3º) */}
        {topReceivers.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2 max-w-4xl mx-auto">
              
              {/* 2º LUGAR (Prata) */}
              {secondPlace ? (
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col items-center text-center relative order-2 md:order-1 hover:border-amber-400 hover:shadow-md transition-all">
                  <span className="w-8 h-8 rounded-full bg-stone-200 text-stone-800 font-black text-xs flex items-center justify-center mb-2.5 shadow-2xs">
                    2º
                  </span>
                  <div className="w-13 h-13 rounded-2xl bg-stone-100 text-stone-800 text-base font-bold flex items-center justify-center mb-2 border border-stone-200 shadow-2xs">
                    {secondPlace.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm truncate max-w-full">
                    {secondPlace.name}
                  </h4>
                  <div className="mt-2 text-xs font-semibold text-amber-900 bg-amber-50 px-3.5 py-1 rounded-xl border border-amber-200/80">
                    {secondPlace.count} {secondPlace.count === 1 ? "chocolate" : "chocolates"} 🍫
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex flex-col items-center justify-center p-5 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs order-2 md:order-1 h-44">
                  Aguardando 2º lugar...
                </div>
              )}

              {/* 1º LUGAR (Troféu & Coroa - Ouro Central Elevado) */}
              {firstPlace ? (
                <div className="bg-gradient-to-b from-amber-50 via-white to-white rounded-2xl p-6 sm:p-7 border-2 border-amber-300 shadow-md flex flex-col items-center text-center relative order-1 md:order-2 transform md:-translate-y-3 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
                    <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Líder de Reconhecimentos</span>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center my-2 shadow-xs">
                    1º
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-stone-900 text-amber-400 text-xl font-bold flex items-center justify-center mb-2 shadow-xs">
                    {firstPlace.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-stone-900 text-base sm:text-lg truncate max-w-full">
                    {firstPlace.name}
                  </h4>
                  <div className="mt-2.5 text-xs font-bold text-stone-950 bg-amber-400 px-4 py-1.5 rounded-xl shadow-xs">
                    {firstPlace.count} {firstPlace.count === 1 ? "chocolate" : "chocolates"} 🍫
                  </div>
                </div>
              ) : null}

              {/* 3º LUGAR (Bronze) */}
              {thirdPlace ? (
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col items-center text-center relative order-3 hover:border-amber-400 hover:shadow-md transition-all">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center mb-2.5 shadow-2xs">
                    3º
                  </span>
                  <div className="w-13 h-13 rounded-2xl bg-stone-100 text-stone-800 text-base font-bold flex items-center justify-center mb-2 border border-stone-200 shadow-2xs">
                    {thirdPlace.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm truncate max-w-full">
                    {thirdPlace.name}
                  </h4>
                  <div className="mt-2 text-xs font-semibold text-amber-900 bg-amber-50 px-3.5 py-1 rounded-xl border border-amber-200/80">
                    {thirdPlace.count} {thirdPlace.count === 1 ? "chocolate" : "chocolates"} 🍫
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex flex-col items-center justify-center p-5 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs order-3 h-44">
                  Aguardando 3º lugar...
                </div>
              )}
            </div>

            {/* SEÇÃO "TAMBÉM EM DESTAQUE" (4º, 5º, 6º e 7º Lugares) */}
            {otherHighlights.length > 0 && (
              <div className="pt-4 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-3">
                  Também em Destaque nesta Reunião
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {otherHighlights.map((person, idx) => (
                    <div
                      key={person.name}
                      className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200 flex items-center justify-between gap-2 hover:bg-stone-100/80 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 4}º
                        </span>
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {person.name}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-stone-700 bg-white px-2 py-0.5 rounded-md border border-stone-200/80 shrink-0">
                        {person.count} 🍫
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-stone-400 space-y-1">
            <p className="text-xs font-semibold text-stone-600">Nenhum chocolate registrado ainda na reunião</p>
            <p className="text-[11px]">Assim que as entregas começarem, o pódio do 1º, 2º e 3º lugar aparecerá aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};
