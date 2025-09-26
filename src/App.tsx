import { useDogMachine } from "./contexts/Dog/useDogMachine";
import asleepSvg from "./assets/asleep.svg";
import walkingSvg from "./assets/walking.svg";

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
          {currentState.matches("asleep") && (
            <img src={asleepSvg} alt="Sleeping dog" className="w-32 h-32" />
          )}
          {currentState.matches("awake") && (
            <img src={walkingSvg} alt="Awake dog" className="w-32 h-32" />
          )}
        </div>

        {/* Controls to send events */}
        <div className="mt-8 flex gap-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => send({ type: "wakes up" })}
          >
            Wake Up
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => send({ type: "falls asleep" })}
          >
            Fall Asleep
          </button>
        </div>

        <div className="mt-4 text-gray-600">
          Current State: <strong>{currentState.value.toString()}</strong>
        </div>
      </div>
    </>
  );
}

export default App;
