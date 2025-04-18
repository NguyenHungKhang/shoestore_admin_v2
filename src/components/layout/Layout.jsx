import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MailIcon from '@mui/icons-material/Mail';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@mui/material';
import Cookies from 'js-cookie';

const drawerWidth = 240;

function Layout(props) {
  const { window } = props;
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);  // Quản lý trạng thái mở/đóng của drawer
  const location = useLocation();
  const path = location.pathname;
  const page = path.split("/")[1];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      Cookies.remove('token');
      navigate('/login');
    }
  };

  const menuItems = [
    { label: "Hóa đơn", path: "/order", icon: <MailIcon /> },
    // Thêm item khác ở đây nếu cần
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map(item => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={page === item.path.replace("/", "")}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `100%` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}  // Kích hoạt mở/đóng drawer
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <Button sx={{ color: 'white' }} onClick={handleLogout}>
              Đăng xuất
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        // sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Drawer trượt ra trên cả mobile và desktop */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}  // Trạng thái mở/đóng của Drawer
          onClose={handleDrawerToggle}  // Khi đóng Drawer
          ModalProps={{
            keepMounted: true, // Đảm bảo hiệu suất trên mobile
          }}
          sx={{
            display: 'block',  // Drawer luôn hiển thị
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ width: `100%` }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

Layout.propTypes = {
  window: PropTypes.func,
};

export default Layout;
