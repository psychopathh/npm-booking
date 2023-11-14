
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// class Main {
//   public rootElement: string;
//   public json: any;
//   constructor(rootElement: string, json: any) {
//     this.rootElement = rootElement
//     this.json = json
//   }

//   init() {
//     const root = ReactDOM.createRoot(
//       document.getElementById(this.rootElement) as HTMLElement
//     );

//     root.render(
//       <React.StrictMode>
//         <App json={this.json ? JSON.parse(this.json) : undefined} />
//       </React.StrictMode>
//     );
//   }

// }
// @ts-ignore
// window.BookingLibrary = Main

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// export default Main;