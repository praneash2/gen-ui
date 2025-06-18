import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import { BASE_UI_CONTENT_JSON, INSTRUCTIONS, LAYOUT_2 } from './constants/BASE_UI_CONTENT';
import Layout from './components/layout/Layout';
import Modal from './components/modal/Modal';

import { responseParser } from './utils/responseParser';
function App() {
  const storedContent = localStorage.getItem('uicontent');
  const [content, setContent] = useState(() => {
  return storedContent ? JSON.parse(storedContent) : BASE_UI_CONTENT_JSON;
});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('');
 
  const fetchUIContent = async () => {
    const constructBody = () => {
      return {
        code: {
          ...content
        },
        theme: theme,
        instructions: INSTRUCTIONS
      }
 
    }
    const requestBody = constructBody();
    console.log(requestBody);

    // const url = `${API_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}`;
    const SESSION_ID = 's_136'
    const response = await axios.post(
      `http://localhost:8000/apps/component_agent/users/u_125/sessions/${SESSION_ID}`,
      {}, // empty JSON body
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    // const response = await axios.post('http://localhost:8000/apps/component_agent/users/u_125/sessions/s_125', {
    //   state: {
    //     key1: 'value1',
    //     key2: 42
    //   }
    // }, {
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })

    if(response.status === 200) {
      
      console.log(response.data)


      axios.post('http://localhost:8000/run', {
        appName: 'component_agent',
        userId: 'u_125',
        sessionId: `${SESSION_ID}`,
        newMessage: {
          role: 'user',
          parts: [
            {
              text: JSON.stringify(requestBody)
            }
          ]
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        const code = JSON.parse(response?.data[0]?.content?.parts[0]?.text);
        console.log('code:', JSON.stringify(code.code));
        const parsedContent = responseParser(JSON.stringify(code.code));
        console.log('parsedContent', parsedContent)
        setContent(parsedContent);
      })
      .catch(error => {
        console.error('Error:', error);
      });

      // const response = await axios.post('', {
      //   requestBody
      // });
      // if(response.status !== 200) {
      //   console.error("Error fetching UI content:", response.statusText);
      //   return;
      // } else if(response.status === 200) {
      //   
      // }

    }




    // setContent(LAYOUT_2);
    // localStorage.setItem('uicontent', JSON.stringify(LAYOUT_2))

    // test sample UI with parser function
    // const parseStatic = responseParser(LAYOUT_3)
    // console.log('parseStatic', parseStatic)
    // setContent(parseStatic);
    setOpen(false);
    setLoading(true);
    setTheme('');
    const timer = setTimeout(() => setLoading(false), 10000);
  }

  const resetToDefaultUI = () => {
    setContent(BASE_UI_CONTENT_JSON);
    localStorage.removeItem('uicontent')
    setOpen(false)
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      if(!storedContent)
        setOpen(true)}, 5000);
    return () => clearTimeout(timer);
  }, [])
  return (
    <div className="App">
      {open && (
        <Modal setOpen={setOpen} showResetLink={storedContent? true: false} resetToDefaultUI={resetToDefaultUI} fetchUIContent={fetchUIContent} theme={theme} setTheme={setTheme} />
 
      )}
      {loading ? (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-white via-pink-50 to-pink-100 text-center">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-8 border-pink-500 border-t-transparent rounded-full animate-spin-slow shadow-2xl"></div>
            <div className="absolute inset-3 border-4 border-pink-300 border-b-transparent rounded-full animate-spin-reverse shadow-inner"></div>
            <div className="absolute inset-6 border-2 border-pink-200 border-l-transparent rounded-full animate-spin-slower"></div>
            <div className="absolute inset-12 bg-pink-500 rounded-full opacity-40 blur-xl"></div>
          </div>
          <h1 className="text-2xl font-bold text-pink-700 animate-pulse">
            Generating your personalised experience...
          </h1>
          <p className="text-sm font-bold text-gray-500">Crafting your custom layout 🧩</p>
          <p className="text-md text-gray-500 mt-2">Sit back while we set everything up ✨</p>
        </div>
 
      ) : (<Layout content={content} setOpen={setOpen}  />)}
    </div>
  );
}
 
 
export default App;
 
 
// import React from 'react';
// import JsxParser from 'react-jsx-parser';
 
// const MyButton = ({ onClick, children }) => {
//   console.log('MyButton rendered with onClick:', onClick);
//   return (
//     <button
//       onClick={onClick}
//       style={{
//         padding: '10px 20px',
//         backgroundColor: '#4f46e5',
//         color: 'white',
//         border: 'none',
//         borderRadius: '6px',
//         cursor: 'pointer',
//       }}
//     >
//       {children}
//     </button>
//   );
// };
 
// const App = () => {
//   const handleClick = () => {
//     alert('✅ Button clicked!');
//   };
 
//   const jsxString = `
//     <MyButton onClick={handleClick}>Click me!</MyButton>
//   `;
 
//   const user = { name: 'John Doe', age: 30 };
//   return (
//     <div style={{ padding: 32 }}>
//       <JsxParser
//       bindings={{ user }}
//       jsx={`
//         <div>
//           <h2>User Profile</h2>
//           <p>Name: {user.name}</p>
//           <p>Age: {user.age}</p>
//         </div>
//       `}
//     />
//       <JsxParser
//       bindings={{ handleClick }}
//       jsx={`
//         <button onClick={handleClick}>
//           Click me!
//         </button>
//       `}
//     />
//     <button onClick={handleClick}>
//           Click me!
//         </button>
//     </div>
//   );
// };
 
// export default App;
 
 
// import React from 'react';
// import JsxParser from 'react-jsx-parser';
 
// const MyButton = ({ onClick, children }) => {
//   console.log("Rendered MyButton with onClick:", onClick); // ✅ should NOT be undefined
//   return (
//     <button onClick={onClick}>
//       {children}
//     </button>
//   );
// };
 
// const handleClick = () => {
//   alert('✅ Clicked!');
// };
 
// const jsxString = `<MyButton onClick={handleClick}>Click me!</MyButton>`;
 
// const App = () => {
//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Test JSX Parser with Function Prop</h2>
 
//       <JsxParser
//         jsx={jsxString}
//         bindings={{ handleClick }}
//         components={{ MyButton }}
//       />
//     </div>
//   );
// };
 
// export default App;
 
// import React from 'react';
// import parse from 'html-react-parser';
 
// // Your component
// const MyButton = ({ onClick, children }) => {
//   console.log('Rendered MyButton with onClick:', onClick);
//   return (
//     <>
//       {/* <button
//         onClick={onClick}
//         style={{
//           padding: '10px 20px',
//           backgroundColor: '#4f46e5',
//           color: 'white',
//           border: 'none',
//           borderRadius: '6px',
//           cursor: 'pointer',
//         }}
//       >
//         {children}
//       </button> */}
//       {children}
//     </>
//   );
// };
 
// // Function registry
// const functionMap = {
//   handleClick: () => alert('✅ Dynamic Button Clicked!'),
// };
 
// // Component registry
// const componentMap = {
//   mybutton: MyButton,
// };
 
// // Parser that maps attributes to real props
// const DynamicRenderer = ({ htmlString }) => {
//   return parse(htmlString, {
//     replace: (domNode) => {
//       if (
//         domNode.type === 'tag' &&
//         componentMap[domNode.name.toLowerCase()]
//       ) {
//         const Component = componentMap[domNode.name.toLowerCase()];
//         const props = {};
 
//         for (const [key, value] of Object.entries(domNode.attribs || {})) {
//           if (key.toLowerCase().startsWith('on')) {
//             // Convert onclick="handleClick" ➜ onClick={handleClick}
//             const reactEventName =
//               'on' + key.slice(2).charAt(0).toUpperCase() + key.slice(3);
//             props[reactEventName] = functionMap[value];
//           } else {
//             props[key] = value;
//           }
//         }
 
//         const children = domNode.children?.map((child) =>
//           child.type === 'text' ? child.data : parse(child)
//         );
 
//         return <Component {...props}>{children}</Component>;
//       }
//     },
//   });
// };
 
 
// // Main app
// const App = () => {
//   const handleClick = () => alert('✅ Dynamic Button Clicked!')
//   const html = '<button onClick={handleClick}>Hello World</button>';
//   const reactElement = parse(html);
 
//   return (
//     // <div style={{ padding: 20 }}>
//     //   <h2>💡 Dynamic Component with Function Binding</h2>
//     //   <DynamicRenderer htmlString={serverHtml} />            
//     // </div>
//     <div>{reactElement}</div>
//   );
// };
 
// export default App;
 
 
// import React from 'react';
// import parse from 'html-react-parser';
 
// const App = () => {
//   const handleClick = () => alert('✅ Dynamic Button Clicked!');
 
//   const html = `<button onclick="handleClick">Hello World</button>`;
 
//   const functionMap = { handleClick };
 
//   const transformed = parse(html, {
//     replace: (domNode) => {
//       if (domNode.type === 'tag' && domNode.name === 'button') {
//         const props = {};
 
//         // Convert onclick="handleClick" -> onClick={handleClick}
//         for (const [key, val] of Object.entries(domNode.attribs || {})) {
//           if (key === 'onclick' && val in functionMap) {
//             props['onClick'] = functionMap[val];
//           }
//         }
 
//         const children = domNode.children?.map((child) =>
//           child.type === 'text' ? child.data : parse(child)
//         );
 
//         return <button {...props}>{children}</button>;
//       }
//     },
//   });
 
//   return (
//     <div style={{ padding: 32 }}>
//       <h2>Parsed HTML with Events</h2>
//       {transformed}
//     </div>
//   );
// };
 
// export default App;
 
 
// import React from 'react';
// import withDynamicHandlers from './withDynamicHandlers';
 
// withDynamicHandlers.js
// import React from 'react';
// import parse, { domToReact } from 'html-react-parser';
// import { Element } from 'domhandler';
 
// const withDynamicHandlers = (html, functionMap = {}) => {
//   const DynamicComponent = () => {
//     // define replace separately so it can be reused in domToReact
//     const replace = (node) => {
//       if (node.type === 'tag') {
//         const el = /** @type {Element} */ (node);
//         const reactProps = {};
 
//         // Convert HTML attributes to valid React props
//         Object.entries(el.attribs || {}).forEach(([attr, val]) => {
//           if (/^on\w+/i.test(attr)) {
//             const reactAttr =
//   'on' +
//   attr.slice(2).charAt(0).toUpperCase() +
//   attr.slice(3).toLowerCase();
//             const fn = functionMap[val];
//             if (typeof fn === 'function') {
//               reactProps[reactAttr] = fn;
//             }
//           } else if (attr === 'style') {
//             reactProps['style'] = Object.fromEntries(
//               val.split(';')
//                 .filter(Boolean)
//                 .map((s) => {
//                   const [k, v] = s.split(':');
//                   return [
//                     k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
//                     v.trim(),
//                   ];
//                 })
//             );
//           } else if (attr === 'class') {
//             reactProps['className'] = val;
//           } else if (!/^on\w+/i.test(attr)) {
//             reactProps[attr] = val;
//           }
//         });
 
//         // Recursively parse children
//         const children = domToReact(el.children, { replace });
 
//         return React.createElement(el.name, reactProps, children);
//       }
//     };
 
//     const transformed = parse(html, { replace });
 
//     return <>{transformed}</>;
//   };
 
//   return DynamicComponent;
// };
 
// // export default withDynamicHandlers;
 
 
 
// // export default withDynamicHandlers;
 
 
// const App = () => {
//   const handleClick = () => alert('✅ Dynamic Button Clicked!');
//   const handleMouseEnter = () => console.log('🖱 Mouse entered');
 
//   const html = `
//     <div>
//       <button onclick="handleClick" style="background-color:#4f46e5;color:#fff;padding:10px 20px;border:none;border-radius:5px;">
//         Hello World
//       </button>
//       <div onMouseEnter="handleMouseEnter" style="margin-top:10px;">Hover Me</div>
//     </div>
//   `;
 
//   const DynamicComponent = withDynamicHandlers(html, {
//     handleClick,
//     handleMouseEnter,
//   });
 
//   return (
//     <div style={{ padding: 32 }}>
//       <h2>HOC: Dynamic HTML with Event Handlers</h2>
//       <DynamicComponent />
//     </div>
//   );
// };
 
// export default App;