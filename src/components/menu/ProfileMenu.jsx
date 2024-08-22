import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../navbar/topbar'
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Card, CardContent, Avatar, IconButton, Button, CssBaseline, Grid, Typography, Box } from '@mui/material';
import api from '../../utils/api'
import '../../css/loading.css'

const Profile = () => {
    const [user, setUser] = useState('');
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState(false);
    const [nickname, setNickname] = useState('');
    const [nicknameError, setNicknameError] = useState('')

    const [profileImage, setProfileImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const fetchUser = async () => {
        try {
            const response = await api.get('/api/findUser');
            if (response.status === 200) {
                setUser(response.data);
                setProfileImage(`http://localhost:8080${response.data.profileImageUrl}`);
            }
        } catch (error) {
            console.error('Error fetching diaries:', error);
        } finally {
            setLoading(false); // 비동기 작업이 완료되면 로딩 상태를 false로 설정
        }
    };
    useEffect(() => {
        fetchUser();
    }, []);

    const handleEditName = async (e) => {
        e.stopPropagation(); // 클릭 이벤트가 ListItem로 전파되는 것을 방지
        setNickname(user.nickname);
        setDialog(true);
    };
    const handleClose = () => {
        setDialog(false);
    };

    const validateField = (field, value) => {
        if (field === "nickname") {
            if (value) {
                setNicknameError('')
            } else if (!value) {
                setNicknameError('칸이 비어있습니다')
            }
        }
    }

    const handleEdit = async () => {
        //error 통과
        if (checkError()) {
            try {
                const response = await api.put('/api/profile-edit-user', { nickname: nickname.trim() });
                if (response.status === 200) {
                    setNickname('');
                    fetchUser();
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
        const trimmedNickname = nickname.trim(); // 공백 제거
        if (!trimmedNickname) {
            setNicknameError('칸이 비어있습니다');
            return false
        } else {

            if (user.nickname !== trimmedNickname) {
                try {
                    const response = await api.post('/check-nickname', { nickname: trimmedNickname });
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


    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);

            // 서버로 이미지 업로드
            const formData = new FormData();
            formData.append('profileImage', file);
            try {
                const response = await api.post('/api/upload-profile-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                if (response.status === 200) {
                    console.log("프로필 이미지 업로드 성공");
                    fetchUser(); // 사용자 정보를 다시 불러와 업데이트된 이미지 URL을 가져옵니다.
                }
            } catch (error) {
                console.error('프로필 이미지 업로드 실패:', error);
            }
        }
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
            <Card
                elevation={3}
                sx={{
                    margin: { xs: '8% 5%', md: '4% 15%' },
                    overflow: 'visible',
                    border: '2px solid black',
                    borderRadius: '3px',
                    backgroundColor: '#FEDC2A',  // 밝은 노란색 배경
                }}
            >
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid
                            item
                            xs={12}
                            md={4}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                            }}
                        >
                            <Paper
                                elevation={6}
                                sx={{
                                    borderRadius: '50%',
                                    padding: '10px',
                                    backgroundColor: 'white',
                                }}
                            >
                                <IconButton sx={{
                                    p: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Avatar
                                        alt={user.nickname}
                                        // src="/path/to/image.jpg"
                                        sx={{
                                            width: { xs: '200px', md: '180px' },
                                            height: { xs: '200px', md: '180px' },
                                            borderRadius: '50%',
                                            border: '4px solid #FFD700',  // 금색 테두리
                                        }}
                                        onClick={handleImageClick}
                                        src={profileImage || user.profileImageUrl} // 프로필 이미지 URL 사용
                                    />
                                </IconButton>
                            </Paper>

                            <Typography
                                variant="caption"
                                sx={{
                                    position: 'absolute',
                                    bottom: { xs: 30, md: 90 },
                                    right: { xs: 150, md: 90 },
                                    transform: 'translate(50%, 50%)',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '30px',
                                    fontWeight: 'bold',
                                    boxShadow: 3,
                                    cursor: 'pointer',
                                }}
                                onClick={handleImageClick}
                            >
                                +
                            </Typography>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                        </Grid>

                        <Grid item xs={12} md={8} container>
                            <Grid item xs={12}>
                                <Typography variant="h2" sx={{
                                    fontFamily: "Nanum Pen Script",
                                    textAlign: { xs: 'center', md: 'start' },
                                    color: '#333',
                                }}>
                                    {user.nickname}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    color="primary"
                                    sx={{
                                        cursor: 'pointer',
                                        fontFamily: "Nanum Pen Script",
                                        textAlign: { xs: 'center', md: 'start' },
                                        mb: 3,
                                    }}
                                    onClick={(e) => handleEditName(e)}
                                >
                                    닉네임 변경
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontFamily: "Nanum Pen Script",
                                        textAlign: { xs: 'center', md: 'start' },
                                        mb: 2,
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        component="span"
                                        sx={{
                                            fontFamily: "Nanum Pen Script",
                                            display: 'inline',
                                            fontWeight: 'bold',
                                            color: '#FF5722',
                                        }}
                                    >
                                        {user.index}
                                    </Typography>
                                    {' 번째 회원!'}
                                </Typography>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontFamily: "Nanum Pen Script",
                                        mb: 2,
                                        textAlign: { xs: 'center', md: 'start' }
                                    }}
                                >
                                    이메일 : {user.email}
                                </Typography>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontFamily: "Nanum Pen Script",
                                        mb: 2,
                                        textAlign: { xs: 'center', md: 'start' }
                                    }}
                                >
                                    일기 개수: {user.diariesNum} 개
                                </Typography>

                                {user.admin === 1 && (
                                    <Typography
                                        variant="h5"
                                        color="secondary"
                                        sx={{
                                            fontFamily: "Nanum Pen Script",
                                            textAlign: { xs: 'center', md: 'start' },
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        관리자
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>


            <Dialog open={dialog} onClose={handleClose}>
                <DialogTitle>닉네임 변경</DialogTitle>
                <DialogContent>

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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        취소
                    </Button>
                    <Button onClick={handleEdit} color="primary">
                        변경하기
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    );
}

const ProfileMenu = () => {
    return (
        <div className='main-form'>
            <Navbar />
            <Profile />
        </div>
    );
};

export default ProfileMenu;