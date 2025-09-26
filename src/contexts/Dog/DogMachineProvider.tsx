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
  const machineState = useMachine(dogMachine, {
    inspect: inspector.inspect,
  });

  return (
    <DogMachineContext.Provider value={machineState}>
      {children}
    </DogMachineContext.Provider>
  );
}
