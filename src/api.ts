export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RefreshTokenResponse {
    accesstoken: string;
    refreshtoken?: string;
}

export interface AuthUser {
    accessToken: string;
    refreshToken?: string;
    [key: string]: any; // Allow other properties
}

interface ApiRequestOptions extends RequestInit {
    skipAuth?: boolean;
}

type TokenChangeListener = (user: AuthUser | null) => void;

class ApiClient {
    private baseUrl: string;
    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];
    private tokenChangeListeners: TokenChangeListener[] = [];

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public subscribeToTokenChanges(listener: TokenChangeListener) {
        this.tokenChangeListeners.push(listener);
        return () => {
            this.tokenChangeListeners = this.tokenChangeListeners.filter(l => l !== listener);
        };
    }

    private notifyTokenChange(user: AuthUser | null) {
        this.tokenChangeListeners.forEach(listener => listener(user));
    }

    private getAccessToken(): string | null {
        const authUserRaw = localStorage.getItem("authUser");
        if (!authUserRaw) {
            return null;
        }
        try {
            const authUser: AuthUser = JSON.parse(authUserRaw);
            return authUser.accessToken || null;
        } catch (e) {
            console.error("ApiClient: Failed to parse authUser from localStorage", e);
            return null;
        }
    }

    private onRefreshed(token: string) {
        this.refreshSubscribers.forEach((cb) => cb(token));
        this.refreshSubscribers = [];
    }

    private addRefreshSubscriber(cb: (token: string) => void) {
        this.refreshSubscribers.push(cb);
    }

    private async request(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<Response> {
        const { skipAuth, headers, ...rest } = options;
        const url = this.baseUrl + (endpoint.startsWith("/") ? endpoint : `/${endpoint}`);
        const requestHeaders = new Headers(headers);

        if (!skipAuth) {
            const token = this.getAccessToken();
            if (token) {
                requestHeaders.set("Authorization", `Bearer ${token}`);
            }
        }

        let response = await fetch(url, {
            ...rest,
            headers: requestHeaders,
        });

        // 🔁 Refresh token flow
        if (response.status === 401 && !skipAuth) {
            if (this.isRefreshing) {
                // If already refreshing, wait for the new token
                return new Promise((resolve) => {
                    this.addRefreshSubscriber((newToken) => {
                        requestHeaders.set("Authorization", `Bearer ${newToken}`);
                        resolve(
                            fetch(url, {
                                ...rest,
                                headers: requestHeaders,
                            })
                        );
                    });
                });
            }

            this.isRefreshing = true;
            const authUserRaw = localStorage.getItem("authUser");

            if (authUserRaw) {
                const authUser: AuthUser = JSON.parse(authUserRaw);

                if (authUser.refreshToken) {
                    try {
                        const refreshResponse = await fetch(
                            `${this.baseUrl}/api/auth/refresh-token`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ refreshtoken: authUser.refreshToken }),
                            }
                        );

                        if (refreshResponse.ok) {
                            const data: RefreshTokenResponse = await refreshResponse.json();

                            // ✅ Update stored authUser
                            const updatedAuthUser = {
                                ...authUser,
                                accessToken: data.accesstoken,
                                refreshToken: data.refreshtoken ?? authUser.refreshToken,
                            };

                            localStorage.setItem("authUser", JSON.stringify(updatedAuthUser));
                            this.notifyTokenChange(updatedAuthUser); // Notify listeners

                            this.onRefreshed(data.accesstoken);

                            // 🔁 Retry original request
                            requestHeaders.set("Authorization", `Bearer ${data.accesstoken}`);
                            response = await fetch(url, {
                                ...rest,
                                headers: requestHeaders,
                            });
                        } else {
                            // Refresh failed - logout
                            this.handleLogout();
                        }
                    } catch (error) {
                        console.error("Token refresh error", error);
                        this.handleLogout();
                    } finally {
                        this.isRefreshing = false;
                    }
                } else {
                    this.handleLogout();
                    this.isRefreshing = false;
                }
            } else {
                this.isRefreshing = false;
            }
        }

        return response;
    }

    private handleLogout() {
        localStorage.removeItem("authUser");
        this.notifyTokenChange(null);
        // We let the app handle the redirect based on the null token
        this.onRefreshed(""); // Resolve waiting promises with empty token (will fail again but stop hanging)
    }

    get(endpoint: string, options?: ApiRequestOptions) {
        return this.request(endpoint, { ...options, method: "GET" });
    }

    post(endpoint: string, body?: any, options?: ApiRequestOptions) {
        const headers: HeadersInit = { ...(options?.headers || {}) };
        if (body !== undefined) {
            (headers as any)["Content-Type"] = "application/json";
        }
        return this.request(endpoint, {
            ...options,
            method: "POST",
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    }

    put(endpoint: string, body?: any, options?: ApiRequestOptions) {
        return this.request(endpoint, {
            ...options,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(options?.headers || {}),
            },
            body: JSON.stringify(body),
        });
    }

    delete(endpoint: string, options?: ApiRequestOptions) {
        return this.request(endpoint, { ...options, method: "DELETE" });
    }

    public async refreshToken(): Promise<boolean> {
        if (this.isRefreshing) return false;

        this.isRefreshing = true;
        const authUserRaw = localStorage.getItem("authUser");
        if (!authUserRaw) {
            this.isRefreshing = false;
            return false;
        }

        try {
            const authUser: AuthUser = JSON.parse(authUserRaw);
            if (!authUser.refreshToken) throw new Error("No refresh token");

            // Fix: remove duplicate /api if base url already has it
            const endpoint = "/auth/refresh-token";
            const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
            const finalUrl = baseUrl.endsWith('/api')
                ? `${baseUrl}${endpoint}` // baseUrl has /api, endpoint is /auth/... -> .../api/auth/...
                : `${baseUrl}/api${endpoint}`; // baseUrl has no /api -> .../api/auth/...

            // Actually, simpler: Just use the same logic as request(), or manually construct carefully.
            // Current production env is .../api. 
            // So we want .../api/auth/refresh-token

            // Let's just use the relative path "api/auth/refresh-token" but be careful about the base.
            // Best way: Use the request method's logic or a smart join.
            // But since api.ts is manual fetch here:

            const refreshUrl = this.baseUrl.endsWith('/api')
                ? `${this.baseUrl}/auth/refresh-token`
                : `${this.baseUrl}/api/auth/refresh-token`;

            const refreshResponse = await fetch(
                refreshUrl,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshtoken: authUser.refreshToken }),
                }
            );

            if (refreshResponse.ok) {
                const data: RefreshTokenResponse = await refreshResponse.json();
                const updatedAuthUser = {
                    ...authUser,
                    accessToken: data.accesstoken,
                    refreshToken: data.refreshtoken ?? authUser.refreshToken,
                };

                localStorage.setItem("authUser", JSON.stringify(updatedAuthUser));
                this.notifyTokenChange(updatedAuthUser);
                this.onRefreshed(data.accesstoken);
                return true;
            } else {
                this.handleLogout();
                return false;
            }
        } catch (error) {
            console.error("Manual refresh failed", error);
            this.handleLogout();
            return false;
        } finally {
            this.isRefreshing = false;
        }
    }
}

export const api = new ApiClient(API_BASE_URL);
