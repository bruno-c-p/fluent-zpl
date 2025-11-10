// import './App.css'
import { Label175x075 } from './1.75x0.75';
import { Label181x087 } from './1.81x0.87';
import { Label184x125 } from './1.84x1.25';
import { Label2125x100 } from './2.125x1.00';
import { Label238x175 } from './2.38x1.75';
import { Label267x100 } from './2.672x1.00';
import { Label2874x0669 } from './2.874x0.669';
import { Label300x55 } from './3.00x0.55';
import { Label300x100 } from './3.00x1.00';

function App() {
  return (
    <div className="p-10">
      <div className="grid grid-cols-4 gap-4">
        <Label175x075 />
        <Label300x100 />
        <Label300x55 />
        <Label238x175 />
        <Label2125x100 />
        <Label184x125 />
        <Label181x087 />
        <Label267x100 />
        <Label2874x0669 />
      </div>
    </div>
  );
}

export default App;
