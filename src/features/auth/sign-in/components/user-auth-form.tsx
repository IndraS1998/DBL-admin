import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { LoadingOverlay } from '@/components/layout/overlay'
import { fetchFromRaftNode } from '@/stub/stub'
import { toast } from "sonner"
import Cookies from 'js-cookie'
import { useNavigate } from '@tanstack/react-router'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)

    interface AdminPayload{
      FirstName: string;
      LastName: string;
      Email: string;
      AdminID: number;
      Active : boolean;
    }

    const res = await fetchFromRaftNode<{admin: AdminPayload}>(`/api/admin/signin?email=${data.email}&password=${data.password}`)

    if(res.status === 406){
      toast.error("Invalid signin credentials!")
    }else if(res.status === 202){
      Cookies.set("AdminID",String(res.data.admin.AdminID))
      Cookies.set("first_name",res.data.admin.FirstName)
      Cookies.set("last_name",res.data.admin.LastName)
      Cookies.set("mail",res.data.admin.Email)
      Cookies.set("status",res.data.admin.Active.toString())
      //navigate
      navigate({to:'/dashboard'})
    }else{
      toast.error("System is unavailable for now! try again later")  
    }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <LoadingOverlay open={loading}/>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={loading}>
          Login
        </Button>

 
      </form>
    </Form>
  )
}
