import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { TOKEN_KEY } from "@/config";
import type { RootState } from "../../store";
import type { AuthState, AuthUser } from "./auth.types";

const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: null,
  token: readToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser | null; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      try {
        localStorage.setItem(TOKEN_KEY, action.payload.token);
      } catch {
        /* storage unavailable — token just won't survive a refresh */
      }
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* no-op */
      }
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
