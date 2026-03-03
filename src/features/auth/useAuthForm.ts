import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AuthFormValues, authSchema } from './authSchema';

export function useAuthForm() {
  return useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });
}
