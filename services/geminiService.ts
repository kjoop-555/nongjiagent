import { MessageRole, ChatMessage } from "../types";
// ===== 多模态消息类型定义 =====

// 文本或图片内容
type LLMContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

// 单条消息结构
type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: LLMContent[];
};


// CONFIGURATION
// Security: Read from .env file (via process.env provided by Vite)
//const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// 您的 OpenAI 代理地址 (ChatAnywhere)
const API_BASE_URL = "https://nongjiagent.onrender.com/api/chat";

// 核心系统提示词：这里定义了三个功能的具体行为
const SYSTEM_INSTRUCTION = `你是一个专业的农业机械智能运维与调度助手,名字叫「农机智脑(AgriSmart)」。
你的目标不是给“看起来专业”的答案，而是给**能真正干完活、不穿帮、可落地的方案**。

你需要允许用户使用【日常大白话】描述问题，并自动补全农业与机械参数。

━━━━━━━━━━━━━━━━━━━━
【一、通用工作原则（非常重要）】

1. 用户输入可能不专业、不完整、不规范，你必须：
   - 主动理解真实意图
   - 自动推断并补全必要参数
   - 明确说明你的判断依据

2. 在任何涉及【选型、调度、工期】的问题中：
   - 必须先判断：**能不能在指定天数内干完**
   - 如果不能，必须明确指出“不行”，并给出替代方案（加机、换机、延长时间等）

3. 所有结论必须逻辑自洽，禁止出现：
   - 表格和甘特图对不上
   - 面积、天数、能力明显算不通的情况（穿帮）

4. 默认使用【中文（简体）】，语气专业但通俗，避免堆砌术语。

━━━━━━━━━━━━━━━━━━━━
【二、你具备的核心功能模块】

你一共具备 6 个功能模块，根据用户问题自动调用一个或多个。

────────────────────
① 智能选型（选什么机）

你需要综合考虑以下因素（如用户未明确给出，可合理推断）：
- 作业地点（省/地区，用于判断主流品牌和售后）
- 作物种类（玉米、小麦、水稻等）
- 地块面积（支持 长×宽 的口语描述）
- 预算范围
- 幅宽要求或作业效率目标
- 马力段需求
- 作业季节
- 土壤类型（沙土 / 黏土 / 黑土等）
- 土壤含水率与压实风险

【关键规则】：
- 黏土 + 含水率高 + 雨后/秋收 → 优先推荐【履带式机具】
- 必须解释为什么选轮式或履带式，不能只给结论

【输出格式】：
- 使用 Markdown 表格
- 每个方案需说明“适用原因”
- 至少给 1 个优选方案 + 1 个备选方案

────────────────────
② 作业能力与可行性评估（能不能干完）

在涉及“几天干完”“来不来得及”时，你必须：
- 根据机具幅宽、作业效率、日有效作业时间
- 评估单机或多机的日作业能力
- 明确给出：可行 / 不可行

如果不可行，必须说明瓶颈在哪里。

────────────────────
③ 作业调度与排产（怎么干）

你需要解决多地块、多机具、多品牌的调度问题，包括：
- 不同机具的马力段、效率、日成本不同
- 地块与机具之间存在转场距离

【必须支持】：
- 距离矩阵（用于判断先后顺序）
- 不同机具混合调度
- 成本与工期权衡

【输出要求】：
1. 一个清晰的 Markdown 调度表
2. 必须包含一个 Mermaid gantt 甘特图，时间轴与表格一致

────────────────────
④ 故障诊断与维修建议（怎么修）

支持多种输入形式：
- 文字描述（异响、抖动、无力等）
- 图片（漏油、断裂、磨损）
- 视频（异常声音、运动不稳）
- 表格（振动、温度、转速等数据）

【输出结构必须包含】：
- 故障判断（最可能的故障点）
- 判断依据（来自图片/视频/数据/描述）
- 分步骤维修方案（可操作）

────────────────────
⑤ 服务与维修保障（去哪修）

当涉及维修、保养、售后时：
- 推荐就近的维修站或企业服务中心
- 说明支持品牌
- 给出距离或相对位置
- 区分“企业维修中心 / 授权服务站”

────────────────────
⑥ 农艺与土壤适配建议（辅助决策）

在条件允许时：
- 根据土壤含水率、压实风险
- 给出机具类型建议（如是否履带）
- 避免对土壤结构造成二次伤害

━━━━━━━━━━━━━━━━━━━━
【三、输出规范】

- 不要输出 JSON
- 使用 Markdown 渲染文本
- 表格要对齐、字段清晰
- 甘特图必须真实可读
- 允许给出“如果……则……”的替代方案

你的最终目标是：
👉 **让一个不懂机械的农户，也能按你的方案把活干完。
`;

// 本地维护的消息历史记录 (OpenAI 格式)
let messageHistory: LLMMessage[] = [];


// 初始化聊天：设置系统提示词
export const initializeChat = () => {
  messageHistory = [
    {
      role: "system",
      content: [{ type: "text", text: SYSTEM_INSTRUCTION }]
    }
  ];
  console.log("Chat Service Initialized (New Session via OpenAI/ChatAnywhere)");
};

// 恢复聊天记录：将 UI 的消息格式转换为 OpenAI 的消息格式
export const restoreChatSession = (history: ChatMessage[]) => {
  // 重置并带上系统提示词
  messageHistory = [
  {
    role: "system",
    content: [{ type: "text", text: SYSTEM_INSTRUCTION }]
  }
];
  // 填充历史
  history.forEach(msg => {
    messageHistory.push({
      role: msg.role === MessageRole.USER ? "user" : "assistant",
      content: [{ type: "text", text: msg.text }]
    });
  });
  console.log("Chat Session Restored. Messages:", messageHistory.length);
};

// 发送消息
// 发送消息（支持文本 + 图片）
export const sendMessageToGemini = async (
  message: string,
  imageUrls?: string[]
): Promise<string> => {

  // 如果历史为空（虽然 App.tsx 会调用 initialize，但做个兜底）
  if (messageHistory.length === 0) initializeChat();
  
  // 将用户消息加入历史
  const userContent: LLMContent[] = [
  { type: "text", text: message }
];

if (imageUrls && imageUrls.length > 0) {
  imageUrls.forEach(url => {
    userContent.push({
      type: "image_url",
      image_url: { url }
    });
  });
}

messageHistory.push({
  role: "user",
  content: userContent
});



  // if (!API_KEY) {
  //   return getFallbackResponse(message);
  // }

  try {
    const response = await fetch(API_BASE_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    message: message,
    history: messageHistory
  })
});

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API Error Detail:", errorData);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const botContent = data.data || "";

    // 将 AI 回复加入历史，保持上下文
 messageHistory.push({
  role: "assistant",
  content: [{ type: "text", text: botContent }]
});

    return botContent;

  } catch (error: any) {
    console.error("Service Connection Failed:", error);
    return "连接服务器失败，请检查您的 API Key 是否正确，或网络是否通畅。";
  }
};

/**
 * 离线/演示模式 (当没有 API Key 时触发)
 */
const getFallbackResponse = (query: string): string => {
  const lower = query.toLowerCase();
  
  if (lower.includes("排期") || lower.includes("计划") || lower.includes("调度")) {
    return `**(演示模式 - 未配置 Key)** 网络连接失败。这里是一个示例排期表：

| 任务名称 | 农机型号 | 开始日期 | 工期 | 状态 |
| :--- | :--- | :--- | :--- | :--- |
| 玉米抢收 | 约翰迪尔 8R | 2023-10-01 | 3天 | 进行中 |
| 小麦播种 | 雷肯播种机 | 2023-10-05 | 4天 | 待定 |

\`\`\`mermaid
gantt
  title 离线示例排期
  dateFormat YYYY-MM-DD
  axisFormat %m-%d
  section 抢收
  玉米抢收 :active, t1, 2023-10-01, 3d
  section 播种
  小麦播种 :t2, after t1, 4d
\`\`\`
    `;
  }

  if (lower.includes("推荐") || lower.includes("选型") || lower.includes("买")) {
    return `**(演示模式 - 未配置 Key)** 网络连接失败。为您推荐以下机型：

| 品牌 | 型号 | 马力 | 幅宽 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| 芬特 (Fendt) | 1050 Vario | 517 HP | N/A | 适合大面积重负荷深翻作业 |
| 凯斯 (Case IH) | Magnum 400 | 396 HP | N/A | 适合牵引重型播种机 |
    `;
  }

  return `抱歉，无法连接到服务器。请检查网络或 API Key 设置。`;
};
