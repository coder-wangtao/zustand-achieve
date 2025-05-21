// react 状态管理库

// import {useSyncExternalStore} from "react";
import { StateCreator, StoreApi, createStore } from "./vanilla";

import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector";
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "subscribe">;

type WithReact<S extends ReadonlyStoreApi<unknown>> = S & {
  getServerState?: () => ExtractState<S>;
};

export type UseBoundStore<S extends WithReact<ReadonlyStoreApi<unknown>>> = {
  (): ExtractState<S>;
  <U>(
    selector: (state: ExtractState<S>) => U,
    equals?: (a: U, b: U) => boolean
  ): U;
} & S;

type Create = {
  <T>(createState: StateCreator<T>): UseBoundStore<StoreApi<T>>;
  <T>(): (createState: StateCreator<T>) => UseBoundStore<StoreApi<T>>;
};

export const create = function <T>(createState: StateCreator<T>) {
  //相当于就是发布订阅模式的发布函数
  return createState ? createImpl(createState) : createImpl;
} as Create;

function createImpl(createState: StateCreator<T>) {
  const api =
    typeof createState === "function" ? createStore(createState) : createState;

  const useBoundStore = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn);

  return useBoundStore;
}

export function useStore<TState, StateSlice>(
  api: WithReact<StoreApi<TState>>,
  selector: (state: TState) => StateSlice = api.getState as any,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean
) {
  //useSyncExternalStore

  //useSelector
  //需要给他传入外部 store 的 subscribe 方法 和  获取状态快照的方法，可以理解为 getState 方法
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getState,
    selector, //一个是选择返回指定状态的 selector 函数  根据selector入参获取Snapshot相应属性，避免一些更新
    equalityFn //自定义的相等性检查函数。 判断原数据和当前数据是否一致（浅比较）
  );

  return slice;
}
