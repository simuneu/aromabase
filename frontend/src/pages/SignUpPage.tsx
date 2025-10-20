import React from 'react';
import Layout from '@/components/Layout';
import SignupForm from '@/components/signupForm';

const SignUpPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center w-full pt-0">
      <SignupForm />
    </div>
  );
};

export default SignUpPage;
