import { setup, assign, fromCallback, type ActorRefFrom } from "xstate";
import { toyMachine } from "./toyMachine";

export const dogMachine = setup({
  types: {
    context: {} as {
      energy: number;
      toyRef?: ActorRefFrom<typeof toyMachine>;
    },
    events: {} as
      | { type: "wakes up" }
      | { type: "falls asleep" }
      | { type: "play" }
      | { type: "tick" }
      | { type: "shout" }
      | { type: "pet" }
      | { type: "toy.broken" },
  },
  actors: {
    energyTicker: fromCallback(({ sendBack }) => {
      const interval = setInterval(() => {
        sendBack({ type: "tick" });
      }, 1000);
      return () => clearInterval(interval);
    }),
    toy: toyMachine,
  },
  actions: {
    reduceEnergy: assign({
      energy: ({ context }) => Math.max(0, context.energy - 10),
    }),
    recoverEnergy: assign({
      energy: ({ context }) => Math.min(100, context.energy + 10),
    }),
    spawnToy: assign({
      toyRef: ({ spawn }) => spawn("toy", { id: "my-toy" }),
    }),
    chewToy: ({ context }) => {
      if (context.toyRef) {
        context.toyRef.send({ type: "CHEW" });
      }
    },
    clearToy: assign({
      toyRef: undefined,
    }),
  },
  guards: {
    hasEnergy: ({ context }) => context.energy >= 10,
    hasToy: ({ context }) => !!context.toyRef,
  },
}).createMachine({
  context: {
    energy: 100,
  },
  id: "dog",
  type: "parallel",
  states: {
    activity: {
      initial: "asleep",
      states: {
        asleep: {
          invoke: {
            src: "energyTicker",
          },
          on: {
            tick: {
              actions: "recoverEnergy",
            },
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
            play: [
              {
                guard: ({ context }) =>
                  context.energy >= 10 && !!context.toyRef, // Has energy AND toy
                actions: ["reduceEnergy", "chewToy"],
              },
              {
                guard: "hasEnergy", // Has energy but NO toy
                actions: ["reduceEnergy", "spawnToy"],
              },
            ],
            "falls asleep": {
              target: "asleep",
            },
          },
          description:
            "![happy awake puppy](https://raw.githubusercontent.com/statelyai/assets/main/example-images/dogs/walking.svg)",
        },
      },
    },
    mood: {
      initial: "happy",
      on: {
        "toy.broken": {
          actions: "clearToy",
          target: ".grumpy",
        },
      },
      states: {
        happy: {
          on: {
            shout: { target: "grumpy" },
          },
        },
        grumpy: {
          on: {
            pet: { target: "happy" },
            // If playing creates a NEW toy, it makes dog happy.
            play: {
              guard: ({ context }) => !context.toyRef, // Only if getting a new toy
              target: "happy"
            },
          },
        },
      },
    },
  },
});
