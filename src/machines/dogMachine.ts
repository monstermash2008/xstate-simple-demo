import {
  setup,
  assign,
  fromCallback,
  fromPromise,
  raise,
  type ActorRefFrom,
} from "xstate";
import { toyMachine } from "./toyMachine";

export const FETCH_TOY_DELAY_MS = 1800;

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
      | { type: "toy.broken" }
      | { type: "toy.fetchFailed" },
  },
  actors: {
    energyTicker: fromCallback(({ sendBack }) => {
      const interval = setInterval(() => {
        sendBack({ type: "tick" });
      }, 1000);
      return () => clearInterval(interval);
    }),
    toy: toyMachine,
    fetchToy: fromPromise(async () => {
      // Mocking an API request (or other async process) before a toy becomes available.
      await new Promise((resolve) => setTimeout(resolve, FETCH_TOY_DELAY_MS));
      return { ok: true };
    }),
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
      context.toyRef?.send({ type: "CHEW" });
    },
    clearToy: assign({
      toyRef: undefined,
    }),
    markToyFetchFailed: raise({ type: "toy.fetchFailed" }),
  },
  guards: {
    hasEnergy: ({ context }) => context.energy >= 10,
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
                  context.energy >= 10 && !!context.toyRef,
                actions: ["reduceEnergy", "chewToy"],
              },
              {
                guard: ({ context }) => context.energy >= 10 && !context.toyRef,
                target: "fetchingToy",
                actions: "reduceEnergy",
              },
            ],
            "falls asleep": {
              target: "asleep",
            },
          },
          description:
            "![happy awake puppy](https://raw.githubusercontent.com/statelyai/assets/main/example-images/dogs/walking.svg)",
        },
        fetchingToy: {
          invoke: {
            src: "fetchToy",
            onDone: {
              target: "awake",
              actions: "spawnToy",
            },
            onError: {
              target: "awake",
              actions: "markToyFetchFailed",
            },
          },
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
        "toy.fetchFailed": {
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
              guard: ({ context }) => !context.toyRef,
              target: "happy",
            },
          },
        },
      },
    },
  },
});
