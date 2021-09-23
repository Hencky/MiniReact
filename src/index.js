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
  },
  'hello',
  'world'
);

console.log('element1', JSON.stringify(element1, null, 2));
console.log('element2', element2);

// render方法负责把虚拟DOM变成真实DOM插入到容器里
ReactDOM.render(element1, document.getElementById('root'));
