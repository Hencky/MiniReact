import { updateQueue } from './Component';

/**
 * 给真实DOM添加事件处理函数
 * 为什么做合成事件？
 * 1. 做兼容处理，兼容不同的浏览器
 * 2. 方便扩展逻辑
 * @param {*} dom 真实DOM
 * @param {*} eventType 事件类型
 * @param {*} listener
 */
export function addEvent(dom, eventType, listener) {
  const store = dom.store || (dom.store = {});
  store[eventType] = listener;

  if (!document[eventType]) {
    // 事件委托  不管给哪个DOM元素上绑定事件，最后都统一代理到document上去
    document[eventType] = dispatchEvent;
  }
}

let syntheticEvent = {
  stopPropagation() {
    this.stopping = true;
  },
  stopping: false,
};

function dispatchEvent(event) {
  const eventType = `on${event.type}`;
  updateQueue.isBatchingUpdate = true; // 设置为批量更新模式

  createSyntheticEvent(event);

  let { target } = event;

  // 冒泡
  while (target) {
    const { store } = target;
    const listener = store && store[eventType];
    listener && listener.call(target, syntheticEvent);
    if (syntheticEvent.stopping) {
      break;
    }
    target = target.parentNode;
  }

  Object.keys(syntheticEvent).forEach((key) => {
    syntheticEvent[key] = null;
  });

  updateQueue.batchUpdate();
}

function createSyntheticEvent(nativeEvent) {
  Object.keys(nativeEvent).forEach((key) => {
    syntheticEvent[key] = nativeEvent[key];
  });
}
