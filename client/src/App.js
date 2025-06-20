import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_UI_CONTENT_JSON, INSTRUCTIONS } from './constants/BASE_UI_CONTENT';
import Layout from './components/layout/Layout';
import Modal from './components/modal/Modal';

// import { responseParser } from './utils/responseParser';
import { responseParserUtil } from './utils/responseUtils';
function App() {
  const storedContent = localStorage.getItem('uicontent');
  const [content, setContent] = useState(() => {
    return storedContent ? JSON.parse(storedContent) : BASE_UI_CONTENT_JSON;
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('');

  const fetchUIContent = () => {
    console.log('✅ Generating New UI Theme...');
    setLoading(true);
    
    const constructBody = () => ({
      code: { ...content },
      theme: theme,
      instructions: INSTRUCTIONS
    });

    const requestBody = constructBody();
    const accessToken = 'ya29.a0AS3H6NxvJw666aTPjTSlawB4WkARtkn91t1qH-VVDNOuWARzuMc547gG72SDn9JI1D0JQg3ywGPFRkv2_g9k_4EdSizRB0diQzfjy00nUbwxJcx9-9lohExq_Oy2By3vzHFgPX9Hbaq9rBc_AN_rKfq0wEYNfmTlp-CKJtD_PtlilrMaCgYKAV4SARASFQHGX2MiyeMHoDUbhl2J1XrGRlaRAQ0182';

    const vertexStreamUrl = process.env.REACT_APP_VERTEX_STREAM_URL;
    const userId = process.env.REACT_APP_USER_ID;

    axios.post(
      vertexStreamUrl,
      {
        class_method: 'stream_query',
        input: {
          user_id: userId,
          message: `{ "role": "user", "parts": [{"text": ${JSON.stringify(JSON.stringify(requestBody))}}]}`
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
    .then(response => {
      console.log('✅ Response:', response);

      const combined_result = response?.data?.filter(item => item.author === 'combine_results_agent');
      const code = (combined_result.length - 1 >= 0) && combined_result[combined_result.length - 1].content?.parts[0]?.text;
      const parsedContent = responseParserUtil(code);

      // for logo
      if (parsedContent?.header) {
        parsedContent.header = parsedContent.header.replace('./logo.png', parsedContent.logo_url || './logo.png');
      }

      setContent(parsedContent);
      localStorage.setItem('uicontent', JSON.stringify(parsedContent));
      setOpen(false);
      setLoading(false);
      setTheme('');
    })
    .catch(error => {
      console.error('❌ Error fetching UI content:', error.response?.data || error.message);
      setLoading(false);
    });
  };

  const resetToDefaultUI = () => {
    setContent(BASE_UI_CONTENT_JSON);
    localStorage.removeItem('uicontent')
    setOpen(false)
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!storedContent)
        setOpen(true)
    }, 5000);
    return () => clearTimeout(timer);
  }, [])
  return (
    <div className="App">
      {open && (
        <Modal setOpen={setOpen} showResetLink={storedContent ? true : false} resetToDefaultUI={resetToDefaultUI} fetchUIContent ={fetchUIContent} theme={theme} setTheme={setTheme} />

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

      ) : (<Layout content={content} setOpen={setOpen} />)}
    </div>
  );
}


export default App;

// import './App.css';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { BASE_UI_CONTENT_JSON, INSTRUCTIONS } from './constants/BASE_UI_CONTENT';
// import Layout from './components/layout/Layout';
// import Modal from './components/modal/Modal';

// import { responseParser } from './utils/responseParser';
// import { responseParserUtil } from './utils/responseUtils';
// function App() {
//   const storedContent = localStorage.getItem('uicontent');
//   const [content, setContent] = useState(() => {
//     return storedContent ? JSON.parse(storedContent) : BASE_UI_CONTENT_JSON;
//   });
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [theme, setTheme] = useState('');

//   const connectToServer = async () => {
//     setLoading(true);
//     const constructBody = () => {
//       return {
//         code: {
//           ...content
//         },
//         theme: theme,
//         instructions: INSTRUCTIONS
//       }
//     }
//     const requestBody = constructBody();
//     const SESSION_ID = 's_129'

//     try {
//       const response = await axios.post(
//         `http://localhost:8000/apps/orchestrator_agent/users/u_125/sessions/${SESSION_ID}`,
//         {},
//         {
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       if (response.status === 200) {
//         fetchUIContent(requestBody, SESSION_ID);
//       }
//     } catch (error) {
//       if (error?.response?.data?.detail.includes("Session already exists")) {
//         fetchUIContent(requestBody, SESSION_ID)
//       } else {
//         console.log(error)
//       }
//     }
//   }

  

//   const fetchUIContent = (requestBody, SESSION_ID) => {
//     axios.post('http://localhost:8000/run', {
//       appName: 'orchestrator_agent',
//       userId: 'u_125',
//       sessionId: `${SESSION_ID}`,
//       newMessage: {
//         role: 'user',
//         parts: [
//           {
//             text: JSON.stringify(requestBody)
//           }
//         ]
//       }
//     }, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     })
//       .then(response => {
//         const combined_result = response?.data?.filter(item => item.author === 'combine_results_agent');
//         const code = (combined_result.length-1 >= 0) && combined_result[combined_result.length-1].content?.parts[0]?.text;
//         const parsedContent = responseParserUtil(code);

//         // for logo
//         if (parsedContent?.header) {
//           parsedContent.header = parsedContent?.header?.replace('./logo.png', (parsedContent?.logo_url || './logo.png'));
//         }

//         setContent(parsedContent);
//         localStorage.setItem('uicontent', JSON.stringify(parsedContent));


//         setOpen(false);
//         setLoading(false);
//         setTheme('');        
//       })
//       .catch(error => {
//         console.error('Error:', error);
//       });
//   }

//   const resetToDefaultUI = () => {
//     setContent(BASE_UI_CONTENT_JSON);
//     localStorage.removeItem('uicontent')
//     setOpen(false)
//   }
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (!storedContent)
//         setOpen(true)
//     }, 5000);
//     return () => clearTimeout(timer);
//   }, [])
//   return (
//     <div className="App">
//       {open && (
//         <Modal setOpen={setOpen} showResetLink={storedContent ? true : false} resetToDefaultUI={resetToDefaultUI} connectToServer={connectToServer} theme={theme} setTheme={setTheme} />

//       )}
//       {loading ? (
//         <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-white via-pink-50 to-pink-100 text-center">
//           <div className="relative w-32 h-32 mb-8">
//             <div className="absolute inset-0 border-8 border-pink-500 border-t-transparent rounded-full animate-spin-slow shadow-2xl"></div>
//             <div className="absolute inset-3 border-4 border-pink-300 border-b-transparent rounded-full animate-spin-reverse shadow-inner"></div>
//             <div className="absolute inset-6 border-2 border-pink-200 border-l-transparent rounded-full animate-spin-slower"></div>
//             <div className="absolute inset-12 bg-pink-500 rounded-full opacity-40 blur-xl"></div>
//           </div>
//           <h1 className="text-2xl font-bold text-pink-700 animate-pulse">
//             Generating your personalised experience...
//           </h1>
//           <p className="text-sm font-bold text-gray-500">Crafting your custom layout 🧩</p>
//           <p className="text-md text-gray-500 mt-2">Sit back while we set everything up ✨</p>
//         </div>

//       ) : (<Layout content={content} setOpen={setOpen} />)}
//     </div>
//   );
// }


// export default App;