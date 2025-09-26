import type { ReactNode } from "react";
import { useMachine } from "@xstate/react";
import { dogMachine } from "../../machines/dogMachine";
import { DogMachineContext } from "./DogMachineContext";

type DogMachineProviderProps = {
  children: ReactNode;
};

export function DogMachineProvider({ children }: DogMachineProviderProps) {
  const machineState = useMachine(dogMachine);

  return (
    <DogMachineContext.Provider value={machineState}>
      {children}
    </DogMachineContext.Provider>
  );
}
