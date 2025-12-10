import { setup, assign, sendParent } from "xstate";

export const toyMachine = setup({
    types: {
        context: {} as { durability: number },
        events: {} as { type: "CHEW" },
    },
    actions: {
        reduceDurability: assign({
            durability: ({ context }) => context.durability - 1,
        }),
    },
}).createMachine({
    id: "toy",
    initial: "new",
    context: {
        durability: 3,
    },
    states: {
        new: {
            on: {
                CHEW: {
                    actions: "reduceDurability",
                    target: "used",
                },
            },
        },
        used: {
            on: {
                CHEW: [
                    {
                        guard: ({ context }) => context.durability <= 1,
                        target: "broken",
                    },
                    {
                        actions: "reduceDurability",
                    },
                ],
            },
            description: "Toy is getting chewed up!",
        },
        broken: {
            entry: sendParent({ type: "toy.broken" }),
            type: "final",
            description: "Toy is destroyed.",
        },
    },
});
