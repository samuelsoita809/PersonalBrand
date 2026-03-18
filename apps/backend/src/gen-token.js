import { authService } from './services/auth.js';

async function run() {
    const token = await authService.generateToken({ id: 'admin-id', role: 'admin' });
    console.log('TEST_TOKEN_START');
    console.log(token);
    console.log('TEST_TOKEN_END');
}

run();
