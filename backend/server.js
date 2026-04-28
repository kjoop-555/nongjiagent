import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 强制指定 .env 路径，彻底解决读取问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// 读取密钥
const API_KEY = process.env.VITE_OPENAI_API_KEY;
console.log("读取到的KEY:", API_KEY);

if (!API_KEY || API_KEY.trim() === '') {
  console.error('❌ 请在 .env 填写 DeepSeek API Key');
  process.exit(1);
}
console.log('✅ 密钥读取成功');

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    msg: '后端服务正常运行',
    timestamp: new Date().toISOString()
  });
});

// 聊天接口
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ code: 400, msg: '消息不能为空' });
    }

    console.log(`📨 收到用户消息: ${message}`);

   const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是专业的农业机械智能运维与调度助手，名字叫「农机智脑(AgriSmart)」。针对农机故障、选型、调度问题，给出专业、可操作、安全的回答。"
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        stream: false
      })
    });

    console.log(`🔍 DeepSeek 响应状态: ${response.status}`);
    const data = await response.json();
    console.log(`🔍 DeepSeek 完整返回:`, JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('❌ DeepSeek API 错误:', data.error);
      return res.status(500).json({ 
        code: 500, 
        msg: `API错误: ${data.error.message}` 
      });
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      console.error('❌ 未获取到有效回复，choices为空');
      return res.status(500).json({ code: 500, msg: '未获取到有效回复' });
    }

    console.log(`✅ 回复生成成功，长度: ${reply.length} 字符`);
    res.json({ code: 200, data: reply });

  } catch (err) {
    console.error('❌ 服务器内部错误:', err);
    res.status(500).json({ code: 500, msg: `服务器错误: ${err.message}` });
  }
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`✅ 后端服务已启动，持续监听端口: http://localhost:${PORT}`);
  console.log(`🔍 健康检查地址: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 被占用，请关闭占用端口的程序后重试`);
    process.exit(1);
  } else {
    console.error('❌ 服务启动错误:', err);
    process.exit(1);
  }
});