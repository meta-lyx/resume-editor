import { supabase } from '@/lib/supabase';

export async function uploadResumeFile(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  
  // 上传文件到 Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('resume-files')
    .upload(filePath, file, { upsert: true });
  
  if (storageError) {
    throw storageError;
  }
  
  // 从文件中提取文本
  const { data: extractData, error: extractError } = await supabase.functions.invoke(
    'extract-resume-text',
    {
      body: {
        filePath,
        fileType: file.type,
      },
    }
  );
  
  if (extractError) {
    throw extractError;
  }
  
  // 在数据库中创建文件记录
  const { data: fileData, error: fileError } = await supabase
    .from('files')
    .insert({
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
    })
    .select()
    .single();
  
  if (fileError) {
    throw fileError;
  }
  
  return {
    fileData,
    extractedText: extractData.data.extractedText,
  };
}

export async function createResume(data: {
  userId: string;
  title: string;
  originalContent: string;
  jobDescription?: string;
}) {
  const { data: resumeData, error: resumeError } = await supabase
    .from('resumes')
    .insert({
      user_id: data.userId,
      title: data.title,
      original_content: data.originalContent,
      job_description: data.jobDescription || null,
      status: 'draft',
    })
    .select()
    .single();
  
  if (resumeError) {
    throw resumeError;
  }
  
  return resumeData;
}

export async function optimizeResume(data: {
  resumeId: string;
  resumeContent: string;
  jobDescription?: string;
  optimizationType: string;
}) {
  const { data: optimizeData, error: optimizeError } = await supabase.functions.invoke(
    'optimize-resume',
    {
      body: {
        resumeContent: data.resumeContent,
        jobDescription: data.jobDescription,
        optimizationType: data.optimizationType,
      },
    }
  );
  
  if (optimizeError) {
    throw optimizeError;
  }
  
  // 更新简历上的优化内容
  const { data: updateData, error: updateError } = await supabase
    .from('resumes')
    .update({
      optimized_content: optimizeData.data.optimizedContent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.resumeId)
    .select()
    .single();
  
  if (updateError) {
    throw updateError;
  }
  
  // 创建版本记录
  const { data: versionData, error: versionError } = await supabase
    .from('resume_versions')
    .select('version_number')
    .eq('resume_id', data.resumeId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const nextVersionNumber = versionData ? versionData.version_number + 1 : 1;
  
  await supabase.from('resume_versions').insert({
    resume_id: data.resumeId,
    content: optimizeData.data.optimizedContent,
    version_number: nextVersionNumber,
  });
  
  return {
    originalContent: optimizeData.data.originalContent,
    optimizedContent: optimizeData.data.optimizedContent,
    resumeData: updateData,
  };
}

export async function getUserResumes(userId: string) {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function getResumeById(resumeId: string) {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function getResumeVersions(resumeId: string) {
  const { data, error } = await supabase
    .from('resume_versions')
    .select('*')
    .eq('resume_id', resumeId)
    .order('version_number', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data;
}
