import React from "react";
import MenuIcon from "@mui/icons-material/Menu"; // Material UI Icon
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function NavigationMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function userLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div
      style={{
        position: "absolute", // Adjusted positioning to ensure it's correctly placed
        top: "10px",
        right: "10px",
        zIndex: 50,
        padding: "10px",
        cursor: "pointer",
      }}
    >
      {/* Menu Button */}
      <div
        onClick={handleClick}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#333", // Background color for the button
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
        }}
      >
        <MenuIcon style={{ color: "white" }} />
      </div>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock={true} // Disable the scroll lock
      >
        <Link to="/profilePage">
          <MenuItem onClick={handleClose}>Profile</MenuItem>
        </Link>
        <Link to="/questioneerPage">
          <MenuItem onClick={handleClose}>Questioneer</MenuItem>
        </Link>
        <MenuItem onClick={userLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
}

export default NavigationMenu;
