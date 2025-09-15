-- Migration: make_storage_bucket_public
-- Created at: 1754565840

-- Make the resume-files bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'resume-files';

-- Create public access policy
CREATE POLICY "Public read access for resume files" ON storage.objects 
FOR SELECT USING (bucket_id = 'resume-files');

CREATE POLICY "Authenticated users can upload resume files" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'resume-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own resume files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'resume-files' AND auth.uid()::text = (metadata->>'user_id'));

CREATE POLICY "Users can delete their own resume files" ON storage.objects 
FOR DELETE USING (bucket_id = 'resume-files' AND auth.uid()::text = (metadata->>'user_id'));;