import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import { BASE_UI_CONTENT } from './constants/BASE_UI_CONTENT';
import Layout from './components/layout/Layout';
import Modal from './components/modal/Modal';
function App() {
  const [content, setContent] = useState(BASE_UI_CONTENT);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUIContent = async () => {
    // const response = await axios.get('');
    // setContent(response.data);
    setOpen(false);
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 10000);
  }
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 10000);
    return () => clearTimeout(timer);
  }, [])
  return (
    <div className="App">
      {open && (
        <Modal setOpen={setOpen} fetchUIContent={fetchUIContent} />

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

      ) : (<Layout content={content} />)}

    </div>
  );
}

export default App;
