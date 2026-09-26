// ============================================================
// Global Active Well Context — React Context + Provider
// ============================================================

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { Well, DrillingParameters, RiskAssessment, Alert, AlertStatus, DrillingEvent } from '../types';
import {
  activeWell as defaultActiveWell,
  currentDrillingParameters,
  currentRisks,
  nearbyWells,
} from '../data/mockData';
import { generateAlertsForWell } from '../utils/alertGeneration';

interface ReportNotes {
  wellId: string;
  notes: string;
  observations: string;
  actions: string;
  status: string;
  reviewer: string;
}

interface WellContextType {
  activeWell: Well;
  setActiveWell: (well: Well) => void;
  currentParameters: DrillingParameters;
  risks: RiskAssessment[];
  alerts: Alert[];
  unacknowledgedAlertCount: number;
  nearbyWells: Well[];
  acknowledgeAlert: (alertId: string) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  reportNotes: Record<string, ReportNotes>;
  updateReportNotes: (wellId: string, notes: ReportNotes) => void;
  importedRecords: DrillingEvent[];
  addImportedRecords: (records: DrillingEvent[]) => void;
}

const WellContext = createContext<WellContextType | undefined>(undefined);

export function WellProvider({ children }: { children: ReactNode }) {
  const [well, setWell] = useState<Well>(defaultActiveWell);
  
  // Use useMemo to generate stable alerts based on the current well context once
  const initialAlerts = useMemo(() => generateAlertsForWell(well, nearbyWells), [well]);
  
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [reportNotes, setReportNotes] = useState<Record<string, ReportNotes>>({});
  
  // Session storage for imported records
  const [importedRecords, setImportedRecords] = useState<DrillingEvent[]>(() => {
    try {
      const saved = sessionStorage.getItem('nwis_imported_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addImportedRecords = (records: DrillingEvent[]) => {
    setImportedRecords((prev) => {
      // Deduplicate by ID
      const existingIds = new Set(prev.map(r => r.id));
      const newRecords = records.filter(r => !existingIds.has(r.id));
      const updated = [...prev, ...newRecords];
      try {
        sessionStorage.setItem('nwis_imported_records', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to session storage', e);
      }
      return updated;
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true, status: a.status === 'NEW' ? 'ACKNOWLEDGED' : a.status } : a))
    );
  };

  const updateAlertStatus = (alertId: string, status: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const acknowledged = status === 'NEW' ? false : true;
          return { ...a, status, acknowledged };
        }
        return a;
      })
    );
  };

  const updateReportNotes = (wellId: string, notes: ReportNotes) => {
    setReportNotes((prev) => ({ ...prev, [wellId]: notes }));
  };

  const unacknowledgedAlertCount = alerts.filter((a) => !a.acknowledged && a.status === 'NEW').length;

  const extendedNearbyWells = useMemo(() => {
    if (importedRecords.length === 0) return nearbyWells;
    const fakeWell: Well = {
      id: 'IMPORTED-DATA',
      name: 'Imported Prototype Records',
      latitude: well.latitude + 0.01,
      longitude: well.longitude + 0.01,
      distanceFromActiveWell: 1.5,
      totalDepth: 5000,
      formation: well.formation,
      reservoir: well.reservoir,
      status: 'COMPLETED',
      drillingDate: '2026-01-01T00:00:00Z',
      spudDate: '2026-01-01T00:00:00Z',
      historicalEvents: importedRecords,
      relevanceScore: 85
    };
    return [...nearbyWells, fakeWell];
  }, [nearbyWells, importedRecords, well]);

  return (
    <WellContext.Provider
      value={{
        activeWell: well,
        setActiveWell: setWell,
        currentParameters: currentDrillingParameters,
        risks: currentRisks,
        alerts,
        unacknowledgedAlertCount,
        nearbyWells: extendedNearbyWells,
        acknowledgeAlert,
        updateAlertStatus,
        reportNotes,
        updateReportNotes,
        importedRecords,
        addImportedRecords,
      }}
    >
      {children}
    </WellContext.Provider>
  );
}

export function useWellContext(): WellContextType {
  const ctx = useContext(WellContext);
  if (!ctx) {
    throw new Error('useWellContext must be used within a WellProvider');
  }
  return ctx;
}
