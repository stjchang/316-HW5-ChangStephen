import { useContext, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import AuthContext from '../auth'
import Copyright from './Copyright'
import authRequestSender from '../auth/requests'

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// import Input from '@mui/material/Input';
// import InputLabel from '@mui/material/InputLabel';
// import FormControl from '@mui/material/FormControl';
// import FormHelperText from '@mui/material/FormHelperText';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const AVATAR_WIDTH = 200;
const AVATAR_HEIGHT = 200;

export default function RegisterScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const location = useLocation();
    
    const isEditMode = location.pathname === '/edit-account/';
    
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState('');
    const [avatarImage, setAvatarImage] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [userNameError, setUserNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordVerifyError, setPasswordVerifyError] = useState('');
    const [avatarError, setAvatarError] = useState('');
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        if (isEditMode && auth.loggedIn && auth.user) {
            setUserName(auth.user.userName || '');
            setEmail(auth.user.email || '');
            if (auth.user.avatarImage) {
                setAvatarPreview(auth.user.avatarImage);
                setAvatarImage(auth.user.avatarImage);
            }
        }
    }, [isEditMode, auth.loggedIn, auth.user]);

    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    const validateImageSize = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                if (img.width === AVATAR_WIDTH && img.height === AVATAR_HEIGHT) {
                    resolve(true);
                } else {
                    reject(new Error(`Image must be exactly ${AVATAR_WIDTH}x${AVATAR_HEIGHT} pixels. Current size is ${img.width}x${img.height}`));
                }
            };
            img.onerror = () => reject(new Error(`Must be exactly ${AVATAR_WIDTH}x${AVATAR_HEIGHT} pixels`));
            img.src = URL.createObjectURL(file);
        });
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            setAvatarImage(null);
            setAvatarPreview(null);
            setAvatarError('');
            return;
        }   

        if (!file.type.startsWith('image/')) {
            setAvatarError('Please select a valid image file');
            return;
        }

        try {
            await validateImageSize(file);
            const base64String = await convertImageToBase64(file);
            setAvatarImage(base64String);
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarError('');
            
        } catch (error) {
            setAvatarError(error.message);
            setAvatarImage(null);
            setAvatarPreview(null);
        }
    };

    const validateUserName = (value) => {
        if (!value || value.trim() === '') {
            setUserNameError('username is required');
            return false;
        }
        setUserNameError('');
        return true;
    };

    const validateEmail = (value) => {
        if (!value || value.trim() === '') {
            setEmailError('email is required');
            return false;
        }
        // if (!(value.includes('@') && value.includes('.'))) {
        //     setEmailError('Enter a valid email address');
        //     return false;
        // }
        return true;
    };

    const validatePassword = (value) => {
        if (isEditMode && !value) {
            setPasswordError('');
            return true;
        }
        
        if (!value) {
            setPasswordError('Password is required');
            return false;
        }
        if (value.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return false;
        }
        setPasswordError('');
        
        if (passwordVerify && value !== passwordVerify) {
            setPasswordVerifyError('Passwords do not match');
        } else if (passwordVerify && value === passwordVerify) {
            setPasswordVerifyError('');
        }
        
        return true;
    };

    const validatePasswordVerify = (value) => {
        // pass is optional if in edit mode
        if (isEditMode && !password && !value) {
            setPasswordVerifyError('');
            return true;
        }
        
        if (!value) {
            setPasswordVerifyError('enter your password again');
            return false;
        }
        if (value !== password) {
            setPasswordVerifyError('Passwords do not match');
            return false;
        }
        setPasswordVerifyError('');
        return true;
    };

    const isFormValid = () => {
        const baseValid = userName.trim() !== '' &&
                email.trim() !== '' &&
                userNameError === '' &&
                emailError === '' &&
                passwordError === '' &&
                passwordVerifyError === '' &&
                avatarError === '';
        
        if (isEditMode) {
            const passwordValid = !password || (password.length >= 8 && password === passwordVerify);
            return baseValid && passwordValid;
        } else {
            return baseValid &&
                password.length >= 8 &&
                passwordVerify === password &&
                avatarImage !== null;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setServerError('');

        const isUserNameValid = validateUserName(userName);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isPasswordVerifyValid = validatePasswordVerify(passwordVerify);

        if (isEditMode) {
            if (!isUserNameValid || !isEmailValid || !isPasswordValid || !isPasswordVerifyValid) {
                return;
            }
        } else {
            if (!isUserNameValid || !isEmailValid || !isPasswordValid || !isPasswordVerifyValid || !avatarImage) {
                if (!avatarImage) {
                    setAvatarError(`Upload a ${AVATAR_WIDTH}x${AVATAR_HEIGHT} avatar image`);
                }
                return;
            }
        }

        try {
            if (isEditMode) {
                const response = await authRequestSender.editAccount(userName, email, password, passwordVerify, avatarImage);
                if (response && response.success) {
                    await auth.getLoggedIn();
                    history.push('/login/');
                } else {
                    setServerError(response?.errorMessage || "Failed to update account");
                }
            } else {
                const response = await auth.registerUser(userName, email, password, passwordVerify, avatarImage);
                if (response && response.success) {
                    history.push('/login/');
                }
            }
        } catch (error) {
            let errorMessage = isEditMode ? "An error occurred while editing your account." : "An error while registering your account.";
            if (error.data && error.data.errorMessage) {
                errorMessage = error.data.errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setServerError(errorMessage);
        }
    };

    const handleCancel = () => {
        history.push('/');
    };

    return (
        <Container component="main" maxWidth="sm">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {!isEditMode && (
                    <Avatar sx={{ m: 1, bgcolor: '#8932CC' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                )}
                <Typography component="h1" variant="h5">
                    {isEditMode ? 'Edit Account' : 'Create Account'}
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0.5 }}>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="avatar-upload-fab"
                                        type="file"
                                        onChange={handleAvatarChange}
                                    />
                                    <label htmlFor="avatar-upload-fab">
                                        <Fab
                                            component="span"
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                bgcolor: '#8932CC',
                                                '&:hover': { bgcolor: '#702963' },
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {avatarPreview ? (
                                                <Avatar
                                                    src={avatarPreview}
                                                    alt="Avatar"
                                                    sx={{ width: 80, height: 80 }}
                                                />
                                            ) : auth.user?.avatarImage && isEditMode ? (
                                                <Avatar
                                                    src={auth.user.avatarImage}
                                                    alt="Avatar"
                                                    sx={{ width: 80, height: 80 }}
                                                />
                                            ) : (
                                                <PhotoCameraIcon sx={{ fontSize: 40, color: 'white' }} />
                                            )}
                                        </Fab>
                                    </label>
                                    {/* <Button
                                        component="label"
                                        htmlFor="avatar-upload-fab"
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            bgcolor: '#424242',
                                            color: 'white',
                                            '&:hover': { bgcolor: '#616161' },
                                            textTransform: 'none',
                                            minWidth: 80,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        Select
                                    </Button> */}
                                </Box>
                                
                                {/* User Name Field */}
                                <Box sx={{ flexGrow: 1 }}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="userName"
                                        label="User Name"
                                        name="userName"
                                        autoComplete="username"
                                        autoFocus
                                        value={userName}
                                        onChange={(e) => {
                                            setUserName(e.target.value);
                                            validateUserName(e.target.value);
                                        }}
                                        onBlur={(e) => validateUserName(e.target.value)}
                                        error={userNameError !== ''}
                                        helperText={userNameError}
                                    />
                                    {avatarError && (
                                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                            {avatarError}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    validateEmail(e.target.value);
                                }}
                                onBlur={(e) => validateEmail(e.target.value)}
                                error={emailError !== ''}
                                helperText={emailError}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required={!isEditMode}
                                fullWidth
                                name="password"
                                label={isEditMode ? "New Password (optional)" : "Password"}
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    validatePassword(e.target.value);
                                }}
                                onBlur={(e) => validatePassword(e.target.value)}
                                error={passwordError !== ''}
                                helperText={passwordError || (isEditMode ? '(Optional)' : 'Must be at least 8 characters')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required={!isEditMode}
                                fullWidth
                                name="passwordVerify"
                                label={isEditMode ? "Confirm New Password" : "Confirm Password"}
                                type="password"
                                id="passwordVerify"
                                autoComplete="new-password"
                                value={passwordVerify}
                                onChange={(e) => {
                                    setPasswordVerify(e.target.value);
                                    validatePasswordVerify(e.target.value);
                                }}
                                onBlur={(e) => validatePasswordVerify(e.target.value)}
                                error={passwordVerifyError !== ''}
                                helperText={passwordVerifyError}
                            />
                        </Grid>
                        {serverError && (
                            <Grid item xs={12}>
                                <Typography color="error" variant="body2">
                                    {serverError}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 2 }}>
                        {isEditMode && (
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={!isFormValid()}
                            sx={{
                                bgcolor: '#8932CC',
                                '&:hover': { bgcolor: '#702963' },
                                '&:disabled': { bgcolor: '#ccc' }
                            }}
                        >
                            {isEditMode ? 'Complete' : 'Create Account'}
                        </Button>
                    </Box>
                    {!isEditMode && (
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login/" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Box>
            <Copyright sx={{ mt: 5 }} />
        </Container>
    );
}
