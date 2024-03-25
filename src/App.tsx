import { Square } from "./widgets";

function App() {
  return (
    <div>
      <Square
        width={window.innerWidth - 100}
        height={window.innerHeight - 100}
      />
    </div>
  );
}

export default App;
