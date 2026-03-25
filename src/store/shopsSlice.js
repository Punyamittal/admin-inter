import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

export const shopsSlice = createSlice({
  name: 'shops',
  initialState,
  reducers: {
    setShops: (state, action) => {
      state.items = action.payload;
    },
    addShop: (state, action) => {
      state.items.push(action.payload);
    },
    updateShop: (state, action) => {
      const index = state.items.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
    removeShop: (state, action) => {
      state.items = state.items.filter((s) => s.id !== action.payload);
    },
  },
});

export const { setShops, addShop, updateShop, removeShop } = shopsSlice.actions;
export default shopsSlice.reducer;
