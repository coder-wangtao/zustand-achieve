import { memo } from "react";
import useBearStore from "../store/useBearStore";
// import { produce } from "immer";

export default function BearsPage() {
  const bearsStore = useBearStore();
  // const count2 = useBearStore((s) => s.bears);
  // useEffect(() => {
  //   // 初始状态
  //   const state = {
  //     user: {
  //       name: "李雷",
  //       age: 20,
  //     },
  //     loggedIn: false,
  //   };

  //   // 使用 produce 创建新状态
  //   const nextState = produce((draft) => {
  //     // 在草稿对象上进行修改
  //     draft.user.age = 21; // 更新年龄
  //     draft.loggedIn = true; // 设置已登录状态
  //   });

  //   const next = nextState(state);
  //   console.log(state); // { user: { name: '李雷', age: 20 }, loggedIn: false }
  //   console.log(next); // { user: { name: '李雷', age: 21 }, loggedIn: true }
  // }, []);

  const { bears, count, increase, decrease, reset, increaseCount } = bearsStore;
  return (
    <div>
      <h3>BearsPage</h3>

      <button onClick={() => increase()}>increase {bears}</button>
      <button onClick={() => decrease()}>decrease {bears}</button>
      {/* <button>{count2}</button> */}
      <button onClick={() => reset()}>reset</button>

      <button onClick={() => increaseCount()}>count: {count}</button>

      <Child />
    </div>
  );
}

// do not overuse custom hooks
// 不要过渡使用自定义 hook
const Child = memo(() => {
  //传入select可以避免不必要的渲染
  const bears = useBearStore(
    (state) => state.count,
    (a, b) => {
      return a === b;
    }
  );

  console.log("child"); //sy-log

  return (
    <div>
      <h3>Child</h3>
      <p>{bears}</p>
    </div>
  );
});
