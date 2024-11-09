import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import loginUser from '../api/auth.js';
import '../styles/stylesLogin.css'
import '../api/api.js';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { username, password } = values;
      const data = await loginUser(username, password);

      if (data) {
        if(data.is_superuser!==false){
          message.success('¡Bienvenido Administrador!');
          navigate('/dashboard');
        } else if(data.is_superuser!==true){
          message.success('¡Bienvenido!');
          navigate('/user');
        }
      } else {
        message.error('Usuario o contraseña incorrectos. Inténtalo de nuevo.');
      }

    } catch (error) {
      message.error('Error al intentar iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Bienvenido a Pulse Board</h1>
        </div>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: 'Por favor ingresa tu nombre de usuario',
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nombre de usuario" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Por favor ingresa tu contraseña',
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="login-button">
              Ingresar
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;