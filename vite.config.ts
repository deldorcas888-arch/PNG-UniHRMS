import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          vacancies: path.resolve(__dirname, 'vacancies.html'),
          onboarding: path.resolve(__dirname, 'onboarding.html'),
          payroll: path.resolve(__dirname, 'payroll.html'),
          leave: path.resolve(__dirname, 'leave.html'),
          loans: path.resolve(__dirname, 'loans.html'),
          approvals: path.resolve(__dirname, 'approvals.html'),
          attendance: path.resolve(__dirname, 'attendance.html'),
          performance: path.resolve(__dirname, 'performance.html'),
          faculty: path.resolve(__dirname, 'faculty.html'),
          reports: path.resolve(__dirname, 'reports.html'),
          integration: path.resolve(__dirname, 'integration.html'),
          notFound: path.resolve(__dirname, '404.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
