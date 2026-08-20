import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { LiveStage } from "./components/LiveStage";
import { SpreadsheetView } from "./components/SpreadsheetView";
import { RankingView } from "./components/RankingView";
import { MuralView } from "./components/MuralView";
import { AddChocolateModal } from "./components/AddChocolateModal";
import { ValuesGuideModal } from "./components/ValuesGuideModal";
import { NewEditionModal } from "./components/NewEditionModal";
import { NIBO_VALUES, INITIAL_ENTRIES, INITIAL_EDITIONS } from "./data/niboValues";
import { ChocolateEntry, ChocolateStatus, MeetingEdition } from "./types";

const STORAGE_ENTRIES_KEY = "nibo_chocolate_entries_v2";
const STORAGE_EDITIONS_KEY = "nibo_chocolate_editions_v2";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"stage" | "sheet" | "ranking" | "mural">("stage");
  const [editions, setEditions] = useState<MeetingEdition[]>(() => {
    const saved = localStorage.getItem(STORAGE_EDITIONS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading editions", e);
      }
    }
    return INITIAL_EDITIONS;
  });

  const [selectedEditionId, setSelectedEditionId] = useState<string>("edition-2026-08");

  const [entries, setEntries] = useState<ChocolateEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_ENTRIES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading saved chocolates", e);
      }
    }
    return INITIAL_ENTRIES;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isValuesGuideOpen, setIsValuesGuideOpen] = useState(false);
  const [isNewEditionModalOpen, setIsNewEditionModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_ENTRIES_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_EDITIONS_KEY, JSON.stringify(editions));
  }, [editions]);

  const selectedEdition = editions.find((e) => e.id === selectedEditionId);

  // Filter entries for the live stage
  const stageEntries = entries.filter((e) => {
    if (selectedEditionId === "all") return true;
    return !e.editionId || e.editionId === selectedEditionId;
  });

  // Actions
  const handleAddEntry = (data: Omit<ChocolateEntry, "id" | "order" | "createdAt" | "status">) => {
    const activeEdId = selectedEditionId === "all" ? (editions[0]?.id || "edition-2026-08") : selectedEditionId;
    const sameEditionEntries = entries.filter((e) => !e.editionId || e.editionId === activeEdId);

    const newEntry: ChocolateEntry = {
      id: `entry-${Date.now()}`,
      order: sameEditionEntries.length + 1,
      editionId: activeEdId,
      giver: data.giver,
      receiver: data.receiver,
      valueIds: data.valueIds,
      notes: data.notes,
      speechGenerated: data.speechGenerated,
      status: "fila",
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleMarkAsDelivered = (id: string) => {
    setEntries((prev) => {
      const updated = prev.map((e) => {
        if (e.id === id) {
          return { ...e, status: "entregue" as ChocolateStatus, presentedAt: new Date().toISOString() };
        }
        return e;
      });

      // Auto promote next in line to speaking for the active edition
      const activeEdId = selectedEditionId;
      const nextPending = updated.find((e) => 
        (activeEdId === "all" || !e.editionId || e.editionId === activeEdId) && e.status === "fila"
      );
      if (nextPending) {
        return updated.map((e) => (e.id === nextPending.id ? { ...e, status: "falando" as ChocolateStatus } : e));
      }
      return updated;
    });
  };

  const handleSetSpeaking = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        status: e.id === id ? "falando" : e.status === "falando" ? "fila" : e.status,
      }))
    );
    setCurrentTab("stage");
  };

  const handleSkipEntry = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "ausente" as ChocolateStatus } : e))
    );
  };

  const handleUpdateEntryStatus = (id: string, status: ChocolateStatus) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleCreateEdition = (newEdition: MeetingEdition) => {
    setEditions((prev) => [newEdition, ...prev]);
    setSelectedEditionId(newEdition.id);
  };

  const activeCount = stageEntries.filter((e) => e.status === "fila" || e.status === "falando").length;
  const completedCount = stageEntries.filter((e) => e.status === "entregue").length;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        editions={editions}
        selectedEditionId={selectedEditionId}
        onSelectEdition={setSelectedEditionId}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenValuesGuide={() => setIsValuesGuideOpen(true)}
        onOpenNewEditionModal={() => setIsNewEditionModalOpen(true)}
        activeCount={activeCount}
        completedCount={completedCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === "stage" && (
          <LiveStage
            entries={stageEntries}
            niboValues={NIBO_VALUES}
            selectedEdition={selectedEdition}
            onMarkAsDelivered={handleMarkAsDelivered}
            onSetSpeaking={handleSetSpeaking}
            onSkipEntry={handleSkipEntry}
            onAddEntry={handleAddEntry}
            onNavigateToRanking={() => setCurrentTab("ranking")}
          />
        )}

        {currentTab === "sheet" && (
          <SpreadsheetView
            entries={entries}
            niboValues={NIBO_VALUES}
            editions={editions}
            selectedEditionId={selectedEditionId}
            onSelectEdition={setSelectedEditionId}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onUpdateEntryStatus={handleUpdateEntryStatus}
            onDeleteEntry={handleDeleteEntry}
            onSetSpeaking={handleSetSpeaking}
          />
        )}

        {currentTab === "ranking" && (
          <RankingView
            entries={entries}
            niboValues={NIBO_VALUES}
            editions={editions}
            selectedEditionId={selectedEditionId}
            onSelectEdition={setSelectedEditionId}
          />
        )}

        {currentTab === "mural" && (
          <MuralView
            entries={entries}
            niboValues={NIBO_VALUES}
            editions={editions}
            selectedEditionId={selectedEditionId}
            onSelectEdition={setSelectedEditionId}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <AddChocolateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEntry}
        editions={editions}
        selectedEditionId={selectedEditionId}
      />

      <ValuesGuideModal
        isOpen={isValuesGuideOpen}
        onClose={() => setIsValuesGuideOpen(false)}
      />

      <NewEditionModal
        isOpen={isNewEditionModalOpen}
        onClose={() => setIsNewEditionModalOpen(false)}
        onCreateEdition={handleCreateEdition}
      />
    </div>
  );
}
