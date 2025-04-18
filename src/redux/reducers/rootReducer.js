import { combineReducers } from "redux";
import userReducer from "./UserReducer.js";

const rootReducer = combineReducers({
  user: userReducer,
});

export default rootReducer;
