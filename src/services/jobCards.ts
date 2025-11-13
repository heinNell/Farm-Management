import { supabase } from '../lib/supabase';
import { JobCard, JobCardInsert, JobCardUpdate } from '../types/database';

export class JobCardService {
  // Get all job cards
  static async getAll(): Promise<JobCard[]> {
    const { data, error } = await supabase
      .from('job_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Type assertion to inform TypeScript of the expected type
    return (data as JobCard[]) || [];
  }

  // Get job card by ID
  static async getById(id: string): Promise<JobCard | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await supabase
      .from('job_cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Type assertion here
    return (data as JobCard) || null;
  }

  // Create new job card
  static async create(jobCard: JobCardInsert): Promise<JobCard> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await supabase
      .from('job_cards')
      .insert(jobCard)
      .select()
      .single();

    if (error) throw error;

    // Type assertion here
    return (data as JobCard);
  }

  // Update job card
  static async update(id: string, updates: JobCardUpdate): Promise<JobCard> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await supabase
      .from('job_cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Type assertion here
    return (data as JobCard);
  }

  // Delete job card
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('job_cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get job cards by status
  static async getByStatus(status: JobCard['status']): Promise<JobCard[]> {
    const { data, error } = await supabase
      .from('job_cards')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Type assertion here
    return (data as JobCard[]) || [];
  }

  // Get job cards assigned to a user
  static async getByAssignee(userId: string): Promise<JobCard[]> {
    const { data, error } = await supabase
      .from('job_cards')
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Type assertion here
    return (data as JobCard[]) || [];
  }
}