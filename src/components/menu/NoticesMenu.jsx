import React, { useState, useEffect } from 'react';
import Navbar from '../navbar/topbar'
import { useMediaQuery, FormControl, TextField, useTheme, CssBaseline, Box, Button, Grid, List, ListItem, ListItemText, Typography, IconButton } from '@mui/material';
import api from '../../utils/api'
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import SearchIcon from '@mui/icons-material/Search';
import '../../css/loading.css'


const NoticesMenuForm = () => {
    const [notices, setNotices] = useState([]);
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(' ');
    const [isAdmin, setIsAdmin] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // 페이지당 항목 수


    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = notices.slice().reverse().slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(notices.length / itemsPerPage);


    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleFirstPage = () => handlePageChange(1);
    const handleLastPage = () => handlePageChange(totalPages);
    const handlePrevPage = () => handlePageChange(currentPage - 1);
    const handleNextPage = () => handlePageChange(currentPage + 1);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const inputValue = title;
        if (inputValue) {
            try {
                const response = await axios.get('http://localhost:8080/api/notices/search', { params: { inputValue } });
                if (response.status === 200) {
                    if (response.data.message) {
                        setMessage(response.data.message); // "공지가 없습니다" 메시지 설정
                        setNotices([]);
                    } else {
                        setNotices(response.data);
                        setMessage(''); // 메시지 초기화
                    }
                }
            } catch (error) {
                console.error('Error fetching notices:', error);
            }
        } else {
            try {
                const response = await axios.get('http://localhost:8080/api/notices');
                if (response.status === 200) {
                    setNotices(response.data);
                }
            } catch (error) {
                console.error('Error fetching notices:', error);
            }
        }
    };

    // 사용자의 관리자 상태를 확인하는 함수
    const checkAdminStatus = async () => {

        try {
            const response = await api.get(`/api/user-status`);
            if (response.status === 200) {
                const diary = response.data;
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
        const fetchnotices = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/notices');
                if (response.status === 200) {
                    setNotices(response.data);
                }
            } catch (error) {
                console.error('Error fetching notices:', error);
            } finally {
                setLoading(false); // 비동기 작업이 완료되면 로딩 상태를 false로 설정
            }
        };

        fetchnotices();
        checkAdminStatus();
    }, []);

    const handleNoticeClick = (id) => {
        navigate(`/notification/${id}`);
    };


    //관리자 일때만!
    const handleDeleteClick = async (id, e) => {
        e.stopPropagation(); // 클릭 이벤트가 ListItem로 전파되는 것을 방지

        try {
            // 서버에 삭제 요청 보내기
            const response = await api.delete(`/api/notices/${id}`);
            if (response.status === 200) {
                // 일기 삭제 후 UI에서 해당 일기를 제거하는 로직 추가
                setNotices((prevnotices) => prevnotices.filter((notice) => notice._id !== id));
            }
        } catch (error) {
            console.error('Error deleting notice:', error);
        }
    };

    //관리자일때만!
    const handleEditClick = (id, e) => {
        e.stopPropagation(); // 클릭 이벤트가 ListItem로 전파되는 것을 방지
        navigate(`/edit-notice/${id}`);
    };



    if (loading) {
        return (
            <React.Fragment>
                <CssBaseline>
                    <Box textAlign={'center'}>
                        <Typography
                            sx={{
                                marginTop: 5,
                                fontSize: 40,
                                fontFamily: "Nanum Pen Script",
                                color: 'black',
                                display: 'inline-block',
                                padding: '10px',
                            }
                            }
                        >
                            <h1 className='title'>
                                <span>L</span>
                                <span>o</span>
                                <span>a</span>
                                <span>d</span>
                                <span>i</span>
                                <span>n</span>
                                <span>g</span>
                                <span>.</span>
                                <span>.</span>
                                <span>.</span>
                            </h1>
                        </Typography>
                    </Box>
                </CssBaseline>
            </React.Fragment>
        )

    }
    return (
        <React.Fragment>
            <CssBaseline />
            <Grid container spacing={2} sx={{ // 화면 크기에 따라 좌우 마진 조정
                paddingRight: '10%',
                paddingLeft: '10%',
                '@media (min-width:599px)': {
                    paddingRight: '15%',
                    paddingLeft: '15%',
                },
                marginTop: '3%', marginBottom: '5%'
            }}>
                <Grid item xs={12} textAlign={'end'} sx={{ paddingBottom: 0 }} >
                    {notices.length > 0 || message === '공지가 없습니다' ? <form onSubmit={handleSubmit}>
                        <FormControl sx={{
                            position: 'relative', width: '40%',
                            '@media (min-width:599px)': {
                                width: '20%'
                            },
                        }}>
                            <TextField
                                label="제목"
                                fullWidth
                                value={title}
                                onChange={handleTitleChange}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            edge="end"
                                            sx={{
                                                position: 'absolute',
                                                right: 15,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'black',
                                            }}
                                            type="submit"
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                    ),
                                    sx: {
                                        height: 40, // 높이 설정

                                    },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        // 커스텀 높이 적용
                                        height: 40, // 원하는 높이로 조정
                                        top: '7px', // 라벨의 위치를 조정하여 높이를 맞춥니다
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused': {
                                        '& fieldset': {
                                            borderColor: '#FEDC2A', // 포커스 아웃라인 색상 변경
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#FEDC2A', // 포커스 라벨 색상 변경
                                    },
                                }}
                            />
                        </FormControl>
                    </form> : null}

                </Grid>
                <Grid item xs={12} >
                    {notices.length > 0 ? <><List >
                        {currentItems.map((notice) => (
                            <ListItem key={notice._id} onClick={() => handleNoticeClick(notice._id)}
                                sx={{
                                    height: '60px',
                                    marginBottom: 2,
                                    fontSize: 20,
                                    color: 'black',
                                    fontFamily: "Nanum Pen Script",
                                    background: '#FEDC2A',
                                    boxShadow: '5px 5px 0 0 #FEDC2A, inset 4px 4px 0 0 white',
                                    border: '2px solid black',
                                    borderRadius: '3px',
                                    wordBreak: 'break-word',
                                    position: 'relative',
                                    transition: 'background 0.2s ease, box-shadow 0.2s ease',
                                    '&:hover': {
                                        cursor: 'pointer',
                                        background: 'white',
                                        boxShadow: '5px 5px 0 0 #FEDC2A, inset 4px 4px 0 0 white',
                                        '& .delete-icon ': {
                                            visibility: 'visible',
                                            opacity: 1,
                                            transition: 'opacity 0.2s ease'
                                        },
                                        '& .edit-icon ': {
                                            visibility: 'visible',
                                            opacity: 1,
                                            transition: 'opacity 0.2s ease'
                                        }
                                    },

                                }}
                            >
                                <ListItemText
                                    primary={notice.title}
                                    secondary={new Date(notice.date).toLocaleDateString()}
                                />
                                {isAdmin ? <IconButton
                                    edge="end"
                                    sx={{
                                        position: 'absolute',
                                        right: 55,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'black',
                                        visibility: 'hidden',
                                        opacity: 0,
                                        transition: 'opacity 0.2s ease',
                                    }}
                                    className="edit-icon"
                                    onClick={(e) => handleEditClick(notice._id, e)}
                                >
                                    <EditIcon />
                                </IconButton> : null}
                                {isAdmin ? <IconButton
                                    edge="end"
                                    sx={{
                                        position: 'absolute',
                                        right: 20, // 우측
                                        top: '50%', // 중앙
                                        transform: 'translateY(-50%)', // 중앙 정렬
                                        color: 'black',
                                        visibility: 'hidden', // 기본적으로 숨김
                                        opacity: 0,
                                        transition: 'opacity 0.2s ease',
                                    }}
                                    className="delete-icon"
                                    onClick={(e) => handleDeleteClick(notice._id, e)}
                                >
                                    <DeleteIcon />
                                </IconButton> : null}

                            </ListItem>
                        ))}
                    </List>
                        <Grid container justifyContent="center" spacing={1} sx={{ marginTop: 2 }}>
                            <IconButton
                                sx={{
                                    color: 'black',
                                    padding: '1px',
                                    '&:hover': {
                                        backgroundColor: 'transparent', // Hover 배경색 제거
                                        opacity: 1, // Hover 투명도 제거
                                    },

                                }}
                                onClick={handleFirstPage}
                                disabled={currentPage === 1}
                            >

                                <KeyboardDoubleArrowLeftIcon />
                            </IconButton>
                            <IconButton
                                sx={{
                                    color: 'black',
                                    padding: '1px',
                                    '&:hover': {
                                        backgroundColor: 'transparent', // Hover 배경색 제거
                                        opacity: 1, // Hover 투명도 제거
                                    },
                                }}
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                            >

                                <KeyboardArrowLeftIcon />
                            </IconButton>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <Grid item key={index}>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            width: '10px', // 원하는 width 값으로 설정
                                            minWidth: '10px', // 최소 너비도 같은 값으로 설
                                            backgroundColor: 'yellow',
                                            color: 'black',
                                            fontFamily: "Nanum Pen Script",
                                            background: '#FEDC2A',
                                            border: '2px solid black',
                                            '&:hover': {
                                                background: 'white',
                                            },
                                        }}
                                        onClick={() => handlePageChange(index + 1)}
                                        disabled={currentPage === index + 1}
                                    >
                                        {index + 1}
                                    </Button>
                                </Grid>
                            ))}
                            <IconButton
                                sx={{
                                    color: 'black',
                                    padding: '1px',
                                    paddingLeft: '2px',
                                    '&:hover': {
                                        backgroundColor: 'transparent', // Hover 배경색 제거
                                        opacity: 1, // Hover 투명도 제거
                                    },
                                }}
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >

                                <KeyboardArrowRightIcon />
                            </IconButton>
                            <IconButton
                                sx={{
                                    color: 'black',
                                    padding: '1px',
                                    '&:hover': {
                                        backgroundColor: 'transparent', // Hover 배경색 제거
                                        opacity: 1, // Hover 투명도 제거
                                    },
                                }}
                                onClick={handleLastPage}
                                disabled={currentPage === totalPages}
                            >

                                <KeyboardDoubleArrowRightIcon />
                            </IconButton>
                        </Grid>
                    </>
                        :

                        <div>
                            {message === '' ?
                                <>
                                    <Typography sx={{ textAlign: 'center', fontFamily: "Nanum Pen Script", fontSize: 40, margin: 5 }}>공지가 없습니다.</Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: isSmallScreen ? 'column' : 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 3,
                                            paddingTop: 2,
                                            marginTop: '5%'
                                        }}
                                    >
                                        <Button
                                            sx={{
                                                width: isSmallScreen ? '50%' : '20%',
                                                fontSize: 20,
                                                color: 'black',
                                                fontFamily: "Nanum Pen Script",
                                                background: '#FEDC2A',
                                                boxShadow: '5px 5px 0 0 #FEDC2A, inset 4px 4px 0 0 white',
                                                border: '2px solid black',
                                                borderRadius: '3px',
                                                '&:hover': {
                                                    background: 'white',
                                                    boxShadow: '5px 5px 0 0 #FEDC2A, inset 4px 4px 0 0 white'
                                                },

                                            }}
                                            onClick={() => { navigate('/main') }}
                                        >
                                            홈으로
                                        </Button>
                                    </Box></> : <Typography sx={{ textAlign: 'center', fontFamily: "Nanum Pen Script", fontSize: 40, margin: 5 }}>공지가 없습니다.</Typography>}

                        </div>
                    }

                </Grid>
            </Grid>
        </React.Fragment >
    )
}


const NoticesMenu = () => {
    return (
        <div className='main-form'>
            <Navbar />
            <NoticesMenuForm />
        </div>
    );
};

export default NoticesMenu;