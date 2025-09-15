-- Migration: fix_storage_policies
-- Created at: 1754565821

-- Create storage policies for resume-files bucket
INSERT INTO storage.policies (id, name, bucket_id, type, definition, check_definition)
VALUES (
    'resume-files-select-policy',
    'Users can view their own resume files',
    'resume-files',
    'select',
    '(bucket_id = ''resume-files''::text) AND (auth.uid() = (metadata->>''user_id'')::uuid)',
    '(bucket_id = ''resume-files''::text) AND (auth.uid() = (metadata->>''user_id'')::uuid)'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    check_definition = EXCLUDED.check_definition;

INSERT INTO storage.policies (id, name, bucket_id, type, definition, check_definition)
VALUES (
    'resume-files-insert-policy',
    'Users can upload their own resume files',
    'resume-files',
    'insert',
    '(bucket_id = ''resume-files''::text) AND (auth.uid() = (metadata->>''user_id'')::uuid)',
    '(bucket_id = ''resume-files''::text) AND (auth.uid() = (metadata->>''user_id'')::uuid)'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    check_definition = EXCLUDED.check_definition;

INSERT INTO storage.policies (id, name, bucket_id, type, definition, check_definition)
VALUES (
    'resume-files-update-policy',
    'Users can update their own resume files',
    'resume-files',
    'update',
    '(bucket_id = ''resume-files''::text) AND (auth.uid() = (metadata->>''user_id'')::uuid)',
    '(bucket_id = ''resume-files''::text) AND (auth.uid() = (metadata->>''user_id'')::uuid)'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    check_definition = EXCLUDED.check_definition;

INSERT INTO storage.policies (id, name, bucket_id, type, definition, check_definition)
VALUES (
    'resume-files-delete-policy',
    'Users can delete their own resume files',
    'resume-files',
    'delete',
    '(bucket_id = ''resume-files''::text) AND (auth.uid() = (metadata->>''user_id'')::uuid)',
    '(bucket_id = ''resume-files''::text) AND (auth.uid() = (metadata->>''user_id'')::uuid)'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    check_definition = EXCLUDED.check_definition;;