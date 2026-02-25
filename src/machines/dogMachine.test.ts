import { createActor, fromPromise, waitFor } from "xstate";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dogMachine, FETCH_TOY_DELAY_MS } from "./dogMachine";

const instantFetchDogMachine = dogMachine.provide({
  actors: {
    fetchToy: fromPromise<{ ok: boolean }>(async () => {
      return { ok: true };
    }),
  },
});

afterEach(() => {
  vi.useRealTimers();
});

describe("dogMachine", () => {
  it("starts asleep, happy, and at full energy", () => {
    const actor = createActor(instantFetchDogMachine).start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.matches({ activity: "asleep" })).toBe(true);
    expect(snapshot.matches({ mood: "happy" })).toBe(true);
    expect(snapshot.context.energy).toBe(100);

    actor.stop();
  });

  it("moves from wakingUp to awake after 3 seconds", async () => {
    vi.useFakeTimers();
    const actor = createActor(instantFetchDogMachine).start();

    actor.send({ type: "wakes up" });
    expect(actor.getSnapshot().matches({ activity: "wakingUp" })).toBe(true);

    vi.advanceTimersByTime(3000);
    await waitFor(actor, (snapshot) => snapshot.matches({ activity: "awake" }));

    actor.stop();
  });

  it("recovers energy while asleep and caps at 100", async () => {
    vi.useFakeTimers();
    const actor = createActor(instantFetchDogMachine).start();

    actor.send({ type: "wakes up" });
    vi.advanceTimersByTime(3000);
    await waitFor(actor, (snapshot) => snapshot.matches({ activity: "awake" }));

    actor.send({ type: "play" });
    await waitFor(
      actor,
      (snapshot) =>
        snapshot.matches({ activity: "awake" }) && snapshot.context.toyRef !== undefined,
    );
    actor.send({ type: "play" });
    expect(actor.getSnapshot().context.energy).toBe(80);

    actor.send({ type: "falls asleep" });
    expect(actor.getSnapshot().matches({ activity: "asleep" })).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(actor.getSnapshot().context.energy).toBe(90);

    vi.advanceTimersByTime(3000);
    expect(actor.getSnapshot().context.energy).toBe(100);

    actor.stop();
  });

  it("spawns a toy on first play and chews it on later play", async () => {
    vi.useFakeTimers();
    const actor = createActor(instantFetchDogMachine).start();

    actor.send({ type: "wakes up" });
    vi.advanceTimersByTime(3000);
    await waitFor(actor, (snapshot) => snapshot.matches({ activity: "awake" }));

    actor.send({ type: "play" });
    await waitFor(
      actor,
      (snapshot) =>
        snapshot.matches({ activity: "awake" }) && snapshot.context.toyRef !== undefined,
    );
    const firstPlaySnapshot = actor.getSnapshot();
    expect(firstPlaySnapshot.context.energy).toBe(90);
    expect(firstPlaySnapshot.context.toyRef).toBeDefined();

    const toyRef = firstPlaySnapshot.context.toyRef;
    if (!toyRef) {
      throw new Error("Expected toyRef to be available after first play");
    }
    expect(toyRef.getSnapshot().context.durability).toBe(3);

    actor.send({ type: "play" });

    expect(actor.getSnapshot().context.energy).toBe(80);
    expect(toyRef.getSnapshot().context.durability).toBe(2);

    actor.stop();
  });

  it("clears toy and becomes grumpy when the toy breaks", async () => {
    vi.useFakeTimers();
    const actor = createActor(instantFetchDogMachine).start();

    actor.send({ type: "wakes up" });
    vi.advanceTimersByTime(3000);
    await waitFor(actor, (snapshot) => snapshot.matches({ activity: "awake" }));

    actor.send({ type: "play" });
    await waitFor(
      actor,
      (snapshot) =>
        snapshot.matches({ activity: "awake" }) && snapshot.context.toyRef !== undefined,
    );
    actor.send({ type: "play" });
    actor.send({ type: "play" });
    actor.send({ type: "play" });

    await waitFor(
      actor,
      (snapshot) =>
        snapshot.matches({ mood: "grumpy" }) && snapshot.context.toyRef === undefined,
    );

    actor.stop();
  });

  it("returns to happy when grumpy dog gets a new toy via play", async () => {
    vi.useFakeTimers();
    const actor = createActor(instantFetchDogMachine).start();

    actor.send({ type: "wakes up" });
    vi.advanceTimersByTime(3000);
    await waitFor(actor, (snapshot) => snapshot.matches({ activity: "awake" }));

    actor.send({ type: "shout" });
    expect(actor.getSnapshot().matches({ mood: "grumpy" })).toBe(true);

    actor.send({ type: "play" });

    await waitFor(
      actor,
      (snapshot) =>
        snapshot.matches({ activity: "awake" }) && snapshot.context.toyRef !== undefined,
    );

    const snapshot = actor.getSnapshot();
    expect(snapshot.matches({ mood: "happy" })).toBe(true);
    expect(snapshot.context.toyRef).toBeDefined();
    expect(snapshot.context.energy).toBe(90);

    actor.stop();
  });

  it("does not spend energy or spawn toy when too tired to play", async () => {
    vi.useFakeTimers();
    const actor = createActor(instantFetchDogMachine).start();

    actor.send({ type: "wakes up" });
    vi.advanceTimersByTime(3000);
    await waitFor(actor, (snapshot) => snapshot.matches({ activity: "awake" }));

    for (let i = 0; i < 10; i++) {
      actor.send({ type: "play" });
      await waitFor(actor, (snapshot) => snapshot.matches({ activity: "awake" }));
    }

    const exhausted = actor.getSnapshot();
    expect(exhausted.context.energy).toBe(0);
    const toyRefAtExhaustion = exhausted.context.toyRef;
    const durabilityAtExhaustion = toyRefAtExhaustion?.getSnapshot().context.durability;

    actor.send({ type: "play" });

    const afterExtraPlay = actor.getSnapshot();
    expect(afterExtraPlay.context.energy).toBe(0);
    expect(afterExtraPlay.context.toyRef).toBe(toyRefAtExhaustion);
    expect(afterExtraPlay.context.toyRef?.getSnapshot().context.durability).toBe(
      durabilityAtExhaustion,
    );

    actor.stop();
  });

  it("enters fetchingToy while requesting a toy and returns to awake when done", async () => {
    vi.useFakeTimers();

    const machine = dogMachine.provide({
      actors: {
        fetchToy: fromPromise<{ ok: boolean }>(async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return { ok: true };
        }),
      },
    });

    const actor = createActor(machine).start();

    actor.send({ type: "wakes up" });
    vi.advanceTimersByTime(3000);
    await waitFor(actor, (snapshot) => snapshot.matches({ activity: "awake" }));

    actor.send({ type: "play" });

    expect(actor.getSnapshot().matches({ activity: "fetchingToy" })).toBe(true);

    vi.advanceTimersByTime(500);
    await waitFor(
      actor,
      (snapshot) =>
        snapshot.matches({ activity: "awake" }) && snapshot.context.toyRef !== undefined,
    );

    actor.stop();
  });

  it("keeps fetchingToy active long enough to be clearly visible", async () => {
    vi.useFakeTimers();

    const actor = createActor(dogMachine).start();

    actor.send({ type: "wakes up" });
    vi.advanceTimersByTime(3000);
    await waitFor(actor, (snapshot) => snapshot.matches({ activity: "awake" }));

    actor.send({ type: "play" });
    expect(actor.getSnapshot().matches({ activity: "fetchingToy" })).toBe(true);

    vi.advanceTimersByTime(1200);
    expect(actor.getSnapshot().matches({ activity: "fetchingToy" })).toBe(true);

    const remainingDelay = Math.max(0, FETCH_TOY_DELAY_MS - 1200) + 500;
    vi.advanceTimersByTime(remainingDelay);
    await waitFor(
      actor,
      (snapshot) =>
        snapshot.matches({ activity: "awake" }) && snapshot.context.toyRef !== undefined,
    );

    actor.stop();
  });

  it("becomes grumpy if toy fetch fails", async () => {
    vi.useFakeTimers();

    const machine = dogMachine.provide({
      actors: {
        fetchToy: fromPromise<{ ok: boolean }>(async () => {
          throw new Error("network fail");
        }),
      },
    });

    const actor = createActor(machine).start();

    actor.send({ type: "wakes up" });
    vi.advanceTimersByTime(3000);
    await waitFor(actor, (snapshot) => snapshot.matches({ activity: "awake" }));

    actor.send({ type: "play" });

    await waitFor(
      actor,
      (snapshot) =>
        snapshot.matches({ activity: "awake" }) &&
        snapshot.matches({ mood: "grumpy" }) &&
        snapshot.context.toyRef === undefined,
    );

    actor.stop();
  });
});
