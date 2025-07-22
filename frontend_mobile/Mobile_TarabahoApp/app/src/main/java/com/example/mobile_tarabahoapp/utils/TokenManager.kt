package com.example.mobile_tarabahoapp.utils

import android.content.Context
import com.example.mobile_tarabahoapp.App

object TokenManager {
    private const val PREFS_NAME = "auth_prefs"
    private const val TOKEN_KEY = "jwt_token"
    private const val WORKER_ID_KEY = "worker_id"
    private const val USER_ID_KEY = "user_id"
    private const val USER_TYPE_KEY = "user_type"
    private const val USER_TYPE_WORKER = "worker"
    private const val USER_TYPE_CLIENT = "client"
    private const val REMEMBER_ME_KEY = "remember_me" // Added for Remember me

    fun saveToken(token: String, rememberMe: Boolean = false) {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putString(TOKEN_KEY, token)
            .putBoolean(REMEMBER_ME_KEY, rememberMe)
            .apply()
    }

    fun getToken(): String? {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(TOKEN_KEY, null)
    }

    fun clearToken() {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(TOKEN_KEY).apply()
    }

    fun saveWorkerId(id: Long) {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putLong(WORKER_ID_KEY, id).apply()
        // Also mark this user as a worker type
        prefs.edit().putString(USER_TYPE_KEY, USER_TYPE_WORKER).apply()
    }

    fun getWorkerId(): Long {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getLong(WORKER_ID_KEY, -1L)
    }

    fun saveUserId(id: Long) {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putLong(USER_ID_KEY, id).apply()
        // Mark this user as a client type if not already set as worker
        if (prefs.getString(USER_TYPE_KEY, "") != USER_TYPE_WORKER) {
            prefs.edit().putString(USER_TYPE_KEY, USER_TYPE_CLIENT).apply()
        }
    }

    fun getUserId(): Long {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getLong(USER_ID_KEY, -1L)
    }

    // This will return worker ID if the user is a worker, otherwise return user ID
    fun getCurrentUserId(): Long {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val userType = prefs.getString(USER_TYPE_KEY, USER_TYPE_CLIENT)
        return if (userType == USER_TYPE_WORKER) {
            getWorkerId()
        } else {
            getUserId()
        }
    }

    // Check if the current user is a worker
    fun isWorker(): Boolean {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(USER_TYPE_KEY, "") == USER_TYPE_WORKER
    }

    // Set user type directly
    fun setUserType(isWorker: Boolean) {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(USER_TYPE_KEY, if (isWorker) USER_TYPE_WORKER else USER_TYPE_CLIENT).apply()
    }

    // Check if "Remember me" is enabled
    fun isRememberMe(): Boolean {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getBoolean(REMEMBER_ME_KEY, false)
    }

    // Clear all auth data, including "Remember me"
    fun clearAll() {
        val prefs = App.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().clear().apply()
    }
}