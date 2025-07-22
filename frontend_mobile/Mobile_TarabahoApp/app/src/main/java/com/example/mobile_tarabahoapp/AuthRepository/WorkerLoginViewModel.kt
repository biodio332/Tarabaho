package com.example.mobile_tarabahoapp.AuthRepository

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.example.mobile_tarabahoapp.api.RetrofitClient
import com.example.mobile_tarabahoapp.model.AuthResponse
import com.example.mobile_tarabahoapp.model.LoginRequest
import com.example.mobile_tarabahoapp.utils.TokenManager
import kotlinx.coroutines.launch

class WorkerLoginViewModel : ViewModel() {

    val loginResult = MutableLiveData<AuthResponse>()
    val loginError = MutableLiveData<String>()

    fun login(username: String, password: String, rememberMe: Boolean = false) {
        viewModelScope.launch {
            try {
                val loginRequest = LoginRequest(username, password)
                val response = RetrofitClient.apiService.loginWorker(loginRequest)

                if (response.isSuccessful) {
                    response.body()?.let { authResponse ->
                        TokenManager.saveToken(authResponse.token, rememberMe)
                        TokenManager.setUserType(true) // Explicitly set as worker
                        if (authResponse.workerId != null) {
                            TokenManager.saveWorkerId(authResponse.workerId)
                            loginResult.value = authResponse
                        } else {
                            loginError.value = "Login succeeded but worker ID is missing."
                        }
                    } ?: run {
                        loginError.value = "Empty response from server."
                    }
                } else {
                    val errorBody = response.errorBody()?.string()
                    val message = when (response.code()) {
                        401 -> "Invalid username or password"
                        else -> "Login failed: $errorBody"
                    }
                    loginError.value = message
                }
            } catch (e: Exception) {
                loginError.value = "An error occurred: ${e.localizedMessage}"
            }
        }
    }

    fun logout(navController: NavController) {
        TokenManager.clearAll() // Clear all auth data, including token, worker ID, and rememberMe
        navController.navigate("worker_signin") {
            popUpTo(0) { inclusive = true }
        }
    }
}