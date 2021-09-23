import Component from './Component';

/**
 *
 * @param {string} type 元素类型
 * @param {Object} config 配置对象
 * @param {*} children 子元素
 */
function createElement(type, config, children) {
  if (config) {
    delete config._source;
    delete config._self;
  }

  const props = { ...config };

  if (arguments.length > 3) {
    children = Array.prototype.slice.call(arguments, 2);
  }
  props.children = children;

  return {
    type,
    props,
  };
}

const React = {
  createElement,
  Component,
};

export default React;
