import React, { useState, useEffect } from 'react';
import '../css/login.css';
import logo from '../images/logo.png';
import correct from '../images/check.png'
import wrongImg from '../images/wrong.png'
import search from '../images/search.png'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { isTokenValid } from '../utils/auth';
import api from '../utils/api'


const serverUrl = process.env.REACT_APP_SERVER_URL;

const Timer = ({ count, setCount, setIsTimer }) => {
    const formatTime = time => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
    };

    useEffect(() => {
        const id = setInterval(() => {
            setCount(count => count - 1);
        }, 1000);

        if (count === 0) {
            clearInterval(id);
            setIsTimer(false)
            setCount(5000)
        }
        return () => clearInterval(id);
    }, [count]);

    return (
        <div className="timerContainer">
            <span className="timerText">{formatTime(count)}</span>
        </div>
    );
};






const SubmitForm = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('')
    const [nickname, setNickname] = useState('');
    const [isTimer, setIsTimer] = useState(false)
    const [count, setCount] = useState(300);
    const [code, setCode] = useState('');
    const [verificationCode, setVerificationCode] = useState(false);
    const [shake, setShake] = useState(false);
    const [wrong, setWrong] = useState(true);
    const [firstCheck, setFirstCheck] = useState(false)
    const [loading, setLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false)

    const [errors, setErrors] = useState({
        email: '',
        nickname: '',
        password: '',
        passwordCheck: '',
    });
    const [formIsValid, setFormIsValid] = useState(true);

    const validateField = async (field, value) => {
        let error = '';

        if (field === 'email') {
            if (!value) {
                error = '칸이 비어있습니다';
            } else if (!value.includes('@')) {
                error = '이메일을 입력하세요';
            }
        } else if (field === 'password') {
            if (!value) {
                error = '칸이 비어있습니다';
            }
            //비밀번호 확인 다른경우



        } else if (field === 'nickname') {
            if (!value) {
                error = '칸이 비어있습니다';
            }
            else {
                try {
                    const response = await axios.post(`${serverUrl}/check-nickname`, { nickname: nickname });
                    if (!response.data.isAvailable) {
                        error = '닉네임이 이미 사용 중입니다'
                    }

                } catch (err) {
                    console.error(err);
                }

            }
        } else if (field === 'passwordCheck') {
            if (!value) {
                error = '칸이 비어있습니다';
            }
            else {
                if (password !== passwordCheck) {
                    error = '비밀번호가 다릅니다'
                }
            }
        }

        setErrors(prevErrors => ({
            ...prevErrors,
            [field]: error
        }));

        return !error;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEmailValid = await validateField('email', email);
        const isNicknameValid = await validateField('nickname', nickname);
        const isPasswordValid = await validateField('password', password);
        const isPasswordCheckValid = await validateField('passwordCheck', passwordCheck);

        setFormIsValid(isEmailValid && isPasswordValid && isNicknameValid && isPasswordCheckValid);

        if (isEmailValid && isPasswordValid && isNicknameValid && isPasswordCheckValid && verificationCode) {

            // 회원가입 성공
            console.log('Form submitted');
            try {
                const response = await axios.post(`${serverUrl}/api/register/users`, { email: email.trim(), nickname: nickname.trim(), password: password.trim() });
                if (response.status === 201) {
                    props.setHome(true)
                }

            } catch (err) {
                console.err(err);
            }
        } else {
            // 로그인 실패 시 폼 흔들기
            setShake(true);
            setTimeout(() => setShake(false), 500);
            console.log('Form has errors');
        }
    };

    const onVaildMail = async (e) => {
        e.preventDefault();
        const isEmailValid = await validateField('email', email);

        if (isEmailValid) {
            let error = '';
            try {
                //alert(email);
                const response = await axios.post(`${serverUrl}/check-email`, { email: email });
                if (!response.data.success) {
                    error = '이메일이 이미 사용 중입니다'
                    //alert(error)
                }
            } catch (err) {
                console.log(err)
            }
            setErrors(prevErrors => ({
                ...prevErrors,
                'email': error
            }));
            //console.log(errors)


            if (!error) {
                try {
                    setLoading(true)
                    const response = await axios.post(`${serverUrl}/send-email`, { email: email });
                    if (response.data.success) {
                        setVerificationCode(false);
                        setIsTimer(true);
                        setCount(300);
                        alert('이메일 발송 성공');
                        setLoading(false)
                    } else {
                        alert('인증 메일 발송 실패');
                        setLoading(false)
                    }
                } catch (e) {
                    alert('인증 메일 발송 실패');
                    setLoading(false)
                }
            }
        }

    };

    const checkCode = async (e) => {
        try {
            const response = await axios.post(`${serverUrl}/send-code`, { code: code, email: email });
            if (response.data.success) {
                setVerificationCode(true);
                setFirstCheck(true)
                setWrong(true);
                setIsDisabled(true)
                alert('인증 성공');
            } else {
                setVerificationCode(false);
                setFirstCheck(true)
                setWrong(false);
                alert('인증 실패');
            }
        } catch (e) {
            alert('인증 실패');
        }
    }

    return (
        <>
            <div className={`form ${shake ? 'shake' : ''}`} id="loginform">
                <h1> 회원가입 </h1>
                <form onSubmit={handleSubmit} noValidate>
                    <p className="email">
                        <label htmlFor="email">이메일 <span>*</span></label>
                        <div className='email-form'>
                            <input
                                className={`input ${errors.email ? 'invalid' : ''}`}
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={async (e) => { setEmail(e.target.value); await validateField('email', e.target.value) }}
                            />
                            {loading ?
                                <div className='loader'> </div> :
                                <button onClick={onVaildMail} disabled={isDisabled}>
                                    인증
                                </button>
                            }
                            {errors.email && <span className="validation error">{errors.email}</span>}
                        </div>


                    </p>
                    {isTimer && <p className='emailCheck-form'>
                        <label htmlFor="emailCode">인증코드 <span>*</span></label>
                        <div className='check-form'>
                            <input
                                type='text'
                                className='emailCode'
                                id="emailCode"
                                name="emailCode"
                                placeholder='인증코드'
                                value={code}
                                onChange={async (e) => { setCode(e.target.value); }}
                            />
                            <div className="codeCheckBtn" >
                                {firstCheck ?
                                    (wrong ? <img src={correct} alt="" onClick={checkCode} /> : <img src={wrongImg} onClick={checkCode} alt="" />)
                                    : <img src={search} onClick={checkCode} alt="" />
                                }
                            </div>
                        </div>
                        {verificationCode ? <div className='timerContainer'></div> : <Timer count={count} setCount={setCount} setIsTimer={setIsTimer} />}
                    </p>}
                    <p className="password">
                        <label htmlFor="nickname">닉네임 <span>*</span></label>
                        <input
                            className={`input ${errors.nickname ? 'invalid' : ''} nickname`}
                            type="text"
                            id="nickname"
                            name="nickname"
                            value={nickname}
                            onChange={(e) => { setNickname(e.target.value); validateField('nickname', e.target.value) }}
                            onBlur={(e) => validateField('nickname', e.target.value)}
                        />
                        {errors.nickname && <span className="validation error">{errors.nickname}</span>}
                    </p>
                    <p className="password">
                        <label htmlFor="password">비밀번호 <span>*</span></label>
                        <input
                            className={`input ${errors.password ? 'invalid' : ''}`}
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={(e) => validateField('password', e.target.value)}
                        />
                        {errors.password && <span className="validation error">{errors.password}</span>}
                    </p>
                    <p className="password">
                        <label htmlFor="password">비밀번호 확인 <span>*</span></label>
                        <input
                            className={`input ${errors.passwordCheck ? 'invalid' : ''}`}
                            type="password"
                            id="passwordCheck"
                            name="passwordCheck"
                            value={passwordCheck}
                            onChange={(e) => setPasswordCheck(e.target.value)}
                        />
                        {errors.passwordCheck && <span className="validation error">{errors.passwordCheck}</span>}
                    </p>

                    <p className="submitBox">
                        <input className="loginBtn" type="submit" value="회원가입" />
                        <input className="loginBtn" type="button" onClick={() => { props.setHome(true) }} value="홈으로" />
                    </p>
                </form>
            </div>
        </>
    )
}






const LoginForm = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(false);//체크박스
    const [shake, setShake] = useState(false);
    const [formIsValid, setFormIsValid] = useState(true);
    const [rememberPassword, setRememberPassword] = useState(false);
    const navigate = useNavigate();


    // 페이지 로딩 시 쿠키에서 이메일 값 읽어오기
    useEffect(() => {
        const rememberedEmail = Cookies.get('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
        }
    }, []); // []를 넣어 한 번만 실행되도록 설정

    const validateField = (field, value) => {
        let error = '';

        if (field === 'email') {
            if (!value) {
                error = '칸이 비어있습니다';
            } else if (!value.includes('@')) {
                error = '이메일을 입력하세요';
            }
        } else if (field === 'password') {
            if (!value) {
                error = 'This field is required';
            }
        }

        setErrors(prevErrors => ({
            ...prevErrors,
            [field]: error
        }));

        return !error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEmailValid = validateField('email', email);
        const isPasswordValid = validateField('password', password);

        setFormIsValid(isEmailValid && isPasswordValid);

        if (isEmailValid && isPasswordValid) {

            try {
                const response = await api.post('/login', { email, password });
                if (response.status === 200) {
                    // 로그인 성공
                    const token = response.data.token;
                    localStorage.setItem('token', token);//로그인 유지를 위해


                    if (rememberMe) {
                        // 이메일 쿠키 관리
                        if (Cookies.get('rememberedEmail')) {
                            Cookies.remove('rememberedEmail');
                        }
                        Cookies.set('rememberedEmail', email, { expires: 15 }); // 15일 동안 유지되는 쿠키 설정
                    }

                    navigate('/main')
                    //onsole.log('Form submitted');
                }
            } catch (e) {
                alert(e);
                // 로그인 실패 시 폼 흔들기
                setShake(true);
                setTimeout(() => setShake(false), 500);
                console.log('Form has errors');
            }
        } else {
            // 로그인 실패 시 폼 흔들기
            setShake(true);
            setTimeout(() => setShake(false), 500);
            console.log('Form has errors');
        }
    };

    if (rememberPassword) {
        return (<>
            <FindPassword setRememberPassword={setRememberPassword} />
        </>)
    } else {
        return (

            <>
                <div className={`form ${shake ? 'shake' : ''}`} id="loginform">
                    <h5
                        onClick={() => { navigate('/') }}
                    > * 로그인 없이 체험해보기</h5>
                    <h1> 로그인 </h1>

                    <form onSubmit={handleSubmit} noValidate>
                        <p className="email">
                            <label htmlFor="email">이메일 <span>*</span></label>
                            <input
                                className={`input ${errors.email ? 'invalid' : ''}`}
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={(e) => validateField('email', e.target.value)}
                            />
                            {errors.email && <span className="validation error">{errors.email}</span>}
                        </p>
                        <p className="password">
                            <label htmlFor="password">비밀번호 <span>*</span></label>
                            <input
                                className={`input ${errors.password ? 'invalid' : ''}`}
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={(e) => validateField('password', e.target.value)}
                            />
                            {errors.password && <span className="validation req">{errors.password}</span>}
                        </p>
                        <p className="remember">
                            <input className="checkbox" type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                            <label htmlFor="remember"> 아이디 저장</label>
                            <div className="find-password" onClick={() => setRememberPassword(true)}> 비밀번호를 잃어버렸나요?</div>
                        </p>
                        <p className="submitBox">
                            <input className="loginBtn" type="submit" value="로그인" />
                            <input className="loginBtn" type="button" onClick={() => { props.setSubmitCheck(true); props.setHome(false) }} value="회원가입" />
                        </p>
                    </form>
                </div>
            </>
        );
    }

}

const FindPassword = (props) => {
    const [shake, setShake] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('')
    const [isTimer, setIsTimer] = useState(false)
    const [count, setCount] = useState(300);
    const [code, setCode] = useState('');
    const [verificationCode, setVerificationCode] = useState(false);
    const [wrong, setWrong] = useState(true);
    const [firstCheck, setFirstCheck] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)

    const [errors, setErrors] = useState({
        email: '',
        nickname: '',
        password: '',
        passwordCheck: '',
    });
    const [formIsValid, setFormIsValid] = useState(true);

    const validateField = async (field, value) => {
        let error = '';

        if (field === 'email') {
            if (!value) {
                error = '칸이 비어있습니다';
            } else if (!value.includes('@')) {
                error = '이메일을 입력하세요';
            }
        } else if (field === 'password') {
            if (!value) {
                error = '칸이 비어있습니다';
            }
        } else if (field === 'passwordCheck') {
            if (!value) {
                error = '칸이 비어있습니다';
            }
            else {
                if (password !== passwordCheck) {
                    error = '비밀번호가 다릅니다'
                }
            }
        }

        setErrors(prevErrors => ({
            ...prevErrors,
            [field]: error
        }));

        return !error;
    };

    const onVaildMail = async (e) => {
        e.preventDefault();
        const isEmailValid = await validateField('email', email);

        if (isEmailValid) {
            let error = '';
            try {
                //alert(email);
                const response = await axios.post(`${serverUrl}/check-email`, { email: email });
                if (response.data.success) {
                    error = '이메일이 없습니다.'
                    //alert(error)
                }
            } catch (err) {
                console.log(err)
            }
            setErrors(prevErrors => ({
                ...prevErrors,
                'email': error
            }));
            //console.log(errors)


            if (!error) {
                try {
                    setLoading(true)
                    const response = await axios.post(`${serverUrl}/send-email`, { email: email });
                    if (response.data.success) {
                        setVerificationCode(false);
                        setIsTimer(true);
                        setCount(300);
                        alert('이메일 발송 성공');
                        setLoading(false)
                    } else {
                        alert('인증 메일 발송 실패');
                        setLoading(false)
                    }
                } catch (e) {
                    //alert('인증 메일 발송 실패');
                    setLoading(false)
                }
            } else {
                //alert('유효한 이메일을 다시 입력하세요.');
            }
        }

    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEmailValid = await validateField('email', email);
        const isPasswordValid = await validateField('password', password);
        const isPasswordCheckValid = await validateField('passwordCheck', passwordCheck);

        setFormIsValid(isEmailValid && isPasswordValid && isPasswordCheckValid);

        if (isEmailValid && isPasswordValid && isPasswordCheckValid && verificationCode) {
            console.log('Form submitted');
            try {
                const response = await axios.post(`${serverUrl}/changePassword`, { email, password });

                if (response.status === 200) {
                    alert('비밀번호 변경 성공');
                    props.setRememberPassword(false)
                }
                else {
                    alert('error')
                }
            } catch (err) {
                console.err(err);
            }

        } else {
            // 로그인 실패 시 폼 흔들기
            setShake(true);
            setTimeout(() => setShake(false), 500);
            console.log('Form has errors');
        }
    };

    const checkCode = async (e) => {
        try {
            const response = await axios.post(`${serverUrl}/send-code`, { code: code, email: email });
            if (response.data.success) {
                setVerificationCode(true);
                setFirstCheck(true)
                setWrong(true);
                setIsDisabled(true)
                alert('인증 성공');
            } else {
                setVerificationCode(false);
                setFirstCheck(true)
                setWrong(false);
                alert('인증 실패');
            }
        } catch (e) {
            alert('인증 실패');
        }
    }

    return (
        <>
            <div className={`form ${shake ? 'shake' : ''}`} id="loginform">
                <h1> 비밀번호 바꾸기 </h1>
                <form onSubmit={handleSubmit} noValidate>
                    <p className="email">
                        <label htmlFor="email">이메일 <span>*</span></label>
                        <div className='email-form'>
                            <input
                                className={`input ${errors.email ? 'invalid' : ''}`}
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={async (e) => { setEmail(e.target.value); await validateField('email', e.target.value) }}
                            />
                            {loading ?
                                <div className='loader'> </div> :
                                <button onClick={onVaildMail} disabled={isDisabled}>
                                    인증
                                </button>
                            }
                            {errors.email && <span className="validation error">{errors.email}</span>}
                        </div>
                    </p>
                    {isTimer && <p className='emailCheck-form'>
                        <label htmlFor="emailCode">인증코드 <span>*</span></label>
                        <div className='check-form'>
                            <input
                                type='text'
                                className='emailCode'
                                id="emailCode"
                                name="emailCode"
                                placeholder='인증코드'
                                value={code}
                                onChange={async (e) => { setCode(e.target.value); }}
                            />
                            <div className="codeCheckBtn" >
                                {firstCheck ?
                                    (wrong ? <img src={correct} alt="" onClick={checkCode} /> : <img src={wrongImg} onClick={checkCode} alt="" />)
                                    : <img src={search} onClick={checkCode} alt="" />
                                }
                            </div>
                        </div>
                        {verificationCode ? <div className='timerContainer'></div> : <Timer count={count} setCount={setCount} setIsTimer={setIsTimer} />}
                    </p>}
                    {verificationCode &&
                        <div className='passwordChange-form'>
                            <p className="password">
                                <label htmlFor="password">비밀번호 <span>*</span></label>
                                <input
                                    className={`input ${errors.password ? 'invalid' : ''}`}
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={(e) => validateField('password', e.target.value)}
                                />
                                {errors.password && <span className="validation error">{errors.password}</span>}
                            </p>
                            <p className="password">
                                <label htmlFor="password">비밀번호 확인 <span>*</span></label>
                                <input
                                    className={`input ${errors.passwordCheck ? 'invalid' : ''}`}
                                    type="password"
                                    id="passwordCheck"
                                    name="passwordCheck"
                                    value={passwordCheck}
                                    onChange={(e) => setPasswordCheck(e.target.value)}
                                />
                                {errors.passwordCheck && <span className="validation error">{errors.passwordCheck}</span>}
                            </p>
                        </div>
                    }

                    <p className="submitBox">
                        <input className="loginBtn" type="submit" value="바꾸기" />
                        <input className="loginBtn" type="button" onClick={() => { props.setRememberPassword(false) }} value="홈으로" />
                    </p>
                </form>
            </div>
        </>
    )
}




const LoginScreen = () => {
    const navigate = useNavigate();
    const [submitCheck, setSubmitCheck] = useState(false);
    const [home, setHome] = useState(true);

    useEffect(() => {
        if (isTokenValid()) {
            navigate('/main');
        }
    }, [navigate]);

    if (home === true) {
        return (
            <div className='login-form'>
                <img src={logo} alt="logo" className="logo" style={{ border: 'none' }} />
                <LoginForm setSubmitCheck={setSubmitCheck} setHome={setHome} />
            </div >
        );
    }
    else if (submitCheck === true) {
        return (
            <div className='login-form'>
                <img src={logo} alt="logo" className="logo" style={{ border: 'none' }} />
                <SubmitForm setHome={setHome} />
            </div >
        )
    }

}

export default LoginScreen;
