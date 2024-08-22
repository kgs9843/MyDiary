import React, { useState, useEffect } from 'react';
import Navbar from '../navbar/topbar'
import { TextField, Button, Grid, MenuItem } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Canvas from '../Canvas';
import { useNavigate, useParams } from "react-router-dom";
import dayjs from 'dayjs';
import api from '../../utils/api'
import '../../css/loader.css'

const WriteDiaryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // URL 파라미터에서 id를 가져옵니다.
    const [date, setDate] = useState(dayjs());
    const [weather, setWeather] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [canvasData, setCanvasData] = useState(null);
    const [editCanvasData, setEditCanvasData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCanvasData = (data) => {
        setCanvasData(data);
    };

    useEffect(() => {
        const fetchDiary = async () => {
            if (!id) {
                // id가 없으면 아무것도 실행하지 않음
                setDate(dayjs());
                setWeather('');
                setTitle('');
                setContent('');
                setCanvasData(null);
                return;
            }

            try {
                const response = await api.get(`/api/edit-diaries/${id}`);
                if (response.status === 200) {
                    const diary = response.data;

                    // 서버에서 가져온 일기 데이터를 상태에 설정
                    setDate(dayjs(diary.date));
                    setWeather(diary.weather || null);
                    setTitle(diary.title || null);
                    setContent(diary.content || null);

                    // canvas 데이터가 존재할 경우 상태에 설정
                    if (diary.canvas) {
                        setEditCanvasData(diary.canvas);
                    } else {
                        setEditCanvasData(null);
                    }
                } else {
                    console.error('Diary not found');
                }
            } catch (error) {
                console.error('Error fetching diary:', error);
            }
        };
        fetchDiary();
    }, [id])


    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('No token found in localStorage');
            return;
        }



        const diaryEntry = {
            date,
            weather,
            title,
            content,
        };


        setLoading(true)

        // canvasData를 청크로 나누는 함수
        const chunkSize = 1024 * 10; // 10KB 단위로 청크
        const createChunks = (data) => {
            const chunks = [];
            for (let i = 0; i < data.length; i += chunkSize) {
                chunks.push(data.slice(i, i + chunkSize));
            }
            return chunks;
        };

        const canvasChunks = createChunks(canvasData);

        try {
            for (let i = 0; i < canvasChunks.length; i++) {
                const chunk = canvasChunks[i];
                const response = await axios.post('http://localhost:8080/api/upload-canvas-chunk', {
                    chunk,
                    index: i,
                    totalChunks: canvasChunks.length,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // 토큰을 Authorization 헤더에 포함
                    }
                });
                if (response.status !== 200) {
                    throw new Error('Failed to upload chunk')
                }
            }
            console.log('chunk data successfully')


            if (id) {
                const response = await api.put(`/edit-diaries-form/${id}`, diaryEntry);
                if (response.status === 200) {
                    console.log('Diary updated successfully');
                    setLoading(false)
                    navigate('/my-diary');
                }
                else if (response.status !== 200) {
                    throw new Error('Failed to upload chunk')
                }

            }
            else {
                const response = await axios.post('http://localhost:8080/api/write-diary-form', diaryEntry, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // 토큰을 Authorization 헤더에 포함
                    },
                });

                if (response.status === 200) {
                    console.log('Diary entry submitted successfully');
                    setLoading(false)
                    navigate('/my-diary');
                } else if (response.status === 401) {
                    alert(response.data.message)
                }
                else {
                    console.error('Failed to submit diary entry');
                }
            }
        } catch (error) {
            setLoading(false)
            console.error(error);
        }
    };
    return (
        <React.Fragment>
            <CssBaseline />
            <Grid container spacing={2} sx={{ paddingRight: '10%', paddingLeft: '10%', marginTop: '3%', marginBottom: '5%' }}>
                <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DatePicker']}>
                            <DatePicker
                                format="YYYY-MM-DD"
                                label="날짜"
                                value={date}
                                onChange={(newValue) => setDate(newValue)}
                                showDaysOutsideCurrentMonth
                                sx={{
                                    width: '100%',
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
                        </DemoContainer>
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        label="날씨"
                        variant="outlined"
                        value={weather}
                        onChange={(e) => setWeather(e.target.value)}
                        fullWidth
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
                    >
                        <MenuItem value="화창">화창</MenuItem>
                        <MenuItem value="흐림">흐림</MenuItem>
                        <MenuItem value="비">비</MenuItem>
                        <MenuItem value="눈">눈</MenuItem>
                        <MenuItem value="선선">선선</MenuItem>
                        <MenuItem value="쌀쌀">쌀쌀</MenuItem>
                        <MenuItem value="쌀쌀">바람</MenuItem>
                        <MenuItem value="쌀쌀">태풍</MenuItem>
                        <MenuItem value="쌀쌀">폭염</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        label="제목"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                    />
                </Grid>
                <Grid item xs={12} md={7} lg={5} textAlign={'center'}>
                    <Canvas editCanvasData={editCanvasData} canvasData={canvasData} onCanvasData={handleCanvasData} />
                </Grid>
                <Grid item xs={12} md={5} lg={7}>
                    <TextField
                        label="내용을 입력해 주세요"
                        multiline
                        rows={20}
                        fullWidth
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        sx={{
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
                </Grid>
                <Grid item xs={6} container justifyContent="center" alignItems="center" sx={{ marginTop: 5 }}>
                    <Button
                        type="submit"
                        sx={{
                            fontSize: 20,
                            width: '50%',
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
                        onClick={handleSubmit}
                    >
                        {id ? <span> {loading ? <div className='loader'> </div> : <div>수정하기</div>} </span> : <span> {loading ? <div className='loader'> </div> : <div>일기 작성</div>}</span>}
                    </Button>
                </Grid>
                <Grid item xs={6} container justifyContent="center" alignItems="center" sx={{ marginTop: 5 }}>
                    <Button
                        sx={{
                            fontSize: 20,
                            width: '50%',
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
                        홈
                    </Button>
                </Grid>
            </Grid>
        </React.Fragment >
    )
};





const WriteDiaryMenu = () => {
    return (
        <div className='main-form'>
            <Navbar />
            <WriteDiaryForm />
        </div>
    );
};

export default WriteDiaryMenu;