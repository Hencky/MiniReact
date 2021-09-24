import { createDOM } from './react-dom';

// 更新队列
export const updateQueue = {
  updaters: new Set(),
  isBatchingUpdate: false, // 当前是否处于批量更新模式，默认false
  batchUpdate() {
    // 批量更新
    this.updaters.forEach((update) => {
      update.updateClassComponent();
    });
    this.isBatchingUpdate = false;
  },
};

class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance; // 类组件实例
    this.pendingStates = []; // 等待生效的状态，可能是一个对象，也可能是一个函数
    this.callbacks = []; // setState回调函数数组
  }

  addState(partialState, callback) {
    this.pendingStates.push(partialState); // 更待更新的状态
    if (typeof callback === 'function') {
      this.callbacks.push(callback); // 状态更新后的回调函数
    }

    // 如果当前是批量更新模式，先缓存updater
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this);
    } else {
      this.updateClassComponent(); // 直接更新组件
    }
  }

  updateClassComponent() {
    if (this.pendingStates.length) {
      this.classInstance.state = this.getState(); // 计算新状态
      this.classInstance.forceUpdate();
      this.callbacks.forEach((cb) => cb());
      this.callbacks.length = 0;
    }
  }

  getState() {
    let { state } = this.classInstance;
    this.pendingStates.forEach((nextState) => {
      // 如果pendingState是一个函数的话，传入老状态，返回新状态
      if (typeof nextState === 'function') {
        nextState = nextState(state);
      }

      state = { ...state, ...nextState };
    });

    this.pendingStates.length = 0;
    return state;
  }
}

class Component {
  static isReactComponent = true;

  constructor(props) {
    this.props = props;
    this.state = {};
    this.updater = new Updater(this);
  }

  /** partial 部分的 */
  setState(partialState, cb) {
    this.updater.addState(partialState, cb);
  }

  forceUpdate() {
    const newVdom = this.render();
    updateClassComponent(this, newVdom);
  }

  render() {
    throw new Error('抽象方法需要子类实现');
  }
}

function updateClassComponent(classInstance, newVdom) {
  const oldDOM = classInstance.dom; // 取出这个类组件上次渲染出来的真实DOM
  const newDOM = createDOM(newVdom);
  oldDOM.parentNode.replaceChild(newDOM, oldDOM);
  classInstance.dom = newDOM;
}

export default Component;
