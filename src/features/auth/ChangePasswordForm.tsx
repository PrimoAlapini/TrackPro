import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Mot de passe actuel requis'),
    new_password: z.string().min(8, 'Minimum 8 caractères'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export function ChangePasswordForm() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordFormData) => {
    setError('')
    setSuccess(false)

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.new_password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('Erreur lors de la mise à jour du mot de passe')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Changer le mot de passe</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Mot de passe actuel
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('current_password')}
              disabled={isSubmitting}
            />
            {errors.current_password && (
              <p className="text-[var(--danger)] text-sm mt-1">
                {errors.current_password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Nouveau mot de passe
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('new_password')}
              disabled={isSubmitting}
            />
            {errors.new_password && (
              <p className="text-[var(--danger)] text-sm mt-1">
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Confirmer le mot de passe
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('confirm_password')}
              disabled={isSubmitting}
            />
            {errors.confirm_password && (
              <p className="text-[var(--danger)] text-sm mt-1">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-[var(--danger)] bg-opacity-10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-[var(--success)] bg-opacity-10 border border-[var(--success)] text-[var(--success)] px-4 py-3 rounded-lg text-sm">
              Mot de passe mis à jour avec succès!
            </div>
          )}

          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Mettre à jour
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
