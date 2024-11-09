import axios from 'axios';
import {formatDate} from '../js/formatDate.js';

export async function crearUserActivity(userId, token){
  try {
    const formattedDate = formatDate();
    
    const response = await axios.post(
      'http://127.0.0.1:8000/api/v2/useractivity/',
      {
        user: userId,
        clicked_button_1: 0,
        clicked_button_2: 0,
        session_duration: 0,
        login_time: formattedDate,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
  
    localStorage.setItem('userActivity', JSON.stringify(response.data));
    
  } catch (error) {
    console.error('Error al crear la actividad del usuario:', error);
  }
};

export async function incrementCounter(button, currentCount) {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  if (!user) {
    console.error("Usuario no encontrado en el localStorage.");
    return;
  }

  let userActivity = localStorage.getItem('userActivity') ? JSON.parse(localStorage.getItem('userActivity')) : null;

  if (!userActivity) {

    userActivity = {
      user: user.id,
      clicked_button_1: 0,
      clicked_button_2: 0,
      session_duration: 0,
    };
  }

  if (button === 1) {
    userActivity.clicked_button_1 = currentCount;
  } else if (button === 2) {
    userActivity.clicked_button_2 = currentCount;
  }

  localStorage.setItem('userActivity', JSON.stringify(userActivity));

  try {
          await axios.put(`http://127.0.0.1:8000/api/v2/useractivity/${userActivity.id}/`,
      {
        user:userActivity.user,
        clicked_button_1: userActivity.clicked_button_1,
        clicked_button_2: userActivity.clicked_button_2,
        session_duration: userActivity.session_duration,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

  } catch (error) {
    console.error("Error al actualizar la actividad:", error);
  }
};
  