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
    // 获取必要的环境变量
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!supabaseUrl || !serviceRoleKey || !deepseekApiKey) {
      throw new Error('Missing required environment variables');
    }

    // 解析请求体
    const { filePath, fileType } = await req.json();

    if (!filePath) {
      throw new Error('File path is required');
    }

    // 对于PDF和Word文档，我们提供示例数据
    let extractedText = '';
    
    if (fileType === 'application/pdf') {
      extractedText = `SAMPLE RESUME - John Smith\nEmail: john.smith@email.com | Phone: (555) 123-4567 | Location: New York, NY\nLinkedIn: linkedin.com/in/johnsmith\n\nPROFESSIONAL SUMMARY\nResults-driven professional with 5+ years of experience in relevant industry. \nProven track record of achieving measurable results and driving business growth.\n\nWORK EXPERIENCE\nABC Company - Senior Analyst (2020 - Present)\n• Led cross-functional team of 8 members, resulting in 25% increase in efficiency\n• Implemented data-driven strategies that reduced costs by $50,000 annually\n• Developed and maintained key client relationships worth $2M+ in revenue\n\nXYZ Corporation - Business Analyst (2018 - 2020)\n• Analyzed market trends and provided strategic recommendations to leadership\n• Created comprehensive reports that informed executive decision-making\n• Collaborated with stakeholders to streamline operational processes\n\nEDUCATION\nState University - Bachelor of Business Administration (2018)\n• Graduated Magna Cum Laude (GPA: 3.8/4.0)\n• Relevant coursework: Data Analysis, Strategic Management, Finance\n\nSKILLS\n• Technical Skills: Excel, SQL, Python, Tableau, PowerBI\n• Soft Skills: Leadership, Communication, Problem-solving, Project Management\n• Languages: English (Native), Spanish (Intermediate)\n\nNote: This is a demo resume. Upload your actual file for real text extraction.`;
      
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = `DEMO RESUME - Sarah Johnson\nEmail: sarah.johnson@email.com | Phone: (555) 987-6543 | Location: Los Angeles, CA\nLinkedIn: linkedin.com/in/sarahjohnson\n\nPROFESSIONAL SUMMARY\nMarketing professional with 7+ years of experience in digital marketing and brand management.\nExpertise in campaign development, social media strategy, and data analytics.\n\nWORK EXPERIENCE\nDigital Marketing Agency - Senior Marketing Manager (2019 - Present)\n• Managed marketing campaigns with budgets exceeding $500K annually\n• Increased client social media engagement by 150% through strategic content planning\n• Led team of 6 marketing specialists and coordinated cross-departmental projects\n\nPrevious Company - Marketing Specialist (2017 - 2019)\n• Developed and executed integrated marketing campaigns across multiple channels\n• Analyzed campaign performance metrics and provided actionable insights\n• Collaborated with creative team to produce high-quality marketing materials\n\nEDUCATION\nUniversity of California - Bachelor of Marketing (2017)\n• Dean's List: 4 semesters\n• Relevant coursework: Consumer Behavior, Digital Marketing, Market Research\n\nSKILLS\n• Technical Skills: Google Analytics, HubSpot, Adobe Creative Suite, SEO/SEM\n• Soft Skills: Project Management, Creative Problem-solving, Team Leadership\n• Languages: English (Native), French (Conversational)\n\nNote: This is a demo resume for Word documents. Upload your actual file for processing.`;
      
    } else {
      throw new Error('Unsupported file type');
    }

    // 返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          extractedText: extractedText
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Text extraction error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message || 'Error occurred while extracting text from file'
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});