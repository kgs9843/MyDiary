import { Canvas } from 'fabric';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../../css/DiaryDetail.css'
import { CssBaseline, Typography, Box } from '@mui/material';
import '../../css/loading.css'

const DetailCanvas = ({ canvasData }) => {
    const [canvas, setCanvas] = useState(null);
    const [check, setCheck] = useState(false)
    const [imageData, setImageData] = useState('');
    const canvasRef = useRef(null);

    // useCallback을 사용해 saveState 함수를 메모이제이션
    const saveState = useCallback((canvas) => {
        if (!canvas) return;
        canvas.renderAll();
        if (!check) {
            const dataURL = canvas.toDataURL({
                format: 'png',
                multiplier: 1,
                width: 450,
                height: 500
            });
            setImageData(dataURL)
            console.log(dataURL)
            setCheck(true)
        }
    }, [check]);


    useEffect(() => {
        if (!canvasRef.current) return;

        // 지연 시간 설정 (예: 500ms)
        const delay = 500;

        const timer = setTimeout(() => {
            const newCanvas = new Canvas(canvasRef.current, {
                width: 450,
                height: 500
            });
            setCanvas(newCanvas);

            if (canvasData) {
                try {
                    newCanvas.loadFromJSON(canvasData, () => {
                        newCanvas.renderAll();
                    });
                } catch (error) {
                    alert("오류 발생 다시 시도 바람");
                    console.error('Error parsing canvas data:', error);
                }
            }

            return () => {
                newCanvas.dispose();
            };
        }, delay);

        // 컴포넌트가 언마운트될 때 타이머 정리
        return () => clearTimeout(timer);
    }, [canvasData]);

    useEffect(() => {
        if (canvas) {
            const timer = setTimeout(() => {
                saveState(canvas);
            }, 100); // 100ms 지연 후 캡처

            return () => clearTimeout(timer);
        }
    }, [canvas, canvasData, saveState]);

    if (!check) {
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
                    <div className={`canvas-container hidden`}>
                        <canvas ref={canvasRef} className="hidden-canvas" />
                    </div>
                </CssBaseline>
            </React.Fragment>
        )

    }

    return (
        <>

            <div className='canvas'>
                <img className='canvasImage' src={imageData} alt="Canvas representation" />
            </div>
        </>
    )
}

export default DetailCanvas;