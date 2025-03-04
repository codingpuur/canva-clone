"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { WeatherData } from "@/lib/types";

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: WeatherState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (location: string = "India") => {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=2081f3ec100142e7b24132852250303&q=${location}`
    );

    return await response.json();
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWeather.fulfilled,
        (state, action: PayloadAction<WeatherData>) => {
          state.loading = false;
          state.data = action.payload;
          state.lastUpdated = new Date().toISOString();
        }
      )
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch weather data";
      });
  },
});

export default weatherSlice.reducer;
