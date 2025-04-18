import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { login } from "../../../redux/actions/UserAction";

export default function Login() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });


  };
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://shoestore-be.onrender.com/auth/login", {
        email: username,
        password: password,
      });
      if (response.data.token != null) {
        const data = response.data.token;
        Cookies.set("token", data, { expires: 7 });
        try {
          const responses = await axios.get("https://shoestore-be.onrender.com/user/owner/", {
            headers: {
              Authorization: `Bearer ${data}`,
            },
          });
          if (responses.data.role === 'admin') {
            dispatch(login(responses.data));
            navigate("/order");
          }

        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
      }
    } catch (e) {
      console.error("Login failed: ", e);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5" fontWeight={650} textAlign="center">
          ĐĂNG NHẬP VÀO TRANG ADMIN
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email đăng nhập"
            name="email"
            autoComplete="email"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            ĐĂNG NHẬP
          </Button>
        </Box>
      </Box>
    </Container>
  );
}