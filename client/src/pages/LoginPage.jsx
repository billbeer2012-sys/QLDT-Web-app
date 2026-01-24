/*
* Đường dẫn file: D:\QLDT-app\client\src\pages\LoginPage.jsx
* Phiên bản cập nhật: 19/09/2025
* Tóm tắt những nội dung cập nhật:
* - VÔ HIỆU HÓA: Tạm thời tắt chức năng "Đăng nhập với Google".
* - Nút bấm sẽ được làm mờ, không thể nhấp và hiển thị tooltip
* "Chức năng đang phát triển" khi người dùng di chuột vào.
*/
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';
import { User, Lock, ShieldQuestion, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.596 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [captchaText, setCaptchaText] = useState('');
    const [captchaSvg, setCaptchaSvg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Bỏ state isGoogleLoading vì không còn cần thiết
    // const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [appVersion, setAppVersion] = useState('');
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const { data } = await axiosInstance.get('/version');
                setAppVersion(data.version);
            } catch (error) {
                console.error("Không thể lấy phiên bản ứng dụng:", error);
            }
        };
        fetchVersion();
    }, []);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            toast.error('Đăng nhập với Google thất bại. Vui lòng thử lại.');
            searchParams.delete('error');
            setSearchParams(searchParams);
        }
    }, [searchParams, setSearchParams]);

    const fetchCaptcha = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get('/auth/captcha', { responseType: 'text' });
            setCaptchaSvg(data);
        } catch {
            toast.error('Không thể tải mã xác thực.');
        }
    }, []);

    useEffect(() => {
        fetchCaptcha();
    }, [fetchCaptcha]);

    const handleInputChange = (setter) => (e) => {
        if (error) setError('');
        setter(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data } = await axiosInstance.post('/auth/login', { 
                username: username,
                password: password,
                captcha: captchaText 
            });
            login(data.user, data.token);
            toast.success(data.message || 'Đăng nhập thành công!');
            navigate('/', { replace: true });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setError(errorMessage);
            toast.error(errorMessage);
            fetchCaptcha();
        } finally {
            setIsLoading(false);
        }
    };
    
    // Bỏ hàm handleGoogleLogin
    // const handleGoogleLogin = () => { ... };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <img
                            src="https://camauvkc.edu.vn/img/Logo.jpg"
                            alt="Logo"
                            className="w-20 h-20 mx-auto rounded-full mb-4 border-2 border-yellow-400"
                        />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Chào mừng trở lại!</h1>
                        <p className="text-gray-500 dark:text-gray-400">Đăng nhập để tiếp tục</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tên đăng nhập"
                                value={username}
                                onChange={handleInputChange(setUsername)}
                                required
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div className="relative">
                             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={handleInputChange(setPassword)}
                                required
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative flex-grow">
                                <ShieldQuestion className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Mã xác thực"
                                    value={captchaText}
                                    onChange={handleInputChange(setCaptchaText)}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div
                                onClick={fetchCaptcha}
                                dangerouslySetInnerHTML={{ __html: captchaSvg }}
                                className="h-[42px] w-32 cursor-pointer rounded-lg bg-gray-200 dark:bg-gray-600 flex-shrink-0"
                                title="Nhấn để đổi mã"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative flex items-center" role="alert">
                                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                            >
                                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </button>
                        </div>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                        <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">hoặc</span>
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    </div>

                    {/* BỔ SUNG: Vô hiệu hóa nút đăng nhập Google và thêm tooltip */}
                    <div className="relative group">
                        <button
                            disabled
                            className="w-full flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-lg transition duration-300 opacity-50 cursor-not-allowed"
                        >
                            <GoogleIcon />
                            <span>Đăng nhập với Google</span>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Chức năng đang phát triển
                            <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                                <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                            </svg>
                        </div>
                    </div>
                </div>
                {appVersion && (
                    <p className="text-center text-xs text-gray-500 mt-6">
                        Phiên bản {appVersion}
                    </p>
                )}
            </div>
        </div>
    );
};
export default LoginPage;

