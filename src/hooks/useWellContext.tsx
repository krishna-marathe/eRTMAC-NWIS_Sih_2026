// ============================================================
// Global Active Well Context — React Context + Provider
// ============================================================

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Well, DrillingParameters, RiskAssessment, Alert } from '../types';
import {
  activeWell as defaultActiveWell,
  currentDrillingParameters,
  currentRisks,
  currentAlerts,
  nearbyWells,
} from '../data/mockData';

interface WellContextType {
  activeWell: Well;
  setActiveWell: (well: Well) => void;
  currentParameters: DrillingParameters;
  risks: RiskAssessment[];
  alerts: Alert[];
  unacknowledgedAlertCount: number;
  nearbyWells: Well[];
  acknowledgeAlert: (alertId: string) => void;
}

const WellContext = createContext<WellContextType | undefined>(undefined);

export function WellProvider({ children }: { children: ReactNode }) {
  const [well, setWell] = useState<Well>(defaultActiveWell);
  const [alerts, setAlerts] = useState<Alert[]>(currentAlerts);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const unacknowledgedAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <WellContext.Provider
      value={{
        activeWell: well,
        setActiveWell: setWell,
        currentParameters: currentDrillingParameters,
        risks: currentRisks,
        alerts,
        unacknowledgedAlertCount,
        nearbyWells,
        acknowledgeAlert,
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
