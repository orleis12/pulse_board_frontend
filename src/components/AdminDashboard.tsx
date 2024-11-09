import React, { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Typography, Button, message } from 'antd';
import { Line, Pie } from '@ant-design/plots';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';

const { Title } = Typography;

function AdminDashboard() {
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarUsuariosAdmin = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const userActivityResponse = await axios.get('http://127.0.0.1:8000/api/v2/useractivity/', {
          headers: {
            Authorization: `Token ${token}`,
          }
        });
        const usersResponse = await axios.get('http://127.0.0.1:8000/api/v2/users/', {
          headers: {
            Authorization: `Token ${token}`,
          }
        });

        const userActivities = userActivityResponse.data;
        const users = usersResponse.data;

        const usersWithActivity = userActivities.map(activity => {
        const usuario = users.find(user => user.id === activity.user);

          if (usuario) {
            return {
              id: activity.id,
              login_time: activity.login_time,
              session_duration: activity.session_duration,
              clicked_button_1: activity.clicked_button_1,
              clicked_button_2: activity.clicked_button_2,
              username: usuario.username,
              email: usuario.email,
              is_active: usuario.is_active,
              is_staff: usuario.is_staff,
              is_superuser: usuario.is_superuser,
            };
          }
          return null;
        }).filter(item => item !== null);

        setUsers(usersWithActivity);
        setLoading(false);

      } catch (error) {
        console.error('Error al cargar los usuarios y la actividad:', error);
      }
    };

    const user = JSON.parse(localStorage.getItem('user') ?? 'null');

    if (!user) {
      message.error('¡No tiene los permisos para ingresar!');
      navigate('/');
      return;
    }

    cargarUsuariosAdmin();
    getAdminInfo();
  }, []);

  const columns = [
    {
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Inicio sesión',
      dataIndex: 'login_time',
      key: 'login_time',
      render: (text) => text ? new Date(text).toLocaleString() : 'N/A',
    },
    {
      title: 'Tiempo',
      dataIndex: 'session_duration',
      key: 'session_duration',
      render: (text) => `${text}`,
    },
    {
      title: 'Botón 1',
      dataIndex: 'clicked_button_1',
      key: 'clicked_button_1',
    },
    {
      title: 'Botón 2',
      dataIndex: 'clicked_button_2',
      key: 'clicked_button_2',
    },
  ];

  const lineData = users.flatMap(user => [
    { username: user.username, name: 'Botón 1', value: user.clicked_button_1 },
    { username: user.username, name: 'Botón 2', value: user.clicked_button_2 },
  ]);

  const lineConfig = {
    data: lineData,
    xField: 'username',
    yField: 'value',
    seriesField: 'name', // Cambia colorField a seriesField para indicar las líneas
    yAxis: {
      label: {
        formatter: (v) => `${v}`, // Opcional: puedes personalizar el formato aquí
      },
    },
    legend: { position: 'top' },
    smooth: true, // Opcional: suaviza las líneas para una mejor visualización
    interactions: [
      { type: 'element-highlight' },
      { type: 'legend-highlight' },
    ],
  };

  const pieData = [
    { type: 'Botón 1', value: users.reduce((acc, user) => acc + user.clicked_button_1, 0) },
    { type: 'Botón 2', value: users.reduce((acc, user) => acc + user.clicked_button_2, 0) },
  ];

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
  };

  const getAdminInfo = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setAdminName(user.username);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Panel de Administración</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Col>
      </Row>
      <Title level={4} style={{ marginBottom: '24px' }}>Hola, {adminName}</Title>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Lista de Usuarios">
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 8 }}
            />
          </Card>
        </Col>
        {!loading && (
          <>
            <Col span={12}>
              <Card title="">
                <Line {...lineConfig} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="">
                <Pie {...pieConfig} />
              </Card>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
}

export default AdminDashboard;
