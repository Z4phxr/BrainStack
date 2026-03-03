import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FormErrorProps {
  message: string | string[]
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  const messages = Array.isArray(message) ? message : [message]

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {messages.length === 1 ? (
          messages[0]
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {messages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  )
}

interface FieldErrorProps {
  message?: string
  className?: string
}

export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null

  return (
    <p className={`text-sm text-destructive mt-1 ${className || ''}`}>
      {message}
    </p>
  )
}
