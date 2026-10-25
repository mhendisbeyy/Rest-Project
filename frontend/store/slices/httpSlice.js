import { createSlice } from '@reduxjs/toolkit';

const httpSlice = createSlice({
  name: 'http',
  initialState: { exchanges: [], selectedId: null },
  reducers: {
    recordExchange(state, { payload: { exchange, select = true } }) {
      state.exchanges = [...state.exchanges, exchange].slice(-10);
      if (select || !state.exchanges.some(item => item.id === state.selectedId)) state.selectedId = exchange.id;
    },
    selectExchange(state, action) { state.selectedId = action.payload; },
  },
});

export const { recordExchange, selectExchange } = httpSlice.actions;
export default httpSlice.reducer;
