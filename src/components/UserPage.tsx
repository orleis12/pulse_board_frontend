import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spin, Button, message } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import logoPanzofi from '../assets/panzofiLogo.png';
import { crearUserActivity, incrementCounter } from '../api/api';

function UserPage() {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') ?? 'null');
  const loginTime = new Date(localStorage.getItem('loginTime') ?? '');

  const [counter1, setCounter1] = useState(() => {
    const storedActivity = localStorage.getItem('userActivity');
    return storedActivity ? JSON.parse(storedActivity).clicked_button_1 || 0 : 0;
  });

  const [counter2, setCounter2] = useState(() => {
    const storedActivity = localStorage.getItem('userActivity');
    return storedActivity ? JSON.parse(storedActivity).clicked_button_2 || 0 : 0;
  });

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ title: string; description: string } | null>(null);

  const navigate = useNavigate();

  const handleIncrement = async (counter) => {
    if (counter === 1) {
      setCounter1(prevCount => prevCount + 1);
      await incrementCounter(1, counter1 + 1);
    } else {
      setCounter2(prevCount => prevCount + 1);
      await incrementCounter(2, counter2 + 1);
    }
  };

  const calculateSessionDuration = () => {
    const logoutTime = new Date();
    const duration = Math.abs(logoutTime.getTime() - loginTime.getTime());
    return Math.floor(duration / 1000);
  };

  const updateSessionDuration = async () => {
    const sessionDuration = calculateSessionDuration();
    const userActivity = JSON.parse(localStorage.getItem('userActivity') ?? 'null');
    
    if (!userActivity) {
      console.error('Error: userActivity es null.');
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/v2/useractivity/${userActivity.id}/`,
        {
          session_duration: sessionDuration,
          user: userActivity.user,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error al actualizar la duración de la sesión:', error);
    }
  };

  const cargarDatosAdicionales = async () => {
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v2/landingpage/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setData(response.data[0]);
    } catch (error) {
      console.error('Error al cargar datos adicionales:', error);
    }
  };

  useEffect(() => {
    const cargarUserActivity = async () => {
      if (!user) {
        message.error('¡No tiene los permisos para ingresar!');
        navigate('/');
        return;
      }

      try {
        // Primero cargar los datos adicionales
        await cargarDatosAdicionales();

        // Luego cargar la actividad del usuario
        const response = await axios.get('http://127.0.0.1:8000/api/v2/useractivity/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const userActivity = response.data.find(activity => activity.user === user.id);

        if (!userActivity) {
          await crearUserActivity(user.id, token);
        } else {
          localStorage.setItem('userActivity', JSON.stringify(userActivity));
          setCounter1(userActivity.clicked_button_1 || 0);
          setCounter2(userActivity.clicked_button_2 || 0);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error en la solicitud:', error);
        setLoading(false);
      }
    };

    cargarUserActivity();
  }, []);

  const handleLogout = async () => {
    const userActivity = localStorage.getItem('userActivity');

    if (userActivity) {
      const response = await updateSessionDuration();
      if (response) {
        localStorage.clear();
        navigate('/');
      }
    } else {
      console.error("No se puede actualizar la duración porque 'userActivity' es null.");
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      {loading ? (
        <Spin size="large" />
      ) : (
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="mt-2 text-end">
              <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
            <div className="max-w-md mx-auto">
              <img src={logoPanzofi} className="h-20 w-auto mx-auto" alt="Logo" />
              <h1 className="text-2xl font-semibold text-center mt-4">{data?.title}</h1>
              <p className="mt-2 text-gray-600 text-center">{data?.description}</p>
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleIncrement(1)}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
                    >
                      Button 1: {counter1}
                    </button>
                    <button
                      onClick={() => handleIncrement(2)}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
                    >
                      Button 2: {counter2}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPage;
