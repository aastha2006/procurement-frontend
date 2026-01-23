export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RefreshTokenResponse {
    accesstoken: string;
    refreshtoken?: string;
}

interface AuthUser {
    accessToken: string;
    refreshToken?: string;
}

interface ApiRequestOptions extends RequestInit {
    skipAuth?: boolean;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getAccessToken(): string | null {
        const authUserRaw = localStorage.getItem("authUser");
        if (!authUserRaw) {
            console.warn("ApiClient: No authUser found in localStorage");
            return null;
        }

        try {
            const authUser: AuthUser = JSON.parse(authUserRaw);
            const token = authUser.accessToken || null;
            if (!token) console.warn("ApiClient: authUser exists but accessToken is missing");
            return token;
        } catch (e) {
            console.error("ApiClient: Failed to parse authUser from localStorage", e);
            return null;
        }
    }

    private async request(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<Response> {
        const { skipAuth, headers, ...rest } = options;

        const url =
            this.baseUrl + (endpoint.startsWith("/") ? endpoint : `/${endpoint}`);

        const requestHeaders = new Headers(headers);

        if (!skipAuth) {
            const token = this.getAccessToken();
            if (token) {
                // Log masked token for debugging
                console.log(`ApiClient: Adding Auth header to ${endpoint} with token ending in ...${token.slice(-6)}`);
                requestHeaders.set("Authorization", `Bearer ${token}`);
            } else {
                console.warn(`ApiClient: Requesting ${endpoint} but NO TOKEN found`);
            }
        } else {
            console.log(`ApiClient: Skipping auth for ${endpoint}`);
        }

        let response = await fetch(url, {
            ...rest,
            headers: requestHeaders,
        });

        // 🔁 Refresh token flow
        if (response.status === 401 && !skipAuth) {
            console.warn("ApiClient: Received 401, attempting refresh...");
            const authUserRaw = localStorage.getItem("authUser");
            if (authUserRaw) {
                const authUser: AuthUser = JSON.parse(authUserRaw);

                if (authUser.refreshToken) {
                    const refreshResponse = await fetch(
                        `${this.baseUrl}/api/auth/refresh-token`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                refreshtoken: authUser.refreshToken,
                            }),
                        }
                    );

                    if (refreshResponse.ok) {
                        const data: RefreshTokenResponse =
                            await refreshResponse.json();

                        // ✅ Update stored authUser
                        const updatedAuthUser = {
                            ...authUser,
                            accessToken: data.accesstoken,
                            refreshToken: data.refreshtoken ?? authUser.refreshToken,
                        };

                        localStorage.setItem(
                            "authUser",
                            JSON.stringify(updatedAuthUser)
                        );
                        console.log("ApiClient: Token refreshed successfully.");

                        // 🔁 Retry original request
                        requestHeaders.set(
                            "Authorization",
                            `Bearer ${data.accesstoken}`
                        );

                        response = await fetch(url, {
                            ...rest,
                            headers: requestHeaders,
                        });
                    } else {
                        console.error("ApiClient: Token refresh failed.");
                    }
                } else {
                    console.warn("ApiClient: No refresh token available.");
                }
            }
        }

        return response;
    }

    get(endpoint: string, options?: ApiRequestOptions) {
        return this.request(endpoint, { ...options, method: "GET" });
    }

    post(endpoint: string, body?: any, options?: ApiRequestOptions) {
        return this.request(endpoint, {
            ...options,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(options?.headers || {}),
            },
            body: JSON.stringify(body),
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
}

export const api = new ApiClient(API_BASE_URL);
