export type RootStackParamList = {
  Home: {
    screen?: string;
    params?: {
      openAddModal?: boolean;
    };
  };
  StudySession: {
    studyType: 'all' | 'due' | 'new';
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