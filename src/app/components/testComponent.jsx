"use Client";

import { useSelector } from "react-redux";

export function TestComponent() {
  const counterValue = useSelector((state) => state.counter.value);

  return (
    <div>
      <h2>This is a test component.</h2>
      <p>Counter Value: {counterValue}</p>
    </div>
  );
}