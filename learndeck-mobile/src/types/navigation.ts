export type RootStackParamList = {
  Home: {
    screen?: string;
    params?: {
      openAddModal?: boolean;
    };
  };
  StudySession: {
    studyType: 'all' | 'due' | 'new';
    folderId?: string | null;
  };
  ProfileEdit: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Words: {
    openAddModal?: boolean;
  };
  Profile: undefined;
};