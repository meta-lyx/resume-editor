import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

serve(async (req) => {
  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // 解析请求体
    const { resumeContent, jobDescription, optimizationType } = await req.json();
    
    // 验证必要参数
    if (!resumeContent) {
      throw new Error('简历内容是必需的');
    }
    
    // 获取DeepSeek API密钥
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    // 构建给AI的提示词
    let prompt = `你是一名专业的简历优化专家，精通简历写作和优化。请帮我优化以下简历内容，使其更专业、更有竞争力。

`;
    
    // 根据优化类型添加不同的提示词
    switch (optimizationType) {
      case 'ats-optimization':
        prompt += `请特别关注ATS优化，确保关键词合理分布，使简历能够顺利通过简历筛选系统。`;
        break;
      case 'language-polish':
        prompt += `请专注于语言润色，使用更专业、更有力的词汇和表达方式，同时保持语言的自然流畅。`;
        break;
      case 'achievement-highlight':
        prompt += `请特别关注成就的量化和突出，将抽象的描述转换为具体的、可衡量的成就，并使用强有力的动词开头。`;
        break;
      case 'job-match':
        if (!jobDescription) {
          throw new Error('职位描述匹配模式需要提供职位描述');
        }
        prompt += `请根据以下职位描述，优化简历内容，使其更好地匹配该职位的要求和关键词：\n\n${jobDescription}\n\n`;
        break;
      default:
        prompt += `请进行全面优化，包括语言润色、成就量化、专业表达等方面。`;
    }
    
    prompt += `\n原始简历内容：\n${resumeContent}\n\n请保持原始简历的基本结构，但提升其质量和表现力。回复中只需包含优化后的简历内容，无需其他解释。`;
    
    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一名专业的简历优化专家，帮助用户优化简历内容。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    
    // 解析DeepSeek API的响应
    const data = await response.json();
    
    // 检查API响应是否正确
    if (!response.ok) {
      throw new Error(`DeepSeek API错误: ${data.error?.message || '未知错误'}`);
    }
    
    // 提取生成的简历内容
    const optimizedContent = data.choices[0].message.content;
    
    // 返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          originalContent: resumeContent,
          optimizedContent: optimizedContent
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // 返回错误响应
    console.error('简历优化错误:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message || '简历优化过程中发生错误'
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
