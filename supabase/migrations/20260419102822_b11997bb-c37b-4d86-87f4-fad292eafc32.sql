
-- Replace broad SELECT policy with one that only allows admins to list the bucket.
-- Public image access still works because the bucket is public and clients fetch by direct URL.
DROP POLICY IF EXISTS "Guesthouse images public read" ON storage.objects;

CREATE POLICY "Admins can list guesthouse images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'guesthouse-images' AND public.has_role(auth.uid(), 'admin'));
