import { useSelector } from "@xstate/react";
import type { ActorRefFrom } from "xstate";
import { useDogMachine } from "./contexts/Dog/useDogMachine";
import asleepSvg from "./assets/asleep.svg";
import walkingSvg from "./assets/walking.svg";
import grumpyPng from "./assets/grumpy_dog.png";
import { toyMachine } from "./machines/toyMachine";

// Helper component to render the toy
type ToyActorRef = ActorRefFrom<typeof toyMachine>;

const BallIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    role="img"
    aria-label="Tennis ball"
  >
    <defs>
      <radialGradient id="ballGradient" cx="30%" cy="28%" r="70%">
        <stop offset="0%" stopColor="#bef264" />
        <stop offset="65%" stopColor="#84cc16" />
        <stop offset="100%" stopColor="#65a30d" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="url(#ballGradient)" />
    <path
      d="M20 4c-8 7-12 17-12 28s4 21 12 28"
      fill="none"
      stroke="#f8fafc"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M44 4c8 7 12 17 12 28s-4 21-12 28"
      fill="none"
      stroke="#f8fafc"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const Toy = ({ toyRef }: { toyRef: ToyActorRef }) => {
  const toySnapshot = useSelector(toyRef, (state) => state);

  if (!toySnapshot) return null;

  const isBroken = toySnapshot.matches("broken");
  const durability = toySnapshot.context.durability;

  return (
    <div className="flex flex-col items-end">
      <div className="h-10 w-10">
        {isBroken ? (
          <span className="text-4xl">🕸️</span>
        ) : (
          <BallIcon className="h-10 w-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
        )}
      </div>
      <div className="text-xs font-bold text-gray-500 mt-1">
        HP: {durability}/3
      </div>
      {isBroken && (
        <span className="text-red-500 text-xs font-bold">BROKEN!</span>
      )}
    </div>
  );
};

function App() {
  // Now using the context instead of useMachine
  const { currentState, send } = useDogMachine();
  const isFetchingToy = currentState.matches({ activity: "fetchingToy" });
  const showAwakeDog =
    currentState.matches({ activity: "awake" }) ||
    currentState.matches({ activity: "fetchingToy" });

  return (
    <>
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold underline mb-8">
          Simple State Machine Demo
        </h1>

        {/* Dog visual representation */}
        <div className="flex flex-col items-center gap-4 border p-8 rounded-lg shadow-lg relative min-w-75">
          {/* Toy Display */}
          <div className="absolute top-4 right-4 flex min-h-14 min-w-12 flex-col items-end">
            {isFetchingToy ? (
              <>
                <BallIcon className="h-10 w-10 animate-pulse will-change-transform [animation-duration:850ms]" />
                <span className="mt-1 text-xs font-bold text-gray-500">Fetching toy...</span>
              </>
            ) : currentState.context.toyRef ? (
              <Toy toyRef={currentState.context.toyRef} />
            ) : null}
          </div>

          {currentState.matches({ activity: "asleep" }) && (
            <img src={asleepSvg} alt="Sleeping dog" className="w-32 h-32" />
          )}
          {showAwakeDog && (
            <>
              {currentState.matches({ mood: "happy" }) && (
                <img src={walkingSvg} alt="Happy dog" className="w-32 h-32" />
              )}
              {currentState.matches({ mood: "grumpy" }) && (
                <img
                  src={grumpyPng}
                  alt="Grumpy dog"
                  className="w-32 h-32 object-contain"
                />
              )}
            </>
          )}
          {currentState.matches({ activity: "wakingUp" }) && (
            <img
              src={asleepSvg}
              alt="Waking up dog"
              className="w-32 h-32 animate-bounce"
            />
          )}

          {/* Energy Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden border border-gray-300 relative">
            <div
              className={`h-full transition-all duration-300 ${
                currentState.context.energy < 10 ? "bg-red-500" : "bg-green-500"
              }`}
              style={{ width: `${currentState.context.energy}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
              Energy: {Math.round(currentState.context.energy)}%
            </span>
          </div>
        </div>

        {/* Controls to send events */}
        <div className="mt-8 flex gap-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => send({ type: "wakes up" })}
            disabled={!currentState.matches({ activity: "asleep" })}
          >
            Wake Up
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => send({ type: "falls asleep" })}
            disabled={!currentState.matches({ activity: "awake" })}
          >
            Fall Asleep
          </button>
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => send({ type: "play" })}
            disabled={
              !currentState.can({ type: "play" }) ||
              !currentState.matches({ activity: "awake" })
            }
          >
            Play
          </button>
        </div>

        {/* Mood Controls */}
        <div className="mt-4 flex gap-4">
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => send({ type: "pet" })}
            disabled={currentState.matches({ activity: "asleep" })}
          >
            Pet (Make Happy)
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => send({ type: "shout" })}
            disabled={currentState.matches({ activity: "asleep" })}
          >
            Shout (Make Grumpy)
          </button>
        </div>

        <div className="mt-4 text-gray-600 flex flex-col items-center">
          <div>
            Status: <strong>{JSON.stringify(currentState.value)}</strong>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
