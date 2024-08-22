import { Canvas, PencilBrush, Image as FabricImage } from 'fabric';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../css/main.css'
import '../css/canvas.css'


const CanvasComponent = ({ editCanvasData, canvasData, onCanvasData }) => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [activeTool, setActiveTool] = useState('select');
    const [penColor, setPenColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(10);
    const [isDrawing, setIsDrawing] = useState(false);

    const canvasContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const undoStackRef = useRef([]);
    const redoStackRef = useRef([]);


    const saveState = useCallback((canvas) => {
        if (!canvas) return;
        const json = canvas.toJSON();
        const jsonString = JSON.stringify(json);

        if (undoStackRef.current.length === 0 || jsonString !== undoStackRef.current[undoStackRef.current.length - 1]) {
            undoStackRef.current.push(jsonString);
            canvas.renderAll();
        }

        if (onCanvasData) {
            onCanvasData(jsonString);
        }
        if (!canvasData) {
            canvas.clear();
        }
    }, [onCanvasData]);





    useEffect(() => {
        const newCanvas = new Canvas(canvasRef.current, {
            width: 450,
            height: 500
        });
        setCanvas(newCanvas);


        if (editCanvasData) {
            try {

                newCanvas.loadFromJSON(editCanvasData, () => {
                    newCanvas.renderAll();
                    console.log('Canvas data loaded successfully');
                });
            } catch (error) {
                console.error('Error parsing canvas data:', error);
            }
        }

        return () => {
            newCanvas.dispose();
        };
    }, [editCanvasData]);


    useEffect(() => {
        if (!canvas) return;

        // 휠을 이용한 줌 인/아웃
        const handleMouseWheel = (opt) => {
            const delta = opt.e.deltaY;
            let zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        };

        canvas.on("mouse:wheel", handleMouseWheel);

        // 기본 펜 브러시 설정
        canvas.freeDrawingBrush = new PencilBrush(canvas);
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = penColor;

        const handleMouseDown = () => setIsDrawing(true);
        const handleMouseUp = () => {
            setIsDrawing(false);
            saveState(canvas);
        };
        const handleObjectAdded = () => saveState(canvas);
        const handleObjectModified = () => saveState(canvas);

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:up', handleMouseUp);
        canvas.on('object:added', handleObjectAdded);
        canvas.on('object:modified', handleObjectModified);

        // 초기 상태 저장
        saveState(canvas);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:up', handleMouseUp);
            canvas.off('object:added', handleObjectAdded);
            canvas.off('object:modified', handleObjectModified);
            canvas.off('mouse:wheel', handleMouseWheel);
        };
    }, [canvas, saveState, brushSize, penColor]);



    useEffect(() => {
        if (!canvas) return;

        const brush = new PencilBrush(canvas);
        brush.color = penColor;
        brush.width = brushSize;
        canvas.freeDrawingBrush = brush;

        if (activeTool === 'eraser') {
            canvas.freeDrawingBrush.color = '#ffffff';
            canvas.freeDrawingBrush.globalCompositeOperation = 'destination-out';
        } else {
            canvas.freeDrawingBrush.globalCompositeOperation = 'source-over';
        }

        canvas.isDrawingMode = activeTool === 'pen' || activeTool === 'eraser';
    }, [canvas, activeTool, penColor, brushSize]);




    const handleBrushSizeChange = (e) => {
        setBrushSize(Number(e.target.value));
    };

    const handleColorChange = (e) => {
        setPenColor(e.target.value);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const imgObj = new Image();
            imgObj.src = event.target.result;
            imgObj.onload = () => {
                const image = new FabricImage(imgObj);
                image.scaleToWidth(200);
                canvas.add(image);
                canvas.renderAll();
            };
        };

        reader.readAsDataURL(file);
    };

    const undo = useCallback(() => {
        if (!canvas || undoStackRef.current.length <= 1) return;
        const currentState = undoStackRef.current.pop();
        redoStackRef.current.push(currentState);
        const prevState = undoStackRef.current[undoStackRef.current.length - 1];

        const parsedCanvasData = JSON.parse(prevState);
        canvas.loadFromJSON(parsedCanvasData, () => {
            canvas.renderAll();
            console.log('Canvas data loaded successfully');
        });

    }, [canvas]);

    const redo = useCallback(() => {

        if (!canvas || redoStackRef.current.length === 0) return;
        const nextState = redoStackRef.current.pop();
        undoStackRef.current.push(nextState);

        const parsedCanvasData = JSON.parse(nextState);

        canvas.loadFromJSON(parsedCanvasData, () => {
            canvas.renderAll();
        });
    }, [canvas]);


    const resetCanvas = () => {
        if (!canvas) return;
        canvas.clear();
        saveState(canvas);
    };

    return (
        <div className="canvas-container" ref={canvasContainerRef}>
            <canvas ref={canvasRef} />
            <div className="tool-bar">
                <button
                    onClick={() => setActiveTool("select")}
                    disabled={activeTool === "select"}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="black">
                        <path
                            d="M10.833 0.891602V7.49993H16.6663C16.6663 4.09993 14.1247 1.29993 10.833 0.891602ZM3.33301 12.4999C3.33301 16.1833 6.31634 19.1666 9.99967 19.1666C13.683 19.1666 16.6663 16.1833 16.6663 12.4999V9.1666H3.33301V12.4999ZM9.16634 0.891602C5.87467 1.29993 3.33301 4.09993 3.33301 7.49993H9.16634V0.891602Z"
                            fill="inherit"
                        />
                    </svg>
                </button>
                <button
                    onClick={() => setActiveTool("pen")}
                    disabled={activeTool === "pen"}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="black">
                        <path
                            d="M2.5 14.3751V17.5001H5.625L14.8417 8.28342L11.7167 5.15842L2.5 14.3751ZM17.2583 5.86675C17.3356 5.78966 17.3969 5.69808 17.4387 5.59727C17.4805 5.49646 17.502 5.38839 17.502 5.27925C17.502 5.17011 17.4805 5.06204 17.4387 4.96123C17.3969 4.86042 17.3356 4.76885 17.2583 4.69175L15.3083 2.74175C15.2312 2.6645 15.1397 2.60321 15.0389 2.56139C14.938 2.51957 14.83 2.49805 14.7208 2.49805C14.6117 2.49805 14.5036 2.51957 14.4028 2.56139C14.302 2.60321 14.2104 2.6645 14.1333 2.74175L12.6083 4.26675L15.7333 7.39175L17.2583 5.86675Z"
                            fill="inherit"
                        />
                    </svg>
                </button>

                <button
                    onClick={() => setActiveTool("eraser")}
                    disabled={activeTool === "eraser"}
                >
                    <svg className='eraser' version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill='black'>
                        <path d="M0 0 C2.64125074 0.59802431 3.72667677 1.29754555 5.640625 3.19067383 C6.49624023 4.03662109 6.49624023 4.03662109 7.36914062 4.8996582 C7.94728516 5.49713867 8.52542969 6.09461914 9.12109375 6.71020508 C9.71857422 7.28834961 10.31605469 7.86649414 10.93164062 8.4621582 C11.77758789 9.31777344 11.77758789 9.31777344 12.640625 10.19067383 C13.15343018 10.70911865 13.66623535 11.22756348 14.19458008 11.76171875 C15.77504088 14.26004524 15.81472535 15.61278868 15.30859375 18.52270508 C13.38085938 21.01806641 13.38085938 21.01806641 10.71484375 23.60473633 C10.24872681 24.06377853 9.78260986 24.52282074 9.30236816 24.99577332 C7.81579281 26.45443417 6.31277067 27.89472373 4.80859375 29.33520508 C3.79573864 30.32297349 2.78400567 31.31189394 1.7734375 32.30200195 C-0.70020585 34.72487266 -3.19531871 37.12213109 -5.69140625 39.52270508 C-0.41140625 39.85270508 4.86859375 40.18270508 10.30859375 40.52270508 C10.30859375 41.18270508 10.30859375 41.84270508 10.30859375 42.52270508 C6.0588288 42.74726587 1.81230562 42.90941293 -2.44165039 43.01708984 C-3.8843201 43.06201727 -5.32658774 43.12319093 -6.76782227 43.20166016 C-18.54842283 43.82641991 -18.54842283 43.82641991 -23.70361328 40.69018555 C-27.09974575 37.51766674 -29.34430816 35.26627783 -30.26806641 30.62597656 C-29.46099431 26.28275328 -27.01713162 24.00547052 -23.9609375 21.03051758 C-23.37350266 20.43971405 -22.78606781 19.84891052 -22.18083191 19.24020386 C-20.93796177 17.99763215 -19.68761798 16.76249698 -18.43041992 15.53442383 C-16.50851004 13.65221377 -14.61769529 11.74239079 -12.72851562 9.82739258 C-11.51607079 8.62250619 -10.30193265 7.41932083 -9.0859375 6.21801758 C-8.23875908 5.36036301 -8.23875908 5.36036301 -7.37446594 4.48538208 C-4.9898491 2.18458927 -3.29966441 0.64083649 0 0 Z M-18.29296875 20.92895508 C-19.30588167 21.9551958 -20.31348752 22.98669512 -21.31640625 24.02270508 C-21.83203125 24.54735352 -22.34765625 25.07200195 -22.87890625 25.61254883 C-24.15425557 26.91151573 -25.42341886 28.21655084 -26.69140625 29.52270508 C-24.60303841 34.12730148 -21.71797332 37.47202697 -17.69140625 40.52270508 C-14.28104263 41.85676591 -14.28104263 41.85676591 -10.69140625 40.52270508 C-7.39076057 37.77656787 -4.51601046 34.75082418 -1.69140625 31.52270508 C-3.23928127 27.68819651 -5.62863371 25.49714809 -8.69140625 22.77270508 C-9.57828125 21.97348633 -10.46515625 21.17426758 -11.37890625 20.35083008 C-14.78381495 17.65911171 -15.06927273 17.94727828 -18.29296875 20.92895508 Z " fill="inherit" transform="translate(32.69140625,3.477294921875)" />
                    </svg>
                </button>

                <input
                    className='penColor'
                    type="color"
                    value={penColor}
                    onChange={handleColorChange}
                    title="펜 색상 선택"
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    accept="image/*"
                />
                <button className='pic' onClick={() => fileInputRef.current.click()}>
                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="20" height="20" viewBox="0 0 50 50"
                        preserveAspectRatio="xMidYMid meet">

                        <g transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)"
                            fill="#000000" stroke="none">
                            <path d="M27 453 c-4 -3 -7 -24 -7 -45 l0 -38 231 0 230 0 -3 23 c-3 22 -6 22
-149 25 -131 2 -148 5 -164 22 -14 15 -31 20 -75 20 -31 0 -60 -3 -63 -7z"/>
                            <path d="M24 337 c-2 -7 -3 -76 -2 -152 l3 -140 225 0 225 0 0 150 0 150 -223
3 c-177 2 -224 0 -228 -11z m279 -51 c3 -8 16 -16 29 -18 22 -3 23 -7 23 -73
l0 -70 -105 0 -105 0 0 70 c0 66 1 70 23 73 13 2 26 10 29 18 7 19 99 19 106
0z"/>
                            <path d="M216 234 c-31 -30 -9 -84 34 -84 24 0 50 26 50 50 0 24 -26 50 -50
50 -10 0 -26 -7 -34 -16z"/>
                        </g>
                    </svg>

                </button>


                <button className='undo' onClick={undo}  >
                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="20" height="20" viewBox="0 0 50.000000 50.000000"
                        preserveAspectRatio="xMidYMid meet">

                        <g transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)"
                            fill="black" stroke="none">
                            <path d="M155 456 c-60 -28 -87 -56 -114 -116 -36 -79 -19 -183 42 -249 33
-36 115 -71 167 -71 52 0 134 35 167 71 34 37 63 110 63 159 0 52 -35 134 -71
167 -37 34 -110 63 -159 63 -27 0 -65 -10 -95 -24z m65 -123 c0 -4 -14 -22
-32 -40 l-32 -33 112 0 c68 0 112 -4 112 -10 0 -6 -44 -10 -112 -10 l-112 0
34 -35 c18 -19 30 -38 26 -42 -3 -4 -28 14 -54 40 l-46 47 44 45 c42 42 60 54
60 38z" fill='inherit' />
                        </g>
                    </svg>
                </button>
                <button className='redo' onClick={redo} >
                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="20" height="20" viewBox="0 0 50.000000 50.000000"
                        preserveAspectRatio="xMidYMid meet">

                        <g transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)"
                            fill="black" stroke="none">
                            <path d="M155 456 c-60 -28 -87 -56 -114 -116 -36 -79 -19 -183 42 -249 33
-36 115 -71 167 -71 52 0 134 35 167 71 34 37 63 110 63 159 0 52 -35 134 -71
167 -37 34 -110 63 -159 63 -27 0 -65 -10 -95 -24z m185 -174 l29 -29 -34 -33
-35 -34 0 27 0 27 -90 0 c-53 0 -90 4 -90 10 0 6 37 10 90 10 89 0 90 0 90 25
0 32 4 31 40 -3z" fill='inherit' />
                        </g>
                    </svg>
                </button>
                <button onClick={resetCanvas} className='reset'>
                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="20" height="20" viewBox="0 0 50.000000 50.000000"
                        preserveAspectRatio="xMidYMid meet">

                        <g transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)"
                            fill="black" stroke="none">
                            <path d="M155 456 c-60 -28 -87 -56 -114 -116 -36 -79 -19 -183 42 -249 33
-36 115 -71 167 -71 56 0 137 37 172 78 50 60 75 167 39 167 -8 0 -19 -20 -26
-48 -43 -171 -245 -211 -342 -68 -58 86 -34 198 56 258 62 42 135 42 201 1
l35 -22 -25 -6 c-14 -3 -25 -12 -25 -20 0 -11 16 -16 63 -18 l63 -3 -3 63 c-2
48 -7 63 -18 63 -9 0 -17 -12 -20 -30 -4 -21 -8 -26 -14 -16 -15 24 -109 61
-156 61 -26 0 -66 -10 -95 -24z" fill='inherit' />
                        </g>
                    </svg>

                </button>
                <div>
                    <input
                        type="range"
                        min="1"
                        max="60"
                        value={brushSize}
                        onChange={handleBrushSizeChange}
                        title="브러시 크기"
                    />
                    <span>{brushSize}px</span>
                </div>

            </div>
        </div>
    );
};

export default CanvasComponent;
