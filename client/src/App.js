import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {marked} from 'marked';
import sanitizeHtml from 'sanitize-html'; 

function App() {
  const [content, setContent] = useState("<div>Hellooo</div>");

  useEffect(() => {
    const fetchUIContent = async () => {
      // const response = await axios.get('');
      // setContent(response.data);
    }
    fetchUIContent();
  }, [])
  return (
    <div className="App">
      {/* <div>{sanitizeHtml(marked(content))}</div> */}
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
    </div>
  );
}

export default App;
