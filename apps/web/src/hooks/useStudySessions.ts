import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StudySession, RecentStudyOption, StudyType } from '@shared/types';
import { User } from '@supabase/supabase-js';

export const useStudySessions = (user: User | null) => {
  const [recentStudyOptions, setRecentStudyOptions] = useState<RecentStudyOption[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentStudyOptions();
    } else {
      setRecentStudyOptions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchRecentStudyOptions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recent_study_options')
        .select(`
          *,
          folders (*)
        `)
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false });

      if (error) throw error;

      const aggregatedOptions: { [key: string]: RecentStudyOption } = {};

      data.forEach(option => {
        const folderId = option.folder_id || 'all'; // 'all' for "All words"

        if (!aggregatedOptions[folderId]) {
          aggregatedOptions[folderId] = {
            ...option,
            id: folderId, // Use folderId as a unique key
            last_used_at: new Date(option.last_used_at),
            created_at: new Date(option.created_at),
            use_count: 0, // Reset to sum up
            folder: option.folders ? {
              ...option.folders,
              created_at: new Date(option.folders.created_at),
              updated_at: new Date(option.folders.updated_at),
            } : undefined,
          };
        }

        aggregatedOptions[folderId].use_count += option.use_count;

        const currentLastUsedAt = new Date(option.last_used_at);
        if (currentLastUsedAt > aggregatedOptions[folderId].last_used_at) {
          aggregatedOptions[folderId].last_used_at = currentLastUsedAt;
          // also update study_type to the one from the most recent session, though it won't be displayed.
          aggregatedOptions[folderId].study_type = option.study_type;
        }
      });

      const transformedOptions: RecentStudyOption[] = Object.values(aggregatedOptions)
        .sort((a, b) => b.last_used_at.getTime() - a.last_used_at.getTime());

      setRecentStudyOptions(transformedOptions);
    } catch (error) {
      console.error('Error fetching recent study options:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveStudyOption = async (folderId: string | null, studyType: StudyType) => {
    if (!user) return;

    try {
      let query = supabase
        .from('recent_study_options')
        .select('id, use_count')
        .eq('user_id', user.id)
        .eq('study_type', studyType);
      
      if (folderId === null) {
        query = query.is('folder_id', null);
      } else {
        query = query.eq('folder_id', folderId);
      }
      
      const { data: existing, error: selectError } = await query.single();

      // `PGRST116` is the code for "No rows found", which is not an error here.
      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (existing) {
        // If it exists, update it
        const { error: updateError } = await supabase
          .from('recent_study_options')
          .update({
            last_used_at: new Date().toISOString(),
            use_count: existing.use_count + 1,
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // If it does not exist, insert it
        const { error: insertError } = await supabase
          .from('recent_study_options')
          .insert({
            user_id: user.id,
            folder_id: folderId,
            study_type: studyType,
            last_used_at: new Date().toISOString(),
            use_count: 1,
          });
        
        if (insertError) throw insertError;
      }

      await fetchRecentStudyOptions();
    } catch (error) {
      console.error('Error saving study option:', error);
    }
  };

  const startStudySession = async (folderId: string | null, studyType: StudyType) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          folder_id: folderId,
          study_type: studyType,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const session: StudySession = {
        ...data,
        started_at: new Date(data.started_at),
        completed_at: data.completed_at ? new Date(data.completed_at) : null,
        created_at: new Date(data.created_at),
      };

      setCurrentSession(session);
      await saveStudyOption(folderId, studyType);
      
      return session;
    } catch (error) {
      console.error('Error starting study session:', error);
      return null;
    }
  };

  const updateStudySession = async (
    sessionId: string, 
    updates: { 
      words_studied?: number; 
      correct_answers?: number; 
      total_time_minutes?: number;
      completed_at?: Date;
    }
  ) => {
    if (!user) return;

    try {
      const updateData: any = { ...updates };
      if (updates.completed_at) {
        updateData.completed_at = updates.completed_at.toISOString();
      }

      const { data, error } = await supabase
        .from('study_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedSession: StudySession = {
        ...data,
        started_at: new Date(data.started_at),
        completed_at: data.completed_at ? new Date(data.completed_at) : null,
        created_at: new Date(data.created_at),
      };

      setCurrentSession(updatedSession);
      return updatedSession;
    } catch (error) {
      console.error('Error updating study session:', error);
    }
  };

  const completeStudySession = async (sessionId: string, finalStats: { words_studied: number; correct_answers: number; total_time_minutes: number }) => {
    return await updateStudySession(sessionId, {
      ...finalStats,
      completed_at: new Date(),
    });
  };

  const getStudyHistory = async (limit: number = 20) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select(`
          *,
          folders (*)
        `)
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(session => ({
        ...session,
        started_at: new Date(session.started_at),
        completed_at: session.completed_at ? new Date(session.completed_at) : null,
        created_at: new Date(session.created_at),
        folder: session.folders ? {
          ...session.folders,
          created_at: new Date(session.folders.created_at),
          updated_at: new Date(session.folders.updated_at),
        } : undefined,
      }));
    } catch (error) {
      console.error('Error fetching study history:', error);
      return [];
    }
  };

  return {
    recentStudyOptions,
    currentSession,
    loading,
    startStudySession,
    updateStudySession,
    completeStudySession,
    getStudyHistory,
    refetch: fetchRecentStudyOptions,
  };
};