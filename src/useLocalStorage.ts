"use client";
import { useSyncExternalStore } from "react";

export function useLocalStorage(key: string, initialValue?: unknown) {
  //TODO:3
  const getSnapshot = () => localStorage.getItem(key) as string;

  const subscribe = (listener: () => void) => {
    //TODO:2
    window.addEventListener("storage", listener);
    return () => void window.removeEventListener("storage", listener);
  };

  //1.mount阶段会调用getSnapshot获取初始state 返回出去
  //2.useEffect里回调subscribe，listener:会判断新旧值是否相同，如果不相同更新Hook对象memoizedState属性，触发更新渲染
  const store = useSyncExternalStore(subscribe, getSnapshot);

  const setState = (v: unknown) => {
    const prevState = JSON.parse(store);
    const nextState = typeof v == "function" ? v(prevState) : v;

    window.localStorage.setItem(key, JSON.stringify(nextState));

    if (nextState) {
      //TODO:1
      window.dispatchEvent(
        new StorageEvent("storage", {
          key,
          newValue: JSON.stringify(nextState),
        })
      );
    }
  };

  return [store ? JSON.parse(store) : initialValue, setState] as const;
}

//TODO:4更新
