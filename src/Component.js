import { createDOM } from './react-dom';

class Component {
  static isReactComponent = true;

  constructor(props) {
    this.props = props;
    this.state = {};
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
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
