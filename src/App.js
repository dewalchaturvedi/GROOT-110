import './App.css';
import PersistentDrawerLeft from './components/Drawer';
import { fireMeUp } from "./utilities/firebaseUtils";

//initialize firebase
let fire = fireMeUp();

function App() {
  return (
    // <PerformanceCalculator />
    <PersistentDrawerLeft fire={fire}/>
  );
}

export default App;
