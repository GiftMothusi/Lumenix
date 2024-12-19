export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};
  export type MainTabParamList = {
    Home: undefined;
    Discover: undefined;
    CreatePost: undefined;
    Notifications: undefined;
    Profile: { userId?: string };
};
  export type RootStackParamList = {
    Auth: undefined;
    MainApp: undefined;
    Story: { storyId: string };
    Comments: { postId: string };
    Settings: undefined;
    UserProfile: { userId: string };
};
