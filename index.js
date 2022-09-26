import './App.css';
import PersistentDrawerLeft from './src/components/Drawer';
import { fireMeUp } from "./src/utilities/firebaseUtils";

//initialize firebase
let fire = fireMeUp();

function App() {
  return (
    // <PerformanceCalculator />
    <PersistentDrawerLeft fire={fire}/>
  );
}

export default App;
