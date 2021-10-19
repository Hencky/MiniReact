import { compareTwoVdom } from './react-dom';

// 更新队列
export const updateQueue = {
  updaters: new Set(),
  isBatchingUpdate: false, // 当前是否处于批量更新模式，默认false
  batchUpdate() {
    // 批量更新
    this.updaters.forEach((update) => {
      update.updateComponent();
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
    this.pendingStates.push(partialState); // 待更新的状态
    if (typeof callback === 'function') {
      this.callbacks.push(callback); // 状态更新后的回调函数
    }

    this.emitUpdate();
  }

  // 不管属性变化，还是状态变化，都会更新
  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    // 如果当前是批量更新模式，先缓存updater
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this);
    } else {
      this.updateComponent(); // 直接更新组件
    }
  }

  updateComponent() {
    if (this.nextProps || this.pendingStates.length) {
      shouldUpdate(this.classInstance, this.nextProps, this.getState());
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
    if (Component.getDerivedStateFromProps) {
      const partialState = Component.getDerivedStateFromProps(
        this.props,
        this.state
      );
      if (partialState) {
        this.state = { ...this.state, ...partialState };
      }
    }

    this.updateComponent();
  }

  updateComponent() {
    const newRenderVdom = this.render();
    const oldRenderVdom = this.oldRenderVdom;

    // 深度比较新旧两个虚拟DOM
    compareTwoVdom(oldRenderVdom.dom.parentNode, oldRenderVdom, newRenderVdom);

    this.oldRenderVdom = newRenderVdom;

    if (this.componentDidUpdate) {
      this.componentDidUpdate();
    }
  }

  render() {
    throw new Error('抽象方法需要子类实现');
  }
}

/**
 * 判断组件是否需要更新
 * @param {*} classInstance 组件实例
 * @param {*} nextState 新状态
 */
function shouldUpdate(classInstance, nextProps, nextState) {
  let willUpdate = true;

  // shouldComponentUpdate返回false不继续更新
  if (
    classInstance.shouldComponentUpdate &&
    !classInstance.shouldComponentUpdate(nextProps, nextState)
  ) {
    willUpdate = false;
  }

  if (willUpdate && classInstance.componentWillUpdate) {
    classInstance.componentWillUpdate();
  }

  if (nextProps) {
    classInstance.props = nextProps;
  }

  if (classInstance.constructor.getDerivedStateFromProps) {
    const partialState = classInstance.constructor.getDerivedStateFromProps(
      nextProps,
      classInstance.state
    );
    if (partialState) {
      nextState = { ...nextState, ...partialState };
    }
  }

  classInstance.state = nextState; // 不管组件是否刷新，组件的state一定要改变

  if (willUpdate) {
    classInstance.updateComponent();
  }
}

export default Component;
