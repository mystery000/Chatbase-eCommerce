import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SWRError extends Error {
  status: number;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const pluralize = (value: number, singular: string, plural: string) => {
  return `${value} ${value === 1 ? singular : plural}`;
};

export const getResponseOrThrow = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as SWRError;
      error.status = res.status;
      error.name = json.name;
      throw error;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
  return res.json();
};
