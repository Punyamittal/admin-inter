import { createSlice } from '@reduxjs/toolkit'; 

const initialState = { items: [], isLoading: false, error: null }; 

export const slice = createSlice({ name: 'locations', initialState, reducers: { setItems: (state, action) => { state.items = action.payload; } } }); 

export const { setItems } = slice.actions; 
export default slice.reducer;
