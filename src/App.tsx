import { useDogMachine } from "./contexts/Dog/useDogMachine";
import asleepSvg from "./assets/asleep.svg";
import walkingSvg from "./assets/walking.svg";
import grumpyPng from "./assets/grumpy_dog.png";

function App() {
  // Now using the context instead of useMachine
  const { currentState, send } = useDogMachine();

  return (
    <>
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold underline mb-8">
          Simple State Machine Demo
        </h1>

        {/* Dog visual representation */}
        <div className="flex flex-col items-center gap-4 border p-8 rounded-lg shadow-lg">
          {currentState.matches({ activity: "asleep" }) && (
            <img src={asleepSvg} alt="Sleeping dog" className="w-32 h-32" />
          )}
          {currentState.matches({ activity: "awake" }) && (
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
            Activity:{" "}
            <strong>{JSON.stringify(currentState.value.activity)}</strong>
          </div>
          <div>
            Mood: <strong>{JSON.stringify(currentState.value.mood)}</strong>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
