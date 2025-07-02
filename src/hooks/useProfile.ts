import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { User } from '@supabase/supabase-js';

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          await createProfile();
          return;
        }
        throw error;
      }

      const transformedProfile: Profile = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      setProfile(transformedProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.email?.split('@')[0] || '',
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate key constraint violation (profile already exists)
        if (error.code === '23505') {
          // Profile was created by another process, fetch it instead
          console.log('Profile already exists, fetching existing profile...');
          await fetchExistingProfile();
          return;
        }
        throw error;
      }

      const transformedProfile: Profile = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      setProfile(transformedProfile);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const fetchExistingProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const transformedProfile: Profile = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      setProfile(transformedProfile);
    } catch (error) {
      console.error('Error fetching existing profile:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      const transformedProfile: Profile = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      setProfile(transformedProfile);
      return transformedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateStudyStreak = async (increment: boolean = true) => {
    if (!profile) return;

    const newStreak = increment ? profile.study_streak + 1 : 0;
    await updateProfile({ study_streak: newStreak });
  };

  const addStudyTime = async (minutes: number) => {
    if (!profile) return;

    const newTotalTime = profile.total_study_time + minutes;
    await updateProfile({ total_study_time: newTotalTime });
  };

  return {
    profile,
    loading,
    updateProfile,
    updateStudyStreak,
    addStudyTime,
    refetch: fetchProfile,
  };
};