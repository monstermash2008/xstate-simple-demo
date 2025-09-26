import { useContext } from "react";
import { DogMachineContext } from "./DogMachineContext";

export function useDogMachine() {
  const context = useContext(DogMachineContext);
  if (!context) {
    throw new Error("useDogMachine must be used within a DogMachineProvider");
  }

  const [currentState, send] = context;
  return { currentState, send };
}
