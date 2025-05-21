// import { useState } from "react";
import { useLocalStorage } from "../useLocalStorage";
function Test() {
  const [count, setCount] = useLocalStorage("count", 0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  );
}

export default Test;
