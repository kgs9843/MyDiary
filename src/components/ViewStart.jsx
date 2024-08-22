import React, { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Grid, Button, useMediaQuery, Typography, useTheme } from '@mui/material';
import '../css/main.css'
import egg from '../images/pngegg.png'
import '../css/loading.css';

function StartScreen() {
    const [isShaking, setIsShaking] = useState(false);
    const [eggCount, setEggCount] = useState(10000000);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));


    const handleClick = () => {
        const newEggCount = eggCount - 1;
        setEggCount(newEggCount)
        setIsShaking(true);
        // 애니메이션이 끝난 후 상태를 원래대로 돌리기
        setTimeout(() => setIsShaking(false), 500); // 애니메이션 시간과 일치시켜야 함
    };



    return (
        <React.Fragment>
            <CssBaseline />
            <Grid container spacing={1} >
                <Grid item xs={12} md={1} />
                <Grid item xs={12} md={10} sx={{ marginTop: '5%' }}>
                    <Box >
                        <Typography textAlign="center" sx={{ fontSize: 30, fontFamily: "Nanum Pen Script" }}>
                            로그인 해주세요!
                        </Typography>
                    </Box>
                    <Box color="black" p={2}>
                        <Typography textAlign="center" sx={{ fontSize: 50, fontFamily: "Nanum Pen Script" }}>
                            <h1 className='title'>
                                <span>마</span>
                                <span>이</span>
                                <span>다</span>
                                <span>이</span>
                                <span>어</span>
                                <span>리</span>
                                <span>!</span>
                            </h1>
                        </Typography>
                        <br></br>
                        <Typography textAlign="center" sx={{ fontSize: 20, fontFamily: "Nanum Pen Script" }}>
                            당신의 삶을 기록해 보세요.
                        </Typography>
                    </Box>
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
                                marginRight: isSmallScreen ? '0' : '10%',
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
                            onClick={() => { alert('로그인 후 사용하세요!') }}
                        >
                            일기 작성
                        </Button>
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
                            onClick={() => { alert('로그인 후 사용하세요!') }}
                        >
                            일기 목록
                        </Button>
                    </Box>
                </Grid>
                <Grid className='grid' item xs={12} md={1} sx={{ marginTop: '2%', paddingRight: { md: 5 } }} textAlign="center" >
                    <Typography className="egg-number" textAlign="center" sx={{
                        margin: {
                            xs: 5,
                            md: 0
                        },
                        marginTop: {
                            md: 0
                        },
                        fontSize: {
                            xs: 30, // XS 화면에서 폰트 크기
                            md: 20, // MD 화면에서 폰트 크기
                        }, fontFamily: "Nanum Pen Script"
                    }}>
                        {eggCount === 0 ? null : eggCount}
                    </Typography>
                    {eggCount === 0 ? (
                        <Typography textAlign="center" sx={{
                            fontSize: {
                                xs: 30, // XS 화면에서 폰트 크기
                                md: 20, // MD 화면에서 폰트 크기
                            },
                            fontFamily: "Nanum Pen Script"
                        }}>
                            {/* 수정부분 */}
                            축하합니다!
                        </Typography>
                    ) : (
                        <Box component="img" src={egg} alt="달걀" className={`egg-image ${isShaking ? 'shake' : ''}`}
                            onClick={handleClick} sx={{
                                width: {
                                    xs: '20%', // xs 크기일 때
                                    md: '80%'  // md 크기 이상일 때
                                }
                            }} />
                    )}
                </Grid>
            </Grid>
        </React.Fragment >
    );
}



export default StartScreen;