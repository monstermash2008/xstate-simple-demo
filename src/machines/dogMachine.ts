import { setup, assign } from "xstate";

export const dogMachine = setup({
  types: {
    context: {} as { energy: number },
    events: {} as
      | { type: "wakes up" }
      | { type: "falls asleep" }
      | { type: "play" },
  },
  actions: {
    reduceEnergy: assign({
      energy: ({ context }) => Math.max(0, context.energy - 10),
    }),
    recoverEnergy: assign({
      energy: ({ context }) => Math.min(100, context.energy + 5),
    }),
  },
  guards: {
    hasEnergy: ({ context }) => context.energy >= 10,
  },
}).createMachine({
  context: {
    energy: 100,
  },
  id: "dog",
  initial: "asleep",
  states: {
    asleep: {
      after: {
        1000: {
          actions: "recoverEnergy",
          target: "asleep",
        },
      },
      on: {
        "wakes up": {
          target: "wakingUp",
        },
      },
      description:
        "![sleeping puppy](https://raw.githubusercontent.com/statelyai/assets/main/example-images/dogs/asleep.svg)",
    },
    wakingUp: {
      after: {
        3000: {
          target: "awake",
        },
      },
      description: "Puppy is waking up...",
    },
    awake: {
      on: {
        play: {
          guard: "hasEnergy",
          actions: "reduceEnergy",
        },
        "falls asleep": {
          target: "asleep",
        },
      },
      description:
        "![happy awake puppy](https://raw.githubusercontent.com/statelyai/assets/main/example-images/dogs/walking.svg)",
    },
  },
});
