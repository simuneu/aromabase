import React from 'react';
import Layout from '@/components/Layout';
import LoginForm from '@/components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center w-full pt-0">
      <LoginForm />
    </div>
  );
};

export default LoginPage;