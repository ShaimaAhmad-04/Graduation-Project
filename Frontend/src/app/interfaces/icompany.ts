export interface Company {
  userId: number;   // this IS the ID
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  location?: string;
  status: 'verified' | 'pending' | 'unverified';
}