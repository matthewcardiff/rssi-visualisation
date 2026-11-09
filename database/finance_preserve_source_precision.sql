-- Preserve cached Excel precision when staging finance rows are stored and published.
-- Currency is rounded for display; keeping fractional-penny source values prevents
-- company totals from drifting from the workbook matrix after department rounding.
ALTER TABLE public.finance_metric_values
  ALTER COLUMN amount TYPE numeric(24,8)
  USING amount::numeric(24,8);

ALTER TABLE public.finance_publication_values
  ALTER COLUMN amount TYPE numeric(24,8)
  USING amount::numeric(24,8);
