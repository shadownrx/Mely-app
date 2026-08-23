import * as Ably from 'ably';
import { apiRequest } from './apiClient';

let client: Ably.Realtime | null = null;

/**
 * authCallback (no authUrl+authHeaders estático) porque el accessToken rota cada 15m
 * y Ably puede pedir un token nuevo mucho después — necesitamos leer el token vigente
 * en cada renovación, no el que había al construir el cliente.
 */
export function getRealtimeClient(): Ably.Realtime {
  if (!client) {
    client = new Ably.Realtime({
      authCallback: async (_tokenParams, callback) => {
        try {
          const tokenRequest = await apiRequest<Ably.TokenRequest>('/realtime/token');
          callback(null, tokenRequest);
        } catch (err) {
          callback(err as Ably.ErrorInfo, null);
        }
      },
    });
  }
  return client;
}

export function disconnectRealtime() {
  client?.close();
  client = null;
}

export type ChatEvent =
  | { type: 'message'; data: unknown }
  | { type: 'read'; data: { connectionId: string; userId: string } }
  | { type: 'typing'; data: { connectionId: string; userId: string } }
  /** El canal se reconectó sin garantía de continuidad (ej: el celular estuvo en segundo plano
   * un buen rato) — puede haber mensajes perdidos, hay que refetchear en vez de confiar en el stream. */
  | { type: 'resync' };

export function subscribeConnection(connectionId: string, onEvent: (event: ChatEvent) => void): () => void {
  const channel = getRealtimeClient().channels.get(`connection:${connectionId}`);
  const onMessage = (msg: Ably.Message) => onEvent({ type: 'message', data: msg.data });
  const onRead = (msg: Ably.Message) => onEvent({ type: 'read', data: msg.data });
  const onTyping = (msg: Ably.Message) => onEvent({ type: 'typing', data: msg.data });
  const onAttached = (stateChange: Ably.ChannelStateChange) => {
    if (stateChange.resumed === false) onEvent({ type: 'resync' });
  };
  channel.subscribe('message', onMessage);
  channel.subscribe('read', onRead);
  channel.subscribe('typing', onTyping);
  channel.on('attached', onAttached);
  return () => {
    channel.unsubscribe('message', onMessage);
    channel.unsubscribe('read', onRead);
    channel.unsubscribe('typing', onTyping);
    channel.off('attached', onAttached);
  };
}

export function subscribeUserNotifications(userId: string, onNotification: (data: unknown) => void): () => void {
  const channel = getRealtimeClient().channels.get(`user:${userId}`);
  const handler = (msg: Ably.Message) => onNotification(msg.data);
  channel.subscribe('notification', handler);
  return () => channel.unsubscribe('notification', handler);
}
