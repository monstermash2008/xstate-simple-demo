import { createActor } from 'xstate';
import { dogMachine } from '../machines/dogMachine';

// Create the actor outside the component to ensure it's created only once
export const dogActor = createActor(dogMachine).start();