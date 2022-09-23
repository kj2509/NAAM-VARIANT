import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FormGroup from '@mui/material/FormControl';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ImageUploader from "react-images-upload";
import axios from "axios";
import FormData from 'form-data'
import './createUser.css';
import { ThemeProvider } from "@mui/material";
import theme from "../../config/Theme/Theme";

export default function CreateUser() {
  let navigate = useNavigate();
  const [profileImage, setProfileimage] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [isTeacher, setIsTeacher] = useState(false);
  const [values, setValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  const validate = () => {
    let temp = {};
    temp.first_name = values.first_name.length != 0?"":"First name is required";
    temp.last_name = values.last_name.length != 0?"":"Last name is required";
    temp.email = (/$|.+@.+..+/).test(values.email)?"":"Email is not valid";
    temp.email = values.email.length != 0?"":"Email is required";
    temp.password = values.password.length != 0?"":"Password is required";

    setErrors({...temp});
    return Object.values(temp).every(x=> x=="");
  }

  const handleInputOnChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
    setErrors({...errors, [prop]:""});
  };

  const handleShowPasswordClick = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordMouseDown = (event) => {
    event.preventDefault();
  };

  const onImageDrop = (imageList, addUpdateIndex) => {
    setProfileimage(imageList[0]);
  };

  const checkOrRegisterUser = () => {
    if(validate()) {
      let registrationFormData = new FormData();
      registrationFormData.append('first_name', values.first_name);
      registrationFormData.append('last_name', values.last_name);
      registrationFormData.append('email', values.email);
      registrationFormData.append('password', values.password);
      registrationFormData.append('is_teacher', isTeacher);
      if (!isTeacher) {
        registrationFormData.append('profile_photo', profileImage);
      }
      const res = axios.post("http://localhost:5000/register",
        registrationFormData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        })
        .then((response) => {
          alert("You have registered successfully. Continue to login page.");
          navigate("/")
        })
        .catch((error) => {
          alert("Unable to create user.", error)
          console.error(error);
        });
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="create-user-container">
        <FormGroup className="create-user-form-group">
          <div className="create-user-form-control">
            <FormControl sx={{ m: 1, width: '24ch' }}>
              <TextField 
                id="standard-basic"
                label="First name" 
                variant="standard" 
                value={values.first_name} 
                error={errors.first_name != ""}
                helperText={errors.first_name} 
                onChange={handleInputOnChange('first_name')} 
              />
            </FormControl>
          </div>
          <div className="create-user-form-control">
            <FormControl sx={{ m: 1, width: '24ch' }}>
              <TextField 
                id="standard-basic"
                label="Last name" 
                variant="standard" 
                value={values.last_name} 
                error={errors.last_name != ""}
                helperText={errors.last_name} 
                onChange={handleInputOnChange('last_name')} 
              />
            </FormControl>
          </div>
          <div className="create-user-form-control">
            <FormControl sx={{ m: 1, width: '24ch' }}>
              <TextField 
                id="standard-basic"
                label="Email" 
                variant="standard" 
                value={values.email} 
                error={errors.email != ""}
                helperText={errors.email} 
                onChange={handleInputOnChange('email')} 
              />
            </FormControl>
          </div>
          <div className="create-user-form-control">
            <FormControl sx={{ m: 1, width: '24ch' }}>
              <TextField
                id="standard-adornment-password"
                label="Password"
                variant="standard"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                error={errors.password != ""}
                helperText={errors.password} 
                onChange={handleInputOnChange('password')}
                InputProps={{
                  endAdornment:
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleShowPasswordClick}
                        onMouseDown={handlePasswordMouseDown}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                }  
              />
            </FormControl>
          </div>
          <div className="create-user-form-control">
            <FormControl sx={{ m: 1, width: '24ch' }}>
              <FormControlLabel
                control={<Switch
                  onClick={() => setIsTeacher(!isTeacher)}
                />}
                label="Is Manager" />
            </FormControl>
          </div>
          {!isTeacher &&
            <div className="create-user-form-control">
              <FormControl sx={{ m: 1, width: '24ch' }}>
                <ImageUploader
                  withIcon={false}
                  withPreview={true}
                  label=""
                  buttonText="Upload Image"
                  onChange={onImageDrop}
                  imgExtension={[".jpeg", ".jpg", ".gif", ".png", ".gif", ".svg"]}
                  maxFileSize={1048576}
                  fileSizeError=" file size is too big"
                  singleImage={true}
                  value={profileImage}
                />
              </FormControl>
            </div>
          }
          <div className="create-user-form-buttons">

            <Button variant="contained" onClick={checkOrRegisterUser}>Sign Up</Button>
            <Link href="/" underline="hover">Already have account?</Link>

          </div>
        </FormGroup>
      </div>
    </ThemeProvider>
  )
}