import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as discoverApi from '../lib/api/discover';
import type { DiscoveryFilters } from '../types';

export function useDiscover(filters: DiscoveryFilters) {
  return useQuery({
    queryKey: ['discover', filters.onlyVerifiedMembers, filters.selectedInterests],
    queryFn: () =>
      discoverApi.listDiscover({
        limit: 15,
        onlyVerified: filters.onlyVerifiedMembers,
        interests: filters.selectedInterests,
      }),
    select: (data) => ({
      // El endpoint /discover ya devuelve la cuota diaria junto con los perfiles en la
      // misma respuesta — antes se descartaba acá y la UI nunca mostraba el límite.
      quota: data.quota,
      // minAge/maxAge/withAudioBioOnly no tienen query param en el backend (son preferencia
      // del viewer, no del request) — se refinan acá sobre la página ya traída del server.
      profiles: data.profiles.filter((p) => {
        if (p.age < filters.minAge || p.age > filters.maxAge) return false;
        if (filters.withAudioBioOnly && !p.audioBio) return false;
        return true;
      }),
    }),
  });
}

// "Persona del día": una selección editorial diaria, separada del mazo normal de
// /discover — el backend ya la expone en /discover/person-of-the-day pero nada en la
// UI la pedía ni la mostraba todavía.
export function usePersonOfTheDay() {
  return useQuery({
    queryKey: ['personOfTheDay'],
    queryFn: discoverApi.getPersonOfTheDay,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSwipe() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['discover'] });
    queryClient.invalidateQueries({ queryKey: ['matches'] });
    queryClient.invalidateQueries({ queryKey: ['discoverQuota'] });
    queryClient.invalidateQueries({ queryKey: ['whoLikedMe'] });
  };

  const like = useMutation({ mutationFn: discoverApi.like, onSuccess: invalidate });
  const pass = useMutation({ mutationFn: discoverApi.pass, onSuccess: invalidate });
  const superLike = useMutation({ mutationFn: discoverApi.superLike, onSuccess: invalidate });

  return { like, pass, superLike };
}

export function useDiscoverQuota() {
  return useQuery({ queryKey: ['discoverQuota'], queryFn: discoverApi.getDiscoverQuota });
}

export function useWhoLikedMe() {
  return useQuery({ queryKey: ['whoLikedMe'], queryFn: discoverApi.getWhoLikedMe });
}
