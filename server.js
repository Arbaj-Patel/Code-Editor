const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend'));

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'editor.html'));
});

app.post('/run', async (req, res) => {
  const { code, language } = req.body;

  // Map languages to Judge0 language_id
  const langMap = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
  csharp: 51 
};

  const langId = langMap[language];
  if (!langId) {
    return res.json({
      output: 'Static or unsupported language. Cannot execute.',
      error: null
    });
  }

  try {
    const response = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
      {
        source_code: code,
        language_id: langId
      },
      {
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': '2f6e7c7603msh7c15bdec43434bdp14a6e7jsn2eb4c1d9425e', // 🔑 REPLACE THIS
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );

    const { stdout, stderr, compile_output, message } = response.data;
    res.json({
      output: stdout || '',
      error: stderr || compile_output || message || ''
    });
  } catch (err) {
    res.json({
      output: '',
      error: 'API Error: ' + err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
