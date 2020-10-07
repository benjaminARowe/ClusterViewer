import React from "react";
import "./styles.css";

import Chart from "./components/Chart";

export default function App() {
  return (
    <div className="App">
      <Chart size={[1, "6em"]} />
    </div>
  );
}
