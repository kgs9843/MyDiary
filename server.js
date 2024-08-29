const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path'); // path 모듈 추가
const fs = require('fs');
const multer = require('multer');

dotenv.config();


//db
const User = require('./models/User');
const VerificationCode = require('./models/VerificationCode');
const Diary = require('./models/Diarys');
const Notice = require('./models/Notification');
const { isNumberObject } = require('util/types');

const app = express();
app.use(cookieParser());


//임시 폴더를 만든다.
const tempCanvasDir = path.join(__dirname, 'tempCanvas');

// Create tempCanvas directory if not exists
if (!fs.existsSync(tempCanvasDir)) {
    fs.mkdirSync(tempCanvasDir);
}

// // Middleware
// app.use(cors({
//     origin: 'http://localhost:3000', // 클라이언트의 URL
//     credentials: true, // 자격 증명 허용
// }));

app.use(express.json());
app.use(express.static(path.join(__dirname, '/build')));


const uploadsDir = path.join(__dirname, 'uploads');

// Ensure 'uploads' directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// 'uploads' 폴더를 정적 파일로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




// 메인 페이지 라우팅
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});






mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log(`몽고db연결 성공`)).catch(() => console.log(`몽고 db연결 실패`))





app.post('/api/register/users', async (req, res) => {
    const { email, nickname, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ email, nickname, password: hashedPassword });
    try {
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// 닉네임 중복 검사 엔드포인트
app.post('/check-nickname', async (req, res) => {
    const { nickname } = req.body;
    const user = await User.findOne({ nickname });
    if (user) {
        return res.json({ isAvailable: false }); On
    }
    return res.json({ isAvailable: true });
});

//이메일 검사
app.post('/check-email', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        return res.json({ success: false });
    }
    return res.json({ success: true })
})




// 닉네임 중복 검사 엔드포인트
app.post('/send-code', async (req, res) => {
    const { code, email } = req.body;
    const user = await VerificationCode.findOne({ code, email });
    if (user) {
        return res.json({ success: true });
    }
    return res.json({ success: false });
});



app.post('/changePassword', async (req, res) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        )
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }

})



// 환경 변수에서 JWT_SECRET 가져오기
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = await User.findOne(
            { email }
        )
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        //유효기간 1시간
        const token = jwt.sign({ id: user._id.toString(), index: user.index, admin: user.admin }, JWT_SECRET, { expiresIn: '1h' });
        //보안 강화를 위해 refreshToken도 사용
        const refreshToken = jwt.sign({ id: user._id.toString(), index: user.index, admin: user.admin }, JWT_REFRESH_SECRET, { expiresIn: '7d' });


        if (!token || !refreshToken) {
            return res.status(400).json({ message: 'Invalid token' });
        }
        //httpOnly를 통해 js의 접근을 막는다(secure: true는 https만 가능)
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });

        res.status(200).json({ message: 'Login successful', token: token });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
})

// 메인 페이지 엔드포인트
app.get('/main', (req, res) => {
    res.status(200).json({ message: 'Welcome to the main page!' });
});

//난수 6자리
function generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000);
}
app.post('/send-email', async (req, res) => {
    const { email } = req.body;
    const code = generateSixDigitCode().toString()

    const verificationCode = new VerificationCode({ email, code });
    await verificationCode.save();

    // 이메일 전송 로직 (nodemailer 예시)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '인증 코드 발송',
        text: `인증 코드 : ${code}` //랜덤 6자리
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('이메일 발송 실패:', error);
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
    });
});





//일기 작성
app.post('/api/write-diary-form', async (req, res) => {

    const { date, weather, title, content } = req.body;


    // JWT 토큰을 통해 인증된 사용자 ID를 추출
    const token = req.headers.authorization.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!decodedToken || !decodedToken.id) {
        return res.status(401).json({ message: '오류발생 재로그인 해주세요' });
    }

    try {
        // 일기 데이터 저장
        const diary = new Diary({
            date,
            weather,
            title,
            content,
            userId: decodedToken.id,// 토큰에서 추출한 사용자 ID를 사용
            canvas: null
        });


        const savedDiary = await diary.save();

        // 일기 저장 후에 폴더를 생성합니다.
        const userId = decodedToken.id;
        const diaryId = savedDiary._id.toString();
        const userTempDir = path.join(tempCanvasDir, userId, diaryId);

        // 사용자 임시 디렉토리 생성
        if (!fs.existsSync(userTempDir)) {
            fs.mkdirSync(userTempDir, { recursive: true });
        }

        const oldCanvasPath = path.join(tempCanvasDir, userId, 'finalCanvas');
        const newCanvasPath = path.join(tempCanvasDir, userId, diaryId, 'finalCanvas');

        // 파일 이동
        if (fs.existsSync(oldCanvasPath)) {
            fs.renameSync(oldCanvasPath, newCanvasPath);
        }

        // 일기 문서에 새로운 canvas 경로 업데이트
        savedDiary.canvas = newCanvasPath;
        await savedDiary.save();

        res.status(200).json({ message: 'Diary saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }

});


// 토큰 갱신 엔드포인트
app.post('/token', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const newToken = jwt.sign({ id: decoded.id, index: decoded.index, admin: decoded.admin }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token: newToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token', error });
    }
});

//로그아웃
app.post('/logout', (req, res) => {
    try {
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out' });
    } catch (err) {
        res.status(401).json({ error: err })
    }
});

//유저 일기들 받아오기
app.get('/api/diaries', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET); // 'secretkey'는 JWT 비밀키입니다
        const userId = decodedToken.id
        // 유저의 일기들 찾기
        const diaries = await Diary.find({ userId: userId });
        if (diaries) {
            res.status(200).json(diaries);
        } else {
            //찾는게 없으면 빈거 보냄
            res.status(200).json([]);
        }

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});


//검색 일기들 받아오기
app.get('/api/diaries/search', async (req, res) => {
    const { inputValue } = req.query;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET); // 'secretkey'는 JWT 비밀키입니다
        const userId = decodedToken.id
        // 유저의 일기들 찾기
        const diaries = await Diary.find({ userId: userId, title: { $regex: inputValue, $options: 'i' } });
        if (diaries) {
            // 조회된 일기가 없을 경우 메시지 반환
            if (diaries.length === 0) {
                return res.status(200).json({ message: '게시물이 없습니다' });
            }
            // 찾은 일기들을 반환합니다
            res.status(200).json(diaries);

        } else {
            //찾는게 없으면 빈거 보냄
            res.status(200).json([]);
        }

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});

//일기 삭제 부분
app.delete('/api/diaries/:id', async (req, res) => {
    // URL 경로에서 `id` 매개변수를 추출
    const diaryId = req.params.id;

    // 토큰 검증 및 일기 삭제 로직
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send('Access Denied');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        // 유저의 일기 중 해당 ID를 가진 일기 삭제
        const diary = await Diary.findOneAndDelete({ _id: diaryId, userId: userId });
        if (diary) {
            res.status(200).send('Diary deleted successfully');
        } else {
            res.status(404).send('Diary not found');
        }
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});


//수정된 일기 받아오는 부분
app.get('/api/edit-diaries/:id', async (req, res) => {
    // URL 경로에서 `id` 매개변수를 추출
    const diaryId = req.params.id;

    // 토큰 검증
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send('Access Denied');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        // 유저의 일기 중 해당 ID를 가진 일기 찾기
        const diary = await Diary.findOne({ _id: diaryId, userId: userId });
        if (!diary) {
            return res.status(404).send('Diary not found');
        }


        // canvas 파일 경로 가져오기
        const canvasPath = diary.canvas;
        // canvas 파일의 존재 확인
        if (!fs.existsSync(canvasPath)) {
            return res.status(404).send('Canvas file not found');
        }


        // 파일 데이터 읽기
        const fileData = fs.readFileSync(canvasPath, 'utf8'); // 'utf8'로 인코딩을 설정


        // 헤더 설정 및 응답 전송
        res.setHeader('Content-Type', 'application/json'); // JSON 데이터 응답
        // 일기 데이터와 함께 canvas 데이터를 JSON으로 응답
        res.status(200).json({
            ...diary.toObject(),  // `diary` 객체를 JSON으로 변환
            canvas: fileData
        });

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});




// 수정된 일기 업데이트
app.put('/edit-diaries-form/:id', async (req, res) => {
    const diaryId = req.params.id;
    const { title, content, date, weather } = req.body;

    // 인증 토큰에서 사용자 ID를 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.id;

        // 일기 데이터 찾기
        const diary = await Diary.findOne({ _id: diaryId, userId: userId });
        if (!diary) return res.status(404).json({ message: 'Diary not found' });

        // 일기 데이터 업데이트
        diary.title = title || diary.title;
        diary.content = content || diary.content;
        diary.date = date || diary.date;
        diary.weather = weather || diary.weather;


        const oldCanvasPath = path.join(tempCanvasDir, userId, 'finalCanvas');
        const newCanvasPath = path.join(tempCanvasDir, userId, diaryId, 'finalCanvas');

        // 파일 이동
        if (fs.existsSync(oldCanvasPath)) {
            fs.renameSync(oldCanvasPath, newCanvasPath);
        }

        await diary.save();

        res.status(200).json(diary);
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token or Error Updating Diary' });
    }
});


// 캔버스 데이터 청크 부분
app.post('/api/upload-canvas-chunk', async (req, res) => {
    const { chunk, index, totalChunks } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!decodedToken || !decodedToken.id) {
        return res.status(401).json({ message: '오류발생 재로그인 해주세요' });
    }

    const userId = decodedToken.id;
    const userTempDir = path.join(tempCanvasDir, userId);

    // Create user's temp directory if not exists
    if (!fs.existsSync(userTempDir)) {
        fs.mkdirSync(userTempDir);
    }

    const chunkPath = path.join(userTempDir, `chunk_${index}`);


    // 청크 데이터를 파일로 저장
    fs.writeFile(chunkPath, chunk, 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to save chunk', error: err });
        }

        // 모든 청크가 전송된 경우
        if (index === totalChunks - 1) {
            const finalCanvasPath = path.join(userTempDir, 'finalCanvas');
            const writeStream = fs.createWriteStream(finalCanvasPath);

            for (let i = 0; i < totalChunks; i++) {
                const chunkData = fs.readFileSync(path.join(userTempDir, `chunk_${i}`));
                writeStream.write(chunkData);
                fs.unlinkSync(path.join(userTempDir, `chunk_${i}`)); // 청크 파일 삭제
            }

            writeStream.end();
            writeStream.on('finish', () => {
                res.status(200).json({ message: 'All chunks uploaded successfully' });
            });
        } else {
            res.status(200).json({ message: 'Chunk uploaded successfully' });
        }
    });
});




//공지들 받아오기
app.get('/api/notices', async (req, res) => {

    try {
        // 유저의 일기들 찾기
        const notices = await Notice.find();
        if (notices) {
            res.status(200).json(notices);
        } else {
            //찾는게 없으면 빈거 보냄
            res.status(200).json([]);
        }

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});



//공지 작성
app.post('/api/write-notice-form', async (req, res) => {

    const { date, title, content } = req.body;


    // JWT 토큰을 통해 인증된 사용자 ID를 추출
    const token = req.headers.authorization.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!decodedToken || !decodedToken.id) {
        return res.status(401).json({ message: '오류발생 재로그인 해주세요' });
    }

    try {
        // 일기 데이터 저장
        const notice = new Notice({
            date,
            title,
            content,
            userId: decodedToken.id,// 토큰에서 추출한 사용자 ID를 사용
        });

        await notice.save();

        res.status(200).json({ message: 'Diary saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }

});

// 수정된 공지 업데이트
app.put('/edit-notice-form/:id', async (req, res) => {
    const diaryId = req.params.id;
    const { title, content, date } = req.body;

    // 인증 토큰에서 사용자 ID를 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.id;

        // 일기 데이터 찾기
        const notice = await Notice.findOne({ _id: diaryId });
        if (!notice) return res.status(404).json({ message: 'notice not found' });


        // 일기 데이터 업데이트
        notice.title = title || notice.title;
        notice.content = content || notice.content;
        notice.date = date || notice.date;


        await notice.save();
        res.status(200).json(notice);
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token or Error Updating Diary' });
    }
});

//공지 삭제 부분
app.delete('/api/notices/:id', async (req, res) => {
    // URL 경로에서 `id` 매개변수를 추출
    const noticeId = req.params.id;

    // 토큰 검증 및 일기 삭제 로직
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send('Access Denied');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        // 유저의 일기 중 해당 ID를 가진 일기 삭제
        const notcie = await Notice.findOneAndDelete({ _id: noticeId });
        if (notcie) {
            res.status(200).send('Diary deleted successfully');
        } else {
            res.status(404).send('Diary not found');
        }
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});

//수정된 공지 받아오는 부분
app.get('/api/edit-notices/:id', async (req, res) => {
    // URL 경로에서 `id` 매개변수를 추출
    const diaryId = req.params.id;

    // 토큰 검증
    try {
        // 유저의 일기 중 해당 ID를 가진 일기 찾기
        const notcie = await Notice.findOne({ _id: diaryId });
        if (!notcie) {
            return res.status(404).send('Diary not found');
        }


        // 일기 데이터와 함께 canvas 데이터를 JSON으로 응답
        res.status(200).json({
            ...notcie.toObject(),  // `diary` 객체를 JSON으로 변환
        });

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});

// 수정된 공지 업데이트
app.put('/edit-notice-form/:id', async (req, res) => {

    const noticeId = req.params.id;
    const { title, content, date } = req.body;

    // 인증 토큰에서 사용자 ID를 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }


    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.id;

        // 일기 데이터 찾기
        const notice = await Notice.findOne({ _id: noticeId });
        if (!notice) {
            return res.status(404).json({ message: 'notice not found' });
        }

        // 일기 데이터 업데이트
        notice.title = title || notice.title;
        notice.content = content || notice.content;
        notice.date = date || notice.date;

        await notice.save();

        res.status(200).json({ message: 'Notice updated successfully' });
    } catch (err) {
        console.error("Error: ", err); // 에러가 발생했을 때
        res.status(400).json({ message: 'Invalid Token or Error Updating notice' });
    }
});



//검색 공지들 받아오기
app.get('/api/notices/search', async (req, res) => {
    const { inputValue } = req.query;
    try {
        // 유저의 일기들 찾기
        const notices = await Notice.find({ title: { $regex: inputValue, $options: 'i' } });
        if (notices) {
            // 조회된 일기가 없을 경우 메시지 반환
            if (notices.length === 0) {
                return res.status(200).json({ message: '공지가 없습니다' });
            }
            // 찾은 일기들을 반환합니다
            res.status(200).json(notices);

        } else {
            //찾는게 없으면 빈거 보냄
            res.status(200).json([]);
        }

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});



app.get('/api/user-status', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET); // 'secretkey'는 JWT 비밀키입니다
        const userId = decodedToken.id
        // 유저의 상태
        const admin = await User.findOne({ _id: userId });
        if (admin) {
            const key = admin.admin
            const profileImageUrl = admin.profileImageUrl;

            res.status(200).json({ admin: key, profileImageUrl: profileImageUrl });
        } else {
            //찾는게 없으면 빈거 보냄
            res.status(400)
        }

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
})



//유저들 받아오기
app.get('/api/users', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET); // 'secretkey'는 JWT 비밀키입니다

        const admin = decodedToken.admin

        if (admin == 1) {
            // 유저들 불러오기
            const users = await User.find();
            if (users) {
                res.status(200).json(users);
            } else {
                //찾는게 없으면 빈거 보냄
                res.status(200).json([]);
            }
        }


    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});



//검색 일기들 받아오기
app.get('/api/users/search', async (req, res) => {
    const { inputValue } = req.query;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET); // 'secretkey'는 JWT 비밀키입니다
        const admin = decodedToken.admin
        if (admin === 1) {
            // 유저의 일기들 찾기
            const users = await User.find({ nickname: { $regex: inputValue, $options: 'i' } });
            if (users) {
                // 조회된 일기가 없을 경우 메시지 반환
                if (users.length === 0) {
                    return res.status(200).json({ message: '유저가 없습니다' });
                }
                // 찾은 일기들을 반환합니다
                res.status(200).json(users);

            } else {
                //찾는게 없으면 빈거 보냄
                res.status(200).json([]);
            }
        }

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});


//유저 삭제 부분
app.delete('/api/users/:id', async (req, res) => {
    // URL 경로에서 `id` 매개변수를 추출
    const userId = req.params.id;

    // 토큰 검증 및 일기 삭제 로직
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send('Access Denied');
        }

        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 유저의 일기 삭제
        await Diary.deleteMany({ userId: userId });

        //회원 삭제 
        const user = await User.findOneAndDelete({ _id: userId });
        if (user) {
            res.status(200).send('user deleted successfully');
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});


// 수정된 유저 업데이트
app.put('/api/edit-user', async (req, res) => {
    const { _id, nickname, password } = req.body;


    // 인증 토큰에서 사용자 ID를 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });


    try {
        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 일기 데이터 찾기
        const user = await User.findOne({ _id: _id });
        if (!user) return res.status(404).json({ message: 'notice not found' });



        const hashedPassword = await bcrypt.hash(password, 10)

        // 일기 데이터 업데이트
        user.nickname = nickname || user.nickname;
        user.password = hashedPassword || user.password;


        await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token or Error Updating Diary' });
    }
});


//유저 찾기
app.get('/api/findUser', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET); // 'secretkey'는 JWT 비밀키입니다
        const userId = decodedToken.id
        // 유저의 상태
        const user = await User.findOne({ _id: userId });
        const diaries = await Diary.find({ userId: userId });

        if (user && diaries) {
            const nickname = user.nickname;
            const email = user.email;
            const diariesNum = diaries.length;
            const index = user.index;
            const admin = user.admin;
            const profileImageUrl = user.profileImageUrl;
            res.status(200).json({
                nickname: nickname, email: email,
                diariesNum: diariesNum,
                index: index,
                admin: admin,
                profileImageUrl: profileImageUrl
            });
        } else {
            //찾는게 없으면 빈거 보냄
            res.status(400)
        }

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
})


// 프로필 메뉴 수정된 유저 업데이트
app.put('/api/profile-edit-user', async (req, res) => {
    const { nickname } = req.body;


    // 인증 토큰에서 사용자 ID를 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });


    try {
        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 일기 데이터 찾기
        const user = await User.findOne({ _id: decodedToken.id });
        if (!user) return res.status(404).json({ message: 'notice not found' });



        // 일기 데이터 업데이트
        user.nickname = nickname || user.nickname;


        await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token or Error Updating Diary' });
    }
});


//유저 닉네임 찾기
app.get('/api/users-Nickname', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET); // 'secretkey'는 JWT 비밀키입니다
        const userId = decodedToken.id
        // 유저의 상태
        const user = await User.findOne({ _id: userId });

        if (user) {
            const nickname = user.nickname;
            res.status(200).json({
                nickname: nickname
            });
        } else {
            //찾는게 없으면 빈거 보냄
            res.status(400)
        }

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
})


// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 파일 저장 경로
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // 파일명 설정
    }
});

const upload = multer({ storage: storage });


// 프로필 이미지 업로드 엔드포인트
app.post('/api/upload-profile-image', upload.single('profileImage'), async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }


    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const userId = decodedToken.id; // 예시로 사용자 ID를 하드코딩
    const filePath = `/uploads/${req.file.filename}`;
    // 유저 데이터 찾기

    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: 'notice not found' });


    // 유저 데이터 업데이트
    user.profileImageUrl = filePath || user.profileImageUrl;


    await user.save();


    res.status(200).json({
        message: 'Profile image uploaded successfully',
        profileImageUrl: filePath
    });
});




// 클라이언트 라우팅 처리
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(8080, '0.0.0.0', function () {
    console.log('listening on 8080');
}); //8080port에 서버를 연다, 열고 함수기능 수행
