import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { createLogger } from '@monorepo/shared';

const logger = createLogger('ContactForm');

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    logger.info('Contact form submitted', data);
    try {
      // simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Thank you for your message! Our team will get back to you soon.');
      reset();
    } catch (error) {
      logger.error('Contact form submission failed', error);
    }
  };

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      color: 'white',
      backgroundColor: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
      '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
    '& .MuiFormHelperText-root': { color: '#f87171' },
  };

  return (
    <div className="glass-card p-8 rounded-[2rem] max-w-lg mx-auto mt-8 relative overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-blue-500/10 hover:-translate-y-1">
      <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-colors pointer-events-none" />
      
      <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: '800', position: 'relative' }}>
        Get in Touch
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, position: 'relative' }}>
        We'd love to hear from you. Drop us a message!
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ position: 'relative' }}>
        <TextField
          margin="normal"
          fullWidth
          label="Full Name"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
          sx={textFieldSx}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Email Address"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={textFieldSx}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Message"
          multiline
          rows={4}
          {...register('message')}
          error={!!errors.message}
          helperText={errors.message?.message}
          sx={textFieldSx}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{ 
            mt: 4, 
            py: 1.5, 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            textTransform: 'none', 
            fontSize: '1rem',
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)'
          }}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </Box>
    </div>
  );
};

export default ContactForm;
