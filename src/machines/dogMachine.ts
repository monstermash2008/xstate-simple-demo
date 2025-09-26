import { setup } from "xstate";

export const dogMachine = setup({
  types: {
    context: {} as {},
    events: {} as { type: "wakes up" } | { type: "falls asleep" },
  },
}).createMachine({
  context: {},
  id: "dog",
  initial: "asleep",
  states: {
    asleep: {
      on: {
        "wakes up": {
          target: "awake",
        },
      },
      description:
        "![sleeping puppy](https://raw.githubusercontent.com/statelyai/assets/main/example-images/dogs/asleep.svg)",
    },
    awake: {
      on: {
        "falls asleep": {
          target: "asleep",
        },
      },
      description:
        "![happy awake puppy](https://raw.githubusercontent.com/statelyai/assets/main/example-images/dogs/walking.svg)",
    },
  },
});
