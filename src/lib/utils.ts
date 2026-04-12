import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: any) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function getGoogleDriveUrl(input: string, type: 'image' | 'video' = 'image') {
  if (!input) return "";
  
  // If it's already a full URL (not from drive), return as is
  if (input.startsWith('http') && !input.includes('drive.google.com')) return input;

  // Extract ID from various Google Drive link formats
  let fileId = input;
  const driveIdMatch = input.match(/[-\w]{25,}/);
  if (driveIdMatch) {
    fileId = driveIdMatch[0];
  }

  // Direct download link for images/videos
  return `https://lh3.googleusercontent.com/u/0/d/${fileId}`;
}
