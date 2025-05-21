import type { StateCreator } from "../vanilla";
import { produce } from "immer";
//Zustand 提供了两个重要的中间件：persist 和 immer。
//Zustand Persist 是一个用于持久化状态的中间件。它允许开发者将应用程序的状态保存到浏览器的存储中，
// 例如 localStorage、sessionStorage、AsyncStorage 或 IndexedDB。这样，即使用户刷新页面或关闭浏览器，状态也不会丢失。
// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';

// export const useBearStore = create(
//   persist(
//     (set, get) => ({
//       bears: 0,
//       addABear: () => set({ bears: get().bears + 1 }),
//     }),
//     {
//       name: 'food-storage', // 存储的唯一名称
//       storage: createJSONStorage(() => sessionStorage), // 使用 sessionStorage
//     }
//   )
// );

type Immer = <T>(createState: StateCreator<T>) => StateCreator<T>;
//immer 中间件允许你使用可变的方式更新状态，但实际上它会确保状态以不可变的方式更新。
export const immer: Immer = (createState) => {
  return (set, get, store) => {
    type T = ReturnType<typeof createState>;

    store.setState = (updater, replace, ...a) => {
      const nextState = (
        typeof updater === "function" ? produce(updater as any) : updater
      ) as ((s: T) => T) | T | Partial<T>;
      // produce((state) => ({ bears: state.bears + by }))
      return set(nextState as any, replace, ...a);
    };

    return createState(store.setState, get, store);
  };
};
