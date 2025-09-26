import type { useMachine } from "@xstate/react";
import { createContext } from "react";
import type { dogMachine } from "../../machines/dogMachine";

type DogMachineContextType = ReturnType<
  typeof useMachine<typeof dogMachine>
> | null;

export const DogMachineContext = createContext<DogMachineContextType>(null);
