import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import logo from '../../images/logo.png';
import { useNavigate } from "react-router-dom";
import api from '../../utils/api'



const pages = [
    { name: '내 일기', path: '/my-diary' },
    { name: '일기작성', path: '/write-diary' },
    { name: '공지사항', path: '/notices' },
];

const settings = ['로그인하러가기'];

function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);





    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };


    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleMenuClick = (path) => {
        if (path === '/notices') {
            navigate(path)
        } else {
            alert('로그인 해주세요!')
        }

    };
    const handleSettingClick = () => {
        navigate('/login');
    }


    const navigate = useNavigate();
    return (
        <AppBar position="static" sx={{ backgroundColor: '#FEDC2A' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: "Nanum Pen Script",
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        <Box onClick={(e) => navigate('/main')}>
                            <img src={logo} alt="로고" style={{ width: '100px', height: 'auto', border: 'none' }}></img>
                        </Box>
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page.name} onClick={(e) => { handleCloseNavMenu(); handleMenuClick(page.path); }}>
                                    <Typography textAlign="center" px={{ fontSize: 20, fontFamily: "Nanum Pen Script" }}>{page.name}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: "Nanum Pen Script",
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        <Box>
                            <img onClick={(e) => navigate('/main')} src={logo} alt="로고" style={{ width: '100px', height: 'auto' }} />
                        </Box>
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page.name}
                                onClick={(e) => { handleCloseNavMenu(); handleMenuClick(page.path); }}
                                sx={{
                                    marginLeft: '1%',
                                    my: 2, color: 'black', display: 'block',
                                    '&:hover': {
                                        backgroundColor: 'white', // hover 시 배경색
                                    },
                                    fontSize: 20, fontFamily: "Nanum Pen Script"
                                }}
                            >
                                {page.name}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Button
                            onClick={(e) => { handleSettingClick() }}
                            sx={{
                                marginLeft: '1%',
                                my: 2, color: 'black', display: 'block',
                                '&:hover': {
                                    backgroundColor: 'white', // hover 시 배경색
                                },
                                fontSize: 20, fontFamily: "Nanum Pen Script"
                            }}
                        >
                            login
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;