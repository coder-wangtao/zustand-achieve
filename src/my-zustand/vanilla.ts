// js 状态管理库

type SetStateInternal<T> = {
  _(
    partial: T | Partial<T> | { _(state: T): T | Partial<T> | void }["_"],
    replace?: boolean | undefined
  ): void;
}["_"];

export interface StoreApi<T> {
  getState: () => T;
  setState: SetStateInternal<T>;
  // 参数是监听状态值变化函数,返回取消订阅的函数
  subscribe: (listener: () => void) => () => void;
  destroy: () => void;
}

export type StateCreator<T> = (
  setState: StoreApi<T>["setState"],
  getState: StoreApi<T>["getState"],
  store: StoreApi<T>
) => T;

type CreateStore = {
  <T>(createState: StateCreator<T>): StoreApi<T>;
  <T>(): (createState: StateCreator<T>) => StoreApi<T>;
};

export const createStore = ((createState) =>
  createState ? createStoreImpl(createState) : createStoreImpl) as CreateStore;

type CreateStoreImpl = <T>(createImpl: StateCreator<T>) => StoreApi<T>;

export const createStoreImpl: CreateStoreImpl = (createState) => {
  type TState = ReturnType<typeof createState>;

  type Listener = () => void;
  // 定义state对象
  let state: TState;
  // listener函数集合，用Set结构保证同一个listener函数只添加一次，避免重复添加
  const listeners: Set<Listener> = new Set();
  // 提供获取state的方法
  const getState: StoreApi<TState>["getState"] = () => state;

  // 更新state状态并调用注册到集合里面的所有listener，触发更新渲染，
  // 至于调用listener如何触发的更新就涉及到react hook的useSyncExternalStore了
  const setState: StoreApi<TState>["setState"] = (partial, replace) => {
    // 如果partial是函数，则调用函数得到nextState，不然直接赋值partial给nextState
    // 比如前文示例increasePopulation，其partial就是(state) => ({ bears: state.bears + 1 })，而removeAllBears的partial就是{ bears: 0 }  （）
    const nextState =
      typeof partial === "function"
        ? (partial as (state: TState) => TState)(state)
        : partial;
    // 通过比对nextState和state决定是否更新state状态以及更新触发渲染
    if (!Object.is(nextState, state)) {
      // const prevState = state;
      // 如果replace为真值，直接替换原来的state
      state =
        replace ?? typeof nextState !== "object"
          ? (nextState as TState)
          : //顶层合并，一旦你需要 设置深层属性，还是要老老实实拷贝
            Object.assign({}, state, nextState);

      // 调用listener触发更新渲染
      listeners.forEach((listener) => {
        listener();
      });
    }
  };

  // 添加listener，返回值提供删除listener的方法
  // 其实这个subscribe会在react useEffect里面执行往Set集合里面添加listener，这个return对应的就是useEffect里面的return，
  const subscribe: StoreApi<TState>["subscribe"] = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // 提供清除所有listener的方法，在后续将被移除，这个基本用不到，用subscibe的return提供清除就满足了
  const destroy: StoreApi<TState>["destroy"] = () => {
    listeners.clear();
  };

  // 包裹成api对象导出，也就是我们创建的那个store
  const api = {
    getState,
    setState,
    subscribe,
    destroy,
  };
  // 调用传入的createState创建state，这个state隐藏在该函数里面，通过对外暴露的api，间接的操作/访问state，其实就是闭包
  // 拿前文示例来说的话，此处的state值就是{bears: 0,increasePopulation: ()=> ...,removeAllBears: ()=> ...}
  state = createState(setState, getState, api);
  return api;
};
