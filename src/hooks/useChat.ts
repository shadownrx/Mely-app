import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as chatApi from '../lib/api/chat';
import { subscribeConnection } from '../lib/realtime';
import type { Message } from '../types';

export function useMessages(connectionId: string | null) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['messages', connectionId],
    queryFn: () => chatApi.listMessages(connectionId as string),
    enabled: Boolean(connectionId),
  });

  useEffect(() => {
    if (!connectionId) return;
    const unsubscribe = subscribeConnection(connectionId, (event) => {
      if (event.type === 'message') {
        const msg = event.data as Message;
        queryClient.setQueryData<{ messages: Message[] } | undefined>(['messages', connectionId], (prev) => {
          if (!prev) return prev;
          if (prev.messages.some((m) => m.id === msg.id)) return prev;
          return { messages: [...prev.messages, msg] };
        });
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      } else if (event.type === 'read') {
        queryClient.setQueryData<{ messages: Message[] } | undefined>(['messages', connectionId], (prev) => {
          if (!prev) return prev;
          const nowIso = new Date().toISOString();
          return { messages: prev.messages.map((m) => (m.readAt ? m : { ...m, readAt: nowIso })) };
        });
      }
    });
    return unsubscribe;
  }, [connectionId, queryClient]);

  return query;
}

/** Se apaga sola a los 4s si no llega otro evento — evita quedar "escribiendo..." colgado. */
export function useTypingIndicator(connectionId: string | null) {
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsPartnerTyping(false);
    if (!connectionId) return;
    const unsubscribe = subscribeConnection(connectionId, (event) => {
      if (event.type !== 'typing') return;
      setIsPartnerTyping(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsPartnerTyping(false), 4000);
    });
    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [connectionId]);

  return isPartnerTyping;
}

function useInvalidateChat(connectionId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['messages', connectionId] });
    queryClient.invalidateQueries({ queryKey: ['matches'] });
  };
}

export function useSendMessage(connectionId: string) {
  const invalidate = useInvalidateChat(connectionId);
  return useMutation({
    mutationFn: (body: string) => chatApi.sendMessage(connectionId, body),
    onSuccess: invalidate,
  });
}

export function useSendPhoto(connectionId: string) {
  const invalidate = useInvalidateChat(connectionId);
  return useMutation({
    mutationFn: (file: File) => chatApi.sendPhoto(connectionId, file),
    onSuccess: invalidate,
  });
}

export function useMarkRead(connectionId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => chatApi.markRead(connectionId as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
  });
}

/** Debounced: llamar en cada cambio del input, dispara como mucho 1 request cada 2s. */
export function useTypingPing(connectionId: string | null) {
  const lastSentRef = useRef(0);
  return () => {
    if (!connectionId) return;
    const now = Date.now();
    if (now - lastSentRef.current < 2000) return;
    lastSentRef.current = now;
    chatApi.sendTyping(connectionId).catch(() => undefined);
  };
}
