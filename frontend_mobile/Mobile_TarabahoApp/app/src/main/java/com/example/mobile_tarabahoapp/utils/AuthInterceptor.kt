package com.example.mobile_tarabahoapp.utils

import android.util.Log
import okhttp3.Interceptor
import okhttp3.Response


class AuthInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = TokenManager.getToken()

        if (token.isNullOrEmpty()) {
            Log.d("AuthInterceptor", "No token found, proceeding without auth header.")
            return chain.proceed(originalRequest)
        }

        Log.d("AuthInterceptor", "Attaching token: $token")

        val authenticatedRequest = originalRequest.newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()

        return chain.proceed(authenticatedRequest)
    }


}



