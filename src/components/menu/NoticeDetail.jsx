

import React, { useState, useEffect } from 'react';
import Navbar from '../navbar/topbar'
import { useMediaQuery, useTheme, Button, CssBaseline, Grid, Typography, Box } from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import dayjs from 'dayjs';
import yellowBrush from '../../images/yellowBrush.png';
import noteBackground from '../../images/noteBackground.png';
import 'dayjs/locale/ko'; // 한국어 로케일 import
import axios from 'axios';
dayjs.locale('ko'); // dayjs의 로케일을 한국어로 설정

const NoticeContent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [date, setDate] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchDiary = async () => {
            if (!id) return;

            try {
                const response = await axios.get(`http://localhost:8080/api/edit-notices/${id}`);
                if (response.status === 200) {
                    const diary = response.data;
                    const formatDate = dayjs(diary.date).format('YYYY년 MM월 DD일 dddd');
                    setDate(formatDate);
                    setTitle(diary.title || '');
                    setContent(diary.content || '');
                }
            } catch (error) {
                console.error('Error fetching diary:', error);
            } finally {
                setLoading(false); // 비동기 작업이 완료되면 로딩 상태를 false로 설정
            }
        };
        fetchDiary();

    }, [id]);



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
                                backgroundImage: `url(${yellowBrush})`,
                                backgroundSize: '100% 100%',
                                color: 'black',
                                display: 'inline-block',
                                padding: '10px',
                            }
                            }
                        >Loading...</Typography>
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
                <Grid xs={12} textAlign={'center'}>
                    <Typography
                        sx={{
                            fontSize: 40,
                            fontFamily: "Nanum Pen Script",
                            backgroundImage: `url(${yellowBrush})`,
                            backgroundSize: '100% 100%',
                            color: 'black',
                            display: 'inline-block',
                            padding: '10px',
                        }
                        }
                    >{title}</Typography>
                </Grid>
                <Grid xs={12} textAlign={'end'}>
                    <Typography
                        sx={{
                            marginTop: 2,
                            fontSize: 20,
                            fontFamily: "Nanum Pen Script",
                            '@media (min-width:599px)': {
                                fontSize: 25
                            },
                        }}
                    >{date}</Typography>
                </Grid>
                <Grid xs={12} >
                    <hr style={{
                        border: 'none',
                        borderTop: '2px solid black', // 밑줄의 두께와 색상
                        marginTop: '15px', // 텍스트와 밑줄 사이의 간격
                    }} />
                </Grid>
                <Grid xs={2} md={3} />
                <Grid xs={8} md={6} sx={{

                    marginTop: 4,
                    backgroundImage: `url(${noteBackground})`,
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    //, // 내용이 잘리지 않도록 설정
                    height: {
                        xs: '400px', // xs 크기일 때 높이 설정
                        md: '500px'  // md 크기 이상일 때 높이 설정
                    },
                }} >
                    <Box sx={{
                        marginTop: 5,
                        width: '100%', height: '80%',
                        overflow: 'auto',
                    }}>
                        <Typography sx={{
                            fontSize: 20,
                            fontFamily: "Nanum Pen Script",
                            color: 'black',
                            padding: '20px',
                            paddingLeft: 10,
                            paddingRight: 10,
                            textDecoration: 'underline',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                        }}>{content}</Typography>
                    </Box>
                </Grid>
                <Grid xs={2} md={3} />
                <Grid xs={12} textAlign={'center'}>
                    <Button
                        sx={{
                            marginTop: 5,
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
                </Grid>

            </Grid>
        </React.Fragment>
    )
}


const NoticeDetail = () => {
    return (
        <div className='main-form'>
            <Navbar />
            <NoticeContent />
        </div>
    );
};

export default NoticeDetail;