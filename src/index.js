import React from './react';
import ReactDOM from './react-dom';

/**
 * 元素是React虚拟DOM元素
 * 它其实是一个普通的js对象，它描述了界面上你想看到的内容
 */

/** jsx编译成createElement实在webpack编译的时候，也就是打包的时候执行的 */
const element1 = (
  <h1 id="title" className="title" style={{ color: 'red' }}>
    hello world
    <span style={{ color: 'green' }}>!</span>
  </h1>
);
const element2 = React.createElement(
  'h1',
  {
    id: 'title',
    className: 'title',
    style: { fontSize: '16px' },
  },
  'hello',
  'world',
  React.createElement('span', { style: { color: 'red ' } }, '!')
);

console.log('element1', JSON.stringify(element1, null, 2));
console.log('element2', element2);

function FunctionComponent(props) {
  return element2;
}

const element3 = React.createElement(FunctionComponent, null, <span>abc</span>);

console.log('element3', element3);

// render方法负责把虚拟DOM变成真实DOM插入到容器里
// ReactDOM.render(element2, document.getElementById('root'));

ReactDOM.render(element3, document.getElementById('root'));
