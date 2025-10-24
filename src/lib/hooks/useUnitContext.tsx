"use client";
import { createContext, useContext, useState } from "react";

const UnitContext = createContext({
  unit: "metric",
  setUnit: (unit: string) => {},
});

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState("metric");
  return <UnitContext.Provider value={{ unit, setUnit }}>{children}</UnitContext.Provider>;
}

export const useUnit = () => useContext(UnitContext);
