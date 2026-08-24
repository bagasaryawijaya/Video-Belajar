import { configureStore } from "@reduxjs/toolkit";
import courseReducer from "./courseReducer";

const store = configureStore({
  reducer: {
    courses: courseReducer,
  },
});

export default store;
