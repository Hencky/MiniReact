import Component from './Component';
import { wrapToVdom } from './utils';

/**
 *
 * @param {string} type 元素类型
 * @param {Object} config 配置对象
 * @param {*} children 子元素
 */
function createElement(type, config, children) {
  let ref;

  if (config) {
    delete config._source;
    delete config._self;
    ref = config.ref;
    delete config.ref;
  }

  const props = { ...config };

  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
  } else {
    props.children = wrapToVdom(children);
  }

  return {
    type,
    props,
    ref,
  };
}

function createRef() {
  return { current: null };
}

const React = {
  createElement,
  Component,
  createRef,
};

export default React;
