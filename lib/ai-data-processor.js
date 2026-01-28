// 简化版本的验证器，因为我们不能直接导入TypeScript模块
function getFieldValidator() {
  // 简化版本的字段验证器
  const FieldValidator = {
    validateRegulationFields: (data) => {
      const requiredFields = [
        'title', 'region', 'timestamp', 'summary', 'severity', 'category'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !data[field] || data[field] === ''
      );
      
      return {
        isValid: missingFields.length === 0,
        missingFields
      };
    },
    
    validateCaseFields: (data) => {
      const requiredFields = [
        'title', 'court', 'jurisdiction', 'caseType', 'filingDate',
        'status', 'parties', 'description', 'impactLevel'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !data[field] || data[field] === '' || 
        (Array.isArray(data[field]) && data[field].length === 0)
      );
      
      return {
        isValid: missingFields.length === 0,
        missingFields
      };
    }
  };
  
  return FieldValidator;
}

// 实际的AI数据清洗函数
async function processWithAI(rawData, dataType) {
  console.log(`Processing ${rawData.length} ${dataType} with AI...`);
  
  // 获取验证器
  const FieldValidator = getFieldValidator();
  
  // 使用项目中现有的AI服务进行数据清洗和标准化
  const processedData = [];
  
  // 优先使用环境变量指定的免费API配置
  const useOpenRouter = process.env.USE_OPENROUTER === 'true';
  const useHuggingFace = process.env.USE_HUGGINGFACE === 'true';
  const useTogether = process.env.USE_TOGETHER === 'true';
  
  for (const item of rawData) {
    try {
      let cleanedItem;
      
      if (useOpenRouter || useHuggingFace || useTogether) {
        // 尝试使用免费API进行数据清洗
        cleanedItem = await callFreeAIService(item, dataType);
      } else {
        // 使用模拟实现（如果未配置任何免费API）
        cleanedItem = await simulateAICleaning(item, dataType);
      }
      
      processedData.push(cleanedItem);
    } catch (error) {
      console.error(`Error processing item ${item.id || 'unknown'} with AI:`, error);
      // 如果AI处理失败，使用基本清理
      processedData.push(basicClean(item, dataType));
    }
  }
  
  // 验证清洗后的数据
  const validatedData = processedData.map((item) => {
    if (dataType === 'regulation') {
      const validation = FieldValidator.validateRegulationFields(item);
      if (!validation.isValid) {
        console.warn(`Invalid regulation data: ${validation.missingFields.join(', ')}`, item);
      }
    } else if (dataType === 'case') {
      const validation = FieldValidator.validateCaseFields(item);
      if (!validation.isValid) {
        console.warn(`Invalid case data: ${validation.missingFields.join(', ')}`, item);
      }
    }
    return item;
  });
  
  console.log(`Processed ${validatedData.length} ${dataType} successfully`);
  return validatedData;
}

// 调用免费AI服务进行数据清洗
async function callFreeAIService(item, dataType) {
  // 使用fetch调用免费AI API
  const useOpenRouter = process.env.USE_OPENROUTER === 'true';
  const useHuggingFace = process.env.USE_HUGGINGFACE === 'true';
  const useTogether = process.env.USE_TOGETHER === 'true';
  
  let apiUrl, apiKey, model, headers, payload;
  
  if (useOpenRouter) {
    // OpenRouter配置
    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY;
    model = 'mistralai/mistral-7b-instruct:free';
    
    headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://jurisguard-gemini.vercel.app',
      'X-Title': 'JurisGuard Gemini'
    };
    
    const prompt = dataType === 'regulation' ? 
      constructRegulationPrompt(item) : 
      constructCasePrompt(item);
      
    payload = {
      model: model,
      messages: [
        {
          role: "system",
          content: "你是一个专业的数据清洗助手，专门处理法律合规数据。请严格按照要求的标准格式返回JSON数据。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
  } else if (useHuggingFace) {
    // Hugging Face配置
    const modelId = process.env.HUGGINGFACE_MODEL_ID || 'microsoft/DialoGPT-medium';
    apiUrl = `https://api-inference.huggingface.co/v1/models/${modelId}`;
    apiKey = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY;
    
    headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    
    const prompt = dataType === 'regulation' ? 
      constructRegulationPrompt(item) : 
      constructCasePrompt(item);
      
    payload = {
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        return_full_text: false
      }
    };
  } else if (useTogether) {
    // Together AI配置
    apiUrl = 'https://api.together.xyz/v1/chat/completions';
    apiKey = process.env.TOGETHER_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY;
    model = 'togethercomputer/StripedHyena-Nous-7B';
    
    headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    
    const prompt = dataType === 'regulation' ? 
      constructRegulationPrompt(item) : 
      constructCasePrompt(item);
      
    payload = {
      model: model,
      messages: [
        {
          role: "system",
          content: "你是一个专业的数据清洗助手，专门处理法律合规数据。请严格按照要求的标准格式返回JSON数据。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
  }
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${await response.text()}`);
    }
    
    const data = await response.json();
    
    // 解析AI响应并提取清洗后的数据
    let cleanedData;
    if (useHuggingFace) {
      // Hugging Face返回格式
      cleanedData = data[0]?.generated_text || JSON.stringify(item);
    } else {
      // OpenRouter/Together AI返回格式
      cleanedData = data.choices?.[0]?.message?.content || JSON.stringify(item);
    }
    
    // 尝试解析AI返回的JSON数据
    try {
      // 查找JSON对象的起始和结束位置
      const jsonStart = cleanedData.indexOf('{');
      const jsonEnd = cleanedData.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonData = JSON.parse(cleanedData.substring(jsonStart, jsonEnd + 1));
        return {
          ...item,
          ...jsonData,
          id: jsonData.id || item.id || `${dataType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
        };
      } else {
        // 如果没有找到JSON格式，使用基本清理
        console.warn('Could not parse JSON from AI response, using basic cleaning:', cleanedData);
        return basicClean(item, dataType);
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON, using basic cleaning:', parseError.message);
      return basicClean(item, dataType);
    }
  } catch (error) {
    console.error('Error calling free AI service:', error);
    throw error;
  }
}

// 构造法规数据的AI提示
function constructRegulationPrompt(item) {
  return `
    请帮我标准化以下法规数据，确保字段符合以下规范：
    - id: 唯一标识符
    - region: 地理区域 (如 EU, USA, China)
    - severity: 严重程度 (critical, high, medium, low)
    - title: 法规标题
    - summary: 法规摘要
    - timestamp: ISO 8601格式时间戳
    - source_url: 来源URL
    - category: 法规分类
    - jurisdiction: 管辖范围
    - publishDate: 发布日期
    - regulationType: 法规类型
    - importanceLevel: 重要性等级
    
    原始数据: ${JSON.stringify(item)}
    
    请返回标准化后的JSON格式数据。
  `;
}

// 构造案例数据的AI提示
function constructCasePrompt(item) {
  return `
    请帮我标准化以下法律案例数据，确保字段符合以下规范：
    - id: 唯一标识符
    - title: 案例标题
    - court: 审理法院
    - jurisdiction: 管辖区域
    - caseType: 案例类型
    - filingDate: 立案日期
    - status: 案例状态 (active, settled, appealed, closed, decided)
    - parties: 案例当事人
    - description: 案例描述
    - impactLevel: 影响等级 (high, medium, low, critical)
    - source_url: 来源URL
    - outcome: 案例结果
    - key_issues: 关键问题
    
    原始数据: ${JSON.stringify(item)}
    
    请返回标准化后的JSON格式数据。
  `;
}

// 模拟AI数据清洗 - 在实际部署时替换为真实AI调用
async function simulateAICleaning(item, dataType) {
  // 这里应该调用真实的AI服务
  // 为演示目的，我们只进行基本的数据清理和标准化
  
  const cleanedItem = {
    ...item,
    id: item.id || `${dataType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    timestamp: item.timestamp || new Date().toISOString(),
    title: item.title || item.name || 'Untitled',
    summary: item.summary || item.description || item.content || 'No summary available',
    region: item.region || item.jurisdiction || 'Global',
    severity: normalizeSeverity(item.severity || item.importance || item.priority || 'medium'),
    category: item.category || item.type || 'General',
    source_url: item.source_url || item.url || item.link || null
  };

  if (dataType === 'case') {
    cleanedItem.status = normalizeCaseStatus(item.status || 'active');
    cleanedItem.impactLevel = normalizeImpactLevel(item.impactLevel || item.impact || 'medium');
    cleanedItem.court = item.court || 'Unknown Court';
    cleanedItem.caseType = item.caseType || item.type || 'General';
    cleanedItem.filingDate = item.filingDate || item.date || new Date().toISOString().split('T')[0];
    cleanedItem.parties = Array.isArray(item.parties) ? item.parties : [item.plaintiff || 'Unknown', item.defendant || 'Unknown'];
  }

  return cleanedItem;
}

// 标准化严重程度
function normalizeSeverity(severity) {
  const severityMap = {
    'critical': 'critical',
    'urgent': 'critical',
    'high': 'high',
    'important': 'high',
    'medium': 'medium',
    'normal': 'medium',
    'standard': 'medium',
    'low': 'low',
    'minor': 'low',
    'minimal': 'low'
  };
  
  const normalized = severityMap[severity.toLowerCase()];
  return normalized || 'medium';
}

// 标准化案例状态
function normalizeCaseStatus(status) {
  const statusMap = {
    'active': 'active',
    'open': 'active',
    'ongoing': 'active',
    'settled': 'settled',
    'resolved': 'settled',
    'appealed': 'appealed',
    'under appeal': 'appealed',
    'closed': 'closed',
    'completed': 'closed',
    'decided': 'decided',
    'judged': 'decided'
  };
  
  const normalized = statusMap[status.toLowerCase()];
  return normalized || 'active';
}

// 标准化影响等级
function normalizeImpactLevel(impact) {
  const impactMap = {
    'critical': 'critical',
    'severe': 'critical',
    'high': 'high',
    'significant': 'high',
    'medium': 'medium',
    'moderate': 'medium',
    'standard': 'medium',
    'low': 'low',
    'minimal': 'low',
    'minor': 'low'
  };
  
  const normalized = impactMap[impact.toLowerCase()];
  return normalized || 'medium';
}

// 基本数据清理
function basicClean(item, dataType) {
  return {
    ...item,
    id: item.id || `${dataType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    timestamp: item.timestamp || new Date().toISOString(),
    title: item.title || 'Untitled',
    summary: item.summary || item.description || 'No summary available',
    ...(dataType === 'case' ? {
      status: normalizeCaseStatus(item.status || 'active'),
      impactLevel: normalizeImpactLevel(item.impactLevel || 'medium')
    } : {
      severity: normalizeSeverity(item.severity || 'medium')
    })
  };
}

module.exports = {
  processWithAI
};