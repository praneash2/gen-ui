import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_UI_CONTENT_JSON, INSTRUCTIONS } from './constants/BASE_UI_CONTENT';
import Layout from './components/layout/Layout';
import Modal from './components/modal/Modal';

import { responseParser } from './utils/responseParser';
import { responseParserUtil } from './utils/responseUtils';
function App() {
  const storedContent = localStorage.getItem('uicontent');
  const [content, setContent] = useState(() => {
    return storedContent ? JSON.parse(storedContent) : BASE_UI_CONTENT_JSON;
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('');

  const connectToServer = async () => {
    setLoading(true);
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
    const SESSION_ID = 's_129'

    try {
      const response = await axios.post(
        `http://localhost:8000/apps/component_agent/users/u_125/sessions/${SESSION_ID}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.status === 200) {
        fetchUIContent(requestBody, SESSION_ID);
      }
    } catch (error) {
      if (error?.response?.data?.detail.includes("Session already exists")) {
        fetchUIContent(requestBody, SESSION_ID)
      } else {
        console.log(error)
      }
    }
  }

  const fetchUIContent = (requestBody, SESSION_ID) => {
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
        const code = response?.data[0]?.content?.parts[0]?.text;
        const parsedContent = responseParserUtil(code);
        setContent(parsedContent);
        localStorage.setItem('uicontent', JSON.stringify(parsedContent))
        setOpen(false);
        setLoading(false);
        setTheme('');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

//   axios.post(
//     'https://us-central1-aiplatform.googleapis.com/v1/projects/genuiagent/locations/us-central1/reasoningEngines/5897859536227663872:query',
//     {
//       userId: 'u_125',
//       sessionId: SESSION_ID,
//       newMessage: {
//         role: 'user',
//         parts: [
//           {
//             text: JSON.stringify(requestBody),
//           },
//         ],
//       },
//     },
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${'ya29.a0AS3H6NwM6HxmGauOvfAcEkgD3BI3v8Cm0Idpxfk3ebUJ-emNUDx2Qswgy3SIS6jvSqyDs11KnAqHAo1WClElPS9gG_jNeXDsWut91h8IxH6UcINiuy2wgwVktHxEfnQGm8XjF5X8WHZz66UMYO3DBB1wJpT17sR7rOjgOOZdVig4TbkaCgYKAcASARASFQHGX2MiD-Q7MQWdtdIYUpWNOynkKw0182'}`, // 🔐 Required!
//       },
//     }
//   )
//     .then((response) => {
//       const code = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
//       const parsedContent = responseParserUtil(code);
//       setContent(parsedContent);
//       localStorage.setItem('uicontent', JSON.stringify(parsedContent));
//       setOpen(false);
//       setLoading(false);
//       setTheme('');
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
// };

// const connectToServer = async () => {
//   setLoading(true);

//   const constructBody = () => ({
//     code: { ...content },
//     theme: theme,
//     instructions: INSTRUCTIONS
//   });

//   const requestBody = constructBody();
//   const userId = 'u_125';
//   const accessToken = 'ya29.a0AW4Xtxh4yRYLffHpi2-sBM_kfERljxYLsE6xpo55s9FPST6MRZ3K5SMX49M7_XRF1TxyrobvDq-LeglRtwKspBOp-7Ox-UVb_Li1h3mZCSZ-zXV-2JdbPRCbAFqwgpE8JwxVCzrLHO3twqcyqpDKpsdwqkgkI2gAmVSXKC9mmjBgpRIaCgYKAf4SARASFQHGX2Mi0WpNs6DWpdVmS3zV-w_nMA0182';

//   try {
//     // Step 1: Create a session
//     const createResponse = await axios.post(
//       'https://us-central1-aiplatform.googleapis.com/v1/projects/genuiagent/locations/us-central1/reasoningEngines/5897859536227663872:query',
//       {
//         class_method: 'create_session',
//         input: {
//           user_id: userId
//         }
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${accessToken}`
//         }
//       }
//     );

//     const SESSION_ID = createResponse?.data?.output?.session_id;
//     console.log('✅ Session created:', SESSION_ID);

//     if (SESSION_ID) {
//       fetchUIContent(requestBody, SESSION_ID, accessToken);
//     }
//   } catch (error) {
//     console.error('❌ Error during session creation:', error.response?.data || error.message);
//     setLoading(false);
//   }
// };

// const fetchUIContent = async (requestBody, SESSION_ID, accessToken) => {
//   try {
//     const response = await axios.post(
//       'https://us-central1-aiplatform.googleapis.com/v1/projects/genuiagent/locations/us-central1/reasoningEngines/5897859536227663872:query',
//       {
//         class_method: 'stream_query',
//         input: {
//           user_id: 'u_125',
//           session_id: SESSION_ID,
//           message: `{"role": "user", "parts": [{"text": ${JSON.stringify(JSON.stringify(requestBody))}}]}`
//         }
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${accessToken}`
//         }
//       }
//     );

//     const code = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
//     const parsedContent = responseParserUtil(code);
//     setContent(parsedContent);
//     localStorage.setItem('uicontent', JSON.stringify(parsedContent));
//     setOpen(false);
//     setLoading(false);
//     setTheme('');
//   } catch (error) {
//     console.error('❌ Error fetching UI content:', error.response?.data || error.message);
//     setLoading(false);
//   }
// };


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
        <Modal setOpen={setOpen} showResetLink={storedContent ? true : false} resetToDefaultUI={resetToDefaultUI} connectToServer={connectToServer} theme={theme} setTheme={setTheme} />

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