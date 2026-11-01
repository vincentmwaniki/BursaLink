import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StudentProfile } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateNeedScore = (profile: StudentProfile): number => {
  let score = 0;

  // Income level (30 points)
  if (profile.incomeLevel === 'low') score += 30;
  else if (profile.incomeLevel === 'medium') score += 15;

  // Orphan status (25 points)
  if (profile.orphanStatus) score += 25;

  // Disability (15 points)
  if (profile.disability) score += 15;

  // Fee burden (20 points) - assuming normalized 0-100 input
  score += (profile.feeBurden / 100) * 20;

  // Academic performance (10 points) - assuming normalized 0-100 input
  score += (profile.academicPerformance / 100) * 10;

  return Math.round(score);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
};