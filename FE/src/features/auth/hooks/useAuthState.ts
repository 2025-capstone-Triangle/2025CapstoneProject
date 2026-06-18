export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export function useAuthState() {
  return {
    isLoggedIn: false,
    user: null as AuthUser | null,
  };
}
