import { REACT_TEXT } from './constants';
import { addEvent } from './event';

/**
 *
 * 1. 把virtual dom变成真实dom
 * 2. 把虚拟dom上的属性同步到dom上
 * 3. 把虚拟dom的children也都变成真实dom挂在到自己的dom上 dom.appendChild
 * 4. 把自己挂载到容器上
 * @param {*} vdom 要渲染的虚拟dom
 * @param {*} container 插入容器
 */
function render(vdom, container) {
  const dom = createDOM(vdom);
  container.appendChild(dom);
  dom.componentDidMount && dom.componentDidMount();
}

/**
 * 把虚拟dom变成真实dom
 * @param {*} vdom 虚拟dom
 */
export function createDOM(vdom) {
  // 如果不是数字 字符串，就是一个虚拟DOM对象
  const { type, props } = vdom;
  let dom;

  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.content);
  } else if (typeof type === 'function') {
    // 类函数
    if (type.isReactComponent) {
      return mountClassComponent(vdom);
      // 自定义的函数组件
    } else {
      dom = mountFunctionComponent(vdom);
    }
  } else {
    dom = document.createElement(type);
  }

  /** 使用虚拟DOM的属性，更新刚创建出来的真实dom属性 */
  if (props) {
    updateProps(dom, {}, props);
    /** 处理children */
    if (typeof props.children === 'object' && props.children.type) {
      render(props.children, dom);
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom);
    }
  }

  // 把真实DOM作为一个dom属性放到虚拟dom，为以后更新做准备
  // 根据一个vdom创建出来一个真实dom之后，真实DOM挂载到vdom.dom上
  vdom.dom = dom;

  return dom;
}

/**
 *
 * 使用虚拟DOM的属性，更新刚创建出来的真实dom属性
 * @param {*} dom 真实DOM
 * @param {*} newProps 新属性对象
 */
function updateProps(dom, oldProps, newProps) {
  Object.keys(newProps).forEach((key) => {
    // children单独处理
    if (key === 'children') {
      return;
    }

    if (key === 'style') {
      const styleObj = newProps.style;
      Object.keys(styleObj).forEach((attr) => {
        dom.style[attr] = styleObj[attr];
      });
    } else if (key.startsWith('on')) {
      // 给真实dom加事件
      addEvent(dom, key.toLocaleLowerCase(), newProps[key]);
    } else {
      dom[key] = newProps[key];
    }
  });
}

/**
 *
 * @param {*} childrenVdom 子元素的虚拟DOM
 * @param {*} parentDOM 父元素的真实DOM
 */
function reconcileChildren(childrenVdom, parentDOM) {
  childrenVdom.forEach((vdomItem) => {
    render(vdomItem, parentDOM);
  });
}

/**
 * 把一个类型为自定义函数组件的虚拟DOM转换为真实DOM并返回
 * @param {*} vdom
 */
function mountFunctionComponent(vdom) {
  const { type: FunctionComponent, props } = vdom;
  let renderVdom = FunctionComponent(props);
  vdom.renderVdom = renderVdom;
  return createDOM(renderVdom);
}

function mountClassComponent(vdom) {
  // 解构类的定义和类的属性对象
  const { type, props } = vdom;
  // 创建类实例
  const classInstance = new type(props);

  // 类组件虚拟dom的classInstance属性指向这个类组件的实例
  vdom.classInstance = classInstance;

  if (classInstance.componentWillMount) {
    classInstance.componentWillMount();
  }

  // 调用实例的render方法返回要渲染的虚拟DOM对象
  const renderVdom = classInstance.render();

  // 把将要渲染的虚拟dom添加到类实例上
  classInstance.oldRenderVdom = vdom.oldRenderVdom = renderVdom;

  // 根据虚拟DOM对象创建真实DOM对象
  const dom = createDOM(renderVdom);

  if (classInstance.componentDidMount) {
    dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
  }

  // 为以后类组件更新，把真实DOM挂在到类的实例上
  classInstance.dom = dom;
  return dom;
}

/**
 * 当前组件进行DOM-DIFF
 * @param {*} parentDOM 当前组件挂载父真实dom节点
 * @param {*} oldVdom 上一次的虚拟DOM
 * @param {*} newVdom 新虚拟DOM
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  if (!oldVdom && !newVdom) {
    return;
  }

  // 删除DOM
  if (oldVdom && !newVdom) {
    let currentDOM = findDOM(oldVdom); // 找到此虚拟DOM对应的真实DOM
    if (currentDOM) {
      parentDOM.removeChild(currentDOM);
    }

    // will Unmount生命周期
    oldVdom.classInstance?.componentWillUnmount?.();

    return;
  }

  // 新增DOM
  if (!oldVdom && newVdom) {
    let newDOM = createDOM(newVdom);
    // TODO: 不能写死成appentChild
    if (nextDOM) {
      parentDOM.insertBefore(nextDOM, newDOM);
    } else {
      parentDOM.appendChild(newDOM);
    }
    return;
  }

  // 更新 dom的type不同
  if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    const oldDOM = findDOM(oldVdom);
    const newDOM = createDOM(newVdom);

    parentDOM.replaceChild(newDOM, oldDOM);

    oldVdom.classInstance?.componentWillUnmount?.();

    return;
  }

  // 更新,并且类型一样,可以复用老节点,进行深度DOM-diff
  // 更新自己属性，深度比较子DOM
  updateElement(oldVdom, newVdom);
  return;
}

function updateElement(oldVdom, newVdom) {
  if (oldVdom.type === REACT_TEXT && newVdom.type === REACT_TEXT) {
    const currentDOM = (newVdom.dom = oldVdom.dom);
    currentDOM.textContent = newVdom.props.content; // 直接修改老的DOM节点文件
  }
  // 原生组件 div等
  else if (typeof oldVdom.type === 'string') {
    let currentDOM = (newVdom.dom = oldVdom.dom);
    updateProps(currentDOM, oldVdom.props, newVdom.props);
    // 只有原生的组件，div span等才会进行深度对比
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (typeof oldVdom.type === 'function') {
    if (oldVdom.type.isReactComponent) {
      // 新旧组件都是类组件，进行类组件更新
      updateClassComponent(oldVdom, newVdom);
    } else {
      // 新旧组件都是函数组件，进行函数组件更新
      // updateFunctionComponent(oldVdom, newVdom);
    }
  }
}

function updateClassComponent(oldVdom, newVdom) {
  const classInstance = (newVdom.classInstance = oldVdom.classInstance);
  newVdom.oldRenderVdom = oldVdom.oldRenderVdom;

  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps();
  }

  classInstance.updater.emitUpdate(newVdom.props);
}

/**
 *
 * @param {*} parentDOM 父dom节点
 * @param {*} oldVChildren 旧子元素
 * @param {*} newVChildren 新子元素
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  oldVChildren = Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren];
  newVChildren = Array.isArray(newVChildren) ? newVChildren : [newVChildren];
  const maxLength = Math.max(oldVChildren.length, newVChildren.length);
  for (let i = 0; i <= maxLength; i += 1) {
    compareTwoVdom(parentDOM, oldVChildren[i], newVChildren[i]);
  }
}

/**
 * 查找虚拟DOM对应的真实DOM
 * @param {*} oldVdom
 */
function findDOM(vdom) {
  const { type } = vdom || {};
  let dom;
  if (typeof type === 'function') {
    // 组件类型
    dom = findDOM(vdom.oldRenderVdom);
  } else {
    // 普通字符串
    dom = vdom.dom;
  }

  return dom;
}

const ReactDOM = {
  render,
};

export default ReactDOM;
