/** Shared API types. */

/** The envelope DRF returns for paginated list endpoints. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
