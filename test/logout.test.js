const express = require('express');
const session = require('express-session');
const request = require('supertest');
const routes = require('../src/controllers/logout');

const app = express();

// Middleware untuk session
app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: true,
}));

// Tambahkan route untuk logout
app.get('/logout', routes.logout);

describe('Logout Functionality', () => {
    const originalConsoleError = console.error;

    beforeAll(() => {
        // Mock console.error untuk mencegah log error
        console.error = jest.fn();
    });

    afterAll(() => {
        // Kembalikan console.error ke aslinya
        console.error = originalConsoleError;
    });

    test('Harus menghancurkan sesi dan mengarahkan ulang ke root', async () => {
        const agent = request.agent(app);

        await agent.get('/logout')
            .expect(302)
            .expect('Location', '/');
    });

    test('Harus menangani error sesi dengan baik ', async () => {
        const mockSessionDestroy = jest.fn((callback) => callback(new Error('Session destruction error')));

        const mockReq = {
            session: {
                destroy: mockSessionDestroy,
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await routes.logout(mockReq, mockRes);

        expect(mockSessionDestroy).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith('Internal Server Error');
    });
});
