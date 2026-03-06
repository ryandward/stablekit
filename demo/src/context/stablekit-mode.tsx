import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface StableKitModeContextValue {
  enabled: boolean;
  toggle: () => void;
}

const StableKitModeContext = createContext<StableKitModeContextValue>({
  enabled: true,
  toggle: () => {},
});

export function StableKitModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const toggle = useCallback(() => setEnabled((prev) => !prev), []);

  return (
    <StableKitModeContext value={{ enabled, toggle }}>
      {children}
    </StableKitModeContext>
  );
}

export function useStableKitMode() {
  return useContext(StableKitModeContext);
}
