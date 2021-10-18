import { REACT_TEXT } from './constants';

// 为方便dom-diff，将文本节点单独标识
export function wrapToVdom(element) {
  if (typeof element === 'string' || typeof element === 'number') {
    return {
      type: REACT_TEXT,
      props: {
        content: element,
      },
    };
  }

  return element;
}
