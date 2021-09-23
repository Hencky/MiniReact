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
  const dom = createDom(vdom);
  container.appendChild(dom);
}

/**
 * 把虚拟dom变成真实dom
 * @param {*} vdom 虚拟dom
 */
function createDom(vdom) {
  // 如果vdom是数字或者字符串，直接返回真实的文本节点
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return document.createTextNode(vdom);
  }

  // 如果不是数字 字符串，就是一个虚拟DOM对象
  const { type, props } = vdom;
  const dom = document.createElement(type);

  /** 使用虚拟DOM的属性，更新刚创建出来的真实dom属性 */
  updateProps(dom, props);

  /** 处理children */
  if (typeof props.chilren === 'string' || typeof props.children === 'number') {
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
  vdom.dom = dom;
  return dom;
}

/**
 *
 * 使用虚拟DOM的属性，更新刚创建出来的真实dom属性
 * @param {*} dom 真实DOM
 * @param {*} newProps 新属性对象
 */
function updateProps(dom, newProps) {
  Object.keys(newProps).forEach((propName) => {
    // children单独处理
    if (propName === 'children') {
      return;
    }

    if (propName === 'style') {
      const styleObj = newProps.style;
      Object.keys(styleObj).forEach((attr) => {
        dom.style[attr] = styleObj[attr];
      });
    } else {
      dom[propName] = newProps[propName];
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
    render(vdomItem, parentDOM );
  });
}

const ReactDOM = {
  render,
};

export default ReactDOM;
