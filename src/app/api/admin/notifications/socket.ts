import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket) {
    return res.status(500).json({ error: 'Socket not available' });
  }

  // Type assertion for the server property
  const server = (res.socket as any).server;
  
  if (!server) {
    return res.status(500).json({ error: 'Server not available' });
  }

  if (!server.io) {
    const io = new Server(server, {
      path: '/api/admin/notifications/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    server.io = io;
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 