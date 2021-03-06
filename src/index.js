import React from './react';
import ReactDOM from './react-dom';

/**
 * 元素是React虚拟DOM元素
 * 它其实是一个普通的js对象，它描述了界面上你想看到的内容
 */

/** jsx编译成createElement实在webpack编译的时候，也就是打包的时候执行的 */
// const element1 = (
//   <h1 id="title" className="title" style={{ color: 'red' }}>
//     hello world
//     <span style={{ color: 'green' }}>!</span>
//   </h1>
// );
// const element2 = React.createElement(
//   'h1',
//   {
//     id: 'title',
//     className: 'title',
//     style: { fontSize: '16px' },
//   },
//   'hello',
//   'world',
//   React.createElement('span', { style: { color: 'red ' } }, '!')
// );

// console.log('element1', JSON.stringify(element1, null, 2));
// console.log('element2', element2);

// ------ 函数组件 ------
// function FunctionComponent(props) {
//   return (
//     <h1 id="title" className="title" style={{ color: 'red' }}>
//       {props.title}
//       <span style={{ color: props.color }}>!</span>
//     </h1>
//   );
// }

// eslint-disable-next-line
// const element3 = React.createElement(
//   FunctionComponent,
//   {
//     title: 'hello world',
//     color: 'green',
//   },
//   <span style={{ color: 'yellow' }}>aaa</span>
// );

// console.log('element3', element3);

// ----- 类组件 -----

/**
 * 类组件和类组件的更新
 * 可以在构造函数里，并且只能在构造函数中给this.state赋值
 * 定义状态对象
 * 属性对象  父组件给的，不能改变，是只读的
 */
// eslint-disable-next-line
class Counter extends React.Component {
  constructor(props) {
    super(props);

    this.state = { number: 0 };
  }

  handleClick = () => {
    this.setState(
      (nextState) => ({ number: nextState.number + 1 }),
      () => {
        console.log('触发回调1', this.state.number);
      }
    );
    console.log(this.state.number);
    this.setState(
      (nextState) => ({ number: nextState.number + 1 }),
      () => {
        console.log('触发回调2', this.state.number);
      }
    );
    console.log(this.state.number);

    Promise.resolve().then(() => {
      console.log('promise', this.state.number);

      this.setState(
        (nextState) => ({ number: nextState.number + 1 }),
        () => {
          console.log('触发回调3', this.state.number);
        }
      );
      console.log(this.state.number);
      this.setState(
        (nextState) => ({ number: nextState.number + 1 }),
        () => {
          console.log('触发回调4', this.state.number);
        }
      );
      console.log(this.state.number);
    });
  };

  render() {
    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={this.handleClick}>
          <span>+</span>
        </button>
      </div>
    );
  }
}

// ----- 生命周期 -----
class Counter2 extends React.Component {
  static defaultProps = {
    name: '计数器',
  };

  constructor(props) {
    super(props);
    this.state = { number: 1 };
  }

  ref = React.createRef(null);

  // componentWillMount() {
  //   console.log('父组件 卸载');
  // }

  // componentDidMount() {
  //   console.log('父组件 did mount');
  // }

  componentDidUpdate(prevProps, prevState, number) {
    console.log('number', number)
  }

  getSnapshotBeforeUpdate() {
    console.log(this.ref)
    return this.state.number + 100;
  }

  shouldComponentUpdate(nextProps, nextState, snapshot) {
    console.log(
      '父组件 shouldComponentUpdate',
      this.state,
      nextState,
      snapshot
    );
    return nextState.number % 2 === 0;
  }

  handleClick = () => {
    this.setState({ number: this.state.number + 1 });
  };

  handleClick2 = () => {
    this.forceUpdate();
  };

  render() {
    console.log('父组件 render');
    return (
      <div id={this.state.number} ref={this.ref}>
        <p>{this.state.number}</p>
        <div>
          {this.state.number === 4 ? null : (
            <ChildCounter count={this.state.number} />
          )}
        </div>
        <div>
          {/* {this.state.number === 4 ? null : (
            <ChildCount2 count={this.state.number} />
          )} */}
        </div>
        <button onClick={this.handleClick}>
          <span>+</span>
        </button>
        <button onClick={this.handleClick2}>
          <span>更新</span>
        </button>
      </div>
    );
  }
}

class ChildCounter extends React.Component {
  // componentWillMount() {
  //   console.log('子组件 卸载');
  // }

  // componentDidMount() {
  //   console.log('子组件 did mount');
  // }

  // componentWillReceiveProps(newProps) {
  //   console.log('子组件 props更新');
  // }

  // 静态方法不能调用this.state 避免死循环
  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      number: nextProps.count * 2,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('子组件 子组件是否更新', nextProps, nextState);
    return nextProps.count % 3 === 0;
  }

  // componentWillUpdate() {
  //   console.log('子组件  will update');
  // }

  // componentDidUpdate() {
  //   console.log('子组件 更新完成');
  // }

  // componentWillUnmount() {
  //   console.log('组件将要卸载');
  // }

  render() {
    console.log('子组件 render', this.props);
    return <div>{this.state.number}</div>;
  }
}

const ChildCount2 = (props) => {
  return <div>{props.count}</div>;
};

// render方法负责把虚拟DOM变成真实DOM插入到容器里
// ReactDOM.render(element2, document.getElementById('root'));
ReactDOM.render(<Counter2 />, document.getElementById('root'));
