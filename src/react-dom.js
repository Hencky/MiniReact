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
}

/**
 * 把虚拟dom变成真实dom
 * @param {*} vdom 虚拟dom
 */
export function createDOM(vdom) {
  // 如果vdom是数字或者字符串，直接返回真实的文本节点
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return document.createTextNode(vdom);
  }

  // 如果不是数字 字符串，就是一个虚拟DOM对象
  const { type, props } = vdom;
  let dom;

  if (typeof type === 'function') {
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
  updateProps(dom, props);

  /** 处理children */
  if (
    typeof props.children === 'string' ||
    typeof props.children === 'number'
  ) {
    dom.textContent = props.children;
    // 唯一子元素为虚拟DOM元素
  } else if (typeof props.children === 'object' && props.children.type) {
    render(props.children, dom);
  } else if (Array.isArray(props.children)) {
    reconcileChildren(props.children, dom);
  } else {
    dom.textContent = props.children ? props.children.toString() : '';
  }

  // 把真实DOM作为一个dom属性放到虚拟dom，为以后更新做准备
  // vdom.dom = dom;

  return dom;
}

/**
 *
 * 使用虚拟DOM的属性，更新刚创建出来的真实dom属性
 * @param {*} dom 真实DOM
 * @param {*} newProps 新属性对象
 */
function updateProps(dom, newProps) {
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
      dom[key.toLocaleLowerCase()] = newProps[key];
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
  const renderVdom = FunctionComponent(props);
  return createDOM(renderVdom);
}

function mountClassComponent(vdom) {
  // 解构类的定义和类的属性对象
  const { type, props } = vdom;
  // 创建类实例
  const classInstance = new type(props);
  // 调用实例的render方法返回要渲染的虚拟DOM对象
  const renderVdom = classInstance.render();
  // 根据虚拟DOM对象创建真实DOM对象
  const dom = createDOM(renderVdom);
  // 为以后类组件更新，把真实DOM挂在到类的实例上
  classInstance.dom = dom;
  return dom;
}

const ReactDOM = {
  render,
};

export default ReactDOM;
