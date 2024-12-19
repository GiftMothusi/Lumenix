import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isRefreshing: boolean;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  isRefreshing: false,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const { setRefreshing, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
