import './App.css';
import LoginScreen from './components/loginScreen';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import ProtectedRoute from './components/ProtectedRoute';
import MyDiaryMenu from './components/menu/MydiaryMenu';
import WriteDiaryMenu from './components/menu/WriteDiaryMenu';
import NoticesMenu from './components/menu/NoticesMenu';
import RealTimeChatMenu from './components/menu/RealTimeChatMenu';
import FreeBoardMenu from './components/menu/FreeBoardMenu';
import ProfileMenu from './components/menu/ProfileMenu';
import DiaryDetail from './components/menu/DiaryDetail';
import WriteNotice from './components/menu/WriteNotice';
import { getToken } from './utils/auth';
import { useEffect } from 'react';
import NoticeDetail from './components/menu/NoticeDetail';
import EditUser from './components/menu/EditUser';
import ViewMain from './components/ViewMain'

function App() {
  //30분마다 갱신
  useEffect(() => {
    const checkToken = async () => {
      await getToken();
    };
    checkToken();//처음 마운트

    const intervalId = setInterval(() => {
      checkToken();
    }, 30 * 60 * 1000)//30분마다 실행

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ViewMain />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/main" element={<ProtectedRoute child={<Main />} />} />
        <Route path="/my-diary" element={<ProtectedRoute child={<MyDiaryMenu />} />} />
        <Route path="/my-diary/:id" element={<ProtectedRoute child={<DiaryDetail />} />} />
        <Route path="/edit-diary/:id" element={<ProtectedRoute child={<WriteDiaryMenu />} />} />
        <Route path="/write-diary" element={<ProtectedRoute child={<WriteDiaryMenu />} />} />
        <Route path="/notices" element={<NoticesMenu />} />
        <Route path="/notification/:id" element={<NoticeDetail />} />
        <Route path="/real-time-chat" element={<ProtectedRoute child={<RealTimeChatMenu />} />} />
        <Route path="/free-board" element={<ProtectedRoute child={<FreeBoardMenu />} />} />
        <Route path="/edit-notice/:id" element={<ProtectedRoute child={<WriteNotice />} />} />
        <Route path="/write-notice" element={<ProtectedRoute child={<WriteNotice />} />} />
        <Route path="/profile" element={<ProtectedRoute child={<ProfileMenu />} />} />
        <Route path="/edit-user" element={<ProtectedRoute child={<EditUser />} />} />
        <Route path="*" element={<LoginScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;