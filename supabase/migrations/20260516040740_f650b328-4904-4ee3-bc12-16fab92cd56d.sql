
INSERT INTO storage.buckets (id, name, public) VALUES ('poems', 'poems', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view their own poem files"
ON storage.objects FOR SELECT
USING (bucket_id = 'poems' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own poem files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'poems' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own poem files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'poems' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own poem files"
ON storage.objects FOR DELETE
USING (bucket_id = 'poems' AND auth.uid()::text = (storage.foldername(name))[1]);
