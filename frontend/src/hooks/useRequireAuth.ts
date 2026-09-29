"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from '@/lib/api';

type User = { role: string };

export function useRequireAuth(requiredRoles?: string | string[]) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const allowedRolesKey = requiredRoles
    ? (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]).join("|")
    : "";

  useEffect(() => {
    let isMounted = true;
    const token = Cookies.get("access_token");

    if (!token && !Cookies.get('refresh_token')) {
      router.replace("/login");
      return;
    }

    const allowedRoles = allowedRolesKey ? allowedRolesKey.split("|") : null;

    api.get<User>('/auth/me/').then(({ data }) => {
      if (!isMounted) return;
      if (allowedRoles && !allowedRoles.includes(data.role)) {
        router.replace('/');
        return;
      }
      Cookies.set('user_role', data.role, { expires: 1, sameSite: 'lax', secure: window.location.protocol === 'https:' });
      window.dispatchEvent(new Event('auth-change'));
      setUser(data);
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) router.replace('/login');
    });

    return () => {
      isMounted = false;
    };
  }, [allowedRolesKey, router]);

  return { user, isLoading };
}
