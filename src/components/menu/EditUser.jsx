import React, { useState, useEffect } from 'react';
import Navbar from '../navbar/topbar'
import { Dialog, DialogTitle, Card, CardContent, CardActions, DialogContent, DialogActions, useMediaQuery, FormControl, TextField, useTheme, CssBaseline, Box, Button, Grid, Typography, IconButton } from '@mui/material';
import api from '../../utils/api'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import SearchIcon from '@mui/icons-material/Search';
import '../../css/loading.css'
import axios from "axios";


const EditUserForm = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [name, setname] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [userInformation, setUserInformation] = useState([]);
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [nicknameError, setNicknameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const serverUrl = process.env.REACT_APP_SERVER_URL;

    const itemsPerPage = 9; // 페이지당 항목 수


    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = users.slice().reverse().slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);


    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    const handleNameChange = (e) => {
        setname(e.target.value);
    };

    const handleFirstPage = () => handlePageChange(1);
    const handleLastPage = () => handlePageChange(totalPages);
    const handlePrevPage = () => handlePageChange(currentPage - 1);
    const handleNextPage = () => handlePageChange(currentPage + 1);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const inputValue = name;
        if (inputValue) {
            try {
                const response = await api.get('/api/users/search', { params: { inputValue } });
                if (response.status === 200) {
                    if (response.data.message) {
                        setMessage(response.data.message); // "유저가 없습니다" 메시지 설정
                        setUsers([]);
                    } else {
                        setUsers(response.data);
                        setMessage(''); // 메시지 초기화
                    }
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        } else {
            try {
                const response = await api.get('/api/users');
                if (response.status === 200) {
                    setUsers(response.data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }
    };


    const fetchusers = async () => {
        try {
            const response = await api.get('/api/users');
            if (response.status === 200) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false); // 비동기 작업이 완료되면 로딩 상태를 false로 설정
        }
    };

    useEffect(() => {
        fetchusers();
        setNicknameError('');
        setPasswordError('');
    }, []);




    const handleDeleteClick = async (id, e) => {
        e.stopPropagation(); // 클릭 이벤트가 ListItem로 전파되는 것을 방지

        try {
            // 서버에 삭제 요청 보내기
            const response = await api.delete(`/api/users/${id}`);
            if (response.status === 200) {
                // 일기 삭제 후 UI에서 해당 일기를 제거하는 로직 추가
                setUsers((prevusers) => prevusers.filter((user) => user._id !== id));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEditClick = (user, e) => {
        e.stopPropagation(); // 클릭 이벤트가 ListItem로 전파되는 것을 방지
        setUserInformation(user);
        setNickname(user.nickname);
        setDialog(true);
    };

    const handleClose = () => {
        setDialog(false);
    };

    const handleEdit = async () => {
        //error 통과
        const check = await checkError();
        if (check) {
            try {
                const response = await api.put('/api/edit-user', { _id: userInformation._id, nickname: nickname.trim(), password: password.trim() });
                if (response.status === 200) {
                    setNickname('');
                    setPassword('');
                    fetchusers()
                }
            } catch (err) {
                console.error(err);
            }
            setDialog(false);
        } else {
            console.log("실패")
        };

    };

    const checkError = async () => {
        const trimmedNickname = nickname.trim(); // undefined일 경우 빈 문자열로 처리
        const trimmedPassword = password.trim(); // undefined일 경우 빈 문자열로 처리
        if (!trimmedNickname || !trimmedPassword) {
            if (!trimmedNickname) {
                setNicknameError('칸이 비어있습니다');
            }
            if (!trimmedPassword) {
                setPasswordError('칸이 비어있습니다');
            }
            return false
        } else {

            if (userInformation.nickname !== trimmedNickname) {
                try {
                    const response = await axios.post(`${serverUrl}/check-nickname`, { nickname: trimmedNickname });
                    if (!response.data.isAvailable) {
                        setNicknameError('닉네임이 이미 사용 중입니다')
                    }
                    else {
                        setNicknameError('')
                    }

                } catch (err) {
                    console.error(err);
                }
            }
            return true
        }


    }

    const validateField = (field, value) => {
        if (field === "nickname") {
            if (value) {
                setNicknameError('')
            } else if (!value) {
                setNicknameError('칸이 비어있습니다')
            }
        } else if (field === "password") {
            if (value) {
                setPasswordError('')
            } else if (!value) {
                setPasswordError('칸이 비어있습니다')
            }
        }
    }
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
                <Grid item xs={12} textAlign={'end'} sx={{ paddingBottom: 0, marginBottom: 2 }} >
                    {users.length > 0 || message === '유저가 없습니다' ? <form onSubmit={handleSubmit}>
                        <FormControl sx={{
                            position: 'relative', width: '40%',
                            '@media (min-width:599px)': {
                                width: '20%'
                            },
                        }}>
                            <TextField
                                label="이름"
                                fullWidth
                                value={name}
                                onChange={handleNameChange}
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
                    {users.length > 0 ? <><Grid container spacing={2}>
                        {currentItems.map((user) => (
                            <Grid item xs={12} sm={6} md={4} key={user._id}>
                                <Card
                                    onClick={(e) => handleEditClick(user, e)}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        background: '#FEDC2A',
                                        boxShadow: '5px 5px 0 0 #FEDC2A, inset 4px 4px 0 0 white',
                                        border: '2px solid black',
                                        borderRadius: '3px',
                                        transition: 'background 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            cursor: 'pointer',
                                            background: 'white',
                                            boxShadow: '5px 5px 0 0 #FEDC2A, inset 4px 4px 0 0 white',
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h5" component="div" sx={{ fontFamily: "Nanum Pen Script", fontSize: 24 }}>
                                            {user.nickname}
                                        </Typography>
                                        {user.admin === 1 && (
                                            <Typography variant="body2" color="text.secondary">
                                                admin(삭제 금지)
                                            </Typography>
                                        )}
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleEditClick(user, e)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleDeleteClick(user._id, e)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
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
                                    <Typography sx={{ textAlign: 'center', fontFamily: "Nanum Pen Script", fontSize: 40, margin: 5 }}>유저가 없습니다.</Typography>
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
                                    </Box></> : <Typography sx={{ textAlign: 'center', fontFamily: "Nanum Pen Script", fontSize: 40, margin: 5 }}>유저가 없습니다.</Typography>}

                        </div>
                    }

                </Grid>
            </Grid>

            <Dialog open={dialog} onClose={handleClose}>
                <DialogTitle>{userInformation.nickname}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={5} sx={{ // 화면 크기에 따라 좌우 마진 조정
                        paddingRight: '10%',
                        paddingLeft: '10%',
                        marginTop: '3%', marginBottom: '5%'
                    }}>
                        <Grid xs={12} sx={{ marginBottom: 3 }}>
                            <Typography>
                                이메일 : {userInformation.email}
                            </Typography>
                        </Grid>
                        <Grid xs={12}>
                            닉네임 변경
                        </Grid>
                        <Grid xs={12} sx={{ marginBottom: 3 }}>
                            <TextField
                                variant="outlined"
                                value={nickname}
                                onChange={(e) => { setNickname(e.target.value); validateField('nickname', e.target.value) }}
                                sx={{
                                    paddingTop: '8px',
                                    '& .MuiOutlinedInput-root.Mui-focused': {
                                        '& fieldset': {
                                            borderColor: '#FEDC2A', // 포커스 아웃라인 색상 변경
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#FEDC2A', // 포커스 라벨 색상 변경
                                    },
                                }}
                                helperText={nicknameError}
                            //error={Boolean(error)}
                            />
                        </Grid>
                        <Grid xs={12}>
                            비밀번호 재설정
                        </Grid>
                        <Grid xs={12}>
                            <Typography>
                                <TextField
                                    variant="outlined"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); validateField('password', e.target.value) }}
                                    sx={{
                                        paddingTop: '8px',
                                        '& .MuiOutlinedInput-root.Mui-focused': {
                                            '& fieldset': {
                                                borderColor: '#FEDC2A', // 포커스 아웃라인 색상 변경
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#FEDC2A', // 포커스 라벨 색상 변경
                                        },
                                    }}
                                    helperText={passwordError}
                                />
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        취소
                    </Button>
                    <Button onClick={handleEdit} color="primary">
                        수정하기
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    )
}


const EditUser = () => {
    return (
        <div className='main-form'>
            <Navbar />
            <EditUserForm />
        </div>
    );
};

export default EditUser;