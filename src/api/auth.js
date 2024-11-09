import axios from 'axios';

const loginUser = async (username, password) => {   
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/login/', {
      username:username,
      password:password,
    });
    
    const token = response.data.token;
    const data = {
        id:response.data.id,
        username:response.data.username,
        is_superuser:response.data.is_superuser,
        email:response.data.email,
    }
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('loginTime', new Date().toISOString());
  
    return data;
  } catch (error) {
    console.error('Error al iniciar sesión');
    return null;
  }
};

export default loginUser; 