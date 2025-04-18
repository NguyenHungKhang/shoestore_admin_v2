import React, { useContext, useEffect } from "react";
import './App.css';
import { CssBaseline, ThemeProvider, createTheme, StyledEngineProvider } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import User from './features/user/presentations/User';
import Layout from "./components/layout/Layout";
import Brand from "./features/brand/presentations/Brand";
import Category from "./features/category/presentations/Category";
import Comment from "./features/comment/presentations/Comment";
import Product from "./features/product/presentations/Product";
import Login from "./features/login/presentations/Login";
import Discount from "./features/discount/presentations/Discount";
import Cart from "./features/cart/presentations/Cart";
import Order from "./features/order/presentations/Order";
import Variant from "./features/product/components/Variant";
import Item from "./features/order/components/Item";
import OverSpec from "./features/product/components/OverSpec";
import DetailSpec from "./features/product/components/DetailSpec";
import HightLightPic from "./features/product/components/HighLightPics";
import { Provider } from "react-redux";
import store from "./redux/stores";
import { useSelector, useDispatch } from 'react-redux';
import { login } from "./redux/actions/UserAction";
import axios from "axios";
import Cookies from "js-cookie";

const theme = createTheme({
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  palette: {
    background: {
      default: "#f4f6f8",
    },
  },
});

function App() {
  const dispatch = useDispatch();
  const token = Cookies.get("token");
  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          const responses = await axios.get("https://shoestore-be.onrender.com/user/owner", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (responses.data.role === 'admin') {
            dispatch(login(responses.data));
          }

        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
      }
    };

    fetchData();
  }, [dispatch, token]);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <StyledEngineProvider injectFirst>
            <BrowserRouter>
              {/* <Layout /> */}
              <Routes>
                
                {isAuthenticated ?
                  <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to='/login' />}  >
                    <Route path="/order/:orderId/item" name="Order Items" Component={Item} />
                    <Route path="/order" name="Cart" Component={Order} />
                  </Route> : <Route path="/login" name="Login" Component={Login} />}
              </Routes>
            </BrowserRouter>
          </StyledEngineProvider>
        </CssBaseline>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
