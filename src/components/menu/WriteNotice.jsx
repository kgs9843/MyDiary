import React, { useState, useEffect } from 'react';
import Navbar from '../navbar/topbar'
import { TextField, Button, Grid } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useParams } from "react-router-dom";
import dayjs from 'dayjs';
import api from '../../utils/api'
import axios from 'axios';



const WriteDiaryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // URL 파라미터에서 id를 가져옵니다.
    const [date, setDate] = useState(dayjs());
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');



    useEffect(() => {
        const fetchNotice = async () => {
            if (!id) {
                // id가 없으면 아무것도 실행하지 않음
                setDate(dayjs());
                setTitle('');
                setContent('');
                return;
            }

            try {
                const response = await api.get(`/api/edit-notices/${id}`);
                if (response.status === 200) {
                    const diary = response.data;

                    // 서버에서 가져온 일기 데이터를 상태에 설정
                    setDate(dayjs(diary.date));
                    setTitle(diary.title || null);
                    setContent(diary.content || null);
                } else {
                    console.error('Diary not found');
                }
            } catch (error) {
                console.error('Error fetching diary:', error);
            }
        };
        fetchNotice();
    }, [id])


    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('No token found in localStorage');
            return;
        }

        const noticeEntry = {
            date,
            title,
            content,
        };

        try {

            if (id) {
                const response = await axios.put(`http://localhost:8080/edit-notice-form/${id}`, noticeEntry, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    console.log('Notice updated successfully');
                    navigate('/notices');
                } else {
                    throw new Error(`Failed to update notice with status code ${response.status}`);
                }
            }
            else {
                const response = await api.post('/api/write-notice-form', noticeEntry);
                if (response.status === 200) {
                    console.log('notices entry submitted successfully');
                    navigate('/notices');
                } else if (response.status === 401) {
                    alert(response.data.message)
                }
                else {
                    console.error('Failed to submit notices entry');
                }
            }
        } catch (error) {
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
                <Grid item xs={12}>
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
                        {id ? <span>수정하기</span> : <span>공지 작성</span>}
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