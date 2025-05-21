import { produce } from "immer";

// 初始状态
const state = {
  user: {
    name: "李雷",
    age: 20,
  },
  loggedIn: false,
};

// 使用 produce 创建新状态
const nextState = produce((draft) => {
  // 在草稿对象上进行修改
  draft.user.age = 21; // 更新年龄
  draft.loggedIn = true; // 设置已登录状态
});

console.log(state); // { user: { name: '李雷', age: 20 }, loggedIn: false }
// console.log(nextState); // { user: { name: '李雷', age: 21 }, loggedIn: true }
