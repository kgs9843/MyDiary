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
    // { name: '실시간 채팅', path: '/real-time-chat' },
    // { name: '자유게시판', path: '/free-board' },
];

const adminPages = [
    { name: '공지쓰기', path: '/write-notice' },
    { name: '회원관리', path: '/edit-user' }
]
const settings = ['프로필', '로그아웃'];

function ResponsiveAppBar() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);

    // 사용자의 관리자 상태를 확인하는 함수
    const checkAdminStatus = async () => {

        try {
            const response = await api.get(`/api/user-status`);
            if (response.status === 200) {
                const diary = response.data.admin;
                console.log(diary)
                setProfileImage(`http://localhost:8080${response.data.profileImageUrl}`);
                if (diary) {
                    //관리자이면 true
                    if (diary === 1) {
                        setIsAdmin(true);
                    }
                    else {
                        setIsAdmin(false)
                    }
                }
            } else {
                console.error('Diary not found');
            }
        } catch (error) {
            console.error('Error fetching diary:', error);
        }

    };



    useEffect(() => {

        checkAdminStatus();
    }, []);


    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    const handleMenuClick = (path) => {
        navigate(path);
    };
    const handleSettingClick = async (setting) => {
        if (setting === '프로필') {
            navigate('/profile');
        } else if (setting === '로그아웃') {
            localStorage.removeItem('token');
            try {
                const response = await api.post('/logout');
                if (response.status === 201 || response.status === 200) {
                    navigate('/login');
                }

            } catch (err) {
                navigate('/login');
                //console.err(err);
            }

        }
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
                            {isAdmin ? adminPages.map((page) => (
                                <MenuItem key={page.name} onClick={(e) => { handleCloseNavMenu(); handleMenuClick(page.path); }}>
                                    <Typography textAlign="center" px={{ fontSize: 20, fontFamily: "Nanum Pen Script" }}>{page.name}</Typography>
                                </MenuItem>
                            )) : null}
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
                        {isAdmin ? adminPages.map((page) => (
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
                        )) : null}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <Paper sx={{
                                bgcolor: 'white',
                                borderRadius: '50%'
                            }}>
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt="Remy Sharp" src={profileImage} />
                                </IconButton>
                            </Paper>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={(e) => { handleCloseUserMenu(); handleSettingClick(setting) }}>
                                    <Typography textAlign="center" sx={{ fontSize: 20, fontFamily: "Nanum Pen Script" }}>{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;