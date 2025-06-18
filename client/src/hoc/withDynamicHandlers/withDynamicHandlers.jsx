import React from 'react';
import parse, { domToReact } from 'html-react-parser';

const attributeNameMap = {
  class: 'className',
  for: 'htmlFor',
  onclick: 'onClick',
  onmouseenter: 'onMouseEnter',
  onmouseleave: 'onMouseLeave',
  onmouseover: 'onMouseOver',
  onmouseout: 'onMouseOut',
  onfocus: 'onFocus',
  onblur: 'onBlur',
  onchange: 'onChange',
  onsubmit: 'onSubmit',
  onkeydown: 'onKeyDown',
  onkeyup: 'onKeyUp',
  oninput: 'onInput',
};

const voidTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr',
  'img', 'input', 'link', 'meta', 'param',
  'source', 'track', 'wbr',
]);

const withDynamicHandlers = (htmlString, functionMap = {}) => {
  const replace = (node) => {
    if (node.type === 'tag') {
      const reactAttrs = {};

      for (const [attr, val] of Object.entries(node.attribs || {})) {
        const lowerAttr = attr.toLowerCase();
        const reactAttr = attributeNameMap[lowerAttr] || lowerAttr;

        // Event handler
        if (reactAttr.startsWith('on') && typeof val === 'string') {
          const handlerFn = functionMap[val];
          if (typeof handlerFn === 'function') {
            reactAttrs[reactAttr] = handlerFn;
          } else {
            console.warn(`Missing function for "${val}"`);
          }
        }
        // Inline styles
        else if (reactAttr === 'style') {
          reactAttrs.style = Object.fromEntries(
            val.split(';')
              .filter(Boolean)
              .map((s) => {
                const [k, v] = s.split(':');
                return [
                  k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
                  v.trim(),
                ];
              })
          );
        }
        // Other attributes
        else {
          reactAttrs[reactAttr] = val;
        }
      }

      return React.createElement(
        node.name,
        reactAttrs,
        voidTags.has(node.name) ? undefined : domToReact(node.children, { replace }) // recursive
      );
    }

    return undefined;
  };

  const transformed = parse(htmlString, { replace });

  return () => <>{transformed}</>;
};


export default withDynamicHandlers;
