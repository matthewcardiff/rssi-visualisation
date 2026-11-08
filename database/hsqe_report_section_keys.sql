-- Allow HSQE's five tailored report sections in the shared report_sections table.
ALTER TABLE public.report_sections
  DROP CONSTRAINT IF EXISTS report_sections_section_key_check;

ALTER TABLE public.report_sections
  ADD CONSTRAINT report_sections_section_key_check
  CHECK (section_key = ANY (ARRAY[
    'pipeline'::text,
    'delivery'::text,
    'programme'::text,
    'risks'::text,
    'resources'::text,
    'review_submit'::text,
    'hsqe_accidents'::text,
    'hsqe_close_calls'::text,
    'hsqe_assurance'::text,
    'hsqe_events'::text,
    'hsqe_documents'::text
  ]));
