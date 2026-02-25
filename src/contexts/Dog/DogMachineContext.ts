import type { EventFrom, SnapshotFrom } from "xstate";
import { createContext } from "react";
import type { dogMachine } from "../../machines/dogMachine";

type DogMachineContextType =
  | readonly [
      currentState: SnapshotFrom<typeof dogMachine>,
      send: (event: EventFrom<typeof dogMachine>) => void,
    ]
  | null;

export const DogMachineContext = createContext<DogMachineContextType>(null);
