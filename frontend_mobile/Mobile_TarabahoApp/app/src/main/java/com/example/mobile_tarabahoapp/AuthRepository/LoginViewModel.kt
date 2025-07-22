package com.example.mobile_tarabahoapp.AuthRepository

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mobile_tarabahoapp.api.RetrofitClient
import com.example.mobile_tarabahoapp.model.AuthResponse
import com.example.mobile_tarabahoapp.model.LoginRequest
import com.example.mobile_tarabahoapp.utils.TokenManager
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {

    val loginResult = MutableLiveData<AuthResponse>()
    val loginError = MutableLiveData<String>()

    val logoutResult = MutableLiveData<String>()
    val logoutError = MutableLiveData<String>()

    fun login(username: String, password: String, rememberMe: Boolean = false) {
        viewModelScope.launch {
            try {
                val loginRequest = LoginRequest(username, password)
                val response = RetrofitClient.apiService.login(loginRequest)

                if (response.isSuccessful) {
                    response.body()?.let { authResponse ->
                        TokenManager.saveToken(authResponse.token, rememberMe)
                        TokenManager.setUserType(false) // Explicitly set as client
                        val userResponse = RetrofitClient.apiService.getCurrentUser()
                        if (userResponse.isSuccessful) {
                            userResponse.body()?.let { user ->
                                TokenManager.saveUserId(user.id)
                            }
                        }
                        loginResult.value = authResponse
                    } ?: run {
                        loginError.value = "Empty response from server."
                    }
                } else {
                    val errorString = response.errorBody()?.string()
                    val errorMessage = when (response.code()) {
                        404 -> "User not found. Please register before logging in."
                        401 -> "Invalid username or password."
                        else -> "Login failed: $errorString"
                    }
                    loginError.value = errorMessage
                }
            } catch (ex: Exception) {
                ex.printStackTrace()
                loginError.value = "An error occurred: ${ex.localizedMessage}"
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.logout()
                if (response.isSuccessful) {
                    TokenManager.clearAll()
                    logoutResult.value = response.body() ?: "Logged out successfully"
                } else {
                    logoutError.value = response.errorBody()?.string() ?: "Logout failed"
                }
            } catch (ex: Exception) {
                ex.printStackTrace()
                logoutError.value = "An error occurred: ${ex.localizedMessage}"
            }
        }
    }
}