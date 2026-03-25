import { configureStore } from '@reduxjs/toolkit';
import shopsReducer from './shopsSlice';
import vendorsReducer from './vendorsSlice';
import locationsReducer from './locationsSlice';
import categoriesReducer from './categoriesSlice';

export const store = configureStore({
  reducer: {
    shops: shopsReducer,
    vendors: vendorsReducer,
    locations: locationsReducer,
    categories: categoriesReducer,
  },
});
