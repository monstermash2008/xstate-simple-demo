import { assign, createActor, setup, type ActorRefFrom } from "xstate";
import { describe, expect, it } from "vitest";
import { toyMachine } from "./toyMachine";

const toyParentHarness = setup({
  types: {
    context: {} as {
      toyRef?: ActorRefFrom<typeof toyMachine>;
      toyBroken: boolean;
    },
    events: {} as { type: "CHEW" } | { type: "toy.broken" },
  },
  actors: {
    toy: toyMachine,
  },
  actions: {
    spawnToy: assign({
      toyRef: ({ spawn }) => spawn("toy", { id: "test-toy" }),
    }),
    chewToy: ({ context }) => {
      context.toyRef?.send({ type: "CHEW" });
    },
    markBroken: assign({
      toyBroken: true,
    }),
  },
}).createMachine({
  context: {
    toyBroken: false,
  },
  entry: "spawnToy",
  on: {
    CHEW: {
      actions: "chewToy",
    },
    "toy.broken": {
      actions: "markBroken",
    },
  },
});

describe("toyMachine", () => {
  it("starts as new with full durability", () => {
    const actor = createActor(toyMachine).start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.matches("new")).toBe(true);
    expect(snapshot.context.durability).toBe(3);

    actor.stop();
  });

  it("moves to used and reduces durability on first CHEW", () => {
    const actor = createActor(toyMachine).start();

    actor.send({ type: "CHEW" });

    const snapshot = actor.getSnapshot();
    expect(snapshot.matches("used")).toBe(true);
    expect(snapshot.context.durability).toBe(2);

    actor.stop();
  });

  it("notifies parent when reaching broken", () => {
    const actor = createActor(toyParentHarness).start();

    actor.send({ type: "CHEW" });
    actor.send({ type: "CHEW" });
    actor.send({ type: "CHEW" });

    expect(actor.getSnapshot().context.toyBroken).toBe(true);

    actor.stop();
  });
});
