import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const isElectron = process.env.BUILD_TARGET === 'electron';

// https://vite.dev/config/
export default defineConfig({
  base: isElectron ? './' : '/', // Use a relative base for Electron, absolute for Capacitor
  plugins: [react()],
})
