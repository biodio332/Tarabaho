package com.example.mobile_tarabahoapp.api

import com.example.mobile_tarabahoapp.utils.AuthInterceptor
import com.example.mobile_tarabahoapp.utils.TokenManager
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:8080/"

    private val gson = GsonBuilder()
        .setLenient() // Enable lenient JSON parsing to handle malformed responses
        .create()

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(AuthInterceptor()) // Keep your custom interceptor
        .build()

    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient) // Applies AuthInterceptor to all requests
            .addConverterFactory(GsonConverterFactory.create(gson)) // Use lenient Gson
            .build()
    }

    val apiService: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }
}