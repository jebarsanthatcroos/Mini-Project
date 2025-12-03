'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Components
import NameField from './form/NameField';
import EmailField from './form/EmailField';
import PasswordField from './form/PasswordField';
import ConfirmPasswordField from './form/ConfirmPasswordField';
import SubmitButton from './form/SubmitButton';

// Validation schema
const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .min(1, 'Email is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function SignUpForm({
  onSuccess,
  onError,
  onLoadingChange,
}: SignUpFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
    setError: setFormError,
    clearErrors,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Watch form values
  const nameValue = watch('name');
  const emailValue = watch('email');
  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  const onSubmit = async (data: SignUpFormData) => {
    onLoadingChange(true);
    onError('');
    clearErrors();

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.toLowerCase(),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setFormError('email', {
            type: 'manual',
            message: result.message || 'User already exists with this email',
          });
        } else {
          throw new Error(result.message || 'Registration failed');
        }
        return;
      }

      onSuccess('Account created successfully! Redirecting...');

      // Auto sign in after successful registration
      const signInResult = await signIn('credentials', {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push(
          '/auth/signin?message=Registration successful. Please sign in.'
        );
      } else {
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      onError(err.message || 'An error occurred during registration');
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Name Field */}
      <NameField<SignUpFormData>
        register={register}
        error={errors.name}
        value={nameValue}
      />

      {/* Email Field */}
      <EmailField<SignUpFormData>
        register={register}
        error={errors.email}
        value={emailValue}
        placeholder='Enter your email address'
        label='Email Address'
      />

      {/* Password Field */}
      <PasswordField<SignUpFormData>
        register={register}
        error={errors.password}
        value={passwordValue}
        placeholder='Create a strong password'
        label='Password'
        showForgotPassword={false}
      />

      {/* Confirm Password Field */}
      <ConfirmPasswordField<SignUpFormData>
        register={register}
        error={errors.confirmPassword}
        value={confirmPasswordValue}
        passwordValue={passwordValue}
      />

      {/* Submit Button */}
      <SubmitButton
        loading={false}
        disabled={!isDirty || !isValid}
        loadingText='Creating Account...'
        defaultText='Create Account'
        buttonType='signup'
      />
    </form>
  );
}
