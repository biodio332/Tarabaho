package com.example.mobile_tarabahoapp.AuthRepository

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mobile_tarabahoapp.api.RetrofitClient
import com.example.mobile_tarabahoapp.model.RegisterRequest
import com.example.mobile_tarabahoapp.model.User
import com.example.mobile_tarabahoapp.utils.TokenManager
import kotlinx.coroutines.launch

class SignUpViewModel : ViewModel() {
    val newUser = MutableLiveData<User>()
    val signUpError = MutableLiveData<String>()

    fun register(request: RegisterRequest) {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.register(request)
                if (response.isSuccessful) {
                    response.body()?.let {
                        TokenManager.saveUserId(it.id)
                        newUser.value = it
                    } ?: run {
                        signUpError.value = "Empty response from server"
                    }
                } else {
                    // read error body
                    val err = response.errorBody()?.string().orEmpty()
                    signUpError.value = when (response.code()) {
                        400 -> err.ifBlank { "Validation failed" }
                        else -> "Error ${response.code()}: $err"
                    }
                }
            } catch (e: Exception) {
                signUpError.value = "Network error: ${e.localizedMessage}"
            }
        }
    }
}
