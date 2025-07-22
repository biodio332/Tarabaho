package com.example.mobile_tarabahoapp.AuthRepository

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.MutableLiveData
import com.example.mobile_tarabahoapp.api.RetrofitClient
import com.example.mobile_tarabahoapp.model.ProfileUpdateRequest
import com.example.mobile_tarabahoapp.model.User
import kotlinx.coroutines.launch
import okhttp3.MultipartBody
import retrofit2.Response

class EditProfileViewModel : ViewModel() {

    val updateResult = MutableLiveData<User?>()
    val updateError = MutableLiveData<String>()
    val currentUser = MutableLiveData<User?>()
    val profilePictureUploadSuccess = MutableLiveData<Boolean>()

    fun updateProfile(request: ProfileUpdateRequest) {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.updateProfile(request)
                if (response.isSuccessful) {
                    updateResult.value = response.body()
                } else {
                    updateError.value = response.errorBody()?.string() ?: "Unknown error occurred"
                }
            } catch (e: Exception) {
                updateError.value = "Exception occurred: ${e.localizedMessage}"
            }
        }
    }

    fun loadCurrentUser() {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.getCurrentUser()
                if (response.isSuccessful) {
                    currentUser.value = response.body()
                } else {
                    updateError.value = "Failed to load user data"
                }
            } catch (e: Exception) {
                updateError.value = "Exception: ${e.localizedMessage}"
            }
        }
    }

    fun uploadProfilePicture(filePart: MultipartBody.Part) {
        viewModelScope.launch {
            try {
                Log.d("EditProfileViewModel", "Uploading profile picture, file: ${filePart.headers?.get("Content-Length")} bytes")
                val response = RetrofitClient.apiService.uploadProfilePicture(filePart)
                Log.d("EditProfileViewModel", "Upload response: ${response.code()} - ${response.message()}")
                if (response.isSuccessful) {
                    val user = response.body()
                    Log.d("EditProfileViewModel", "Profile picture upload successful: User=${user?.username}, new URL=${user?.profilePicture}")
                    currentUser.value = user
                    profilePictureUploadSuccess.value = true
                } else {
                    val error = response.errorBody()?.string() ?: "Unknown error"
                    Log.e("EditProfileViewModel", "Profile picture upload failed: ${response.code()} - $error")
                    profilePictureUploadSuccess.value = false
                }
            } catch (e: Exception) {
                Log.e("EditProfileViewModel", "Profile picture upload exception: ${e.localizedMessage}")
                profilePictureUploadSuccess.value = false
            }
        }
    }
}