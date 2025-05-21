import * as React from "react";
import is from "shared/objectIs";
import { useSyncExternalStore } from "use-sync-external-store/src/useSyncExternalStore";

// Intentionally not using named imports because Rollup uses dynamic dispatch
// for CommonJS interop.
const { useRef, useEffect, useMemo, useDebugValue } = React;

// Same as useSyncExternalStore, but supports selector and isEqual arguments.
// 从该英文注释也可以知道useSyncExternalStoreWithSelector和useSyncExternalStore基本是一样的
export function useSyncExternalStoreWithSelector(
  subscribe,
  getSnapshot,
  getServerSnapshot,
  selector,
  isEqual
) {
  // Use this to track the rendered snapshot.
  const instRef = useRef(null);
  let inst;
  // 判断是否重新赋值instRef
  if (instRef.current === null) {
    inst = {
      hasValue: false,
      value: null,
    };
    instRef.current = inst;
  } else {
    inst = instRef.current;
  }

  const [getSelection, getServerSelection] = useMemo(() => {
    // Track the memoized state using closure variables that are local to this
    // memoized instance of a getSnapshot function. Intentionally not using a
    // useRef hook, because that state would be shared across all concurrent
    // copies of the hook/component.
    let hasMemo = false;
    let memoizedSnapshot;
    let memoizedSelection;
    // 上面这三个变量都是以闭包的形式存在的
    const memoizedSelector = (nextSnapshot) => {
      if (!hasMemo) {
        // 第一次在useSyncExternalStore被执行的时候（具体来说是其里面的getSelection被执行的时候），没有暂存的结果，hasMemo也为false
        // 比如在re-render的时候，该useMemo的deps没有变化的话，hasMemo为true，再次到useSyncExternalStore执行取值state的时候，跳过这里面到后面去计算比对上次的state值和这次的state值
        // 而如果在re-render的时候，该useMemo的deps变了，自然hasMemo为false，但如果有自定义的isEqual，可以快速的从ins.value上取出上一次的state值来和这次的state值比对
        // The first time the hook is called, there is no memoized result.
        hasMemo = true;
        // 快照的所有state值被存下来
        memoizedSnapshot = nextSnapshot;
        // 拿前面的示例来说，(state) => state.bears)就是这儿的selector
        const nextSelection = selector(nextSnapshot); // 这儿还是拿前面示例取值bears来说，初始为0
        // 是否有自定义的比较函数
        if (isEqual !== undefined) {
          // Even if the selector has changed, the currently rendered selection
          // may be equal to the new selection. We should attempt to reuse the
          // current value if possible, to preserve downstream memoizations.
          // 初始inst.hasValue是为false的
          if (inst.hasValue) {
            // 如果inst.hasValue不为空，比对上一次值和这一次的值，如果相同则直接返回上一次的值
            const currentSelection = inst.value;
            if (isEqual(currentSelection, nextSelection)) {
              memoizedSelection = currentSelection;
              return currentSelection;
            }
          }
        }
        // 暂存这次的值
        memoizedSelection = nextSelection;
        // 返回nextSelection
        return nextSelection;
      }

      // We may be able to reuse the previous invocation's result.
      // 之前暂存的所有state值
      const prevSnapshot = memoizedSnapshot;
      // 之前暂存的值
      const prevSelection = memoizedSelection;
      // 比对前后快照的所有state值，如果一样，直接返回前一次暂存的值
      if (is(prevSnapshot, nextSnapshot)) {
        // The snapshot is the same as last time. Reuse the previous selection.
        return prevSelection;
      }
      // 快照的所有state值变更了，则重新取值
      // The snapshot has changed, so we need to compute a new selection.
      const nextSelection = selector(nextSnapshot);

      // If a custom isEqual function is provided, use that to check if the data
      // has changed. If it hasn't, return the previous selection. That signals
      // to React that the selections are conceptually equal, and we can bail
      // out of rendering.
      // 如果有自定义isEqual则再次比对此次取的值和上次的值是否一样，一样的话，直接返回上次的值
      if (isEqual !== undefined && isEqual(prevSelection, nextSelection)) {
        return prevSelection;
      }
      // 暂存此次的快照所有state值
      memoizedSnapshot = nextSnapshot;
      // 暂存此次取得的值
      memoizedSelection = nextSelection;
      return nextSelection;
    };
    // Assigning this to a constant so that Flow knows it can't change.
    // 从取出快照所有的state的selector改为取部分state值的selector
    const maybeGetServerSnapshot =
      getServerSnapshot === undefined ? null : getServerSnapshot;
    const getSnapshotWithSelector = () => memoizedSelector(getSnapshot());
    const getServerSnapshotWithSelector =
      maybeGetServerSnapshot === null
        ? undefined
        : () => memoizedSelector(maybeGetServerSnapshot());
    return [getSnapshotWithSelector, getServerSnapshotWithSelector];
  }, [getSnapshot, getServerSnapshot, selector, isEqual]);
  // 调用useSyncExternalStore hook
  const value = useSyncExternalStore(
    subscribe,
    getSelection, // 这里已经变成取部分state的selector了
    getServerSelection
  );
  // 更新inst
  useEffect(() => {
    // $FlowFixMe[incompatible-type] changing the variant using mutation isn't supported
    inst.hasValue = true;
    // $FlowFixMe[incompatible-type]
    inst.value = value;
  }, [value]);
  // useDebugValue忽略
  useDebugValue(value);
  // 返回调用useSyncExternalStore后的返回值
  return value;
}
