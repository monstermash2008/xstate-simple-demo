import type { ReactNode } from "react";
import { useMachine } from "@xstate/react";
import { dogMachine } from "../../machines/dogMachine";
import { DogMachineContext } from "./DogMachineContext";
import { createBrowserInspector } from "@statelyai/inspect";

// Create inspector for this provider
const inspector = createBrowserInspector();

type DogMachineProviderProps = {
  children: ReactNode;
};

export function DogMachineProvider({ children }: DogMachineProviderProps) {
  // Use the machine with inspection
  const [currentState, send] = useMachine(dogMachine, {
    inspect: inspector.inspect,
  });

  return (
    <DogMachineContext.Provider value={[currentState, send]}>
      {children}
    </DogMachineContext.Provider>
  );
}
