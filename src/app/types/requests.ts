export interface RequestItem {
  id: string;
  type: string;
  location: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  created_at: string;
} 